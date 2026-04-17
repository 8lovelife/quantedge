"use client";

// 📁 components/quant-terminal/tabs/backtest-tab.tsx

import { useEffect, useRef, useCallback } from "react";
import { useQuantTerminalStore } from "../store";
import { Button } from "@/components/ui/button";
import { drawBacktestChart } from "../chart-utils";
import { useBacktest } from "@/lib/api/quant-terminal/backtest/client";
import type { Signal } from "@/lib/api/quant-terminal/backtest/types";

// ── Labels ────────────────────────────────────────────────────────────────────

const RANGE_LABEL: Record<string, string> = {
  "1m": "近1个月",
  "3m": "近3个月",
  "6m": "近6个月",
  "1y": "近1年",
};

// dateRange / basePrice / priceScale 均从 API 结果动态读取
// 开发时由 mock.ts 生成，上线后由后端返回

function ptToPrice(v: number, basePrice: number, priceScale: number): string {
  return Math.round(basePrice + v * priceScale).toLocaleString();
}

function ptToDate(i: number, total: number, btRange: string): string {
  const days: Record<string, number> = {
    "1m": 30,
    "3m": 90,
    "6m": 180,
    "1y": 365,
  };
  const totalDays = days[btRange] ?? 90;
  const msPerPt = (totalDays * 86_400_000) / total;
  const d = new Date(Date.now() - (total - i) * msPerPt);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface BacktestTabProps {
  onStartPaper: () => void;
  onStartBacktest: () => void;
  viewOnly?: boolean;
  viewOnlyReason?: "paper" | "live";
  readOnly?: boolean;
  onClone?: () => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

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
    strategies,
    setStrategyState,
    addLog,
    updateBtResult,
  } = useQuantTerminalStore();

  const state = strategyStates[activeStrategyId];
  const strategy = strategies.find((s) => s.id === activeStrategyId);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isDone = state?.stages.bt === "done";
  const isRunning = state?.stages.bt === "running";
  const btRange = state?.btRange ?? "3m";

  // ── useBacktest hook ───────────────────────────────────────────────────────
  const {
    isRunning: apiRunning,
    progressPct,
    progressMsg,
    partialPts,
    partialSignals,
    result,
    run: runBacktest,
    reset: resetBacktest,
  } = useBacktest();

  // ── 启动回测：调用 API hook ────────────────────────────────────────────────
  const handleStartBacktest = useCallback(() => {
    resetBacktest();
    runBacktest({
      strategyId: activeStrategyId,
      range: btRange,
      asset: strategy?.asset ?? "BTC/USDT",
      timeframe: strategy?.timeframe ?? "4h",
    });
  }, [activeStrategyId, btRange, strategy, runBacktest, resetBacktest]);

  // ── 关键：store stage 变为 running 时自动触发 API hook ────────────────────
  // strategy-panel 调用 onStartBacktest → store.stage = "running"
  // 这里监听到变化后立即启动 runBacktest，不依赖按钮点击
  useEffect(() => {
    if (isRunning && !apiRunning && !result) {
      handleStartBacktest();
    }
  }, [isRunning]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!result) return;

    const metrics = result.metrics;
    const returnStr = `+${metrics.equityPct.toFixed(1)}%`;
    const winRateStr = `${metrics.winRate}%`;

    setStrategyState(activeStrategyId, {
      stages: { ...state.stages, bt: "done", paper: "ready" },
      btDone: true,
      btPts: result.pts,
      btSigs: result.signals,
    });

    updateBtResult(activeStrategyId, returnStr);
    addLog(
      "回测",
      `<span class="hi">完成</span> · ${RANGE_LABEL[btRange]} · 胜率 ${winRateStr}`,
    );
  }, [result]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 画布：运行中动画帧 ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!apiRunning || !canvasRef.current || partialPts.length < 2) return;
    drawBacktestChart(canvasRef.current, partialPts, partialSignals, {
      showAnimation: true,
      currentIndex: partialPts.length - 1,
    });
  }, [apiRunning, partialPts, partialSignals]);

  // ── 画布：完成后静态图表 ───────────────────────────────────────────────────
  useEffect(() => {
    if (!isDone || !canvasRef.current) return;
    const pts = state?.btPts ?? result?.pts ?? [];
    const sigs = state?.btSigs ?? result?.signals ?? [];
    if (pts.length < 2) return;
    drawBacktestChart(canvasRef.current, pts, sigs, {});
  }, [isDone, state?.btPts, state?.btSigs, result]);

  // ── 交易记录 ───────────────────────────────────────────────────────────────
  const tradeRows = (() => {
    const pts = state?.btPts ?? result?.pts ?? [];
    const sigs: Signal[] = state?.btSigs ?? result?.signals ?? [];
    if (!isDone || pts.length === 0 || sigs.length === 0) return [];

    // 从 API 结果读取，fallback 到合理默认值
    const basePrice = result?.basePrice ?? 84231;
    const priceScale = result?.priceScale ?? 80;

    const sorted = [...sigs].sort((a, b) => a.i - b.i);
    const rows: {
      time: string;
      dir: string;
      price: string;
      qty: string;
      pnl: string;
      trigger: string;
      isBuy: boolean;
      isUp: boolean;
    }[] = [];

    for (let k = 0; k < sorted.length; k++) {
      const s = sorted[k];
      const price = ptToPrice(pts[s.i], basePrice, priceScale);
      const time = ptToDate(s.i, pts.length, btRange);

      if (s.type === "buy") {
        rows.push({
          time,
          dir: "买入",
          price,
          qty: "0.012",
          pnl: "—",
          trigger: s.trigger ?? "EMA金叉",
          isBuy: true,
          isUp: true,
        });
      } else {
        const prevBuy = sorted
          .slice(0, k)
          .reverse()
          .find((x) => x.type === "buy");
        let pnl = "—";
        let isUp = true;
        if (prevBuy) {
          const pct =
            pts[prevBuy.i] !== 0
              ? ((pts[s.i] - pts[prevBuy.i]) / Math.abs(pts[prevBuy.i])) * 100
              : 0;
          isUp = pct >= 0;
          pnl = `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`;
        }
        rows.push({
          time,
          dir: "卖出",
          price,
          qty: "0.012",
          pnl,
          trigger: s.trigger ?? (isUp ? "止盈 tp=6%" : "止损 sl=2%"),
          isBuy: false,
          isUp,
        });
      }
    }
    return rows.reverse().slice(0, 8);
  })();

  // ── 指标（优先用 API 结果，降级用 store 静态值）───────────────────────────
  const metrics = result?.metrics;
  const statsGrid = [
    {
      label: "总收益",
      value: metrics ? `+${metrics.equityPct.toFixed(1)}%` : "+34.2%",
      sub: RANGE_LABEL[btRange],
      color: "text-emerald-500",
    },
    {
      label: "稳定性",
      value: metrics ? metrics.sharpe.toFixed(2) : "1.82",
      sub: "夏普比率",
      color: "text-cyan-500",
    },
    {
      label: "最大回撤",
      value: metrics ? `-${metrics.maxDrawdownPct.toFixed(1)}%` : "-8.4%",
      sub: "可控范围",
      color: "text-red-500",
    },
    {
      label: "胜率",
      value: metrics ? `${metrics.winRate}%` : "61.3%",
      sub: `${(state?.btSigs ?? result?.signals ?? []).length}笔`,
      color: "text-foreground",
    },
  ];

  // ── 运行中视图 ─────────────────────────────────────────────────────────────
  if (isRunning || apiRunning) {
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
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-blue-500 min-w-[40px] text-right font-medium">
            {progressPct}%
          </span>
        </div>
        <canvas
          ref={canvasRef}
          className="w-full h-[140px] rounded-lg bg-card"
        />
      </div>
    );
  }

  // ── 完成视图 ───────────────────────────────────────────────────────────────
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

        {/* Stats */}
        <div className="grid grid-cols-4 gap-2.5">
          {statsGrid.map((s, i) => (
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
          <div className="flex items-center justify-between mb-1.5">
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider font-medium uppercase">
              回测净值曲线 — {strategy?.asset ?? "BTC/USDT"} ·{" "}
              {result?.dateRange ?? btRange}
            </div>
          </div>
          <div className="flex gap-3.5 mb-2 text-[10px] font-mono text-muted-foreground">
            <span>
              <span className="text-blue-500">━</span> 策略净值
            </span>
            <span>
              <span className="text-muted-foreground">╌</span> BTC持仓
            </span>
            <span>
              <span className="text-emerald-500">▼</span> 买入
            </span>
            <span>
              <span className="text-red-500">▲</span> 卖出
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
                {tradeRows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-2.5 py-3 font-mono text-[11px] text-muted-foreground"
                    >
                      暂无交易记录
                    </td>
                  </tr>
                ) : (
                  tradeRows.map((row, i) => (
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
                        className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.pnl === "—" ? "text-muted-foreground" : row.isUp ? "text-emerald-500" : "text-red-500"}`}
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

        {/* Actions */}
        <div className="flex gap-2.5">
          {onClone && (
            <Button
              onClick={onClone}
              className="h-10 px-4 bg-muted border border-border/60 text-muted-foreground hover:border-violet-500 hover:text-violet-500 font-mono text-[11px] font-medium"
              variant="outline"
            >
              🔧 优化此策略
            </Button>
          )}
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

  // ── 待回测视图 ─────────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2.5 opacity-50">
      <div className="text-3xl">&#128202;</div>
      <div className="font-mono text-xs text-muted-foreground">尚未回测</div>
      <Button
        onClick={() => {
          onStartBacktest(); // 通知 store stage → running，useEffect 自动接管
        }}
        className="mt-4 h-10 px-6 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-mono text-[11px] font-medium"
        variant="outline"
      >
        &#9654; 开始回测
      </Button>
    </div>
  );
}
