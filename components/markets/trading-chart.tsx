"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TradingChartProps {
    pair: string
}

interface CandleData {
    time: number
    open: number
    high: number
    low: number
    close: number
}

const basePrice = 118_378

// Helper function to get interval in milliseconds based on timeframe
function getIntervalMs(timeframe: string): number {
    switch (timeframe) {
        case "1s":
            return 1000
        case "30s":
            return 30 * 1000
        case "1m":
            return 60 * 1000 // 1 minute
        case "5m":
            return 5 * 60 * 1000 // 5 minutes
        case "15m":
            return 15 * 60 * 1000 // 15 minutes
        case "1h":
            return 60 * 60 * 1000 // 1 hour
        case "4h":
            return 4 * 60 * 60 * 1000 // 4 hours
        case "1D":
            return 24 * 60 * 60 * 1000 // 1 day
        case "1W":
            return 7 * 24 * 60 * 60 * 1000 // 1 week
        default:
            return 60 * 1000 // Default to 1 minute
    }
}

function getFrequencyMs(intervalMs: string): number {
    switch (intervalMs) {
        case "100ms":
            return 100
        case "300ms":
            return 300
        case "500ms":
            return 500
        case "1s":
            return 1000
        case "5s":
            return 5 * 1000
        default:
            return 1000
    }
}

function genCandles(timeframe: string, startPrice = basePrice, bars = 0): CandleData[] {
    const data: CandleData[] = []
    const intervalMs = getIntervalMs(timeframe)

    let open = startPrice
    // Generate candles from oldest to newest, aligning time to interval start
    for (let i = bars; i >= 0; i--) {
        const currentTime = Date.now() - i * intervalMs
        const time = (Math.floor(currentTime / intervalMs) * intervalMs) / 1000 // Align to interval start in seconds
        const close = open + (Math.random() - 0.5) * 200
        const high = Math.max(open, close) + Math.random() * 100
        const low = Math.min(open, close) - Math.random() * 100
        data.push({ time, open, high, low, close })
        open = close
    }
    return data
}

export function TradingChart({ pair }: TradingChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)
    const priceSeriesRef = useRef<any>(null)
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null) // 用于存储 interval ID 的引用
    const wsRef = useRef<WebSocket | null>(null)
    const [timeframe, setTimeframe] = useState("1h")
    const [interval, setInterval] = useState("300ms")
    const [price, setPrice] = useState(basePrice)
    const [selectedExchange, setSelectedExchange] = useState("QuantEdge")

    const intervals = ["100ms", "300ms", "500ms", "1s", "5s"]
    const timeframes = ["1s", "30s", "1m", "5m", "1h", "1D"]
    const exchanges = ["QuantEdge", "crypto.com", "Binance", "Coinbase", "Kraken"]

    useEffect(() => {

        if (!containerRef.current) return

        // 动态导入 lightweight-charts
        import("lightweight-charts").then(({ createChart, CrosshairMode }) => {

            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current)
                intervalIdRef.current = null
            }
            if (chartRef.current) {
                chartRef.current.remove()
                chartRef.current = null
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = "" //清空容器，防止多个 canvas 堆积
            }
            // 在异步回调中再次检查容器是否仍然存在，以防组件在导入完成前卸载
            if (!containerRef.current) {
                return
            }

            const chart = createChart(containerRef.current!, {
                width: containerRef.current!.clientWidth,
                height: containerRef.current!.clientHeight,
                layout: {
                    background: { color: "#ffffff" },
                    textColor: "#374151",
                },
                grid: {
                    vertLines: { color: "#e5e7eb" },
                    horzLines: { color: "#e5e7eb" },
                },
                rightPriceScale: {
                    borderColor: "#e5e7eb",
                    scaleMargins: { top: 0.1, bottom: 0 },
                },
                timeScale: {
                    borderColor: "#e5e7eb",
                    timeVisible: true,
                    secondsVisible: timeframe === "1m" || timeframe === "5m" || timeframe === "15m", // Show seconds for smaller timeframes
                },
                crosshair: {
                    mode: CrosshairMode.Normal,
                    vertLine: {
                        width: 1,
                        color: "#9ca3af",
                        style: 3,
                    },
                    horzLine: {
                        width: 1,
                        color: "#9ca3af",
                        style: 3,
                    },
                },
            })
            chartRef.current = chart

            const initialCandles = genCandles(timeframe) // Pass timeframe to genCandles
            const priceSeries = chart.addCandlestickSeries({
                upColor: "#22c55e",
                downColor: "#ef4444",
                borderUpColor: "#22c55e",
                borderDownColor: "#ef4444",
                wickUpColor: "#22c55e",
                wickDownColor: "#ef4444",
            })
            priceSeries.setData(initialCandles)
            priceSeriesRef.current = priceSeries

            // 实时更新逻辑
            let lastCandleTime = initialCandles[initialCandles.length - 1]?.time || Math.floor(Date.now() / 1000)

            if (wsRef.current) {
                console.log("Disconnecting old WebSocket")
                wsRef.current.close()
                wsRef.current = null
            }
            // 建立 WebSocket 连接
            const ws = new WebSocket(`ws://127.0.0.1:9001/?exchange=${selectedExchange}&symbol=${pair}&interval_ms=${getFrequencyMs(interval)}`)
            wsRef.current = ws
            // let lastCandleTime = initialCandles[initialCandles.length - 1]?.time || Math.floor(Date.now() / 1000)

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data)
                const close = data.close
                const timestampSec = data.timestamp
                setPrice(close)

                if (!chartRef.current || !priceSeriesRef.current) return

                const intervalMs = getIntervalMs(timeframe)
                const candleStartTime = Math.floor(timestampSec / (intervalMs / 1000)) * (intervalMs / 1000)

                if (candleStartTime === lastCandleTime) {
                    const lastCandle = priceSeriesRef.current.dataByIndex(priceSeriesRef.current.data().length - 1)
                    if (lastCandle) {
                        priceSeriesRef.current.update({
                            time: lastCandle.time,
                            open: lastCandle.open,
                            high: Math.max(lastCandle.high, close),
                            low: Math.min(lastCandle.low, close),
                            close,
                        })
                    }
                } else {
                    const previousClose = priceSeriesRef.current.dataByIndex(priceSeriesRef.current.data().length - 1)?.close || close
                    priceSeriesRef.current.update({
                        time: candleStartTime,
                        open: previousClose,
                        high: Math.max(previousClose, close),
                        low: Math.min(previousClose, close),
                        close,
                    })
                    lastCandleTime = candleStartTime
                }
            }

            ws.onerror = (err) => {
                console.error("WebSocket error:", err)
            }

            ws.onclose = () => {
                console.log("WebSocket closed")
            }
        })

        // 返回清理函数
        return () => {
            if (wsRef.current) {
                if (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING) {
                    wsRef.current.close()
                }
                wsRef.current = null
            }
            // if (intervalIdRef.current) {
            //     clearInterval(intervalIdRef.current) // 先清除定时器
            //     intervalIdRef.current = null
            // }
            if (chartRef.current) {
                chartRef.current.remove() // 再销毁图表
                chartRef.current = null
            }
        }
    }, [timeframe, pair, interval])

    return (
        <div className="h-full flex flex-col">
            {/* Chart Header */}
            <div className="border-b border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        {/* Exchange Selector as Main Title */}
                        <Select value={selectedExchange} onValueChange={setSelectedExchange}>
                            <SelectTrigger className="w-[140px] h-8 text-sm font-medium border-gray-300">
                                <SelectValue placeholder="Select Exchange" />
                            </SelectTrigger>
                            <SelectContent>
                                {exchanges.map((exchange) => (
                                    <SelectItem key={exchange} value={exchange}>
                                        {exchange}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Timeframe Buttons */}
                        <div className="flex items-center space-x-1">
                            {timeframes.map((tf) => (
                                <Button
                                    key={tf}
                                    variant={timeframe === tf ? "default" : "ghost"}
                                    size="sm"
                                    onClick={() => setTimeframe(tf)}
                                    className={`h-7 px-3 text-xs ${timeframe === tf ? "bg-blue-600 text-white" : "text-gray-600 hover:text-gray-900"
                                        }`}
                                >
                                    {tf}
                                </Button>
                            ))}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                            <span className="text-xs text-gray-600 font-medium">F</span>
                            <Select value={interval} onValueChange={setInterval}>
                                <SelectTrigger className="w-[90px] h-7 text-xs border-gray-300">
                                    <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent>
                                    {intervals.map((intervalOption) => (
                                        <SelectItem key={intervalOption} value={intervalOption}>
                                            {intervalOption}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                    </div>
                </div>

                {/* Second row: Chart Info (Badge and O:H:L:C values) - now on its own line */}
                <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {pair} • {selectedExchange}
                        </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-500">
                        <span>O: {price.toFixed(2)}</span>
                        <span>H: {(price * 1.02).toFixed(2)}</span>
                        <span>L: {(price * 0.98).toFixed(2)}</span>
                        <span>C: {price.toFixed(2)}</span>
                    </div>
                </div>
            </div>

            {/* Chart Container */}
            <div className="flex-1">
                <div ref={containerRef} className="w-full h-full" />
            </div>
        </div>
    )
}
