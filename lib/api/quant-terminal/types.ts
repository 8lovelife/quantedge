// 📁 lib/api/quant-terminal/types.ts
// ─── Quant Terminal — 所有共享类型 ───────────────────────────────────────────
// ─── API 共享基础类型 ─────────────────────────────────────────────────────────

export type Side = "buy" | "sell";
export type SessionStatus = "running" | "paused" | "done" | "stopped";

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

// ─── Paper Trading Stream Types ───────────────────────────────────────────────

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
}

export type PaperStreamEvent =
  | PaperTick
  | PaperSignal
  | PaperMetrics
  | PaperHeartbeat;

export interface PaperSnapshot {
  strategyId: string;
  status: SessionStatus;
  startedAt: number;
  equityHistory: number[];
  signals: Array<{ i: number; type: Side }>;
  metrics: PaperMetrics;
  recentTrades: Array<{
    ts: number;
    side: Side;
    price: number;
    qty: number;
    pnlPct?: number;
    trigger: string;
  }>;
}

// ─── UI / Store 类型 ──────────────────────────────────────────────────────────

export type StageStatus =
  | "locked"
  | "ready"
  | "running"
  | "paused"
  | "done"
  | "stopped";

export type BtRange = "1m" | "3m" | "6m" | "1y";

export interface Strategy {
  id: string;
  name: string;
  asset: string;
  timeframe: string;
  type: string;
  returnRate: string;
  returnHint: string;
  btResult?: string;
  paperResult?: string;
  liveResult?: string;
  familyId: string;
  version: number;
}

export interface StrategyStages {
  draft: StageStatus;
  bt: StageStatus;
  paper: StageStatus;
  live: StageStatus;
}

export type PaperPlanDays = number;

// Signal — 唯一定义，price/ts/pnl/trigger 可选以兼容旧用法
export interface Signal {
  i: number;
  type: Side;
  price?: number;
  ts?: number;
  pnl?: string;
  trigger?: string;
}

export interface StrategyState {
  stages: StrategyStages;
  activeTab: "draft" | "bt" | "paper" | "live";
  btRange: BtRange;
  btPts: number[];
  btSigs: Signal[];
  btDone: boolean;
  paperPts: number[];
  paperSigs: Signal[];
  paperRef: number[];
  paperDone: boolean;
  paperPlanDays: PaperPlanDays;
  paperStartTime: number;
  paperEndTime: number;
  paperTickMs: number;
  livePts: number[];
  liveSigs: Signal[];
  showPro: boolean;
  parsedParams?: ParsedParams;
  dslCode?: string;
}

export interface ParsedParams {
  name: string;
  asset: string;
  tf: string;
  sl: string;
  tp: string;
  pos: string;
  stratType: string;
}

export interface MarketAsset {
  symbol: string;
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

export interface LogItem {
  time: string;
  tag: string;
  message: string;
}

export interface ChatMessage {
  id: string;
  type: "user" | "ai";
  content: string;
  timestamp: Date;
}

export interface StrategyFamily {
  familyId: string;
  baseName: string;
  members: Strategy[];
}
