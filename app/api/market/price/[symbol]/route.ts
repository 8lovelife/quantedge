import { NextResponse } from "next/server"
import type { PriceData, PriceResponse } from "@/lib/types"

// Mock data for API endpoint - expanded to include multiple cryptocurrencies
const priceData: Record<string, Record<string, PriceData[]>> = {
  BTC: {
    "1h": generatePriceData(42000, 42500, 6, "hour"),
    "1d": generatePriceData(40000, 43000, 7, "day"),
    "1w": generatePriceData(39000, 43000, 6, "week"),
    "1m": generatePriceData(38000, 43000, 3, "month"),
    "1y": generatePriceData(28000, 43000, 5, "year"),
  },
  ETH: {
    "1h": generatePriceData(2200, 2300, 6, "hour"),
    "1d": generatePriceData(2100, 2300, 7, "day"),
    "1w": generatePriceData(2000, 2300, 6, "week"),
    "1m": generatePriceData(1900, 2300, 3, "month"),
    "1y": generatePriceData(1500, 2300, 5, "year"),
  },
  SOL: {
    "1h": generatePriceData(100, 110, 6, "hour"),
    "1d": generatePriceData(95, 110, 7, "day"),
    "1w": generatePriceData(90, 110, 6, "week"),
    "1m": generatePriceData(85, 110, 3, "month"),
    "1y": generatePriceData(50, 110, 5, "year"),
  },
}

function generatePriceData(min: number, max: number, count: number, timeType: string): PriceData[] {
  const result: PriceData[] = []
  const now = new Date()

  for (let i = 0; i < count; i++) {
    let date = ""

    if (timeType === "hour") {
      const hourAgo = new Date(now)
      hourAgo.setHours(hourAgo.getHours() - (count - i - 1))
      date = `${hourAgo.getHours()}:${hourAgo.getMinutes().toString().padStart(2, "0")}`
    } else if (timeType === "day") {
      const dayAgo = new Date(now)
      dayAgo.setDate(dayAgo.getDate() - (count - i - 1))
      date = `${dayAgo.toLocaleString("default", { month: "short" })} ${dayAgo.getDate()}`
    } else if (timeType === "week") {
      const weekAgo = new Date(now)
      weekAgo.setDate(weekAgo.getDate() - (count - i - 1) * 7)
      date = `${weekAgo.toLocaleString("default", { month: "short" })} ${weekAgo.getDate()}`
    } else if (timeType === "month") {
      const monthAgo = new Date(now)
      monthAgo.setMonth(monthAgo.getMonth() - (count - i - 1))
      date = monthAgo.toLocaleString("default", { month: "short" })
    } else if (timeType === "year") {
      const yearAgo = new Date(now)
      yearAgo.setFullYear(yearAgo.getFullYear() - (count - i - 1) + 1)
      date = `${yearAgo.toLocaleString("default", { month: "short" })} ${yearAgo.getFullYear()}`
    }

    // Generate a price that trends upward but with some randomness
    const progress = i / (count - 1)
    const price = min + (max - min) * progress + Math.random() * (max - min) * 0.1 - (max - min) * 0.05

    result.push({
      date,
      price: Number(price.toFixed(2)),
    })
  }

  return result
}


const COINGECKO_API = process.env.NEXT_PUBLIC_COINGECKO_API || "https://api.coingecko.com/api/v3"
const COINAPI = process.env.NEXT_PUBLIC_COINAPI || "https://rest.coinapi.io/v1"
const COINAPI_KEY = process.env.NEXT_PUBLIC_COINAPI_KEY

// Map symbols to CoinGecko IDs
const coinIdMap: { [key: string]: string } = {
  BTC: "bitcoin",
  ETH: "ethereum",
  BNB: "binancecoin",
  SOL: "solana",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  MATIC: "polygon",
  LINK: "chainlink",
}

// Map timeframes to CoinGecko parameters
const timeframeMap: { [key: string]: { days: string; interval: string } } = {
  "1h": { days: "1", interval: "minute" },
  "1d": { days: "1", interval: "hourly" },
  "1w": { days: "7", interval: "daily" },
  "1m": { days: "30", interval: "daily" },
  "1y": { days: "365", interval: "weekly" },
}

const timeframeMapCoinAPI: { [key: string]: string } = {
  "1h": "1HRS",  // 1 hour timeframe
  "1d": "1DAY",  // 1 day timeframe
  "1w": "7DAY",  // 1 week timeframe
  "1m": "1MTH",  // 1 month timeframe
  "1y": "1YRS",  // 1 year timeframe
};


//export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
//  const { searchParams } = new URL(request.url)
//  const timeframe = searchParams.get("timeframe") || "1d"
//  const { symbol } = await params
//
//  // In a real implementation, you would:
//  // 1. Authenticate the user
//  // 2. Query your database or external APIs (like CoinGecko, CoinMarketCap, etc.)
//  // 3. Process the data
//  // 4. Return the response
//
//  const cryptoData = priceData[symbol] || priceData["BTC"]
//  const prices = cryptoData[timeframe] || cryptoData["1d"]
//
//  const currentPrice = prices[prices.length - 1].price
//  const previousPrice = prices[0].price
//  const change = {
//    value: currentPrice - previousPrice,
//    percentage: Number.parseFloat((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)),
//  }
//
//  const response: PriceResponse = {
//    prices,
//    currentPrice,
//    change,
//  }
//
//  return NextResponse.json(response)
//}


// ✅ API route: `/api/price?symbol=BTC&timeframe=1d`
export async function GET(request: Request, { params }: { params: Promise<{ symbol: string }> }) {
try {

    const { symbol } = await params
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get("timeframe") || "1d"
    const symbolUpper = symbol.toUpperCase()

    if (!coinIdMap[symbol]) {
      return NextResponse.json({ error: "Invalid symbol" }, { status: 400 })
    }

    try {
      const data = await fetchFromCoinGecko(symbolUpper, timeframe)
      return NextResponse.json(data)
    } catch (error) {
      console.warn("CoinGecko API failed. Switching to CoinAPI:", error)
    }

    try {
      const data = await fetchFromCoinAPI(symbol,timeframe)
      return NextResponse.json(data)
    } catch (error) {
      console.error("Both CoinGecko and CoinAPI failed:", error)
      return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching crypto price:", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

async function fetchFromCoinGecko(symbol: string, timeframe: string) {
  const coinId = coinIdMap[symbol]
  const { days, interval } = timeframeMap[timeframe] || { days: "1", interval: "hourly" }

  const url = `${COINGECKO_API}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${interval}`
  console.log(url)
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`CoinGecko Error: ${response.status}`)
  }

  const data = await response.json()
  console.log(data)

  // Format CoinGecko data
  const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
    date: new Date(timestamp).toISOString(),
    price,
  }))

  const currentPrice = prices[prices.length - 1]?.price || 0
  const previousPrice = prices[0]?.price || 0
  const change = {
    value: currentPrice - previousPrice,
    percentage: previousPrice ? Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)) : 0,
  }

  return { source: "CoinGecko", prices, currentPrice, change }
}

async function fetchFromCoinAPI(symbol: string, timeframe: string) {
  try {

    const period_id = timeframeMapCoinAPI[timeframe] || "1DAY";
    const symbolId = "BITSTAMP_SPOT_" + symbol + "_USD";
    const url = `${COINAPI}/ohlcv/${symbolId}/latest?period_id=${period_id}`
    console.log(url)
    const response = await fetch(url, {
        headers: { "X-CoinAPI-Key": COINAPI_KEY }
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(`CoinAPI Error ${response.status}: ${errorMessage}`);
    }

    const data = await response.json();
    console.log(data)

    if (!data || data.length === 0) {
      throw new Error(`CoinAPI returned empty data for ${symbol}`);
    }

    const prices = data.map((entry: any) => ({
      date: new Date(entry.time_period_start).toISOString(),
      price: entry.price_close,
    }));

    const currentPrice = prices[prices.length - 1]?.price || 0;
    const previousPrice = prices[0]?.price || 0;
    const change = {
      value: currentPrice - previousPrice,
      percentage: previousPrice ? Number((((currentPrice - previousPrice) / previousPrice) * 100).toFixed(2)) : 0,
    };
    return { source: "CoinAPI", prices, currentPrice, change };
  } catch (error) {
    console.error("⚠️ CoinAPI Fetch Error:", error);
    return { source: "CoinAPI", error: error.message };
  }
}

