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
  // ── 动态配置字段（由后端/mock 生成，前端直接使用） ──────────────────────────
  dateRange: string; // e.g. "2024-12 ~ 2025-03"  X轴起止日期标注
  basePrice: number; // e.g. 84231  价格坐标基准
  priceScale: number; // e.g. 80     pts 单位 → 价格偏移比例
}

// ── GET /api/quant-terminal/backtest/snapshot?strategyId=&range= ─────────────
// 返回该策略+区间最近一次回测的缓存结果，若无缓存则返回 null

export interface BacktestSnapshotResponse {
  found: boolean;
  cachedAt?: number; // unix ms，缓存写入时间
  result?: BacktestResultResponse;
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
