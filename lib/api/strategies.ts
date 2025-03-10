import type { Strategy, PaginatedResponse } from "@/lib/types"

// Mock data for frontend development
const mockStrategies: Strategy[] = [
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

// This function will be replaced with actual API call
export async function fetchTradingStrategies(page = 1, limit = 6): Promise<PaginatedResponse<Strategy>> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch(`/api/strategies?page=${page}&limit=${limit}`)
  // const data = await response.json()
  // return data

  // Calculate pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = mockStrategies.slice(startIndex, endIndex)
  const totalItems = mockStrategies.length
  const totalPages = Math.ceil(totalItems / limit)

  return {
    items: paginatedItems,
    page,
    limit,
    totalItems,
    totalPages,
  }
}

// This function will be replaced with actual API call
export async function updateStrategyStatus(id: number, status: "active" | "paused"): Promise<void> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // await fetch(`/api/strategies/${id}/status`, {
  //   method: 'PUT',
  //   headers: {
  //     'Content-Type': 'application/json',
  //   },
  //   body: JSON.stringify({ status }),
  // })

  console.log(`Strategy ${id} status updated to ${status}`)
}

// This function will be replaced with actual API call
export async function deleteStrategy(id: number): Promise<void> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // await fetch(`/api/strategies/${id}`, {
  //   method: 'DELETE',
  // })

  console.log(`Strategy ${id} deleted`)
}