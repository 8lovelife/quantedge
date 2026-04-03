"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useQuantTerminalStore } from "../store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { drawPaperChart } from "../chart-utils";
import type { PaperPlanDays } from "../types";
import {
  fetchPaperSnapshot,
  PaperMetrics,
  PaperSignal,
  PaperTick,
  usePaperStream,
} from "@/lib/api/quant-terminal";

interface PaperTabProps {
  onStartLive: () => void;
  viewOnly?: boolean;
  viewOnlyReason?: "paper" | "live";
  readOnly?: boolean;
  onClone?: () => void;
}

interface PaperTrade {
  time: string;
  dir: "买入" | "卖出";
  price: string;
  qty: string;
  pnl: string;
  trigger: string;
  isBuy: boolean;
  isUp: boolean;
  isPending: boolean;
}

const PLAN_PRESETS: {
  days: number;
  label: string;
  desc: string;
  recommended?: boolean;
}[] = [
  { days: 7, label: "7天", desc: "快速验证" },
  { days: 14, label: "14天", desc: "推荐", recommended: true },
  { days: 30, label: "30天", desc: "充分验证" },
];

function fmtDate(ms: number) {
  const d = new Date(ms);
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function fmtEndDate(ms: number) {
  const d = new Date(ms);
  const months = [
    "1月",
    "2月",
    "3月",
    "4月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
  ];
  return `${months[d.getMonth()]}${d.getDate()}日 ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function fmtRemaining(ms: number) {
  if (ms <= 0) return "已到期";
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  if (d > 0) return `剩余 ${d}天 ${h}h`;
  if (h > 0) return `剩余 ${h}h ${m}m`;
  return `剩余 ${m}m`;
}

export function PaperTab({
  onStartLive,
  viewOnly,
  viewOnlyReason,
  readOnly,
  onClone,
}: PaperTabProps) {
  const {
    activeStrategyId,
    strategyStates,
    setStrategyState,
    addLog,
    setPaperPlan,
    updatePaperResult,
  } = useQuantTerminalStore();
  const state = strategyStates[activeStrategyId];
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [trades, setTrades] = useState<PaperTrade[]>([]);
  const [metrics, setMetrics] = useState<PaperMetrics | null>(null);
  const [now, setNow] = useState(Date.now());
  const [streamOk, setStreamOk] = useState(false);
  const [customDays, setCustomDays] = useState(21);
  const [isCustom, setIsCustom] = useState(false);

  const isRunning = state?.stages.paper === "running";
  const isPaused = state?.stages.paper === "paused";
  const isDone = state?.stages.paper === "done";
  const isReady = state?.stages.paper === "ready";

  const planDays = state?.paperPlanDays ?? 14;
  const startTime = state?.paperStartTime ?? 0;
  const endTime = state?.paperEndTime ?? 0;

  // ── Tick "now" every second for progress bar + remaining time ────────────────
  useEffect(() => {
    if (!isRunning) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [isRunning]);

  // ── Auto-end when plan expires ────────────────────────────────────────────────
  useEffect(() => {
    if (isRunning && endTime > 0 && now >= endTime) {
      setStrategyState(activeStrategyId, {
        stages: { ...state.stages, paper: "done", live: "ready" },
        paperDone: true,
      });
      addLog(
        "模拟",
        `<span class="hi">计划结束</span> · ${planDays}天模拟完成`,
      );
    }
  }, [now, isRunning, endTime]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load snapshot on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!activeStrategyId) return;
    fetchPaperSnapshot(activeStrategyId)
      .then((snap) => {
        if (snap.equityHistory.length > 1) {
          setStrategyState(activeStrategyId, {
            paperPts: snap.equityHistory,
            paperSigs: snap.signals,
            paperRef: [],
          });
        }
        setMetrics(snap.metrics);
      })
      .catch(() => {});
  }, [activeStrategyId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Redraw helper ─────────────────────────────────────────────────────────────
  const redraw = useCallback(
    (pts: number[], sigs: typeof state.paperSigs) => {
      if (!canvasRef.current || pts.length < 2) return;
      drawPaperChart(
        canvasRef.current,
        pts,
        sigs,
        [],
        startTime || undefined,
        endTime || undefined,
        300,
      );
    },
    [startTime, endTime],
  );

  // ── Stream handlers ───────────────────────────────────────────────────────────
  const handleTick = useCallback(
    (tick: PaperTick) => {
      const cur =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId];
      if (!cur) return;
      const pts = [...cur.paperPts, tick.equity];
      if (pts.length > 200) pts.shift();
      setStrategyState(activeStrategyId, {
        paperPts: pts,
        paperSigs: cur.paperSigs,
      });
      redraw(pts, cur.paperSigs);

      // Sync real-time return to sidebar
      const firstPt = pts[0];
      const lastPt = pts[pts.length - 1];
      const returnPct =
        firstPt !== 0 ? ((lastPt - firstPt) / Math.abs(firstPt)) * 100 : 0;
      const returnStr = `${returnPct >= 0 ? "+" : ""}${returnPct.toFixed(1)}%`;
      updatePaperResult(activeStrategyId, returnStr);
    },
    [activeStrategyId, setStrategyState, redraw, updatePaperResult],
  );

  const handleSignal = useCallback(
    (sig: PaperSignal) => {
      const cur =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId];
      if (!cur) return;
      const idx = cur.paperPts.length - 1;
      const sigs = [...cur.paperSigs, { i: idx, type: sig.side }];
      setStrategyState(activeStrategyId, { paperSigs: sigs });

      const timeStr = new Date(sig.ts).toLocaleTimeString("zh-CN", {
        hour: "2-digit",
        minute: "2-digit",
      });
      const priceStr = sig.price.toLocaleString();

      if (sig.side === "buy") {
        addLog(
          "模拟",
          `<span class="buy">模拟买入</span> BTC <span class="mono">@ ${priceStr}</span>`,
        );
        setTrades((prev) =>
          [
            {
              time: timeStr,
              dir: "买入" as const,
              price: priceStr,
              qty: sig.qty.toFixed(3),
              pnl: "持仓中",
              trigger: sig.trigger,
              isBuy: true,
              isUp: true,
              isPending: true,
            },
            ...prev,
          ].slice(0, 20),
        );
      } else {
        const pnlPct = sig.pnlPct ?? 0;
        const pnlStr = `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(1)}%`;
        const isUp = pnlPct >= 0;
        addLog(
          "模拟",
          `<span class="sell">模拟卖出</span> <span class="${isUp ? "buy" : "sell"}">${pnlStr}</span>`,
        );
        setTrades((prev) => {
          const updated = [...prev];
          const openIdx = updated.findIndex((t) => t.isPending && t.isBuy);
          if (openIdx !== -1)
            updated[openIdx] = {
              ...updated[openIdx],
              pnl: pnlStr,
              isPending: false,
              isUp,
            };
          return [
            {
              time: timeStr,
              dir: "卖出" as const,
              price: priceStr,
              qty: sig.qty.toFixed(3),
              pnl: pnlStr,
              trigger: sig.trigger,
              isBuy: false,
              isUp,
              isPending: false,
            },
            ...updated,
          ].slice(0, 20);
        });
      }
    },
    [activeStrategyId, setStrategyState, addLog],
  );

  const handleMetrics = useCallback((m: PaperMetrics) => setMetrics(m), []);

  usePaperStream(activeStrategyId, isRunning, {
    onOpen: () => setStreamOk(true),
    onClose: () => setStreamOk(false),
    onError: () => setStreamOk(false),
    onTick: handleTick,
    onSignal: handleSignal,
    onMetrics: handleMetrics,
  });

  // Redraw on state change (pause/done/resume)
  useEffect(() => {
    if (state?.paperPts && state.paperPts.length > 1) {
      redraw(state.paperPts, state.paperSigs);
    }
  }, [state, isPaused, isDone, redraw]);

  // ── Derived values ────────────────────────────────────────────────────────────
  const latestEquity = state?.paperPts?.[state.paperPts.length - 1] ?? 0;
  const equityPct =
    metrics?.equityPct ?? parseFloat((latestEquity * 0.4).toFixed(1));
  const maxDrawdown = metrics?.maxDrawdownPct ?? 0;
  const winRate = metrics?.winRate ?? 0;
  const tradeCount =
    metrics?.tradeCount ?? trades.filter((t) => !t.isPending).length;
  const slippage = metrics?.slippage ?? 0.07;
  const sharpe = metrics?.sharpe ?? 0;
  const hasOpen = trades.some((t) => t.isPending && t.isBuy);

  const planMs = planDays * 86_400_000;
  const elapsedMs = startTime > 0 ? Math.max(0, now - startTime) : 0;
  const remainingMs = endTime > 0 ? Math.max(0, endTime - now) : 0;
  const progressPct =
    endTime > 0 && startTime > 0
      ? Math.min(100, (elapsedMs / planMs) * 100)
      : 0;

  // ── Start handler (writes startTime/endTime to store) ────────────────────────
  const handleStart = (days: PaperPlanDays) => {
    const start = Date.now();
    const end = start + days * 86_400_000;
    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, paper: "running" },
      paperPts: [],
      paperSigs: [],
      paperRef: [],
      paperPlanDays: days,
      paperStartTime: start,
      paperEndTime: end,
    });
    addLog(
      "模拟",
      `<span class="hi">引擎启动</span> · 计划运行 ${days}天 · 结束于 ${fmtDate(end)}`,
    );
  };

  // ── Plan selector (shown before starting) ────────────────────────────────────
  if (isReady) {
    const effectiveDays = isCustom ? customDays : planDays;
    const previewEnd = Date.now() + effectiveDays * 86_400_000;

    return (
      <div className="flex flex-col gap-3 flex-1">
        {/* Account notice — single quiet line */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-violet-500/8 border border-violet-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 flex-shrink-0" />
          <span className="font-mono text-[10px] text-violet-400">
            模拟账户 · 虚拟资金 ¥100,000 · 真实行情 · 零风险
          </span>
        </div>

        {/* Main card */}
        <div className="bg-card border border-border/50 rounded-xl p-4 shadow-sm flex flex-col gap-4">
          {/* Duration label + pill selector in one row */}
          <div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2.5 font-medium uppercase">
              模拟时长
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {PLAN_PRESETS.map((opt) => {
                const active = !isCustom && planDays === opt.days;
                return (
                  <button
                    key={opt.days}
                    onClick={() => {
                      setIsCustom(false);
                      setPaperPlan(activeStrategyId, opt.days as PaperPlanDays);
                    }}
                    className={cn(
                      "relative h-8 px-3.5 rounded-full border font-mono text-[11px] font-medium transition-all",
                      active
                        ? "bg-violet-500 border-violet-500 text-white"
                        : "bg-muted/40 border-border/60 text-muted-foreground hover:border-violet-500/50 hover:text-foreground",
                    )}
                  >
                    {opt.label}
                    {opt.recommended && !active && (
                      <span className="absolute -top-1.5 -right-1 text-[7px] px-1 rounded-full bg-violet-500 text-white leading-tight">
                        荐
                      </span>
                    )}
                  </button>
                );
              })}
              <button
                onClick={() => setIsCustom(true)}
                className={cn(
                  "h-8 px-3.5 rounded-full border font-mono text-[11px] font-medium transition-all",
                  isCustom
                    ? "bg-violet-500 border-violet-500 text-white"
                    : "bg-muted/40 border-border/60 text-muted-foreground hover:border-violet-500/50 hover:text-foreground",
                )}
              >
                自定义
              </button>
            </div>
          </div>

          {/* Single slider — always visible, drives both preset and custom */}
          <div className="flex flex-col gap-2">
            <input
              type="range"
              min={3}
              max={90}
              step={1}
              value={effectiveDays}
              onChange={(e) => {
                const v = parseInt(e.target.value);
                setIsCustom(true);
                setCustomDays(v);
              }}
              className="w-full accent-violet-500 cursor-pointer"
            />
            <div className="flex justify-between font-mono text-[10px]">
              <span className="text-violet-500 font-medium">现在</span>
              <span className="text-muted-foreground/70">
                {effectiveDays} 天 · 结束于 {fmtEndDate(previewEnd)}
              </span>
            </div>
          </div>

          {/* Start button */}
          <Button
            onClick={() => handleStart(effectiveDays as PaperPlanDays)}
            className="w-full h-10 bg-violet-500/10 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white font-mono text-[11px] font-medium"
            variant="outline"
          >
            &#9654; 开始 {effectiveDays} 天模拟交易
          </Button>
        </div>
      </div>
    );
  }

  // ── Running / Paused / Done ───────────────────────────────────────────────────
  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Notice */}
      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/25 text-sm">
        <strong className="text-violet-500">&#128203; 模拟账户</strong>
        <span className="text-foreground">
          {" "}
          · 虚拟资金 ¥100,000 · 真实行情信号 · 零资金风险
        </span>
        {isRunning && (
          <span
            className={`ml-2 font-mono text-[10px] ${streamOk ? "text-emerald-500" : "text-amber-500"}`}
          >
            {streamOk ? "● 数据流已连接" : "○ 连接中..."}
          </span>
        )}
      </div>

      {/* View-only banner */}
      {viewOnly && viewOnlyReason === "live" && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center gap-2">
          <span className="text-red-500 text-[11px]">&#9888;</span>
          <span className="font-mono text-[10px] text-red-500">
            实盘运行中 · 模拟数据仅供查看 · 需修改策略请先终止实盘，再点击「🔧
            优化此策略」
          </span>
        </div>
      )}

      {/* Paused banner */}
      {isPaused && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 border-l-[3px] border-l-amber-500">
          <div className="text-sm font-medium text-amber-500 mb-0.5">
            &#9208; 模拟已暂停
          </div>
          <div className="text-[11px] text-amber-500/80">
            信号检测已暂停，<strong>虚拟持仓保持不动</strong>
            ，数据流已断开，可随时继续。
          </div>
        </div>
      )}

      {/* Plan progress bar */}
      {(isRunning || isPaused || isDone) && startTime > 0 && (
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[9px] text-muted-foreground font-medium">
              模拟计划 · {planDays}天
            </div>
            <div
              className={`font-mono text-[9px] font-medium ${isDone ? "text-muted-foreground" : remainingMs < 86_400_000 ? "text-amber-500" : "text-violet-500"}`}
            >
              {isDone ? "已结束" : fmtRemaining(remainingMs)}
            </div>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isDone ? "bg-emerald-500" : "bg-gradient-to-r from-violet-500 to-violet-400"}`}
              style={{ width: `${isDone ? 100 : progressPct}%` }}
            />
          </div>
          <div className="flex justify-between font-mono text-[9px] text-muted-foreground mt-1.5">
            <span>{fmtDate(startTime)}</span>
            <span className="text-[9px] text-muted-foreground/60">
              {Math.round(progressPct)}%
            </span>
            <span>{fmtDate(endTime)}</span>
          </div>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card border border-violet-500/30 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            模拟收益
          </div>
          <div
            className={`font-mono text-xl font-semibold ${equityPct >= 0 ? "text-violet-500" : "text-red-500"}`}
          >
            {equityPct >= 0 ? "+" : ""}
            {equityPct.toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            虚拟资金 · {isDone ? "已结束" : `${planDays}天计划`}
          </div>
        </div>
        <div
          className={`bg-card border rounded-xl p-3 shadow-sm ${isPaused ? "border-amber-500/20" : "border-border/50"}`}
        >
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            当前持仓
          </div>
          <div className="font-mono text-xl font-semibold text-foreground">
            {hasOpen ? "BTC 0.012" : "空仓"}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {hasOpen
              ? `成本 83,940 · 浮盈 ${equityPct >= 0 ? "+" : ""}${Math.round(equityPct * 100)}¥`
              : "等待信号"}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider font-medium uppercase">
            模拟净值 —{" "}
            {startTime > 0
              ? `${fmtDate(startTime)} → ${fmtDate(endTime)}`
              : "实时行情（虚拟资金）"}
          </span>
          <span
            className={`font-mono text-[10px] font-medium ${isDone ? "text-muted-foreground" : isPaused ? "text-amber-500" : "text-violet-500"}`}
          >
            {isDone
              ? "&#128193; 已结束"
              : isPaused
                ? "&#9208; 暂停中"
                : "● PAPER"}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[140px] rounded-lg bg-card"
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            最大回撤
          </div>
          <div className="font-mono text-xl font-semibold text-red-500">
            -{maxDrawdown.toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">模拟期间</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            已执行
          </div>
          <div className="font-mono text-xl font-semibold text-foreground">
            {tradeCount}笔
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {tradeCount > 0 ? `胜率 ${winRate}%` : "等待成交"}
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            滑点
          </div>
          <div className="font-mono text-xl font-semibold text-cyan-500">
            {slippage.toFixed(2)}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">正常范围</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            夏普比率
          </div>
          <div className="font-mono text-xl font-semibold text-cyan-500">
            {sharpe.toFixed(2)}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {isDone ? "模拟完成" : isPaused ? "持仓保留中" : "实时更新"}
          </div>
        </div>
      </div>

      {/* Trades table */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
          {isDone ? "模拟成交记录" : "模拟订单（实时）"}
        </div>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {["时间", "方向", "价格", "数量", "盈亏", "触发条件"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td
                    className="px-2.5 py-3 font-mono text-[11px] text-muted-foreground"
                    colSpan={6}
                  >
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      等待信号触发...
                    </span>
                  </td>
                </tr>
              ) : (
                trades.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-muted/30 hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">
                      {row.time}
                    </td>
                    <td
                      className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isBuy ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {row.dir}
                    </td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">
                      {row.price}
                    </td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">
                      {row.qty}
                    </td>
                    <td
                      className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isPending ? "text-muted-foreground" : row.isUp ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {row.pnl}
                    </td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                      {row.trigger}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 优化此策略 */}
      {onClone && (
        <div className="flex">
          <Button
            onClick={onClone}
            className="flex-1 h-9 bg-muted border border-border/60 text-muted-foreground hover:border-violet-500 hover:text-violet-500 font-mono text-[11px] font-medium"
            variant="outline"
          >
            🔧 优化此策略
          </Button>
        </div>
      )}

      {/* Operational buttons */}
      {!readOnly && !viewOnly && (
        <div className="flex gap-2.5">
          {isDone ? (
            <Button
              onClick={onStartLive}
              className="flex-1 h-10 bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono text-[11px] font-medium"
              variant="outline"
            >
              &#9888; 启动实盘 — 使用真实资金，请谨慎
            </Button>
          ) : isPaused ? (
            <>
              <Button
                onClick={() => {
                  setStrategyState(activeStrategyId, {
                    stages: { ...state.stages, paper: "running" },
                  });
                  addLog("模拟", '<span class="hi">已恢复</span>');
                }}
                className="flex-1 h-10 bg-violet-500/10 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9654; 继续运行
              </Button>
              <Button
                onClick={() => {
                  setStrategyState(activeStrategyId, {
                    stages: { ...state.stages, paper: "done", live: "ready" },
                    paperDone: true,
                  });
                  addLog(
                    "模拟",
                    `<span class="hi">已结束</span> · ${tradeCount}笔`,
                  );
                }}
                className="flex-1 h-10 bg-muted border border-muted-foreground/30 text-muted-foreground hover:border-violet-500 hover:text-violet-500 font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9632; 结束模拟
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => {
                  setStrategyState(activeStrategyId, {
                    stages: { ...state.stages, paper: "paused" },
                  });
                  addLog(
                    "模拟",
                    '<span class="warn">已暂停</span>，虚拟持仓保持',
                  );
                }}
                className="flex-1 h-10 bg-muted border border-muted-foreground/30 text-muted-foreground hover:border-amber-500 hover:text-amber-500 font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9208; 暂停模拟
              </Button>
              <Button
                onClick={() => {
                  setStrategyState(activeStrategyId, {
                    stages: { ...state.stages, paper: "done", live: "ready" },
                    paperDone: true,
                  });
                  addLog(
                    "模拟",
                    `<span class="hi">已结束</span> · ${tradeCount}笔`,
                  );
                }}
                className="flex-1 h-10 bg-violet-500/10 border border-violet-500/50 text-violet-500 hover:bg-violet-500 hover:text-white font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9632; 结束并进入实盘
              </Button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
