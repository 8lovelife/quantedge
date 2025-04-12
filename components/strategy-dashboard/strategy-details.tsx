"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ArrowLeft,
    Edit,
    BarChart3,
    LineChart,
    StopCircle,
    RefreshCw,
    Bell,
    Settings,
    Coins,
    ShieldAlert,
    CheckCircle2,
    AlertTriangle,
    Beaker,
    Clock,
    Rocket,
    FileEdit,
    ChevronRight,
    ArrowLeftIcon,
} from "lucide-react"
import { toast } from "sonner"

// Replace the single mockStrategy with a function that returns different mock data based on ID

function formatLabel(key: string): string {
    return key
        .replace(/([A-Z])/g, " $1")     // insert space before capital letters
        .replace(/^./, (s) => s.toUpperCase()); // capitalize first letter
}

function formatValue(key: string, value: unknown): string {
    if (typeof value === "boolean") {
        return value ? "Enabled" : "Disabled"
    }

    if (typeof value === "number") {
        // Heuristic: Add % if key contains common sizing or threshold terms
        const percentKeywords = ["size", "percent", "ratio", "threshold"]
        if (percentKeywords.some((k) => key.toLowerCase().includes(k))) {
            return `${value}%`
        }
    }

    return `${value}`
}

// Mock data for strategies based on ID
function getMockStrategyById(id: number) {
    // Draft strategy
    if (id === 1) {
        return {
            id: 1,
            name: "Mean Reversion BTC",
            type: "Mean-Reversion",
            status: "draft", // Strategy is in draft stage
            created: "2023-06-15",
            updated: "2023-06-15",
            performance: null, // No performance data yet
            description: "Basic mean reversion strategy for Bitcoin",
            configuration: {
                parameters: {
                    lookbackPeriod: 20,
                    deviationThreshold: 2.5,
                    meanReversionStrength: 70,
                },
                assets: ["BTC/USDT"],
                timeframe: "4h",
                riskManagement: {
                    positionSize: 3,
                    maxPositions: 2,
                    stopLoss: 2.5,
                    takeProfit: 4,
                    trailingStop: false,
                },
            },
            trades: [], // No trades yet
            logs: [], // No logs yet
        }
    }

    // Backtested strategy
    else if (id === 2) {
        return {
            id: 2,
            name: "Momentum ETH",
            type: "Momentum",
            status: "backtest", // Strategy has been backtested
            created: "2023-06-10",
            updated: "2023-06-14",
            performance: {
                return: 18.5,
                sharpe: 1.92,
                drawdown: 12.3,
                winRate: 68.4,
                profitFactor: 2.3,
                averageTrade: 1.2,
                maxConsecutiveLosses: 3,
            },
            description: "Momentum strategy for Ethereum with RSI filter",
            configuration: {
                parameters: {
                    rsiPeriod: 14,
                    rsiLower: 30,
                    rsiUpper: 70,
                    momentumStrength: 65,
                },
                assets: ["ETH/USDT"],
                timeframe: "1h",
                riskManagement: {
                    positionSize: 5,
                    maxPositions: 3,
                    stopLoss: 2,
                    takeProfit: 5,
                    trailingStop: false,
                },
            },
            trades: [
                {
                    id: 1,
                    date: "2023-06-14",
                    type: "BUY",
                    asset: "ETH/USDT",
                    price: 1850.25,
                    size: 0.5,
                    pnl: 2.3,
                    status: "CLOSED",
                },
                {
                    id: 2,
                    date: "2023-06-13",
                    type: "SELL",
                    asset: "ETH/USDT",
                    price: 1820.75,
                    size: 0.5,
                    pnl: -1.2,
                    status: "CLOSED",
                },
                {
                    id: 3,
                    date: "2023-06-12",
                    type: "BUY",
                    asset: "ETH/USDT",
                    price: 1805.5,
                    size: 0.5,
                    pnl: 3.5,
                    status: "CLOSED",
                },
            ],
            logs: [
                { timestamp: "2023-06-14T10:15:00Z", level: "INFO", message: "Backtest completed successfully" },
                { timestamp: "2023-06-14T10:14:55Z", level: "INFO", message: "Processing trade #3" },
                { timestamp: "2023-06-14T10:14:50Z", level: "INFO", message: "Processing trade #2" },
                { timestamp: "2023-06-14T10:14:45Z", level: "INFO", message: "Processing trade #1" },
                { timestamp: "2023-06-14T10:14:30Z", level: "INFO", message: "Starting backtest for ETH/USDT" },
            ],
        }
    }

    // Paper trading strategy
    else if (id === 3) {
        return {
            id: 3,
            name: "Breakout Multi-Asset",
            type: "Breakout",
            status: "paper", // Strategy is in paper trading mode
            created: "2023-05-20",
            updated: "2023-06-12",
            performance: {
                return: 24.7,
                sharpe: 2.15,
                drawdown: 8.7,
                winRate: 72.1,
                profitFactor: 2.8,
                averageTrade: 1.5,
                maxConsecutiveLosses: 2,
            },
            paperPerformance: {
                // Additional paper trading performance data
                currentReturn: 8.3,
                openPositions: 2,
                lastTradeTime: "2023-06-16T14:32:00Z",
                runningTime: "3 days",
            },
            description: "Multi-asset breakout strategy with volume confirmation",
            configuration: {
                parameters: {
                    breakoutPeriod: 20,
                    volumeThreshold: 1.5,
                    confirmationCandles: 2,
                },
                assets: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
                timeframe: "2h",
                riskManagement: {
                    positionSize: 4,
                    maxPositions: 3,
                    stopLoss: 3,
                    takeProfit: 6,
                    trailingStop: true,
                },
            },
            trades: [
                {
                    id: 1,
                    date: "2023-06-16",
                    type: "BUY",
                    asset: "BTC/USDT",
                    price: 26750.5,
                    size: 0.02,
                    pnl: null,
                    status: "OPEN",
                },
                {
                    id: 2,
                    date: "2023-06-15",
                    type: "BUY",
                    asset: "SOL/USDT",
                    price: 15.75,
                    size: 10,
                    pnl: 3.2,
                    status: "OPEN",
                },
                {
                    id: 3,
                    date: "2023-06-14",
                    type: "SELL",
                    asset: "ETH/USDT",
                    price: 1740.25,
                    size: 0.3,
                    pnl: 2.1,
                    status: "CLOSED",
                },
            ],
            logs: [
                { timestamp: "2023-06-16T14:32:00Z", level: "INFO", message: "Opened BTC/USDT long position at $26750.50" },
                { timestamp: "2023-06-16T14:31:55Z", level: "INFO", message: "Breakout detected on BTC/USDT" },
                { timestamp: "2023-06-15T09:15:30Z", level: "INFO", message: "Opened SOL/USDT long position at $15.75" },
                { timestamp: "2023-06-14T16:22:10Z", level: "INFO", message: "Closed ETH/USDT position with 2.1% profit" },
                { timestamp: "2023-06-13T10:00:00Z", level: "INFO", message: "Paper trading started" },
            ],
        }
    }

    // Live trading strategy
    else if (id === 4) {
        return {
            id: 4,
            name: "RSI Divergence",
            type: "Custom",
            status: "live", // Strategy is in live trading mode
            created: "2023-04-05",
            updated: "2023-06-01",
            performance: {
                return: 32.1,
                sharpe: 2.43,
                drawdown: 14.2,
                winRate: 74.6,
                profitFactor: 3.1,
                averageTrade: 1.8,
                maxConsecutiveLosses: 2,
            },
            livePerformance: {
                // Additional live trading performance data
                currentReturn: 15.7,
                openPositions: 3,
                lastTradeTime: "2023-06-16T15:45:00Z",
                runningTime: "7 days",
                totalTrades: 12,
                profitableTrades: 9,
            },
            description: "RSI divergence strategy with multiple timeframe analysis",
            configuration: {
                parameters: {
                    rsiPeriod: 14,
                    divergenceThreshold: 10,
                    confirmationPeriod: 3,
                },
                assets: ["BTC/USDT", "ETH/USDT", "ADA/USDT", "DOT/USDT"],
                timeframe: "1h",
                riskManagement: {
                    positionSize: 5,
                    maxPositions: 4,
                    stopLoss: 2.5,
                    takeProfit: 7.5,
                    trailingStop: true,
                },
            },
            trades: [
                {
                    id: 1,
                    date: "2023-06-16",
                    type: "BUY",
                    asset: "DOT/USDT",
                    price: 5.25,
                    size: 50,
                    pnl: 1.2,
                    status: "OPEN",
                },
                {
                    id: 2,
                    date: "2023-06-15",
                    type: "BUY",
                    asset: "ADA/USDT",
                    price: 0.28,
                    size: 1000,
                    pnl: 3.5,
                    status: "OPEN",
                },
                {
                    id: 3,
                    date: "2023-06-14",
                    type: "BUY",
                    asset: "ETH/USDT",
                    price: 1720.5,
                    size: 0.5,
                    pnl: 2.8,
                    status: "OPEN",
                },
                {
                    id: 4,
                    date: "2023-06-13",
                    type: "SELL",
                    asset: "BTC/USDT",
                    price: 25980.75,
                    size: 0.05,
                    pnl: 4.2,
                    status: "CLOSED",
                },
            ],
            logs: [
                { timestamp: "2023-06-16T15:45:00Z", level: "INFO", message: "Opened DOT/USDT long position at $5.25" },
                { timestamp: "2023-06-16T15:44:50Z", level: "INFO", message: "RSI divergence detected on DOT/USDT" },
                { timestamp: "2023-06-15T12:30:15Z", level: "INFO", message: "Opened ADA/USDT long position at $0.28" },
                { timestamp: "2023-06-14T09:15:30Z", level: "INFO", message: "Opened ETH/USDT long position at $1720.50" },
                { timestamp: "2023-06-13T14:22:10Z", level: "INFO", message: "Closed BTC/USDT position with 4.2% profit" },
                { timestamp: "2023-06-13T14:22:00Z", level: "WARNING", message: "Take profit triggered for BTC/USDT" },
            ],
            alerts: [{ type: "warning", message: "Approaching stop loss on ETH position" }],
        }
    }

    // Default fallback strategy
    else {
        return {
            id: id,
            name: "Unknown Strategy",
            type: "Custom",
            status: "draft",
            created: "2023-06-01",
            updated: "2023-06-01",
            performance: null,
            description: "Strategy details not found",
            configuration: {
                parameters: {},
                assets: [],
                timeframe: "1h",
                riskManagement: {
                    positionSize: 5,
                    maxPositions: 3,
                    stopLoss: 2,
                    takeProfit: 5,
                    trailingStop: false,
                },
            },
            trades: [],
            logs: [],
        }
    }
}

export default function StrategyDetails({ id }: { id: number }) {
    const router = useRouter()
    // Replace the useState(mockStrategy) with:
    const [strategy, setStrategy] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // Replace the useEffect with:
    useEffect(() => {
        // In a real app, you would fetch the strategy data from an API
        // For now, we'll use our mock data function
        setStrategy(getMockStrategyById(id))
    }, [id])

    const handleEditStrategy = () => {
        router.push(`/strategy-builder/${id}`)
    }

    const handleRunBacktest = () => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Backtest started",
                description: "The backtest is now running",
            })
            router.push(`/backtest/${id}`)
        }, 1000)
    }

    const handleStartPaperTrading = () => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Paper trading started",
                description: "The strategy is now running in paper trading mode",
            })

            // Update strategy status
            setStrategy({
                ...strategy,
                status: "paper",
            })
        }, 1500)
    }

    const handleGoLive = () => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Live trading started",
                description: "The strategy is now running in live trading mode",
            })

            // Update strategy status
            setStrategy({
                ...strategy,
                status: "live",
            })
        }, 1500)
    }

    const handleRestartStrategy = () => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Strategy restarted",
                description: "The strategy has been restarted successfully",
            })
        }, 1500)
    }

    const handleStopStrategy = () => {
        setIsLoading(true)

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false)
            toast({
                title: "Strategy stopped",
                description: "The strategy has been stopped successfully",
            })

            // Update strategy status
            setStrategy({
                ...strategy,
                status: "backtest", // Revert to backtested status
            })
        }, 1500)
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "draft":
                return (
                    <Badge variant="outline" className="ml-2">
                        Draft
                    </Badge>
                )
            case "backtest":
                return (
                    <Badge variant="outline" className="ml-2">
                        Backtested
                    </Badge>
                )
            case "paper":
                return (
                    <Badge variant="outline" className="ml-2">
                        Paper Trading
                    </Badge>
                )
            case "live":
                return <Badge className="bg-green-500 ml-2">Live</Badge>
            default:
                return (
                    <Badge variant="outline" className="ml-2">
                        Unknown
                    </Badge>
                )
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "draft":
                return <FileEdit className="h-5 w-5 text-muted-foreground" />
            case "backtest":
                return <Beaker className="h-5 w-5 text-violet-500" />
            case "paper":
                return <Clock className="h-5 w-5 text-blue-500" />
            case "live":
                return <Rocket className="h-5 w-5 text-green-500" />
            default:
                return <FileEdit className="h-5 w-5 text-muted-foreground" />
        }
    }

    // Get action buttons based on current status
    const getActionButtons = () => {
        if (!strategy) return null

        switch (strategy.status) {
            case "draft":
                return (
                    <>
                        <Button onClick={handleRunBacktest} disabled={isLoading}>
                            <Beaker className="mr-2 h-4 w-4" />
                            {isLoading ? "Starting..." : "Run Backtest"}
                        </Button>
                        <Button variant="outline" onClick={handleEditStrategy}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Strategy
                        </Button>
                    </>
                )
            case "backtest":
                return (
                    <>
                        <Button onClick={handleStartPaperTrading} disabled={isLoading}>
                            <Clock className="mr-2 h-4 w-4" />
                            {isLoading ? "Starting..." : "Start Paper Trading"}
                        </Button>
                        <Button variant="outline" onClick={handleEditStrategy}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Strategy
                        </Button>
                    </>
                )
            case "paper":
                return (
                    <>
                        <Button variant="destructive" onClick={handleStopStrategy} disabled={isLoading}>
                            <StopCircle className="mr-2 h-4 w-4" />
                            {isLoading ? "Stopping..." : "Stop Paper Trading"}
                        </Button>
                        <Button onClick={handleGoLive} disabled={isLoading}>
                            <Rocket className="mr-2 h-4 w-4" />
                            {isLoading ? "Starting..." : "Go Live"}
                        </Button>
                        <Button variant="outline" onClick={handleEditStrategy}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Strategy
                        </Button>
                    </>
                )
            case "live":
                return (
                    <>
                        <Button variant="destructive" onClick={handleStopStrategy} disabled={isLoading}>
                            <StopCircle className="mr-2 h-4 w-4" />
                            {isLoading ? "Stopping..." : "Stop Live Trading"}
                        </Button>
                        <Button variant="outline" onClick={handleEditStrategy}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Strategy
                        </Button>
                    </>
                )
            default:
                return (
                    <Button variant="outline" onClick={handleEditStrategy}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Strategy
                    </Button>
                )
        }
    }

    if (!strategy) return <div>Loading...</div>

    return (
        <div className="flex items-center justify-between mb-6">

            <main className="flex-1 space-y-4 p-4 md:p-6">
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>

                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <span>{strategy.name}</span>
                            <Badge className="ml-3">{strategy.type}</Badge>

                            {getStatusBadge(strategy.status)}

                            <Badge variant="secondary" className="ml-2">
                                Updated: {new Date(strategy.updated).toLocaleDateString()}
                            </Badge>
                        </h1>
                        <p className="text-muted-foreground">Historical performance analysis and trade statistics</p>
                    </div>


                </div>


                {/* Strategy Header with Progress Indicator */}
                <div className="bg-card border rounded-lg p-6">
                    {/* <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">{strategy.name}</h1>
                            <div className="flex items-center gap-3 mt-2">
                                <Badge variant="outline" className="capitalize">
                                    {strategy.type}
                                </Badge>
                                {getStatusBadge(strategy.status)}
                                <span className="text-sm text-muted-foreground">
                                    Updated: {new Date(strategy.updated).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div> */}

                    {/* Strategy Stage Progress */}
                    <div className="w-full mt-2">
                        <div className="flex justify-between mb-2">
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${strategy.status === "draft" ? "bg-muted-foreground text-background" : "bg-muted text-muted-foreground"}`}
                                >
                                    <FileEdit className="h-4 w-4" />
                                </div>
                                <span className="text-xs mt-1">Draft</span>
                            </div>
                            <div className="flex-1 flex items-center">
                                <div className={`h-1 flex-1 ${strategy.status !== "draft" ? "bg-muted-foreground" : "bg-muted"}`}></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${strategy.status === "backtest" ? "bg-violet-500 text-white" : strategy.status === "paper" || strategy.status === "live" ? "bg-muted-foreground text-background" : "bg-muted text-muted-foreground"}`}
                                >
                                    <Beaker className="h-4 w-4" />
                                </div>
                                <span className="text-xs mt-1">Backtest</span>
                            </div>
                            <div className="flex-1 flex items-center">
                                <div
                                    className={`h-1 flex-1 ${strategy.status === "paper" || strategy.status === "live" ? "bg-muted-foreground" : "bg-muted"}`}
                                ></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${strategy.status === "paper" ? "bg-blue-500 text-white" : strategy.status === "live" ? "bg-muted-foreground text-background" : "bg-muted text-muted-foreground"}`}
                                >
                                    <Clock className="h-4 w-4" />
                                </div>
                                <span className="text-xs mt-1">Paper</span>
                            </div>
                            <div className="flex-1 flex items-center">
                                <div className={`h-1 flex-1 ${strategy.status === "live" ? "bg-muted-foreground" : "bg-muted"}`}></div>
                            </div>
                            <div className="flex flex-col items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center ${strategy.status === "live" ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"}`}
                                >
                                    <Rocket className="h-4 w-4" />
                                </div>
                                <span className="text-xs mt-1">Live</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stage-specific banner */}
                <div
                    className={`p-4 rounded-lg flex items-center gap-3 ${strategy.status === "draft"
                        ? "bg-muted"
                        : strategy.status === "backtest"
                            ? "bg-violet-100 dark:bg-violet-950/30"
                            : strategy.status === "paper"
                                ? "bg-blue-100 dark:bg-blue-950/30"
                                : "bg-green-100 dark:bg-green-950/30"
                        }`}
                >
                    {getStatusIcon(strategy.status)}
                    <div className="flex-1">
                        <h3 className="font-medium">
                            {strategy.status === "draft"
                                ? "Strategy Draft"
                                : strategy.status === "backtest"
                                    ? "Backtested Strategy"
                                    : strategy.status === "paper"
                                        ? "Paper Trading Active"
                                        : "Live Trading Active"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {strategy.status === "draft"
                                ? "This strategy is in draft mode. Run a backtest to evaluate its performance."
                                : strategy.status === "backtest"
                                    ? "This strategy has been backtested. Start paper trading to test it with real market data."
                                    : strategy.status === "paper"
                                        ? "This strategy is running in paper trading mode. Monitor its performance before going live."
                                        : "This strategy is actively trading with real funds. Monitor closely."}
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">

                        <Button variant="outline" onClick={handleEditStrategy}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Strategy
                        </Button>


                        {strategy.status === "draft" && (
                            <Button size="sm" onClick={handleRunBacktest}>
                                <Beaker className="mr-2 h-4 w-4" />
                                Run Backtest
                            </Button>
                        )}
                        {strategy.status === "backtest" && (
                            <Button size="sm" onClick={handleStartPaperTrading}>
                                <Clock className="mr-2 h-4 w-4" />
                                Start Paper Trading
                            </Button>
                        )}
                        {strategy.status === "paper" && (
                            <Button size="sm" onClick={handleGoLive}>
                                <Rocket className="mr-2 h-4 w-4" />
                                Go Live
                            </Button>
                        )}
                        {strategy.status === "live" && (
                            <Button size="sm" variant="outline" onClick={() => router.push(`/live-trading/${id}`)}>
                                View Dashboard
                                <ChevronRight className="ml-2 h-4 w-4" />
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Parameters Section */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                        Strategy Parameters
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(strategy.configuration.parameters ?? {}).map(([key, value]) => (
                                            <div key={key} className="bg-muted/40 p-3 rounded-md">
                                                <div className="text-xs text-muted-foreground capitalize">
                                                    {formatLabel(key)}
                                                </div>
                                                <div className="font-medium">
                                                    {formatValue(key, value)}
                                                </div>
                                            </div>
                                        ))}

                                        {/* If timeframe is not in parameters, show it separately */}
                                        {!("timeframe" in (strategy.configuration.parameters ?? {})) &&
                                            strategy.configuration.timeframe && (
                                                <div className="bg-muted/40 p-3 rounded-md">
                                                    <div className="text-xs text-muted-foreground">Timeframe</div>
                                                    <div className="font-medium">{strategy.configuration.timeframe}</div>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>

                    </Card>

                    {/* Backtest Results */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center w-full">
                                <CardTitle className="flex items-center gap-2">
                                    <BarChart3 className="h-5 w-5" />
                                    Backtest Results
                                </CardTitle>
                                <div className="flex gap-2">
                                    {strategy.status !== "draft" && (
                                        <>
                                            <Button variant="outline" size="sm" onClick={handleRunBacktest}>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Re-run
                                            </Button>
                                            <Button variant="outline" size="sm" onClick={() => router.push(`/backtest/${id}`)}>
                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                View Details
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {strategy.status === "draft" ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Beaker className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No backtest results yet</p>
                                    {/* <Button className="mt-4" size="sm" onClick={handleRunBacktest}>
                                        Run Backtest
                                    </Button> */}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Total Return</div>
                                            <div className="font-medium text-green-500">+{strategy.performance.return}%</div>
                                        </div>
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                                            <div className="font-medium">{strategy.performance.sharpe}</div>
                                        </div>
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Max Drawdown</div>
                                            <div className="font-medium text-red-500">-{strategy.performance.drawdown}%</div>
                                        </div>
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Win Rate</div>
                                            <div className="font-medium">{strategy.performance.winRate}%</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Assets */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Coins className="h-5 w-5" />
                                Assets
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {strategy.configuration.assets.map((asset, index) => (
                                    <div key={index} className="bg-muted/40 p-3 rounded-md flex justify-between items-center">
                                        <div>
                                            <div className="font-medium">{asset}</div>
                                            <div className="text-xs text-muted-foreground">Trading Pair</div>
                                        </div>
                                        <Badge
                                            variant="outline"
                                            className={
                                                strategy.status === "live"
                                                    ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300"
                                                    : strategy.status === "paper"
                                                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300"
                                                        : "bg-muted"
                                            }
                                        >
                                            {strategy.status === "live" ? "Live" : strategy.status === "paper" ? "Paper" : "Configured"}
                                        </Badge>
                                    </div>
                                ))}
                                {strategy.configuration.assets.length === 0 && (
                                    <div className="text-center py-6 text-muted-foreground">
                                        <p>No assets configured</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Live Performance */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-center w-full">
                                <CardTitle className="flex items-center gap-2">
                                    <LineChart className="h-5 w-5" />
                                    {strategy.status === "live"
                                        ? "Live Performance"
                                        : strategy.status === "paper"
                                            ? "Paper Trading Performance"
                                            : "Performance"}
                                </CardTitle>
                                {(strategy.status === "live" || strategy.status === "paper") && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => router.push(`/${strategy.status === "live" ? "live-trading" : "paper-trading"}/${id}`)}
                                    >
                                        <LineChart className="mr-2 h-4 w-4" />
                                        View Details
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {strategy.status === "live" || strategy.status === "paper" ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Current Return</div>
                                            <div className="font-medium text-green-500">+12.3%</div>
                                        </div>
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Open Positions</div>
                                            <div className="font-medium">2</div>
                                        </div>
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Last Trade</div>
                                            <div className="font-medium">2 hours ago</div>
                                        </div>
                                        <div className="bg-muted/40 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Status</div>
                                            <div className={`font-medium ${strategy.status === "live" ? "text-green-500" : "text-blue-500"}`}>
                                                {strategy.status === "live" ? "Live Trading" : "Paper Trading"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : strategy.status === "backtest" ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Clock className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">Strategy has been backtested</p>
                                    <p className="text-xs text-muted-foreground mt-1">Start paper trading to see real-time performance</p>
                                    <Button className="mt-4" size="sm" onClick={handleStartPaperTrading}>
                                        Start Paper Trading
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <LineChart className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No performance data yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Run a backtest to see strategy performance</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Risk Settings */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <ShieldAlert className="h-5 w-5" />
                                Risk Settings
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium text-muted-foreground mb-2">
                                        Risk Management
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(strategy.configuration.riskManagement).map(([key, value]) => (
                                            <div
                                                key={key}
                                                className={`bg-muted/40 p-3 rounded-md ${typeof value === "boolean" ? "md:col-span-2" : ""}`}
                                            >
                                                <div className="text-xs text-muted-foreground">
                                                    {formatLabel(key)}
                                                </div>
                                                <div className="font-medium">
                                                    {formatValue(key, value)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Trade Logs / Alerts */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5" />
                                {strategy.status === "live" || strategy.status === "paper" ? "Live Logs / Alerts" : "Logs"}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {strategy.status === "draft" ? (
                                <div className="flex flex-col items-center justify-center py-6 text-center">
                                    <Bell className="h-10 w-10 text-muted-foreground mb-2" />
                                    <p className="text-muted-foreground">No logs available yet</p>
                                    <p className="text-xs text-muted-foreground mt-1">Run a backtest to generate logs</p>
                                </div>
                            ) : (
                                <div className="max-h-[220px] overflow-y-auto border rounded-md">
                                    {strategy.logs.slice(0, 5).map((log, index) => (
                                        <div key={index} className="p-2 text-sm border-b last:border-0 flex items-start gap-3">
                                            <div className="text-muted-foreground whitespace-nowrap text-xs">
                                                {new Date(log.timestamp).toLocaleTimeString()}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {log.level === "ERROR" ? (
                                                    <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
                                                ) : log.level === "WARNING" ? (
                                                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                                                ) : (
                                                    <CheckCircle2 className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                                                )}
                                                <span className={log.level === "ERROR" ? "text-red-500" : "text-xs"}>{log.message}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div >
    )
}
