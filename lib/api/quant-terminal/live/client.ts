// 📁 lib/api/quant-terminal/live/client.ts
// ─── Live Trading Client SDK ──────────────────────────────────────────────────
// 调用链：UI → lib/api → app/api/quant-terminal/live/* → 后端服务
//
// 端点对照：
//   live/status    GET   → 查询会话状态、持仓信息
//   live/result    GET   → 获取完整净值/信号/指标/成交记录
//   live/snapshot  GET   → 查询缓存快照（无需会话在线）
//   live/stream    GET   → SSE 实时流（tick/signal/order/metrics/alert）
//   live/pause     POST  → 暂停策略
//   live/resume    POST  → 恢复策略
//   live/stop      POST  → 终止策略并平仓

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  LiveStreamEvent,
  LiveTick,
  LiveSignalEvent,
  LiveOrder,
  LiveMetrics,
  LiveHeartbeat,
  LiveAlert,
  LiveSnapshot,
  LiveStatusResponse,
  LiveResultResponse,
  LiveSnapshotResponse,
  LiveControlResponse,
} from "./types";
import {
  getOrCreateLiveSession,
  updateLiveSession,
  nextLiveTick,
  buildLiveStatus,
  buildLiveResult,
  getMockLiveSnapshot,
  buildLiveSnapshot,
  buildLiveMetricsEvent,
  buildLiveHeartbeat,
  toSSE,
} from "./mock";

export type {
  LiveStreamEvent,
  LiveTick,
  LiveSignalEvent,
  LiveOrder,
  LiveMetrics,
  LiveHeartbeat,
  LiveAlert,
  LiveSnapshot,
  LiveStatusResponse,
  LiveResultResponse,
  LiveSnapshotResponse,
  LiveControlResponse,
};

// ── 环境开关 ──────────────────────────────────────────────────────────────────
// BACKEND_URL 未设置时自动走 mock，与 paper/backtest 一致

const BASE = "/api/quant-terminal/live";

const USE_MOCK =
  process.env.NEXT_PUBLIC_LIVE_MOCK === "true" ||
  process.env.NODE_ENV === "development";

// ── status ────────────────────────────────────────────────────────────────────

export async function fetchLiveStatus(
  strategyId: string,
): Promise<LiveStatusResponse> {
  if (USE_MOCK) {
    return buildLiveStatus(getOrCreateLiveSession(strategyId));
  }
  const res = await fetch(
    `${BASE}/status?strategyId=${encodeURIComponent(strategyId)}`,
  );
  if (!res.ok) throw new Error(`fetchLiveStatus failed: ${res.status}`);
  return res.json();
}

// ── result ────────────────────────────────────────────────────────────────────

export async function fetchLiveResult(
  strategyId: string,
): Promise<LiveResultResponse> {
  if (USE_MOCK) {
    return buildLiveResult(getOrCreateLiveSession(strategyId));
  }
  const res = await fetch(
    `${BASE}/result?strategyId=${encodeURIComponent(strategyId)}`,
  );
  if (!res.ok) throw new Error(`fetchLiveResult failed: ${res.status}`);
  return res.json();
}

// ── snapshot ──────────────────────────────────────────────────────────────────

export async function fetchLiveSnapshot(
  strategyId: string,
): Promise<LiveSnapshot> {
  if (USE_MOCK) {
    return buildLiveSnapshot(getOrCreateLiveSession(strategyId));
  }
  const res = await fetch(
    `${BASE}/snapshot?strategyId=${encodeURIComponent(strategyId)}`,
  );
  if (!res.ok) throw new Error(`fetchLiveSnapshot failed: ${res.status}`);
  return res.json();
}

export async function fetchLiveSnapshotCached(
  strategyId: string,
): Promise<LiveSnapshotResponse> {
  if (USE_MOCK) {
    return getMockLiveSnapshot(strategyId);
  }
  const res = await fetch(
    `${BASE}/snapshot?strategyId=${encodeURIComponent(strategyId)}&cached=true`,
  );
  if (!res.ok) return { found: false };
  return res.json();
}

// ── control ───────────────────────────────────────────────────────────────────

async function postControl(
  strategyId: string,
  action: "pause" | "resume" | "stop",
): Promise<LiveControlResponse> {
  if (USE_MOCK) {
    const state = getOrCreateLiveSession(strategyId);
    const statusMap = {
      pause: "paused",
      resume: "running",
      stop: "stopped",
    } as const;
    const msgMap = {
      pause: "策略已暂停，持仓保留",
      resume: "策略已恢复运行",
      stop: "策略已终止，持仓已平仓",
    };
    const newStatus = statusMap[action];
    const updated = {
      ...state,
      status: newStatus,
      openPosition: action === "stop" ? false : state.openPosition,
      openBuyPrice: action === "stop" ? 0 : state.openBuyPrice,
      openQty: action === "stop" ? 0 : state.openQty,
    };
    updateLiveSession(strategyId, updated);
    if (action === "stop") buildLiveResult(updated); // 写入 snapshot 缓存
    return { ok: true, status: newStatus, message: msgMap[action] };
  }
  const res = await fetch(
    `${BASE}/${action}?strategyId=${encodeURIComponent(strategyId)}`,
    { method: "POST" },
  );
  if (!res.ok) throw new Error(`${action} failed: ${res.status}`);
  return res.json();
}

export const pauseLive = (id: string) => postControl(id, "pause");
export const resumeLive = (id: string) => postControl(id, "resume");
export const stopLive = (id: string) => postControl(id, "stop");

// ── stream handlers ───────────────────────────────────────────────────────────

export interface LiveStreamHandlers {
  onTick?: (e: LiveTick) => void;
  onSignal?: (e: LiveSignalEvent) => void;
  onOrder?: (e: LiveOrder) => void;
  onMetrics?: (e: LiveMetrics) => void;
  onHeartbeat?: (e: LiveHeartbeat) => void;
  onAlert?: (e: LiveAlert) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (err: Event | Error) => void;
}

export interface LiveStreamConnection {
  close: () => void;
  isOpen: () => boolean;
}

// ── mock stream ───────────────────────────────────────────────────────────────

function connectMockStream(
  strategyId: string,
  handlers: LiveStreamHandlers,
): LiveStreamConnection {
  const TICK_MS = 300;
  const METRICS_EVERY = 10;
  const HEARTBEAT_EVERY = 20;
  let closed = false;
  let tickCount = 0;

  const initState = getOrCreateLiveSession(strategyId);
  setTimeout(() => {
    if (!closed) handlers.onHeartbeat?.(buildLiveHeartbeat(initState));
  }, 0);
  handlers.onOpen?.();

  const timer = setInterval(() => {
    if (closed) {
      clearInterval(timer);
      return;
    }

    const cur = getOrCreateLiveSession(strategyId);
    if (cur.status !== "running") {
      handlers.onHeartbeat?.(buildLiveHeartbeat(cur));
      clearInterval(timer);
      handlers.onClose?.();
      return;
    }

    const { events, updatedState } = nextLiveTick(cur);
    updateLiveSession(strategyId, updatedState);
    tickCount++;

    for (const ev of events) {
      switch (ev.type) {
        case "tick":
          handlers.onTick?.(ev);
          break;
        case "signal":
          handlers.onSignal?.(ev);
          break;
        case "order":
          handlers.onOrder?.(ev);
          break;
        case "alert":
          handlers.onAlert?.(ev);
          break;
      }
    }
    if (tickCount % METRICS_EVERY === 0)
      handlers.onMetrics?.(buildLiveMetricsEvent(updatedState));
    if (tickCount % HEARTBEAT_EVERY === 0)
      handlers.onHeartbeat?.(buildLiveHeartbeat(updatedState));
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

// ── real SSE stream ───────────────────────────────────────────────────────────

function connectRealStream(
  strategyId: string,
  handlers: LiveStreamHandlers,
): LiveStreamConnection {
  const url = `${BASE}/stream?strategyId=${encodeURIComponent(strategyId)}`;
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
      const event = JSON.parse(e.data) as LiveStreamEvent;
      switch (event.type) {
        case "tick":
          handlers.onTick?.(event);
          break;
        case "signal":
          handlers.onSignal?.(event);
          break;
        case "order":
          handlers.onOrder?.(event);
          break;
        case "metrics":
          handlers.onMetrics?.(event);
          break;
        case "heartbeat":
          handlers.onHeartbeat?.(event);
          break;
        case "alert":
          handlers.onAlert?.(event);
          break;
      }
    } catch {
      console.warn("[live-stream] parse error:", e.data);
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

export function connectLiveStream(
  strategyId: string,
  handlers: LiveStreamHandlers,
): LiveStreamConnection {
  return USE_MOCK
    ? connectMockStream(strategyId, handlers)
    : connectRealStream(strategyId, handlers);
}

// ── React hook ─────────────────────────────────────────────────────────────────

export interface LiveState {
  connected: boolean;
  latestPrice: number;
  latestEquity: number;
  metrics: LiveMetrics | null;
  alerts: LiveAlert[];
  recentOrders: LiveOrder[];
}

export function useLiveTrading(
  strategyId: string | null,
  active: boolean,
  handlers: LiveStreamHandlers = {},
) {
  const connRef = useRef<LiveStreamConnection | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  const [state, setState] = useState<LiveState>({
    connected: false,
    latestPrice: 0,
    latestEquity: 0,
    metrics: null,
    alerts: [],
    recentOrders: [],
  });

  const stable: LiveStreamHandlers = {
    onOpen: useCallback(() => {
      setState((s) => ({ ...s, connected: true }));
      handlersRef.current.onOpen?.();
    }, []),
    onClose: useCallback(() => {
      setState((s) => ({ ...s, connected: false }));
      handlersRef.current.onClose?.();
    }, []),
    onTick: useCallback((e: LiveTick) => {
      setState((s) => ({ ...s, latestPrice: e.price, latestEquity: e.equity }));
      handlersRef.current.onTick?.(e);
    }, []),
    onSignal: useCallback((e: LiveSignalEvent) => {
      handlersRef.current.onSignal?.(e);
    }, []),
    onOrder: useCallback((e: LiveOrder) => {
      setState((s) => ({
        ...s,
        recentOrders: [e, ...s.recentOrders].slice(0, 20),
      }));
      handlersRef.current.onOrder?.(e);
    }, []),
    onMetrics: useCallback((e: LiveMetrics) => {
      setState((s) => ({ ...s, metrics: e }));
      handlersRef.current.onMetrics?.(e);
    }, []),
    onHeartbeat: useCallback((e: LiveHeartbeat) => {
      handlersRef.current.onHeartbeat?.(e);
    }, []),
    onAlert: useCallback((e: LiveAlert) => {
      setState((s) => ({ ...s, alerts: [e, ...s.alerts].slice(0, 10) }));
      handlersRef.current.onAlert?.(e);
    }, []),
    onError: useCallback((e: Event | Error) => {
      handlersRef.current.onError?.(e);
    }, []),
  };

  useEffect(() => {
    if (!strategyId || !active) {
      connRef.current?.close();
      connRef.current = null;
      return;
    }
    if (connRef.current?.isOpen()) return;
    connRef.current = connectLiveStream(strategyId, stable);
    return () => {
      connRef.current?.close();
      connRef.current = null;
    };
  }, [strategyId, active]); // eslint-disable-line

  const pause = useCallback(
    () =>
      strategyId
        ? pauseLive(strategyId)
        : Promise.resolve({
            ok: false,
            status: "stopped" as const,
            message: "",
          }),
    [strategyId],
  );
  const resume = useCallback(
    () =>
      strategyId
        ? resumeLive(strategyId)
        : Promise.resolve({
            ok: false,
            status: "stopped" as const,
            message: "",
          }),
    [strategyId],
  );
  const stop = useCallback(
    () =>
      strategyId
        ? stopLive(strategyId)
        : Promise.resolve({
            ok: false,
            status: "stopped" as const,
            message: "",
          }),
    [strategyId],
  );
  const snapshot = useCallback(
    () => (strategyId ? fetchLiveSnapshot(strategyId) : Promise.resolve(null)),
    [strategyId],
  );

  useEffect(
    () => () => {
      connRef.current?.close();
    },
    [],
  );

  return { ...state, pause, resume, stop, snapshot };
}
