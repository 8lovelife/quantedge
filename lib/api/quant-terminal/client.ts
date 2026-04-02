// ─── Paper Trading Stream Client ─────────────────────────────────────────────
// Uses SSE (EventSource) today, structured so switching to a real WebSocket
// only requires changing this file — all consumers use the same interface.

import type {
  PaperStreamEvent,
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperSnapshot,
} from "./types";

export type {
  PaperStreamEvent,
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperSnapshot,
};

// ── Event handler map ──────────────────────────────────────────────────────────

export interface PaperStreamHandlers {
  onTick?: (event: PaperTick) => void;
  onSignal?: (event: PaperSignal) => void;
  onMetrics?: (event: PaperMetrics) => void;
  onHeartbeat?: (event: PaperHeartbeat) => void;
  onError?: (err: Event | Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

// ── Connection handle returned to callers ──────────────────────────────────────

export interface PaperStreamConnection {
  /** Cleanly close the stream */
  close: () => void;
  /** Whether the stream is currently active */
  isOpen: () => boolean;
}

// ── Base URL resolution ────────────────────────────────────────────────────────
// Change NEXT_PUBLIC_PAPER_STREAM_URL in .env to point at a real WebSocket server.
// Leave empty to use the built-in mock SSE route.

function resolveStreamUrl(strategyId: string): string {
  const base =
    process.env.NEXT_PUBLIC_PAPER_STREAM_URL || "/api/paper-trading/stream";
  return `${base}?strategyId=${encodeURIComponent(strategyId)}`;
}

// ── Snapshot fetch (REST, called once on connect) ──────────────────────────────

export async function fetchPaperSnapshot(
  strategyId: string,
): Promise<PaperSnapshot> {
  const res = await fetch(
    `/api/paper-trading/snapshot?strategyId=${encodeURIComponent(strategyId)}`,
  );
  if (!res.ok) throw new Error(`Snapshot fetch failed: ${res.status}`);
  return res.json() as Promise<PaperSnapshot>;
}

// ── Main stream connect function ───────────────────────────────────────────────

export function connectPaperStream(
  strategyId: string,
  handlers: PaperStreamHandlers,
): PaperStreamConnection {
  const url = resolveStreamUrl(strategyId);
  let es: EventSource | null = new EventSource(url);
  let open = false;

  es.onopen = () => {
    open = true;
    handlers.onOpen?.();
  };

  es.onerror = (err) => {
    handlers.onError?.(err);
    // SSE will auto-reconnect; if you want to disable that, close here
  };

  es.onmessage = (e: MessageEvent) => {
    let event: PaperStreamEvent;
    try {
      event = JSON.parse(e.data) as PaperStreamEvent;
    } catch {
      console.warn("[paper-stream] failed to parse event:", e.data);
      return;
    }

    switch (event.type) {
      case "tick":
        handlers.onTick?.(event);
        break;
      case "signal":
        handlers.onSignal?.(event);
        break;
      case "metrics":
        handlers.onMetrics?.(event);
        break;
      case "heartbeat":
        handlers.onHeartbeat?.(event);
        break;
    }
  };

  return {
    close: () => {
      if (es) {
        open = false;
        es.close();
        es = null;
        handlers.onClose?.();
      }
    },
    isOpen: () => open,
  };
}

// ── React hook ────────────────────────────────────────────────────────────────
// Wraps connectPaperStream with automatic lifecycle management.
// Import and use in paper-tab.tsx.

import { useEffect, useRef, useCallback } from "react";

export function usePaperStream(
  strategyId: string | null,
  active: boolean, // only connect when paper trading is running
  handlers: PaperStreamHandlers,
) {
  const connRef = useRef<PaperStreamConnection | null>(null);
  // Stable ref to handlers to avoid reconnecting on every render
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const stableHandlers: PaperStreamHandlers = {
    onTick: useCallback((e) => handlersRef.current.onTick?.(e), []),
    onSignal: useCallback((e) => handlersRef.current.onSignal?.(e), []),
    onMetrics: useCallback((e) => handlersRef.current.onMetrics?.(e), []),
    onHeartbeat: useCallback((e) => handlersRef.current.onHeartbeat?.(e), []),
    onError: useCallback((e) => handlersRef.current.onError?.(e), []),
    onOpen: useCallback(() => handlersRef.current.onOpen?.(), []),
    onClose: useCallback(() => handlersRef.current.onClose?.(), []),
  };

  useEffect(() => {
    if (!strategyId || !active) {
      connRef.current?.close();
      connRef.current = null;
      return;
    }

    // Avoid double-connecting (React StrictMode)
    if (connRef.current?.isOpen()) return;

    connRef.current = connectPaperStream(strategyId, stableHandlers);

    return () => {
      connRef.current?.close();
      connRef.current = null;
    };
  }, [strategyId, active]); // eslint-disable-line react-hooks/exhaustive-deps

  return connRef;
}
