// 📁 lib/api/quant-terminal/backtest/mock.ts
// ─── Backtest Mock — lib 层数据模拟 ──────────────────────────────────────────
// 当 app/api 后端不可用时，client.ts 自动降级到这里的 mock 实现。
// 上线后删除此文件，client.ts 会直接调用真实后端。

import type {
  BtRange,
  BacktestResultResponse,
  BacktestProgressEvent,
  BacktestCompleteEvent,
  Signal,
  TradeRecord,
  Metrics,
} from "./types";

// ── 配置 ──────────────────────────────────────────────────────────────────────

const BASE_PRICE = 84231;

const RANGE_PTS: Record<BtRange, number> = {
  "1m": 90,
  "3m": 180,
  "6m": 360,
  "1y": 720,
};

const RANGE_DAYS: Record<BtRange, number> = {
  "1m": 30,
  "3m": 90,
  "6m": 180,
  "1y": 365,
};

// 每次调用都基于当前日期动态生成，保证和真实时间一致
function buildDateRange(range: BtRange): string {
  const now = new Date();
  const days = RANGE_DAYS[range];
  const start = new Date(now.getTime() - days * 86_400_000);
  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(start)} ~ ${fmt(now)}`;
}

// basePrice 模拟实时行情：基于当天日期做微小随机偏移，同一天内保持一致
function buildBasePrice(): number {
  const seed = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return 80000 + (parseInt(seed) % 10000);
}

const PRICE_SCALE = 80; // pts 单位 → 价格偏移（与 chart-utils 一致）

const PROGRESS_STEPS = [
  { pct: 10, msg: "加载历史数据..." },
  { pct: 25, msg: "计算技术指标..." },
  { pct: 40, msg: "运行 EMA 策略..." },
  { pct: 55, msg: "检测买卖信号..." },
  { pct: 70, msg: "计算最大回撤..." },
  { pct: 82, msg: "统计胜率..." },
  { pct: 91, msg: "生成净值曲线..." },
  { pct: 97, msg: "计算夏普比率..." },
  { pct: 100, msg: "完成" },
];

// ── 价格曲线生成 ───────────────────────────────────────────────────────────────

function generatePts(count: number): { pts: number[]; benchmarkPts: number[] } {
  const pts: number[] = [];
  const benchmarkPts: number[] = [];
  let v = 0;
  let bench = 0;

  for (let i = 0; i < count; i++) {
    const phase = Math.sin(i / 30) * 0.3;
    v += (Math.random() - 0.44) * 2.0 + 0.25 + phase;
    pts.push(parseFloat(v.toFixed(3)));

    bench += (Math.random() - 0.47) * 1.5 + 0.18;
    benchmarkPts.push(parseFloat(bench.toFixed(3)));
  }
  return { pts, benchmarkPts };
}

// ── 信号检测 ──────────────────────────────────────────────────────────────────

function detectSignals(
  pts: number[],
  startTs: number,
  msPerPt: number,
): { signals: Signal[]; trades: TradeRecord[]; wins: number; losses: number } {
  const signals: Signal[] = [];
  const trades: TradeRecord[] = [];
  let wins = 0;
  let losses = 0;
  let openBuyIdx: number | null = null;
  let openBuyPrice = 0;

  for (let i = 5; i < pts.length - 1; i++) {
    const delta = pts[i] - pts[i - 4];
    const price = Math.round(BASE_PRICE + pts[i] * PRICE_SCALE);
    const ts = startTs + i * msPerPt;

    if (delta > 1.8 && openBuyIdx === null) {
      signals.push({ i, type: "buy", price, ts, trigger: "EMA金叉" });
      trades.push({ ts, side: "buy", price, qty: 0.012, trigger: "EMA金叉" });
      openBuyIdx = i;
      openBuyPrice = price;
    } else if (delta < -1.3 && openBuyIdx !== null) {
      const pnlPct = parseFloat(
        (((price - openBuyPrice) / openBuyPrice) * 100).toFixed(2),
      );
      const pnlStr = `${pnlPct >= 0 ? "+" : ""}${pnlPct.toFixed(2)}%`;
      const trigger = pnlPct > 0 ? "止盈 tp=6%" : "止损 sl=2%";
      signals.push({ i, type: "sell", price, ts, pnl: pnlStr, trigger });
      trades.push({ ts, side: "sell", price, qty: 0.012, pnlPct, trigger });
      if (pnlPct > 0) wins++;
      else losses++;
      openBuyIdx = null;
    }
  }
  return { signals, trades, wins, losses };
}

// ── 指标计算 ──────────────────────────────────────────────────────────────────

function buildMetrics(pts: number[], wins: number, losses: number): Metrics {
  const total = wins + losses;
  const finalEquity = pts[pts.length - 1];
  const maxPt = Math.max(...pts);
  const minAfterMax = Math.min(...pts.slice(pts.indexOf(maxPt)));
  const maxDrawdown =
    maxPt > 0
      ? parseFloat((((maxPt - minAfterMax) / Math.abs(maxPt)) * 100).toFixed(1))
      : 0;

  return {
    equityPct: parseFloat((finalEquity * 0.4).toFixed(2)),
    maxDrawdownPct: Math.abs(maxDrawdown),
    winRate: total > 0 ? Math.round((wins / total) * 100) : 0,
    tradeCount: total,
    slippage: 0.07,
    sharpe: parseFloat(Math.max(0, 1.2 + finalEquity * 0.02).toFixed(2)),
  };
}

// ── 完整结果构建 ──────────────────────────────────────────────────────────────

export function buildMockBacktestResult(
  strategyId: string,
  range: BtRange,
  asset: string,
): BacktestResultResponse {
  const jobId = `mock_${Date.now()}`;
  const count = RANGE_PTS[range];
  const days = RANGE_DAYS[range];
  const msPerPt = (days * 86_400_000) / count;
  const historyStart = Date.now() - days * 86_400_000;

  const { pts, benchmarkPts } = generatePts(count);
  const { signals, trades, wins, losses } = detectSignals(
    pts,
    historyStart,
    msPerPt,
  );
  const metrics = buildMetrics(pts, wins, losses);

  const basePrice = buildBasePrice();

  return {
    jobId,
    strategyId,
    range,
    asset,
    startedAt: Date.now() - 3000,
    completedAt: Date.now(),
    pts,
    signals,
    metrics,
    trades,
    benchmarkPts,
    benchmarkReturnPct: parseFloat(
      (benchmarkPts[benchmarkPts.length - 1] * 0.4).toFixed(2),
    ),
    dateRange: buildDateRange(range),
    basePrice,
    priceScale: PRICE_SCALE,
  };
}

// ── SSE 进度事件序列 ──────────────────────────────────────────────────────────
// 返回一个按顺序推送的事件数组，client.ts 用 setInterval 依次发送

export function buildMockProgressEvents(
  result: BacktestResultResponse,
): Array<BacktestProgressEvent | BacktestCompleteEvent> {
  const events: Array<BacktestProgressEvent | BacktestCompleteEvent> = [];

  for (const step of PROGRESS_STEPS) {
    const endIdx = Math.floor((step.pct / 100) * result.pts.length);
    const latestPts = result.pts.slice(0, endIdx);
    const latestSignals = result.signals.filter((s) => s.i < endIdx);

    if (step.pct < 100) {
      events.push({
        type: "progress",
        jobId: result.jobId,
        pct: step.pct,
        message: step.msg,
        latestPts,
        latestSignals,
      } as BacktestProgressEvent);
    } else {
      events.push({
        type: "complete",
        jobId: result.jobId,
        result,
      } as BacktestCompleteEvent);
    }
  }

  return events;
}
