import { NextResponse } from "next/server"

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

// Generate simple mock data for a backtest run
const generateMockBacktestData = (version = 1) => {
    const days = 30 // Keep data small for testing
    const data = []
    let balance = 10000 + version * 500
    let marketBalance = 10000

    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Generate simple data points
    for (let i = 0; i < days; i++) {
        const currentDate = new Date(startDate)
        currentDate.setDate(startDate.getDate() + i)

        // Simple deterministic changes
        balance = balance * (1 + Math.sin(i * 0.1) * 0.01 + version * 0.001)
        marketBalance = marketBalance * (1 + Math.sin(i * 0.1) * 0.005)

        data.push({
            date: currentDate.toISOString().split("T")[0],
            balance: Math.round(balance * 100) / 100,
            marketBalance: Math.round(marketBalance * 100) / 100,
            trades: i % 5 === 0 ? 1 : 0, // Add a trade every 5 days
        })
    }

    // Simple metrics
    const metrics = {
        strategyReturn: (((data[data.length - 1].balance - data[0].balance) / data[0].balance) * 100).toFixed(2),
        marketReturn: (
            ((data[data.length - 1].marketBalance - data[0].marketBalance) / data[0].marketBalance) *
            100
        ).toFixed(2),
        alpha:
            ((data[data.length - 1].balance - data[0].balance) / data[0].balance -
                (data[data.length - 1].marketBalance - data[0].marketBalance) / data[0].marketBalance) *
            100,
        maxDrawdown: (5 + version).toFixed(2),
        winRate: (50 + version * 5).toFixed(2),
        sharpeRatio: (1 + version * 0.2).toFixed(2),
        totalTrades: 6,
    }

    // Find the run parameters
    const params = backtestRunHistory.find((run) => run.version === version)?.parameters || {
        smaFast: 10,
        smaSlow: 50,
        riskLevel: "medium",
        stopLoss: 2,
        takeProfit: 6,
    }

    return {
        data,
        metrics,
        params,
        trades: [
            { day: 5, type: "buy", result: "win", profit: 100 + version * 10 },
            { day: 10, type: "sell", result: "loss", profit: -50 - version * 5 },
            { day: 15, type: "buy", result: "win", profit: 150 + version * 15 },
            { day: 20, type: "sell", result: "win", profit: 120 + version * 10 },
            { day: 25, type: "buy", result: "loss", profit: -80 - version * 8 },
        ],
    }
}

export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url)
        const versionsParam = url.searchParams.get("versions")
        let versions = versionsParam ? versionsParam.split(",").map((v) => Number.parseInt(v, 10)) : []

        console.log("Received comparison request with versions:", versions)

        // Always ensure we have at least 2 versions to compare
        if (versions.length < 2) {
            console.log("Not enough versions provided, using default versions 1 and 2")
            versions = [1, 2]
        }

        // Generate comparison data for requested versions
        const comparisonData = versions.map((version) => {
            const runData = generateMockBacktestData(version)
            const runInfo = backtestRunHistory.find((r) => r.version === version) || {
                date: new Date().toISOString(),
                version,
            }

            return {
                version,
                date: runInfo.date,
                data: {
                    data: runData.data,
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

