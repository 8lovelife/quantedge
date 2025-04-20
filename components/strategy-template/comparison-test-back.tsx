"use client"

import React, { useEffect, useMemo, useState } from "react"
import {
    Card, CardHeader, CardTitle, CardDescription,
    CardContent, CardFooter
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, Gauge, Award, PercentCircle, ArrowLeft } from "lucide-react"
import { cn, formatDuration } from "@/lib/utils"
import {
    Tabs, TabsContent, TabsList, TabsTrigger
} from "@/components/ui/tabs"

import {
    ResponsiveContainer,
    LineChart, Line,
    CartesianGrid, XAxis, YAxis, Tooltip, Legend,
    BarChart, Bar, Cell,
    ScatterChart, Scatter, ZAxis,
    RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from "recharts"
import { Button } from "../ui/button"
import { useParams, useRouter } from "next/navigation"
import { defaultParams2, LabRunComparison, LabRunHistory, labRunHistoryBacktest, labRunHistoryComparison } from "@/lib/api/algorithms"
import StrategyTempleteObserveResultsLoadingSkeleton from "./observe-results-panel-skeleton"
import { BacktestResponse } from "@/lib/api/backtest/types"

/* ╭───────────────────────── 1. Mock helpers ──────────────────────╮ */
type Backtest = typeof sampleResult
type Run = {
    id: number
    startTime: string
    endTime: string
    duration: string
    data: Backtest["data"]
}

/* your sample result (trimmed to what we need) -------------------- */
const sampleResult = {
    data: {
        balances: mockBalances,       // <-- we inject below
        monthlyReturns: mockMonthly,  // <—
        metrics: {
            strategyReturn: 3.01,
            maxDrawdown: 6.31,
            sharpeRatio: -3.94,
            winRate: 50,
        }
    }
}

/* quick mock balances / monthlyReturn arrays ---------------------- */
function mockBalances(seed = 0) {
    return Array.from({ length: 32 }, (_, i) => ({
        date: new Date(2025, 1, 8 + i).toISOString(),
        balance: 100_000_000 + seed * 1_500_000 + (Math.random() - 0.5) * 4_000_000,
        trades: 1
    }))
}
function mockMonthly() {
    return ["2025-02", "2025-03", "2025-04"].map(m => ({
        month: m,
        strategyReturn: (Math.random() * 0.06).toFixed(3)
    }))
}

/* build 4 runs ---------------------------------------------------- */
const runsMock: Run[] = Array.from({ length: 4 }, (_, idx) => ({
    id: idx + 1,
    startTime: new Date(2025, 2, 1 + idx).toISOString(),
    endTime: new Date(2025, 2, 1 + idx, 0, 4, 7).toISOString(),
    duration: "4m 07s",
    data: {
        ...sampleResult.data,
        balances: mockBalances(idx),
        monthlyReturns: mockMonthly(),
        metrics: {
            strategyReturn: +(2 + Math.random() * 2).toFixed(2),
            maxDrawdown: +(4 + Math.random() * 4).toFixed(2),
            sharpeRatio: -+(2 + Math.random() * 3).toFixed(2),
            winRate: +(45 + Math.random() * 10).toFixed(2),
        }
    }
}))

const palette = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]

/* ╭───────────────────────── 2. Utilities ──────────────────────────╮ */
const formatDate = (d: string) => new Date(d).toLocaleDateString()

const mergeLines = (ids: number[], map: Record<number, LabRunComparison>) => {
    // Use first available runId if none selected
    const idsToUse = ids.length === 0 ? Object.keys(map).map(Number).slice(0, 1) : ids;

    const byDate: Record<string, any> = {};

    idsToUse.forEach((id) => {
        const comparison = map[id];
        if (!comparison) return;

        const balances = comparison.backtestData?.data?.balances ?? [];
        balances.forEach((p) => {
            const d = p.date;
            if (!byDate[d]) byDate[d] = { date: d };
            byDate[d][`run${id}`] = +(p.balance / 1000).toFixed(0); // balance in thousands
        });
    });

    return Object.values(byDate).sort(
        (a: any, b: any) => +new Date(a.date) - +new Date(b.date)
    );
};

/* ╭───────────────────────── 3. Additional comparison utilities ───────────────────────────────╮ */

// Calculate drawdowns from balance history
const calculateDrawdowns = (balances: any[]) => {
    let peak = -Infinity;
    return balances?.map(point => {
        const { date, balance } = point;
        peak = Math.max(peak, balance);
        const drawdown = peak > 0 ? ((peak - balance) / peak) * 100 : 0;
        return { date, drawdown: drawdown > 0.01 ? drawdown : 0 };
    });
};

// Merge drawdown lines
const mergeDrawdowns = (ids: number[], map: Record<number, LabRunComparison>) => {
    // If no ids selected, use the first run as default
    const idsToUse = ids.length === 0 ? [1] : ids;

    const byDate: Record<string, any> = {};
    idsToUse.forEach(id => {
        const drawdowns = calculateDrawdowns(map[id]?.backtestData?.balances);
        drawdowns?.forEach(p => {
            const d = p.date;
            if (!byDate[d]) byDate[d] = { date: d };
            byDate[d][`run${id}`] = +p.drawdown.toFixed(2);
        });
    });
    return Object.values(byDate).sort((a: any, b: any) => +new Date(a.date) - +new Date(b.date));
};

// Calculate additional metrics for table
const calculateExtendedMetrics = (run: LabRunComparison) => {
    const { strategyReturn, maxDrawdown, sharpeRatio, winRate } = run?.backtestData?.metrics;

    // Simple Calmar Ratio (Return / Max Drawdown)
    const calmarRatio = maxDrawdown > 0 ? +(strategyReturn / maxDrawdown).toFixed(2) : 0;

    // We don't have enough data for real Sortino, but let's simulate it
    const sortinoRatio = +(sharpeRatio * 1.2).toFixed(2);

    // Profit factor (simulated)
    const profitFactor = +(1 + (winRate - 50) / 100).toFixed(2);

    return {
        calmarRatio,
        sortinoRatio,
        profitFactor,
        // Add original metrics
        strategyReturn: +strategyReturn.toFixed(2),
        maxDrawdown: +maxDrawdown.toFixed(2),
        sharpeRatio: +sharpeRatio.toFixed(2),
        winRate: +winRate.toFixed(2)
    };
};

// Prepare win/loss data by month
const prepareWinLossData = (ids: number[], map: Record<number, LabRunComparison>) => {
    // If no ids selected, use the first run as default
    const idsToUse = ids.length === 0 ? [1] : ids;

    const months = Array.from(new Set(
        idsToUse.flatMap(id => map[id]?.backtestData.monthlyReturns.map(m => m.month))
    )).sort();

    return months.map(month => {
        const result: Record<string, any> = { month };

        idsToUse.forEach(id => {
            const monthly = map[id]?.backtestData.monthlyReturns.find(m => m.month === month);
            if (monthly) {
                const returnValue = +monthly.strategyReturn;
                result[`win${id}`] = returnValue > 0 ? +(returnValue * 100).toFixed(2) : 0;
                result[`loss${id}`] = returnValue < 0 ? +(Math.abs(returnValue) * 100).toFixed(2) : 0;
            }
        });

        return result;
    });
};

/* ╭───────────────────────── 4. Page Components ───────────────────────────────╮ */

// Run Selection Card Component
const RunSelectionCard = ({ runHistorys, selected, toggle }) => (

    console.log("runHistorys", runHistorys),
    <Card>
        <CardHeader className="pb-2">
            <CardTitle>Backtest History</CardTitle>
            <CardDescription>Select cards to compare. Click again to unselect.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex gap-4 overflow-x-auto pb-2">
                {runHistorys.map((run) => (
                    <div
                        key={run.id}
                        className={cn(
                            "flex flex-col space-y-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
                            selected.includes(run.id) && "border-second bg-muted"
                        )} onClick={() => toggle(run.id)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="font-medium">Run {run.id}</div>
                                <Badge variant="outline">
                                    {run.status}
                                </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                                {new Date(run.startTime).toLocaleString()}
                            </div>
                        </div>

                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground">Return</div>
                                <div className="text-sm font-medium text-green-500">
                                    {Number(run.performance.strategyReturn).toFixed(2)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Win Rate</div>
                                <div className="text-sm font-medium">
                                    {Number(run.performance.winRate).toFixed(2)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Sharpe</div>
                                <div className="text-sm font-medium">
                                    {Number(run.performance.sharpeRatio).toFixed(2)}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Drawdown</div>
                                <div className="text-sm font-medium text-red-500">
                                    {Number(run.performance.maxDrawdown).toFixed(2)}%
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Duration</div>
                                <div className="text-sm font-medium">
                                    {formatDuration(run.startTime, run.endTime)}
                                </div>
                            </div>
                        </div>


                        {/* New grid for the additional parameters */}
                        <div className="grid grid-cols-5 gap-4">
                            <div>
                                <div className="text-xs text-muted-foreground">Mean Type</div>
                                <div className="text-sm font-medium">
                                    {run.marketDetails.subType || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Trading Pair</div>
                                <div className="text-sm font-medium">
                                    {run.marketDetails.pairs || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Timeframe</div>
                                <div className="text-sm font-medium">
                                    {run.marketDetails.timeframe || "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Initial Capital</div>
                                <div className="text-sm font-medium">
                                    {run.marketDetails.initialCapital ? `$${run.marketDetails.initialCapital}` : "-"}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">Direction</div>
                                <div className="text-sm font-medium">
                                    {run.marketDetails.positionType || "-"}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(run.parameters)
                                .filter(([key, value]) =>
                                    value !== defaultParams2[key as keyof typeof defaultParams2]
                                )
                                .map(([key, value]) => (
                                    <Badge key={key} variant="outline">
                                        {key}: {value}
                                    </Badge>
                                ))
                            }
                        </div>
                    </div>
                ))}
                {/* {Object.values(runs).map((r) => (
                    <div key={r.id}
                        className={cn(
                            "min-w-[260px] shrink-0 border rounded-md p-3 cursor-pointer transition-colors",
                            selected.includes(r.id) ? "border-blue-500 bg-muted" : "hover:bg-muted/40"
                        )}
                        onClick={() => toggle(r.id)}
                    >
                        <div className="flex justify-between items-center">
                            <span className="font-medium">Run {r.id}</span>
                            <Badge variant="outline">{r.duration}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                            {r.startTime} - {r.endTime}
                        </div>

                        <div className="grid grid-cols-3 gap-1 mt-2 text-xs">
                            <div><span className="text-muted-foreground">Ret</span><br />{r.data.metrics.strategyReturn}%</div>
                            <div><span className="text-muted-foreground">DD</span><br />{r.data.metrics.maxDrawdown}%</div>
                            <div><span className="text-muted-foreground">SR</span><br />{r.data.metrics.sharpeRatio}</div>
                        </div>
                    </div>
                ))} */}
            </div>
        </CardContent>
    </Card >
);

// Chart Component for rendering individual charts
const ChartCard = ({ title, height = 260, footer, children }) => (
    <Card className="h-full flex flex-col">
        <CardHeader>
            <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
            <ResponsiveContainer width="100%" height={height}>
                {children}
            </ResponsiveContainer>
        </CardContent>
        {footer && <CardFooter className="text-sm text-muted-foreground">{footer}</CardFooter>}
    </Card>
);

// Basic Tab Content Component with Grid Layout
const BasicTabContent = ({ selected, runs, lineData, monthlyData, scatter, pareto, palette }) => {
    // Use default run if nothing selected
    const effectiveSelected = selected.length === 0 ? [1] : selected;

    return (
        <div className="space-y-6">
            {/* Always show grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Equity curve */}
                <ChartCard title="Equity Curve (k USD)">
                    <LineChart data={lineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={false} />
                        <YAxis width={60} />
                        <Tooltip />
                        <Legend />
                        {effectiveSelected.map((id, idx) => (
                            <Line key={id} type="monotone" dot={false}
                                dataKey={`run${id}`} name={`Run ${id}`}
                                stroke={palette[idx % palette.length]} />
                        ))}
                    </LineChart>
                </ChartCard>

                {/* Monthly returns */}
                <ChartCard title="Monthly Return (%)">
                    <BarChart data={monthlyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis width={60} />
                        <Tooltip />
                        <Legend />
                        {effectiveSelected.map((id, idx) => (
                            <Bar key={id} dataKey={`run${id}`} name={`Run ${id}`}
                                fill={palette[idx % palette.length]}>
                                {monthlyData.map((row, i) => (
                                    <Cell key={i} fill={(row[`run${id}`] ?? 0) >= 0 ? palette[idx % palette.length] : "#ef4444"} />
                                ))}
                            </Bar>
                        ))}
                    </BarChart>
                </ChartCard>
            </div>

            {/* Return vs Drawdown scatter - show even with no selection or one selection */}
            <ChartCard
                title="Return vs Drawdown (Pareto)"
                height={320}
                footer={<><History className="h-4 w-4 inline mr-1" />{effectiveSelected.length} runs · {pareto.length} Pareto‑optimal</>}
            >
                <ScatterChart>
                    <CartesianGrid />
                    <XAxis type="number" dataKey="dd" name="Max DD" unit="%" />
                    <YAxis type="number" dataKey="ret" name="Return" unit="%" />
                    <ZAxis range={[50, 150]} />
                    <Tooltip formatter={(v) => v + "%"} />
                    <Scatter data={scatter} shape={(props) => {
                        const { cx, cy, payload } = props as any
                        return <circle cx={cx} cy={cy} r={10} fill={payload.color} />
                    }} />
                </ScatterChart>
            </ChartCard>
        </div>
    );
};

// Advanced Tab Content Component with Grid Layout
const AdvancedTabContent = ({ selected, runs, drawdownData, radarData, winLossData, metricsTableData, bestValues, palette, formatMetric }) => {
    // Use default run if nothing selected
    const effectiveSelected = selected.length === 0 ? [1] : selected;

    return (
        <div className="space-y-6">
            {/* Always show grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Metrics Radar Chart */}
                <ChartCard
                    title={<div className="flex items-center gap-2"><Gauge className="h-5 w-5" />Strategy Metrics Comparison</div>}
                    height={300}
                    footer="Higher values are better for all metrics (drawdown is inverted)"
                >
                    <RadarChart outerRadius={90} data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" tickFormatter={formatMetric} />
                        <PolarRadiusAxis domain={[0, 100]} tick={false} />
                        <Tooltip formatter={(value) => [`${Math.round(value)}%`, 'Score']} />
                        {effectiveSelected.map((id, idx) => (
                            <Radar
                                key={id}
                                name={`Run ${id}`}
                                dataKey={`run${id}`}
                                stroke={palette[idx % palette.length]}
                                fill={palette[idx % palette.length]}
                                fillOpacity={0.2}
                            />
                        ))}
                    </RadarChart>
                </ChartCard>

                {/* Drawdown Comparison Chart */}
                <ChartCard
                    title="Drawdown Comparison (%)"
                    footer="Lower values indicate less risk exposure"
                >
                    <LineChart data={drawdownData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={false} />
                        <YAxis width={60} domain={[0, 'auto']} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Drawdown']} />
                        <Legend />
                        {effectiveSelected.map((id, idx) => (
                            <Line
                                key={id}
                                type="monotone"
                                dot={false}
                                dataKey={`run${id}`}
                                name={`Run ${id}`}
                                stroke={palette[idx % palette.length]}
                                strokeWidth={1.5}
                            />
                        ))}
                    </LineChart>
                </ChartCard>
            </div>

            {/* Always show grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Monthly Win/Loss Chart */}
                <ChartCard
                    title={<div className="flex items-center gap-2"><PercentCircle className="h-5 w-5" />Monthly Win/Loss Performance</div>}
                    footer="Solid lines show profitable months, dashed lines show losing months"
                >
                    <LineChart data={winLossData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis width={60} tickFormatter={(value) => `${value}%`} />
                        <Tooltip formatter={(value) => [`${value}%`, 'Return']} />
                        <Legend />
                        {effectiveSelected.map((id, idx) => [
                            <Line
                                key={`win${id}`}
                                type="monotone"
                                dataKey={`win${id}`}
                                name={`Run ${id} Wins`}
                                stroke={palette[idx % palette.length]}
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />,
                            <Line
                                key={`loss${id}`}
                                type="monotone"
                                dataKey={`loss${id}`}
                                name={`Run ${id} Losses`}
                                stroke={palette[idx % palette.length]}
                                strokeDasharray="3 3"
                                strokeWidth={2}
                                dot={{ r: 4 }}
                            />
                        ]).flat()}
                    </LineChart>
                </ChartCard>

                {/* Risk-Adjusted Metrics Table - always show */}
                <Card className="h-full flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Award className="h-5 w-5" />
                            Risk-Adjusted Performance Metrics
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="text-xs">
                                        <TableHead className="w-[80px]">Run</TableHead>
                                        <TableHead>Return (%)</TableHead>
                                        <TableHead>Max DD (%)</TableHead>
                                        <TableHead>Sharpe</TableHead>
                                        <TableHead>Calmar</TableHead>
                                        <TableHead>Sortino</TableHead>
                                        <TableHead>Win Rate (%)</TableHead>
                                        <TableHead>Profit Factor</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {metricsTableData.length > 0 ? (
                                        metricsTableData.map(m => (
                                            <TableRow key={m.id}>
                                                <TableCell className="font-medium">{m.id}</TableCell>
                                                <TableCell className={cn(
                                                    bestValues.strategyReturn === m.strategyReturn && "font-semibold text-green-600"
                                                )}>{m.strategyReturn}</TableCell>
                                                <TableCell className={cn(
                                                    bestValues.maxDrawdown === m.maxDrawdown && "font-semibold text-green-600"
                                                )}>{m.maxDrawdown}</TableCell>
                                                <TableCell className={cn(
                                                    bestValues.sharpeRatio === m.sharpeRatio && "font-semibold text-green-600"
                                                )}>{m.sharpeRatio}</TableCell>
                                                <TableCell className={cn(
                                                    bestValues.calmarRatio === m.calmarRatio && "font-semibold text-green-600"
                                                )}>{m.calmarRatio}</TableCell>
                                                <TableCell className={cn(
                                                    bestValues.sortinoRatio === m.sortinoRatio && "font-semibold text-green-600"
                                                )}>{m.sortinoRatio}</TableCell>
                                                <TableCell className={cn(
                                                    bestValues.winRate === m.winRate && "font-semibold text-green-600"
                                                )}>{m.winRate}</TableCell>
                                                <TableCell className={cn(
                                                    bestValues.profitFactor === m.profitFactor && "font-semibold text-green-600"
                                                )}>{m.profitFactor}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        // Show default data when no selection
                                        <TableRow>
                                            <TableCell className="font-medium">1</TableCell>
                                            <TableCell>{runs[1].data.metrics.strategyReturn}</TableCell>
                                            <TableCell>{runs[1].data.metrics.maxDrawdown}</TableCell>
                                            <TableCell>{runs[1].data.metrics.sharpeRatio}</TableCell>
                                            <TableCell>{calculateExtendedMetrics(runs[1]).calmarRatio}</TableCell>
                                            <TableCell>{calculateExtendedMetrics(runs[1]).sortinoRatio}</TableCell>
                                            <TableCell>{runs[1].data.metrics.winRate}</TableCell>
                                            <TableCell>{calculateExtendedMetrics(runs[1]).profitFactor}</TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="text-sm text-muted-foreground">
                        {metricsTableData.length > 1 ?
                            "Best values highlighted in green (lower is better for drawdown)" :
                            "Select multiple runs to compare metrics"}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

/* ╭───────────────────────── 5. Main Page Component ───────────────────────────────╮ */
export default function HistoryPageBackup() {


    const params = useParams()

    const router = useRouter()

    const [runsToBacktest, setRunsToBacktest] = useState<Record<number, LabRunComparison>>({})
    const [selected, setSelected] = useState<number[]>([]) // default select first
    const [activeTab, setActiveTab] = useState<"basic" | "advanced">("basic")
    const [runComparisonData, setRunComparisonData] = useState<LabRunComparison[]>()
    const [loading, setLoading] = useState(false)

    // const runHistorys: LabRunHistory[] = runComparisonData?.flatMap(item => item.labRunHistory ? [item.labRunHistory] : []) ?? [];
    const runHistorys: LabRunHistory[] = runComparisonData?.flatMap(item => item.labRunHistory ?? []) ?? [];

    const templateId = typeof params.id === "string" ? params.id : "1"


    useEffect(() => {
        if (!templateId) return
        const fetchData = async () => {
            try {
                setLoading(true)
                const comparisonData = await labRunHistoryComparison(parseInt(templateId));
                setRunComparisonData(comparisonData)
                if (comparisonData?.length && selected.length === 0) {
                    setSelected([comparisonData[0].runId]);
                    const runsToBacktest = Object.fromEntries(comparisonData.map((item) => [item.runId, item]));
                    setRunsToBacktest(runsToBacktest);
                }
            } catch (err: any) {
                console.error("Failed to fetch run backtest data", err)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [templateId])



    // const runsToBacktest = useMemo(() => {
    //     if (!runComparisonData) return {};
    //     return Object.fromEntries(runComparisonData.map((item) => [item.runId, item]));
    // }, [runComparisonData]);


    // useEffect(() => {
    //     if (runComparisonData?.length && selected.length === 0) {
    //         setSelected([runComparisonData[0].runId]);
    //     }
    // }, [runComparisonData]);


    /* Pareto ids whenever selection changes ------------------------ */
    const [pareto, setPareto] = useState<number[]>([])
    useEffect(() => {
        // Use all runs if nothing selected
        const effectiveSelected = selected.length === 0 ? [1] : selected;
        const list = effectiveSelected.map(id => runsToBacktest[id])
        const ids: number[] = []
        list.forEach(a => {
            const dom = list.some(b =>
                b.runId !== a.runId &&
                b.backtestData.data.metrics.strategyReturn >= a.backtestData.data.metrics.strategyReturn &&
                b.backtestData.data.metrics.maxDrawdown <= a.backtestData.data.metrics.maxDrawdown &&
                b.backtestData.data.metrics.sharpeRatio >= a.backtestData.data.metrics.sharpeRatio &&
                (
                    b.backtestData.data.metrics.strategyReturn > a.backtestData.data.metrics.strategyReturn ||
                    b.backtestData.data.metrics.maxDrawdown < a.backtestData.data.metrics.maxDrawdown ||
                    b.backtestData.data.metrics.sharpeRatio > a.backtestData.data.metrics.sharpeRatio
                )
            )
            if (!dom) ids.push(a.runId)
        })
        setPareto(ids)
    }, [selected, runsToBacktest])

    const toggle = (id: number) => {
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])
    }

    /* balance line merged ----------------------------------------- */
    const lineData = mergeLines(selected, runsToBacktest)

    /* monthly bars merge ------------------------------------------ */
    // Use default run if nothing selected
    const effectiveSelected = selected.length === 0 ? [1] : selected;

    const months = Array.from(new Set(
        effectiveSelected.flatMap(id => {
            const run = runsToBacktest?.[id];
            return run?.backtestData?.data?.monthlyReturns?.map(m => m.month) ?? [];
        })
    )).sort();
    const monthlyData = months.map(m => {
        const row: any = { month: m }
        effectiveSelected.forEach(id => {
            const rec = runsToBacktest[id].backtestData.data.monthlyReturns.find(x => x.month === m)
            if (rec) row[`run${id}`] = +(+rec.strategyReturn * 100).toFixed(2)
        })
        return row
    })

    /* scatter data ------------------------------------------------- */
    const scatter = effectiveSelected.map((id, idx) => ({
        id,
        ret: runsToBacktest[id]?.backtestData?.data.metrics.strategyReturn,
        dd: runsToBacktest[id]?.backtestData?.data.metrics.maxDrawdown,
        color: pareto.includes(id) ? "#ff7f0e" : palette[idx % palette.length]
    }))

    /* radar chart data -------------------------------------------- */
    const radarData = prepareRadarData();
    const drawdownData = mergeDrawdowns(selected, runsToBacktest);
    const winLossData = prepareWinLossData(selected, runsToBacktest);

    function prepareRadarData() {
        // Use default run if nothing selected
        const activeRuns = selected.length === 0 ? [1] : selected;

        // Normalize metrics for radar chart
        const metrics = ['strategyReturn', 'sharpeRatio', 'winRate'];
        const inverseMetrics = ['maxDrawdown']; // Higher is worse, need to invert

        // Find min/max values for normalization
        const minMax: Record<string, { min: number, max: number }> = {};
        [...metrics, ...inverseMetrics].forEach(metric => {
            minMax[metric] = activeRuns.reduce((acc, id) => {
                const value = runsToBacktest[id]?.backtestData.data.metrics[metric];
                return {
                    min: Math.min(acc.min, value),
                    max: Math.max(acc.max, value)
                };
            }, { min: Infinity, max: -Infinity });

            // Ensure we don't have min === max which would cause division by zero
            if (minMax[metric].min === minMax[metric].max) {
                minMax[metric].min -= 0.1;
                minMax[metric].max += 0.1;
            }
        });

        // Generate normalized radar data
        const radarData = metrics.map(metric => {
            const item: Record<string, any> = { metric };
            activeRuns.forEach(id => {
                const value = runsToBacktest[id]?.backtestData.data.metrics[metric];
                const normalized = (value - minMax[metric].min) /
                    (minMax[metric].max - minMax[metric].min);
                item[`run${id}`] = normalized * 100;
            });
            return item;
        });

        // Add inverted metrics (like drawdown where lower is better)
        inverseMetrics.forEach(metric => {
            const item: Record<string, any> = { metric };
            activeRuns.forEach(id => {
                const value = runsToBacktest[id]?.backtestData.metrics[metric];
                // Invert so lower values get higher scores
                const normalized = 1 - (value - minMax[metric].min) /
                    (minMax[metric].max - minMax[metric].min);
                item[`run${id}`] = normalized * 100;
            });
            radarData.push(item);
        });

        return radarData;
    }

    /* Risk metrics table ------------------------------------------ */
    const metricsTableData = effectiveSelected.map(id => {
        const run = runsToBacktest[id];
        return {
            id,
            ...calculateExtendedMetrics(run)
        };
    });

    // Find best value for each metric to highlight
    const bestValues: Record<string, number> = {};
    const metricNames = metricsTableData.length > 0 ? Object.keys(metricsTableData[0] || {}).filter(key => key !== 'id') : [];

    metricNames.forEach(metric => {
        if (metric === 'maxDrawdown') {
            // For drawdown, lower is better
            bestValues[metric] = Math.min(...metricsTableData.map(m => m[metric]));
        } else {
            // For other metrics, higher is better
            bestValues[metric] = Math.max(...metricsTableData.map(m => m[metric]));
        }
    });

    const formatMetric = (metric: string) => {
        switch (metric) {
            case 'strategyReturn': return 'Return';
            case 'maxDrawdown': return 'Low DD';
            case 'sharpeRatio': return 'Sharpe';
            case 'winRate': return 'Win Rate';
            default: return metric;
        }
    };

    /* ─────────────── JSX ───────────────────────────────────────── */
    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 space-y-4 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.back()}
                            className="mr-4"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold">MA Crossover</h1>
                            <p className="text-muted-foreground">
                                strategies • Last updated:
                            </p>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <StrategyTempleteObserveResultsLoadingSkeleton />
                ) : (
                    <>
                        <RunSelectionCard runHistorys={runHistorys} selected={selected} toggle={toggle} />

                        {/* Tabs */}
                        <Tabs defaultValue="basic" value={activeTab} onValueChange={(value) => setActiveTab(value as "basic" | "advanced")}>
                            <TabsList className="grid w-[200px] grid-cols-2">
                                <TabsTrigger value="basic">Basic</TabsTrigger>
                                <TabsTrigger value="advanced">Advanced</TabsTrigger>
                            </TabsList>

                            <TabsContent value="basic">
                                <BasicTabContent
                                    selected={selected}
                                    runs={runs}
                                    lineData={lineData}
                                    monthlyData={monthlyData}
                                    scatter={scatter}
                                    pareto={pareto}
                                    palette={palette}
                                />
                            </TabsContent>

                            <TabsContent value="advanced">
                                <AdvancedTabContent
                                    selected={selected}
                                    runs={runs}
                                    drawdownData={drawdownData}
                                    radarData={radarData}
                                    winLossData={winLossData}
                                    metricsTableData={metricsTableData}
                                    bestValues={bestValues}
                                    palette={palette}
                                    formatMetric={formatMetric}
                                />
                            </TabsContent>
                        </Tabs>
                    </>
                )}

            </main>
        </div >
    )
}