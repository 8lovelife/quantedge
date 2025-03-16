"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ResponsiveContainer, CartesianGrid, XAxis, YAxis, AreaChart, Area, Tooltip } from "recharts"
import { ArrowLeftIcon, TrendingUp, TrendingDown, BarChart3, CandlestickChart, Activity } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { fetchCryptoPrice, fetchOrderBookData } from "@/lib/api/market"
import type { PriceData, OrderBookData } from "@/lib/types"

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

export default function DetailedAnalysis() {
    const params = useParams()
    const router = useRouter()
    const [timeframe, setTimeframe] = useState("1d")
    const [detailsTab, setDetailsTab] = useState("overview")
    const [priceData, setPriceData] = useState<PriceData[]>([])
    const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(null)
    const [currentPrice, setCurrentPrice] = useState<number | null>(null)
    const [priceChange, setPriceChange] = useState<{ value: number; percentage: number } | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isOrderBookLoading, setIsOrderBookLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [orderBookError, setOrderBookError] = useState<string | null>(null)

    // Get crypto from URL params
    const selectedCrypto = typeof params.crypto === "string" ? params.crypto.toUpperCase() : "BTC"

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

    return (
        <div className="container py-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <Button variant="outline" size="icon" onClick={() => router.back()} className="mr-4">
                        <ArrowLeftIcon className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center">
                            <span>
                                {selectedCrypto === "BTC" ? "Bitcoin" : selectedCrypto === "ETH" ? "Ethereum" : "Solana"} Detailed
                                Analysis
                            </span>
                            <span className="ml-2 text-sm text-muted-foreground">
                                ({selectedCrypto}/{selectedCrypto === "BTC" ? "USD" : selectedCrypto === "ETH" ? "USD" : "USD"})
                            </span>
                        </h1>
                        <p className="text-muted-foreground">Comprehensive market analysis and technical indicators</p>
                    </div>
                </div>
                <div className="flex items-center">
                    {!isLoading && currentPrice && (
                        <div className="text-right mr-4">
                            <div className="text-xl font-bold">${currentPrice?.toLocaleString() || "0.00"}</div>
                            {priceChange && (
                                <div className={`text-sm ${priceChange.value >= 0 ? "text-green-500" : "text-red-500"}`}>
                                    {priceChange.value >= 0 ? "+" : ""}
                                    {priceChange.value.toLocaleString()} ({priceChange.percentage}%)
                                </div>
                            )}
                        </div>
                    )}
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
            </div>

            <Tabs defaultValue="overview" className="w-full" onValueChange={setDetailsTab}>
                <TabsList className="grid grid-cols-4 mb-6 w-full max-w-md">
                    <TabsTrigger value="overview" className="flex items-center">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        Overview
                    </TabsTrigger>
                    <TabsTrigger value="technical" className="flex items-center">
                        <Activity className="mr-2 h-4 w-4" />
                        Technical
                    </TabsTrigger>
                    <TabsTrigger value="orderbook" className="flex items-center">
                        <CandlestickChart className="mr-2 h-4 w-4" />
                        Order Book
                    </TabsTrigger>
                    <TabsTrigger value="sentiment" className="flex items-center">
                        {priceChange && priceChange.value >= 0 ? (
                            <TrendingUp className="mr-2 h-4 w-4" />
                        ) : (
                            <TrendingDown className="mr-2 h-4 w-4" />
                        )}
                        Sentiment
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Extended Price History</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="h-[300px]">
                                    {isLoading ? (
                                        <div className="h-full w-full animate-pulse rounded bg-muted"></div>
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
                                                <Tooltip formatter={priceTooltipFormatter} labelFormatter={(label) => `Date: ${label}`} />
                                                <defs>
                                                    <linearGradient id="colorPriceExtended" x1="0" y1="0" x2="0" y2="1">
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
                                                    fill="url(#colorPriceExtended)"
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Market Statistics</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted/30 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Current Price</div>
                                            <div className="text-lg font-bold">${currentPrice?.toLocaleString() || "0.00"}</div>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">24h Change</div>
                                            {priceChange && (
                                                <div
                                                    className={`text-lg font-bold ${priceChange.value >= 0 ? "text-green-500" : "text-red-500"}`}
                                                >
                                                    {priceChange.value >= 0 ? "+" : ""}
                                                    {priceChange.percentage}%
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted/30 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Market Cap</div>
                                            <div className="text-lg font-bold">
                                                ${selectedCrypto === "BTC" ? "1.25T" : selectedCrypto === "ETH" ? "412.8B" : "54.2B"}
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">24h Volume</div>
                                            <div className="text-lg font-bold">
                                                ${selectedCrypto === "BTC" ? "42.5B" : selectedCrypto === "ETH" ? "18.7B" : "3.2B"}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <div className="bg-muted/30 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">Circulating Supply</div>
                                            <div className="text-lg font-bold">
                                                {selectedCrypto === "BTC" ? "19.5M" : selectedCrypto === "ETH" ? "120.2M" : "562.4M"}
                                            </div>
                                        </div>
                                        <div className="bg-muted/30 p-3 rounded-md">
                                            <div className="text-xs text-muted-foreground">All-Time High</div>
                                            <div className="text-lg font-bold">
                                                ${selectedCrypto === "BTC" ? "69,000" : selectedCrypto === "ETH" ? "4,865" : "260"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Price Predictions</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">Short-term (7 days)</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold">
                                                $
                                                {((currentPrice || 0) *
                                                    (1 + (Math.random() * 0.1 - 0.05))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div className={`text-sm ${Math.random() > 0.5 ? "text-green-500" : "text-red-500"}`}>
                                                {Math.random() > 0.5 ? "+" : "-"}
                                                {(Math.random() * 5).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">Medium-term (30 days)</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold">
                                                $
                                                {((currentPrice || 0) *
                                                    (1 + (Math.random() * 0.2 - 0.1))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div className={`text-sm ${Math.random() > 0.5 ? "text-green-500" : "text-red-500"}`}>
                                                {Math.random() > 0.5 ? "+" : "-"}
                                                {(Math.random() * 10).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">Long-term (1 year)</div>
                                        <div className="flex items-center justify-between">
                                            <div className="text-lg font-bold">
                                                $
                                                {((currentPrice || 0) *
                                                    (1 + (Math.random() * 0.5 - 0.2))).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div className={`text-sm ${Math.random() > 0.6 ? "text-green-500" : "text-red-500"}`}>
                                                {Math.random() > 0.6 ? "+" : "-"}
                                                {(Math.random() * 25).toFixed(2)}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="technical" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Technical Indicators</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">RSI (14)</div>
                                        <div className="text-lg font-bold">{Math.floor(Math.random() * 100)}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Overbought" : "Oversold"}
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">MACD</div>
                                        <div className="text-lg font-bold">{(Math.random() * 10 - 5).toFixed(2)}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Bullish" : "Bearish"}
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">Bollinger Bands</div>
                                        <div className="text-lg font-bold">{Math.random() > 0.5 ? "Upper" : "Lower"}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Resistance" : "Support"}
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">Moving Avg (50)</div>
                                        <div className="text-lg font-bold">
                                            ${((currentPrice || 0) * 0.95).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Above" : "Below"} current price
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">Moving Avg (200)</div>
                                        <div className="text-lg font-bold">
                                            ${((currentPrice || 0) * 0.85).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                        </div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Above" : "Below"} current price
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md">
                                        <div className="text-xs text-muted-foreground">Stochastic</div>
                                        <div className="text-lg font-bold">{Math.floor(Math.random() * 100)}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Overbought" : "Oversold"}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Support & Resistance</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Strong Resistance</div>
                                        <div className="flex items-center justify-between bg-red-500/10 p-2 rounded-md">
                                            <div className="font-medium">
                                                ${((currentPrice || 0) * 1.15).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">+15.0%</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Resistance</div>
                                        <div className="flex items-center justify-between bg-red-500/10 p-2 rounded-md">
                                            <div className="font-medium">
                                                ${((currentPrice || 0) * 1.05).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">+5.0%</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                                        <div className="flex items-center justify-between bg-blue-500/10 p-2 rounded-md">
                                            <div className="font-medium">${currentPrice?.toLocaleString() || "0.00"}</div>
                                            <div className="text-xs text-muted-foreground">0.0%</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Support</div>
                                        <div className="flex items-center justify-between bg-green-500/10 p-2 rounded-md">
                                            <div className="font-medium">
                                                ${((currentPrice || 0) * 0.95).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">-5.0%</div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="text-xs text-muted-foreground mb-1">Strong Support</div>
                                        <div className="flex items-center justify-between bg-green-500/10 p-2 rounded-md">
                                            <div className="font-medium">
                                                ${((currentPrice || 0) * 0.85).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                            </div>
                                            <div className="text-xs text-muted-foreground">-15.0%</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Trading Signals</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 rounded-md border">
                                        <div className="flex items-center">
                                            <div
                                                className={`h-3 w-3 rounded-full ${Math.random() > 0.6 ? "bg-green-500" : "bg-red-500"} mr-2`}
                                            ></div>
                                            <div className="font-medium">Short-term</div>
                                        </div>
                                        <div className="text-sm font-medium">{Math.random() > 0.6 ? "Buy" : "Sell"}</div>
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-md border">
                                        <div className="flex items-center">
                                            <div
                                                className={`h-3 w-3 rounded-full ${Math.random() > 0.5 ? "bg-green-500" : "bg-red-500"} mr-2`}
                                            ></div>
                                            <div className="font-medium">Medium-term</div>
                                        </div>
                                        <div className="text-sm font-medium">{Math.random() > 0.5 ? "Buy" : "Sell"}</div>
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-md border">
                                        <div className="flex items-center">
                                            <div
                                                className={`h-3 w-3 rounded-full ${Math.random() > 0.4 ? "bg-green-500" : "bg-red-500"} mr-2`}
                                            ></div>
                                            <div className="font-medium">Long-term</div>
                                        </div>
                                        <div className="text-sm font-medium">{Math.random() > 0.4 ? "Buy" : "Sell"}</div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <div className="text-xs text-muted-foreground mb-2">Overall Signal Strength</div>
                                        <div className="w-full bg-muted rounded-full h-2.5">
                                            <div
                                                className="bg-primary h-2.5 rounded-full"
                                                style={{ width: `${Math.floor(Math.random() * 100)}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="orderbook" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Order Book Depth</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="h-[300px]">
                                    {isOrderBookLoading ? (
                                        <div className="h-full w-full animate-pulse rounded bg-muted"></div>
                                    ) : (
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Buy Orders</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[300px] overflow-auto">
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-card">
                                            <tr className="border-b">
                                                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Price (USD)</th>
                                                <th className="text-right p-3 text-xs font-medium text-muted-foreground">
                                                    Amount ({selectedCrypto})
                                                </th>
                                                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Total (USD)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...Array(10)].map((_, i) => {
                                                const price = (currentPrice || 65000) * (1 - i * 0.001)
                                                const amount = Math.random() * 10
                                                return (
                                                    <tr key={i} className="border-b hover:bg-muted/30">
                                                        <td className="p-3 text-sm text-green-500">
                                                            ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-3 text-sm text-right">{amount.toFixed(4)}</td>
                                                        <td className="p-3 text-sm text-right">
                                                            ${(price * amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Sell Orders</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="max-h-[300px] overflow-auto">
                                    <table className="w-full">
                                        <thead className="sticky top-0 bg-card">
                                            <tr className="border-b">
                                                <th className="text-left p-3 text-xs font-medium text-muted-foreground">Price (USD)</th>
                                                <th className="text-right p-3 text-xs font-medium text-muted-foreground">
                                                    Amount ({selectedCrypto})
                                                </th>
                                                <th className="text-right p-3 text-xs font-medium text-muted-foreground">Total (USD)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {[...Array(10)].map((_, i) => {
                                                const price = (currentPrice || 65000) * (1 + i * 0.001)
                                                const amount = Math.random() * 10
                                                return (
                                                    <tr key={i} className="border-b hover:bg-muted/30">
                                                        <td className="p-3 text-sm text-red-500">
                                                            ${price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                        </td>
                                                        <td className="p-3 text-sm text-right">{amount.toFixed(4)}</td>
                                                        <td className="p-3 text-sm text-right">
                                                            ${(price * amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="sentiment" className="mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card className="col-span-1 md:col-span-2">
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Market Sentiment</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="flex items-center justify-center p-6">
                                    <div className="w-48 h-48 rounded-full border-8 border-muted relative">
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="text-center">
                                                <div className="text-3xl font-bold">{Math.random() > 0.5 ? "Bullish" : "Bearish"}</div>
                                                <div className="text-sm text-muted-foreground">Market Sentiment</div>
                                            </div>
                                        </div>
                                        <div
                                            className="absolute top-0 left-0 w-full h-full rounded-full overflow-hidden"
                                            style={{
                                                clipPath: `polygon(50% 50%, 50% 0%, ${Math.random() * 100}% 0%)`,
                                            }}
                                        >
                                            <div className="w-full h-full bg-green-500/20"></div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                                    <div className="bg-muted/30 p-3 rounded-md text-center">
                                        <div className="text-xs text-muted-foreground">Fear & Greed</div>
                                        <div className="text-lg font-bold">{Math.floor(Math.random() * 100)}</div>
                                        <div className="text-xs text-muted-foreground mt-1">{Math.random() > 0.5 ? "Greed" : "Fear"}</div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md text-center">
                                        <div className="text-xs text-muted-foreground">Social Volume</div>
                                        <div className="text-lg font-bold">{Math.floor(Math.random() * 10000)}</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Increasing" : "Decreasing"}
                                        </div>
                                    </div>

                                    <div className="bg-muted/30 p-3 rounded-md text-center">
                                        <div className="text-xs text-muted-foreground">Sentiment Score</div>
                                        <div className="text-lg font-bold">{(Math.random() * 10).toFixed(1)}/10</div>
                                        <div className="text-xs text-muted-foreground mt-1">
                                            {Math.random() > 0.5 ? "Positive" : "Negative"}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">News Sentiment</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-4">
                                    {[...Array(4)].map((_, i) => (
                                        <div key={i} className="border rounded-md p-3">
                                            <div className="flex items-center justify-between">
                                                <div className="text-sm font-medium">{["Bloomberg", "CoinDesk", "Reuters", "CNBC"][i]}</div>
                                                <div className={`text-xs ${Math.random() > 0.5 ? "text-green-500" : "text-red-500"}`}>
                                                    {Math.random() > 0.5 ? "Positive" : "Negative"}
                                                </div>
                                            </div>
                                            <div className="text-sm mt-2">
                                                {
                                                    [
                                                        `${selectedCrypto} sees increased institutional adoption as market stabilizes`,
                                                        `Analysts predict ${selectedCrypto} could reach new highs by year end`,
                                                        `Regulatory concerns impact ${selectedCrypto} short-term outlook`,
                                                        `${selectedCrypto} trading volume surges amid market volatility`,
                                                    ][i]
                                                }
                                            </div>
                                            <div className="text-xs text-muted-foreground mt-2">{new Date().toLocaleDateString()}</div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="py-3">
                                <CardTitle className="text-base">Social Media Trends</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-2 rounded-md border">
                                        <div className="flex items-center">
                                            <div className="font-medium">Twitter</div>
                                        </div>
                                        <div className="text-sm">{Math.floor(Math.random() * 100000)} mentions</div>
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-md border">
                                        <div className="flex items-center">
                                            <div className="font-medium">Reddit</div>
                                        </div>
                                        <div className="text-sm">{Math.floor(Math.random() * 50000)} posts</div>
                                    </div>

                                    <div className="flex items-center justify-between p-2 rounded-md border">
                                        <div className="flex items-center">
                                            <div className="font-medium">Telegram</div>
                                        </div>
                                        <div className="text-sm">{Math.floor(Math.random() * 20000)} messages</div>
                                    </div>

                                    <div className="mt-4 pt-4 border-t">
                                        <div className="text-xs text-muted-foreground mb-2">Trending Keywords</div>
                                        <div className="flex flex-wrap gap-2">
                                            {["bull run", "dip", "hodl", "moon", "bearish", "breakout", "resistance", "support", "rally"].map(
                                                (keyword, i) => (
                                                    <div key={i} className="bg-muted/50 px-2 py-1 rounded-md text-xs">
                                                        #{keyword}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}

