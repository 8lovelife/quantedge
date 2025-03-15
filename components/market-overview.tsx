"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, AreaChart, Area } from "recharts"
import { ArrowRightIcon } from "lucide-react"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { fetchMarketData, fetchCryptoPrice, fetchOrderBookData } from "@/lib/api/market"
import type { MarketData, PriceData, OrderBookData } from "@/lib/types"

export function MarketOverview() {
  const [timeframe, setTimeframe] = useState("1d")
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [priceData, setPriceData] = useState<PriceData[]>([])
  const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(null)
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [priceChange, setPriceChange] = useState<{ value: number; percentage: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isOrderBookLoading, setIsOrderBookLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderBookError, setOrderBookError] = useState<string | null>(null)
  const [selectedCrypto, setSelectedCrypto] = useState("BTC")

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
        const data = await fetchCryptoPrice(selectedCrypto, timeframe)

        if (data && data.prices) {
          setPriceData(data.prices)
          setCurrentPrice(data.currentPrice)
          setPriceChange(data.change)
          setError(null)
        } else {
          throw new Error("Invalid price data format")
        }
      } catch (err) {
        console.error("Failed to fetch price data:", err)
        setError("Failed to load price data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    loadPriceData()
  }, [timeframe, selectedCrypto])

  useEffect(() => {
    const loadOrderBookData = async () => {
      try {
        setIsOrderBookLoading(true)
        const data = await fetchOrderBookData(selectedCrypto)
        setOrderBookData(data)
        setOrderBookError(null)
      } catch (err) {
        console.error("Failed to fetch order book data:", err)
        setOrderBookError("Failed to load order book data")
      } finally {
        setIsOrderBookLoading(false)
      }
    }

    loadOrderBookData()
  }, [selectedCrypto])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2">
        <CardHeader>
          <div className="flex flex-col space-y-2">
            <CardTitle>Cryptocurrency Price</CardTitle>
            <Tabs defaultValue="BTC" className="w-full" onValueChange={setSelectedCrypto}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="BTC">Bitcoin</TabsTrigger>
                <TabsTrigger value="ETH">Ethereum</TabsTrigger>
                <TabsTrigger value="SOL">Solana</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            {selectedCrypto === "BTC" ? "BTC/USD" : selectedCrypto === "ETH" ? "ETH/USD" : "SOL/USD"} price movement
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
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
            <Tabs defaultValue="1d" className="w-[360px]" onValueChange={setTimeframe}>
              <TabsList className="grid grid-cols-6">
                <TabsTrigger value="1h">1H</TabsTrigger>
                <TabsTrigger value="1d">1D</TabsTrigger>
                <TabsTrigger value="1w">1W</TabsTrigger>
                <TabsTrigger value="1m">1M</TabsTrigger>
                <TabsTrigger value="1y">1Y</TabsTrigger>
                <TabsTrigger value="all">ALL</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Price Chart */}
          <div>
            <CardTitle className="text-base mb-3">Price Chart</CardTitle>
            <div className="h-[250px]">
              {isLoading ? (
                <div className="h-full w-full animate-pulse rounded bg-muted"></div>
              ) : error ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">{error}</div>
              ) : (
                <ChartContainer
                  config={{
                    price: {
                      label: "Price",
                      color: "var(--chart-1)",
                    },
                  }}
                  className="h-full"
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
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                      <YAxis
                        domain={["auto", "auto"]}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        width={60}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="var(--color-price)"
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 6, fill: "var(--color-price)", stroke: "var(--background)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
          </div>

          <Separator />

          {/* Depth Chart */}
          <div>
            <CardTitle className="text-base mb-3">Order Book Depth Chart</CardTitle>
            <div className="h-[250px]">
              {isOrderBookLoading ? (
                <div className="h-full w-full animate-pulse rounded bg-muted"></div>
              ) : orderBookError ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">{orderBookError}</div>
              ) : (
                <ChartContainer
                  config={{
                    bids: {
                      label: "Buy Orders",
                      color: "hsl(var(--chart-green))",
                    },
                    asks: {
                      label: "Sell Orders",
                      color: "hsl(var(--chart-red))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={orderBookData?.depthData || []}
                      margin={{
                        top: 5,
                        right: 10,
                        left: 10,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="price"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        domain={["dataMin", "dataMax"]}
                        tickFormatter={(value) => `$${value.toLocaleString()}`}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12 }}
                        width={80}
                        tickFormatter={(value) => `${value.toLocaleString()} ${selectedCrypto}`}
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="bidVolume"
                        stroke="var(--color-bids)"
                        fill="var(--color-bids)"
                        fillOpacity={0.3}
                        stackId="1"
                      />
                      <Area
                        type="monotone"
                        dataKey="askVolume"
                        stroke="var(--color-asks)"
                        fill="var(--color-asks)"
                        fillOpacity={0.3}
                        stackId="2"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              )}
            </div>
            <div className="mt-2 flex justify-between text-sm">
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                <span>Buy Orders (Bids)</span>
              </div>
              <div className="flex items-center">
                <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                <span>Sell Orders (Asks)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Card className="border">
              <CardContent className="p-3">
                <CardDescription className="text-xs">Bid Wall</CardDescription>
                <div className="mt-1 font-medium">
                  {isOrderBookLoading ? (
                    <div className="h-5 w-20 animate-pulse rounded bg-muted"></div>
                  ) : (
                    `$${orderBookData?.bidWall?.price.toLocaleString() || "0.00"} (${orderBookData?.bidWall?.volume.toLocaleString() || "0"} ${selectedCrypto})`
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="border">
              <CardContent className="p-3">
                <CardDescription className="text-xs">Ask Wall</CardDescription>
                <div className="mt-1 font-medium">
                  {isOrderBookLoading ? (
                    <div className="h-5 w-20 animate-pulse rounded bg-muted"></div>
                  ) : (
                    `$${orderBookData?.askWall?.price.toLocaleString() || "0.00"} (${orderBookData?.askWall?.volume.toLocaleString() || "0"} ${selectedCrypto})`
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
        <div className="mt-4 pt-4 sticky bottom-0 bg-background">
          <CardFooter>
            <Button variant="outline" className="w-full">
              <span>View detailed analysis</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </div>
      </Card>

      <Card className="col-span-2 lg:col-span-1">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Top cryptocurrencies by market cap</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground">
                <div>Asset</div>
                <div className="text-right">Price</div>
                <div className="text-right">24h</div>
                <div className="text-right">Chart</div>
              </div>
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-6 w-full animate-pulse rounded bg-muted"></div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="flex h-[200px] items-center justify-center text-muted-foreground">{error}</div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground">
                <div>Asset</div>
                <div className="text-right">Price</div>
                <div className="text-right">24h</div>
                <div className="text-right">Chart</div>
              </div>
              <div className="space-y-2">
                {marketData.map((coin) => (
                  <div key={coin.name} className="grid grid-cols-4 items-center text-sm">
                    <div className="font-medium">{coin.name}</div>
                    <div className="text-right">${coin.price.toLocaleString()}</div>
                    <div className={`text-right ${coin.change >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {coin.change >= 0 ? "+" : ""}
                      {coin.change}%
                    </div>
                    <div className="h-8 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={coin.sparkline}>
                          <Line
                            type="monotone"
                            dataKey="price"
                            stroke={coin.change >= 0 ? "var(--color-green-500)" : "var(--color-red-500)"}
                            strokeWidth={1}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
        <div className="mt-4 pt-4 sticky bottom-0 bg-background">
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View all markets
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

