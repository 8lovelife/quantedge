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
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
} from "recharts"
import { ArrowLeftIcon, DownloadIcon, Share2Icon } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { compareBacktests } from "@/lib/api/backtest"

// Format date for display
const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
}

export default function BacktestComparePage() {
    const params = useParams()
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isLoading, setIsLoading] = useState(true)
    const [comparisonData, setComparisonData] = useState<any[]>([])

    // Get the versions to compare from the URL
    const versionsParam = searchParams.get("versions")
    const versions = versionsParam ? versionsParam.split(",").map((v) => Number.parseInt(v, 10)) : []

    // Get timeframe from URL if available
    const timeframe = searchParams.get("timeframe") || "6m"

    // Get strategy ID from URL params
    const strategyId = typeof params.crypto === "string" ? params.crypto : "1"

    // Load comparison data
    useEffect(() => {
        const loadComparisonData = async () => {
            try {
                if (versions.length < 2) {
                    console.log("Not enough versions to compare, redirecting back to backtest page")
                    router.push(`/market/${strategyId}/backtest`)
                    return
                }

                setIsLoading(true)
                console.log("Loading comparison data for versions:", versions.join(","))

                // Call the API to get comparison data
                const response = await compareBacktests(versions, timeframe, strategyId)
                console.log("Response received:", response)

                if (response.success) {
                    console.log("Setting comparison data:", response.comparisonData)
                    setComparisonData(response.comparisonData)
                } else {
                    throw new Error(response.error || "Failed to load comparison data")
                }
            } catch (error) {
                console.error("Error loading comparison data:", error)
                alert("Failed to load comparison data. Please try again.")
            } finally {
                setIsLoading(false)
            }
        }

        // If no versions are provided, use default test versions
        if (versions.length === 0) {
            console.log("No versions provided, using default test versions")
            // For testing purposes, use versions 1 and 2 if none are provided
            const testVersions = [1, 2]

            compareBacktests(testVersions, timeframe, strategyId)
                .then((response) => {
                    if (response.success) {
                        console.log("Setting test comparison data")
                        setComparisonData(response.comparisonData)
                    } else {
                        console.error("Failed to load test comparison data:", response.error)
                    }
                    setIsLoading(false)
                })
                .catch((error) => {
                    console.error("Error loading test comparison data:", error)
                    setIsLoading(false)
                })
        } else {
            loadComparisonData()
        }
    }, [versions, timeframe, strategyId, router])

    // Prepare data for charts
    const prepareComparisonChartData = () => {
        if (!comparisonData || comparisonData.length === 0) return []

        // Prepare data for the key metrics bar chart
        const metricsData = [
            { name: "Strategy Return" },
            { name: "Alpha" },
            { name: "Win Rate" },
            { name: "Sharpe Ratio" },
            { name: "Max Drawdown" },
        ]

        // Add data for each run
        comparisonData.forEach((run) => {
            metricsData[0][`run${run.version}`] = Number.parseFloat(run.metrics.strategyReturn)
            metricsData[1][`run${run.version}`] = Number.parseFloat(run.metrics.alpha)
            metricsData[2][`run${run.version}`] = Number.parseFloat(run.metrics.winRate)
            metricsData[3][`run${run.version}`] = Number.parseFloat(run.metrics.sharpeRatio) * 10 // Scale up for visibility
            metricsData[4][`run${run.version}`] = Number.parseFloat(run.metrics.maxDrawdown)
        })

        return metricsData
    }

    const prepareRadarChartData = () => {
        if (!comparisonData || comparisonData.length === 0) return []

        // Prepare data for the radar chart
        // We need to normalize all values to a 0-100 scale for the radar chart
        const radarData = [
            { metric: "Return" },
            { metric: "Alpha" },
            { metric: "Win Rate" },
            { metric: "Sharpe" },
            { metric: "Low Drawdown" }, // Inverse of drawdown
        ]

        // Find max values for normalization
        const maxReturn = Math.max(...comparisonData.map((run) => Number.parseFloat(run.metrics.strategyReturn)))
        const maxAlpha = Math.max(...comparisonData.map((run) => Number.parseFloat(run.metrics.alpha)))
        const maxWinRate = 100 // Already a percentage
        const maxSharpe = Math.max(...comparisonData.map((run) => Number.parseFloat(run.metrics.sharpeRatio)))
        const maxDrawdown = Math.max(...comparisonData.map((run) => Number.parseFloat(run.metrics.maxDrawdown)))

        // Add normalized data for each run
        comparisonData.forEach((run) => {
            radarData[0][`run${run.version}`] = (Number.parseFloat(run.metrics.strategyReturn) / maxReturn) * 100
            radarData[1][`run${run.version}`] = (Number.parseFloat(run.metrics.alpha) / maxAlpha) * 100
            radarData[2][`run${run.version}`] = Number.parseFloat(run.metrics.winRate)
            radarData[3][`run${run.version}`] = (Number.parseFloat(run.metrics.sharpeRatio) / maxSharpe) * 100
            // Invert drawdown so higher is better
            radarData[4][`run${run.version}`] = 100 - (Number.parseFloat(run.metrics.maxDrawdown) / maxDrawdown) * 100
        })

        return radarData
    }

    const prepareParametersChartData = () => {
        if (!comparisonData || comparisonData.length === 0) return []

        // Get all unique parameter keys
        const allParams = Array.from(new Set(comparisonData.flatMap((run) => Object.keys(run.params || {})))).filter(
            (param) =>
                // Only include numeric parameters
                comparisonData.some((run) => run.params[param] !== undefined && !isNaN(Number.parseFloat(run.params[param]))),
        )

        // Prepare data for the parameters bar chart
        const paramsData = allParams.map((param) => ({ name: param }))

        // Add data for each run
        comparisonData.forEach((run) => {
            paramsData.forEach((paramData) => {
                const paramValue = run.params[paramData.name]
                if (paramValue !== undefined && !isNaN(Number.parseFloat(paramValue))) {
                    paramData[`run${run.version}`] = Number.parseFloat(paramValue)
                } else {
                    paramData[`run${run.version}`] = 0
                }
            })
        })

        return paramsData
    }

    // Prepare monthly returns data
    const prepareMonthlyReturnsData = () => {
        if (!comparisonData || comparisonData.length === 0) return []

        // Get all unique months from all runs
        const allMonths = new Set()
        comparisonData.forEach((run) => {
            run.data.data.forEach((d) => {
                const date = new Date(d.date)
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`
                allMonths.add(monthKey)
            })
        })

        // Create monthly data structure
        const monthlyData = Array.from(allMonths).map((monthKey) => {
            const [year, month] = monthKey.split("-").map(Number)
            return {
                monthKey,
                month: new Date(year, month - 1).toLocaleString("default", { month: "short", year: "numeric" }),
            }
        })

        // Sort by date
        monthlyData.sort((a, b) => {
            const [yearA, monthA] = a.monthKey.split("-").map(Number)
            const [yearB, monthB] = b.monthKey.split("-").map(Number)
            return yearA !== yearB ? yearA - yearB : monthA - monthB
        })

        // Calculate monthly returns for each run
        comparisonData.forEach((run) => {
            // Group by month and calculate returns
            const months = {}

            run.data.data.forEach((d) => {
                const date = new Date(d.date)
                const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

                if (!months[monthKey]) {
                    months[monthKey] = {
                        initialBalance: d.balance,
                        finalBalance: d.balance,
                    }
                } else {
                    months[monthKey].finalBalance = d.balance
                }
            })

            // Add returns to monthly data
            monthlyData.forEach((item) => {
                if (months[item.monthKey]) {
                    const monthData = months[item.monthKey]
                    const monthlyReturn = ((monthData.finalBalance - monthData.initialBalance) / monthData.initialBalance) * 100
                    item[`run${run.version}`] = monthlyReturn
                } else {
                    item[`run${run.version}`] = 0
                }
            })
        })

        return monthlyData
    }

    // Prepare drawdown comparison data
    const prepareDrawdownData = () => {
        if (!comparisonData || comparisonData.length === 0) return []

        // Get all unique dates from all runs
        const allDates = new Set()
        comparisonData.forEach((run) => {
            run.data.data.forEach((d) => {
                allDates.add(d.date)
            })
        })

        // Create drawdown data structure
        const drawdownData = Array.from(allDates).map((date) => ({ date }))

        // Sort by date
        drawdownData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

        // Calculate drawdown for each run
        comparisonData.forEach((run) => {
            // Calculate max balance up to each point
            const maxBalances = {}
            let runningMax = run.data.data[0].balance

            run.data.data.forEach((d) => {
                if (d.balance > runningMax) {
                    runningMax = d.balance
                }
                maxBalances[d.date] = runningMax
            })

            // Add drawdown to data
            drawdownData.forEach((item) => {
                const runData = run.data.data.find((d) => d.date === item.date)
                if (runData && maxBalances[item.date]) {
                    const drawdown = ((maxBalances[item.date] - runData.balance) / maxBalances[item.date]) * 100
                    item[`run${run.version}`] = drawdown
                }
            })
        })

        return drawdownData
    }

    const metricsChartData = prepareComparisonChartData()
    const radarChartData = prepareRadarChartData()
    const parametersChartData = prepareParametersChartData()
    const monthlyReturnsData = prepareMonthlyReturnsData()
    const drawdownData = prepareDrawdownData()

    return (
        <div className="container py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeftIcon className="h-4 w-4" />
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
                    <Button variant="outline">
                        <Share2Icon className="mr-2 h-4 w-4" />
                        Share
                    </Button>
                    <Button variant="outline">
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Export
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-[400px]">
                    <div className="animate-pulse text-lg">Loading comparison data...</div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {comparisonData.map((run, index) => {
                            const colors = [
                                "bg-green-100 border-green-500",
                                "bg-blue-100 border-blue-500",
                                "bg-orange-100 border-orange-500",
                                "bg-purple-100 border-purple-500",
                                "bg-pink-100 border-pink-500",
                            ]
                            const textColors = [
                                "text-green-700",
                                "text-blue-700",
                                "text-orange-700",
                                "text-purple-700",
                                "text-pink-700",
                            ]
                            const colorIndex = index % colors.length

                            return (
                                <Card key={run.version} className={`${colors[colorIndex]} border-2`}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className={`${textColors[colorIndex]} flex items-center`}>Run #{run.version}</CardTitle>
                                        <CardDescription>{formatDate(run.date)}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-1">
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium">Return:</span>
                                                <span
                                                    className={`text-sm font-bold ${Number(run.metrics.strategyReturn) >= 0 ? "text-green-600" : "text-red-600"}`}
                                                >
                                                    {run.metrics.strategyReturn}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium">Alpha:</span>
                                                <span
                                                    className={`text-sm font-bold ${Number(run.metrics.alpha) >= 0 ? "text-green-600" : "text-red-600"}`}
                                                >
                                                    {run.metrics.alpha}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium">Win Rate:</span>
                                                <span className="text-sm font-bold">{run.metrics.winRate}%</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid grid-cols-4 mb-6 w-full max-w-2xl">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="performance">Performance</TabsTrigger>
                            <TabsTrigger value="parameters">Parameters</TabsTrigger>
                            <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Balance Performance Chart */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Balance Performance</CardTitle>
                                        <CardDescription>Account balance over time for each strategy</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart
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
                                                        width={80}
                                                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                                                    />
                                                    <Tooltip
                                                        formatter={(value) => [`$${value.toLocaleString()}`, "Balance"]}
                                                        labelFormatter={(label) => `Date: ${label}`}
                                                    />
                                                    <Legend />

                                                    {comparisonData.map((run, index) => {
                                                        // Use different colors for each run
                                                        const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                        const color = colors[index % colors.length]

                                                        return (
                                                            <Area
                                                                key={run.version}
                                                                type="monotone"
                                                                data={run.data.data}
                                                                dataKey="balance"
                                                                name={`Run #${run.version}`}
                                                                stroke={color}
                                                                fill={color}
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                            />
                                                        )
                                                    })}
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Radar Chart for Multi-metric Comparison */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Strategy Profile</CardTitle>
                                        <CardDescription>Multi-dimensional performance comparison</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <RadarChart outerRadius={150} width={730} height={400} data={radarChartData}>
                                                    <PolarGrid />
                                                    <PolarAngleAxis dataKey="metric" />
                                                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                                                    <Legend />

                                                    {comparisonData.map((run, index) => {
                                                        const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                        const color = colors[index % colors.length]

                                                        return (
                                                            <Radar
                                                                key={run.version}
                                                                name={`Run #${run.version}`}
                                                                dataKey={`run${run.version}`}
                                                                stroke={color}
                                                                fill={color}
                                                                fillOpacity={0.3}
                                                            />
                                                        )
                                                    })}
                                                </RadarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Key Metrics Bar Chart Comparison */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Key Metrics</CardTitle>
                                        <CardDescription>Side-by-side comparison of key performance metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    layout="vertical"
                                                    data={metricsChartData}
                                                    margin={{
                                                        top: 20,
                                                        right: 20,
                                                        left: 100,
                                                        bottom: 20,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" tickFormatter={(value) => `${value}%`} />
                                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} />
                                                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, ""]} />
                                                    <Legend />

                                                    {comparisonData.map((run, index) => {
                                                        const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                        const color = colors[index % colors.length]

                                                        return (
                                                            <Bar
                                                                key={run.version}
                                                                dataKey={`run${run.version}`}
                                                                name={`Run #${run.version}`}
                                                                fill={color}
                                                                radius={[0, 4, 4, 0]}
                                                            />
                                                        )
                                                    })}
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="performance" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Monthly Returns Comparison */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Monthly Returns</CardTitle>
                                        <CardDescription>Month-by-month performance comparison</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    data={monthlyReturnsData}
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
                                                        tick={{ fontSize: 12, angle: -45, textAnchor: "end" }}
                                                        height={60}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fontSize: 12 }}
                                                        width={40}
                                                        tickFormatter={(value) => `${value}%`}
                                                    />
                                                    <Tooltip formatter={(value) => [`${value.toFixed(2)}%`, value >= 0 ? "Return" : "Loss"]} />
                                                    <Legend />

                                                    {comparisonData.map((run, index) => {
                                                        const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                        const color = colors[index % colors.length]

                                                        return (
                                                            <Bar
                                                                key={run.version}
                                                                dataKey={`run${run.version}`}
                                                                name={`Run #${run.version}`}
                                                                fill={color}
                                                                radius={[4, 4, 0, 0]}
                                                            />
                                                        )
                                                    })}
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Drawdown Comparison */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Drawdown Comparison</CardTitle>
                                        <CardDescription>Historical drawdown periods for each strategy</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <AreaChart
                                                    data={drawdownData}
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
                                                        formatter={(value) => [`${value.toFixed(2)}%`, "Drawdown"]}
                                                        labelFormatter={(label) => `Date: ${label}`}
                                                    />
                                                    <Legend />

                                                    {comparisonData.map((run, index) => {
                                                        const colors = ["#ef4444", "#f97316", "#eab308", "#8b5cf6", "#ec4899"]
                                                        const color = colors[index % colors.length]

                                                        return (
                                                            <Area
                                                                key={run.version}
                                                                type="monotone"
                                                                dataKey={`run${run.version}`}
                                                                name={`Run #${run.version}`}
                                                                stroke={color}
                                                                fill={color}
                                                                fillOpacity={0.3}
                                                            />
                                                        )
                                                    })}
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Cumulative Returns */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Cumulative Returns</CardTitle>
                                        <CardDescription>Percentage growth over time</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ComposedChart
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
                                                        formatter={(value) => [`${value.toFixed(2)}%`, "Return"]}
                                                        labelFormatter={(label) => `Date: ${label}`}
                                                    />
                                                    <Legend />

                                                    {comparisonData.map((run, index) => {
                                                        // Use different colors for each run
                                                        const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                        const color = colors[index % colors.length]

                                                        // Calculate cumulative returns
                                                        const initialBalance = run.data.data[0].balance
                                                        const cumulativeData = run.data.data.map((d) => ({
                                                            date: d.date,
                                                            [`return${run.version}`]: ((d.balance - initialBalance) / initialBalance) * 100,
                                                        }))

                                                        return (
                                                            <Area
                                                                key={run.version}
                                                                type="monotone"
                                                                data={cumulativeData}
                                                                dataKey={`return${run.version}`}
                                                                name={`Run #${run.version}`}
                                                                stroke={color}
                                                                fill={color}
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                            />
                                                        )
                                                    })}
                                                </ComposedChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="parameters" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Parameters Visual Comparison */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Parameters Comparison</CardTitle>
                                        <CardDescription>Visual comparison of strategy parameters</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="h-[400px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart
                                                    layout="vertical"
                                                    data={parametersChartData}
                                                    margin={{
                                                        top: 20,
                                                        right: 20,
                                                        left: 100,
                                                        bottom: 20,
                                                    }}
                                                >
                                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                                    <XAxis type="number" />
                                                    <YAxis type="category" dataKey="name" axisLine={false} tickLine={false} width={100} />
                                                    <Tooltip formatter={(value) => [value.toFixed(2), ""]} />
                                                    <Legend />

                                                    {comparisonData.map((run, index) => {
                                                        const colors = ["#10b981", "#3b82f6", "#f97316", "#8b5cf6", "#ec4899"]
                                                        const color = colors[index % colors.length]

                                                        return (
                                                            <Bar
                                                                key={run.version}
                                                                dataKey={`run${run.version}`}
                                                                name={`Run #${run.version}`}
                                                                fill={color}
                                                                radius={[0, 4, 4, 0]}
                                                            />
                                                        )
                                                    })}
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Parameters Table */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Parameters Details</CardTitle>
                                        <CardDescription>Detailed comparison of all strategy parameters</CardDescription>
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
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {/* Get all unique parameter keys across all runs */}
                                                    {Array.from(new Set(comparisonData.flatMap((run) => Object.keys(run.params || {})))).map(
                                                        (param) => (
                                                            <tr key={param} className="border-b">
                                                                <td className="p-3 text-sm font-medium">{param}</td>
                                                                {comparisonData.map((run) => (
                                                                    <td key={run.version} className="p-3 text-sm text-center">
                                                                        {run.params[param] !== undefined
                                                                            ? typeof run.params[param] === "number"
                                                                                ? run.params[param].toFixed(2)
                                                                                : run.params[param]
                                                                            : "-"}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ),
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>

                        <TabsContent value="metrics" className="mt-0">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Detailed Metrics Table */}
                                <Card className="md:col-span-2">
                                    <CardHeader>
                                        <CardTitle>Performance Metrics</CardTitle>
                                        <CardDescription>Detailed comparison of all performance metrics</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="rounded-md border">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="border-b bg-muted/50">
                                                        <th className="p-3 text-left text-sm font-medium">Metric</th>
                                                        {comparisonData.map((run) => (
                                                            <th key={run.version} className="p-3 text-center text-sm font-medium">
                                                                Run #{run.version}
                                                            </th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Strategy Return</td>
                                                        {comparisonData.map((run) => (
                                                            <td
                                                                key={run.version}
                                                                className={`p-3 text-sm text-center ${Number(run.metrics.strategyReturn) >= 0 ? "text-green-500" : "text-red-500"
                                                                    }`}
                                                            >
                                                                {run.metrics.strategyReturn}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Market Return</td>
                                                        {comparisonData.map((run) => (
                                                            <td
                                                                key={run.version}
                                                                className={`p-3 text-sm text-center ${Number(run.metrics.marketReturn) >= 0 ? "text-green-500" : "text-red-500"
                                                                    }`}
                                                            >
                                                                {run.metrics.marketReturn}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Alpha</td>
                                                        {comparisonData.map((run) => (
                                                            <td
                                                                key={run.version}
                                                                className={`p-3 text-sm text-center ${Number(run.metrics.alpha) >= 0 ? "text-green-500" : "text-red-500"
                                                                    }`}
                                                            >
                                                                {run.metrics.alpha}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Max Drawdown</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center text-red-500">
                                                                {run.metrics.maxDrawdown}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Win Rate</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center">
                                                                {run.metrics.winRate}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Sharpe Ratio</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center">
                                                                {run.metrics.sharpeRatio}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Total Trades</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center">
                                                                {run.metrics.totalTrades}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Best Performer Analysis */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Best Performer Analysis</CardTitle>
                                        <CardDescription>Identifying the top performing strategy</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        {(() => {
                                            // Calculate best performer
                                            const bestReturn = Math.max(
                                                ...comparisonData.map((run) => Number.parseFloat(run.metrics.strategyReturn)),
                                            )
                                            const bestAlpha = Math.max(...comparisonData.map((run) => Number.parseFloat(run.metrics.alpha)))
                                            const bestWinRate = Math.max(
                                                ...comparisonData.map((run) => Number.parseFloat(run.metrics.winRate)),
                                            )
                                            const bestSharpe = Math.max(
                                                ...comparisonData.map((run) => Number.parseFloat(run.metrics.sharpeRatio)),
                                            )
                                            const lowestDrawdown = Math.min(
                                                ...comparisonData.map((run) => Number.parseFloat(run.metrics.maxDrawdown)),
                                            )

                                            // Count wins for each run
                                            const wins = comparisonData.map((run) => {
                                                let count = 0
                                                if (Number.parseFloat(run.metrics.strategyReturn) === bestReturn) count++
                                                if (Number.parseFloat(run.metrics.alpha) === bestAlpha) count++
                                                if (Number.parseFloat(run.metrics.winRate) === bestWinRate) count++
                                                if (Number.parseFloat(run.metrics.sharpeRatio) === bestSharpe) count++
                                                if (Number.parseFloat(run.metrics.maxDrawdown) === lowestDrawdown) count++
                                                return { version: run.version, count }
                                            })

                                            // Find overall best
                                            const bestRun = wins.reduce(
                                                (best, current) => (current.count > best.count ? current : best),
                                                wins[0],
                                            )

                                            // Get the run data
                                            const bestRunData = comparisonData.find((run) => run.version === bestRun.version)

                                            return (
                                                <div className="space-y-4">
                                                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                                        <h3 className="text-lg font-medium text-green-800 mb-2">
                                                            Best Overall: Run #{bestRun.version}
                                                        </h3>
                                                        <p className="text-sm text-green-700 mb-4">
                                                            This run outperformed in {bestRun.count} out of 5 key metrics
                                                        </p>

                                                        <div className="grid grid-cols-2 gap-2">
                                                            <div className="flex justify-between items-center bg-white p-2 rounded-md">
                                                                <span className="text-sm font-medium">Return</span>
                                                                <span className="text-sm font-bold text-green-600">
                                                                    {bestRunData.metrics.strategyReturn}%
                                                                </span>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-white p-2 rounded-md">
                                                                <span className="text-sm font-medium">Alpha</span>
                                                                <span className="text-sm font-bold text-green-600">{bestRunData.metrics.alpha}%</span>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-white p-2 rounded-md">
                                                                <span className="text-sm font-medium">Win Rate</span>
                                                                <span className="text-sm font-bold">{bestRunData.metrics.winRate}%</span>
                                                            </div>
                                                            <div className="flex justify-between items-center bg-white p-2 rounded-md">
                                                                <span className="text-sm font-medium">Sharpe</span>
                                                                <span className="text-sm font-bold">{bestRunData.metrics.sharpeRatio}</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <h4 className="font-medium mt-4">Key Parameters</h4>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {Object.entries(bestRunData.params).map(([key, value]) => (
                                                            <div key={key} className="flex justify-between items-center bg-muted/30 p-2 rounded-md">
                                                                <span className="text-sm font-medium">{key}</span>
                                                                <span className="text-sm">{value}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )
                                        })()}
                                    </CardContent>
                                </Card>

                                {/* Improvement Suggestions */}
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Improvement Suggestions</CardTitle>
                                        <CardDescription>Analysis and recommendations for better performance</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {(() => {
                                                // Analyze parameters and performance
                                                const bestReturn = Math.max(
                                                    ...comparisonData.map((run) => Number.parseFloat(run.metrics.strategyReturn)),
                                                )
                                                const bestRunData = comparisonData.find(
                                                    (run) => Number.parseFloat(run.metrics.strategyReturn) === bestReturn,
                                                )

                                                // Find parameter correlations
                                                const paramCorrelations = []

                                                // Check SMA Fast correlation
                                                if (comparisonData.some((run) => run.params.smaFast !== undefined)) {
                                                    const sorted = [...comparisonData].sort(
                                                        (a, b) => Number.parseFloat(a.params.smaFast) - Number.parseFloat(b.params.smaFast),
                                                    )

                                                    const trend =
                                                        Number.parseFloat(sorted[0].metrics.strategyReturn) <
                                                            Number.parseFloat(sorted[sorted.length - 1].metrics.strategyReturn)
                                                            ? "higher"
                                                            : "lower"

                                                    paramCorrelations.push({
                                                        param: "smaFast",
                                                        trend,
                                                        suggestion: `Consider testing with ${trend} SMA Fast period values`,
                                                    })
                                                }

                                                // Check SMA Slow correlation
                                                if (comparisonData.some((run) => run.params.smaSlow !== undefined)) {
                                                    const sorted = [...comparisonData].sort(
                                                        (a, b) => Number.parseFloat(a.params.smaSlow) - Number.parseFloat(b.params.smaSlow),
                                                    )

                                                    const trend =
                                                        Number.parseFloat(sorted[0].metrics.strategyReturn) <
                                                            Number.parseFloat(sorted[sorted.length - 1].metrics.strategyReturn)
                                                            ? "higher"
                                                            : "lower"

                                                    paramCorrelations.push({
                                                        param: "smaSlow",
                                                        trend,
                                                        suggestion: `Consider testing with ${trend} SMA Slow period values`,
                                                    })
                                                }

                                                return (
                                                    <>
                                                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                                                            <h3 className="text-lg font-medium text-blue-800 mb-2">Parameter Analysis</h3>
                                                            <ul className="space-y-2 text-sm text-blue-700">
                                                                {paramCorrelations.map((corr, i) => (
                                                                    <li key={i}>• {corr.suggestion}</li>
                                                                ))}
                                                                <li>• Try combining the best parameters from different runs</li>
                                                                <li>
                                                                    • The best performing run had {bestRunData.params.smaFast} SMA Fast and{" "}
                                                                    {bestRunData.params.smaSlow} SMA Slow
                                                                </li>
                                                            </ul>
                                                        </div>

                                                        <div className="p-4 bg-amber-50 border border-amber-200 rounded-md mt-4">
                                                            <h3 className="text-lg font-medium text-amber-800 mb-2">Next Steps</h3>
                                                            <ul className="space-y-2 text-sm text-amber-700">
                                                                <li>• Run additional backtests with parameter variations</li>
                                                                <li>• Test with different risk levels to find optimal risk-reward</li>
                                                                <li>• Consider testing with different stop loss and take profit levels</li>
                                                                <li>• Validate results with out-of-sample data</li>
                                                            </ul>
                                                        </div>
                                                    </>
                                                )
                                            })()}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </TabsContent>
                    </Tabs>
                </>
            )}
        </div>
    )
}

