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
        case "30m":
            return 30 * 60 * 1000 // 30 minutes
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

// 获取时间刻度配置
function getTimeScaleConfig(timeframe: string) {
    const config = {
        borderColor: "#e5e7eb",
        timeVisible: true,
        secondsVisible: false,
        tickMarkFormatter: undefined as any
    }

    switch (timeframe) {
        case "1s":
            config.secondsVisible = true
            config.tickMarkFormatter = (time: number) => {
                const date = new Date(time * 1000)
                return date.toLocaleTimeString('en-US', {
                    hour12: false,
                    minute: '2-digit',
                    second: '2-digit'
                })
            }
            break

        case "30s":
            config.secondsVisible = true
            config.tickMarkFormatter = (time: number) => {
                const date = new Date(time * 1000)
                return date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            }
            break

        case "1m":
        case "5m":
            config.secondsVisible = true
            config.tickMarkFormatter = (time: number) => {
                const date = new Date(time * 1000)
                return date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                })
            }
            break

        case "15m":
        case "30m":
            config.secondsVisible = false
            config.tickMarkFormatter = (time: number) => {
                const date = new Date(time * 1000)
                return date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                })
            }
            break

        case "1h":
        case "4h":
            config.secondsVisible = false
            config.tickMarkFormatter = (time: number) => {
                const date = new Date(time * 1000)
                const month = date.toLocaleDateString('en-US', { month: 'short' })
                const day = date.getDate()
                const timeStr = date.toLocaleTimeString('en-US', {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit'
                })
                return `${month} ${day} ${timeStr}`
            }
            break

        case "1D":
        case "1W":
            config.secondsVisible = false
            config.tickMarkFormatter = (time: number) => {
                const date = new Date(time * 1000)
                return date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                })
            }
            break

        default:
            config.secondsVisible = false
            break
    }

    return config
}

function genCandles(timeframe: string, startPrice = basePrice, bars = 0): CandleData[] {
    const data: CandleData[] = []
    // const intervalMs = getIntervalMs(timeframe)

    // let open = startPrice
    // // Generate candles from oldest to newest, aligning time to interval start
    // for (let i = bars; i >= 0; i--) {
    //     const currentTime = Date.now() - i * intervalMs
    //     const time = (Math.floor(currentTime / intervalMs) * intervalMs) / 1000 // Align to interval start in seconds
    //     const close = open + (Math.random() - 0.5) * 200
    //     const high = Math.max(open, close) + Math.random() * 100
    //     const low = Math.min(open, close) - Math.random() * 100
    //     data.push({ time, open, high, low, close })
    //     open = close
    // }
    return data
}

export function TradingChart({ pair }: TradingChartProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const chartRef = useRef<any>(null)
    const priceSeriesRef = useRef<any>(null)
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null)
    const wsRef = useRef<WebSocket | null>(null)

    const [timeframe, setTimeframe] = useState("1s")
    const [interval, setInterval] = useState("300ms")
    const [price, setPrice] = useState(basePrice)
    const [selectedExchange, setSelectedExchange] = useState("QuantEdge")
    const [currentCandle, setCurrentCandle] = useState<CandleData | null>(null)

    const intervals = ["100ms", "300ms", "500ms", "1s", "5s"]
    const timeframes = ["1s", "30s", "1m", "5m", "15m", "1h"]
    const exchanges = ["QuantEdge", "crypto.com", "Binance", "Coinbase", "Kraken"]

    useEffect(() => {
        if (!containerRef.current) return

        // 动态导入 lightweight-charts
        import("lightweight-charts").then(({ createChart, CrosshairMode }) => {
            // 清理之前的资源
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current)
                intervalIdRef.current = null
            }
            if (chartRef.current) {
                chartRef.current.remove()
                chartRef.current = null
            }
            if (containerRef.current) {
                containerRef.current.innerHTML = ""
            }
            if (!containerRef.current) {
                return
            }

            // 获取时间刻度配置
            const timeScaleConfig = getTimeScaleConfig(timeframe)

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
                timeScale: timeScaleConfig,
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

            const initialCandles = genCandles(timeframe)
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

            // 初始化当前蜡烛数据
            const latestCandle = initialCandles[initialCandles.length - 1]
            if (latestCandle) {
                setCurrentCandle(latestCandle)
            }

            // 实时更新逻辑
            let lastCandleTime = initialCandles[initialCandles.length - 1]?.time || Math.floor(Date.now() / 1000)

            // 关闭之前的 WebSocket 连接
            if (wsRef.current) {
                console.log("Disconnecting old WebSocket")
                wsRef.current.close()
                wsRef.current = null
            }

            // 建立新的 WebSocket 连接
            const ws = new WebSocket(`ws://127.0.0.1:9001/?exchange=${selectedExchange}&symbol=${pair}&interval_ms=${getFrequencyMs(interval)}`)
            wsRef.current = ws

            ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data)
                    const close = data.close
                    const timestampMs = data.timestamp

                    setPrice(close)

                    if (!chartRef.current || !priceSeriesRef.current) return

                    const intervalMs = getIntervalMs(timeframe)

                    // 修复精度问题：在毫秒级对齐时间
                    const candleStartTimeMs = Math.floor(timestampMs / intervalMs) * intervalMs
                    const candleStartTimeSec = candleStartTimeMs / 1000

                    if (candleStartTimeSec === lastCandleTime) {
                        // 更新当前蜡烛
                        const allData = priceSeriesRef.current.data()
                        const lastCandle = allData[allData.length - 1]
                        if (lastCandle) {
                            const updatedCandle = {
                                time: lastCandle.time,
                                open: lastCandle.open,
                                high: Math.max(lastCandle.high, close),
                                low: Math.min(lastCandle.low, close),
                                close,
                            }
                            priceSeriesRef.current.update(updatedCandle)
                            setCurrentCandle(updatedCandle)
                        }
                    } else {
                        // 创建新蜡烛
                        const allData = priceSeriesRef.current.data()
                        const previousClose = allData.length > 0 ? allData[allData.length - 1].close : close

                        const newCandle = {
                            time: candleStartTimeSec,
                            open: previousClose,
                            high: Math.max(previousClose, close),
                            low: Math.min(previousClose, close),
                            close,
                        }

                        priceSeriesRef.current.update(newCandle)
                        setCurrentCandle(newCandle)
                        lastCandleTime = candleStartTimeSec
                    }
                } catch (error) {
                    console.error('Error processing WebSocket message:', error)
                }
            }

            ws.onerror = (err) => {
                console.error("WebSocket error:", err)
            }

            ws.onclose = (event) => {
                console.log("WebSocket closed:", event.code, event.reason)
            }

            ws.onopen = () => {
                console.log("WebSocket connected")
            }

            // 窗口大小调整处理
            const handleResize = () => {
                if (chartRef.current && containerRef.current) {
                    chartRef.current.applyOptions({
                        width: containerRef.current.clientWidth,
                        height: containerRef.current.clientHeight,
                    })
                }
            }

            window.addEventListener('resize', handleResize)

            // 清理函数中移除事件监听
            return () => {
                window.removeEventListener('resize', handleResize)
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
            if (chartRef.current) {
                chartRef.current.remove()
                chartRef.current = null
            }
        }
    }, [timeframe, pair, interval, selectedExchange])

    return (
        <div className="h-full flex flex-col">
            {/* Chart Header */}
            <div className="border-b border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                        {/* Exchange Selector */}
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

                        {/* Frequency Selector */}
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

                    {/* Connection Status */}
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-xs text-gray-500">Live</span>
                    </div>
                </div>

                {/* Second row: Chart Info */}
                <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="bg-green-100 text-green-700">
                            {pair} • {selectedExchange}
                        </Badge>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-500">
                        <span>O: {currentCandle?.open?.toFixed(2) || price.toFixed(2)}</span>
                        <span>H: {currentCandle?.high?.toFixed(2) || (price * 1.02).toFixed(2)}</span>
                        <span>L: {currentCandle?.low?.toFixed(2) || (price * 0.98).toFixed(2)}</span>
                        <span>C: {currentCandle?.close?.toFixed(2) || price.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <span className="text-gray-400">|</span>
                        <span className="text-gray-500">
                            {timeframe} • {interval}
                        </span>
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