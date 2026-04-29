// 📁 lib/api/quant-terminal/live/types.ts
// 分层结构与 paper 对齐：status / result / snapshot / stream

export type Side = "buy" | "sell";
export type SessionStatus = "running" | "paused" | "done" | "stopped";

export interface Signal {
  i: number;
  type: Side;
  price?: number;
  ts?: number;
  pnl?: string;
  trigger?: string;
}
export interface TradeRecord {
  ts: number;
  side: Side;
  price: number;
  qty: number;
  pnlPct?: number;
  trigger: string;
}

// ── GET /api/quant-terminal/live/status?strategyId= ──────────────────────────
export interface LiveStatusResponse {
  strategyId: string;
  status: SessionStatus;
  message: string;
  startedAt: number;
  exchange: string;
  elapsedMs: number;
  openPosition: {
    active: boolean;
    qty: number;
    costBasis: number;
    unrealizedPnlPct: number;
  };
}

// ── GET /api/quant-terminal/live/result?strategyId= ──────────────────────────
export interface LiveMetricsData {
  equityPct: number;
  maxDrawdownPct: number;
  winRate: number;
  tradeCount: number;
  slippage: number;
  sharpe: number;
  unrealizedPnlPct: number;
  holdingQty: number;
  holdingCost: number;
}
export interface LiveResultResponse {
  strategyId: string;
  status: SessionStatus;
  exchange: string;
  startedAt: number;
  completedAt: number;
  pts: number[];
  signals: Signal[];
  trades: TradeRecord[];
  metrics: LiveMetricsData;
  openPosition: {
    active: boolean;
    qty: number;
    costBasis: number;
    unrealizedPnlPct: number;
  };
  basePrice: number;
  priceScale: number;
}

// ── GET /api/quant-terminal/live/snapshot?strategyId= ────────────────────────
export interface LiveSnapshotResponse {
  found: boolean;
  cachedAt?: number;
  result?: LiveResultResponse;
}

// ── SSE GET /api/quant-terminal/live/stream?strategyId= ──────────────────────
export interface LiveTick {
  type: "tick";
  ts: number;
  price: number;
  equity: number;
  bid: number;
  ask: number;
  spread: number;
}
export interface LiveSignalEvent {
  type: "signal";
  ts: number;
  side: Side;
  price: number;
  qty: number;
  pnlPct?: number;
  pnl?: string;
  trigger: string;
}
export interface LiveOrder {
  type: "order";
  ts: number;
  orderId: string;
  side: Side;
  status: "filled" | "partial" | "cancelled";
  price: number;
  qty: number;
  slippage: number;
}
export interface LiveMetrics {
  type: "metrics";
  ts: number;
  equityPct: number;
  maxDrawdownPct: number;
  winRate: number;
  tradeCount: number;
  slippage: number;
  sharpe: number;
  unrealizedPnlPct: number;
  holdingQty: number;
  holdingCost: number;
}
export interface LiveHeartbeat {
  type: "heartbeat";
  ts: number;
  strategyId: string;
  status: SessionStatus;
  exchange: string;
  latencyMs: number;
}
export interface LiveAlert {
  type: "alert";
  ts: number;
  level: "info" | "warn" | "error";
  code: string;
  message: string;
}
export type LiveStreamEvent =
  | LiveTick
  | LiveSignalEvent
  | LiveOrder
  | LiveMetrics
  | LiveHeartbeat
  | LiveAlert;

// ── POST /api/quant-terminal/live/pause|resume|stop ──────────────────────────
export interface LiveControlResponse {
  ok: boolean;
  status: SessionStatus;
  message: string;
}

// ── Legacy (backward compat with existing client.ts) ─────────────────────────
export interface LiveSnapshot {
  strategyId: string;
  status: SessionStatus;
  exchange: string;
  startedAt: number;
  pts: number[];
  signals: Signal[];
  metrics: LiveMetrics;
  recentTrades: TradeRecord[];
  openPosition: {
    active: boolean;
    qty: number;
    costBasis: number;
    unrealizedPnlPct: number;
  };
}
// alias kept for existing imports
export type LiveSignal = LiveSignalEvent;
