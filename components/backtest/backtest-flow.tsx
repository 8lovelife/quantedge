"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TrendingUp, BarChart3, Activity, ArrowLeft, Search } from "lucide-react"

import { BacktestHeader } from "@/components/backtest/backtest-header"
import {
    BacktestMetricsCards,
    BacktestRunDetails,
    BacktestConfigPrompt,
} from "@/components/backtest/backtest-components"
import {
    BacktestParametersDialog,
    type BacktestParamsFormValues,
} from "@/components/backtest/backtest-parameters-dialog"
import { PerformanceTab, TradesTab, StatisticsTab } from "@/components/backtest/backtest-tabs"

// import { runBacktest, getHistoricalBacktest } from "@/lib/api/backtest"
import { BacktestData, BacktestParameters, BacktestRunHistoryItem } from "@/lib/api/backtest/types"
import { getBacktestRunHistory, getHistoricalBacktest, runBacktest } from "@/lib/api/backtest/client"
import { DashboardLayout } from "@/components/layout/layout"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import { SiteHeader } from "@/components/layout/site-header"
import { Separator } from "../ui/separator"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Input } from "../ui/input"
import { Button } from "../ui/button"

const CURRENT_USER = "8lovelife"
const CURRENT_DATE = "2025-04-15 19:46:11"


// Add these interfaces at the top of your file
interface ParameterOptimization {
    param: string
    current: number
    suggested: number
    improvement: number
    confidence: number
    correlation: {
        param: string
        value: number
    }[]
}

interface OptimizationResult {
    expectedReturn: number
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
    parameters: ParameterOptimization[]
}


const defaultParams = {
    lookbackPeriod: 20,
    entryThreshold: 2,
    exitThreshold: 0.5,
    stopLoss: 2,
    takeProfit: 4,
    positionSize: 100,
    riskPerTrade: 1,
    maxPositions: 3,
    minVolume: 1000000
}

interface BacktestRun {
    id: string
    date: string
    params: typeof defaultParams
    performance: {
        returnRate: number
        winRate: number
        sharpeRatio: number
        maxDrawdown: number
        totalTrades: number
    }
    duration: string
    status: "completed" | "failed" | "running"
}

// Add mock data
const optimizationResult: OptimizationResult = {
    expectedReturn: 35.2,
    winRate: 78,
    sharpeRatio: 2.8,
    maxDrawdown: -9.5,
    parameters: [
        {
            param: "lookbackPeriod",
            current: 20,
            suggested: 25,
            improvement: 15,
            confidence: 85,
            correlation: [
                { param: "entryThreshold", value: 0.75 },
                { param: "exitThreshold", value: -0.45 }
            ]
        },
        {
            param: "entryThreshold",
            current: 2,
            suggested: 2.5,
            improvement: 12,
            confidence: 82,
            correlation: [
                { param: "lookbackPeriod", value: 0.75 },
                { param: "stopLoss", value: 0.65 }
            ]
        },
        // Add more parameter optimizations...
    ]
}

const recentRuns: BacktestRun[] = [
    {
        id: "BT-001",
        date: "2025-04-15 19:50:22",
        params: {
            ...defaultParams,
            lookbackPeriod: 25,
            entryThreshold: 2.5
        },
        performance: {
            returnRate: 32.5,
            winRate: 75,
            sharpeRatio: 2.6,
            maxDrawdown: -10.2,
            totalTrades: 145
        },
        duration: "2m 15s",
        status: "completed"
    },
    {
        id: "BT-002",
        date: "2025-04-15 19:45:10",
        params: defaultParams,
        performance: {
            returnRate: 28.5,
            winRate: 72,
            sharpeRatio: 2.4,
            maxDrawdown: -12.5,
            totalTrades: 156
        },
        duration: "2m 05s",
        status: "completed"
    },
    // Add more runs...
]

interface Parameter {
    name: string
    key: keyof typeof defaultParams
    description: string
    min: number
    max: number
    step: number
    unit?: string
    category: "core" | "risk" | "position"
}


const parameters: Parameter[] = [
    {
        name: "Lookback Period",
        key: "lookbackPeriod",
        description: "Number of periods to calculate mean and standard deviation",
        min: 5,
        max: 100,
        step: 1,
        category: "core"
    },
    {
        name: "Entry Threshold",
        key: "entryThreshold",
        description: "Number of standard deviations for entry signal",
        min: 0.5,
        max: 5,
        step: 0.1,
        unit: "σ",
        category: "core"
    },
    {
        name: "Exit Threshold",
        key: "exitThreshold",
        description: "Number of standard deviations for exit signal",
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: "σ",
        category: "core"
    },
    {
        name: "Stop Loss",
        key: "stopLoss",
        description: "Maximum loss per trade",
        min: 0.5,
        max: 10,
        step: 0.1,
        unit: "%",
        category: "risk"
    },
    {
        name: "Take Profit",
        key: "takeProfit",
        description: "Profit target per trade",
        min: 1,
        max: 20,
        step: 0.1,
        unit: "%",
        category: "risk"
    },
    {
        name: "Position Size",
        key: "positionSize",
        description: "Size of each position as percentage of portfolio",
        min: 1,
        max: 100,
        step: 1,
        unit: "%",
        category: "position"
    },
    {
        name: "Risk Per Trade",
        key: "riskPerTrade",
        description: "Maximum risk per trade as percentage of portfolio",
        min: 0.1,
        max: 5,
        step: 0.1,
        unit: "%",
        category: "risk"
    },
    {
        name: "Max Positions",
        key: "maxPositions",
        description: "Maximum number of concurrent positions",
        min: 1,
        max: 10,
        step: 1,
        category: "position"
    },
    {
        name: "Min Volume",
        key: "minVolume",
        description: "Minimum 24h trading volume for asset selection",
        min: 100000,
        max: 10000000,
        step: 100000,
        unit: "USDT",
        category: "position"
    }
]

interface BacktestRun {
    id: string
    date: string
    params: typeof defaultParams
    performance: {
        returnRate: number
        winRate: number
        sharpeRatio: number
        maxDrawdown: number
        totalTrades: number
    }
}

// Removed duplicate declaration of recentRuns

const optimizedParams = {
    lookbackPeriod: 25,
    entryThreshold: 2.5,
    exitThreshold: 0.4,
    stopLoss: 1.8,
    takeProfit: 4.5,
    positionSize: 80,
    riskPerTrade: 0.8,
    maxPositions: 4,
    minVolume: 2000000
}

export default function BacktestFlow() {
    const params = useParams()
    const router = useRouter()

    // Strategy selection state
    const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null)
    const [showStrategySelection, setShowStrategySelection] = useState(true)

    // New optimization state
    const [isOptimizing, setIsOptimizing] = useState(false)
    const [optimizationProgress, setOptimizationProgress] = useState(0)

    const searchParams = useSearchParams()
    const [timeframe, setTimeframe] = useState("6m")
    const [backtestData, setBacktestData] = useState<BacktestData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [progress, setProgress] = useState(0)
    const [isCalculating, setIsCalculating] = useState(false)
    const [selectedRunVersion, setSelectedRunVersion] = useState<number>(1)
    const [runHistory, setRunHistory] = useState<BacktestRunHistoryItem[]>([])
    const [showRunHistory, setShowRunHistory] = useState(false)
    const [isParamsDialogOpen, setIsParamsDialogOpen] = useState(false)
    const [backtestParams, setBacktestParams] = useState<BacktestParameters>({
        smaFast: 10,
        smaSlow: 50,
        riskLevel: "medium",
        stopLoss: 2,
        takeProfit: 6,
        useTrailingStop: false,
        trailingStopDistance: 2,
    })
    const [selectedRunsForComparison, setSelectedRunsForComparison] = useState<number[]>([])
    const [isLoadingHistory, setIsLoadingHistory] = useState(false)

    // Check if we're viewing historical data
    const isHistorical = searchParams.get("mode") === "historical"

    // Get strategy ID from URL params
    const strategyId = typeof params.strategyId === "string" ? params.strategyId : "1"


    // New function to handle strategy selection
    const handleStrategySelect = (strategyId: string) => {
        setSelectedStrategy(strategyId)
        setShowStrategySelection(false)
        // Reset backtest state
        setBacktestData(null)
        setRunHistory([])
        setSelectedRunVersion(1)
        // Show parameters dialog
        setIsParamsDialogOpen(true)
    }

    // Add optimization functions
    const startOptimization = () => {
        setIsOptimizing(true)
        setOptimizationProgress(0)
        // Simulate optimization process
        const interval = setInterval(() => {
            setOptimizationProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval)
                    setIsOptimizing(false)
                    return 100
                }
                return prev + 1
            })
        }, 100)
    }

    // Load run history from API
    const loadRunHistory = async () => {
        try {
            setIsLoadingHistory(true)
            const history = await getBacktestRunHistory(strategyId)
            setRunHistory(history)
        } catch (err) {
            console.error("Failed to load run history:", err)
        } finally {
            setIsLoadingHistory(false)
        }
    }

    // Define loadBacktestData outside of useEffect so it can be called from the button
    const loadBacktestData = async (customParams: BacktestParameters | null = null) => {
        try {
            setIsLoading(true)
            setIsCalculating(true)
            setProgress(0)
            setShowRunHistory(false)

            // Use provided parameters or default ones
            const params = customParams || backtestParams

            // Simulate progress updates while waiting for API response
            const progressInterval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 95) {
                        clearInterval(progressInterval)
                        return prev
                    }
                    return prev + Math.floor(Math.random() * 10) + 1
                })
            }, 300)

            // Call the API to run the backtest
            const response = await runBacktest(params, timeframe, strategyId)

            if (response.success) {
                setBacktestData(response.data)

                // Complete the progress
                setProgress(100)
                clearInterval(progressInterval)

                // Set the selected run version
                setSelectedRunVersion(response.version)

                // Reload run history
                await loadRunHistory()

                // Hide the progress bar after a short delay
                setTimeout(() => {
                    setIsCalculating(false)
                    setShowRunHistory(true)
                }, 500)
            } else {
                throw new Error(response.error || "Failed to run backtest")
            }
        } catch (err) {
            console.error("Failed to fetch backtest data:", err)
            setIsCalculating(false)
            // Show error message to user
            alert("Failed to run backtest. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Load historical data without simulation
    const loadHistoricalData = async (version = 1) => {
        try {
            setIsLoading(true)

            // Call the API to get historical backtest data
            const response = await getHistoricalBacktest(version, timeframe, strategyId)

            if (response.success) {
                setBacktestData(response.data)
                setSelectedRunVersion(version)
            } else {
                throw new Error(response.error || "Failed to get historical backtest data")
            }
        } catch (err) {
            console.error("Failed to fetch historical backtest data:", err)
            // Show error message to user
            alert("Failed to load historical backtest data. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    // Load a specific backtest run version
    const loadBacktestVersion = (version: number) => {
        loadHistoricalData(version)
    }

    // Handle form submission for backtest parameters
    const onSubmitParams = (values: BacktestParamsFormValues) => {
        setBacktestParams(values)
        setIsParamsDialogOpen(false)
        loadBacktestData(values)
    }

    // Toggle run selection for comparison
    const toggleRunSelection = (version: number) => {
        if (selectedRunsForComparison.includes(version)) {
            setSelectedRunsForComparison(selectedRunsForComparison.filter((v) => v !== version))
        } else {
            setSelectedRunsForComparison([...selectedRunsForComparison, version])
        }
    }

    // Navigate to comparison page with selected run versions
    const navigateToComparisonPage = () => {
        if (selectedRunsForComparison.length < 2) {
            alert("Please select at least 2 runs to compare")
            return
        }

        router.push(
            `/backtest/${strategyId}/compare?versions=${selectedRunsForComparison.join(",")}&timeframe=${timeframe}`,
        )
    }

    // Get progress color based on current progress
    const getProgressColor = () => {
        if (progress < 30) return "bg-orange-500"
        if (progress < 70) return "bg-blue-500"
        return "bg-green-500"
    }

    // Use useEffect to load data on initial render and when timeframe changes
    useEffect(() => {

        // Load run history
        loadRunHistory()

        // Get timeframe from URL if available
        const urlTimeframe = searchParams.get("timeframe")
        if (urlTimeframe) {
            setTimeframe(urlTimeframe)
        }

        // Get version from URL if available
        const urlVersion = searchParams.get("version")

        console.log("urlVersion " + urlVersion)
        if (urlVersion && urlVersion !== "undefined") {
            const versionNumber = Number.parseInt(urlVersion, 10)
            if (!isNaN(versionNumber)) {
                setSelectedRunVersion(versionNumber)
                loadHistoricalData(versionNumber)
                // Show run history immediately when viewing historical data
                setShowRunHistory(true)
            } else {
                console.warn("Invalid version parameter:", urlVersion)
                // Don't load any data if the version parameter is invalid
                setIsLoading(false)
            }
        } else if (isHistorical) {
            // No version specified but in historical mode - don't load any data
            console.log("No version specified in historical mode, showing empty state")
            setIsLoading(false)
        } else {
            // Don't auto-load backtest data, wait for user to configure parameters
            setIsLoading(false)
        }
    }, [strategyId, isHistorical, searchParams])

    return (
        <div className="container max-w-7xl mx-auto p-4">
            {showStrategySelection ? (
                // Strategy Selection View
                <div className="space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-2xl font-bold">Strategy Library</h1>
                            <p className="text-muted-foreground">
                                Select a trading strategy to run backtest
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                UTC {new Date("2025-04-15 20:09:03").toLocaleString()}
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                            {/* <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarFallback>{CURRENT_USER[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <div className="font-medium">{CURRENT_USER}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Backtest Lab
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Search and Filter Controls */}
                    {/* <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search strategies..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-8"
                            />
                        </div>
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="popular">Most Popular</SelectItem>
                                <SelectItem value="return">Best Return</SelectItem>
                                <SelectItem value="newest">Recently Updated</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}

                    Strategy Grid
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {strategies.map((strategy) => (
                            <StrategyCard
                                key={strategy.id}
                                strategy={strategy}
                                onSelect={() => handleStrategySelect(strategy.id)}
                                isSelected={selectedStrategy === strategy.id}
                            />
                        ))}
                    </div> */}
                </div>
            ) : (
                // Backtest Configuration and Results View
                <div className="space-y-4">
                    {/* Header with Back Button and Info */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowStrategySelection(true)}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-2xl font-bold">Backtest Configuration</h1>
                                <p className="text-muted-foreground">
                                    "Moving Average Crossover"
                                    • Version {selectedRunVersion}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-muted-foreground">
                                UTC {new Date("2025-04-15 20:09:03").toLocaleString()}
                            </div>
                            <Separator orientation="vertical" className="h-8" />
                            {/* <div className="flex items-center gap-2">
                                <Avatar>
                                    <AvatarFallback>{CURRENT_USER[0].toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div className="text-sm">
                                    <div className="font-medium">{CURRENT_USER}</div>
                                    <div className="text-xs text-muted-foreground">
                                        Running Backtest
                                    </div>
                                </div>
                            </div> */}
                        </div>
                    </div>

                    {/* Your existing backtest components */}
                    <BacktestHeader
                        title="Strategy Backtest Results"
                        strategyName="Moving Average Crossover"
                        isHistorical={isHistorical}
                        selectedRunVersion={selectedRunVersion}
                        timeframe={timeframe}
                        setTimeframe={setTimeframe}
                        runHistory={runHistory}
                        isLoadingHistory={isLoadingHistory}
                        selectedRunsForComparison={selectedRunsForComparison}
                        toggleRunSelection={toggleRunSelection}
                        navigateToComparisonPage={navigateToComparisonPage}
                        loadBacktestVersion={loadBacktestVersion}
                        openParamsDialog={() => setIsParamsDialogOpen(true)}
                        isCalculating={isCalculating}
                        hasBacktestData={!!backtestData}
                    />

                    {/* Progress Bar */}
                    {isCalculating && (
                        <div className="mb-6 space-y-1">
                            <div className="flex justify-between text-sm">
                                <span>Processing backtest...</span>
                                <span>{progress}% complete</span>
                            </div>
                            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${getProgressColor()} transition-all duration-300 ease-out`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Metrics Cards */}
                    {backtestData && <BacktestMetricsCards metrics={backtestData.metrics} />}

                    {/* Tabs */}
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

                        {/* Tab Contents */}
                        <TabsContent value="performance">
                            <PerformanceTab
                                backtestData={backtestData}
                                isLoading={isLoading}
                                isCalculating={isCalculating}
                                progress={progress}
                                getProgressColor={getProgressColor}
                            />
                        </TabsContent>
                        <TabsContent value="trades">
                            <TradesTab
                                backtestData={backtestData}
                                isLoading={isLoading}
                                openParamsDialog={() => setIsParamsDialogOpen(true)}
                            />
                        </TabsContent>
                        <TabsContent value="statistics">
                            <StatisticsTab
                                backtestData={backtestData}
                                isLoading={isLoading}
                                openParamsDialog={() => setIsParamsDialogOpen(true)}
                            />
                        </TabsContent>
                    </Tabs>

                    {/* Parameters Dialog */}
                    <BacktestParametersDialog
                        isOpen={isParamsDialogOpen}
                        onOpenChange={setIsParamsDialogOpen}
                        defaultParams={backtestParams}
                        onSubmit={onSubmitParams}
                        progress={progress}
                        isCalculating={isCalculating}
                    />
                </div>
            )}
        </div>
    )
}

