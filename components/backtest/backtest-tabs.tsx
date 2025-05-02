"use client"

import { Card, CardHeader, CardContent, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Settings2Icon, BarChart3, Activity } from "lucide-react"
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    Area,
    Tooltip,
    Legend,
    Bar,
    BarChart,
    ComposedChart,
    Cell,
    Scatter,
    ReferenceLine,
} from "recharts"
import { BacktestTooltip, TradeTooltip } from "@/components/backtest/backtest-components"
import type { BacktestData, BacktestTrade } from "@/lib/api/backtest/index"
import TradeListCard from "./backtest-trade"

// Replace the PerformanceTab component with an enhanced version that combines charts
export function PerformanceTab({
    backtestData,
    isLoading,
    isCalculating,
    progress,
    getProgressColor,
}: {
    backtestData: BacktestData | null
    isLoading: boolean
    isCalculating: boolean
    progress: number
    getProgressColor: () => string
}) {
    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Performance</CardTitle>
                    <CardDescription>Strategy Equity Curve</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* {isCalculating && (
                        <div className="mb-4">
                            <div className="text-sm font-medium mb-1">Calculating Backtest... {progress}%</div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )} */}
                    <div className="h-[400px]">
                        {isLoading ? (
                            <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                        ) : !backtestData ? (
                            <div className="flex h-full items-center justify-center text-muted-foreground">
                                Configure parameters and run backtest to see results
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={backtestData.balances}
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
                                    />
                                    {/* <Area
                                        yAxisId="left"
                                        type="monotone"
                                        dataKey="marketBalance"
                                        name="Market"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    /> */}
                                    <Bar yAxisId="right" dataKey="trades" name="Trades" fill="#f97316" radius={[4, 4, 0, 0]} />
                                </ComposedChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Monthly Returns Chart - Left side */}
                {backtestData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Returns</CardTitle>
                            <CardDescription>Strategy monthly performance</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={backtestData.monthlyReturns}
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
                                            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Returns"]}
                                            labelFormatter={(label) => `Month: ${label}`}
                                        />
                                        <Legend />
                                        <Bar dataKey="strategyReturn" name="Strategy" fill="#10b981" radius={[4, 4, 0, 0]}>
                                            {backtestData.monthlyReturns.map((entry, index) => (
                                                <Cell key={`cell-strategy-${index}`} fill={entry.strategyReturn >= 0 ? "#10b981" : "#ef4444"} />
                                            ))}
                                        </Bar>
                                        {/* <Bar dataKey="marketReturn" name="Market" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                            {backtestData.monthlyReturns.map((entry, index) => (
                                                <Cell key={`cell-market-${index}`} fill={entry.marketReturn >= 0 ? "#3b82f6" : "#9f7aea"} />
                                            ))}
                                        </Bar> */}
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* New Drawdown Chart - Right side */}
                {backtestData && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Drawdown Analysis</CardTitle>
                            <CardDescription>Historical drawdowns over time</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ComposedChart
                                        data={calculateDrawdowns(backtestData.balances)}
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
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fontSize: 12 }}
                                            width={40}
                                            tickFormatter={(value) => `${value}%`}
                                            domain={[0, "dataMax"]}
                                        />
                                        <Tooltip
                                            formatter={(value) => [`${Number(value).toFixed(2)}%`, "Drawdown"]}
                                            labelFormatter={(label) => `Date: ${label}`}
                                        />
                                        <Legend />
                                        <Area
                                            type="monotone"
                                            dataKey="drawdown"
                                            name="Drawdown"
                                            stroke="#ef4444"
                                            fill="#ef4444"
                                            fillOpacity={0.3}
                                        />
                                        {/* <Area
                                            type="monotone"
                                            dataKey="marketDrawdown"
                                            name="Market Drawdown"
                                            stroke="#9f7aea"
                                            fill="#9f7aea"
                                            fillOpacity={0.3}
                                        /> */}
                                    </ComposedChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* New Cumulative Returns Chart */}
            {backtestData && (
                <Card className="mt-6">
                    <CardHeader>
                        <CardTitle>Cumulative Returns</CardTitle>
                        <CardDescription>Percentage growth over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={calculateCumulativeReturns(backtestData.balances)}
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
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        width={40}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${Number(value).toFixed(2)}%`, "Returns"]}
                                        labelFormatter={(label) => `Date: ${label}`}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="cumulativeReturn"
                                        name="Strategy Return"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.3}
                                    />
                                    {/* <Area
                                        type="monotone"
                                        dataKey="marketCumulativeReturn"
                                        name="Market Return"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    /> */}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}
        </>
    )
}

// Helper function to calculate drawdowns
function calculateDrawdowns(balances: any[]) {
    if (!balances || balances.length === 0) return []

    const result = []
    let maxBalance = balances[0].balance
    let maxMarketBalance = balances[0].marketBalance

    for (const day of balances) {
        // Update max balances if current balance is higher
        if (day.balance > maxBalance) {
            maxBalance = day.balance
        }
        if (day.marketBalance > maxMarketBalance) {
            maxMarketBalance = day.marketBalance
        }

        // Calculate drawdowns as percentages
        const drawdown = ((maxBalance - day.balance) / maxBalance) * 100
        const marketDrawdown = ((maxMarketBalance - day.marketBalance) / maxMarketBalance) * 100

        result.push({
            ...day,
            drawdown,
            marketDrawdown,
        })
    }

    return result
}

// Helper function to calculate cumulative returns
function calculateCumulativeReturns(balances: any[]) {
    if (!balances || balances.length === 0) return []

    const initialBalance = balances[0].balance
    const initialMarketBalance = balances[0].marketBalance

    return balances.map((day) => {
        const cumulativeReturn = ((day.balance - initialBalance) / initialBalance) * 100
        const marketCumulativeReturn = ((day.marketBalance - initialMarketBalance) / initialMarketBalance) * 100

        return {
            ...day,
            cumulativeReturn,
            marketCumulativeReturn,
        }
    })
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

// Trades Tab Component
export function TradesTab({
    backtestData,
    isLoading,
    openParamsDialog,
}: {
    backtestData: BacktestData | null
    isLoading: boolean
    openParamsDialog: () => void
}) {
    if (!backtestData) {
        return (
            <Card>
                <CardContent className="py-10">
                    <div className="flex flex-col items-center justify-center text-center">
                        <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Trade Data Available</h3>
                        <p className="text-muted-foreground mb-4">Configure parameters and run a backtest to see trade analysis</p>
                        {/* <Button onClick={openParamsDialog}>
                            <Settings2Icon className="mr-2 h-4 w-4" />
                            Configure Backtest
                        </Button> */}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const tradeData = prepareTradeData(backtestData.trades)
    const metrics = backtestData.metrics

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        <Bar dataKey="profit" name="Profit/Loss" fill="#10b981" radius={[4, 4, 0, 0]}>
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

                <Card>
                    <CardHeader>
                        <CardTitle>Trade Statistics</CardTitle>
                        <CardDescription>Summary of trading activity</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Total Trades</div>
                                <div className="text-xl font-bold">{Number(metrics?.totalTrades).toFixed(2)}</div>
                            </div>

                            <Separator />

                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                                <div className="text-xl font-bold">{Number(metrics?.winRate).toFixed(2)}%</div>
                            </div>

                            <Separator />

                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Average Profit</div>
                                <div className="text-xl font-bold text-green-500">
                                    $
                                    {Number(tradeData.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) /
                                        Number(Math.max(1, tradeData.filter((t) => t.profit > 0).length).toFixed(2))).toFixed(2)}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Average Loss</div>
                                <div className="text-xl font-bold text-red-500">
                                    $
                                    {Number(tradeData.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0) /
                                        Number(Math.max(1, tradeData.filter((t) => t.profit < 0).length).toFixed(2))).toFixed(2)}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Profit Factor</div>
                                <div className="text-xl font-bold">
                                    {(
                                        Math.abs(tradeData.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0)) /
                                        Math.max(1, Math.abs(tradeData.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0)))
                                    ).toFixed(2)}
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <div className="text-sm text-muted-foreground mb-1">Trade Types</div>
                                <div className="flex justify-between mt-2">
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Buy</div>
                                        <div className="text-lg font-medium">{tradeData.filter((t) => t.type === "buy").length}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-sm text-muted-foreground">Sell</div>
                                        <div className="text-lg font-medium">{tradeData.filter((t) => t.type === "sell").length}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <TradeListCard tradeData={tradeData} />
        </>
    )
}

// Update the StatisticsTab component to include more insightful charts
export function StatisticsTab({
    backtestData,
    isLoading,
    openParamsDialog,
}: {
    backtestData: BacktestData | null
    isLoading: boolean
    openParamsDialog: () => void
}) {
    if (!backtestData) {
        return (
            <Card>
                <CardContent className="py-10">
                    <div className="flex flex-col items-center justify-center text-center">
                        <Activity className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Statistics Available</h3>
                        <p className="text-muted-foreground mb-4">
                            Configure parameters and run a backtest to see statistical analysis
                        </p>
                        {/* <Button onClick={openParamsDialog}>
                            <Settings2Icon className="mr-2 h-4 w-4" />
                            Configure Backtest
                        </Button> */}
                    </div>
                </CardContent>
            </Card>
        )
    }

    const metrics = backtestData.metrics

    // Calculate rolling returns for volatility chart
    const rollingReturns = calculateRollingReturns(backtestData.balances)

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Metrics</CardTitle>
                        <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Total Return</div>
                                <div
                                    className={`text-lg font-bold ${Number(metrics?.strategyReturn * 100) >= 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                    {Number(metrics?.strategyReturn * 100).toFixed(2)}%
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Market Return</div>
                                <div
                                    className={`text-lg font-bold ${Number(metrics?.marketReturn * 100) >= 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                    {Number(metrics?.marketReturn * 100).toFixed(2)}%
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Alpha</div>
                                <div className={`text-lg font-bold ${Number(metrics?.alpha) >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {Number(metrics?.alpha).toFixed(2)}%
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                                <div className="text-lg font-bold">{Number(metrics?.sharpeRatio).toFixed(2)}</div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Max Drawdown</div>
                                <div className="text-lg font-bold text-red-500">{Number(metrics?.maxDrawdown * 100).toFixed(2)}%</div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Win Rate</div>
                                <div className="text-lg font-bold">{Number(metrics?.winRate * 100).toFixed(2)}%</div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Annualized Return</div>
                                <div
                                    className={`text-lg font-bold ${calculateAnnualizedReturn(backtestData) >= 0 ? "text-green-500" : "text-red-500"}`}
                                >
                                    {calculateAnnualizedReturn(backtestData).toFixed(2)}%
                                </div>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">Sortino Ratio</div>
                                <div className="text-lg font-bold">{calculateSortinoRatio(backtestData).toFixed(2)}</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Strategy Parameters</CardTitle>
                        <CardDescription>Configuration used for this backtest</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                {backtestData.params &&
                                    Object.entries(backtestData.params)
                                        .filter(([_, v]) =>
                                            v != null &&
                                            !(typeof v === 'string' && v.trim() === '') &&
                                            !(Array.isArray(v) && v.length === 0) &&
                                            !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
                                        )
                                        .map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                                                <div className="text-sm font-medium">{key}</div>
                                                <div className="text-sm">{value}</div>
                                            </div>
                                        ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {/* Return Distribution Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Return Distribution</CardTitle>
                        <CardDescription>Distribution of daily returns</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {isLoading ? (
                                <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={backtestData.returnDistribution}
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
                                        <Bar dataKey="count" name="Frequency" fill="#10b981" radius={[4, 4, 0, 0]}>
                                            {backtestData.returnDistribution?.map((entry, index) => (
                                                <Cell key={`cell-dist-${index}`} fill={entry.binValue >= 0 ? "#10b981" : "#ef4444"} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* New Volatility Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>Return Volatility</CardTitle>
                        <CardDescription>Rolling returns over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart
                                    data={rollingReturns}
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
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 12 }}
                                        width={40}
                                        tickFormatter={(value) => `${value}%`}
                                    />
                                    <Tooltip
                                        formatter={(value) => [`${Number(value).toFixed(2)}%`, "Returns"]}
                                        labelFormatter={(label) => `Date: ${label}`}
                                    />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="rollingReturn"
                                        name="Strategy"
                                        stroke="#10b981"
                                        fill="#10b981"
                                        fillOpacity={0.3}
                                    />
                                    {/* <Area
                                        type="monotone"
                                        dataKey="marketRollingReturn"
                                        name="Market"
                                        stroke="#3b82f6"
                                        fill="#3b82f6"
                                        fillOpacity={0.3}
                                    /> */}
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

// Helper function to calculate rolling returns
function calculateRollingReturns(balances: any[], window = 7) {
    if (!balances || balances.length <= window) return []

    const result = []

    for (let i = window; i < balances.length; i++) {
        const startBalance = balances[i - window].balance
        const endBalance = balances[i].balance
        const rollingReturn = ((endBalance - startBalance) / startBalance) * 100

        const startMarketBalance = balances[i - window].marketBalance
        const endMarketBalance = balances[i].marketBalance
        const marketRollingReturn = ((endMarketBalance - startMarketBalance) / startMarketBalance) * 100

        result.push({
            ...balances[i],
            rollingReturn,
            marketRollingReturn,
        })
    }

    return result
}

// Helper function to calculate annualized return
function calculateAnnualizedReturn(backtestData: any) {
    if (!backtestData || !backtestData.balances || backtestData.balances.length === 0) return 0

    const firstBalance = backtestData.balances[0].balance
    const lastBalance = backtestData.balances[backtestData.balances.length - 1].balance
    const totalReturn = (lastBalance - firstBalance) / firstBalance

    // Calculate number of days in the backtest
    const firstDate = new Date(backtestData.balances[0].date)
    const lastDate = new Date(backtestData.balances[backtestData.balances.length - 1].date)
    const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)

    // Annualize the return (assuming 365 days in a year)
    const annualizedReturn = (Math.pow(1 + totalReturn, 365 / Math.max(1, daysDiff)) - 1) * 100

    return annualizedReturn
}

// Helper function to calculate Sortino ratio (downside risk only)
function calculateSortinoRatio(backtestData: any) {
    if (!backtestData || !backtestData.balances || backtestData.balances.length <= 1) return 0

    // Calculate daily returns
    const returns = []
    for (let i = 1; i < backtestData.balances.length; i++) {
        const prevBalance = backtestData.balances[i - 1].balance
        const currentBalance = backtestData.balances[i].balance
        returns.push((currentBalance - prevBalance) / prevBalance)
    }

    // Calculate average return
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length

    // Calculate downside deviation (only negative returns)
    const negativeReturns = returns.filter((r) => r < 0)
    const downsideDeviation =
        negativeReturns.length > 0
            ? Math.sqrt(negativeReturns.reduce((sum, r) => sum + Math.pow(r, 2), 0) / negativeReturns.length)
            : 0.0001 // Avoid division by zero

    // Calculate Sortino ratio (annualized)
    const sortinoRatio = (avgReturn * 252) / (downsideDeviation * Math.sqrt(252))

    return sortinoRatio
}

// Helper function to calculate monthly risk-return data
function calculateMonthlyRiskReturn(backtestData: any) {
    if (!backtestData || !backtestData.monthlyReturns || backtestData.monthlyReturns.length === 0) {
        return []
    }

    // Group data by month
    const monthlyData = backtestData.monthlyReturns.map((month: any) => {
        // Calculate risk as the standard deviation of daily returns for that month
        // For simplicity, we'll use a random value between 1-5 as a placeholder
        // In a real implementation, you would calculate this from daily data
        const risk = 1 + Math.random() * 4
        const marketRisk = 1 + Math.random() * 4

        return {
            month: month.month,
            return: month.strategyReturn,
            marketReturn: month.marketReturn,
            risk: risk,
            marketRisk: marketRisk,
        }
    })

    return monthlyData
}

