"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, ResponsiveContainer, CartesianGrid, XAxis, YAxis, AreaChart, Area, Tooltip } from "recharts"
import { ArrowRightIcon, TrendingUp, TrendingDown, BarChart3, CandlestickChart, Activity } from "lucide-react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { fetchMarketData, fetchCryptoPrice, fetchOrderBookData } from "@/lib/api/market"
import type { MarketData, PriceData, OrderBookData } from "@/lib/types"

// Custom tooltip for sparkline charts
const SparklineTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-popover text-popover-foreground shadow-md rounded-md p-2 text-xs border border-border">
        <p className="font-medium">{`Time: ${label}`}</p>
        <p className="text-[11px]">{`Price: $${payload[0].value.toLocaleString()}`}</p>
      </div>
    )
  }
  return null
}

// Custom tooltip for depth chart
const DepthChartTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const price = payload[0]?.payload?.price
    const bidVolume = payload[0]?.payload?.bidVolume
    const askVolume = payload[1]?.payload?.askVolume

    return (
      <div className="bg-popover text-popover-foreground shadow-md rounded-md p-2 text-xs border border-border">
        <p className="font-medium">{`Price: $${price?.toLocaleString() || 0}`}</p>
        {bidVolume > 0 && <p className="text-green-500">{`Buy Volume: ${bidVolume?.toLocaleString() || 0}`}</p>}
        {askVolume > 0 && <p className="text-red-500">{`Sell Volume: ${askVolume?.toLocaleString() || 0}`}</p>}
      </div>
    )
  }
  return null
}

export function MarketOverview() {
  const router = useRouter()
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

  // Custom tooltip formatter for price chart
  const priceTooltipFormatter = (value: number) => {
    return [`$${value.toLocaleString()}`, "Price"]
  }

  // Get price chart color based on price change
  const getPriceChartColor = () => {
    if (!priceChange) return "#3b82f6" // Default blue if no data
    return priceChange.value >= 0 ? "#10b981" : "#ef4444" // Green if positive, red if negative
  }

  // Handle view detailed analysis
  const handleViewDetails = () => {
    router.push(`market/${selectedCrypto.toLowerCase()}/analysis`)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="col-span-2 flex flex-col h-[calc(85vh-12rem)] min-h-[400px] max-h-[90vh]">
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
        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
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
            <div className="bg-card rounded-lg border p-4">
              <div className="flex justify-between items-center mb-3">
                <CardTitle className="text-base">Price Chart</CardTitle>
                {!isLoading && priceChange && (
                  <div className="flex items-center">
                    <div
                      className={`h-3 w-3 rounded-full mr-2 ${priceChange.value >= 0 ? "bg-green-500" : "bg-red-500"}`}
                    ></div>
                    <span className="text-xs text-muted-foreground">
                      {priceChange.value >= 0 ? "Uptrend" : "Downtrend"}
                    </span>
                  </div>
                )}
              </div>
              <div className="h-[250px]">
                {isLoading ? (
                  <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                ) : error ? (
                  <div className="flex h-full items-center justify-center text-muted-foreground">{error}</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
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
                      <Tooltip
                        formatter={priceTooltipFormatter}
                        labelFormatter={(label) => `Date: ${label}`}
                        contentStyle={{
                          backgroundColor: "var(--popover)",
                          borderColor: "var(--border)",
                          borderRadius: "0.375rem",
                          fontSize: "0.75rem",
                        }}
                        cursor={{ stroke: "var(--border)", strokeWidth: 1, strokeDasharray: "3 3" }}
                      />
                      <defs>
                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={getPriceChartColor()} stopOpacity={0.8} />
                          <stop offset="95%" stopColor={getPriceChartColor()} stopOpacity={0.1} />
                        </linearGradient>
                      </defs>
                      <Area
                        type="monotone"
                        dataKey="price"
                        stroke={getPriceChartColor()}
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorPrice)"
                        activeDot={{ r: 6, fill: getPriceChartColor(), stroke: "var(--background)" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Depth Chart */}
            <div className="bg-card rounded-lg border p-4">
              <div className="flex justify-between items-center mb-3">
                <CardTitle className="text-base">Order Book Depth Chart</CardTitle>
              </div>

              <div className="relative">
                {/* Bid Wall - Left Top */}
                {/* {!isOrderBookLoading && (
                  <div className="absolute top-2 left-2 z-10 bg-background/80 p-1.5 rounded-md text-xs border border-border">
                    <div className="flex items-center">
                      <div className="mr-1.5 h-2 w-2 rounded-full bg-green-500"></div>
                      <span className="text-muted-foreground">Bid Wall:</span>{" "}
                      <span className="font-medium ml-1">
                        ${orderBookData?.bidWall?.price.toLocaleString() || "0.00"}
                      </span>{" "}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({orderBookData?.bidWall?.volume.toLocaleString() || "0"} {selectedCrypto})
                      </span>
                    </div>
                  </div>
                )} */}

                {/* Ask Wall - Right Top */}
                {/* {!isOrderBookLoading && (
                  <div className="absolute top-2 right-2 z-10 bg-background/80 p-1.5 rounded-md text-xs border border-border">
                    <div className="flex items-center">
                      <div className="mr-1.5 h-2 w-2 rounded-full bg-red-500"></div>
                      <span className="text-muted-foreground">Ask Wall:</span>{" "}
                      <span className="font-medium ml-1">
                        ${orderBookData?.askWall?.price.toLocaleString() || "0.00"}
                      </span>{" "}
                      <span className="text-[10px] text-muted-foreground ml-1">
                        ({orderBookData?.askWall?.volume.toLocaleString() || "0"} {selectedCrypto})
                      </span>
                    </div>
                  </div>
                )} */}

                <div className="h-[250px]">
                  {isOrderBookLoading ? (
                    <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                  ) : orderBookError ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      {orderBookError}
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={orderBookData?.depthData || []}
                        margin={{
                          top: 30, // Increased top margin to make room for the wall information
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
                        <Tooltip content={<DepthChartTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="bidVolume"
                          stroke="green"
                          fill="green"
                          fillOpacity={0.3}
                          stackId="1"
                        />
                        <Area
                          type="monotone"
                          dataKey="askVolume"
                          stroke="red"
                          fill="red"
                          fillOpacity={0.3}
                          stackId="2"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  )}
                </div>

                <div className="flex justify-between mt-3 text-sm">
                  <div className="flex items-center space-x-6">
                    {/* <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Buy Orders (Bids)</span>
                    </div> */}

                    {!isOrderBookLoading && (
                      <div>
                        <span className="text-muted-foreground">Bid Wall:</span>{" "}
                        <span className="font-medium">${orderBookData?.bidWall?.price.toLocaleString() || "0.00"}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          ({orderBookData?.bidWall?.volume.toLocaleString() || "0"} {selectedCrypto})
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-6">
                    {!isOrderBookLoading && (
                      <div>
                        <span className="text-muted-foreground">Ask Wall:</span>{" "}
                        <span className="font-medium">${orderBookData?.askWall?.price.toLocaleString() || "0.00"}</span>{" "}
                        <span className="text-xs text-muted-foreground">
                          ({orderBookData?.askWall?.volume.toLocaleString() || "0"} {selectedCrypto})
                        </span>
                      </div>
                    )}

                    {/* <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
                      <span>Sell Orders (Asks)</span>
                    </div> */}
                  </div>
                </div>

              </div>
            </div>
          </div>
        </CardContent>
        <div className="mt-4 pt-4 sticky bottom-0 bg-background">
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={handleViewDetails}>
              <span>View detailed analysis</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </div>
      </Card>

      <Card className="col-span-2 lg:col-span-1 flex flex-col h-[calc(85vh-12rem)] min-h-[400px] max-h-[90vh]">
        <CardHeader>
          <CardTitle>Market Overview</CardTitle>
          <CardDescription>Top cryptocurrencies by market cap</CardDescription>
        </CardHeader>

        <CardContent className="flex-1 overflow-y-auto p-0">
          <div className="sticky top-0 bg-card z-10 p-4 border-b">
            <div className="grid grid-cols-4 text-xs font-medium text-muted-foreground">
              <div>Asset</div>
              <div className="text-right">Price</div>
              <div className="text-right">24h</div>
              <div className="text-right">Chart</div>
            </div>
          </div>

          <div className="p-4 pt-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-6 w-full animate-pulse rounded bg-muted"></div>
                ))}
              </div>
            ) : error ? (
              <div className="flex h-[200px] items-center justify-center text-muted-foreground">{error}</div>
            ) : (
              <div className="space-y-2">
                {marketData.map((coin) => (
                  <div
                    key={coin.name}
                    className="grid grid-cols-4 items-center text-sm py-2 hover:bg-muted/30 rounded-sm border-b border-border/30"
                  >
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
                            stroke={coin.change >= 0 ? "green" : "red"}
                            strokeWidth={1}
                            dot={false}
                          />
                          <Tooltip content={<SparklineTooltip />} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <div className="mt-4 pt-4 sticky bottom-0 bg-background">
          <CardFooter>
            <Button variant="outline" className="w-full">
              <span> View all markets</span>
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </div>
      </Card>
    </div>
  )
}

