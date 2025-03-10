"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ArrowRightIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchMarketData, fetchCryptoPrice } from "@/lib/api/market"
import type { MarketData, PriceData } from "@/lib/types"

export function MarketOverview() {
  const [timeframe, setTimeframe] = useState("1d")
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<{ value: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMarketData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchMarketData()
        setMarketData(data)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch market data:", err)
        setError("Failed to load market data")
      } finally {
        setIsLoading(false)
      }
    }

    loadMarketData()
  }, [])

  useEffect(() => {
    const loadPriceData = async () => {
      try {
        setIsLoading(true)
        const data = await fetchCryptoPrice("BTC", timeframe)
        setPriceData(data.prices)
        setCurrentPrice(data.currentPrice)
        setPriceChange(data.change)
        setError(null)
      } catch (err) {
        console.error("Failed to fetch price data:", err)
        setError("Failed to load price data")
      } finally {
        setIsLoading(false)
      }
    }

    loadPriceData()
  }, [timeframe])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Bitcoin Price</CardTitle>
          <CardDescription>BTC/USD price movement</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              {isLoading ? (
                <div className="space-y-2">
                  <div className="h-7 w-32 animate-pulse rounded bg-muted"></div>
                  <div className="h-4 w-24 animate-pulse rounded bg-muted"></div>
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">${currentPrice?.toLocaleString() || "0.00"}</div>
                  {priceChange && (
                    <div className={`text-sm ${priceChange.value >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {priceChange.value >= 0 ? "+" : ""}
                      {priceChange.value.toLocaleString()} ({priceChange.percentage}%)
                    </div>
                  )}
                </>
              )}
            </div>
            <Tabs defaultValue="1d" className="w-[300px]" onValueChange={setTimeframe}>
              <TabsList className="grid grid-cols-5">
                <TabsTrigger value="1h">1H</TabsTrigger>
                <TabsTrigger value="1d">1D</TabsTrigger>
                <TabsTrigger value="1w">1W</TabsTrigger>
                <TabsTrigger value="1m">1M</TabsTrigger>
                <TabsTrigger value="1y">1Y</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          {isLoading ? (
            <div className="h-[300px] w-full animate-pulse rounded bg-muted"></div>
          ) : error ? (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">{error}</div>
          ) : (
            <ChartContainer
              config={{
                price: {
                  label: "Price",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-[300px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={priceData}
                  margin={{
                    top: 5,
                    right: 10,
                    left: 10,
                    bottom: 0,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" />
                  <YAxis domain={["auto", "auto"]} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="var(--color-price)"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full">
            <span>View detailed analysis</span>
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Top cryptocurrencies by market cap</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground">
                <div>Asset</div>
                <div className="text-right">Price</div>
                <div className="text-right">24h</div>
                <div className="text-right">Volume</div>
                <div className="text-right">Market Cap</div>
              </div>
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-6 w-full animate-pulse rounded bg-muted"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-5 text-xs font-medium text-muted-foreground">
                <div>Asset</div>
                <div className="text-right">Price</div>
                <div className="text-right">24h</div>
                <div className="text-right">Volume</div>
                <div className="text-right">Market Cap</div>
              </div>
              <div className="space-y-2">
                {marketData.map((coin) => (
                  <div key={coin.name} className="grid grid-cols-5 items-center text-sm">
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-right">${coin.price.toLocaleString()}</div>
                    <div className={`text-right ${coin.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {coin.change >= 0 ? "+" : ""}
                      {coin.change}%
                    </div>
                    <div className="text-right">${coin.volume}</div>
                    <div className="text-right">${coin.marketCap}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full">
            View all markets
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}