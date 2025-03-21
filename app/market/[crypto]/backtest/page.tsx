"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { TrendingUp, BarChart3, Activity } from "lucide-react"

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

import { runBacktest, getHistoricalBacktest } from "@/lib/api/backtest"
import { BacktestData, BacktestParameters, BacktestRunHistoryItem } from "@/lib/api/backtest/types"
import { getBacktestRunHistory } from "@/lib/api/backtest/client"

export default function BacktestPage() {
    const params = useParams()
    const router = useRouter()
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
    const strategyId = typeof params.crypto === "string" ? params.crypto : "1"

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
                setSelectedRunVersion(response.runId)

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
            `/market/${strategyId}/backtest/compare?versions=${selectedRunsForComparison.join(",")}&timeframe=${timeframe}`,
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
        if (urlVersion) {
            setSelectedRunVersion(Number.parseInt(urlVersion, 10))
            loadHistoricalData(Number.parseInt(urlVersion, 10))
            // Show run history immediately when viewing historical data
            setShowRunHistory(true)
        } else if (isHistorical) {
            loadHistoricalData()
            // Show run history immediately when viewing historical data
            setShowRunHistory(true)
        } else {
            // Don't auto-load backtest data, wait for user to configure parameters
            setIsLoading(false)
        }
    }, [strategyId, isHistorical, searchParams])

    return (
        <div className="container py-6">
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

            {/* Global Progress Bar */}
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

            {/* Show run details if a new run was just completed */}
            {showRunHistory && backtestData && (
                <BacktestRunDetails
                    selectedRunVersion={selectedRunVersion}
                    runHistory={runHistory}
                    params={backtestData.params}
                />
            )}

            {!backtestData && !isLoading && !isCalculating && (
                <BacktestConfigPrompt openParamsDialog={() => setIsParamsDialogOpen(true)} />
            )}

            {backtestData && <BacktestMetricsCards metrics={backtestData.metrics} />}

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
                    <PerformanceTab
                        backtestData={backtestData}
                        isLoading={isLoading}
                        isCalculating={isCalculating}
                        progress={progress}
                        getProgressColor={getProgressColor}
                    />
                </TabsContent>

                <TabsContent value="trades" className="mt-0">
                    <TradesTab
                        backtestData={backtestData}
                        isLoading={isLoading}
                        openParamsDialog={() => setIsParamsDialogOpen(true)}
                    />
                </TabsContent>

                <TabsContent value="statistics" className="mt-0">
                    <StatisticsTab
                        backtestData={backtestData}
                        isLoading={isLoading}
                        openParamsDialog={() => setIsParamsDialogOpen(true)}
                    />
                </TabsContent>
            </Tabs>

            {/* Backtest Parameters Dialog */}
            <BacktestParametersDialog
                isOpen={isParamsDialogOpen}
                onOpenChange={setIsParamsDialogOpen}
                defaultParams={backtestParams}
                onSubmit={onSubmitParams}
                progress={progress}
                isCalculating={isCalculating}
            />
        </div>
    )
}

