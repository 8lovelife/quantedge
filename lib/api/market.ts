import type { MarketData, PriceData, PriceResponse } from "@/lib/types"

// Mock data for frontend development
const mockMarketData: MarketData[] = [
  {
    name: "BTC",
    price: 42356.78,
    change: 2.34,
    volume: "32.5B",
    marketCap: "824.7B",
  },
  {
    name: "ETH",
    price: 2245.92,
    change: -1.23,
    volume: "18.2B",
    marketCap: "269.8B",
  },
  {
    name: "SOL",
    price: 103.45,
    change: 5.67,
    volume: "4.8B",
    marketCap: "43.2B",
  },
  {
    name: "BNB",
    price: 312.78,
    change: 0.89,
    volume: "1.9B",
    marketCap: "48.3B",
  },
  {
    name: "ADA",
    price: 0.52,
    change: -2.45,
    volume: "1.2B",
    marketCap: "18.4B",
  },
]

const mockPriceData: Record<string, PriceData[]> = {
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

// This function will be replaced with actual API call
export async function fetchMarketData(): Promise<MarketData[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch('/api/market/overview')
  // const data = await response.json()
  // return data

  return mockMarketData
}

// This function will be replaced with actual API call
export async function fetchCryptoPrice(symbol: string, timeframe: string): Promise<PriceResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch(`/api/market/price/${symbol}?timeframe=${timeframe}`)
  // const data = await response.json()
  // return data

  const prices = mockPriceData[timeframe] || mockPriceData["1d"]
  const currentPrice = prices[prices.length - 1].price
  const previousPrice = prices[0].price
  const change = {
    value: currentPrice - previousPrice,
    percentage: Number.parseFloat((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)),
  }

  return {
    prices,
    currentPrice,
    change,
  }
}

