"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { Button } from "@/components/ui/button"

// -------------------------
// Types
// -------------------------
type PaperTradeDetail = {
    strategyName: string
    status: "running" | "completed" | "paused"
    startedAt: string
    endedAt?: string
    pnl: number
    returnRate: number
    winRate: number
    maxDrawdown: number
    trades: TradeRecord[]
    positions: Position[]
    equityCurve: { time: string; value: number }[]
    parameters: Record<string, string | number>
}

type TradeRecord = {
    id: string
    time: string
    symbol: string
    side: "buy" | "sell"
    quantity: number
    price: number
    pnl: number
}

type Position = {
    symbol: string
    quantity: number
    entryPrice: number
    currentPrice: number
    unrealizedPnl: number
}

// -------------------------
// Mock Data
// -------------------------
const mockData: PaperTradeDetail = {
    strategyName: "MA Crossover",
    status: "running",
    startedAt: "2024-04-01",
    pnl: 5230,
    returnRate: 18.6,
    winRate: 64.2,
    maxDrawdown: -4.5,
    equityCurve: Array.from({ length: 30 }).map((_, i) => ({
        time: `04-${i + 1}`,
        value: 10000 + i * 180 + Math.random() * 100,
    })),
    positions: [
        {
            symbol: "BTC/USDT",
            quantity: 0.25,
            entryPrice: 26000,
            currentPrice: 28200,
            unrealizedPnl: 550,
        },
        {
            symbol: "ETH/USDT",
            quantity: 2,
            entryPrice: 1700,
            currentPrice: 1780,
            unrealizedPnl: 160,
        },
    ],
    trades: [
        {
            id: "t1",
            time: "04-01",
            symbol: "BTC/USDT",
            side: "buy",
            quantity: 0.25,
            price: 26000,
            pnl: 0,
        },
        {
            id: "t2",
            time: "04-05",
            symbol: "ETH/USDT",
            side: "buy",
            quantity: 2,
            price: 1700,
            pnl: 0,
        },
    ],
    parameters: {
        fastPeriod: 5,
        slowPeriod: 20,
        capital: 10000,
    },
}

// -------------------------
// Main Component
// -------------------------
export default function PaperTradeDetailPage() {
    const [data, setData] = useState<PaperTradeDetail | null>(null)

    useEffect(() => {
        setTimeout(() => {
            setData(mockData)
        }, 1000) // Simulate async loading
    }, [])

    if (!data) {
        return <Skeleton className="h-[500px] w-full" />
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">{data.strategyName}</h2>
                    <p className="text-sm text-muted-foreground">
                        {data.startedAt} → {data.endedAt || "..."} · Status: {data.status}
                    </p>
                </div>
                <div className="space-x-2">
                    <Button variant="outline">导出</Button>
                    <Button variant="destructive">结束交易</Button>
                </div>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard title="总收益" value={`$${data.pnl.toFixed(2)}`} />
                <MetricCard title="收益率" value={`${data.returnRate.toFixed(2)}%`} />
                <MetricCard title="胜率" value={`${data.winRate.toFixed(1)}%`} />
                <MetricCard title="最大回撤" value={`${data.maxDrawdown.toFixed(2)}%`} />
            </div>

            {/* Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>收益曲线</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.equityCurve}>
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Line dataKey="value" stroke="#4f46e5" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Positions */}
            <Card>
                <CardHeader>
                    <CardTitle>当前持仓</CardTitle>
                </CardHeader>
                <CardContent>
                    <table className="w-full text-sm">
                        <thead>
                            <tr>
                                <th className="text-left">资产</th>
                                <th>数量</th>
                                <th>开仓价</th>
                                <th>当前价</th>
                                <th>浮盈</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.positions.map((pos) => (
                                <tr key={pos.symbol} className="border-t">
                                    <td>{pos.symbol}</td>
                                    <td>{pos.quantity}</td>
                                    <td>{pos.entryPrice}</td>
                                    <td>{pos.currentPrice}</td>
                                    <td className="text-green-600">${pos.unrealizedPnl}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Parameters */}
            <Card>
                <CardHeader>
                    <CardTitle>策略参数</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(data.parameters).map(([k, v]) => (
                            <li key={k} className="text-sm text-muted-foreground">
                                <span className="font-medium text-foreground mr-2">{k}:</span>
                                {v}
                            </li>
                        ))}
                    </ul>
                </CardContent>
            </Card>
        </div>
    )
}

function MetricCard({ title, value }: { title: string; value: string }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-bold">{value}</CardContent>
        </Card>
    )
}
