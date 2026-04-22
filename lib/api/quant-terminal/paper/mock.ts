// 📁 lib/api/quant-terminal/paper/mock.ts
// ─── Paper Trading Mock ───────────────────────────────────────────────────────
// 与 backtest/mock.ts 结构对齐：
//   - 内存会话缓存（模拟后端 session 管理）
//   - getOrCreateSession：首次创建 + 后续复用
//   - 支持 status / result / snapshot / stream 四个端点的数据生成

import type {
  Side,
  Signal,
  TradeRecord,
  PaperMetricsData,
  PaperStatus,
  PaperStatusResponse,
  PaperResultResponse,
  PaperSnapshotResponse,
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperStreamEvent,
  PaperSnapshot,
} from "./types";

// ── 配置 ──────────────────────────────────────────────────────────────────────

const BASE_PRICE = 84231;
const PRICE_SCALE = 80;
const MIN_SIGNAL_GAP = 8;

// ── Session 状态 ──────────────────────────────────────────────────────────────

export interface PaperSessionState {
  strategyId: string;
  status: PaperStatus;
  startedAt: number;
  endsAt: number;
  planDays: number;
  equity: number;
  equityHistory: number[];
  signals: Signal[];
  trades: TradeRecord[];
  openPosition: boolean;
  openBuyPrice: number;
  wins: number;
  losses: number;
  lastSignalIdx: number;
}

// ── 内存缓存 ──────────────────────────────────────────────────────────────────

const sessionCache = new Map<string, PaperSessionState>();

interface SnapshotEntry {
  result: PaperResultResponse;
  cachedAt: number;
}
const snapshotCache = new Map<string, SnapshotEntry>();

function sessionKey(strategyId: string): string {
  return strategyId;
}

// ── Session 创建 ──────────────────────────────────────────────────────────────

function buildDateRange(startedAt: number, endsAt: number): string {
  const fmt = (ms: number) => {
    const d = new Date(ms);
    return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  return `${fmt(startedAt)} → ${fmt(endsAt)}`;
}

export function createPaperSession(
  strategyId: string,
  planDays = 14,
): PaperSessionState {
  const now = Date.now();
  const pts: number[] = [];
  const signals: Signal[] = [];
  const trades: TradeRecord[] = [];
  let v = 0;
  let wins = 0;
  let losses = 0;

  // 预填 40 个 tick + 2 组买卖信号对
  for (let i = 0; i < 40; i++) {
    v += (Math.random() - 0.45) * 1.0 + 0.12;
    pts.push(parseFloat(v.toFixed(3)));
  }

  const seedPairs: [number, number][] = [
    [6, 16],
    [22, 32],
  ];
  for (const [bi, si] of seedPairs) {
    const buyPrice = Math.round(BASE_PRICE + pts[bi] * PRICE_SCALE);
    const sellPrice = Math.round(BASE_PRICE + pts[si] * PRICE_SCALE);
    const pnlPct = parseFloat(
      (((sellPrice - buyPrice) / buyPrice) * 100).toFixed(2),
    );
    const pnlStr = `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`;
    const trigger = pnlPct > 0 ? "止盈 tp=6%" : "止损 sl=2%";

    signals.push({
      i: bi,
      type: "buy",
      price: buyPrice,
      ts: now - (40 - bi) * 300,
      trigger: "EMA金叉",
    });
    signals.push({
      i: si,
      type: "sell",
      price: sellPrice,
      ts: now - (40 - si) * 300,
      pnl: pnlStr,
      trigger,
    });
    trades.push({
      ts: now - (40 - bi) * 300,
      side: "buy",
      price: buyPrice,
      qty: 0.012,
      trigger: "EMA金叉",
    });
    trades.push({
      ts: now - (40 - si) * 300,
      side: "sell",
      price: sellPrice,
      qty: 0.012,
      pnlPct,
      trigger,
    });
    if (pnlPct > 0) wins++;
    else losses++;
  }

  return {
    strategyId,
    status: "running",
    startedAt: now,
    endsAt: now + planDays * 86_400_000,
    planDays,
    equity: v,
    equityHistory: pts,
    signals,
    trades,
    openPosition: false,
    openBuyPrice: 0,
    wins,
    losses,
    lastSignalIdx: 32,
  };
}

export function getOrCreateSession(
  strategyId: string,
  planDays = 14,
): PaperSessionState {
  if (!sessionCache.has(sessionKey(strategyId))) {
    sessionCache.set(
      sessionKey(strategyId),
      createPaperSession(strategyId, planDays),
    );
  }
  return sessionCache.get(sessionKey(strategyId))!;
}

export function updateSession(
  strategyId: string,
  state: PaperSessionState,
): void {
  sessionCache.set(sessionKey(strategyId), state);
}

// ── Tick 生成 ──────────────────────────────────────────────────────────────────

export function nextPaperTick(state: PaperSessionState): {
  tick: PaperTick;
  signal?: PaperSignal;
  updatedState: PaperSessionState;
} {
  const move = (Math.random() - 0.45) * 1.0 + 0.12;
  const newEquity = parseFloat((state.equity + move).toFixed(3));
  const newPrice = Math.round(BASE_PRICE + newEquity * PRICE_SCALE);
  const newHistory = [...state.equityHistory, newEquity];
  const idx = newHistory.length - 1;

  const updatedState: PaperSessionState = {
    ...state,
    equity: newEquity,
    equityHistory: newHistory,
  };
  const tick: PaperTick = {
    type: "tick",
    ts: Date.now(),
    price: newPrice,
    equity: newEquity,
  };

  let signal: PaperSignal | undefined;
  const canSignal = idx - state.lastSignalIdx >= MIN_SIGNAL_GAP;

  if (canSignal && newHistory.length > 5) {
    const delta = newHistory[idx] - newHistory[idx - 4];

    if (delta > 0.7 && !state.openPosition) {
      signal = {
        type: "signal",
        ts: Date.now(),
        side: "buy",
        price: newPrice,
        qty: 0.012,
        trigger: "EMA金叉 + 成交量放大",
      };
      const sig: Signal = {
        i: idx,
        type: "buy",
        price: newPrice,
        ts: Date.now(),
        trigger: "EMA金叉 + 成交量放大",
      };
      updatedState.openPosition = true;
      updatedState.openBuyPrice = newPrice;
      updatedState.lastSignalIdx = idx;
      updatedState.signals = [...updatedState.signals, sig];
      updatedState.trades = [
        ...updatedState.trades,
        {
          ts: Date.now(),
          side: "buy",
          price: newPrice,
          qty: 0.012,
          trigger: "EMA金叉 + 成交量放大",
        },
      ];
    } else if (delta < -0.5 && state.openPosition) {
      const pnlPct = parseFloat(
        (((newPrice - state.openBuyPrice) / state.openBuyPrice) * 100).toFixed(
          2,
        ),
      );
      const pnlStr = `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`;
      const trigger = pnlPct > 0 ? "止盈 tp=6%" : "止损 sl=2%";
      signal = {
        type: "signal",
        ts: Date.now(),
        side: "sell",
        price: newPrice,
        qty: 0.012,
        pnlPct,
        trigger,
      };
      const sig: Signal = {
        i: idx,
        type: "sell",
        price: newPrice,
        ts: Date.now(),
        pnl: pnlStr,
        trigger,
      };
      updatedState.openPosition = false;
      updatedState.openBuyPrice = 0;
      updatedState.lastSignalIdx = idx;
      updatedState.signals = [...updatedState.signals, sig];
      updatedState.trades = [
        ...updatedState.trades,
        {
          ts: Date.now(),
          side: "sell",
          price: newPrice,
          qty: 0.012,
          pnlPct,
          trigger,
        },
      ];
      if (pnlPct > 0) updatedState.wins++;
      else updatedState.losses++;
    }
  }

  return { tick, signal, updatedState };
}

// ── 各端点数据构建 ─────────────────────────────────────────────────────────────

export function buildPaperStatus(
  state: PaperSessionState,
): PaperStatusResponse {
  const now = Date.now();
  const elapsed = Math.max(0, now - state.startedAt);
  const total = state.endsAt - state.startedAt;
  const progressPct =
    total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 0;
  const remaining = Math.max(0, state.endsAt - now);

  const statusMsg: Record<PaperStatus, string> = {
    pending: "等待启动",
    running: `运行中 · 剩余 ${Math.ceil(remaining / 86_400_000)} 天`,
    paused: "已暂停，持仓保留",
    done: "模拟完成",
  };

  return {
    strategyId: state.strategyId,
    status: state.status,
    progressPct,
    message: statusMsg[state.status],
    startedAt: state.startedAt,
    endsAt: state.endsAt,
    planDays: state.planDays,
    elapsedMs: elapsed,
    remainingMs: remaining,
  };
}

export function buildPaperResult(
  state: PaperSessionState,
): PaperResultResponse {
  const total = state.wins + state.losses;
  const eq = state.equity;
  const metrics: PaperMetricsData = {
    equityPct: parseFloat((eq * 0.4).toFixed(2)),
    maxDrawdownPct: parseFloat(Math.abs(Math.min(0, eq) * 0.3).toFixed(1)),
    winRate: total > 0 ? Math.round((state.wins / total) * 100) : 0,
    tradeCount: total,
    slippage: 0.07,
    sharpe: parseFloat(Math.max(0, 1.2 + eq * 0.02).toFixed(2)),
  };

  const result: PaperResultResponse = {
    strategyId: state.strategyId,
    status: state.status,
    startedAt: state.startedAt,
    completedAt: state.status === "done" ? Date.now() : 0,
    planDays: state.planDays,
    equityHistory: state.equityHistory,
    signals: state.signals,
    metrics,
    trades: [...state.trades].reverse().slice(0, 20),
    dateRange: buildDateRange(state.startedAt, state.endsAt),
    basePrice: BASE_PRICE,
    priceScale: PRICE_SCALE,
  };

  // 完成时自动写入 snapshot 缓存
  if (state.status === "done") {
    snapshotCache.set(state.strategyId, { result, cachedAt: Date.now() });
  }

  return result;
}

export function getMockPaperSnapshot(
  strategyId: string,
): PaperSnapshotResponse {
  const entry = snapshotCache.get(strategyId);
  if (!entry) return { found: false };
  return { found: true, cachedAt: entry.cachedAt, result: entry.result };
}

// ── Legacy snapshot (backward compat) ─────────────────────────────────────────

export function buildPaperSnapshot(state: PaperSessionState): PaperSnapshot {
  const total = state.wins + state.losses;
  const eq = state.equity;
  const metrics: PaperMetrics = {
    type: "metrics",
    ts: Date.now(),
    equityPct: parseFloat((eq * 0.4).toFixed(2)),
    maxDrawdownPct: parseFloat(Math.abs(Math.min(0, eq) * 0.3).toFixed(1)),
    winRate: total > 0 ? Math.round((state.wins / total) * 100) : 0,
    tradeCount: total,
    slippage: 0.07,
    sharpe: parseFloat(Math.max(0, 1.2 + eq * 0.02).toFixed(2)),
  };
  return {
    strategyId: state.strategyId,
    status: state.status as any,
    startedAt: state.startedAt,
    endsAt: state.endsAt,
    planDays: state.planDays,
    equityHistory: state.equityHistory,
    signals: state.signals,
    metrics,
    recentTrades: [...state.trades].reverse().slice(0, 20),
  };
}

export function buildPaperMetricsEvent(state: PaperSessionState): PaperMetrics {
  const total = state.wins + state.losses;
  const eq = state.equity;
  return {
    type: "metrics",
    ts: Date.now(),
    equityPct: parseFloat((eq * 0.4).toFixed(2)),
    maxDrawdownPct: parseFloat(Math.abs(Math.min(0, eq) * 0.3).toFixed(1)),
    winRate: total > 0 ? Math.round((state.wins / total) * 100) : 0,
    tradeCount: total,
    slippage: 0.07,
    sharpe: parseFloat(Math.max(0, 1.2 + eq * 0.02).toFixed(2)),
  };
}

export function buildPaperHeartbeat(state: PaperSessionState): PaperHeartbeat {
  return {
    type: "heartbeat",
    ts: Date.now(),
    strategyId: state.strategyId,
    status: state.status as any,
    planDays: state.planDays,
    startedAt: state.startedAt,
    endsAt: state.endsAt,
  };
}

export function toSSE(event: PaperStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
