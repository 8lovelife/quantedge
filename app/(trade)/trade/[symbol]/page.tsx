"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    Star,
    Clock,
    Activity,
    History,
    Target,
    TrendingUp,
    TrendingDown,
    RotateCcw,
    ArrowDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TradingChart } from "@/components/markets/trading-chart"

// Mock trading data
const getTradingData = (symbol: string) => {
    const baseSymbol = symbol.replace("_", "/")
    return {
        symbol: baseSymbol,
        name: baseSymbol.split("/")[0],
        price: 119218.0,
        change24h: -0.61,
        changeAmount: -734.01,
        volume24h: 28500000000,
        high24h: 121200.0,
        low24h: 118800.0,
        marketCap: 1380000000000,
        markPrice: 119743.49,
        indexPrice: 119743.5,
        open: 118225.13,
        close: 118225.13,
    }
}

const mockOrderBook = {
    asks: [
        { price: 119222.00, amount: 0.0602, total: 1.58145 },
        { price: 119220.77, amount: 0.01677, total: 1.52125 },
        { price: 119220.21, amount: 0.04419, total: 1.50448 },
        { price: 119220.00, amount: 0.0602, total: 1.50029 },
        { price: 119219.99, amount: 0.19006, total: 1.44009 },
        { price: 119219.98, amount: 0.12667, total: 1.32103 },
        { price: 119219.97, amount: 0.00999, total: 1.19436 },
        { price: 119218.10, amount: 0.0602, total: 1.18437 },
        { price: 119216.10, amount: 0.0602, total: 1.12417 },
        { price: 119215.18, amount: 0.16777, total: 1.06397 },
        { price: 119214.11, amount: 0.8962, total: 0.8962 },
    ],
    bids: [
        { price: 119214.10, amount: 0.64116, total: 0.64116 },
        { price: 119212.01, amount: 0.08057, total: 0.72173 },
        { price: 119212.10, amount: 0.0602, total: 0.78193 },
        { price: 119210.10, amount: 0.0602, total: 0.84213 },
        { price: 119209.54, amount: 0.00838, total: 0.85051 },
        { price: 119208.04, amount: 0.00999, total: 0.8605 },
        { price: 119205.71, amount: 0.04458, total: 0.90508 },
        { price: 119205.66, amount: 0.1873, total: 1.09238 },
        { price: 119205.64, amount: 0.04194, total: 1.13432 },
        { price: 119204.17, amount: 0.09363, total: 1.22795 },
        { price: 119204.02, amount: 0.01682, total: 1.24477 },
    ],
}

const mockPositions = [
    {
        symbol: "BTC/USDT",
        side: "Long",
        size: 0.5,
        entryPrice: 118500.0,
        markPrice: 119749.99,
        pnl: 624.995,
        pnlPercent: 1.05,
    },
]

const mockOrders = [
    { symbol: "BTC/USDT", side: "Buy", type: "Limit", amount: 0.1, price: 119000.0, filled: 0, status: "Open" },
    { symbol: "ETH/USDT", side: "Sell", type: "Limit", amount: 2.5, price: 3900.0, filled: 0, status: "Open" },
]

export default function TradePage() {
    const params = useParams()
    const router = useRouter()
    const symbol = params.symbol as string
    const [tradingData, setTradingData] = useState(getTradingData(symbol))
    const [orderType, setOrderType] = useState("limit")
    const [side, setSide] = useState<"buy" | "sell">("buy")
    const [price, setPrice] = useState("")
    const [amount, setAmount] = useState("")
    const [reduceOnly, setReduceOnly] = useState(false)
    const [postOnly, setPostOnly] = useState(false)
    const [orderBook, setOrderBook] = useState(mockOrderBook)
    const [chartInterval, setChartInterval] = useState("15")

    const formatPrice = (price: number) => {
        return price.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
    }

    const formatNumber = (num: number) => {
        if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
        if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
        if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
        return num.toFixed(8)
    }

    // Real-time order book updates
    useEffect(() => {

        const interval = setInterval(() => {
            setOrderBook((prev) => ({
                asks: prev.asks.map((ask) => ({
                    ...ask,
                    price: ask.price + (Math.random() - 0.5) * 2,
                    amount: Math.max(0.001, ask.amount + (Math.random() - 0.5) * 0.05),
                })),
                bids: prev.bids.map((bid) => ({
                    ...bid,
                    price: bid.price + (Math.random() - 0.5) * 2,
                    amount: Math.max(0.001, bid.amount + (Math.random() - 0.5) * 0.05),
                })),
            }))
        }, 2000)

        return () => clearInterval(interval)
    }, [tradingData.price])

    const timeframes = [
        { label: "1m", value: "1" },
        { label: "5m", value: "5" },
        { label: "15m", value: "15" },
        { label: "1h", value: "60" },
        { label: "4h", value: "240" },
        { label: "1D", value: "1D" },
        { label: "1W", value: "1W" },
    ]

    // Calculate buy/sell percentages
    const totalBuyVolume = orderBook.bids.reduce((sum, bid) => sum + bid.amount, 0)
    const totalSellVolume = orderBook.asks.reduce((sum, ask) => sum + ask.amount, 0)
    const totalVolume = totalBuyVolume + totalSellVolume
    const buyPercentage = ((totalBuyVolume / totalVolume) * 100).toFixed(1)
    const sellPercentage = ((totalSellVolume / totalVolume) * 100).toFixed(1)

    return (
        <div className="h-screen bg-gray-50 flex flex-col gap-2 p-2">
            {/* Combined Header Bar - Single Row */}
            <div className="h-16 bg-white rounded-lg px-6 flex items-center">
                {/* All Information on Left Side */}
                <div className="flex items-center gap-4 flex-1">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.back()}
                        className="text-gray-600 hover:text-gray-900 p-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            ₿
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">{tradingData.symbol}</span>
                            <Button variant="ghost" size="sm" className="p-1">
                                <Star className="h-4 w-4 text-gray-400 hover:text-yellow-500" />
                            </Button>
                        </div>
                    </div>

                    {/* Price and Change */}
                    <div className="flex items-center gap-3">
                        <div className="text-xl font-bold text-gray-900">{formatPrice(tradingData.price)}</div>
                        <div className="flex items-center gap-2">
                            {tradingData.change24h >= 0 ? (
                                <TrendingUp className="h-4 w-4 text-green-600" />
                            ) : (
                                <TrendingDown className="h-4 w-4 text-red-600" />
                            )}
                            <span className={`font-semibold ${tradingData.change24h >= 0 ? "text-green-600" : "text-red-600"}`}>
                                {tradingData.changeAmount.toFixed(2)}
                            </span>
                            <Badge
                                variant="secondary"
                                className={`${tradingData.change24h >= 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                            >
                                {tradingData.change24h >= 0 ? "+" : ""}
                                {tradingData.change24h.toFixed(2)}%
                            </Badge>
                        </div>
                    </div>

                    {/* Market Data */}
                    <div className="flex items-center gap-4 text-sm ml-6">
                        <div>
                            <div className="text-gray-500 text-xs">24h High</div>
                            <div className="font-semibold text-gray-900">{formatPrice(tradingData.high24h)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs">24h Low</div>
                            <div className="font-semibold text-gray-900">{formatPrice(tradingData.low24h)}</div>
                        </div>
                        <div>
                            <div className="text-gray-500 text-xs">24h Volume</div>
                            <div className="font-semibold text-gray-900">$428.89M</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex gap-2">
                {/* Left Side - Chart */}
                <div className="flex-1 flex flex-col bg-white rounded-lg overflow-hidden">
                    <div className="flex-1 bg-white">
                        <TradingChart pair={tradingData.symbol} />
                    </div>
                </div>

                {/* Right Side - Order Book & Trading (Side by Side) */}
                <div className="w-[800px] flex gap-2">
                    {/* Order Book - New Dark Theme Layout */}
                    {/* Order Book - Light Theme Layout */}
                    <div className="w-96 bg-white rounded-lg border border-gray-200">
                        {/* Header */}
                        <div className="h-12 px-4 flex items-center justify-between border-b border-gray-200">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
                                <span>Price (USD)</span>
                                <span className="ml-8">Amount (BTC)</span>
                                <span className="ml-4">Total (BTC)</span>
                            </div>
                        </div>

                        <div className="h-[calc(100%-48px-32px)] overflow-hidden">
                            {/* Asks (Sell Orders) */}
                            <div className="h-[calc(50%-20px)] overflow-y-auto">
                                {orderBook.asks.reverse().map((ask, index) => (
                                    <div key={index} className="px-4 py-1 flex justify-between text-xs hover:bg-red-50 cursor-pointer">
                                        <span className="text-red-600 font-mono w-20 text-left">{ask.price.toFixed(2)}</span>
                                        <span className="text-gray-700 font-mono w-16 text-right">{ask.amount.toFixed(5)}</span>
                                        <span className="text-gray-700 font-mono w-16 text-right">{ask.total.toFixed(5)}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Current Price */}
                            <div className="px-4 py-2 bg-gray-100 border-y border-gray-200">
                                <div className="flex items-center justify-center gap-2">
                                    <span className="text-red-600 font-mono font-bold text-sm">{tradingData.price.toFixed(2)}</span>
                                    <ArrowDown className="h-3 w-3 text-red-600" />
                                </div>
                            </div>

                            {/* Bids (Buy Orders) */}
                            <div className="h-[calc(50%-20px)] overflow-y-auto">
                                {orderBook.bids.map((bid, index) => (
                                    <div key={index} className="px-4 py-1 flex justify-between text-xs hover:bg-green-50 cursor-pointer">
                                        <span className="text-green-600 font-mono w-20 text-left">{bid.price.toFixed(2)}</span>
                                        <span className="text-gray-700 font-mono w-16 text-right">{bid.amount.toFixed(5)}</span>
                                        <span className="text-gray-700 font-mono w-16 text-right">{bid.total.toFixed(5)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer with Buy/Sell Percentages */}
                        <div className="h-8 px-4 flex items-center justify-between bg-gray-50 border-t border-gray-200 rounded-b-lg">
                            <div className="flex items-center gap-1">
                                <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">B</span>
                                <span className="text-green-600 text-xs font-medium">{buyPercentage}%</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="text-red-600 text-xs font-medium">{sellPercentage}%</span>
                                <span className="bg-red-600 text-white px-2 py-1 rounded text-xs font-medium">S</span>
                            </div>
                        </div>
                    </div>

                    {/* Trading Form */}
                    <div className="w-96 bg-white rounded-lg">
                        <div className="h-12 px-4 flex items-center">
                            <Tabs value={side} onValueChange={(value) => setSide(value as "buy" | "sell")} className="w-full">
                                <TabsList className="grid w-full grid-cols-2 h-8">
                                    <TabsTrigger
                                        value="buy"
                                        className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700 text-sm"
                                    >
                                        Buy
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="sell"
                                        className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700 text-sm"
                                    >
                                        Sell
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="p-4 space-y-4 h-[calc(100%-48px)] overflow-y-auto">
                            {/* Order Type */}
                            <div>
                                <Label className="text-gray-700 text-sm">Order Type</Label>
                                <Select value={orderType} onValueChange={setOrderType}>
                                    <SelectTrigger className="bg-white mt-1 h-9 border-gray-200">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="limit">Limit</SelectItem>
                                        <SelectItem value="market">Market</SelectItem>
                                        <SelectItem value="stop">Stop-Loss</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Price */}
                            {orderType === "limit" && (
                                <div>
                                    <Label className="text-gray-700 text-sm">Price (USD)</Label>
                                    <Input
                                        placeholder="119,749.99"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        className="bg-white font-mono mt-1 h-9 border-gray-200"
                                    />
                                </div>
                            )}

                            {/* Amount */}
                            <div>
                                <Label className="text-gray-700 text-sm">Amount (BTC)</Label>
                                <Input
                                    placeholder="0.00001"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="bg-white font-mono mt-1 h-9 border-gray-200"
                                />
                            </div>

                            {/* Percentage Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                                {["25%", "50%", "75%", "100%"].map((percent) => (
                                    <Button
                                        key={percent}
                                        variant="outline"
                                        size="sm"
                                        className="text-xs bg-transparent h-8 border-gray-200"
                                    >
                                        {percent}
                                    </Button>
                                ))}
                            </div>

                            {/* Order Options */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-700 text-sm">Reduce-Only</Label>
                                    <Switch checked={reduceOnly} onCheckedChange={setReduceOnly} />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label className="text-gray-700 text-sm">Post-Only</Label>
                                    <Switch checked={postOnly} onCheckedChange={setPostOnly} />
                                </div>
                            </div>

                            {/* Order Value */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Available</span>
                                    <span className="font-semibold">0.00 USD</span>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                className={`w-full h-10 ${side === "buy"
                                    ? "bg-green-600 hover:bg-green-700 text-white"
                                    : "bg-red-600 hover:bg-red-700 text-white"
                                    }`}
                            >
                                {side === "buy" ? "Buy" : "Sell"} {tradingData.name}
                            </Button>

                            {/* Login Prompt */}
                            <div className="text-center pt-2">
                                <Button variant="outline" className="w-full h-9 bg-transparent text-sm border-gray-200">
                                    Login or Sign Up
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Panel - Order History */}
            <div className="h-56 bg-white rounded-lg">
                <Tabs defaultValue="positions" className="w-full h-full flex flex-col">
                    <div className="h-12 px-6 py-2 flex-shrink-0">
                        <TabsList className="bg-gray-100 h-8">
                            <TabsTrigger value="positions" className="flex items-center gap-2 text-sm">
                                <Target className="h-3 w-3" />
                                Positions
                            </TabsTrigger>
                            <TabsTrigger value="orders" className="flex items-center gap-2 text-sm">
                                <Activity className="h-3 w-3" />
                                Open Orders
                            </TabsTrigger>
                            <TabsTrigger value="history" className="flex items-center gap-2 text-sm">
                                <History className="h-3 w-3" />
                                Order History
                            </TabsTrigger>
                            <TabsTrigger value="trades" className="flex items-center gap-2 text-sm">
                                <Clock className="h-3 w-3" />
                                Trade History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="flex-1 overflow-hidden">
                        <TabsContent value="positions" className="px-6 py-4 h-full overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs">Symbol</TableHead>
                                        <TableHead className="text-xs">Side</TableHead>
                                        <TableHead className="text-xs">Size</TableHead>
                                        <TableHead className="text-xs">Entry Price</TableHead>
                                        <TableHead className="text-xs">Mark Price</TableHead>
                                        <TableHead className="text-xs">PnL</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockPositions.map((position, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-sm">{position.symbol}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">
                                                    {position.side}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="font-mono text-sm">{position.size}</TableCell>
                                            <TableCell className="font-mono text-sm">{formatPrice(position.entryPrice)}</TableCell>
                                            <TableCell className="font-mono text-sm">{formatPrice(position.markPrice)}</TableCell>
                                            <TableCell className="font-mono text-green-600 text-sm">+{position.pnl.toFixed(3)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="orders" className="px-6 py-4 h-full overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="text-xs">Symbol</TableHead>
                                        <TableHead className="text-xs">Side</TableHead>
                                        <TableHead className="text-xs">Type</TableHead>
                                        <TableHead className="text-xs">Amount</TableHead>
                                        <TableHead className="text-xs">Price</TableHead>
                                        <TableHead className="text-xs">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {mockOrders.map((order, index) => (
                                        <TableRow key={index} className="hover:bg-gray-50">
                                            <TableCell className="font-medium text-sm">{order.symbol}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className={`text-xs ${order.side === "Buy" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {order.side}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">{order.type}</TableCell>
                                            <TableCell className="font-mono text-sm">{order.amount}</TableCell>
                                            <TableCell className="font-mono text-sm">{formatPrice(order.price)}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-blue-600 border-blue-200 text-xs">
                                                    {order.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TabsContent>

                        <TabsContent value="history" className="px-6 py-4 h-full overflow-y-auto">
                            <div className="text-center text-gray-500 py-8">
                                <History className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No order history</p>
                            </div>
                        </TabsContent>

                        <TabsContent value="trades" className="px-6 py-4 h-full overflow-y-auto">
                            <div className="text-center text-gray-500 py-8">
                                <Clock className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                                <p className="text-sm">No trade history</p>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </div>
        </div>
    )
}
