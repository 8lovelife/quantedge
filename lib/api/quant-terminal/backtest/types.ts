// ─── Backtest API Types ───────────────────────────────────────────────────────
import type { Signal, TradeRecord, Metrics } from "../types";

export type BtRange = "1m" | "3m" | "6m" | "1y";
export type BtStatus = "pending" | "running" | "done" | "error";

// POST /api/backtest/start
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

// GET /api/backtest/status?jobId=
export interface BacktestStatusResponse {
  jobId: string;
  status: BtStatus;
  progressPct: number;
  message: string;
}

// GET /api/backtest/result?jobId=
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

// GET /api/backtest/stream?jobId= (SSE)
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
