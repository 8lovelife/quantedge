// 📁 lib/api/quant-terminal/client.ts
// ─── Paper Trading Stream Client ─────────────────────────────────────────────
// 调用 → app/api/quant-terminal/paper/*  → 后端服务

import { useEffect, useRef, useCallback } from "react";
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

// ── Handler map ────────────────────────────────────────────────────────────────

export interface PaperStreamHandlers {
  onTick?: (event: PaperTick) => void;
  onSignal?: (event: PaperSignal) => void;
  onMetrics?: (event: PaperMetrics) => void;
  onHeartbeat?: (event: PaperHeartbeat) => void;
  onError?: (err: Event | Error) => void;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface PaperStreamConnection {
  close: () => void;
  isOpen: () => boolean;
}

// ── Base URL ───────────────────────────────────────────────────────────────────

const STREAM_BASE = "/api/quant-terminal/paper";

// ── Snapshot fetch ─────────────────────────────────────────────────────────────

export async function fetchPaperSnapshot(
  strategyId: string,
  planDays = 14,
): Promise<PaperSnapshot> {
  const res = await fetch(
    `${STREAM_BASE}/snapshot?strategyId=${encodeURIComponent(strategyId)}&planDays=${planDays}`,
  );
  if (!res.ok) throw new Error(`Snapshot fetch failed: ${res.status}`);
  return res.json() as Promise<PaperSnapshot>;
}

// ── SSE connect ────────────────────────────────────────────────────────────────

export function connectPaperStream(
  strategyId: string,
  handlers: PaperStreamHandlers,
  planDays = 14,
): PaperStreamConnection {
  const url = `${STREAM_BASE}/stream?strategyId=${encodeURIComponent(strategyId)}&planDays=${planDays}`;
  let es: EventSource | null = new EventSource(url);
  let open = false;

  es.onopen = () => {
    open = true;
    handlers.onOpen?.();
  };

  es.onerror = (err) => {
    handlers.onError?.(err);
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

// ── React hook ─────────────────────────────────────────────────────────────────

export function usePaperStream(
  strategyId: string | null,
  active: boolean,
  handlers: PaperStreamHandlers,
  planDays = 14,
) {
  const connRef = useRef<PaperStreamConnection | null>(null);
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
    if (connRef.current?.isOpen()) return;
    connRef.current = connectPaperStream(strategyId, stableHandlers, planDays);
    return () => {
      connRef.current?.close();
      connRef.current = null;
    };
  }, [strategyId, active, planDays]); // eslint-disable-line react-hooks/exhaustive-deps

  return connRef;
}
