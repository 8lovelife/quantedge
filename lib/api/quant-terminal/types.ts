// ─── Paper Trading API Types ──────────────────────────────────────────────────
// These types define the contract between the API stream and the UI.
// When real data is connected, only the server-side mock needs to change.

/** A single price tick pushed from the stream */
export interface PaperTick {
  type: "tick";
  ts: number; // unix ms timestamp
  price: number; // current BTC price (absolute, e.g. 84231)
  equity: number; // strategy equity index (starts at 0, +/- pct moves)
}

/** A trade signal emitted by the strategy engine */
export interface PaperSignal {
  type: "signal";
  ts: number;
  side: "buy" | "sell";
  price: number; // execution price
  qty: number; // BTC quantity
  pnlPct?: number; // realized P&L % (sell only)
  trigger: string; // human-readable trigger description
}

/** Rolling metrics snapshot pushed periodically */
export interface PaperMetrics {
  type: "metrics";
  ts: number;
  equityPct: number; // total equity change %
  maxDrawdownPct: number; // max drawdown % since start
  winRate: number; // 0-100
  tradeCount: number; // total closed trades
  slippage: number; // avg slippage %
  sharpe: number; // Sharpe ratio (rolling)
}

/** Connection established / heartbeat */
export interface PaperHeartbeat {
  type: "heartbeat";
  ts: number;
  strategyId: string;
  status: "running" | "paused" | "done";
}

/** Any message coming from the stream */
export type PaperStreamEvent =
  | PaperTick
  | PaperSignal
  | PaperMetrics
  | PaperHeartbeat;

// ─── REST snapshot (initial load) ─────────────────────────────────────────────

export interface PaperSnapshot {
  strategyId: string;
  status: "running" | "paused" | "done";
  startedAt: number; // unix ms
  equityHistory: number[]; // array of equity index values (for chart)
  signals: Array<{
    i: number; // index into equityHistory
    type: "buy" | "sell";
  }>;
  metrics: PaperMetrics;
  recentTrades: Array<{
    ts: number;
    side: "buy" | "sell";
    price: number;
    qty: number;
    pnlPct?: number;
    trigger: string;
  }>;
}

// Quant Terminal Types

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
  name: string; // base name, no version suffix
  asset: string;
  timeframe: string;
  type: string;
  returnRate: string;
  returnHint: string;
  familyId: string; // groups original + all clones together
  version: number; // 1 = original, 2 = first iteration, etc.
}

export interface StrategyStages {
  draft: StageStatus;
  bt: StageStatus;
  paper: StageStatus;
  live: StageStatus;
}

export type PaperPlanDays = number;

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
  paperPlanDays: PaperPlanDays; // planned duration chosen before starting
  paperStartTime: number; // unix ms when paper trading started (0 = not started)
  paperEndTime: number; // unix ms of planned end = startTime + planDays*86400000
  livePts: number[];
  liveSigs: Signal[];
  showPro: boolean;
  parsedParams?: ParsedParams;
  dslCode?: string;
}

export interface Signal {
  i: number;
  type: "buy" | "sell";
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

// A family = original strategy + all iterations, grouped for display
export interface StrategyFamily {
  familyId: string;
  baseName: string;
  members: Strategy[]; // sorted version asc, latest first for display
}
