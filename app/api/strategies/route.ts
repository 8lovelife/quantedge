import { NextResponse } from "next/server"
import type { Strategy, PaginatedResponse } from "@/lib/types"

// Mock data for API endpoint
const strategies: Strategy[] = [
  {
    id: 1,
    name: "BTC Momentum",
    description: "Follows Bitcoin price momentum with 4-hour timeframe",
    status: "active",
    performance: 8.4,
    allocation: 25,
    risk: "medium",
  },
  {
    id: 2,
    name: "ETH/BTC Ratio",
    description: "Trades based on Ethereum to Bitcoin price ratio",
    status: "active",
    performance: 12.7,
    allocation: 20,
    risk: "high",
  },
  {
    id: 3,
    name: "DeFi Basket",
    description: "Algorithmic trading of top DeFi tokens",
    status: "paused",
    performance: -2.3,
    allocation: 15,
    risk: "high",
  },
  {
    id: 4,
    name: "MACD Crossover",
    description: "MACD indicator strategy for major cryptocurrencies",
    status: "active",
    performance: 5.2,
    allocation: 15,
    risk: "medium",
  },
  {
    id: 5,
    name: "Stablecoin Yield",
    description: "Optimizes yield farming with stablecoins",
    status: "active",
    performance: 1.8,
    allocation: 25,
    risk: "low",
  },
  {
    id: 6,
    name: "Bollinger Bands",
    description: "Uses Bollinger Bands to identify overbought/oversold conditions",
    status: "active",
    performance: 6.7,
    allocation: 10,
    risk: "medium",
  },
  {
    id: 7,
    name: "RSI Divergence",
    description: "Identifies RSI divergence for potential trend reversals",
    status: "paused",
    performance: 3.2,
    allocation: 10,
    risk: "high",
  },
  {
    id: 8,
    name: "Moving Average Cross",
    description: "Trades on moving average crossovers for major cryptocurrencies",
    status: "active",
    performance: 4.5,
    allocation: 15,
    risk: "medium",
  },
  {
    id: 9,
    name: "Fibonacci Retracement",
    description: "Uses Fibonacci retracement levels for entry and exit points",
    status: "active",
    performance: 7.8,
    allocation: 10,
    risk: "medium",
  },
  {
    id: 10,
    name: "Volume Profile",
    description: "Analyzes volume profile to identify support and resistance levels",
    status: "paused",
    performance: -1.2,
    allocation: 5,
    risk: "high",
  },
  {
    id: 11,
    name: "Ichimoku Cloud",
    description: "Uses Ichimoku Cloud for trend identification and support/resistance",
    status: "active",
    performance: 5.9,
    allocation: 10,
    risk: "medium",
  },
  {
    id: 12,
    name: "Dollar Cost Averaging",
    description: "Automated regular purchases of top cryptocurrencies",
    status: "active",
    performance: 3.4,
    allocation: 15,
    risk: "low",
  },
]

export async function GET(request: Request) {
  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Query your database for the user's strategies
  // 3. Process the data
  // 4. Return the response

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get("page") || 1)
  const limit = Number(searchParams.get("limit") || 6)

  // Calculate pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = strategies.slice(startIndex, endIndex)
  const totalItems = strategies.length
  const totalPages = Math.ceil(totalItems / limit)

  const response: PaginatedResponse<Strategy> = {
    items: paginatedItems,
    page,
    limit,
    totalItems,
    totalPages,
  }

  return NextResponse.json(response)
}

export async function POST(request: Request) {
  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Validate the request body
  // 3. Create a new strategy in your database
  // 4. Return the created strategy

  const body = await request.json()

  // Mock creating a new strategy
  const newStrategy: Strategy = {
    id: strategies.length + 1,
    name: body.name,
    description: body.description,
    status: "active",
    performance: 0,
    allocation: body.allocation,
    risk: body.risk,
  }

  return NextResponse.json(newStrategy, { status: 201 })
}