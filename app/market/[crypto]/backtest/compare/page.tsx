"use client"

import { useState, useEffect, useRef } from "react"
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
} from "recharts"
import { ArrowLeftIcon, DownloadIcon, Share2Icon, RefreshCw } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

// Format date for display
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString)
        return date.toLocaleString()
    } catch (e) {
        return dateString || "Unknown date"
    }
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
        metrics: {
            strategyReturn: (15 + version * 2).toFixed(2),
            marketReturn: "10.50",
            alpha: (5 + version * 2).toFixed(2),
            maxDrawdown: (8 - version * 0.5).toFixed(2),
            winRate: (60 + version * 5).toFixed(2),
            sharpeRatio: (1.2 + version * 0.2).toFixed(2),
            totalTrades: 12 + version,
        },
        params: {
            smaFast: 10 + version,
            smaSlow: 50,
            riskLevel: version % 2 === 0 ? "medium" : "high",
            stopLoss: 2 + version * 0.5,
            takeProfit: 6 + version,
        },
    }))
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
    const versions = versionsParam ? versionsParam.split(",").map((v) => Number.parseInt(v, 10)) : [1, 2]

    // Load data only once on initial render
    useEffect(() => {
        if (hasLoadedRef.current) return

        const loadData = async () => {
            try {
                setIsLoading(true)
                setError(null)

                console.log("Loading comparison data for versions:", versions.join(","))

                // Instead of making an API call, use mock data for now
                // This prevents the infinite loop issue
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

    // Prepare data for charts - with error handling
    const prepareChartData = () => {
        if (!comparisonData || comparisonData.length === 0) return []

        try {
            // Basic metrics data structure
            const metricsData = [
                { name: "Strategy Return" },
                { name: "Alpha" },
                { name: "Win Rate" },
                { name: "Sharpe Ratio" },
                { name: "Max Drawdown" },
            ]

            // Add data for each run
            comparisonData.forEach((run) => {
                if (!run.metrics) return

                metricsData[0][`run${run.version}`] = Number.parseFloat(run.metrics.strategyReturn || 0)
                metricsData[1][`run${run.version}`] = Number.parseFloat(run.metrics.alpha || 0)
                metricsData[2][`run${run.version}`] = Number.parseFloat(run.metrics.winRate || 0)
                metricsData[3][`run${run.version}`] = Number.parseFloat(run.metrics.sharpeRatio || 0) * 10
                metricsData[4][`run${run.version}`] = Number.parseFloat(run.metrics.maxDrawdown || 0)
            })

            return metricsData
        } catch (err) {
            console.error("Error preparing chart data:", err)
            return []
        }
    }

    const metricsChartData = prepareChartData()

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
                    <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                        Refresh
                    </Button>
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
                                                    className={`text-sm font-bold ${Number.parseFloat(run.metrics?.strategyReturn || "0") >= 0 ? "text-green-600" : "text-red-600"}`}
                                                >
                                                    {run.metrics?.strategyReturn || "0"}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium">Alpha:</span>
                                                <span
                                                    className={`text-sm font-bold ${Number.parseFloat(run.metrics?.alpha || "0") >= 0 ? "text-green-600" : "text-red-600"}`}
                                                >
                                                    {run.metrics?.alpha || "0"}%
                                                </span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-sm font-medium">Win Rate:</span>
                                                <span className="text-sm font-bold">{run.metrics?.winRate || "0"}%</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}
                    </div>

                    <Tabs defaultValue="overview" className="w-full">
                        <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md">
                            <TabsTrigger value="overview">Overview</TabsTrigger>
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
                                                <AreaChart
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
                                                                data={run.data?.data || []}
                                                                dataKey="balance"
                                                                name={`Run #${run.version}`}
                                                                stroke={color}
                                                                fill={color}
                                                                fillOpacity={0.3}
                                                                strokeWidth={2}
                                                            />
                                                        )
                                                    })}
                                                </AreaChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Key Metrics Bar Chart Comparison */}
                                <Card className="md:col-span-2">
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
                                                    <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}%`, ""]} />
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
                                                                className={`p-3 text-sm text-center ${Number.parseFloat(run.metrics?.strategyReturn || "0") >= 0
                                                                    ? "text-green-500"
                                                                    : "text-red-500"
                                                                    }`}
                                                            >
                                                                {run.metrics?.strategyReturn || "0"}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Market Return</td>
                                                        {comparisonData.map((run) => (
                                                            <td
                                                                key={run.version}
                                                                className={`p-3 text-sm text-center ${Number.parseFloat(run.metrics?.marketReturn || "0") >= 0
                                                                    ? "text-green-500"
                                                                    : "text-red-500"
                                                                    }`}
                                                            >
                                                                {run.metrics?.marketReturn || "0"}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Alpha</td>
                                                        {comparisonData.map((run) => (
                                                            <td
                                                                key={run.version}
                                                                className={`p-3 text-sm text-center ${Number.parseFloat(run.metrics?.alpha || "0") >= 0 ? "text-green-500" : "text-red-500"
                                                                    }`}
                                                            >
                                                                {run.metrics?.alpha || "0"}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Max Drawdown</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center text-red-500">
                                                                {run.metrics?.maxDrawdown || "0"}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Win Rate</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center">
                                                                {run.metrics?.winRate || "0"}%
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Sharpe Ratio</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center">
                                                                {run.metrics?.sharpeRatio || "0"}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                    <tr className="border-b">
                                                        <td className="p-3 text-sm font-medium">Total Trades</td>
                                                        {comparisonData.map((run) => (
                                                            <td key={run.version} className="p-3 text-sm text-center">
                                                                {run.metrics?.totalTrades || "0"}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                </tbody>
                                            </table>
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
                                                                        {run.params && run.params[param] !== undefined
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
                    </Tabs>
                </>
            )}
        </div>
    )
}

