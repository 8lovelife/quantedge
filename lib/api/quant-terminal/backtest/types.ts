// 📁 lib/api/quant-terminal/backtest/types.ts
// ─── Backtest API Types ───────────────────────────────────────────────────────
// 所有类型内联，不依赖 ../types，避免路径解析问题。

export type Side = "buy" | "sell";
export type BtRange = "1m" | "3m" | "6m" | "1y";
export type BtStatus = "pending" | "running" | "done" | "error";

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

export interface Metrics {
  equityPct: number;
  maxDrawdownPct: number;
  winRate: number;
  tradeCount: number;
  slippage: number;
  sharpe: number;
}

// ── POST /api/quant-terminal/backtest/start ───────────────────────────────────

export interface BacktestStartRequest {
  strategyId: string;
  range: BtRange;
  asset: string;
  timeframe: string;
}

export interface BacktestStartResponse {
  jobId: string;
  estimatedMs: number;
}

// ── GET /api/quant-terminal/backtest/status?jobId= ───────────────────────────

export interface BacktestStatusResponse {
  jobId: string;
  status: BtStatus;
  progressPct: number;
  message: string;
}

// ── GET /api/quant-terminal/backtest/result?jobId= ───────────────────────────

export interface BacktestResultResponse {
  jobId: string;
  strategyId: string;
  range: BtRange;
  asset: string;
  startedAt: number;
  completedAt: number;
  pts: number[];
  signals: Signal[];
  metrics: Metrics;
  trades: TradeRecord[];
  benchmarkPts: number[];
  benchmarkReturnPct: number;
}

// ── GET /api/quant-terminal/backtest/stream (SSE) ────────────────────────────

export interface BacktestProgressEvent {
  type: "progress";
  jobId: string;
  pct: number;
  message: string;
  latestPts: number[];
  latestSignals: Signal[];
}

export interface BacktestCompleteEvent {
  type: "complete";
  jobId: string;
  result: BacktestResultResponse;
}

export interface BacktestErrorEvent {
  type: "error";
  jobId: string;
  message: string;
}

export type BacktestStreamEvent =
  | BacktestProgressEvent
  | BacktestCompleteEvent
  | BacktestErrorEvent;
