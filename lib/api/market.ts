import type { MarketData, OrderBookData, PriceData, PriceResponse } from "@/lib/types"

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
  return Array.from({ length: points }, () => ({
    price: min + Math.random() * (max - min),
  }))
}

const mockPriceData: { [key: string]: { price: number }[] } = {
  "1h": Array.from({ length: 60 }, (_, i) => ({ price: 42000 + Math.random() * 100 })),
  "1d": Array.from({ length: 24 }, (_, i) => ({ price: 41500 + Math.random() * 1000 })),
  "1w": Array.from({ length: 7 }, (_, i) => ({ price: 41000 + Math.random() * 2000 })),
  "1m": Array.from({ length: 30 }, (_, i) => ({ price: 40000 + Math.random() * 3000 })),
  "1y": Array.from({ length: 365 }, (_, i) => ({ price: 35000 + Math.random() * 10000 })),
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

// Update the fetchCryptoPrice function to handle different cryptocurrencies
export async function fetchCryptoPrice(symbol: string, timeframe: string): Promise<PriceResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  try {
    // In production, this would be:
    // const response = await fetch(`/api/market/price/${symbol}?timeframe=${timeframe}`);
    // if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    // const data = await response.json();
    // return data;

    // Generate different price ranges based on the cryptocurrency
    let basePrice = 0
    let priceRange = 0

    switch (symbol) {
      case "BTC":
        basePrice = 41000
        priceRange = 2000
        break
      case "ETH":
        basePrice = 2200
        priceRange = 200
        break
      case "SOL":
        basePrice = 100
        priceRange = 20
        break
      default:
        basePrice = 41000
        priceRange = 2000
    }

    // Generate mock price data for the selected cryptocurrency
    const prices = Array.from({ length: 24 }, (_, i) => ({
      price: basePrice + Math.random() * priceRange - priceRange / 2,
    }))

    const currentPrice = prices[prices.length - 1].price
    const previousPrice = prices[0].price
    const change = {
      value: currentPrice - previousPrice,
      percentage: Number.parseFloat((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)),
    }

    return {
      prices: prices.map((p, i) => ({ date: `T-${prices.length - i}`, price: p.price })),
      currentPrice,
      change,
    }
  } catch (error) {
    console.error("Error fetching crypto price:", error)
    // Return default data structure to prevent UI errors
    return {
      prices: [],
      currentPrice: 0,
      change: { value: 0, percentage: 0 },
    }
  }
}


//export async function fetchCryptoPrice(symbol: string, timeframe: string): Promise<PriceResponse> {
//  try {
//    const response = await fetch(`/api/market/price/${symbol}?timeframe=${timeframe}`)
//
//    if (!response.ok) {
//      throw new Error(`HTTP error! status: ${response.status}`)
//    }
//
//    return await response.json()
//  } catch (error) {
//    console.error("Error fetching crypto price:", error)
//    return { prices: [], currentPrice: 0, change: { value: 0, percentage: 0 } }
//  }
//}


export async function fetchOrderBookData(crypto: string): Promise<OrderBookData> {
  // Simulating API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const basePrice = crypto === "BTC" ? 65000 : crypto === "ETH" ? 3400 : 140
      const depthData = generateOrderBookData(basePrice)

      resolve({
        depthData,
        bidWall: {
          price: basePrice * 0.95,
          volume: crypto === "BTC" ? 25.5 : crypto === "ETH" ? 350 : 2800,
        },
        askWall: {
          price: basePrice * 1.05,
          volume: crypto === "BTC" ? 18.3 : crypto === "ETH" ? 280 : 2100,
        },
      })
    }, 1200)
  })
}

// Helper functions
function generateSparklineDataByPrice(basePrice: number, changePercent: number) {
  const direction = changePercent >= 0 ? 1 : -1
  const volatility = Math.abs(changePercent) / 100

  return Array(24)
    .fill(0)
    .map((_, i) => {
      const randomFactor = 1 + Math.random() * volatility * direction * (i / 24)
      return {
        time: i,
        price: basePrice * randomFactor,
      }
    })
}

function generatePriceData(basePrice: number, volatility: number, dataPoints: number, timeframe: string) {
  const now = new Date()
  const data: PriceData[] = []

  for (let i = 0; i < dataPoints; i++) {
    const timeDiff = getTimeDiffForTimeframe(timeframe, i, dataPoints)
    const date = new Date(now.getTime() - timeDiff)

    // More volatility at the beginning, trending toward current price
    const progressFactor = i / dataPoints
    const randomFactor = 1 + (Math.random() - 0.5) * volatility * (1 - progressFactor * 0.7)

    data.push({
      date: formatDateForTimeframe(date, timeframe),
      price: basePrice * randomFactor,
    })
  }

  return data
}

function generateOrderBookData(basePrice: number) {
  const data = []
  const midPoint = basePrice
  const range = basePrice * 0.1 // 10% range

  // Generate 20 price points
  for (let i = 0; i < 20; i++) {
    const offset = (i - 10) * (range / 10)
    const price = midPoint + offset

    // Volume decreases as we move away from the midpoint
    const distanceFromMid = Math.abs(offset) / range
    const bidVolume = i < 10 ? Math.max(0, (1 - distanceFromMid) * 100) : 0
    const askVolume = i >= 10 ? Math.max(0, (1 - distanceFromMid) * 100) : 0

    data.push({
      price,
      bidVolume,
      askVolume,
    })
  }

  return data
}

function getDataPointsForTimeframe(timeframe: string): number {
  switch (timeframe) {
    case "1h":
      return 60
    case "1d":
      return 24
    case "1w":
      return 7
    case "1m":
      return 30
    case "1y":
      return 12
    case "all":
      return 24
    default:
      return 24
  }
}

function getTimeDiffForTimeframe(timeframe: string, i: number, total: number): number {
  const msPerMinute = 60 * 1000
  const msPerHour = 60 * msPerMinute
  const msPerDay = 24 * msPerHour

  switch (timeframe) {
    case "1h":
      return (total - i) * msPerMinute
    case "1d":
      return (total - i) * msPerHour
    case "1w":
      return (total - i) * msPerDay
    case "1m":
      return (total - i) * msPerDay
    case "1y":
      return (total - i) * 30 * msPerDay
    case "all":
      return (total - i) * 90 * msPerDay
    default:
      return (total - i) * msPerHour
  }
}

function formatDateForTimeframe(date: Date, timeframe: string): string {
  switch (timeframe) {
    case "1h":
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")}`
    case "1d":
      return `${date.getHours()}:00`
    case "1w":
      return date.toLocaleDateString(undefined, { weekday: "short" })
    case "1m":
      return date.toLocaleDateString(undefined, { day: "numeric", month: "short" })
    case "1y":
    case "all":
      return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" })
    default:
      return date.toLocaleDateString()
  }
}


