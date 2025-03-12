import { NextResponse } from "next/server"
import type { PriceData, PriceResponse } from "@/lib/types"

// Mock data for API endpoint - expanded to include multiple cryptocurrencies
const priceData: Record<string, Record<string, PriceData[]>> = {
  BTC: {
    "1h": generatePriceData(42000, 42500, 6, "hour"),
    "1d": generatePriceData(40000, 43000, 7, "day"),
    "1w": generatePriceData(39000, 43000, 6, "week"),
    "1m": generatePriceData(38000, 43000, 3, "month"),
    "1y": generatePriceData(28000, 43000, 5, "year"),
  },
  ETH: {
    "1h": generatePriceData(2200, 2300, 6, "hour"),
    "1d": generatePriceData(2100, 2300, 7, "day"),
    "1w": generatePriceData(2000, 2300, 6, "week"),
    "1m": generatePriceData(1900, 2300, 3, "month"),
    "1y": generatePriceData(1500, 2300, 5, "year"),
  },
  SOL: {
    "1h": generatePriceData(100, 110, 6, "hour"),
    "1d": generatePriceData(95, 110, 7, "day"),
    "1w": generatePriceData(90, 110, 6, "week"),
    "1m": generatePriceData(85, 110, 3, "month"),
    "1y": generatePriceData(50, 110, 5, "year"),
  },
}

function generatePriceData(min: number, max: number, count: number, timeType: string): PriceData[] {
  const result: PriceData[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    let date = ""

    if (timeType === "hour") {
      const hourAgo = new Date(now)
      hourAgo.setHours(hourAgo.getHours() - (count - i - 1))
      date = `${hourAgo.getHours()}:${hourAgo.getMinutes().toString().padStart(2, "0")}`
    } else if (timeType === "day") {
      const dayAgo = new Date(now)
      dayAgo.setDate(dayAgo.getDate() - (count - i - 1))
      date = `${dayAgo.toLocaleString("default", { month: "short" })} ${dayAgo.getDate()}`
    } else if (timeType === "week") {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - (count - i - 1) * 7)
      date = `${weekAgo.toLocaleString("default", { month: "short" })} ${weekAgo.getDate()}`
    } else if (timeType === "month") {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - (count - i - 1))
      date = monthAgo.toLocaleString("default", { month: "short" })
    } else if (timeType === "year") {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - (count - i - 1) + 1)
      date = `${yearAgo.toLocaleString("default", { month: "short" })} ${yearAgo.getFullYear()}`
    }

    // Generate a price that trends upward but with some randomness
    const progress = i / (count - 1)
    const price = min + (max - min) * progress + Math.random() * (max - min) * 0.1 - (max - min) * 0.05

    result.push({
      date,
      price: Number(price.toFixed(2)),
    })
  }

  return result
}

export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get("timeframe") || "1d"
  const { symbol } = await params

  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Query your database or external APIs (like CoinGecko, CoinMarketCap, etc.)
  // 3. Process the data
  // 4. Return the response

  const cryptoData = priceData[symbol] || priceData["BTC"]
  const prices = cryptoData[timeframe] || cryptoData["1d"]

  const currentPrice = prices[prices.length - 1].price
  const previousPrice = prices[0].price
  const change = {
    value: currentPrice - previousPrice,
    percentage: Number.parseFloat((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)),
  }

  const response: PriceResponse = {
    prices,
    currentPrice,
    change,
  }

  return NextResponse.json(response)
}

