// ─── Backtest Client SDK ──────────────────────────────────────────────────────
// Calls → app/api/backtest/*  → 后端服务
// Usage: const { run, result, progressPct, partialPts } = useBacktest();

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  BacktestStartRequest,
  BacktestResultResponse,
  BacktestStreamEvent,
  BacktestProgressEvent,
} from "./types";
import type { Signal } from "../types";

export type {
  BacktestStartRequest,
  BacktestResultResponse,
  BacktestStreamEvent,
};

const BASE = "/api/quant-terminal/backtest";

// ── Raw fetch helpers ──────────────────────────────────────────────────────────

export async function startBacktest(
  req: BacktestStartRequest,
): Promise<{ jobId: string; estimatedMs: number }> {
  const res = await fetch(`${BASE}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) throw new Error(`startBacktest failed: ${res.status}`);
  return res.json();
}

export async function fetchBacktestResult(
  jobId: string,
): Promise<BacktestResultResponse> {
  const res = await fetch(`${BASE}/result?jobId=${encodeURIComponent(jobId)}`);
  if (!res.ok) throw new Error(`fetchBacktestResult failed: ${res.status}`);
  return res.json();
}

// ── SSE stream ─────────────────────────────────────────────────────────────────

export interface BacktestStreamHandlers {
  onProgress?: (e: BacktestProgressEvent) => void;
  onComplete?: (result: BacktestResultResponse) => void;
  onError?: (err: Error) => void;
}

export function connectBacktestStream(
  params: { strategyId: string; range: string; asset: string },
  handlers: BacktestStreamHandlers,
): { close: () => void } {
  const url = `${BASE}/stream?strategyId=${encodeURIComponent(params.strategyId)}&range=${params.range}&asset=${encodeURIComponent(params.asset)}`;
  let es: EventSource | null = new EventSource(url);

  es.onmessage = (e: MessageEvent) => {
    try {
      const event = JSON.parse(e.data) as BacktestStreamEvent;
      if (event.type === "progress") handlers.onProgress?.(event);
      else if (event.type === "complete") {
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
