"use client"

import { useState, useEffect } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart"
import { fetchPortfolioPerformance, fetchAssetAllocation } from "@/lib/api/portfolio"
import type { StrategyPerformance, AssetData } from "@/lib/types"

const strategies = [
  { value: "all", label: "All Strategies" },
  { value: "conservative", label: "Conservative" },
  { value: "balanced", label: "Balanced" },
  { value: "aggressive", label: "Aggressive" },
  { value: "custom", label: "Custom" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export function PortfolioPerformance() {
  const [selectedStrategy, setSelectedStrategy] = useState("all")
  const [performanceData, setPerformanceData] = useState<StrategyPerformance[]>([])
  const [assetAllocation, setAssetAllocation] = useState<AssetData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [perfData, allocationData] = await Promise.all([
          fetchPortfolioPerformance(selectedStrategy),
          fetchAssetAllocation(selectedStrategy),
        ])
        setPerformanceData(perfData)
        setAssetAllocation(allocationData)
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

  const renderCharts = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        className="h-[300px]"
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
            <Line type="monotone" dataKey="totalValue" stroke="var(--color-chart-1)" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="invested" stroke="var(--color-chart-2)" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="profit" stroke="var(--color-chart-3)" activeDot={{ r: 8 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer
        config={{
          allocation: {
            label: "Allocation",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-[300px]"
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
    </div>
  )

  if (isLoading) {
    return <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
  }

  if (error) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground">{error}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">Portfolio Performance</CardTitle>
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
      </CardHeader>
      <CardContent>
        <CardDescription className="mb-4">
          Performance over time and current asset allocation for the selected strategy
        </CardDescription>
        {renderCharts()}
      </CardContent>
    </Card>
  )
}