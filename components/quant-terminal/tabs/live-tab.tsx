"use client";

import { useEffect, useRef, useState } from "react";
import { useQuantTerminalStore } from "../store";
import { Button } from "@/components/ui/button";
import { drawLiveChart } from "../chart-utils";

interface LiveTabProps {
  onClone?: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop?: () => void;
  onRestart?: () => void;
  onArchive?: () => void;
  readOnly?: boolean;
}

export function LiveTab({
  onPause,
  onResume,
  onStop,
  onRestart,
  onArchive,
  readOnly,
  onClone,
}: LiveTabProps) {
  const { activeStrategyId, strategyStates, strategies, syncTickers } =
    useQuantTerminalStore();

  const state = strategyStates[activeStrategyId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startTimeRef = useRef<number>(Date.now());
  const [streamOk, setStreamOk] = useState(false);

  const isRunning = state?.stages.live === "running";
  const isPaused = state?.stages.live === "paused";
  const isStopped = state?.stages.live === "stopped";
  const isArchived = state?.stages.live === "done";

  // Ensure the global ticker is running whenever this strategy is in "running" state.
  // syncTickers() is idempotent — safe to call on every render cycle.
  useEffect(() => {
    syncTickers();
    if (isRunning) {
      setStreamOk(true);
    } else {
      setStreamOk(false);
    }
  }, [isRunning, activeStrategyId, syncTickers]);

  // Redraw canvas whenever pts change (driven by the global ticker writing to store)
  useEffect(() => {
    if (canvasRef.current && state?.livePts.length) {
      drawLiveChart(
        canvasRef.current,
        state.livePts,
        state.liveSigs,
        startTimeRef.current,
        300,
      );
    }
  }, [state?.livePts, state?.liveSigs, isPaused, isArchived, isStopped]);

  const latestPt = state?.livePts[state.livePts.length - 1] || 0;
  const floatPnl = Math.round(latestPt * 80);

  // Pull live return directly from strategies list (updated atomically by store ticker)
  const liveStrategy = strategies.find((s) => s.id === activeStrategyId);
  const liveReturnDisplay = liveStrategy?.liveResult || "+0.0%";

  const holdingLabel = isStopped ? "已清仓" : "BTC 0.012";
  const holdingSubLabel = isStopped
    ? "所有持仓已于终止时平仓"
    : isPaused
      ? `持仓保留 · 成本 83,940 · 浮盈 ${floatPnl >= 0 ? "+" : ""}${floatPnl}¥`
      : `成本 83,940 · 浮盈 ${floatPnl >= 0 ? "+" : ""}${floatPnl}¥`;

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Stream connection banner */}
      {isRunning && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25">
          <span
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${streamOk ? "bg-emerald-500 animate-pulse" : "bg-amber-500 animate-pulse"}`}
          />
          <span
            className={`font-mono text-[10px] font-medium ${streamOk ? "text-emerald-500" : "text-amber-500"}`}
          >
            {streamOk ? "数据流已连接 · 实时报价接入中" : "连接中..."}
          </span>
          {streamOk && (
            <span className="ml-auto font-mono text-[9px] text-emerald-500/60">
              300ms tick
            </span>
          )}
        </div>
      )}

      {/* Status banners */}
      {isPaused && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 border-l-[3px] border-l-amber-500">
          <div className="text-sm font-medium text-amber-500 mb-0.5">
            &#9208; 策略已暂停
          </div>
          <div className="text-[11px] text-amber-500/80">
            策略信号检测已停止，<strong>持仓保持不动</strong>
            ，资金仍在市场中，可随时重启继续运行。
          </div>
        </div>
      )}
      {isStopped && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 border-l-[3px] border-l-red-500">
          <div className="text-sm font-medium text-red-500 mb-0.5">
            &#9632; 策略已终止
          </div>
          <div className="text-[11px] text-red-500/80">
            所有持仓已强制平仓，资金已退回账户。可重启开启新一轮运行，或归档彻底结束此策略生命周期。
          </div>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card border border-emerald-500/30 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            实盘累计收益
          </div>
          <div
            className={`font-mono text-xl font-semibold ${liveReturnDisplay.startsWith("+") ? "text-emerald-500" : "text-red-500"}`}
          >
            {liveReturnDisplay}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {isStopped ? "终止时收益" : isPaused ? "暂停时收益" : "实时更新"}
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            当前持仓
          </div>
          <div className="font-mono text-sm font-semibold text-foreground">
            {holdingLabel}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {holdingSubLabel}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full h-[140px] rounded-lg bg-card"
        />
        {isStopped && (
          <div className="absolute inset-0 top-6 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center pointer-events-none">
            <span className="font-mono text-[10px] text-red-500/50 tracking-widest uppercase">
              已平仓 · 数据冻结
            </span>
          </div>
        )}
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            最大回撤
          </div>
          <div className="font-mono text-xl font-semibold text-red-500">
            -3.1%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            低于止损线
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            已执行
          </div>
          <div className="font-mono text-xl font-semibold text-foreground">
            18笔
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">胜率 61%</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            夏普比率
          </div>
          <div className="font-mono text-xl font-semibold text-cyan-500">
            1.74
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            风险调整后
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            引擎
          </div>
          <div
            className={`font-mono text-xs font-semibold ${isStopped ? "text-red-500" : isPaused ? "text-amber-500" : "text-emerald-500"}`}
            dangerouslySetInnerHTML={{
              __html: isStopped
                ? "&#9632; 已停止"
                : isPaused
                  ? "&#9208; 暂停"
                  : "● 运行中",
            }}
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {isStopped ? "已强制平仓" : isPaused ? "持仓保留中" : "4h 检测"}
          </div>
        </div>
      </div>

      {/* Recent trades */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
          最近成交
        </div>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {["时间", "方向", "价格", "盈亏"].map((h) => (
                  <th
                    key={h}
                    className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                {
                  time: "03-22 09:42",
                  dir: "买入",
                  price: "83,940",
                  pnl: isStopped ? "已平仓" : "持仓中",
                  isBuy: true,
                  isPending: !isStopped,
                  isUp: true,
                },
                {
                  time: "03-19 14:10",
                  dir: "卖出",
                  price: "85,140",
                  pnl: "+¥342",
                  isBuy: false,
                  isPending: false,
                  isUp: true,
                },
                {
                  time: "03-15 08:20",
                  dir: "买入",
                  price: "80,820",
                  pnl: "—",
                  isBuy: true,
                  isPending: true,
                  isUp: true,
                },
                {
                  time: "03-12 11:00",
                  dir: "卖出",
                  price: "79,180",
                  pnl: "-¥204",
                  isBuy: false,
                  isPending: false,
                  isUp: false,
                },
              ].map((row, i) => (
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
                  <td
                    className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isPending ? "text-muted-foreground" : row.isUp ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {row.pnl}
                  </td>
                </tr>
              ))}
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
      {!readOnly && (
        <div className="flex gap-2.5">
          {isStopped ? (
            <>
              <Button
                onClick={onRestart}
                className="flex-1 h-10 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9654; 重启运行
              </Button>
              <Button
                onClick={onArchive}
                className="flex-1 h-10 bg-muted border border-muted-foreground/30 text-muted-foreground hover:border-muted-foreground hover:text-foreground font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#128193; 归档结束
              </Button>
            </>
          ) : isPaused ? (
            <>
              <Button
                onClick={onResume}
                className="flex-1 h-10 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9654; 重新启动
              </Button>
              <Button
                onClick={onStop}
                className="flex-1 h-10 bg-red-500/10 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9632; 终止策略
              </Button>
            </>
          ) : (
            <Button
              onClick={onPause}
              className="flex-1 h-10 bg-muted border border-muted-foreground/30 text-muted-foreground hover:border-amber-500 hover:text-amber-500 font-mono text-[11px] font-medium"
              variant="outline"
            >
              &#9208; 暂停策略运行
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
