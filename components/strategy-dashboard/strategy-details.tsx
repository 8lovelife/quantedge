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
    PieChart,
} from "lucide-react"
import { toast } from "sonner"
import { fetchStrategyDetails, StrategyDetail } from "@/lib/api/strategies"
import { Pie, ResponsiveContainer, Tooltip } from "recharts"
import { StrategyAssetsCard } from "./strategy-assets"

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

function getStatusColorClass(status: string) {
    switch (status) {
        case "live":
            return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 border-green-300"
        case "paper":
            return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border-blue-300"
        default:
            return "bg-muted"
    }
}


export default function StrategyDetails({ id }: { id: number }) {
    const router = useRouter()
    // Replace the useState(mockStrategy) with:
    const [strategy, setStrategy] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {

        const loadStrategyDetails = async () => {
            try {
                setIsLoading(true)
                const response = await fetchStrategyDetails(id)
                setStrategy(response)
            } catch (err) {
                console.error("Failed to fetch trading strategies:", err)
            } finally {
                setIsLoading(false)
            }
        }

        loadStrategyDetails()

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

    const pieData = strategy.configuration.assets.map((asset: any) => ({
        name: `${asset.symbol} (${asset.direction})`,
        value: asset.weight,
    }))

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
                                        {/* {!("timeframe" in (strategy.configuration.parameters ?? {})) &&
                                            strategy.configuration.timeframe && (
                                                <div className="bg-muted/40 p-3 rounded-md">
                                                    <div className="text-xs text-muted-foreground">Timeframe</div>
                                                    <div className="font-medium">{strategy.configuration.timeframe}</div>
                                                </div>
                                            )} */}
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
                    <StrategyAssetsCard strategy={strategy} />


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
