"use client"

import {useState, useEffect, useRef} from "react"
import {useParams, useRouter, useSearchParams} from "next/navigation"
import {ArrowLeftIcon, DownloadIcon, Share2Icon, RefreshCw, CheckCircleIcon} from "lucide-react"

import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Badge} from "@/components/ui/badge"

// Add these imports at the top of the file
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
    LineChart,
    Line,
    Scatter,
    ReferenceLine,
    ScatterChart, //Import ScatterChart
} from "recharts"

// Format date for display
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString)
        return date.toLocaleString()
    } catch (e) {
        return dateString || "Unknown date"
    }
}

// Add this custom tooltip component after the formatDate function
// Custom tooltip for backtest chart
const BacktestTooltip = ({active, payload, label}: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-popover text-popover-foreground shadow-md rounded-md p-3 text-sm border border-border">
                <p className="font-medium mb-1">{`Date: ${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{color: entry.color}}>
                        {`${entry.name}: $${entry.value.toLocaleString()}`}
                    </p>
                ))}
            </div>
        )
    }
    return null
}

// Add this function to prepare metrics data for the bar chart
const prepareMetricsData = (comparisonData) => {
    if (!comparisonData || comparisonData.length === 0) return []

    // Basic metrics data structure
    const metricsData = [
        {name: "Return (%)"},
        {name: "Win Rate (%)"},
        {name: "Max Drawdown (%)"},
        {name: "Sharpe Ratio"},
    ]

    // Add data for each run
    comparisonData.forEach((run) => {
        if (!run.metrics) return

        metricsData[0][`run${run.version}`] = Number.parseFloat(run.metrics.strategyReturn || 0)
        metricsData[1][`run${run.version}`] = Number.parseFloat(run.metrics.winRate || 0)
        metricsData[2][`run${run.version}`] = Number.parseFloat(run.metrics.maxDrawdown || 0)
        metricsData[3][`run${run.version}`] = Number.parseFloat(run.metrics.sharpeRatio || 0)
    })

    return metricsData
}

// Add this function to prepare monthly returns data
const prepareMonthlyReturnsData = (comparisonData) => {
    if (!comparisonData || comparisonData.length === 0) return []

    // Create a set of all months across all runs
    const allMonths = new Set()
    comparisonData.forEach((run) => {
        // In a real implementation, we would extract months from the data
        // For mock data, we'll create 6 months of data
        for (let i = 0; i < 6; i++) {
            const date = new Date()
            date.setMonth(date.getMonth() - i)
            allMonths.add(date.toLocaleString("default", {month: "short", year: "numeric"}))
        }
    })

    // Convert to array and sort chronologically
    const months = Array.from(allMonths).sort((a, b) => {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateA - dateB
    })

    // Create data structure for the chart
    return months.map((month) => {
        const dataPoint = {month}

        comparisonData.forEach((run) => {
            // Generate a random monthly return between -10% and +15%
            const baseReturn = run.version * 2 // Higher version number = better performance
            const randomFactor = Math.random() * 10 - 5
            dataPoint[`run${run.version}`] = baseReturn + randomFactor
        })

        return dataPoint
    })
}

// Add this function to prepare drawdown data
const prepareDrawdownData = (comparisonData) => {
    if (!comparisonData || comparisonData.length === 0) return []

    // Create 30 days of drawdown data
    const days = 30
    const result = []

    for (let i = 0; i < days; i++) {
        const date = new Date()
        date.setDate(date.getDate() - (days - i - 1))
        const dataPoint = {
            date: date.toISOString().split("T")[0],
        }

        comparisonData.forEach((run) => {
            // Generate random drawdown data that improves over time
            // Higher version numbers have smaller drawdowns
            const maxDrawdown = 15 - run.version * 2
            const progress = i / days
            const drawdown = maxDrawdown * (1 - progress) * Math.random()
            dataPoint[`run${run.version}`] = drawdown
        })

        result.push(dataPoint)
    }

    return result
}

// Add this function to prepare risk vs return data
const prepareRiskReturnData = (comparisonData) => {
    if (!comparisonData || comparisonData.length === 0) return []

    return comparisonData.map((run) => {
        // Extract return from metrics
        const returnValue = Number.parseFloat(run.metrics.strategyReturn)

        // Calculate risk (volatility) - in a real implementation this would be calculated from daily returns
        // For mock data, we'll use a formula that makes higher version numbers have better risk-adjusted returns
        const baseRisk = 10 - run.version * 0.5
        const risk = baseRisk + (Math.random() * 2 - 1)

        return {
            name: `Run #${run.version}`,
            risk: risk,
            return: returnValue,
            sharpe: returnValue / risk,
            isBest: run.version === findBestRun(comparisonData)?.version,
        }
    })
}

// Simple mock data for testing
const generateMockData = (versions) => {
    return versions.map((version) => ({
        version,
        date: new Date().toISOString(),
        data: {
            data: Array(30)
                .fill(0)
                .map((_, i) => ({
                    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
                    balance: 10000 + version * 500 + i * 100 + Math.random() * 200,
                    marketBalance: 10000 + i * 80 + Math.random() * 150,
                })),
        },
        trades: Array(10 + version * 2)
            .fill(0)
            .map((_, i) => ({
                id: i,
                date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
                type: Math.random() > 0.5 ? "buy" : "sell",
                result: Math.random() > 0.4 ? "win" : "loss",
                profit: Math.random() > 0.4 ? Math.random() * 500 : -Math.random() * 300,
            })),
        metrics: {
            strategyReturn: (15 + version * 2 + (Math.random() * 5 - 2.5)).toFixed(2),
            marketReturn: (10.5 + (Math.random() * 2 - 1)).toFixed(2),
            alpha: (5 + version * 2 + (Math.random() * 2 - 1)).toFixed(2),
            maxDrawdown: (8 - version * 0.5 + (Math.random() * 2 - 1)).toFixed(2),
            winRate: (60 + version * 5 + (Math.random() * 5 - 2.5)).toFixed(2),
            sharpeRatio: (1.2 + version * 0.2 + (Math.random() * 0.4 - 0.2)).toFixed(2),
            totalTrades: 12 + version * 2,
            profitFactor: (1.5 + version * 0.3 + (Math.random() * 0.4 - 0.2)).toFixed(2),
            averageWin: (300 + version * 50 + (Math.random() * 40 - 20)).toFixed(2),
            averageLoss: (200 + (Math.random() * 30 - 15)).toFixed(2),
        },
        params: {
            smaFast: 10 + version * 2,
            smaSlow: 50 - version * 3,
            riskLevel: version % 3 === 0 ? "low" : version % 3 === 1 ? "medium" : "high",
            stopLoss: 2 + version * 0.5,
            takeProfit: 6 + version,
            useTrailingStop: version % 2 === 0,
            trailingStopDistance: version * 5 + 10,
        },
    }))
}

// Find the best performing run
const findBestRun = (comparisonData) => {
    if (!comparisonData || comparisonData.length === 0) return null

    // Create a scoring system based on multiple metrics
    const scoredRuns = comparisonData.map((run) => {
        const returnScore = Number.parseFloat(run.metrics.strategyReturn) * 2
        const sharpeScore = Number.parseFloat(run.metrics.sharpeRatio) * 10
        const drawdownPenalty = Number.parseFloat(run.metrics.maxDrawdown) * 0.5
        const winRateScore = Number.parseFloat(run.metrics.winRate) * 0.2
        const profitFactorScore = Number.parseFloat(run.metrics.profitFactor) * 5

        const totalScore = returnScore + sharpeScore + winRateScore + profitFactorScore - drawdownPenalty

        return {
            version: run.version,
            score: totalScore,
            metrics: run.metrics,
        }
    })

    // Sort by score (highest first)
    scoredRuns.sort((a, b) => b.score - a.score)
    return scoredRuns[0]
}

export default function BacktestComparePage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(true)
    const [comparisonData, setComparisonData] = useState<any[]>([])
    const [error, setError] = useState<string | null>(null)
    const hasLoadedRef = useRef(false)

    // Get the versions to compare from the URL
    const versionsParam = searchParams.get("versions")
    const versions = versionsParam ? versionsParam.split(",").map((v) => Number.parseInt(v, 10)) : [1, 2, 3]

    // Load data only once on initial render
    useEffect(() => {
        if (hasLoadedRef.current) return

        const loadData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                console.log("Loading comparison data for versions:", versions.join(","))

                // Instead of making an API call, use mock data for now
                setTimeout(() => {
                    const mockData = generateMockData(versions)
                    setComparisonData(mockData)
                    setIsLoading(false)
                    hasLoadedRef.current = true
                }, 1000)
            } catch (err) {
                console.error("Error loading comparison data:", err)
                setError("Failed to load comparison data. Please try again.")
                setIsLoading(false)
            }
        }

        loadData()
    }, []) // Empty dependency array to only run once

    const bestRun = findBestRun(comparisonData)

    // Manual refresh function
    const handleRefresh = () => {
        hasLoadedRef.current = false
        setComparisonData([])
        setIsLoading(true)

        // Simulate loading new data
        setTimeout(() => {
            const mockData = generateMockData(versions)
            setComparisonData(mockData)
            setIsLoading(false)
            hasLoadedRef.current = true
        }, 1000)
    }

    return (
        <div className="container py-6">
            {/* Keep the header section */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeftIcon className="h-4 w-4"/>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <span>Backtest Comparison</span>
                            <Badge className="ml-3">Moving Average Crossover</Badge>
                        </h1>
                        <p className="text-muted-foreground">Comparing {comparisonData.length} backtest runs</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`}/>
                        Refresh
                    </Button>
                    <Button variant="outline">
                        <Share2Icon className="mr-2 h-4 w-4"/>
                        Share
                    </Button>
                    <Button variant="outline">
                        <DownloadIcon className="mr-2 h-4 w-4"/>
                        Export
                    </Button>
                </div>
            </div>

            {/* Keep the loading, error, and empty states */}
            {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                    <div className="text-lg">Loading comparison data...</div>
                </div>
            ) : error ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <div className="text-lg text-red-500 mb-4">{error}</div>
                    <Button onClick={handleRefresh}>Try Again</Button>
                </div>
            ) : comparisonData.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[400px]">
                    <div className="text-lg text-amber-500 mb-4">
                        No comparison data available. Please try selecting different versions to compare.
                    </div>
                    <Button onClick={handleRefresh}>Try Again</Button>
                </div>
            ) : (
                <>
                    {/* Keep the Best Performer Highlight section */}
                    {bestRun && (
                        <Card className="mb-6 bg-green-50 border-green-200">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-green-800">Best Performer: Run
                                        #{bestRun.version}</CardTitle>
                                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                        Recommended
                                    </Badge>
                                </div>
                                <CardDescription>
                                    This run achieved the best overall performance based on return, risk, and
                                    consistency metrics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Return</div>
                                        <div
                                            className="text-xl font-bold text-green-700">{bestRun.metrics.strategyReturn}%
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Sharpe Ratio</div>
                                        <div
                                            className="text-xl font-bold text-green-700">{bestRun.metrics.sharpeRatio}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Win Rate</div>
                                        <div className="text-xl font-bold text-green-700">{bestRun.metrics.winRate}%
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Max Drawdown</div>
                                        <div className="text-xl font-bold text-red-600">{bestRun.metrics.maxDrawdown}%
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Alpha</div>
                                        <div className="text-lg font-medium text-green-700">{bestRun.metrics.alpha}%
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Profit Factor</div>
                                        <div
                                            className="text-lg font-medium text-green-700">{bestRun.metrics.profitFactor}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Total Trades</div>
                                        <div className="text-lg font-medium">{bestRun.metrics.totalTrades}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="text-sm text-muted-foreground">Market Return</div>
                                        <div className="text-lg font-medium">{bestRun.metrics.marketReturn}%</div>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <div className="text-sm font-medium text-green-800 mb-2">Key Parameters:</div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {Object.entries(comparisonData.find((r) => r.version === bestRun.version)?.params || {}).map(
                                            ([key, value]) => (
                                                <div key={key} className="bg-white bg-opacity-50 rounded-md p-2">
                                                    <div className="text-xs text-muted-foreground capitalize">
                                                        {key.replace(/([A-Z])/g, " $1").trim()}
                                                    </div>
                                                    <div className="font-medium">
                                                        {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
                                                    </div>
                                                </div>
                                            ),
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-green-200">
                                    <div className="text-sm font-medium text-green-800 mb-2">Performance Summary:</div>
                                    <div className="bg-white bg-opacity-50 rounded-md p-3">
                                        <ul className="space-y-1 text-sm">
                                            <li className="flex items-start">
                                                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5"/>
                                                <span>
                                                    <strong>Superior Returns:</strong> Outperformed other runs by{" "}
                                                    {(
                                                        Number(bestRun.metrics.strategyReturn) -
                                                        Math.max(
                                                            ...comparisonData
                                                                .filter((r) => r.version !== bestRun.version)
                                                                .map((r) => Number(r.metrics.strategyReturn)),
                                                        )
                                                    ).toFixed(2)}
                                                    %
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5"/>
                                                <span>
                                                    <strong>Risk-Adjusted Performance:</strong> Highest Sharpe ratio indicates better returns per
                                                    unit of risk
                                                </span>
                                            </li>
                                            <li className="flex items-start">
                                                <CheckCircleIcon className="h-4 w-4 text-green-600 mr-2 mt-0.5"/>
                                                <span>
                                                    <strong>Consistency:</strong> {bestRun.metrics.winRate}% win rate with a profit factor of{" "}
                                                    {bestRun.metrics.profitFactor}
                                                </span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Keep the Performance Charts section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        {/* Balance Performance Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Balance Performance</CardTitle>
                                <CardDescription>Account balance over time for each strategy</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                left: 20,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                            <XAxis
                                                dataKey="date"
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 12}}
                                                tickFormatter={(value) => {
                                                    try {
                                                        const date = new Date(value)
                                                        return `${date.getMonth() + 1}/${date.getDate()}`
                                                    } catch (e) {
                                                        return value
                                                    }
                                                }}
                                            />
                                            <YAxis
                                                axisLine={false}
                                                tickLine={false}
                                                tick={{fontSize: 12}}
                                                width={80}
                                                tickFormatter={(value) => `$${value.toLocaleString()}`}
                                            />
                                            <Tooltip content={<BacktestTooltip/>}/>
                                            <Legend/>

                                            {comparisonData.map((run, index) => {
                                                // Use different colors for each run
                                                const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                const color = colors[index % colors.length]
                                                const isBest = bestRun && bestRun.version === run.version

                                                return (
                                                    <Area
                                                        key={run.version}
                                                        type="monotone"
                                                        data={run.data?.data || []}
                                                        dataKey="balance"
                                                        name={`Run #${run.version}${isBest ? " (Best)" : ""}`}
                                                        stroke={color}
                                                        fill={color}
                                                        fillOpacity={0.3}
                                                        strokeWidth={isBest ? 3 : 2}
                                                    />
                                                )
                                            })}
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Key Metrics Bar Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Key Metrics Comparison</CardTitle>
                                <CardDescription>Side-by-side comparison of performance metrics</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={prepareMetricsData(comparisonData)}
                                            margin={{
                                                top: 20,
                                                right: 20,
                                                left: 20,
                                                bottom: 20,
                                            }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                            <XAxis dataKey="name"/>
                                            <YAxis axisLine={false} tickLine={false}/>
                                            <Tooltip/>
                                            <Legend/>

                                            {comparisonData.map((run, index) => {
                                                const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                const color = colors[index % colors.length]
                                                const isBest = bestRun && bestRun.version === run.version

                                                return (
                                                    <Bar
                                                        key={run.version}
                                                        dataKey={`run${run.version}`}
                                                        name={`Run #${run.version}${isBest ? " (Best)" : ""}`}
                                                        fill={color}
                                                        radius={[4, 4, 0, 0]}
                                                        stroke={isBest ? "#000" : undefined}
                                                        strokeWidth={isBest ? 1 : 0}
                                                    />
                                                )
                                            })}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Add Monthly Returns Chart */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Monthly Returns</CardTitle>
                            <CardDescription>Month-by-month performance comparison</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={prepareMonthlyReturnsData(comparisonData)}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 20,
                                            bottom: 20,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                        <XAxis dataKey="month"/>
                                        <YAxis axisLine={false} tickLine={false}
                                               tickFormatter={(value) => `${value}%`}/>
                                        <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, ""]}/>
                                        <Legend/>

                                        {comparisonData.map((run, index) => {
                                            const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                            const color = colors[index % colors.length]
                                            const isBest = bestRun && bestRun.version === run.version

                                            return (
                                                <Bar
                                                    key={run.version}
                                                    dataKey={`run${run.version}`}
                                                    name={`Run #${run.version}${isBest ? " (Best)" : ""}`}
                                                    fill={color}
                                                    radius={[4, 4, 0, 0]}
                                                    stroke={isBest ? "#000" : undefined}
                                                    strokeWidth={isBest ? 1 : 0}
                                                />
                                            )
                                        })}
                                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3"/>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Drawdown Comparison Chart */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Drawdown Comparison</CardTitle>
                            <CardDescription>Maximum drawdown over time for each strategy</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart
                                        data={prepareDrawdownData(comparisonData)}
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 20,
                                            bottom: 20,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => {
                                                try {
                                                    const date = new Date(value)
                                                    return `${date.getMonth() + 1}/${date.getDate()}`
                                                } catch (e) {
                                                    return value
                                                }
                                            }}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(value) => `${value}%`}
                                            domain={[0, "dataMax"]}
                                        />
                                        <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, ""]}/>
                                        <Legend/>

                                        {comparisonData.map((run, index) => {
                                            const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                            const color = colors[index % colors.length]
                                            const isBest = bestRun && bestRun.version === run.version

                                            return (
                                                <Line
                                                    key={run.version}
                                                    type="monotone"
                                                    dataKey={`run${run.version}`}
                                                    name={`Run #${run.version}${isBest ? " (Best)" : ""}`}
                                                    stroke={color}
                                                    strokeWidth={isBest ? 3 : 2}
                                                    dot={false}
                                                />
                                            )
                                        })}
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Add Risk vs Return Chart */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Risk vs Return Analysis</CardTitle>
                            <CardDescription>Comparison of risk-adjusted returns</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[400px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <ScatterChart
                                        margin={{
                                            top: 20,
                                            right: 20,
                                            left: 20,
                                            bottom: 20,
                                        }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3"/>
                                        <XAxis
                                            type="number"
                                            dataKey="risk"
                                            name="Risk (Volatility)"
                                            label={{value: "Risk (Volatility %)", position: "bottom", offset: 0}}
                                            domain={[0, "dataMax"]}
                                        />
                                        <YAxis
                                            type="number"
                                            dataKey="return"
                                            name="Return"
                                            label={{value: "Return (%)", angle: -90, position: "insideLeft"}}
                                            domain={[0, "dataMax"]}
                                        />
                                        <Tooltip
                                            cursor={{strokeDasharray: "3 3"}}
                                            formatter={(value, name) => [
                                                `${value.toFixed(2)}${name === "return" ? "%" : ""}`,
                                                name === "return" ? "Return" : "Risk",
                                            ]}
                                            labelFormatter={(value) => ""}
                                            content={({active, payload}) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload
                                                    return (
                                                        <div
                                                            className="bg-popover text-popover-foreground shadow-md rounded-md p-3 text-sm border border-border">
                                                            <p className="font-medium mb-1">{data.name}</p>
                                                            <p>Return: {data.return.toFixed(2)}%</p>
                                                            <p>Risk: {data.risk.toFixed(2)}%</p>
                                                            <p>Sharpe Ratio: {data.sharpe.toFixed(2)}</p>
                                                        </div>
                                                    )
                                                }
                                                return null
                                            }}
                                        />
                                        <Legend/>

                                        {comparisonData.map((run, index) => {
                                            const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                            const color = colors[index % colors.length]
                                            const isBest = bestRun && bestRun.version === run.version
                                            const riskReturnData = prepareRiskReturnData(comparisonData)
                                            const runData = riskReturnData.find((d) => d.name === `Run #${run.version}`)

                                            return (
                                                <Scatter
                                                    key={run.version}
                                                    name={`Run #${run.version}${isBest ? " (Best)" : ""}`}
                                                    data={[runData]}
                                                    fill={color}
                                                    shape={(props) => {
                                                        const {cx, cy} = props
                                                        const size = isBest ? 12 : 8
                                                        return (
                                                            <svg>
                                                                <circle
                                                                    cx={cx}
                                                                    cy={cy}
                                                                    r={size}
                                                                    fill={color}
                                                                    stroke={isBest ? "#000" : "none"}
                                                                    strokeWidth={isBest ? 2 : 0}
                                                                />
                                                                {isBest && (
                                                                    <text x={cx} y={cy - 15} textAnchor="middle"
                                                                          fill="#000" fontSize="12">
                                                                        Best
                                                                    </text>
                                                                )}
                                                            </svg>
                                                        )
                                                    }}
                                                />
                                            )
                                        })}

                                        {/* Add reference lines for better visualization */}
                                        <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3"/>
                                        <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3"/>
                                    </ScatterChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="mt-4 text-sm text-muted-foreground">
                                <p>
                                    This chart plots risk (volatility) against return for each backtest run. The ideal
                                    position is
                                    top-left (high return, low risk).
                                </p>
                                <p className="mt-1">Larger circles indicate better Sharpe ratios (risk-adjusted
                                    returns).</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Keep the Parameters Comparison Section */}
                    <Card className="mb-6">
                        <CardHeader>
                            <CardTitle>Strategy Parameters</CardTitle>
                            <CardDescription>Side-by-side comparison of all strategy parameters</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <table className="w-full">
                                    <thead>
                                    <tr className="border-b bg-muted/50">
                                        <th className="p-3 text-left text-sm font-medium">Parameter</th>
                                        {comparisonData.map((run) => (
                                            <th key={run.version} className="p-3 text-center text-sm font-medium">
                                                Run #{run.version}
                                                {bestRun && bestRun.version === run.version && (
                                                    <Badge
                                                        className="ml-2 bg-green-100 text-green-800 border-green-300">Best</Badge>
                                                )}
                                            </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {/* Get all unique parameter keys across all runs */}
                                    {Array.from(new Set(comparisonData.flatMap((run) => Object.keys(run.params || {})))).map(
                                        (param) => (
                                            <tr key={param} className="border-b">
                                                <td className="p-3 text-sm font-medium capitalize">
                                                    {param.replace(/([A-Z])/g, " $1").trim()}
                                                </td>
                                                {comparisonData.map((run) => {
                                                    const isBest = bestRun && bestRun.version === run.version
                                                    return (
                                                        <td
                                                            key={run.version}
                                                            className={`p-3 text-sm text-center ${isBest ? "font-medium bg-green-50" : ""}`}
                                                        >
                                                            {run.params && run.params[param] !== undefined
                                                                ? typeof run.params[param] === "number"
                                                                    ? run.params[param].toFixed(2)
                                                                    : typeof run.params[param] === "boolean"
                                                                        ? run.params[param]
                                                                            ? "Yes"
                                                                            : "No"
                                                                        : run.params[param]
                                                                : "-"}
                                                        </td>
                                                    )
                                                })}
                                            </tr>
                                        ),
                                    )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    )
}

