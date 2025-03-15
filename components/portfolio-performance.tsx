"use client"

import type React from "react"

import { useState, useEffect, useMemo, useRef } from "react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  AreaChart,
  Area,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import {
  fetchPortfolioPerformance,
  fetchAssetAllocation,
  fetchMonthlyReturns,
  fetchBenchmarkComparison,
} from "@/lib/api/portfolio"
import type { StrategyPerformance, AssetData, MonthlyReturn, BenchmarkData } from "@/lib/types"

import {
  LineChartIcon,
  BarChartIcon,
  PieChartIcon,
  TrendingUpIcon,
  ActivityIcon,
  XIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  GripIcon,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

const strategies = [
  { value: "all", label: "All Strategies" },
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" },
  { value: "custom", label: "Custom" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

// Define chart types
type ChartType = {
  id: string
  title: string
  icon: React.ReactNode
  span?: number
  component: React.ReactNode
  enabled: boolean
}

export function PortfolioPerformance() {
  const [selectedStrategy, setSelectedStrategy] = useState("all")
  const [performanceData, setPerformanceData] = useState<StrategyPerformance[]>([])
  const [assetAllocation, setAssetAllocation] = useState<AssetData[]>([])
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([])
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const chartsPerPage = 3

  // Chart visibility state
  const [availableCharts, setAvailableCharts] = useState<ChartType[]>([])
  const [isCustomizing, setIsCustomizing] = useState(false)

  // Add new state for drag and drop
  const [draggedChart, setDraggedChart] = useState<string | null>(null)
  const [dropTarget, setDropTarget] = useState<string | null>(null)

  const formattedMonthlyReturns = useMemo(() =>
    monthlyReturns.map((entry) => ({
      ...entry,
      fill: entry.return >= 0 ? "hsl(142, 76%, 36%)" : "hsl(346, 84%, 61%)",
    })),
    [monthlyReturns]
  );

  // Initialize available charts
  useEffect(() => {
    setAvailableCharts([
      {
        id: "portfolio-value",
        title: "Portfolio Value Over Time",
        icon: <LineChartIcon className="mr-2 h-5 w-5 text-primary" />,
        span: 2,
        enabled: true,
        component: (
          <ChartContainer
            config={{
              totalValue: {
                label: "Total Value",
                color: "hsl(var(--chart-1))",
              },
              invested: {
                label: "Invested",
                color: "hsl(var(--chart-2))",
              },
              profit: {
                label: "Profit",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={performanceData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="totalValue"
                  stroke="var(--color-chart-1)"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="invested"
                  stroke="var(--color-chart-2)"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="var(--color-chart-3)"
                  strokeWidth={2}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        ),
      },
      {
        id: "asset-allocation",
        title: "Asset Allocation",
        icon: <PieChartIcon className="mr-2 h-5 w-5 text-primary" />,
        enabled: true,
        component: (
          <ChartContainer
            config={{
              allocation: {
                label: "Allocation",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetAllocation}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {assetAllocation.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        ),
      },
      {
        id: "monthly-returns",
        title: "Monthly Returns",
        icon: <BarChartIcon className="mr-2 h-5 w-5 text-primary" />,
        enabled: true,
        component: (
          <ChartContainer
            config={{
              return: {
                label: "Return %",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={formattedMonthlyReturns}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="return"
                  radius={[4, 4, 0, 0]}
                  name="Return %"
                >
                  {formattedMonthlyReturns.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ),
      },
      {
        id: "benchmark-comparison",
        title: "Performance vs Benchmarks",
        icon: <TrendingUpIcon className="mr-2 h-5 w-5 text-primary" />,
        span: 2,
        enabled: true,
        component: (
          <ChartContainer
            config={{
              portfolio: {
                label: "Your Portfolio",
                color: "hsl(var(--chart-1))",
              },
              btc: {
                label: "Bitcoin",
                color: "hsl(var(--chart-2))",
              },
              sp500: {
                label: "S&P 500",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={benchmarkData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => {
                    // Ensure proper date formatting to avoid localization issues
                    return value.toString()
                  }}
                />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="portfolio"
                  stroke="var(--color-portfolio)"
                  fill="var(--color-portfolio)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="btc"
                  stroke="var(--color-btc)"
                  fill="var(--color-btc)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="sp500"
                  stroke="var(--color-sp500)"
                  fill="var(--color-sp500)"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        ),
      },
      {
        id: "risk-analysis",
        title: "Risk Analysis",
        icon: <ActivityIcon className="mr-2 h-5 w-5 text-primary" />,
        enabled: false,
        component: (
          <ChartContainer
            config={{
              risk: {
                label: "Risk Score",
                color: "hsl(var(--chart-1))",
              },
              return: {
                label: "Return",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-full"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: "Conservative", risk: 3.2, return: 5.4 },
                  { name: "Balanced", risk: 5.8, return: 8.7 },
                  { name: "Aggressive", risk: 8.9, return: 12.3 },
                  { name: "Your Portfolio", risk: 6.2, return: 9.8 },
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Bar dataKey="risk" fill="var(--color-risk)" />
                <Bar dataKey="return" fill="var(--color-return)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        ),
      },
      {
        id: "performance-heatmap",
        title: "Performance Heatmap",
        icon: <LayoutDashboardIcon className="mr-2 h-5 w-5 text-primary" />,
        span: 2,
        enabled: false,
        component: (
          <div className="h-[280px] flex items-center justify-center">
            <div className="grid grid-cols-12 gap-1 w-full max-w-3xl">
              {Array.from({ length: 12 }).map((_, monthIndex) => (
                <div key={`header-${monthIndex}`} className="text-xs text-center text-muted-foreground">
                  {new Date(0, monthIndex).toLocaleString("en-US", { month: "short" })}
                </div>
              ))}
              {Array.from({ length: 3 }).map((_, yearIndex) =>
                Array.from({ length: 12 }).map((_, monthIndex) => {
                  const value = Math.random() * 10 - 3 // Random value between -3 and 7
                  let bgColor = "bg-red-200"
                  if (value > 0) bgColor = "bg-green-200"
                  if (value > 2) bgColor = "bg-green-300"
                  if (value > 4) bgColor = "bg-green-400"
                  if (value > 6) bgColor = "bg-green-500"
                  if (value < 0) bgColor = "bg-red-200"
                  if (value < -1) bgColor = "bg-red-300"
                  if (value < -2) bgColor = "bg-red-400"

                  return (
                    <div key={`cell-${yearIndex}-${monthIndex}`} className="flex flex-col">
                      {monthIndex === 0 && <div className="text-xs text-muted-foreground mb-1">{2022 - yearIndex}</div>}
                      <div className={`h-8 ${bgColor} rounded flex items-center justify-center text-xs font-medium`}>
                        {value.toFixed(1)}%
                      </div>
                    </div>
                  )
                }),
              )}
            </div>
          </div>
        ),
      },
    ])
  }, [performanceData, assetAllocation, monthlyReturns, benchmarkData]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [perfData, allocationData, returnsData, benchmarkData] = await Promise.all([
          fetchPortfolioPerformance(selectedStrategy),
          fetchAssetAllocation(selectedStrategy),
          fetchMonthlyReturns(selectedStrategy),
          fetchBenchmarkComparison(selectedStrategy),
        ])
        setPerformanceData(perfData)
        setAssetAllocation(allocationData)
        setMonthlyReturns(returnsData)
        setBenchmarkData(benchmarkData)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch portfolio data:", err)
        setError("Failed to load portfolio data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [selectedStrategy])

  // Toggle chart visibility
  const toggleChartVisibility = (chartId: string) => {
    setAvailableCharts((charts) =>
      charts.map((chart) => (chart.id === chartId ? { ...chart, enabled: !chart.enabled } : chart)),
    )
  }

  // Remove chart
  const removeChart = (chartId: string) => {
    setAvailableCharts((charts) => charts.map((chart) => (chart.id === chartId ? { ...chart, enabled: false } : chart)))
  }

  // Get visible charts
  const visibleCharts = availableCharts.filter((chart) => chart.enabled)

  // Calculate total pages
  const totalPages = Math.ceil(visibleCharts.length / chartsPerPage)

  // Get current page charts
  const currentCharts = useMemo(() => {
    const startIndex = (currentPage - 1) * chartsPerPage
    return visibleCharts.slice(startIndex, startIndex + chartsPerPage)
  }, [visibleCharts, currentPage, chartsPerPage])

  // Reset to first page when visible charts change
  useEffect(() => {
    setCurrentPage(1)
  }, [visibleCharts.length])

  // Update drag and drop handlers
  const handleDragStart = (e: React.DragEvent, chartId: string) => {
    setDraggedChart(chartId)
    e.dataTransfer.effectAllowed = 'move'
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.6'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedChart(null)
    setDropTarget(null)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent, chartId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTarget(chartId)
  }

  const handleDragLeave = () => {
    setDropTarget(null)
  }

  const handleDrop = (e: React.DragEvent, targetChartId: string) => {
    e.preventDefault()
    setDropTarget(null)
    if (!draggedChart || draggedChart === targetChartId) return

    setAvailableCharts(prevCharts => {
      const charts = [...prevCharts]
      const draggedIndex = charts.findIndex(c => c.id === draggedChart)
      const targetIndex = charts.findIndex(c => c.id === targetChartId)

      const [draggedItem] = charts.splice(draggedIndex, 1)
      charts.splice(targetIndex, 0, draggedItem)

      return charts
    })
  }

  if (isLoading) {
    return <div className="h-[600px] w-full animate-pulse rounded bg-muted"></div>
  }

  if (error) {
    return <div className="flex h-[600px] items-center justify-center text-muted-foreground">{error}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">Portfolio Performance</CardTitle>
          <CardDescription>Track your portfolio's performance across different strategies</CardDescription>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select strategy" />
            </SelectTrigger>
            <SelectContent>
              {strategies.map((strategy) => (
                <SelectItem key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
            <DialogTrigger asChild>
              <Button variant="outline" size="icon">
                <Settings2Icon className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Customize Dashboard</DialogTitle>
                <DialogDescription>Select which charts to display on your dashboard.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4">
                {availableCharts.map((chart) => (
                  <div key={chart.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={chart.id}
                      checked={chart.enabled}
                      onCheckedChange={() => toggleChartVisibility(chart.id)}
                    />
                    <Label htmlFor={chart.id} className="flex items-center">
                      {chart.icon}
                      {chart.title}
                    </Label>
                  </div>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {error && <div className="rounded-md bg-destructive/15 p-3 mb-4 text-destructive">{error}</div>}

        <div className="flex flex-col h-full min-h-[calc(100vh-12rem)]">
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[300px] sm:auto-rows-[350px] lg:auto-rows-[400px]">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="w-full h-full animate-pulse bg-muted" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-[300px] sm:auto-rows-[350px] lg:auto-rows-[400px]">
                {currentCharts.map((chart) => (
                  <Card
                    key={chart.id}
                    className={`
                      ${chart.span === 2 ? "md:col-span-2 lg:col-span-2" : ""} 
                      relative
                      ${dropTarget === chart.id ? "ring-2 ring-primary ring-offset-2" : ""}
                      transition-all duration-200
                      hover:shadow-lg
                      h-full
                    `}
                    draggable
                    onDragStart={(e) => handleDragStart(e, chart.id)}
                    onDragEnd={handleDragEnd}
                    onDragOver={(e) => handleDragOver(e, chart.id)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, chart.id)}
                  >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <div className="flex items-center">
                        {chart.icon}
                        <CardTitle className="text-base sm:text-lg font-medium truncate">{chart.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-accent"
                          onClick={() => removeChart(chart.id)}
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 p-2 sm:p-4">
                      <div className="h-full">
                        {chart.component}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="sticky bottom-0 mt-4 pt-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <Pagination className="relative">
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink isActive={currentPage === page} onClick={() => setCurrentPage(page)}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

