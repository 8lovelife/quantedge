import { NextResponse } from "next/server"

// Simulate a delay for API response
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Generate historical backtest data with a fixed seed for consistency
const generateHistoricalBacktestData = (days = 180, version = 1, params: any = {}) => {
    // Use fixed values for historical data to ensure consistency
    const data = []
    // Adjust initial balance based on version to create different results
    let balance = 10000 + version * 500
    let marketBalance = 10000
    const date = new Date()
    date.setDate(date.getDate() - days)

    // Generate fixed trades with slight variations based on version
    const trades = [
        { day: 5, type: "buy", result: "win", profit: 320.45 + version * 20 },
        { day: 12, type: "sell", result: "loss", profit: -150.2 - version * 10 },
        { day: 25, type: "buy", result: "win", profit: 450.8 + version * 15 },
        { day: 40, type: "buy", result: "win", profit: 280.3 + version * 25 },
        { day: 55, type: "sell", result: "loss", profit: -200.1 - version * 5 },
        { day: 70, type: "buy", result: "win", profit: 380.6 + version * 30 },
        { day: 85, type: "sell", result: "win", profit: 210.4 + version * 10 },
        { day: 100, type: "buy", result: "loss", profit: -120.75 - version * 15 },
        { day: 115, type: "sell", result: "win", profit: 290.25 + version * 20 },
        { day: 130, type: "buy", result: "win", profit: 340.5 + version * 25 },
        { day: 145, type: "sell", result: "loss", profit: -180.3 - version * 10 },
        { day: 160, type: "buy", result: "win", profit: 420.15 + version * 15 },
    ]

    for (let i = 0; i < days; i++) {
        const dayDate = new Date(date)
        dayDate.setDate(date.getDate() + i)

        // Deterministic market movement
        const marketChange = Math.sin(i * 0.1) * 0.01 + 0.0003
        marketBalance = marketBalance * (1 + marketChange)

        // Deterministic strategy movement with version-based variation
        const strategyChange = Math.sin(i * 0.1 + 0.5) * (0.012 + version * 0.001) + 0.0005
        balance = balance * (1 + strategyChange)

        // Find trades for this day
        const dayTrades = trades.filter((t) => t.day === i)
        if (dayTrades.length > 0) {
            dayTrades.forEach((trade) => {
                balance += trade.profit
            })
        }

        data.push({
            date: dayDate.toISOString().split("T")[0],
            balance: Math.round(balance * 100) / 100,
            marketBalance: Math.round(marketBalance * 100) / 100,
            trades: dayTrades.length,
        })
    }

    return { data, trades, params }
}

// Helper function to calculate metrics for a specific dataset
const calculateMetricsForData = (backtestData: any) => {
    if (!backtestData) return null

    const data = backtestData.data
    const initialBalance = data[0].balance
    const finalBalance = data[data.length - 1].balance
    const initialMarket = data[0].marketBalance
    const finalMarket = data[data.length - 1].balance

    const strategyReturn = ((finalBalance - initialBalance) / initialBalance) * 100
    const marketReturn = ((finalMarket - initialMarket) / initialMarket) * 100
    const alpha = strategyReturn - marketReturn

    // Calculate drawdown
    let maxBalance = initialBalance
    let maxDrawdown = 0

    for (const day of data) {
        if (day.balance > maxBalance) {
            maxBalance = day.balance
        }

        const drawdown = ((maxBalance - day.balance) / maxBalance) * 100
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown
        }
    }

    // Calculate win rate
    const trades = backtestData.trades
    const winningTrades = trades.filter((t: any) => t.result === "win").length
    const winRate = (winningTrades / trades.length) * 100

    // Calculate Sharpe ratio (simplified)
    const returns = []
    for (let i = 1; i < data.length; i++) {
        returns.push((data[i].balance - data[i - 1].balance) / data[i - 1].balance)
    }

    const avgReturn = returns.reduce((sum: number, r: number) => sum + r, 0) / returns.length
    const stdDev = Math.sqrt(
        returns.reduce((sum: number, r: number) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length,
    )
    const sharpeRatio = (avgReturn / stdDev) * Math.sqrt(252) // Annualized

    return {
        strategyReturn: strategyReturn.toFixed(2),
        marketReturn: marketReturn.toFixed(2),
        alpha: alpha.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(2),
        winRate: winRate.toFixed(2),
        totalTrades: trades.length,
        sharpeRatio: sharpeRatio.toFixed(2),
    }
}

// Mock backtest run history
const backtestRunHistory = [
    {
        id: 1,
        date: "2025-03-18T09:30:00",
        version: 1,
        parameters: { smaFast: 10, smaSlow: 50, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
    },
    {
        id: 2,
        date: "2025-03-17T14:45:00",
        version: 2,
        parameters: { smaFast: 12, smaSlow: 50, riskLevel: "medium", stopLoss: 2.5, takeProfit: 7 },
    },
    {
        id: 3,
        date: "2025-03-15T11:20:00",
        version: 3,
        parameters: { smaFast: 10, smaSlow: 45, riskLevel: "high", stopLoss: 3, takeProfit: 9 },
    },
    {
        id: 4,
        date: "2025-03-10T16:15:00",
        version: 4,
        parameters: { smaFast: 8, smaSlow: 40, riskLevel: "low", stopLoss: 1.5, takeProfit: 4.5 },
    },
    {
        id: 5,
        date: "2025-03-05T10:00:00",
        version: 5,
        parameters: { smaFast: 15, smaSlow: 60, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
    },
]

// Ensure the API returns properly formatted data
export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url)
        const versionsParam = url.searchParams.get("versions")
        const versions = versionsParam ? versionsParam.split(",").map((v) => Number.parseInt(v, 10)) : []
        const timeframe = url.searchParams.get("timeframe") || "6m"
        const strategyId = url.searchParams.get("strategyId") || "1"

        console.log("Received comparison request:", { versions, timeframe, strategyId })

        if (versions.length < 2) {
            console.log("Not enough versions provided, using default versions")
            // Default to versions 1 and 2 if none or only one is provided
            versions.push(1, 2)
        }

        // Calculate days based on timeframe
        let days = 180
        switch (timeframe) {
            case "1m":
                days = 30
                break
            case "3m":
                days = 90
                break
            case "6m":
                days = 180
                break
            case "1y":
                days = 365
                break
            case "all":
                days = 730
                break
        }

        // Simulate API processing time
        await delay(1500)

        // Generate comparison data for all requested versions
        const comparisonData = await Promise.all(
            versions.map(async (version) => {
                // Get the run parameters
                const runParams = backtestRunHistory.find((r) => r.version === version)?.parameters || {}

                // Generate data for this run
                const data = generateHistoricalBacktestData(days, version, runParams)

                // Calculate metrics for this run
                const metrics = calculateMetricsForData(data)

                return {
                    version,
                    data,
                    metrics,
                    params: runParams,
                    date: backtestRunHistory.find((r) => r.version === version)?.date || new Date().toISOString(),
                }
            }),
        )

        console.log(`Generated comparison data for ${comparisonData.length} versions`)

        // Create response with comparison data
        const response = {
            success: true,
            strategyId,
            timeframe,
            comparisonData,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error processing comparison request:", error)
        return NextResponse.json({ success: false, error: "Failed to process comparison request" }, { status: 500 })
    }
}

