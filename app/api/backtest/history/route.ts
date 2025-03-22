import { NextResponse } from "next/server"
import { BacktestRunHistoryItem, BacktestRunHistoryResponse } from "@/lib/api/backtest/types"

// Simulate a delay for API response
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock backtest run history
const backtestRunHistory: BacktestRunHistoryItem[] = [
    { id: 1, date: "2025-03-18T09:30:00", version: 1, parameters: { smaFast: 10, smaSlow: 50, riskLevel: "medium" } },
    { id: 2, date: "2025-03-17T14:45:00", version: 2, parameters: { smaFast: 12, smaSlow: 50, riskLevel: "medium" } },
    { id: 3, date: "2025-03-15T11:20:00", version: 3, parameters: { smaFast: 10, smaSlow: 45, riskLevel: "high" } },
    { id: 4, date: "2025-03-10T16:15:00", version: 4, parameters: { smaFast: 8, smaSlow: 40, riskLevel: "low" } },
    { id: 5, date: "2025-03-05T10:00:00", version: 5, parameters: { smaFast: 15, smaSlow: 60, riskLevel: "medium" } },
]

export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url)
        const strategyId = url.searchParams.get("strategyId") || "1"

        // Simulate API processing time
        await delay(500)

        // Filter history by strategy ID if needed
        // In a real implementation, you would query a database
        const filteredHistory = backtestRunHistory

        // Create response
        const response: BacktestRunHistoryResponse = {
            success: true,
            history: filteredHistory,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error fetching backtest history:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch backtest history", history: [] },
            { status: 500 },
        )
    }
}

// Add a new run to history
export async function POST(request: Request) {
    try {
        // Parse request body
        const body = await request.json()
        const { version, date, parameters, strategyId } = body

        // Simulate API processing time
        await delay(300)

        // Create new history item
        const newItem: BacktestRunHistoryItem = {
            id: backtestRunHistory.length + 1,
            date: date || new Date().toISOString(),
            version,
            parameters,
        }

        // Add to history (in a real implementation, you would save to a database)
        backtestRunHistory.unshift(newItem)

        // Create response
        const response = {
            success: true,
            item: newItem,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error("Error adding backtest to history:", error)
        return NextResponse.json({ success: false, error: "Failed to add backtest to history" }, { status: 500 })
    }
}

