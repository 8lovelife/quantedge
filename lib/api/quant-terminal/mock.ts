// ─── Mock data generators ─────────────────────────────────────────────────────
// All randomness lives here. When real data arrives, delete this file and
// point client.ts at the real WebSocket / SSE endpoint.

import type {
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperSnapshot,
  PaperStreamEvent,
} from "./types";

// ── Price simulation state (server-side, per strategy session) ─────────────────

export interface MockSessionState {
  strategyId: string;
  status: "running" | "paused" | "done";
  startedAt: number;
  basePrice: number; // BTC base price
  equity: number; // current equity index
  equityHistory: number[];
  signals: Array<{ i: number; type: "buy" | "sell" }>;
  openPosition: boolean;
  tradeCount: number;
  wins: number;
  losses: number;
  maxEquity: number;
  minEquity: number;
  lastSignalIdx: number;
}

export function createMockSession(strategyId: string): MockSessionState {
  return {
    strategyId,
    status: "running",
    startedAt: Date.now(),
    basePrice: 84231,
    equity: 0,
    equityHistory: [],
    signals: [],
    openPosition: false,
    tradeCount: 0,
    wins: 0,
    losses: 0,
    maxEquity: 0,
    minEquity: 0,
    lastSignalIdx: -10,
  };
}

// ── Tick generator ─────────────────────────────────────────────────────────────

export function nextTick(state: MockSessionState): {
  tick: PaperTick;
  signal?: PaperSignal;
  updatedState: MockSessionState;
} {
  // Random walk with slight upward drift
  const move = (Math.random() - 0.46) * 1.4 + 0.15;
  const newEquity = state.equity + move;
  const newPrice = Math.round(state.basePrice + newEquity * 80);

  const newHistory = [...state.equityHistory, newEquity];
  if (newHistory.length > 200) newHistory.shift();

  const updatedState: MockSessionState = {
    ...state,
    equity: newEquity,
    basePrice: newPrice,
    equityHistory: newHistory,
    maxEquity: Math.max(state.maxEquity, newEquity),
    minEquity: Math.min(state.minEquity, newEquity),
  };

  const tick: PaperTick = {
    type: "tick",
    ts: Date.now(),
    price: newPrice,
    equity: newEquity,
  };

  // Signal detection — EMA crossover proxy
  let signal: PaperSignal | undefined;
  const idx = newHistory.length - 1;
  const canSignal = idx - state.lastSignalIdx >= 6; // min gap between signals

  if (canSignal && newHistory.length > 5) {
    const delta = newHistory[idx] - newHistory[idx - 4];

    if (delta > 1.8 && !state.openPosition) {
      signal = {
        type: "signal",
        ts: Date.now(),
        side: "buy",
        price: newPrice,
        qty: 0.012,
        trigger: "EMA金叉 + 成交量放大",
      };
      updatedState.openPosition = true;
      updatedState.lastSignalIdx = idx;
      updatedState.signals = [...updatedState.signals, { i: idx, type: "buy" }];
    } else if (delta < -1.3 && state.openPosition) {
      const pnlPct = parseFloat((move * 1.2).toFixed(2));
      const isWin = pnlPct > 0;
      signal = {
        type: "signal",
        ts: Date.now(),
        side: "sell",
        price: newPrice,
        qty: 0.012,
        pnlPct,
        trigger: isWin ? "止盈 tp=6%" : "止损 sl=2%",
      };
      updatedState.openPosition = false;
      updatedState.tradeCount += 1;
      updatedState.lastSignalIdx = idx;
      if (isWin) updatedState.wins += 1;
      else updatedState.losses += 1;
      updatedState.signals = [
        ...updatedState.signals,
        { i: idx, type: "sell" },
      ];
    }
  }

  return { tick, signal, updatedState };
}

// ── Metrics snapshot ───────────────────────────────────────────────────────────

export function buildMetrics(state: MockSessionState): PaperMetrics {
  const total = state.wins + state.losses;
  const winRate = total > 0 ? Math.round((state.wins / total) * 100) : 0;
  const maxDrawdown =
    state.maxEquity > 0
      ? parseFloat(
          (
            ((state.maxEquity - state.minEquity) / state.maxEquity) *
            100
          ).toFixed(1),
        )
      : 0;
  const sharpe = parseFloat((1.2 + state.equity * 0.02).toFixed(2));

  return {
    type: "metrics",
    ts: Date.now(),
    equityPct: parseFloat((state.equity * 0.4).toFixed(2)),
    maxDrawdownPct: maxDrawdown,
    winRate,
    tradeCount: state.tradeCount,
    slippage: 0.07,
    sharpe: Math.max(0, sharpe),
  };
}

// ── Heartbeat ─────────────────────────────────────────────────────────────────

export function buildHeartbeat(state: MockSessionState): PaperHeartbeat {
  return {
    type: "heartbeat",
    ts: Date.now(),
    strategyId: state.strategyId,
    status: state.status,
  };
}

// ── Initial snapshot (REST) ────────────────────────────────────────────────────

export function buildSnapshot(state: MockSessionState): PaperSnapshot {
  const metrics = buildMetrics(state);
  // Build recent trades from signals
  const recentTrades = state.signals
    .filter((s) => s.type === "sell")
    .slice(-10)
    .map((s) => ({
      ts: state.startedAt + s.i * 300,
      side: "sell" as const,
      price: Math.round(state.basePrice + state.equityHistory[s.i] * 80),
      qty: 0.012,
      pnlPct: parseFloat((Math.random() * 8 - 2).toFixed(2)),
      trigger: "止盈 tp=6%",
    }));

  return {
    strategyId: state.strategyId,
    status: state.status,
    startedAt: state.startedAt,
    equityHistory: state.equityHistory,
    signals: state.signals,
    metrics,
    recentTrades,
  };
}

// ── SSE formatter ──────────────────────────────────────────────────────────────
// Formats any event as SSE text for the route handler

export function toSSE(event: PaperStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
