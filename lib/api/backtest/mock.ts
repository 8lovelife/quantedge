// Mock data generation for backtest API
import type { BacktestResponse, ComparisonResponse, BacktestData, BacktestParameters, MonthlyReturnData, DistributionData } from "./types"

// Add these helper functions after existing imports
function generateMonthlyReturns(days: number): MonthlyReturnData[] {
    const monthlyReturns: MonthlyReturnData[] = []
    const date = new Date()
    date.setDate(date.getDate() - days)

    // Get unique months from the date range
    const months = new Set<string>()
    for (let i = 0; i < days; i++) {
        const currentDate = new Date(date)
        currentDate.setDate(date.getDate() + i)
        months.add(currentDate.toISOString().slice(0, 7)) // Format: YYYY-MM
    }

    // Generate returns for each month
    Array.from(months).forEach(month => {
        // Generate realistic returns between -10% and +10%
        const strategyReturn = (Math.random() * 20 - 10) + Math.sin(new Date(month).getMonth() * 0.5) * 3
        const marketReturn = (Math.random() * 16 - 8) + Math.sin(new Date(month).getMonth() * 0.5) * 2

        monthlyReturns.push({
            month,
            strategyReturn: Number(strategyReturn.toFixed(2)),
            marketReturn: Number(marketReturn.toFixed(2))
        })
    })

    return monthlyReturns.sort((a, b) => a.month.localeCompare(b.month))
}

function generateDistributionData(trades: any[]): DistributionData[] {
    // Define return ranges
    const bins = [
        { min: -Infinity, max: -20, label: "< -20%" },
        { min: -20, max: -15, label: "-20% to -15%" },
        { min: -15, max: -10, label: "-15% to -10%" },
        { min: -10, max: -5, label: "-10% to -5%" },
        { min: -5, max: 0, label: "-5% to 0%" },
        { min: 0, max: 5, label: "0% to 5%" },
        { min: 5, max: 10, label: "5% to 10%" },
        { min: 10, max: 15, label: "10% to 15%" },
        { min: 15, max: 20, label: "15% to 20%" },
        { min: 20, max: Infinity, label: "> 20%" }
    ]

    // Initialize distribution data
    const distribution: DistributionData[] = bins.map(bin => ({
        bin: bin.label,
        count: 0,
        binValue: (bin.min + bin.max) / 2
    }))

    // Count trades in each bin
    trades.forEach(trade => {
        const returnPercentage = (trade.profit / 10000) * 100 // Assuming initial balance of 10000
        const binIndex = bins.findIndex(bin =>
            returnPercentage > bin.min && returnPercentage <= bin.max
        )
        if (binIndex >= 0) {
            distribution[binIndex].count++
        }
    })

    return distribution
}

// Simulate a delay for API response
export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock backtest run history
export const backtestRunHistory = [
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

// Generate historical backtest data with a fixed seed for consistency
export const generateHistoricalBacktestData = (
    days = 180,
    version = 1,
    params: BacktestParameters = {},
): BacktestData => {
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
    const baseWinRate = params.winRate || (params.riskLevel === "high" ? 0.55 : params.riskLevel === "low" ? 0.65 : 0.6)

    // Generate trades based on parameters
    for (let i = 0; i < tradeFrequency; i++) {
        const tradeDay = Math.floor(Math.random() * days)
        const isWin = Math.random() < baseWinRate

        // Calculate profit based on parameters
        const profitFactor = params.takeProfit / params.stopLoss || 1.5
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
        monthlyReturns: generateMonthlyReturns(days),
        returnDistribution: generateDistributionData(trades)
    }
}

// Mock function to run a backtest
export const mockRunBacktest = async (
    params: BacktestParameters,
    timeframe: string,
    strategyId: string,
): Promise<BacktestResponse> => {
    // Simulate API processing time
    await delay(2000)

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

    // Create response
    return {
        success: true,
        version: version,
        date: new Date().toISOString(),
        strategyId,
        timeframe,
        data: backtestData,
    }
}

// Mock function to get historical backtest data
export const mockGetHistoricalBacktest = async (
    version: number,
    timeframe: string,
    strategyId: string,
): Promise<BacktestResponse> => {
    // Simulate API processing time
    await delay(1000)

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

    // Get parameters from mock database based on version
    const mockParams = {
        1: { smaFast: 10, smaSlow: 50, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
        2: { smaFast: 12, smaSlow: 50, riskLevel: "medium", stopLoss: 2.5, takeProfit: 7 },
        3: { smaFast: 10, smaSlow: 45, riskLevel: "high", stopLoss: 3, takeProfit: 9 },
        4: { smaFast: 8, smaSlow: 40, riskLevel: "low", stopLoss: 1.5, takeProfit: 4.5 },
        5: { smaFast: 15, smaSlow: 60, riskLevel: "medium", stopLoss: 2, takeProfit: 6 },
    }

    const params = mockParams[version as keyof typeof mockParams] || mockParams[1]

    // Generate backtest data
    // const backtestData = generateHistoricalBacktestData(days, version, params)

    // Create response
    return {
        success: true,
        version: version,
        date: new Date().toISOString(),
        strategyId,
        timeframe,
    }
}

// Mock function to compare multiple backtest runs
// export const mockCompareBacktests = async (
//     versions: number[],
//     timeframe: string,
//     strategyId: string,
// ): Promise<ComparisonResponse> => {
//     // Simulate API processing time
//     await delay(1500)

//     // Ensure we have at least 2 versions to compare
//     if (!versions || versions.length < 2) {
//         versions = [1, 2] // Default to versions 1 and 2
//     }

//     // Generate comparison data for requested versions
//     const comparisonData = versions.map((version) => {
//         const days =
//             timeframe === "1m" ? 30 : timeframe === "3m" ? 90 : timeframe === "6m" ? 180 : timeframe === "1y" ? 365 : 730

//         const runData = generateHistoricalBacktestData(days, version)
//         const runInfo = backtestRunHistory.find((r) => r.version === version) || {
//             date: new Date().toISOString(),
//             version,
//         }

//         return {
//             version,
//             date: runInfo.date,
//             data: {
//                 data: runData.balances,
//                 trades: runData.trades,
//             },
//             metrics: runData.metrics!,
//             params: runData.params,
//         }
//     })

//     // Create response
//     return {
//         success: true,
//         comparisonData,
//     }
// }

