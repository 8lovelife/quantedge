import { BacktestData, BacktestMetrics, BacktestParameters, BacktestResponse, DistributionData, MonthlyReturnData } from "@/lib/api/backtest/types"
import { NextResponse } from "next/server"

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API


// Simulate a delay for API response
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * Generate historical backtest data with a fixed seed for consistency
 */
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
    const metrics = calculateMetrics(balances, trades)

    // Calculate monthly returns
    const monthlyReturns = calculateMonthlyReturns(balances)

    // Calculate return distribution
    const returnDistribution = calculateReturnDistribution(balances)

    return {
        balances,
        trades,
        params,
        metrics,
        monthlyReturns,
        returnDistribution,
    }
}

/**
 * Calculate performance metrics from backtest data
 */
function calculateMetrics(balances: any[], trades: any[]): BacktestMetrics {
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

    return {
        strategyReturn: strategyReturn.toFixed(2),
        marketReturn: marketReturn.toFixed(2),
        alpha: alpha.toFixed(2),
        maxDrawdown: maxDrawdown.toFixed(2),
        winRate: calculatedWinRate.toFixed(2),
        sharpeRatio: sharpeRatio.toFixed(2),
        totalTrades: trades.length,
    }
}

/**
 * Calculate monthly returns from daily balance data
 */
function calculateMonthlyReturns(balances: any[]): MonthlyReturnData[] {
    // Group by month and calculate returns
    const monthlyData: MonthlyReturnData[] = []
    const months: Record<string, any> = {}

    balances.forEach((d) => {
        const date = new Date(d.date)
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`

        if (!months[monthKey]) {
            months[monthKey] = {
                month: `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`,
                initialBalance: d.balance,
                finalBalance: d.balance,
                initialMarket: d.marketBalance,
                finalMarket: d.marketBalance,
            }
        } else {
            months[monthKey].finalBalance = d.balance
            months[monthKey].finalMarket = d.marketBalance
        }
    })

    Object.values(months).forEach((m: any) => {
        const strategyReturn = ((m.finalBalance - m.initialBalance) / m.initialBalance) * 100
        const marketReturn = ((m.finalMarket - m.initialMarket) / m.initialMarket) * 100

        monthlyData.push({
            month: m.month,
            strategyReturn: strategyReturn,
            marketReturn: marketReturn,
        })
    })

    return monthlyData
}

/**
 * Calculate return distribution from daily balance data
 */
function calculateReturnDistribution(balances: any[]): DistributionData[] {
    // Calculate return distribution
    const returns = []
    for (let i = 1; i < balances.length; i++) {
        const prevBalance = balances[i - 1].balance
        const currentBalance = balances[i].balance
        const dailyReturn = ((currentBalance - prevBalance) / prevBalance) * 100
        returns.push(dailyReturn)
    }

    // Create bins for histogram
    const min = Math.floor(Math.min(...returns))
    const max = Math.ceil(Math.max(...returns))
    const binSize = 0.5
    const bins: Record<string, number> = {}

    for (let i = min; i <= max; i += binSize) {
        bins[i.toFixed(1)] = 0
    }

    // Count occurrences in each bin
    returns.forEach((ret) => {
        const binKey = (Math.floor(ret / binSize) * binSize).toFixed(1)
        if (bins[binKey] !== undefined) {
            bins[binKey]++
        }
    })

    // Convert to array for chart
    return Object.entries(bins).map(([bin, count]) => ({
        bin: `${bin}%`,
        count: count,
        binValue: Number.parseFloat(bin),
    }))
}

// API route handler for POST requests (run new backtest)
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json()
        const { params, timeframe, strategyId } = body

        // Log received parameters
        console.log("Received backtest request:", { params, timeframe, strategyId })

        // Simulate API processing time with progressive updates
        // await delay(2000)

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

        // Generate a unique version ID
        const version = Math.floor(Math.random() * 1000)

        // Generate backtest data
        const backtestData = generateHistoricalBacktestData(days, version, params)


        const response = await fetch(`${BACKENT_SERVER_API}/api/backtest/run`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ params, timeframe, strategyId: Number(strategyId) }),
        });
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        // Create response with backtest data and metadata
        const result: BacktestResponse = {
            success: true,
            version: data.version,
            date: data.date,
            strategyId,
            timeframe,
            data: data,
        }

        return NextResponse.json(result)
    } catch (error) {
        console.error("Error processing backtest request:", error)
        return NextResponse.json({ success: false, error: "Failed to process backtest request" }, { status: 500 })
    }
}

// API route for getting historical backtest data
export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url)
        const version = Number.parseInt(url.searchParams.get("version") || "1")
        const timeframe = url.searchParams.get("timeframe") || "6m"
        const strategyId = url.searchParams.get("strategyId") || "1"

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
        // await delay(1000)

        // Get parameters from mock database based on version
        const mockParams: Record<number, BacktestParameters> = {
            1: { smaFast: 10, smaSlow: 50, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
            2: { smaFast: 12, smaSlow: 50, riskLevel: "medium", stopLoss: 2.5, takeProfit: 7 },
            3: { smaFast: 10, smaSlow: 45, riskLevel: "high", stopLoss: 3, takeProfit: 9 },
            4: { smaFast: 8, smaSlow: 40, riskLevel: "low", stopLoss: 1.5, takeProfit: 4.5 },
            5: { smaFast: 15, smaSlow: 60, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
        }

        const params = mockParams[version] || mockParams[1]

        // Generate backtest data
        const backtestData = generateHistoricalBacktestData(days, version, params)
        const response = await fetch(`${BACKENT_SERVER_API}/api/backtest?version=${version}&strategyId=${strategyId}`);

        const backtestHistoryData = await response.json();


        // Create response with backtest data and metadata
        const data: BacktestResponse = {
            success: true,
            version: backtestHistoryData.version,
            date: backtestHistoryData.date,
            strategyId,
            timeframe,
            data: backtestHistoryData,
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error("Error processing historical backtest request:", error)
        return NextResponse.json(
            { success: false, error: "Failed to process historical backtest request" },
            { status: 500 },
        )
    }
}

