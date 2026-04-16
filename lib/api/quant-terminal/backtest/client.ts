// 📁 lib/api/quant-terminal/backtest/client.ts
// ─── Backtest Client SDK ──────────────────────────────────────────────────────
// 调用链：useBacktest() → app/api/quant-terminal/backtest/* → 后端服务
// 降级：若 USE_MOCK=true 或后端不可用，自动使用 mock.ts 数据

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BacktestStartRequest,
  BacktestResultResponse,
  BacktestStreamEvent,
  BacktestProgressEvent,
  Signal,
} from "./types";
import { buildMockBacktestResult, buildMockProgressEvents } from "./mock";

export type {
  BacktestStartRequest,
  BacktestResultResponse,
  BacktestStreamEvent,
};

const BASE = "/api/quant-terminal/backtest";

// USE_MOCK=true  → 跳过真实 API，直接用 mock 数据（开发 / 演示用）
// USE_MOCK=false → 调用真实后端，若失败则抛出错误
const USE_MOCK =
  process.env.NEXT_PUBLIC_BACKTEST_MOCK === "true" ||
  process.env.NODE_ENV === "development";

// ── Raw fetch helpers ──────────────────────────────────────────────────────────

export async function startBacktest(
  req: BacktestStartRequest,
): Promise<{ jobId: string; estimatedMs: number }> {
  if (USE_MOCK) {
    return { jobId: `mock_${Date.now()}`, estimatedMs: 3000 };
  }
  const res = await fetch(`${BASE}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`startBacktest failed: ${res.status}`);
  return res.json();
}

export async function fetchBacktestStatus(jobId: string) {
  if (USE_MOCK) {
    return { jobId, status: "done", progressPct: 100, message: "完成" };
  }
  const res = await fetch(`${BASE}/status?jobId=${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(`fetchBacktestStatus failed: ${res.status}`);
  return res.json();
}

export async function fetchBacktestResult(
  jobId: string,
): Promise<BacktestResultResponse> {
  if (USE_MOCK) {
    throw new Error("Mock mode: use connectBacktestStream instead");
  }
  const res = await fetch(`${BASE}/result?jobId=${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(`fetchBacktestResult failed: ${res.status}`);
  return res.json();
}

// ── SSE stream (or mock stream) ───────────────────────────────────────────────

export interface BacktestStreamHandlers {
  onProgress?: (e: BacktestProgressEvent) => void;
  onComplete?: (result: BacktestResultResponse) => void;
  onError?: (err: Error) => void;
}

/** Mock 流：用 setInterval 按步骤推送进度事件，模拟 SSE 时序 */
function connectMockStream(
  params: { strategyId: string; range: string; asset: string },
  handlers: BacktestStreamHandlers,
): { close: () => void } {
  const STEP_MS = 350; // 每步间隔，控制动画速度
  const result = buildMockBacktestResult(
    params.strategyId,
    params.range as "1m" | "3m" | "6m" | "1y",
    params.asset,
  );
  const events = buildMockProgressEvents(result);
  let idx = 0;
  let closed = false;

  const timer = setInterval(() => {
    if (closed || idx >= events.length) {
      clearInterval(timer);
      return;
    }
    const ev = events[idx++];
    if (ev.type === "progress") {
      handlers.onProgress?.(ev);
    } else if (ev.type === "complete") {
      handlers.onComplete?.(ev.result);
      clearInterval(timer);
    }
  }, STEP_MS);

  return {
    close: () => {
      closed = true;
      clearInterval(timer);
    },
  };
}

/** 真实 SSE 流 */
function connectRealStream(
  params: { strategyId: string; range: string; asset: string },
  handlers: BacktestStreamHandlers,
): { close: () => void } {
  const url = `${BASE}/stream?strategyId=${encodeURIComponent(params.strategyId)}&range=${params.range}&asset=${encodeURIComponent(params.asset)}`;
  let es: EventSource | null = new EventSource(url);

  es.onmessage = (e: MessageEvent) => {
    try {
      const event = JSON.parse(e.data) as BacktestStreamEvent;
      if (event.type === "progress") {
        handlers.onProgress?.(event);
      } else if (event.type === "complete") {
        handlers.onComplete?.(event.result);
        es?.close();
        es = null;
      } else if (event.type === "error") {
        handlers.onError?.(new Error(event.message));
        es?.close();
        es = null;
      }
    } catch {
      console.warn("[backtest-stream] parse error", e.data);
    }
  };
  es.onerror = () => handlers.onError?.(new Error("SSE connection error"));

  return {
    close: () => {
      es?.close();
      es = null;
    },
  };
}

export function connectBacktestStream(
  params: { strategyId: string; range: string; asset: string },
  handlers: BacktestStreamHandlers,
): { close: () => void } {
  return USE_MOCK
    ? connectMockStream(params, handlers)
    : connectRealStream(params, handlers);
}

// ── React hook ─────────────────────────────────────────────────────────────────

export interface BacktestState {
  isRunning: boolean;
  progressPct: number;
  progressMsg: string;
  partialPts: number[];
  partialSignals: Signal[];
  result: BacktestResultResponse | null;
  error: string | null;
}

export function useBacktest() {
  const [state, setState] = useState<BacktestState>({
    isRunning: false,
    progressPct: 0,
    progressMsg: "",
    partialPts: [],
    partialSignals: [],
    result: null,
    error: null,
  });
  const connRef = useRef<{ close: () => void } | null>(null);

  const run = useCallback((req: BacktestStartRequest) => {
    connRef.current?.close();
    setState({
      isRunning: true,
      progressPct: 0,
      progressMsg: "加载历史数据...",
      partialPts: [],
      partialSignals: [],
      result: null,
      error: null,
    });

    connRef.current = connectBacktestStream(
      { strategyId: req.strategyId, range: req.range, asset: req.asset },
      {
        onProgress: (ev) =>
          setState((s) => ({
            ...s,
            progressPct: ev.pct,
            progressMsg: ev.message,
            partialPts: ev.latestPts,
            partialSignals: ev.latestSignals,
          })),
        onComplete: (result) => {
          setState((s) => ({
            ...s,
            isRunning: false,
            progressPct: 100,
            progressMsg: "完成",
            partialPts: result.pts,
            partialSignals: result.signals,
            result,
          }));
          connRef.current = null;
        },
        onError: (err) => {
          setState((s) => ({ ...s, isRunning: false, error: err.message }));
          connRef.current = null;
        },
      },
    );
  }, []);

  const reset = useCallback(() => {
    connRef.current?.close();
    connRef.current = null;
    setState({
      isRunning: false,
      progressPct: 0,
      progressMsg: "",
      partialPts: [],
      partialSignals: [],
      result: null,
      error: null,
    });
  }, []);

  useEffect(
    () => () => {
      connRef.current?.close();
    },
    [],
  );

  return { ...state, run, reset };
}
