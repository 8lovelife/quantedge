"use client";

import { useEffect, useRef } from "react";
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
  const {
    activeStrategyId,
    strategyStates,
    setStrategyState,
    addLog,
    setBtcPrice,
  } = useQuantTerminalStore();
  const state = strategyStates[activeStrategyId];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const isRunning = state?.stages.live === "running";
  const isPaused = state?.stages.live === "paused";
  const isStopped = state?.stages.live === "stopped";
  const isArchived = state?.stages.live === "done";

  // Initialize live data
  useEffect(() => {
    if (isRunning && !state.livePts.length) {
      const pts: number[] = [];
      let v = 0;
      for (let i = 0; i < 20; i++) {
        v += (Math.random() - 0.44) * 1.2 + 0.2;
        pts.push(v);
      }
      setStrategyState(activeStrategyId, { livePts: pts, liveSigs: [] });
    }
  }, [isRunning, activeStrategyId, state, setStrategyState]);

  // Live animation
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const currentState =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId];
      if (currentState.stages.live !== "running") return;

      const pts = [...currentState.livePts];
      const sigs = [...currentState.liveSigs];
      const last = pts[pts.length - 1];
      const nv = last + (Math.random() - 0.46) * 1.4 + 0.15;
      pts.push(nv);
      if (pts.length > 120) pts.shift();

      if (pts.length > 5) {
        const delta = pts[pts.length - 1] - pts[pts.length - 4];
        if (
          delta > 1.8 &&
          (sigs.length === 0 || sigs[sigs.length - 1].type === "sell")
        ) {
          sigs.push({ i: pts.length - 1, type: "buy" });
          addLog(
            "实盘",
            `<span class="buy">买入</span> BTC <span class="mono">@ ${(83000 + Math.round(nv * 200)).toLocaleString()}</span>`,
          );
        }
        if (
          delta < -1.3 &&
          sigs.length > 0 &&
          sigs[sigs.length - 1].type === "buy"
        ) {
          sigs.push({ i: pts.length - 1, type: "sell" });
          addLog(
            "实盘",
            `<span class="sell">卖出</span> <span class="${nv > last ? "buy" : "sell"}">${nv > last ? "+" : ""}${Math.round(Math.abs(delta) * 1.2)}%</span>`,
          );
        }
      }

      setBtcPrice(84231 + Math.round(nv * 80));
      setStrategyState(activeStrategyId, { livePts: pts, liveSigs: sigs });

      if (canvasRef.current) {
        drawLiveChart(canvasRef.current, pts, sigs);
      }
    }, 300);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, activeStrategyId, setStrategyState, addLog, setBtcPrice]);

  useEffect(() => {
    if (canvasRef.current && state?.livePts.length) {
      drawLiveChart(canvasRef.current, state.livePts, state.liveSigs);
    }
  }, [state, isPaused, isArchived, isStopped]);

  const latestPt = state?.livePts[state.livePts.length - 1] || 0;
  const floatPnl = Math.round(latestPt * 80);

  // Derive display values based on state
  const holdingLabel = isStopped ? "已清仓" : "BTC 0.012";
  const holdingSubLabel = isStopped
    ? "所有持仓已于终止时平仓"
    : isPaused
      ? `持仓保留 · 成本 83,940 · 浮盈 ${floatPnl >= 0 ? "+" : ""}${floatPnl}¥`
      : `成本 83,940 · 浮盈 ${floatPnl >= 0 ? "+" : ""}${floatPnl}¥`;

  return (
    <div className="flex flex-col gap-4 flex-1">
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
            本月实盘收益
          </div>
          <div className="font-mono text-xl font-semibold text-emerald-500">
            +12.4%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            ¥5,952 实际盈利
          </div>
        </div>
        <div
          className={`bg-card border rounded-xl p-3 shadow-sm ${isStopped ? "border-red-500/20" : isPaused ? "border-amber-500/20" : "border-border/50"}`}
        >
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">
            当前持仓
          </div>
          <div
            className={`font-mono text-xl font-semibold ${isStopped ? "text-red-500" : "text-foreground"}`}
          >
            {holdingLabel}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {holdingSubLabel}
          </div>
        </div>
      </div>

      {/* Chart — always show (freeze when stopped/archived) */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider font-medium uppercase">
            实盘净值 —{" "}
            {isStopped ? "终止时快照" : isArchived ? "归档快照" : "实时账户"}
          </span>
          <span
            className={`font-mono text-[10px] font-medium ${
              isStopped
                ? "text-red-500"
                : isArchived
                  ? "text-muted-foreground"
                  : isPaused
                    ? "text-amber-500"
                    : "text-emerald-500"
            }`}
          >
            {isStopped
              ? "&#9632; 已终止"
              : isArchived
                ? "&#128193; 已归档"
                : isPaused
                  ? "&#9208; 暂停中"
                  : "● LIVE"}
          </span>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[140px] rounded-lg bg-card"
        />
        {/* Frozen overlay for stopped state */}
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
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">
                  时间
                </th>
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">
                  方向
                </th>
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">
                  价格
                </th>
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">
                  盈亏
                </th>
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

      {/* 优化此策略 — always visible in a fixed row when available */}
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
      {/* Operational buttons — hidden when archived (read-only) */}
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
