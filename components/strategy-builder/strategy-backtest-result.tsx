// components/backtest/ResultsPanel.tsx

"use client";
import { useEffect } from "react"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ComposedChart,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import {
    BacktestData,
    BacktestTrade,
} from "@/lib/api/backtest/types"
import { BacktestTooltip, TradeTooltip } from "../backtest/backtest-components"
import { Button } from "../ui/button"
import { BarChart3, ChevronRight, Eye, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation";
import { Tooltip as Tp, TooltipContent, TooltipTrigger } from "../ui/tooltip";
// Utility function to format numbers
function formatNumber(value: number, decimals: number): string {
    return value.toFixed(decimals)
}

// Sample data for testing charts
const sampleMonthlyReturns = [
    { month: "Jan", strategyReturn: 2.4, marketReturn: 1.2 },
    { month: "Feb", strategyReturn: -1.3, marketReturn: -2.1 },
    { month: "Mar", strategyReturn: 3.7, marketReturn: 2.5 },
    { month: "Apr", strategyReturn: 1.8, marketReturn: 0.9 },
    { month: "May", strategyReturn: -0.5, marketReturn: -1.2 },
    { month: "Jun", strategyReturn: 4.2, marketReturn: 3.0 },
];

const sampleDistribution = [
    { bin: "-5", count: 3 },
    { bin: "-4", count: 5 },
    { bin: "-3", count: 8 },
    { bin: "-2", count: 12 },
    { bin: "-1", count: 18 },
    { bin: "0", count: 25 },
    { bin: "1", count: 20 },
    { bin: "2", count: 15 },
    { bin: "3", count: 9 },
    { bin: "4", count: 6 },
    { bin: "5", count: 2 },
];

interface ResultsPanelProps {
    data: BacktestData | null
    isLoading: boolean
    strategyId: string
    version: string
    strategy: string
    onShare?: () => void
    onExport?: () => void
}

// Prepare trade data for visualization
const prepareTradeData = (trades: BacktestTrade[]) => {
    return trades.map((trade, index) => ({
        id: index + 1,
        profit: trade.profit,
        type: trade.type,
        result: trade.result,
    }))
}

export default function StrategyObserveResultsPanel({ data, isLoading, strategyId, version, strategy }: ResultsPanelProps) {
    if (!data) return null


    const router = useRouter();


    const tradeData = prepareTradeData(data.trades)

    // Update the viewBacktestResults function to handle undefined latestVersion
    const viewBacktestResults = (strategyId: string, version: string, strategy: string) => {

        console.log("strategyId", strategyId)

        // If latestVersion is undefined, don't include it in the URL
        // This will show the empty state in the backtest page
        const versionParam = strategyId ? `&version=${version}` : ""
        router.push(`/strategies/${strategyId}/observe/backtest?strategy=${strategy}&mode=historical${versionParam}`)
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div>
                        <CardTitle>Backtest Results</CardTitle>
                        <CardDescription>Performance analysis and statistics</CardDescription>
                    </div>
                    <Tp>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-muted-foreground hover:text-foreground"
                                onClick={() => viewBacktestResults(strategyId, version, strategy)}
                            >
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" sideOffset={4}>
                            More details
                        </TooltipContent>
                    </Tp>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Strategy Return</div>
                        <div className="text-lg font-bold text-green-500">
                            {Number(data.metrics?.strategyReturn * 100).toFixed(2)}%
                        </div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Win Rate</div>
                        <div className="text-lg font-bold">
                            {Number(data.metrics?.winRate * 100).toFixed(2)}%
                        </div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Sharpe</div>
                        <div className="text-lg font-bold">
                            {Number(data.metrics?.sharpeRatio).toFixed(2)}%
                        </div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                        <div className="text-xs text-muted-foreground">Max Drawdown</div>
                        <div className="text-lg font-bold text-red-500">
                            {Number(data.metrics?.maxDrawdown * 100).toFixed(2)}%
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <Tabs defaultValue="equity">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                        <TabsTrigger value="monthly">Monthly Returns</TabsTrigger>
                        <TabsTrigger value="distribution">Distribution</TabsTrigger>
                        <TabsTrigger value="trades">Trades</TabsTrigger>
                    </TabsList>

                    {/* Setting fixed height containers for all chart tabs to prevent layout shift */}
                    <div className="relative mt-4">
                        <TabsContent value="equity" className="absolute inset-0 w-full">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Performance</CardTitle>
                                    <CardDescription>Strategy performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        {isLoading ? (
                                            <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                                        ) : !data ? (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                                Configure parameters and run backtest to see results
                                            </div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart
                                                    data={data.balances}
                                                    margin={{
                                                        top: 20,
                                                        right: 20,
                                                        left: 20,
                                                        bottom: 20,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis
                                                        dataKey="date"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12 }}
                                                        tickFormatter={(value) => {
                                                            const date = new Date(value)
                                                            return `${date.getMonth() + 1}/${date.getDate()}`
                                                        }}
                                                    />
                                                    <YAxis
                                                        yAxisId="left"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12 }}
                                                        width={80}
                                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                                    />
                                                    <YAxis
                                                        yAxisId="right"
                                                        orientation="right"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12 }}
                                                        width={40}
                                                        tickFormatter={(value) => `${value}`}
                                                    />
                                                    <Tooltip content={<BacktestTooltip />} />
                                                    <Legend />
                                                    <Area
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey="balance"
                                                        name="Strategy"
                                                        stroke="#10b981"
                                                        fill="#10b981"
                                                        fillOpacity={0.3}
                                                        isAnimationActive={false}
                                                    />
                                                    {/* <Area
                                                        yAxisId="left"
                                                        type="monotone"
                                                        dataKey="marketBalance"
                                                        name="Market"
                                                        stroke="#3b82f6"
                                                        fill="#3b82f6"
                                                        fillOpacity={0.3}
                                                        isAnimationActive={false}
                                                    /> */}
                                                    <Bar
                                                        yAxisId="right"
                                                        dataKey="trades"
                                                        name="Trades"
                                                        fill="#f97316"
                                                        radius={[4, 4, 0, 0]}
                                                        isAnimationActive={false}
                                                    />
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="monthly" className="absolute inset-0 w-full">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Monthly Returns</CardTitle>
                                    <CardDescription>Strategy monthly performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={data.monthlyReturns}
                                                margin={{
                                                    top: 20,
                                                    right: 20,
                                                    left: 20,
                                                    bottom: 20,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                                <YAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={{ fontSize: 12 }}
                                                    width={40}
                                                    tickFormatter={(value) => `${value}%`}
                                                />
                                                <Tooltip
                                                    formatter={(value, name) => [
                                                        typeof value === "number" ? `${value.toFixed(2)}%` : value,
                                                        name === "Strategy" ? "Strategy" : "Market"
                                                    ]}
                                                    labelFormatter={(label) => `Month: ${label}`}
                                                />
                                                <Legend />
                                                <Bar
                                                    dataKey="strategyReturn"
                                                    name="Strategy"
                                                    fill="#10b981"
                                                    radius={[4, 4, 0, 0]}
                                                    isAnimationActive={false}
                                                >
                                                    {data.monthlyReturns.map((entry, index) => (
                                                        <Cell key={`cell-strategy-${index}`} fill={entry.strategyReturn >= 0 ? "#10b981" : "#ef4444"} />
                                                    ))}
                                                </Bar>
                                                {/* <Bar
                                                    dataKey="marketReturn"
                                                    name="Market"
                                                    fill="#3b82f6"
                                                    radius={[4, 4, 0, 0]}
                                                    isAnimationActive={false}
                                                >
                                                    {data.monthlyReturns.map((entry, index) => (
                                                        <Cell key={`cell-market-${index}`} fill={entry.marketReturn >= 0 ? "#3b82f6" : "#9f7aea"} />
                                                    ))}
                                                </Bar> */}
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="distribution" className="absolute inset-0 w-full">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Return Distribution</CardTitle>
                                    <CardDescription>Distribution of daily returns</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        {isLoading ? (
                                            <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={data.returnDistribution}
                                                    margin={{
                                                        top: 20,
                                                        right: 20,
                                                        left: 20,
                                                        bottom: 20,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="bin" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12 }}
                                                        width={40}
                                                        tickFormatter={(value) => `${value}`}
                                                    />
                                                    <Tooltip
                                                        formatter={(value) => [value, "Occurrences"]}
                                                        labelFormatter={(label) => `Return: ${label}`}
                                                    />
                                                    <Bar
                                                        dataKey="count"
                                                        name="Frequency"
                                                        fill="#10b981"
                                                        radius={[4, 4, 0, 0]}
                                                        isAnimationActive={false}
                                                    >
                                                        {data.returnDistribution?.map((entry, index) => (
                                                            <Cell key={`cell-dist-${index}`} fill={entry.binValue >= 0 ? "#10b981" : "#ef4444"} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="trades" className="absolute inset-0 w-full">
                            <Card className="md:col-span-2">
                                <CardHeader>
                                    <CardTitle>Trade Analysis</CardTitle>
                                    <CardDescription>Individual trade performance</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-[400px]">
                                        {isLoading ? (
                                            <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                                        ) : (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={tradeData}
                                                    margin={{
                                                        top: 20,
                                                        right: 20,
                                                        left: 20,
                                                        bottom: 20,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                    <XAxis dataKey="id" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12 }}
                                                        width={60}
                                                        tickFormatter={(value) => `$${value}`}
                                                    />
                                                    <Tooltip content={<TradeTooltip />} />
                                                    <Bar
                                                        dataKey="profit"
                                                        name="Profit/Loss"
                                                        fill="#10b981"
                                                        radius={[4, 4, 0, 0]}
                                                        isAnimationActive={false}
                                                    >
                                                        {tradeData.map((entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? "#10b981" : "#ef4444"} />
                                                        ))}
                                                    </Bar>
                                                </BarChart>
                                            </ResponsiveContainer>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </div>

                    {/* This div adds space to ensure content below tabs has proper spacing */}
                    <div className="h-[510px]"></div>

                    {/* Additional Statistics */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Trade Statistics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Total Trades</span>
                                        <span>{Number(data.metrics?.totalTrades).toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Win Rate</span>
                                        <span>{Number(data.metrics?.winRate * 100).toFixed(2)} %</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Profit Factor</span>
                                        <span>{Number(data.metrics?.profitFactor).toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Metrics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Max Drawdown</span>
                                        <span>{Number(data.metrics?.maxDrawdown * 100).toFixed(2)} %</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Sharpe Ratio</span>
                                        <span>{Number(data.metrics?.sharpeRatio).toFixed(2)} %</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-muted-foreground">Alpha</span>
                                        <span>{Number(data.metrics?.alpha).toFixed(2)}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Tabs>
            </CardContent>
        </Card>
    )
}