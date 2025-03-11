import type {MarketData, PriceResponse} from "@/lib/types"

// Mock data for frontend development
const mockMarketData: MarketData[] = [
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

const mockPriceData: { [key: string]: { price: number }[] } = {
  "1h": Array.from({length: 60}, (_, i) => ({price: 42000 + Math.random() * 100})),
  "1d": Array.from({length: 24}, (_, i) => ({price: 41500 + Math.random() * 1000})),
  "1w": Array.from({length: 7}, (_, i) => ({price: 41000 + Math.random() * 2000})),
  "1m": Array.from({length: 30}, (_, i) => ({price: 40000 + Math.random() * 3000})),
  "1y": Array.from({length: 365}, (_, i) => ({price: 35000 + Math.random() * 10000})),
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

  try {
    // In production, this would be:
    // const response = await fetch(`/api/market/price/${symbol}?timeframe=${timeframe}`);
    // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    // const data = await response.json();
    // return data;

    const prices = mockPriceData[timeframe] || mockPriceData["1d"]
    const currentPrice = prices[prices.length - 1].price
    const previousPrice = prices[0].price
    const change = {
      value: currentPrice - previousPrice,
      percentage: Number.parseFloat((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)),
    }

    return {
      prices: prices.map((p, i) => ({date: `T-${prices.length - i}`, price: p.price})),
      currentPrice,
      change,
    }
  } catch (error) {
    console.error("Error fetching crypto price:", error)
    // Return default data structure to prevent UI errors
    return {
      prices: [],
      currentPrice: 0,
      change: {value: 0, percentage: 0},
    }
  }
}