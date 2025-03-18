"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import {
    ResponsiveContainer,
    CartesianGrid,
    XAxis,
    YAxis,
    AreaChart,
    Area,
    Tooltip,
    Legend,
    Bar,
    BarChart,
    ComposedChart,
    Cell,
} from "recharts"
import {
    ArrowLeftIcon,
    TrendingUp,
    BarChart3,
    Activity,
    CalendarIcon,
    FilterIcon,
    DownloadIcon,
    HistoryIcon,
    ClockIcon,
} from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Mock data for backtest results
const generateBacktestData = (days = 180, initialBalance = 10000, volatility = 0.02, trend = 0.0003) => {
    const data = []
    let balance = initialBalance
    let marketBalance = initialBalance
    const date = new Date()
    date.setDate(date.getDate() - days)

    // Generate trades
    const trades = []
    for (let i = 0; i < 15; i++) {
        const tradeDay = Math.floor(Math.random() * days)
        const isWin = Math.random() > 0.4
        trades.push({
            day: tradeDay,
            type: Math.random() > 0.5 ? "buy" : "sell",
            result: isWin ? "win" : "loss",
            profit: isWin ? Math.random() * 500 : -Math.random() * 300,
        })
    }

    // Sort trades by day
    trades.sort((a, b) => a.day - b.day)

    for (let i = 0; i < days; i++) {
        const dayDate = new Date(date)
        dayDate.setDate(date.getDate() + i)

        // Market movement
        const marketChange = (Math.random() - 0.5) * volatility + trend
        marketBalance = marketBalance * (1 + marketChange)

        // Strategy movement
        const strategyChange = (Math.random() - 0.4) * volatility + trend * 1.2
        balance = balance * (1 + strategyChange)

        // Find trades for this day
        const dayTrades = trades.filter((t) => t.day === i)
        if (dayTrades.length > 0) {
            dayTrades.forEach((trade) => {
                balance += trade.profit
            })
        }

        data.push({
            date: dayDate.toISOString().split("T")[0],
            balance: Math.round(balance * 100) / 100,
            marketBalance: Math.round(marketBalance * 100) / 100,
            trades: dayTrades.length,
        })
    }

    return { data, trades }
}

// Generate historical backtest data with a fixed seed for consistency
const generateHistoricalBacktestData = (days = 180, version = 1) => {
    // Use fixed values for historical data to ensure consistency
    const data = []
    // Adjust initial balance based on version to create different results
    let balance = 10000 + version * 500
    let marketBalance = 10000
    const date = new Date()
    date.setDate(date.getDate() - days)

    // Generate fixed trades with slight variations based on version
    const trades = [
        { day: 5, type: "buy", result: "win", profit: 320.45 + version * 20 },
        { day: 12, type: "sell", result: "loss", profit: -150.2 - version * 10 },
        { day: 25, type: "buy", result: "win", profit: 450.8 + version * 15 },
        { day: 40, type: "buy", result: "win", profit: 280.3 + version * 25 },
        { day: 55, type: "sell", result: "loss", profit: -200.1 - version * 5 },
        { day: 70, type: "buy", result: "win", profit: 380.6 + version * 30 },
        { day: 85, type: "sell", result: "win", profit: 210.4 + version * 10 },
        { day: 100, type: "buy", result: "loss", profit: -120.75 - version * 15 },
        { day: 115, type: "sell", result: "win", profit: 290.25 + version * 20 },
        { day: 130, type: "buy", result: "win", profit: 340.5 + version * 25 },
        { day: 145, type: "sell", result: "loss", profit: -180.3 - version * 10 },
        { day: 160, type: "buy", result: "win", profit: 420.15 + version * 15 },
    ]

    for (let i = 0; i < days; i++) {
        const dayDate = new Date(date)
        dayDate.setDate(date.getDate() + i)

        // Deterministic market movement
        const marketChange = Math.sin(i * 0.1) * 0.01 + 0.0003
        marketBalance = marketBalance * (1 + marketChange)

        // Deterministic strategy movement with version-based variation
        const strategyChange = Math.sin(i * 0.1 + 0.5) * (0.012 + version * 0.001) + 0.0005
        balance = balance * (1 + strategyChange)

        // Find trades for this day
        const dayTrades = trades.filter((t) => t.day === i)
        if (dayTrades.length > 0) {
            dayTrades.forEach((trade) => {
                balance += trade.profit
            })
        }

        data.push({
            date: dayDate.toISOString().split("T")[0],
            balance: Math.round(balance * 100) / 100,
            marketBalance: Math.round(marketBalance * 100) / 100,
            trades: dayTrades.length,
        })
    }

    return { data, trades }
}

// Custom tooltip for backtest chart
const BacktestTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover text-popover-foreground shadow-md rounded-md p-3 text-sm border border-border">
                <p className="font-medium mb-1">{`Date: ${label}`}</p>
                <p className="text-green-500">{`Strategy: $${payload[0].value.toLocaleString()}`}</p>
                <p className="text-blue-500">{`Market: $${payload[1].value.toLocaleString()}`}</p>
                {payload[2]?.value > 0 && <p className="text-orange-500 mt-1">{`Trades: ${payload[2].value}`}</p>}
            </div>
        )
    }
    return null
}

// Custom tooltip for trade analysis
const TradeTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover text-popover-foreground shadow-md rounded-md p-3 text-sm border border-border">
                <p className="font-medium mb-1">{`${label}`}</p>
                <p className={payload[0].value >= 0 ? "text-green-500" : "text-red-500"}>
                    {`Profit: ${payload[0].value >= 0 ? "+" : ""}$${payload[0].value.toLocaleString()}`}
                </p>
            </div>
        )
    }
    return null
}

// Mock backtest run history
const backtestRunHistory = [
    { id: 1, date: "2025-03-18T09:30:00", version: 1, parameters: { smaFast: 10, smaSlow: 50, riskLevel: "medium" } },
    { id: 2, date: "2025-03-17T14:45:00", version: 2, parameters: { smaFast: 12, smaSlow: 50, riskLevel: "medium" } },
    { id: 3, date: "2025-03-15T11:20:00", version: 3, parameters: { smaFast: 10, smaSlow: 45, riskLevel: "high" } },
    { id: 4, date: "2025-03-10T16:15:00", version: 4, parameters: { smaFast: 8, smaSlow: 40, riskLevel: "low" } },
    { id: 5, date: "2025-03-05T10:00:00", version: 5, parameters: { smaFast: 15, smaSlow: 60, riskLevel: "medium" } },
]

export default function BacktestPage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [timeframe, setTimeframe] = useState("6m")
    const [backtestData, setBacktestData] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)
    // Add a progress state to track backtest calculation progress
    const [progress, setProgress] = useState(0)
    const [isCalculating, setIsCalculating] = useState(false)
    // Add state for backtest run versions
    const [selectedRunVersion, setSelectedRunVersion] = useState<number>(1)
    const [runHistory, setRunHistory] = useState(backtestRunHistory)
    const [showRunHistory, setShowRunHistory] = useState(false)

    // Check if we're viewing historical data
    const isHistorical = searchParams.get("mode") === "historical"

    // Get strategy ID from URL params
    const strategyId = typeof params.crypto === "string" ? params.crypto : "1"

    // Define loadBacktestData outside of useEffect so it can be called from the button
    const loadBacktestData = async () => {
        try {
            setIsLoading(true)
            setIsCalculating(true)
            setProgress(0)
            setShowRunHistory(false)

            // Simulate backtest calculation progress
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(progressInterval)
                        return prev
                    }
                    return prev + Math.floor(Math.random() * 10) + 1
                })
            }, 300)

            // In a real app, you would fetch this data from an API
            // const data = await fetchBacktestData(strategyId, timeframe)

            // For demo, we'll generate mock data with a delay to simulate processing
            let days = 180
            switch (timeframe) {
                case "1m":
                    days = 30
                    break
                case "3m":
                    days = 90
                    break
                case "6m":
                    days = 180
                    break
                case "1y":
                    days = 365
                    break
                case "all":
                    days = 730
                    break
            }

            // Simulate API delay
            await new Promise((resolve) => setTimeout(resolve, 2500))

            const data = generateBacktestData(days)
            setBacktestData(data)

            // Complete the progress
            setProgress(100)
            clearInterval(progressInterval)

            // Add a new run to the history
            const newRun = {
                id: runHistory.length + 1,
                date: new Date().toISOString(),
                version: runHistory.length + 1,
                parameters: {
                    smaFast: 10 + Math.floor(Math.random() * 5),
                    smaSlow: 45 + Math.floor(Math.random() * 20),
                    riskLevel: ["low", "medium", "high"][Math.floor(Math.random() * 3)],
                },
            }

            setRunHistory([newRun, ...runHistory])
            setSelectedRunVersion(newRun.version)

            // Hide the progress bar after a short delay
            setTimeout(() => {
                setIsCalculating(false)
                setShowRunHistory(true)
            }, 500)
        } catch (err) {
            console.error("Failed to fetch backtest data:", err)
            setIsCalculating(false)
        } finally {
            setIsLoading(false)
        }
    }

    // Load historical data without simulation
    const loadHistoricalData = async (version = 1) => {
        try {
            setIsLoading(true)

            // For demo, we'll use a different generator for historical data
            let days = 180
            switch (timeframe) {
                case "1m":
                    days = 30
                    break
                case "3m":
                    days = 90
                    break
                case "6m":
                    days = 180
                    break
                case "1y":
                    days = 365
                    break
                case "all":
                    days = 730
                    break
            }

            // Short delay to simulate loading
            await new Promise((resolve) => setTimeout(resolve, 500))

            const data = generateHistoricalBacktestData(days, version)
            setBacktestData(data)
            setSelectedRunVersion(version)
        } catch (err) {
            console.error("Failed to fetch historical backtest data:", err)
        } finally {
            setIsLoading(false)
        }
    }

    // Load a specific backtest run version
    const loadBacktestVersion = (version: number) => {
        loadHistoricalData(version)
    }

    // Use useEffect to load data on initial render and when timeframe changes
    useEffect(() => {
        // Get timeframe from URL if available
        const urlTimeframe = searchParams.get("timeframe")
        if (urlTimeframe) {
            setTimeframe(urlTimeframe)
        }

        // Get version from URL if available
        const urlVersion = searchParams.get("version")
        if (urlVersion) {
            setSelectedRunVersion(Number.parseInt(urlVersion, 10))
            loadHistoricalData(Number.parseInt(urlVersion, 10))
        } else if (isHistorical) {
            loadHistoricalData()
        } else {
            loadBacktestData()
        }
    }, [strategyId, isHistorical, searchParams])

    // Calculate performance metrics
    const calculateMetrics = () => {
        if (!backtestData) return null

        const data = backtestData.data
        const initialBalance = data[0].balance
        const finalBalance = data[data.length - 1].balance
        const initialMarket = data[0].marketBalance
        const finalMarket = data[data.length - 1].marketBalance

        const strategyReturn = ((finalBalance - initialBalance) / initialBalance) * 100
        const marketReturn = ((finalMarket - initialMarket) / initialMarket) * 100
        const alpha = strategyReturn - marketReturn

        // Calculate drawdown
        let maxBalance = initialBalance
        let maxDrawdown = 0

        for (const day of data) {
            if (day.balance > maxBalance) {
                maxBalance = day.balance
            }

            const drawdown = ((maxBalance - day.balance) / maxBalance) * 100
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown
            }
        }

        // Calculate win rate
        const trades = backtestData.trades
        const winningTrades = trades.filter((t) => t.result === "win").length
        const winRate = (winningTrades / trades.length) * 100

        // Calculate Sharpe ratio (simplified)
        const returns = []
        for (let i = 1; i < data.length; i++) {
            returns.push((data[i].balance - data[i - 1].balance) / data[i - 1].balance)
        }

        const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
        const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length)
        const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252) // Annualized

        return {
            strategyReturn: strategyReturn.toFixed(2),
            marketReturn: marketReturn.toFixed(2),
            alpha: alpha.toFixed(2),
            maxDrawdown: maxDrawdown.toFixed(2),
            winRate: winRate.toFixed(2),
            totalTrades: trades.length,
            sharpeRatio: sharpeRatio.toFixed(2),
        }
    }

    const metrics = calculateMetrics()

    // Prepare trade data for visualization
    const prepareTradeData = () => {
        if (!backtestData) return []

        return backtestData.trades.map((trade, index) => ({
            id: index + 1,
            profit: trade.profit,
            type: trade.type,
            result: trade.result,
        }))
    }

    const tradeData = prepareTradeData()

    // Let's create helper functions to prepare the data outside of the JSX
    // Add these functions before the return statement

    // Add this after the metrics calculation
    const prepareMonthlyData = () => {
        if (!backtestData) return []

        // Group by month and calculate returns
        const monthlyData = []
        const months = {}

        backtestData.data.forEach((d) => {
            const date = new Date(d.date)
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

            if (!months[monthKey]) {
                months[monthKey] = {
                    month: `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
                    initialBalance: d.balance,
                    finalBalance: d.balance,
                    initialMarket: d.marketBalance,
                    finalMarket: d.marketBalance,
                }
            } else {
                months[monthKey].finalBalance = d.balance
                months[monthKey].finalMarket = d.marketBalance
            }
        })

        Object.values(months).forEach((m: any) => {
            const strategyReturn = ((m.finalBalance - m.initialBalance) / m.initialBalance) * 100
            const marketReturn = ((m.finalMarket - m.initialMarket) / m.initialMarket) * 100

            monthlyData.push({
                month: m.month,
                strategyReturn: strategyReturn,
                marketReturn: marketReturn,
            })
        })

        return monthlyData
    }

    const prepareReturnsData = () => {
        if (!backtestData) return []

        // Calculate daily returns
        const returns = []
        for (let i = 1; i < backtestData.data.length; i++) {
            const prevBalance = backtestData.data[i - 1].balance
            const currentBalance = backtestData.data[i].balance
            const dailyReturn = ((currentBalance - prevBalance) / prevBalance) * 100

            returns.push({
                date: backtestData.data[i].date,
                return: dailyReturn,
            })
        }
        return returns
    }

    const prepareDistributionData = () => {
        if (!backtestData) return []

        // Calculate return distribution
        const returns = []
        for (let i = 1; i < backtestData.data.length; i++) {
            const prevBalance = backtestData.data[i - 1].balance
            const currentBalance = backtestData.data[i].balance
            const dailyReturn = ((currentBalance - prevBalance) / prevBalance) * 100
            returns.push(dailyReturn)
        }

        // Create bins for histogram
        const min = Math.floor(Math.min(...returns))
        const max = Math.ceil(Math.max(...returns))
        const binSize = 0.5
        const bins = {}

        for (let i = min; i <= max; i += binSize) {
            bins[i.toFixed(1)] = 0
        }

        // Count occurrences in each bin
        returns.forEach((ret) => {
            const binKey = (Math.floor(ret / binSize) * binSize).toFixed(1)
            if (bins[binKey] !== undefined) {
                bins[binKey]++
            }
        })

        // Convert to array for chart
        return Object.entries(bins).map(([bin, count]) => ({
            bin: `${bin}%`,
            count: count,
            binValue: Number.parseFloat(bin),
        }))
    }

    // Add a function to get progress color based on current progress
    const getProgressColor = () => {
        if (progress < 30) return "bg-orange-500"
        if (progress < 70) return "bg-blue-500"
        return "bg-green-500"
    }

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return date.toLocaleString()
    }

    // Add these lines after the tradeData calculation
    const monthlyData = prepareMonthlyData()
    const returnsData = prepareReturnsData()
    const distributionData = prepareDistributionData()

    return (
        <div className="container py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <span>Strategy Backtest Results</span>
                            <Badge className="ml-3">Moving Average Crossover</Badge>
                            {isHistorical && (
                                <Badge variant="outline" className="ml-2">
                                    Historical
                                </Badge>
                            )}
                            <Badge variant="secondary" className="ml-2">
                                Run #{selectedRunVersion}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">Historical performance analysis and trade statistics</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="w-[120px]">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1m">1 Month</SelectItem>
                            <SelectItem value="3m">3 Months</SelectItem>
                            <SelectItem value="6m">6 Months</SelectItem>
                            <SelectItem value="1y">1 Year</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Run History Dropdown */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <HistoryIcon className="mr-2 h-4 w-4" />
                                Run History
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56">
                            <DropdownMenuLabel>Backtest Runs</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {runHistory.map((run) => (
                                <DropdownMenuItem
                                    key={run.id}
                                    onClick={() => loadBacktestVersion(run.version)}
                                    className={selectedRunVersion === run.version ? "bg-muted" : ""}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <ClockIcon className="mr-2 h-4 w-4" />
                                            <span className="font-medium">Run #{run.version}</span>
                                            {selectedRunVersion === run.version && <Badge className="ml-2 text-xs">Current</Badge>}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">{formatDate(run.date)}</div>
                                    </div>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button onClick={() => loadBacktestData()} disabled={isCalculating} className="ml-2">
                        {isCalculating ? (
                            <>
                                <span className="mr-2">Running...</span>
                                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                            </>
                        ) : (
                            <>
                                <Activity className="mr-2 h-4 w-4" />
                                Run Backtest
                            </>
                        )}
                    </Button>
                    <Button variant="outline" size="icon">
                        <FilterIcon className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon">
                        <DownloadIcon className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Show run details if a new run was just completed */}
            {showRunHistory && (
                <Card className="mb-6 bg-muted/30">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium">Backtest Run #{selectedRunVersion}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {formatDate(runHistory.find((r) => r.version === selectedRunVersion)?.date || "")}
                                </p>
                            </div>
                            <div className="flex space-x-4">
                                {runHistory.find((r) => r.version === selectedRunVersion)?.parameters && (
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Parameters</span>
                                        <div className="flex space-x-2 mt-1">
                                            {Object.entries(runHistory.find((r) => r.version === selectedRunVersion)?.parameters || {}).map(
                                                ([key, value]) => (
                                                    <Badge key={key} variant="outline" className="text-xs">
                                                        {key}: {value}
                                                    </Badge>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Strategy Return</div>
                        <div
                            className={`text-2xl font-bold ${Number(metrics?.strategyReturn) >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                            {metrics?.strategyReturn}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Alpha</div>
                        <div className={`text-2xl font-bold ${Number(metrics?.alpha) >= 0 ? "text-green-500" : "text-red-500"}`}>
                            {metrics?.alpha}%
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Max Drawdown</div>
                        <div className="text-2xl font-bold text-red-500">{metrics?.maxDrawdown}%</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-sm text-muted-foreground">Win Rate</div>
                        <div className="text-2xl font-bold">{metrics?.winRate}%</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="performance" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 w-full max-w-md">
                    <TabsTrigger value="performance" className="flex items-center">
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Performance
                    </TabsTrigger>
                    <TabsTrigger value="trades" className="flex items-center">
                        <Activity className="mr-2 h-4 w-4" />
                        Trades
                    </TabsTrigger>
                    <TabsTrigger value="statistics" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Statistics
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="performance" className="mt-0">
                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Comparison</CardTitle>
                            <CardDescription>Strategy performance vs market benchmark</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isCalculating && (
                                <div className="mb-4">
                                    <div className="text-sm font-medium mb-1">Calculating Backtest... {progress}%</div>
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                        <div
                                            className={`h-2.5 rounded-full transition-all duration-500 ease-out ${getProgressColor()}`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                            <div className="h-[400px]">
                                {isLoading ? (
                                    <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                                ) : (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <ComposedChart
                                            data={backtestData?.data}
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
                                            <Area
                                                yAxisId="left"
                                                type="monotone"
                                                dataKey="marketBalance"
                                                name="Market"
                                                stroke="#3b82f6"
                                                fill="#3b82f6"
                                                fillOpacity={0.3}
                                            />
                                            <Bar yAxisId="right" dataKey="trades" name="Trades" fill="#f97316" radius={[4, 4, 0, 0]} />
                                        </ComposedChart>
                                    </ResponsiveContainer>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Drawdown Analysis</CardTitle>
                                <CardDescription>Historical drawdown periods</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    {isLoading ? (
                                        <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart
                                                data={backtestData?.data.map((d, i, arr) => {
                                                    let maxBalance = d.balance
                                                    for (let j = 0; j <= i; j++) {
                                                        if (arr[j].balance > maxBalance) maxBalance = arr[j].balance
                                                    }
                                                    const drawdown = ((maxBalance - d.balance) / maxBalance) * 100
                                                    return {
                                                        ...d,
                                                        drawdown: drawdown,
                                                    }
                                                })}
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
                                                    domain={[0, "dataMax + 5"]}
                                                    reversed
                                                />
                                                <Tooltip
                                                    formatter={(value) => {
                                                        const numericValue = typeof value === "number" ? value : parseFloat(value as string);
                                                        return [`${numericValue.toFixed(2)}%`, "Drawdown"];
                                                    }}
                                                />
                                                <Area
                                                    type="monotone"
                                                    dataKey="drawdown"
                                                    name="Drawdown"
                                                    stroke="#ef4444"
                                                    fill="#ef4444"
                                                    fillOpacity={0.3}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Monthly Returns</CardTitle>
                                <CardDescription>Performance breakdown by month</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px]">
                                    {isLoading ? (
                                        <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                                    ) : (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <BarChart
                                                data={monthlyData}
                                                margin={{
                                                    top: 20,
                                                    right: 20,
                                                    left: 20,
                                                    bottom: 60,
                                                }}
                                            >
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                                <XAxis
                                                    dataKey="month"
                                                    axisLine={false}
                                                    tickLine={false}
                                                    height={60}
                                                    tick={(props) => {
                                                        const { x, y, payload } = props;
                                                        return (
                                                            <text
                                                                x={x}
                                                                y={y}
                                                                dy={10} // Adjust vertical position
                                                                transform={`rotate(-45, ${x}, ${y})`} // Rotate the text
                                                                textAnchor="end"
                                                                fontSize={12}
                                                                fill="#666"
                                                            >
                                                                {payload.value}
                                                            </text>
                                                        );
                                                    }}
                                                />

                                                <XAxis
                                                    axisLine={false}
                                                    tickLine={false}
                                                    tick={(props) => {
                                                        const { x, y, payload } = props;
                                                        return (
                                                            <text
                                                                x={x}
                                                                y={y}
                                                                dy={10} // Adjust vertical position
                                                                transform={`rotate(-45, ${x}, ${y})`} // Rotate text
                                                                textAnchor="end"
                                                                fontSize={12}
                                                                fill="#666"
                                                            >
                                                                {payload.value}
                                                            </text>
                                                        );
                                                    }}
                                                    height={60}
                                                />
                                                <Tooltip formatter={(value) => {
                                                    const numericValue = typeof value === "number" ? value : parseFloat(value as string);
                                                    return [`${numericValue.toFixed(2)}%`, numericValue >= 0 ? "Return" : "Loss"]
                                                }
                                                } />
                                                <Legend />
                                                <Bar dataKey="strategyReturn" name="Strategy" fill="#10b981" radius={[4, 4, 0, 0]}>
                                                    {monthlyData.map((entry, index) => (
                                                        <Cell
                                                            key={`cell-strategy-${index}`}
                                                            fill={entry.strategyReturn >= 0 ? "#10b981" : "#ef4444"}
                                                        />
                                                    ))}
                                                </Bar>
                                                <Bar dataKey="marketReturn" name="Market" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                                                    {monthlyData.map((entry, index) => (
                                                        <Cell key={`cell-market-${index}`} fill={entry.marketReturn >= 0 ? "#3b82f6" : "#6b7280"} />
                                                    ))}
                                                </Bar>
                                            </BarChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="trades" className="mt-0">
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
                                        <div className="text-xl font-bold">{metrics?.totalTrades}</div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Win Rate</div>
                                        <div className="text-xl font-bold">{metrics?.winRate}%</div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Average Profit</div>
                                        <div className="text-xl font-bold text-green-500">
                                            $
                                            {tradeData.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0) /
                                                Math.max(1, tradeData.filter((t) => t.profit > 0).length).toFixed(2)}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Average Loss</div>
                                        <div className="text-xl font-bold text-red-500">
                                            $
                                            {tradeData.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0) /
                                                Math.max(1, tradeData.filter((t) => t.profit < 0).length).toFixed(2)}
                                        </div>
                                    </div>

                                    <Separator />

                                    <div>
                                        <div className="text-sm text-muted-foreground mb-1">Profit Factor</div>
                                        <div className="text-xl font-bold">
                                            {(
                                                Math.abs(tradeData.filter((t) => t.profit > 0).reduce((sum, t) => sum + t.profit, 0)) /
                                                Math.max(
                                                    1,
                                                    Math.abs(tradeData.filter((t) => t.profit < 0).reduce((sum, t) => sum + t.profit, 0)),
                                                )
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

                    <Card className="mt-6">
                        <CardHeader>
                            <CardTitle>Trade List</CardTitle>
                            <CardDescription>Detailed record of all trades</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b bg-muted/50">
                                            <th className="p-3 text-left text-sm font-medium">ID</th>
                                            <th className="p-3 text-left text-sm font-medium">Type</th>
                                            <th className="p-3 text-left text-sm font-medium">Result</th>
                                            <th className="p-3 text-right text-sm font-medium">Profit/Loss</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {tradeData.map((trade) => (
                                            <tr key={trade.id} className="border-b">
                                                <td className="p-3 text-sm">{trade.id}</td>
                                                <td className="p-3 text-sm">
                                                    <Badge variant={trade.type === "buy" ? "default" : "secondary"}>
                                                        {trade.type === "buy" ? "Buy" : "Sell"}
                                                    </Badge>
                                                </td>
                                                <td className="p-3 text-sm">
                                                    <Badge
                                                        variant={trade.result === "win" ? "outline" : "destructive"}
                                                        className={trade.result === "win" ? "text-green-500 border-green-200" : ""}
                                                    >
                                                        {trade.result === "win" ? "Win" : "Loss"}
                                                    </Badge>
                                                </td>
                                                <td
                                                    className={`p-3 text-sm text-right ${trade.profit >= 0 ? "text-green-500" : "text-red-500"}`}
                                                >
                                                    {trade.profit >= 0 ? "+" : ""}${trade.profit.toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="statistics" className="mt-0">
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
                                            className={`text-lg font-bold ${Number(metrics?.strategyReturn) >= 0 ? "text-green-500" : "text-red-500"}`}
                                        >
                                            {metrics?.strategyReturn}%
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">Market Return</div>
                                        <div
                                            className={`text-lg font-bold ${Number(metrics?.marketReturn) >= 0 ? "text-green-500" : "text-red-500"}`}
                                        >
                                            {metrics?.marketReturn}%
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">Alpha</div>
                                        <div
                                            className={`text-lg font-bold ${Number(metrics?.alpha) >= 0 ? "text-green-500" : "text-red-500"}`}
                                        >
                                            {metrics?.alpha}%
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                                        <div className="text-lg font-bold">{metrics?.sharpeRatio}</div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">Max Drawdown</div>
                                        <div className="text-lg font-bold text-red-500">{metrics?.maxDrawdown}%</div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="text-sm text-muted-foreground">Win Rate</div>
                                        <div className="text-lg font-bold">{metrics?.winRate}%</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Risk Analysis</CardTitle>
                                <CardDescription>Risk metrics and volatility</CardDescription>
                            </CardHeader>
                            <CardContent></CardContent>
                        </Card>
                    </div>
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
                                            data={distributionData}
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
                                                {distributionData.map((entry, index) => (
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
            </Tabs>
        </div>
    )
}

