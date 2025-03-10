import type { Trade, PaginatedResponse } from "@/lib/types"

// Mock data for frontend development
const mockTrades: Trade[] = [
  {
    id: "T-1234",
    strategy: "BTC Momentum",
    type: "buy",
    asset: "BTC",
    amount: 0.12,
    price: 42356.78,
    timestamp: "2023-03-08T14:32:45Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1233",
    strategy: "ETH/BTC Ratio",
    type: "sell",
    asset: "ETH",
    amount: 1.5,
    price: 2245.92,
    timestamp: "2023-03-08T12:15:22Z",
    status: "completed",
    profit: 123.45,
  },
  {
    id: "T-1232",
    strategy: "MACD Crossover",
    type: "buy",
    asset: "SOL",
    amount: 10,
    price: 103.45,
    timestamp: "2023-03-08T09:45:11Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1231",
    strategy: "DeFi Basket",
    type: "sell",
    asset: "AAVE",
    amount: 5,
    price: 87.23,
    timestamp: "2023-03-07T22:12:33Z",
    status: "completed",
    profit: -42.15,
  },
  {
    id: "T-1230",
    strategy: "BTC Momentum",
    type: "sell",
    asset: "BTC",
    amount: 0.08,
    price: 41245.67,
    timestamp: "2023-03-07T18:05:27Z",
    status: "completed",
    profit: 215.78,
  },
  {
    id: "T-1229",
    strategy: "RSI Divergence",
    type: "buy",
    asset: "ETH",
    amount: 2.3,
    price: 2198.45,
    timestamp: "2023-03-07T15:22:18Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1228",
    strategy: "Bollinger Bands",
    type: "sell",
    asset: "SOL",
    amount: 15,
    price: 101.23,
    timestamp: "2023-03-07T12:45:33Z",
    status: "completed",
    profit: 78.35,
  },
  {
    id: "T-1227",
    strategy: "Moving Average Cross",
    type: "buy",
    asset: "BNB",
    amount: 3.5,
    price: 310.45,
    timestamp: "2023-03-07T10:18:42Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1226",
    strategy: "Fibonacci Retracement",
    type: "sell",
    asset: "ADA",
    amount: 1000,
    price: 0.54,
    timestamp: "2023-03-07T08:32:15Z",
    status: "completed",
    profit: -25.3,
  },
  {
    id: "T-1225",
    strategy: "Stablecoin Yield",
    type: "buy",
    asset: "USDC",
    amount: 5000,
    price: 1.0,
    timestamp: "2023-03-07T06:45:22Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1224",
    strategy: "DeFi Basket",
    type: "buy",
    asset: "UNI",
    amount: 50,
    price: 12.34,
    timestamp: "2023-03-06T22:15:33Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1223",
    strategy: "ETH/BTC Ratio",
    type: "buy",
    asset: "ETH",
    amount: 1.2,
    price: 2210.45,
    timestamp: "2023-03-06T18:22:45Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1222",
    strategy: "MACD Crossover",
    type: "sell",
    asset: "DOT",
    amount: 100,
    price: 8.75,
    timestamp: "2023-03-06T15:45:12Z",
    status: "completed",
    profit: 125.5,
  },
  {
    id: "T-1221",
    strategy: "BTC Momentum",
    type: "buy",
    asset: "BTC",
    amount: 0.15,
    price: 41025.33,
    timestamp: "2023-03-06T12:33:27Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1220",
    strategy: "Ichimoku Cloud",
    type: "sell",
    asset: "LINK",
    amount: 75,
    price: 15.22,
    timestamp: "2023-03-06T09:18:45Z",
    status: "completed",
    profit: 87.25,
  },
]

// This function will be replaced with actual API call
export async function fetchRecentTrades(page = 1, limit = 10): Promise<PaginatedResponse<Trade>> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch(`/api/trades/recent?page=${page}&limit=${limit}`)
  // const data = await response.json()
  // return data

  // Calculate pagination
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedItems = mockTrades.slice(startIndex, endIndex)
  const totalItems = mockTrades.length
  const totalPages = Math.ceil(totalItems / limit)

  return {
    items: paginatedItems,
    page,
    limit,
    totalItems,
    totalPages,
  }
}