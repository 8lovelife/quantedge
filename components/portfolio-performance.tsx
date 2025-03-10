"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchPortfolioPerformance } from "@/lib/api/portfolio"
import type { PortfolioData } from "@/lib/types"

export function PortfolioPerformance() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadPortfolioData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchPortfolioPerformance()
        setPortfolioData(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch portfolio data:", err)
        setError("Failed to load portfolio data")
      } finally {
        setIsLoading(false)
      }
    }

    loadPortfolioData()
  }, [])

  if (isLoading) {
    return <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
  }

  if (error) {
    return <div className="flex h-[300px] items-center justify-center text-muted-foreground">{error}</div>
  }

  return (
    <ChartContainer
      config={{
        value: {
          label: "Portfolio Value",
          color: "var(--chart-1)",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={portfolioData}
          margin={{
            top: 5,
            right: 10,
            left: 10,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" />
          <YAxis domain={["auto", "auto"]} />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

