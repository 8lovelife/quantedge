import { BacktestData, BacktestParameters } from "@/lib/api/backtest/types"
import { NextResponse } from "next/server"

// Simulate a delay for API response
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock backtest run history
const backtestRunHistory = [
    { id: 1, date: "2025-03-18T09:30:00", version: 1, parameters: { smaFast: 10, smaSlow: 50, riskLevel: "medium" } },
    { id: 2, date: "2025-03-17T14:45:00", version: 2, parameters: { smaFast: 12, smaSlow: 50, riskLevel: "medium" } },
    { id: 3, date: "2025-03-15T11:20:00", version: 3, parameters: { smaFast: 10, smaSlow: 45, riskLevel: "high" } },
    { id: 4, date: "2025-03-10T16:15:00", version: 4, parameters: { smaFast: 8, smaSlow: 40, riskLevel: "low" } },
    { id: 5, date: "2025-03-05T10:00:00", version: 5, parameters: { smaFast: 15, smaSlow: 60, riskLevel: "medium" } },
]

// Import the generateHistoricalBacktestData function from the main route
// This is a simplified version for the comparison route
function generateHistoricalBacktestData(days = 180, version = 1, params: BacktestParameters = {}): BacktestData {
    // Use fixed values for historical data to ensure consistency
    const balances = []
    // Adjust initial balance based on version to create different results
    let balance = 10000 + version * 500
    let marketBalance = 10000
    const date = new Date()
    date.setDate(date.getDate() - days)

    // Generate fixed trades with slight variations based on version and parameters
    const trades = []

    // Adjust trade frequency based on parameters
    const tradeFrequency = params.tradeFrequency || 12
    const baseWinRate = params.riskLevel === "high" ? 0.55 : params.riskLevel === "low" ? 0.65 : 0.6

    // Generate trades based on parameters
    for (let i = 0; i < tradeFrequency; i++) {
        const tradeDay = Math.floor(Math.random() * days)
        const isWin = Math.random() < baseWinRate

        // Calculate profit based on parameters
        const profitFactor = params.takeProfit && params.stopLoss ? params.takeProfit / params.stopLoss : 1.5
        const profit = isWin ? Math.random() * 500 * profitFactor : -Math.random() * 300 * (1 / profitFactor)

        trades.push({
            day: tradeDay,
            type: Math.random() > 0.5 ? "buy" : "sell",
            result: isWin ? "win" : "loss",
            profit: profit,
        })
    }

    // Sort trades by day
    trades.sort((a, b) => a.day - b.day)

    // Generate price data with parameter influence
    const smaFastInfluence = params.smaFast ? (20 / params.smaFast) * 0.001 : 0.001
    const smaSlowInfluence = params.smaSlow ? (params.smaSlow / 100) * 0.001 : 0.001

    for (let i = 0; i < days; i++) {
        const dayDate = new Date(date)
        dayDate.setDate(date.getDate() + i)

        // Deterministic market movement
        const marketChange = Math.sin(i * 0.1) * 0.01 + 0.0003
        marketBalance = marketBalance * (1 + marketChange)

        // Deterministic strategy movement with parameter-based variation
        const strategyChange = Math.sin(i * 0.1 + 0.5) * (0.012 + smaFastInfluence - smaSlowInfluence) + 0.0005
        balance = balance * (1 + strategyChange)

        // Find trades for this day
        const dayTrades = trades.filter((t) => t.day === i)
        if (dayTrades.length > 0) {
            dayTrades.forEach((trade) => {
                balance += trade.profit
            })
        }

        balances.push({
            date: dayDate.toISOString().split("T")[0],
            balance: Math.round(balance * 100) / 100,
            marketBalance: Math.round(marketBalance * 100) / 100,
            trades: dayTrades.length,
        })
    }

    // Calculate metrics
    const initialBalance = balances[0].balance
    const finalBalance = balances[balances.length - 1].balance
    const initialMarket = balances[0].marketBalance
    const finalMarket = balances[balances.length - 1].marketBalance

    const strategyReturn = ((finalBalance - initialBalance) / initialBalance) * 100
    const marketReturn = ((finalMarket - initialMarket) / initialMarket) * 100
    const alpha = strategyReturn - marketReturn

    // Calculate drawdown
    let maxBalance = initialBalance
    let maxDrawdown = 0

    for (const day of balances) {
        if (day.balance > maxBalance) {
            maxBalance = day.balance
        }

        const drawdown = ((maxBalance - day.balance) / maxBalance) * 100
        if (drawdown > maxDrawdown) {
            maxDrawdown = drawdown
        }
    }

    // Calculate win rate
    const winningTrades = trades.filter((t) => t.result === "win").length
    const calculatedWinRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0

    // Calculate Sharpe ratio (simplified)
    const returns = []
    for (let i = 1; i < balances.length; i++) {
        returns.push((balances[i].balance - balances[i - 1].balance) / balances[i - 1].balance)
    }

    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0
    const stdDev =
        returns.length > 0 ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) : 1
    const sharpeRatio = (avgReturn / (stdDev || 0.01)) * Math.sqrt(252) // Annualized

    const metrics = {
        strategyReturn: strategyReturn.toFixed(2),
        marketReturn: marketReturn.toFixed(2),
        alpha: alpha.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(2),
        winRate: calculatedWinRate.toFixed(2),
        sharpeRatio: sharpeRatio.toFixed(2),
        totalTrades: trades.length,
    }

    return {
        balances,
        trades,
        params,
    }
}

export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url)
        const versionsParam = url.searchParams.get("versions")
        const timeframe = url.searchParams.get("timeframe") || "6m"
        const strategyId = url.searchParams.get("strategyId") || "1"

        let versions = versionsParam ? versionsParam.split(",").map((v) => Number.parseInt(v, 10)) : []

        console.log("Received comparison request with versions:", versions)

        // Always ensure we have at least 2 versions to compare
        if (versions.length < 2) {
            console.log("Not enough versions provided, using default versions 1 and 2")
            versions = [1, 2]
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

        // Get parameters from mock database based on version
        const mockParams: Record<number, BacktestParameters> = {
            1: { smaFast: 10, smaSlow: 50, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
            2: { smaFast: 12, smaSlow: 50, riskLevel: "medium", stopLoss: 2.5, takeProfit: 7 },
            3: { smaFast: 10, smaSlow: 45, riskLevel: "high", stopLoss: 3, takeProfit: 9 },
            4: { smaFast: 8, smaSlow: 40, riskLevel: "low", stopLoss: 1.5, takeProfit: 4.5 },
            5: { smaFast: 15, smaSlow: 60, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
        }

        // Generate comparison data for requested versions
        const comparisonData = versions.map((version) => {
            const params = mockParams[version] || mockParams[1]
            const runData = generateHistoricalBacktestData(days, version, params)
            const runInfo = backtestRunHistory.find((r) => r.version === version) || {
                date: new Date().toISOString(),
                version,
            }

            return {
                version,
                date: runInfo.date,
                data: {
                    balances: runData.balances,
                    trades: runData.trades,
                },
                metrics: runData.metrics,
                params: runData.params,
            }
        })

        console.log(`Generated comparison data for ${comparisonData.length} versions`)

        // Create response with comparison data
        const response = {
            success: true,
            comparisonData,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error processing comparison request:", error)
        return NextResponse.json(
            {
                success: false,
                error: "Failed to process comparison request",
                comparisonData: [],
            },
            { status: 500 },
        )
    }
}

