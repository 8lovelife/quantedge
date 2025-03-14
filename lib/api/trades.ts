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
  {
    id: "T-1219",
    strategy: "Volatility Breakout",
    type: "buy",
    asset: "AVAX",
    amount: 25,
    price: 35.67,
    timestamp: "2023-03-06T07:12:33Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1218",
    strategy: "DeFi Yield",
    type: "buy",
    asset: "AAVE",
    amount: 8,
    price: 92.45,
    timestamp: "2023-03-06T05:45:18Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1217",
    strategy: "Smart Contract Platforms",
    type: "sell",
    asset: "SOL",
    amount: 30,
    price: 105.78,
    timestamp: "2023-03-05T22:33:42Z",
    status: "completed",
    profit: 145.60,
  },
  {
    id: "T-1216",
    strategy: "Layer 2 Solutions",
    type: "buy",
    asset: "MATIC",
    amount: 1000,
    price: 1.45,
    timestamp: "2023-03-05T20:15:27Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1215",
    strategy: "NFT Market Index",
    type: "sell",
    asset: "APE",
    amount: 150,
    price: 4.25,
    timestamp: "2023-03-05T18:22:15Z",
    status: "completed",
    profit: -32.75,
  },
  {
    id: "T-1214",
    strategy: "Gaming Tokens",
    type: "buy",
    asset: "AXS",
    amount: 45,
    price: 9.87,
    timestamp: "2023-03-05T15:48:33Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1213",
    strategy: "Privacy Coins",
    type: "sell",
    asset: "XMR",
    amount: 5,
    price: 178.92,
    timestamp: "2023-03-05T12:35:22Z",
    status: "completed",
    profit: 67.45,
  },
  {
    id: "T-1212",
    strategy: "Oracle Networks",
    type: "buy",
    asset: "LINK",
    amount: 100,
    price: 14.56,
    timestamp: "2023-03-05T10:12:45Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1211",
    strategy: "Metaverse Index",
    type: "sell",
    asset: "SAND",
    amount: 500,
    price: 0.87,
    timestamp: "2023-03-05T08:25:18Z",
    status: "completed",
    profit: 125.30,
  },
  {
    id: "T-1210",
    strategy: "Cross-chain Protocols",
    type: "buy",
    asset: "ATOM",
    amount: 20,
    price: 11.23,
    timestamp: "2023-03-05T06:42:33Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1209",
    strategy: "AI Tokens",
    type: "buy",
    asset: "FET",
    amount: 500,
    price: 0.45,
    timestamp: "2023-03-05T04:15:22Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1208",
    strategy: "DeFi Yield",
    type: "sell",
    asset: "CAKE",
    amount: 100,
    price: 3.78,
    timestamp: "2023-03-05T02:33:15Z",
    status: "completed",
    profit: 45.80,
  },
  {
    id: "T-1207",
    strategy: "Smart Contract Platforms",
    type: "buy",
    asset: "ADA",
    amount: 2000,
    price: 0.55,
    timestamp: "2023-03-04T22:45:33Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1206",
    strategy: "BTC Momentum",
    type: "sell",
    asset: "BTC",
    amount: 0.1,
    price: 42150.25,
    timestamp: "2023-03-04T20:12:18Z",
    status: "completed",
    profit: 168.45,
  },
  {
    id: "T-1205",
    strategy: "Layer 2 Solutions",
    type: "sell",
    asset: "OP",
    amount: 200,
    price: 3.25,
    timestamp: "2023-03-04T18:33:42Z",
    status: "completed",
    profit: -28.50,
  },
  {
    id: "T-1204",
    strategy: "NFT Market Index",
    type: "buy",
    asset: "BLUR",
    amount: 1000,
    price: 0.65,
    timestamp: "2023-03-04T16:22:15Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1203",
    strategy: "Metaverse Index",
    type: "buy",
    asset: "MANA",
    amount: 300,
    price: 0.89,
    timestamp: "2023-03-04T14:48:33Z",
    status: "completed",
    profit: null,
  },
  {
    id: "T-1202",
    strategy: "ETH/BTC Ratio",
    type: "sell",
    asset: "ETH",
    amount: 2.5,
    price: 2215.75,
    timestamp: "2023-03-04T12:35:22Z",
    status: "completed",
    profit: 92.30,
  },
  {
    id: "T-1201",
    strategy: "Privacy Coins",
    type: "buy",
    asset: "ZEC",
    amount: 10,
    price: 45.67,
    timestamp: "2023-03-04T10:12:45Z",
    status: "completed",
    profit: null,
  }
]

// This function will be replaced with actual API call
export async function fetchRecentTrades(page = 1, limit = 20): Promise<PaginatedResponse<Trade>> {
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