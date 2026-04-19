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

  // Viewport for zoom/pan (same pattern as paper-tab)
  const DEFAULT_WINDOW = 80;
  const viewStartRef = useRef(0);
  const viewEndRef = useRef(0);
  const isLiveViewRef = useRef(true);
  const [isLiveView, setIsLiveView] = useState(true);
  const dragRef = useRef<{
    startX: number;
    startVS: number;
    startVE: number;
  } | null>(null);

  // Crosshair tooltip
  interface LiveTooltipData {
    x: number;
    canvasWidth: number;
    time: string;
    returnPct: string;
    price: string;
    signal?: "buy" | "sell";
  }
  const [tooltip, setTooltip] = useState<LiveTooltipData | null>(null);
  const startTimeRef2 = useRef<number>(Date.now());

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

  // Advance live viewport to show latest DEFAULT_WINDOW pts
  const advanceLiveViewport = (totalPts: number) => {
    viewEndRef.current = totalPts - 1;
    viewStartRef.current = Math.max(0, totalPts - 1 - DEFAULT_WINDOW);
  };

  // Redraw helper respecting current viewport
  const redrawLive = (pts: number[], sigs: typeof state.liveSigs) => {
    if (!canvasRef.current || pts.length < 2) return;
    const vStart = viewStartRef.current;
    const vEnd = Math.min(viewEndRef.current, pts.length - 1);
    const sliced = pts.slice(vStart, vEnd + 1);
    const slicedSigs = sigs
      .filter((s) => s.i >= vStart && s.i <= vEnd)
      .map((s) => ({ ...s, i: s.i - vStart }));
    drawLiveChart(canvasRef.current, sliced, slicedSigs, undefined, 300);
  };

  // Reset viewport whenever the active strategy changes
  useEffect(() => {
    viewStartRef.current = 0;
    viewEndRef.current = 0;
    isLiveViewRef.current = true;
    setIsLiveView(true);
    setTooltip(null);
  }, [activeStrategyId]);

  // Redraw canvas whenever pts change
  useEffect(() => {
    const pts = state?.livePts;
    if (!pts?.length) return;
    if (isLiveViewRef.current) advanceLiveViewport(pts.length);
    redrawLive(pts, state.liveSigs);
  }, [
    state?.livePts,
    state?.liveSigs,
    isPaused,
    isArchived,
    isStopped,
    activeStrategyId,
  ]); // eslint-disable-line

  // Redraw canvas on window resize (triggered by drag handle)
  useEffect(() => {
    const onResize = () => {
      const cur =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId];
      if (cur?.livePts?.length) {
        if (isLiveViewRef.current) advanceLiveViewport(cur.livePts.length);
        redrawLive(cur.livePts, cur.liveSigs);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeStrategyId, advanceLiveViewport]); // eslint-disable-line

  // Wheel + drag zoom/pan
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const PAD_L = 40;
    const PAD_R = 12;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const pts =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId]
          ?.livePts;
      if (!pts || pts.length < 2) return;
      const cW = canvas.getBoundingClientRect().width - PAD_L - PAD_R;
      const span = viewEndRef.current - viewStartRef.current;
      const factor = e.deltaY < 0 ? 1.3 : 0.77;
      const newSpan = Math.min(
        pts.length - 1,
        Math.max(5, Math.round(span / factor)),
      );
      const mouseRatio = Math.max(0, Math.min(1, (e.offsetX - PAD_L) / cW));
      const anchor = viewStartRef.current + Math.round(span * mouseRatio);
      viewStartRef.current = Math.max(
        0,
        anchor - Math.round(newSpan * mouseRatio),
      );
      viewEndRef.current = Math.min(
        pts.length - 1,
        viewStartRef.current + newSpan,
      );
      isLiveViewRef.current = false;
      setIsLiveView(false);
      const sigs =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId]
          ?.liveSigs ?? [];
      redrawLive(pts, sigs);
    };

    const onMouseDown = (e: MouseEvent) => {
      dragRef.current = {
        startX: e.clientX,
        startVS: viewStartRef.current,
        startVE: viewEndRef.current,
      };
      canvas.style.cursor = "grabbing";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const pts =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId]
          ?.livePts;
      if (!pts || pts.length < 2) return;
      const cW = canvas.getBoundingClientRect().width - PAD_L - PAD_R;
      const span = dragRef.current.startVE - dragRef.current.startVS;
      const pxPerPt = cW / Math.max(span, 1);
      const delta = Math.round((dragRef.current.startX - e.clientX) / pxPerPt);
      viewStartRef.current = Math.max(0, dragRef.current.startVS + delta);
      viewEndRef.current = Math.min(
        pts.length - 1,
        dragRef.current.startVE + delta,
      );
      isLiveViewRef.current = false;
      setIsLiveView(false);
      const sigs =
        useQuantTerminalStore.getState().strategyStates[activeStrategyId]
          ?.liveSigs ?? [];
      redrawLive(pts, sigs);
    };

    const onMouseUp = () => {
      dragRef.current = null;
      canvas.style.cursor = "grab";
    };

    canvas.addEventListener("wheel", onWheel, { passive: false });
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.style.cursor = "grab";
    return () => {
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [activeStrategyId]); // eslint-disable-line

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
        {/* Back-to-live button above chart, right aligned */}
        <div className="flex justify-end mb-1.5 h-4">
          {!isLiveView && (
            <button
              onClick={() => {
                isLiveViewRef.current = true;
                setIsLiveView(true);
                const pts = state?.livePts;
                if (pts?.length) {
                  advanceLiveViewport(pts.length);
                  redrawLive(pts, state.liveSigs);
                }
              }}
              className="font-mono text-[10px] font-medium text-amber-500 hover:text-amber-400 transition-colors cursor-pointer bg-transparent border-none p-0"
            >
              ↩ 回到实时
            </button>
          )}
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[140px] rounded-lg bg-card"
          onMouseMove={(e) => {
            const canvas = canvasRef.current;
            if (!canvas || !state?.livePts?.length || !state.liveSigs.length) {
              setTooltip(null);
              return;
            }
            const rect = canvas.getBoundingClientRect();
            const offsetX = e.clientX - rect.left;
            const offsetY = e.clientY - rect.top;
            const PAD_T = 20;
            const PAD_B = 24;
            const PAD_L = 40;
            const PAD_R = 12;
            const H = rect.height;
            const vStart = viewStartRef.current;
            const vEnd = Math.min(viewEndRef.current, state.livePts.length - 1);
            const span = Math.max(vEnd - vStart, 1);
            const drawW = rect.width - PAD_L - PAD_R;
            const cH = H - PAD_T - PAD_B;
            const sliced = state.livePts.slice(vStart, vEnd + 1);
            const mn = Math.min(...sliced) - 1.5;
            const mx = Math.max(...sliced) + 1.5;
            const HIT_R = 14;
            const r = 5;
            const GAP = 8;
            let found: { sig: (typeof state.liveSigs)[0]; x: number } | null =
              null;
            for (const sig of state.liveSigs) {
              if (
                sig.i < vStart ||
                sig.i > vEnd ||
                sig.i >= state.livePts.length
              )
                continue;
              const localIdx = sig.i - vStart;
              const x = PAD_L + (localIdx / span) * drawW;
              const pt = state.livePts[sig.i];
              const lineY = PAD_T + cH - ((pt - mn) / (mx - mn || 1)) * cH;
              const rawTy =
                sig.type === "buy" ? lineY - GAP - r : lineY + GAP + r;
              const ty = Math.max(
                PAD_T + r + 2,
                Math.min(H - PAD_B - r - 2, rawTy),
              );
              if (Math.hypot(offsetX - x, offsetY - ty) <= HIT_R) {
                found = { sig, x };
                break;
              }
            }
            if (!found) {
              setTooltip(null);
              return;
            }
            const pt = state.livePts[found.sig.i];
            const tickMs = 300;
            const totalMs = state.livePts.length * tickMs;
            const liveStart = startTimeRef.current - totalMs;
            const ptMs =
              liveStart +
              (found.sig.i / Math.max(state.livePts.length - 1, 1)) * totalMs;
            const d = new Date(ptMs);
            const pad = (n: number) => String(n).padStart(2, "0");
            const timeStr = `${d.getFullYear()}/${pad(d.getMonth() + 1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
            const price = (84231 + Math.round(pt * 80)).toLocaleString();
            let returnPct = "持仓中";
            if (found.sig.type === "sell") {
              const buyIdx = [...state.liveSigs]
                .reverse()
                .find((s) => s.type === "buy" && s.i < found.sig.i)?.i;
              if (buyIdx !== undefined) {
                const buyPt = state.livePts[buyIdx];
                const pnl = pt - buyPt;
                returnPct = `${pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}%`;
              } else {
                returnPct = `${pt >= 0 ? "+" : ""}${pt.toFixed(2)}%`;
              }
            }
            setTooltip({
              x: found.x,
              canvasWidth: rect.width,
              time: timeStr,
              returnPct,
              price,
              signal: found.sig.type,
            });
          }}
          onMouseLeave={() => setTooltip(null)}
        />
        {/* Signal-point tooltip */}
        {tooltip &&
          (() => {
            const tipW = 148;
            const tipLeft =
              tooltip.x / tooltip.canvasWidth > 0.65
                ? tooltip.x - tipW - 10
                : tooltip.x + 10;
            const isBuy = tooltip.signal === "buy";
            const accent = isBuy
              ? "border-emerald-500/50"
              : "border-red-500/50";
            return (
              <div
                className="absolute z-20 pointer-events-none"
                style={{ left: tipLeft, top: 16 }}
              >
                <div
                  className={`bg-card/95 border ${accent} rounded-lg px-2.5 py-2 shadow-xl backdrop-blur-sm`}
                  style={{ width: tipW }}
                >
                  <div
                    className={`font-mono text-[9px] font-semibold mb-1 ${isBuy ? "text-emerald-500" : "text-red-500"}`}
                  >
                    {isBuy ? "▲ 实盘买入" : "▼ 实盘卖出"}
                  </div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {tooltip.time}
                  </div>
                  <div className="mt-1.5 flex justify-between items-baseline">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      价格
                    </span>
                    <span className="font-mono text-[11px] font-bold text-foreground">
                      {tooltip.price}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline mt-0.5">
                    <span className="font-mono text-[9px] text-muted-foreground">
                      {tooltip.signal === "buy" ? "状态" : "盈亏"}
                    </span>
                    <span
                      className={`font-mono text-[11px] font-bold ${
                        tooltip.returnPct === "持仓中"
                          ? "text-amber-500"
                          : tooltip.returnPct.startsWith("+")
                            ? "text-emerald-500"
                            : "text-red-500"
                      }`}
                    >
                      {tooltip.returnPct}
                    </span>
                  </div>
                </div>
              </div>
            );
          })()}
        {isStopped && (
          <div className="absolute inset-0 top-6 rounded-lg bg-red-500/5 border border-red-500/10 flex items-center justify-center pointer-events-none">
            <span className="font-mono text-[10px] text-red-500/50 tracking-widest uppercase">
              已平仓 · 数据冻结
            </span>
          </div>
        )}
      </div>
      {/* Zoom hints — centered below chart */}
      <div className="flex items-center justify-center gap-1.5 -mt-2">
        <span className="font-mono text-[9px] text-muted-foreground/50">
          滚轮缩放
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/30">·</span>
        <span className="font-mono text-[9px] text-muted-foreground/50">
          拖拽平移
        </span>
        <span className="font-mono text-[9px] text-muted-foreground/30">·</span>
        <span className="font-mono text-[9px] text-muted-foreground/50">
          缩小可找回历史信号点
        </span>
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

      {/* Recent trades — read from immutable signal snapshots, never re-computed */}
      {(() => {
        const sigs = state?.liveSigs ?? [];

        const emptyRow = (
          <tr>
            <td
              className="px-2.5 py-3 font-mono text-[11px] text-muted-foreground"
              colSpan={6}
            >
              <span className="inline-flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                等待信号触发...
              </span>
            </td>
          </tr>
        );

        const rows = !sigs.length
          ? []
          : [...sigs]
              .reverse()
              .slice(0, 10)
              .map((sig) => {
                const isBuy = sig.type === "buy";
                // Use frozen snapshot — price/ts/pnl never changes after signal is written
                const price =
                  sig.price != null ? sig.price.toLocaleString() : "—";
                const d = sig.ts != null ? new Date(sig.ts) : new Date();
                const pad = (n: number) => String(n).padStart(2, "0");
                const timeStr = `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
                const pnl = isBuy
                  ? isStopped
                    ? "已平仓"
                    : "持仓中"
                  : (sig.pnl ?? "—");
                const isPending = isBuy && !isStopped;
                const isUp =
                  !isBuy && sig.pnl != null ? !sig.pnl.startsWith("-") : true;
                const trigger = sig.trigger ?? (isBuy ? "EMA上穿" : "EMA下穿");
                return { timeStr, isBuy, price, pnl, isPending, isUp, trigger };
              });

        return (
          <div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
              {isStopped ? "成交记录" : "最近成交（实时）"}
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
                  {rows.length === 0
                    ? emptyRow
                    : rows.map((row, i) => (
                        <tr
                          key={i}
                          className="border-t border-muted/30 hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">
                            {row.timeStr}
                          </td>
                          <td
                            className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isBuy ? "text-emerald-500" : "text-red-500"}`}
                          >
                            {row.isBuy ? "买入" : "卖出"}
                          </td>
                          <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">
                            {row.price}
                          </td>
                          <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">
                            0.012
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
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}

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
