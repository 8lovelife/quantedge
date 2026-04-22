// 📁 lib/api/quant-terminal/paper/client.ts
// ─── Paper Trading Client SDK ─────────────────────────────────────────────────
// 调用链：UI → lib/api → app/api/quant-terminal/paper/* → 后端服务
//
// 端点对照：
//   paper/status    GET  → 查询会话状态 + 进度
//   paper/result    GET  → 获取完整结果（会话完成后）
//   paper/snapshot  GET  → 查询缓存快照（无需会话在线）
//   paper/stream    GET  → SSE 实时流

import { useCallback, useEffect, useRef } from "react";
import type {
  PaperStreamEvent,
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperSnapshot,
  PaperStatusResponse,
  PaperResultResponse,
  PaperSnapshotResponse,
} from "./types";
import {
  getOrCreateSession,
  updateSession,
  nextPaperTick,
  buildPaperStatus,
  buildPaperResult,
  getMockPaperSnapshot,
  buildPaperSnapshot,
  buildPaperMetricsEvent,
  buildPaperHeartbeat,
} from "./mock";

export type {
  PaperStreamEvent,
  PaperTick,
  PaperSignal,
  PaperMetrics,
  PaperHeartbeat,
  PaperSnapshot,
  PaperStatusResponse,
  PaperResultResponse,
  PaperSnapshotResponse,
};

const BASE = "/api/quant-terminal/paper";

const USE_MOCK =
  process.env.NEXT_PUBLIC_PAPER_MOCK === "true" ||
  process.env.NODE_ENV === "development";

// ── status ────────────────────────────────────────────────────────────────────

export async function fetchPaperStatus(
  strategyId: string,
): Promise<PaperStatusResponse> {
  if (USE_MOCK) {
    const state = getOrCreateSession(strategyId);
    return buildPaperStatus(state);
  }
  const res = await fetch(
    `${BASE}/status?strategyId=${encodeURIComponent(strategyId)}`,
  );
  if (!res.ok) throw new Error(`fetchPaperStatus failed: ${res.status}`);
  return res.json();
}

// ── result ────────────────────────────────────────────────────────────────────

export async function fetchPaperResult(
  strategyId: string,
): Promise<PaperResultResponse> {
  if (USE_MOCK) {
    const state = getOrCreateSession(strategyId);
    return buildPaperResult(state);
  }
  const res = await fetch(
    `${BASE}/result?strategyId=${encodeURIComponent(strategyId)}`,
  );
  if (!res.ok) throw new Error(`fetchPaperResult failed: ${res.status}`);
  return res.json();
}

// ── snapshot ──────────────────────────────────────────────────────────────────

export async function fetchPaperSnapshot(
  strategyId: string,
  planDays = 14,
): Promise<PaperSnapshot> {
  if (USE_MOCK) {
    const state = getOrCreateSession(strategyId, planDays);
    return buildPaperSnapshot(state);
  }
  const res = await fetch(
    `${BASE}/snapshot?strategyId=${encodeURIComponent(strategyId)}&planDays=${planDays}`,
  );
  if (!res.ok) throw new Error(`fetchPaperSnapshot failed: ${res.status}`);
  return res.json();
}

export async function fetchPaperSnapshotCached(
  strategyId: string,
): Promise<PaperSnapshotResponse> {
  if (USE_MOCK) {
    return getMockPaperSnapshot(strategyId);
  }
  const res = await fetch(
    `${BASE}/snapshot?strategyId=${encodeURIComponent(strategyId)}&cached=true`,
  );
  if (!res.ok) return { found: false };
  return res.json();
}

// ── stream ─────────────────────────────────────────────────────────────────────

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

function connectMockStream(
  strategyId: string,
  handlers: PaperStreamHandlers,
  planDays: number,
): PaperStreamConnection {
  const TICK_MS = 300;
  const METRICS_EVERY = 10;
  const HEARTBEAT_EVERY = 20;
  let closed = false;
  let tickCount = 0;

  // Ensure session exists
  const initialState = getOrCreateSession(strategyId, planDays);
  handlers.onOpen?.();

  // Send initial heartbeat
  setTimeout(() => {
    if (!closed)
      handlers.onHeartbeat?.(
        buildPaperHeartbeat(getOrCreateSession(strategyId)),
      );
  }, 0);

  const timer = setInterval(() => {
    if (closed) {
      clearInterval(timer);
      return;
    }

    const cur = getOrCreateSession(strategyId);

    // Check plan expiry
    if (cur.status === "running" && Date.now() >= cur.endsAt) {
      const done = { ...cur, status: "done" as const };
      updateSession(strategyId, done);
      // Auto-save snapshot on completion
      buildPaperResult(done); // triggers snapshot cache internally
      handlers.onHeartbeat?.(buildPaperHeartbeat(done));
      clearInterval(timer);
      return;
    }

    const { tick, signal, updatedState } = nextPaperTick(cur);
    updateSession(strategyId, updatedState);
    tickCount++;

    handlers.onTick?.(tick);
    if (signal) handlers.onSignal?.(signal);
    if (tickCount % METRICS_EVERY === 0)
      handlers.onMetrics?.(buildPaperMetricsEvent(updatedState));
    if (tickCount % HEARTBEAT_EVERY === 0)
      handlers.onHeartbeat?.(buildPaperHeartbeat(updatedState));
  }, TICK_MS);

  return {
    close: () => {
      closed = true;
      clearInterval(timer);
      handlers.onClose?.();
    },
    isOpen: () => !closed,
  };
}

function connectRealStream(
  strategyId: string,
  handlers: PaperStreamHandlers,
  planDays: number,
): PaperStreamConnection {
  const url = `${BASE}/stream?strategyId=${encodeURIComponent(strategyId)}&planDays=${planDays}`;
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
    try {
      const event = JSON.parse(e.data) as PaperStreamEvent;
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
    } catch {
      console.warn("[paper-stream] parse error:", e.data);
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

export function connectPaperStream(
  strategyId: string,
  handlers: PaperStreamHandlers,
  planDays = 14,
): PaperStreamConnection {
  return USE_MOCK
    ? connectMockStream(strategyId, handlers, planDays)
    : connectRealStream(strategyId, handlers, planDays);
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

  const stable: PaperStreamHandlers = {
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
    connRef.current = connectPaperStream(strategyId, stable, planDays);
    return () => {
      connRef.current?.close();
      connRef.current = null;
    };
  }, [strategyId, active, planDays]); // eslint-disable-line

  return connRef;
}
