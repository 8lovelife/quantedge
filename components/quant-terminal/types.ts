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
  // Per-stage result fields — updated in real-time by live/paper tabs
  btResult?: string; // e.g. "+34.2%"  set when backtest completes
  paperResult?: string; // e.g. "+2.1%"   updated every paper tick
  liveResult?: string; // e.g. "+12.4%"  updated every live tick
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
  paperTickMs: number; // ms per tick: 300=normal, 1000/5000/30000 for fast-test modes
  livePts: number[];
  liveSigs: Signal[];
  showPro: boolean;
  parsedParams?: ParsedParams;
  dslCode?: string;
}

export interface Signal {
  i: number;
  type: "buy" | "sell";
  // Snapshot fields written at signal time — never change after creation
  price?: number; // exact BTC price at signal moment
  ts?: number; // unix ms timestamp
  pnl?: string; // e.g. "+2.34%" for sell signals; undefined for buy
  trigger?: string; // e.g. "EMA上穿"
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
