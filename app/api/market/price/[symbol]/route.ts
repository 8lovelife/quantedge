import { NextResponse } from "next/server"
import type { PriceData, PriceResponse } from "@/lib/types"

// Mock data for API endpoint
const priceData: Record<string, PriceData[]> = {
  "1h": [
    { date: "14:00", price: 42100 },
    { date: "14:10", price: 42150 },
    { date: "14:20", price: 42200 },
    { date: "14:30", price: 42250 },
    { date: "14:40", price: 42300 },
    { date: "14:50", price: 42356 },
  ],
  "1d": [
    { date: "Mar 1", price: 40123 },
    { date: "Mar 2", price: 41245 },
    { date: "Mar 3", price: 40876 },
    { date: "Mar 4", price: 42134 },
    { date: "Mar 5", price: 43256 },
    { date: "Mar 6", price: 42987 },
    { date: "Mar 7", price: 42356 },
  ],
  "1w": [
    { date: "Feb 1", price: 39500 },
    { date: "Feb 8", price: 40200 },
    { date: "Feb 15", price: 41100 },
    { date: "Feb 22", price: 40800 },
    { date: "Mar 1", price: 42300 },
    { date: "Mar 8", price: 42356 },
  ],
  "1m": [
    { date: "Jan", price: 38000 },
    { date: "Feb", price: 40000 },
    { date: "Mar", price: 42356 },
  ],
  "1y": [
    { date: "Mar 2023", price: 28000 },
    { date: "Jun 2023", price: 30500 },
    { date: "Sep 2023", price: 35000 },
    { date: "Dec 2023", price: 38000 },
    { date: "Mar 2024", price: 42356 },
  ],
}

export async function GET(request: Request, { params } : { params: Promise<{ symbol: string }> }) {
  const { searchParams } = new URL(request.url)
  const timeframe = searchParams.get("timeframe") || "1d"
  const { symbol } = await params;

  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Query your database or external APIs (like CoinGecko, CoinMarketCap, etc.)
  // 3. Process the data
  // 4. Return the response

  const prices = priceData[timeframe] || priceData["1d"]
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

