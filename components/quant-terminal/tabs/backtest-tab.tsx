"use client";

import { useEffect, useRef, useState } from "react";
import { useQuantTerminalStore } from "../store";
import { Button } from "@/components/ui/button";
import { drawBacktestChart, generateBacktestData } from "../chart-utils";

// Maps btRange to human label
const RANGE_LABEL: Record<string, string> = {
  "1m": "近1个月",
  "3m": "近3个月",
  "6m": "近6个月",
  "1y": "近1年",
};

// Maps btRange to approximate date spans shown in chart
const RANGE_DATES: Record<string, string> = {
  "1m": "2025-02 ~ 2025-03",
  "3m": "2024-12 ~ 2025-03",
  "6m": "2024-09 ~ 2025-03",
  "1y": "2024-03 ~ 2025-03",
};

interface BacktestTabProps {
  onStartPaper: () => void;
  onStartBacktest: () => void;
  viewOnly?: boolean;
  viewOnlyReason?: "paper" | "live";
  readOnly?: boolean;
  onClone?: () => void;
}

export function BacktestTab({
  onStartPaper,
  onStartBacktest,
  viewOnly,
  viewOnlyReason,
  readOnly,
  onClone,
}: BacktestTabProps) {
  const {
    activeStrategyId,
    strategyStates,
    setStrategyState,
    addLog,
    updateBtResult,
  } = useQuantTerminalStore();
  const state = strategyStates[activeStrategyId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("加载历史数据...");

  const isDone = state?.stages.bt === "done";
  const isRunning = state?.stages.bt === "running";
  const btRange = state?.btRange ?? "3m";

  // Generate data if not exists
  useEffect(() => {
    if (
      state &&
      (!state.btPts.length || !state.btSigs.length) &&
      (isDone || isRunning)
    ) {
      const { pts, sigs } = generateBacktestData();
      setStrategyState(activeStrategyId, { btPts: pts, btSigs: sigs });
    }
  }, [activeStrategyId, state, isDone, isRunning, setStrategyState]);

  // Animation for running state
  useEffect(() => {
    if (!isRunning) return;

    let idx = 0;
    const total = 90;
    let animFrame: number;

    const animate = () => {
      idx = Math.min(idx + 1, total - 1);
      setProgress(Math.round((idx / total) * 100));

      if (idx < 30) setProgressMsg("加载历史数据...");
      else if (idx < 60) setProgressMsg("运行信号检测...");
      else if (idx < 88) setProgressMsg("计算盈亏...");
      else setProgressMsg("生成报告...");

      if (canvasRef.current && state?.btPts.length) {
        const pts = state.btPts.slice(0, idx + 1);
        const sigs = state.btSigs.filter((s) => s.i <= idx);
        drawBacktestChart(canvasRef.current, pts, sigs, {
          showAnimation: true,
          currentIndex: idx,
        });
      }

      if (idx < total - 1) {
        animFrame = requestAnimationFrame(animate);
      } else {
        setStrategyState(activeStrategyId, {
          stages: { ...state.stages, bt: "done", paper: "ready" },
          btDone: true,
        });
        updateBtResult(activeStrategyId, "+34.2%");
        addLog(
          "回测",
          `<span class="hi">完成</span> · ${RANGE_LABEL[btRange]} · 胜率 61.3%`,
        );
      }
    };

    animFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrame);
  }, [isRunning, activeStrategyId, state, setStrategyState, addLog, btRange]);

  // Draw static chart for done state
  useEffect(() => {
    if (isDone && canvasRef.current && state?.btPts.length) {
      drawBacktestChart(canvasRef.current, state.btPts, state.btSigs);
    }
  }, [isDone, state]);

  if (isRunning) {
    return (
      <div className="flex flex-col gap-4 flex-1">
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider font-medium uppercase">
          回测进行中 — {RANGE_LABEL[btRange]}历史K线数据
        </div>
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="font-mono text-[10px] text-muted-foreground min-w-[140px]">
            {progressMsg}
          </span>
          <div className="flex-1 h-1 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-sm transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-blue-500 min-w-[40px] text-right font-medium">
            {progress}%
          </span>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[140px] rounded-lg bg-card"
        />
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="flex flex-col gap-4 flex-1">
        {/* View-only banners */}
        {viewOnly && viewOnlyReason === "paper" && (
          <div className="px-3 py-2 rounded-lg bg-violet-500/10 border border-violet-500/25 flex items-center gap-2">
            <span className="text-violet-500 text-[11px]">&#128203;</span>
            <span className="font-mono text-[10px] text-violet-500">
              模拟交易进行中 · 回测结果仅供参考 ·
              想修改策略请先暂停模拟，然后点击「🔧 优化此策略」
            </span>
          </div>
        )}
        {viewOnly && viewOnlyReason === "live" && (
          <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center gap-2">
            <span className="text-red-500 text-[11px]">&#9888;</span>
            <span className="font-mono text-[10px] text-red-500">
              实盘运行中 · 历史回测数据仅供查看 ·
              需修改策略请先终止实盘，再点击「🔧 优化此策略」
            </span>
          </div>
        )}
        {readOnly && (
          <div className="px-3 py-2 rounded-lg bg-muted/80 border border-border/60 flex items-center gap-2">
            <span className="text-[11px]">&#128193;</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              已归档 · 仅供查看
            </span>
          </div>
        )}

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {[
            {
              label: "总收益",
              value: "+34.2%",
              sub: RANGE_LABEL[btRange],
              color: "text-emerald-500",
            },
            {
              label: "稳定性",
              value: "1.82",
              sub: "夏普比率",
              color: "text-cyan-500",
            },
            {
              label: "最大回撤",
              value: "-8.4%",
              sub: "可控范围",
              color: "text-red-500",
            },
            {
              label: "胜率",
              value: "61.3%",
              sub: "57笔",
              color: "text-foreground",
            },
          ].map((s, i) => (
            <div
              key={i}
              className="bg-card border border-border/50 rounded-xl p-3 shadow-sm"
            >
              <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
                {s.label}
              </div>
              <div className={`font-mono text-xl font-semibold ${s.color}`}>
                {s.value}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">
                {s.sub}
              </div>
            </div>
          ))}
        </div>

        {/* Chart */}
        <div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
            回测净值曲线 — {strategy_asset_display(state)} ·{" "}
            {RANGE_DATES[btRange]}
          </div>
          <div className="flex gap-3.5 mb-2 text-[10px] font-mono text-muted-foreground">
            <span>
              <span className="text-blue-500">━</span> 策略净值
            </span>
            <span>
              <span className="text-muted-foreground">╌</span> BTC持仓
            </span>
            <span>
              <span className="text-emerald-500">●</span> 买入
            </span>
            <span>
              <span className="text-red-500">●</span> 卖出
            </span>
          </div>
          <canvas
            ref={canvasRef}
            className="w-full h-[140px] rounded-lg bg-card"
          />
        </div>

        {/* Trade table */}
        <div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
            回测交易记录
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
                {[
                  {
                    time: "03-19",
                    dir: "卖出",
                    price: "85,210",
                    qty: "0.012",
                    pnl: "+6.0%",
                    trigger: "止盈 tp=6%",
                    isUp: true,
                    isBuy: false,
                  },
                  {
                    time: "03-14",
                    dir: "买入",
                    price: "80,380",
                    qty: "0.012",
                    pnl: "+6.0%",
                    trigger: "EMA金叉+量",
                    isUp: true,
                    isBuy: true,
                  },
                  {
                    time: "03-10",
                    dir: "卖出",
                    price: "79,200",
                    qty: "0.010",
                    pnl: "-2.1%",
                    trigger: "止损 sl=2%",
                    isUp: false,
                    isBuy: false,
                  },
                  {
                    time: "02-28",
                    dir: "卖出",
                    price: "84,100",
                    qty: "0.011",
                    pnl: "+4.8%",
                    trigger: "close<ema(7)",
                    isUp: true,
                    isBuy: false,
                  },
                ].map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-muted/30 hover:bg-muted/30"
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
                      className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isUp ? "text-emerald-500" : "text-red-500"}`}
                    >
                      {row.pnl}
                    </td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-muted-foreground">
                      {row.trigger}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2.5">
          {/* 优化此策略 — always visible when available */}
          {onClone && (
            <Button
              onClick={onClone}
              className="h-10 px-4 bg-muted border border-border/60 text-muted-foreground hover:border-violet-500 hover:text-violet-500 font-mono text-[11px] font-medium"
              variant="outline"
            >
              🔧 优化此策略
            </Button>
          )}
          {/* Start paper — only when bt done and not yet in paper/live */}
          {!viewOnly && !readOnly && (
            <Button
              onClick={onStartPaper}
              className="flex-1 h-10 bg-violet-500/10 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white font-mono text-[11px] font-medium"
              variant="outline"
            >
              &#9654; 开始模拟交易
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Ready state
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2.5 opacity-50">
      <div className="text-3xl">&#128202;</div>
      <div className="font-mono text-xs text-muted-foreground">尚未回测</div>
      <Button
        onClick={onStartBacktest}
        className="mt-4 h-10 px-6 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-mono text-[11px] font-medium"
        variant="outline"
      >
        &#9654; 开始回测
      </Button>
    </div>
  );
}

// Helper — pull asset string from state context via strategy info
function strategy_asset_display(state: any): string {
  return state?.parsedParams?.asset ?? "BTC/USDT 4h";
}
