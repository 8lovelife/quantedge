"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Search, TrendingUp, TrendingDown, Star, BarChart3, Globe, DollarSign, RefreshCw } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Enhanced mock market data
const marketData = [
    {
        id: 1,
        symbol: "BTC/USDT",
        name: "Bitcoin",
        price: 67420.52,
        change24h: 3.45,
        volume24h: 28400000000,
        marketCap: 1320000000000,
        high24h: 68200.0,
        low24h: 65800.0,
        category: "spot",
        isFavorite: false,
    },
    {
        id: 2,
        symbol: "ETH/USDT",
        name: "Ethereum",
        price: 3842.18,
        change24h: 5.21,
        volume24h: 15200000000,
        marketCap: 462100000000,
        high24h: 3890.5,
        low24h: 3820.0,
        category: "spot",
        isFavorite: true,
    },
    {
        id: 3,
        symbol: "SOL/USDT",
        name: "Solana",
        price: 187.34,
        change24h: 8.92,
        volume24h: 3800000000,
        marketCap: 89200000000,
        high24h: 192.3,
        low24h: 175.8,
        category: "spot",
        isFavorite: false,
    },
    // {
    //     id: 4,
    //     symbol: "ADA/USDT",
    //     name: "Cardano",
    //     price: 0.8734,
    //     change24h: -2.15,
    //     volume24h: 1200000000,
    //     marketCap: 30500000000,
    //     high24h: 0.9128,
    //     low24h: 0.8521,
    //     category: "spot",
    //     isFavorite: false,
    // },
    // {
    //     id: 5,
    //     symbol: "AVAX/USDT",
    //     name: "Avalanche",
    //     price: 42.87,
    //     change24h: 1.83,
    //     volume24h: 892000000,
    //     marketCap: 17800000000,
    //     high24h: 44.12,
    //     low24h: 41.55,
    //     category: "spot",
    //     isFavorite: true,
    // },
    // {
    //     id: 6,
    //     symbol: "BNB/USDT",
    //     name: "BNB",
    //     price: 692.84,
    //     change24h: 3.67,
    //     volume24h: 2100000000,
    //     marketCap: 103000000000,
    //     high24h: 698.2,
    //     low24h: 668.5,
    //     category: "spot",
    //     isFavorite: false,
    // },
    // {
    //     id: 7,
    //     symbol: "DOT/USDT",
    //     name: "Polkadot",
    //     price: 8.94,
    //     change24h: -0.87,
    //     volume24h: 450000000,
    //     marketCap: 12800000000,
    //     high24h: 9.12,
    //     low24h: 8.85,
    //     category: "spot",
    //     isFavorite: false,
    // },
    // {
    //     id: 8,
    //     symbol: "LINK/USDT",
    //     name: "Chainlink",
    //     price: 25.48,
    //     change24h: 1.95,
    //     volume24h: 780000000,
    //     marketCap: 15600000000,
    //     high24h: 25.89,
    //     low24h: 24.92,
    //     category: "spot",
    //     isFavorite: false,
    // },
]

const formatNumber = (num) => {
    if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
}

const formatPrice = (price) => {
    return price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 8,
    })
}

export default function LiveMarketsPage() {
    const router = useRouter()
    const [searchTerm, setSearchTerm] = useState("")
    const [sortBy, setSortBy] = useState("marketCap")
    const [sortOrder, setSortOrder] = useState("desc")
    const [activeTab, setActiveTab] = useState("all")
    const [favorites, setFavorites] = useState([2, 3])

    const filteredAndSortedData = useMemo(() => {
        let filtered = marketData.filter(
            (item) =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.symbol.toLowerCase().includes(searchTerm.toLowerCase()),
        )

        if (activeTab === "favorites") {
            filtered = filtered.filter((item) => favorites.includes(item.id))
        }

        return filtered.sort((a, b) => {
            const aValue = a[sortBy]
            const bValue = b[sortBy]
            return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        })
    }, [searchTerm, sortBy, sortOrder, activeTab, favorites])

    const toggleFavorite = (id, e) => {
        e.stopPropagation()
        setFavorites((prev) => (prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id]))
    }

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(column)
            setSortOrder("desc")
        }
    }

    const handleRowClick = (symbol) => {
        const tradingSymbol = symbol.replace("/", "_")
        router.push(`/trade/${tradingSymbol}`)
    }

    return (
        <div className="min-h-screen bg-blue-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white py-16">
                <div className="container mx-auto px-6 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">Live Crypto Markets</h1>
                    <p className="text-lg md:text-xl mb-8 opacity-90">
                        Real-time cryptocurrency market data with institutional-grade feeds
                    </p>
                </div>
            </div>

            {/* Global Market Stats */}
            <div className="container mx-auto px-6 -mt-8">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                    <div className="flex flex-wrap justify-around items-center gap-8">
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                                <TrendingUp className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Global Market Cap</p>
                                <p className="text-2xl font-bold text-blue-700">$2.1T</p>
                                <p className="text-green-600 text-sm font-medium">+5.2% (24h)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-500 to-blue-500 rounded-full flex items-center justify-center">
                                <DollarSign className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">24h Trading Volume</p>
                                <p className="text-2xl font-bold text-blue-700">$87.4B</p>
                                <p className="text-green-600 text-sm font-medium">+12.3% (24h)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center">
                                <Globe className="text-white" size={24} />
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">Active Markets</p>
                                <p className="text-2xl font-bold text-blue-700">15,847</p>
                                <p className="text-green-600 text-sm font-medium">+2.8% (24h)</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                                <div className="text-white font-bold">₿</div>
                            </div>
                            <div>
                                <p className="text-gray-600 text-sm">BTC Dominance</p>
                                <p className="text-2xl font-bold text-blue-700">63.4%</p>
                                <p className="text-gray-600 text-sm font-medium">+0.3% (24h)</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 pb-12">
                {/* Controls */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                placeholder="Search cryptocurrencies..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 w-80 bg-white border-gray-300"
                            />
                        </div>
                        <Button variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Refresh
                        </Button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="w-48 bg-white border-gray-300">
                                <SelectValue placeholder="Sort by..." />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                                <SelectItem value="marketCap">Market Cap</SelectItem>
                                <SelectItem value="volume24h">24h Volume</SelectItem>
                                <SelectItem value="change24h">24h Change</SelectItem>
                                <SelectItem value="price">Price</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
                    <TabsList className="bg-white border border-gray-200 shadow-sm">
                        <TabsTrigger
                            value="all"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            All Markets
                        </TabsTrigger>
                        <TabsTrigger
                            value="favorites"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            Favorites ({favorites.length})
                        </TabsTrigger>
                        <TabsTrigger
                            value="gainers"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            Top Gainers
                        </TabsTrigger>
                        <TabsTrigger
                            value="losers"
                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                        >
                            Top Losers
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value={activeTab} className="mt-6">
                        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gradient-to-r from-blue-50 to-teal-50 border-gray-200">
                                        <TableHead className="w-12"></TableHead>
                                        <TableHead
                                            className="text-blue-700 cursor-pointer hover:text-blue-800 font-bold"
                                            onClick={() => handleSort("name")}
                                        >
                                            Cryptocurrency
                                        </TableHead>
                                        <TableHead
                                            className="text-right cursor-pointer hover:text-blue-800 font-semibold"
                                            onClick={() => handleSort("price")}
                                        >
                                            Price
                                        </TableHead>
                                        <TableHead
                                            className="text-right cursor-pointer hover:text-blue-800 font-semibold"
                                            onClick={() => handleSort("change24h")}
                                        >
                                            24h Change
                                        </TableHead>
                                        <TableHead
                                            className="text-right cursor-pointer hover:text-blue-800 font-semibold"
                                            onClick={() => handleSort("volume24h")}
                                        >
                                            Volume
                                        </TableHead>
                                        <TableHead
                                            className="text-right cursor-pointer hover:text-blue-800 font-semibold"
                                            onClick={() => handleSort("marketCap")}
                                        >
                                            Market Cap
                                        </TableHead>
                                        <TableHead className="text-right font-semibold">24h Range</TableHead>
                                        <TableHead className="text-center font-semibold">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredAndSortedData.map((item) => (
                                        <TableRow
                                            key={item.id}
                                            className="border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer"
                                            onClick={() => handleRowClick(item.symbol)}
                                        >
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => toggleFavorite(item.id, e)}
                                                    className="p-1 h-8 w-8 hover:bg-yellow-100"
                                                >
                                                    <Star
                                                        className={`h-4 w-4 ${favorites.includes(item.id)
                                                            ? "fill-yellow-500 text-yellow-500"
                                                            : "text-gray-400 hover:text-yellow-500"
                                                            }`}
                                                    />
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                                        {item.symbol.split("/")[0].charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-900">{item.symbol}</div>
                                                        <div className="text-gray-500 text-sm">{item.name}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono font-semibold text-gray-900">
                                                {formatPrice(item.price)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className={`font-semibold ${item.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    {item.change24h >= 0 ? "+" : ""}
                                                    {item.change24h.toFixed(2)}%
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-gray-700">
                                                {formatNumber(item.volume24h)}
                                            </TableCell>
                                            <TableCell className="text-right font-mono text-gray-700">
                                                {formatNumber(item.marketCap)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="text-gray-600 text-sm font-mono space-y-1">
                                                    <div className="text-red-600">{formatPrice(item.low24h)}</div>
                                                    <div className="text-green-600">{formatPrice(item.high24h)}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleRowClick(item.symbol);
                                                    }}
                                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 font-medium px-3 py-1 text-xs rounded-md transition-all duration-200"
                                                >
                                                    Trade
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="text-center mt-6">
                            <p className="text-gray-600 text-sm">
                                Live data updates every 30 seconds • Last updated: {new Date().toLocaleTimeString()}
                            </p>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    )
}