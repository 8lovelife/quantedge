// 📁 lib/api/quant-terminal/live/mock.ts
// ─── Live Trading Mock ────────────────────────────────────────────────────────
// 与 paper/mock.ts 结构对齐：session 缓存 + status/result/snapshot/stream

import type {
  Side,
  Signal,
  TradeRecord,
  LiveMetricsData,
  LiveResultResponse,
  LiveSnapshotResponse,
  LiveStatusResponse,
  LiveTick,
  LiveSignalEvent,
  LiveOrder,
  LiveMetrics,
  LiveHeartbeat,
  LiveAlert,
  LiveStreamEvent,
  LiveSnapshot,
} from "./types";

// ── 配置 ──────────────────────────────────────────────────────────────────────

const BASE_PRICE = 84231;
const PRICE_SCALE = 80;
const MIN_SIGNAL_GAP = 10;
const EXCHANGE = "Binance (Mock)";

// ── Session 状态 ──────────────────────────────────────────────────────────────

export interface LiveSessionState {
  strategyId: string;
  status: "running" | "paused" | "stopped" | "done";
  exchange: string;
  startedAt: number;
  equity: number;
  pts: number[];
  signals: Signal[];
  trades: TradeRecord[];
  openPosition: boolean;
  openBuyPrice: number;
  openQty: number;
  wins: number;
  losses: number;
  lastSignalIdx: number;
}

// ── 内存缓存 ──────────────────────────────────────────────────────────────────

const sessionCache = new Map<string, LiveSessionState>();
const snapshotCache = new Map<
  string,
  { result: LiveResultResponse; cachedAt: number }
>();

export function getOrCreateLiveSession(strategyId: string): LiveSessionState {
  if (!sessionCache.has(strategyId)) {
    sessionCache.set(strategyId, createLiveSession(strategyId));
  }
  return sessionCache.get(strategyId)!;
}

export function updateLiveSession(
  strategyId: string,
  state: LiveSessionState,
): void {
  sessionCache.set(strategyId, state);
}

// ── Session 创建（预埋 3 组信号对） ────────────────────────────────────────────

function createLiveSession(strategyId: string): LiveSessionState {
  const now = Date.now();
  const pts: number[] = [];
  const signals: Signal[] = [];
  const trades: TradeRecord[] = [];
  let v = 0;
  let wins = 0;
  let losses = 0;

  for (let i = 0; i < 60; i++) {
    v += (Math.random() - 0.44) * 1.4 + 0.2;
    pts.push(parseFloat(v.toFixed(3)));
  }

  for (const [bi, si] of [
    [8, 20],
    [28, 38],
    [46, 56],
  ] as [number, number][]) {
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
      ts: now - (60 - bi) * 300,
      trigger: "EMA上穿",
    });
    signals.push({
      i: si,
      type: "sell",
      price: sellPrice,
      ts: now - (60 - si) * 300,
      pnl: pnlStr,
      trigger,
    });
    trades.push({
      ts: now - (60 - bi) * 300,
      side: "buy",
      price: buyPrice,
      qty: 0.012,
      trigger: "EMA上穿",
    });
    trades.push({
      ts: now - (60 - si) * 300,
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
    exchange: EXCHANGE,
    startedAt: now,
    equity: v,
    pts,
    signals,
    trades,
    openPosition: false,
    openBuyPrice: 0,
    openQty: 0,
    wins,
    losses,
    lastSignalIdx: 56,
  };
}

// ── 指标计算 ──────────────────────────────────────────────────────────────────

function calcMetrics(state: LiveSessionState): LiveMetricsData {
  const total = state.wins + state.losses;
  const realizedPnl = state.trades
    .filter((t) => t.side === "sell" && t.pnlPct != null)
    .reduce((sum, t) => sum + (t.pnlPct ?? 0), 0);
  const equityPct =
    total > 0
      ? parseFloat(realizedPnl.toFixed(2))
      : parseFloat((state.equity * 0.4).toFixed(2));

  let maxDD = 0;
  let peak = state.pts[0] ?? 0;
  for (const v of state.pts) {
    if (v > peak) peak = v;
    const dd = peak > 0 ? ((peak - v) / Math.abs(peak)) * 100 : 0;
    if (dd > maxDD) maxDD = dd;
  }

  const curPrice = Math.round(BASE_PRICE + state.equity * PRICE_SCALE);
  const unrealizedPnlPct =
    state.openPosition && state.openBuyPrice > 0
      ? parseFloat(
          (
            ((curPrice - state.openBuyPrice) / state.openBuyPrice) *
            100
          ).toFixed(2),
        )
      : 0;

  return {
    equityPct,
    maxDrawdownPct: parseFloat(maxDD.toFixed(1)),
    winRate: total > 0 ? Math.round((state.wins / total) * 100) : 0,
    tradeCount: total,
    slippage: 0.07,
    sharpe: parseFloat(Math.max(0, 1.2 + equityPct * 0.02).toFixed(2)),
    unrealizedPnlPct,
    holdingQty: state.openPosition ? state.openQty : 0,
    holdingCost: state.openPosition ? state.openBuyPrice : 0,
  };
}

// ── Tick 生成 ──────────────────────────────────────────────────────────────────

export function nextLiveTick(state: LiveSessionState): {
  events: LiveStreamEvent[];
  updatedState: LiveSessionState;
} {
  const move = (Math.random() - 0.44) * 1.4 + 0.2;
  const newEquity = parseFloat((state.equity + move).toFixed(3));
  const spread = parseFloat((0.5 + Math.random() * 1.5).toFixed(2));
  const midPrice = Math.round(BASE_PRICE + newEquity * PRICE_SCALE);

  const newPts = [...state.pts, newEquity];
  const newSignals = [...state.signals];
  if (newPts.length > 120) {
    newPts.shift();
    for (let j = newSignals.length - 1; j >= 0; j--) {
      newSignals[j] = { ...newSignals[j], i: newSignals[j].i - 1 };
      if (newSignals[j].i < 0) newSignals.splice(j, 1);
    }
  }

  const updatedState: LiveSessionState = {
    ...state,
    equity: newEquity,
    pts: newPts,
    signals: newSignals,
  };
  const events: LiveStreamEvent[] = [];
  events.push({
    type: "tick",
    ts: Date.now(),
    price: midPrice,
    equity: newEquity,
    bid: midPrice - spread / 2,
    ask: midPrice + spread / 2,
    spread,
  } as LiveTick);

  const idx = newPts.length - 1;
  if (idx - state.lastSignalIdx >= MIN_SIGNAL_GAP && newPts.length > 5) {
    const delta = newPts[idx] - newPts[Math.max(0, idx - 4)];

    if (delta > 0.8 && !state.openPosition) {
      const fillPrice = Math.round(midPrice + spread / 2 + Math.random() * 2);
      events.push({
        type: "signal",
        ts: Date.now(),
        side: "buy",
        price: fillPrice,
        qty: 0.012,
        trigger: "EMA上穿",
      } as LiveSignalEvent);
      events.push({
        type: "order",
        ts: Date.now() + 50,
        orderId: `ORD_${Date.now()}`,
        side: "buy",
        status: "filled",
        price: fillPrice,
        qty: 0.012,
        slippage: parseFloat((fillPrice - midPrice).toFixed(2)),
      } as LiveOrder);
      updatedState.openPosition = true;
      updatedState.openBuyPrice = fillPrice;
      updatedState.openQty = 0.012;
      updatedState.lastSignalIdx = idx;
      updatedState.signals = [
        ...newSignals,
        {
          i: idx,
          type: "buy",
          price: fillPrice,
          ts: Date.now(),
          trigger: "EMA上穿",
        },
      ];
      updatedState.trades = [
        ...state.trades,
        {
          ts: Date.now(),
          side: "buy",
          price: fillPrice,
          qty: 0.012,
          trigger: "EMA上穿",
        },
      ];
    } else if (delta < -0.6 && state.openPosition) {
      const fillPrice = Math.round(midPrice - spread / 2 - Math.random() * 2);
      const pnlPct = parseFloat(
        (((fillPrice - state.openBuyPrice) / state.openBuyPrice) * 100).toFixed(
          2,
        ),
      );
      const pnlStr = `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`;
      const trigger = pnlPct > 0 ? "止盈 tp=6%" : "止损 sl=2%";
      events.push({
        type: "signal",
        ts: Date.now(),
        side: "sell",
        price: fillPrice,
        qty: 0.012,
        pnlPct,
        pnl: pnlStr,
        trigger,
      } as LiveSignalEvent);
      events.push({
        type: "order",
        ts: Date.now() + 50,
        orderId: `ORD_${Date.now()}`,
        side: "sell",
        status: "filled",
        price: fillPrice,
        qty: 0.012,
        slippage: parseFloat((midPrice - fillPrice).toFixed(2)),
      } as LiveOrder);
      if (pnlPct < -1.5)
        events.push({
          type: "alert",
          ts: Date.now(),
          level: "warn",
          code: "STOP_LOSS_HIT",
          message: `止损触发 · 亏损 ${pnlStr}`,
        } as LiveAlert);
      updatedState.openPosition = false;
      updatedState.openBuyPrice = 0;
      updatedState.openQty = 0;
      updatedState.lastSignalIdx = idx;
      updatedState.signals = [
        ...newSignals,
        {
          i: idx,
          type: "sell",
          price: fillPrice,
          ts: Date.now(),
          pnl: pnlStr,
          trigger,
        },
      ];
      updatedState.trades = [
        ...state.trades,
        {
          ts: Date.now(),
          side: "sell",
          price: fillPrice,
          qty: 0.012,
          pnlPct,
          trigger,
        },
      ];
      if (pnlPct > 0) updatedState.wins++;
      else updatedState.losses++;
    }
  }

  return { events, updatedState };
}

// ── 各端点数据构建 ─────────────────────────────────────────────────────────────

export function buildLiveStatus(state: LiveSessionState): LiveStatusResponse {
  const msgs: Record<string, string> = {
    running: "实盘运行中",
    paused: "已暂停，持仓保留",
    stopped: "已终止，持仓已平仓",
    done: "已归档",
  };
  const m = calcMetrics(state);
  return {
    strategyId: state.strategyId,
    status: state.status as any,
    message: msgs[state.status] ?? state.status,
    startedAt: state.startedAt,
    exchange: state.exchange,
    elapsedMs: Date.now() - state.startedAt,
    openPosition: {
      active: state.openPosition,
      qty: state.openQty,
      costBasis: state.openBuyPrice,
      unrealizedPnlPct: m.unrealizedPnlPct,
    },
  };
}

export function buildLiveResult(state: LiveSessionState): LiveResultResponse {
  const metrics = calcMetrics(state);
  const result: LiveResultResponse = {
    strategyId: state.strategyId,
    status: state.status as any,
    exchange: state.exchange,
    startedAt: state.startedAt,
    completedAt:
      state.status === "stopped" || state.status === "done" ? Date.now() : 0,
    pts: state.pts,
    signals: state.signals,
    trades: [...state.trades].reverse().slice(0, 20),
    metrics,
    openPosition: {
      active: state.openPosition,
      qty: state.openQty,
      costBasis: state.openBuyPrice,
      unrealizedPnlPct: metrics.unrealizedPnlPct,
    },
    basePrice: BASE_PRICE,
    priceScale: PRICE_SCALE,
  };
  if (state.status === "stopped" || state.status === "done") {
    snapshotCache.set(state.strategyId, { result, cachedAt: Date.now() });
  }
  return result;
}

export function getMockLiveSnapshot(strategyId: string): LiveSnapshotResponse {
  const entry = snapshotCache.get(strategyId);
  return entry
    ? { found: true, cachedAt: entry.cachedAt, result: entry.result }
    : { found: false };
}

export function buildLiveMetricsEvent(state: LiveSessionState): LiveMetrics {
  return { type: "metrics", ts: Date.now(), ...calcMetrics(state) };
}

export function buildLiveHeartbeat(state: LiveSessionState): LiveHeartbeat {
  return {
    type: "heartbeat",
    ts: Date.now(),
    strategyId: state.strategyId,
    status: state.status as any,
    exchange: state.exchange,
    latencyMs: Math.round(20 + Math.random() * 30),
  };
}

export function buildLiveSnapshot(state: LiveSessionState): LiveSnapshot {
  const m = buildLiveMetricsEvent(state);
  return {
    strategyId: state.strategyId,
    status: state.status as any,
    exchange: state.exchange,
    startedAt: state.startedAt,
    pts: state.pts,
    signals: state.signals,
    metrics: m,
    recentTrades: [...state.trades].reverse().slice(0, 20),
    openPosition: {
      active: state.openPosition,
      qty: state.openQty,
      costBasis: state.openBuyPrice,
      unrealizedPnlPct: m.unrealizedPnlPct,
    },
  };
}

export function toSSE(event: LiveStreamEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
