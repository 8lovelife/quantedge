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
      algorithm: "Momentum",
      timeframe: "4h",
      assets: "BTC",
      parameters: { lookback: 14, threshold: 0.05, stop_loss: 0.03 },
    },
    {
      id: 2,
      name: "ETH/BTC Ratio",
      description: "Trades based on Ethereum to Bitcoin price ratio",
      status: "active",
      performance: 12.7,
      allocation: 20,
      risk: "high",
      algorithm: "Ratio",
      timeframe: "1d",
      assets: "ETH,BTC",
      parameters: { ratio_threshold: 0.07, ma_period: 20 },
    },
    {
      id: 3,
      name: "DeFi Basket",
      description: "Algorithmic trading of top DeFi tokens",
      status: "paused",
      performance: -2.3,
      allocation: 15,
      risk: "high",
      algorithm: "Basket",
      timeframe: "1d",
      assets: "AAVE,UNI,COMP,SNX",
      parameters: { rebalance_period: 7, max_allocation: 0.3 },
    },
    {
      id: 4,
      name: "MACD Crossover",
      description: "MACD indicator strategy for major cryptocurrencies",
      status: "active",
      performance: 5.2,
      allocation: 15,
      risk: "medium",
      algorithm: "MACD",
      timeframe: "1d",
      assets: "BTC,ETH,SOL",
      parameters: { fast_period: 12, slow_period: 26, signal_period: 9 },
    },
    {
      id: 5,
      name: "Stablecoin Yield",
      description: "Optimizes yield farming with stablecoins",
      status: "active",
      performance: 1.8,
      allocation: 25,
      risk: "low",
      algorithm: "Yield",
      timeframe: "1d",
      assets: "USDC,USDT,DAI",
      parameters: { min_apy: 0.04, max_risk_score: 2 },
    },
    {
      id: 6,
      name: "Bollinger Bands",
      description: "Uses Bollinger Bands to identify overbought/oversold conditions",
      status: "active",
      performance: 6.7,
      allocation: 10,
      risk: "medium",
      algorithm: "Bollinger",
      timeframe: "4h",
      assets: "BTC,ETH,BNB",
      parameters: { period: 20, std_dev: 2, mean_reversion: true },
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