"use client"

import { useState, useEffect } from "react"
import { PieChart, Pie, ResponsiveContainer, Legend } from "recharts"

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchAssetAllocation } from "@/lib/api/portfolio"
import type { AssetData } from "@/lib/types"

export function AssetAllocation() {
  const [assetData, setAssetData] = useState<AssetData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAssetData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchAssetAllocation()
        setAssetData(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch asset allocation data:", err)
        setError("Failed to load asset allocation data")
      } finally {
        setIsLoading(false)
      }
    }

    loadAssetData()
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
        btc: {
          label: "Bitcoin",
          color: "var(--chart-1)",
        },
        eth: {
          label: "Ethereum",
          color: "var(--chart-2)",
        },
        sol: {
          label: "Solana",
          color: "var(--chart-3)",
        },
        others: {
          label: "Others",
          color: "var(--chart-4)",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={assetData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

