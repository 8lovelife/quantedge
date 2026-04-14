// 📁 lib/api/quant-terminal/index.ts
// ─── Quant Terminal API — 统一导出入口 ───────────────────────────────────────
export type {
  Side,
  SessionStatus,
  Signal,
  TradeRecord,
  Metrics,
  StageStatus,
  BtRange,
  Strategy,
  StrategyStages,
  StrategyState,
  PaperPlanDays,
  ParsedParams,
  MarketAsset,
  LogItem,
  ChatMessage,
  StrategyFamily,
} from "./types";

// ── Paper Trading ──────────────────────────────────────────────────────────────
export type {
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperSnapshot,
  PaperStreamEvent,
} from "./types";

export {
  connectPaperStream,
  fetchPaperSnapshot,
  usePaperStream,
} from "./client";

export type { PaperStreamHandlers, PaperStreamConnection } from "./client";

// ── Backtest ───────────────────────────────────────────────────────────────────
export type {
  BacktestStartRequest,
  BacktestStartResponse,
  BacktestStatusResponse,
  BacktestResultResponse,
  BacktestProgressEvent,
  BacktestCompleteEvent,
  BacktestErrorEvent,
  BacktestStreamEvent,
  BtStatus,
} from "./backtest/types";

export {
  startBacktest,
  fetchBacktestResult,
  connectBacktestStream,
  useBacktest,
} from "./backtest/client";

export type { BacktestStreamHandlers, BacktestState } from "./backtest/client";
