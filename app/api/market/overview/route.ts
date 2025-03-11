import { NextResponse } from "next/server"
import type { MarketData } from "@/lib/types"

// Mock data for API endpoint
const marketData: MarketData[] = [
    {
    name: "BTC",
    price: 42356.78,
    change: 2.34,
    volume: "32.5B",
    marketCap: "824.7B",
    sparkline: generateSparklineData(42000, 43000, 24),
  },
  {
    name: "ETH",
    price: 2245.92,
    change: -1.23,
    volume: "18.2B",
    marketCap: "269.8B",
    sparkline: generateSparklineData(2200, 2300, 24),
  },
  {
    name: "BNB",
    price: 312.78,
    change: 0.89,
    volume: "1.9B",
    marketCap: "48.3B",
    sparkline: generateSparklineData(308, 315, 24),
  },
  {
    name: "SOL",
    price: 103.45,
    change: 5.67,
    volume: "4.8B",
    marketCap: "43.2B",
    sparkline: generateSparklineData(98, 105, 24),
  },
  {
    name: "XRP",
    price: 0.58,
    change: 1.45,
    volume: "2.1B",
    marketCap: "31.2B",
    sparkline: generateSparklineData(0.57, 0.59, 24),
  },
  {
    name: "ADA",
    price: 0.52,
    change: -2.45,
    volume: "1.2B",
    marketCap: "18.4B",
    sparkline: generateSparklineData(0.51, 0.54, 24),
  },
  {
    name: "DOGE",
    price: 0.078,
    change: 3.21,
    volume: "0.9B",
    marketCap: "11.1B",
    sparkline: generateSparklineData(0.075, 0.08, 24),
  },
  {
    name: "DOT",
    price: 6.89,
    change: -0.78,
    volume: "0.4B",
    marketCap: "8.6B",
    sparkline: generateSparklineData(6.8, 7.0, 24),
  },
  {
    name: "MATIC",
    price: 0.89,
    change: 4.56,
    volume: "0.7B",
    marketCap: "8.3B",
    sparkline: generateSparklineData(0.85, 0.91, 24),
  },
  {
    name: "LINK",
    price: 14.23,
    change: 2.11,
    volume: "0.5B",
    marketCap: "7.5B",
    sparkline: generateSparklineData(13.9, 14.5, 24),
  },
]

function generateSparklineData(min: number, max: number, points: number): { price: number }[] {
  return Array.from({length: points}, () => ({
    price: min + Math.random() * (max - min),
  }))
}

export async function GET() {
  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Query your database or external APIs (like CoinGecko, CoinMarketCap, etc.)
  // 3. Process the data
  // 4. Return the response

  return NextResponse.json(marketData)
}