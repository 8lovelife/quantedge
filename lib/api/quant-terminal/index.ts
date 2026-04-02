// ─── Paper Trading API — public surface ───────────────────────────────────────

// Types
export type {
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperSnapshot,
  PaperStreamEvent,
} from "./types";

// Client
export {
  connectPaperStream,
  fetchPaperSnapshot,
  usePaperStream,
} from "./client";

export type { PaperStreamHandlers, PaperStreamConnection } from "./client";
