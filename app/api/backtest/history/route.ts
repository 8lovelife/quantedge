import { NextResponse } from "next/server"
import { BacktestRunHistoryItem, BacktestRunHistoryResponse } from "@/lib/api/backtest/types"

// Simulate a delay for API response
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock backtest run history
const backtestRunHistory: BacktestRunHistoryItem[] = [
    { id: 10, date: "2025-03-18T09:30:00", version: 10 },
    { id: 2, date: "2025-03-17T14:45:00", version: 2 },
    { id: 3, date: "2025-03-15T11:20:00", version: 3 },
    { id: 4, date: "2025-03-10T16:15:00", version: 4 },
    { id: 5, date: "2025-03-05T10:00:00", version: 5 },
]

export async function GET(request: Request) {
    try {
        // Get URL parameters
        const url = new URL(request.url)
        const strategyId = url.searchParams.get("strategyId") || "1"

        // Simulate API processing time
        // await delay(500)

        // Filter history by strategy ID if needed
        // In a real implementation, you would query a database
        // const filteredHistory = backtestRunHistory

        const urlS = `http://127.0.0.1:3001/api/backtest/history?strategyId=123`
        const results = await fetch(urlS)

        // Fetch strategies
        // const strategiesResponse = await mockFetchTradingStrategies(page, limit)

        const runHistories = await results.json();

        const backtestRunHistories = runHistories.map((run, index) => ({
            id: run.id,
            date: run.startDate,
            version: run.id,
        }));

        // Create response
        const response: BacktestRunHistoryResponse = {
            success: true,
            history: backtestRunHistories,
        }

        console.log(response)

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

