// 📁 lib/api/quant-terminal/paper/types.ts
// ─── Paper Trading API Types ──────────────────────────────────────────────────
// 所有类型内联定义，不依赖外部 import。
// 分层结构与 backtest 对齐：result / snapshot / status / stream

export type Side = "buy" | "sell";
export type SessionStatus = "running" | "paused" | "done" | "stopped";
export type PaperStatus = "pending" | "running" | "paused" | "done";

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

export interface PaperMetricsData {
  equityPct: number;
  maxDrawdownPct: number;
  winRate: number;
  tradeCount: number;
  slippage: number;
  sharpe: number;
}

// ── GET /api/quant-terminal/paper/status?strategyId= ─────────────────────────
// 查询当前模拟交易会话的运行状态

export interface PaperStatusResponse {
  strategyId: string;
  status: PaperStatus;
  progressPct: number; // 0-100，基于 startedAt/endsAt 计算
  message: string; // 人读状态描述
  startedAt: number; // unix ms
  endsAt: number; // unix ms
  planDays: number;
  elapsedMs: number;
  remainingMs: number;
}

// ── GET /api/quant-terminal/paper/result?strategyId= ─────────────────────────
// 获取已完成的模拟交易完整结果

export interface PaperResultResponse {
  strategyId: string;
  status: PaperStatus;
  startedAt: number;
  completedAt: number;
  planDays: number;
  equityHistory: number[]; // 完整净值曲线
  signals: Signal[];
  metrics: PaperMetricsData;
  trades: TradeRecord[];
  // 动态展示字段
  dateRange: string; // e.g. "04/08 20:30 → 04/22 20:30"
  basePrice: number; // 价格基准
  priceScale: number; // pts → 价格换算比例
}

// ── GET /api/quant-terminal/paper/snapshot?strategyId= ───────────────────────
// 查询缓存的模拟交易结果（历史快照），无需会话仍在运行

export interface PaperSnapshotResponse {
  found: boolean;
  cachedAt?: number;
  result?: PaperResultResponse;
}

// ── SSE GET /api/quant-terminal/paper/stream?strategyId=&planDays= ───────────
// 实时推送 tick / signal / metrics / heartbeat

export interface PaperTick {
  type: "tick";
  ts: number;
  price: number;
  equity: number;
}

export interface PaperSignal {
  type: "signal";
  ts: number;
  side: Side;
  price: number;
  qty: number;
  pnlPct?: number;
  trigger: string;
}

export interface PaperMetrics {
  type: "metrics";
  ts: number;
  equityPct: number;
  maxDrawdownPct: number;
  winRate: number;
  tradeCount: number;
  slippage: number;
  sharpe: number;
}

export interface PaperHeartbeat {
  type: "heartbeat";
  ts: number;
  strategyId: string;
  status: SessionStatus;
  planDays: number;
  startedAt: number;
  endsAt: number;
}

export type PaperStreamEvent =
  | PaperTick
  | PaperSignal
  | PaperMetrics
  | PaperHeartbeat;

// ── Legacy snapshot (kept for backward compat with existing client.ts) ────────

export interface PaperSnapshot {
  strategyId: string;
  status: SessionStatus;
  startedAt: number;
  endsAt: number;
  planDays: number;
  equityHistory: number[];
  signals: Signal[];
  metrics: PaperMetrics;
  recentTrades: TradeRecord[];
}
