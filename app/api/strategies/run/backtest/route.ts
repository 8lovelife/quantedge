import { BacktestResponse } from "@/lib/api/backtest/types"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
    try {

        const token = request.cookies.get("session_id")?.value
        const { searchParams } = new URL(request.url)
        const apiUrl = `http://127.0.0.1:3001/api/strategies/run/backtest?${searchParams.toString()}`
        const response = await fetch(apiUrl, {
            method: "GET",
            headers: {
                Cookie: `session_id=${token}`
            },
        })

        if (response.status === 401) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (response.status === 404) {
            return NextResponse.json({
                success: true,
                data: null,
                error: "Backtest not found",
            })
        }
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`)
        }

        const data = await response.json()
        const result: BacktestResponse = {
            success: true,
            version: data.version,
            date: data.date,
            data: data,
        }
        return NextResponse.json(result)
    } catch (error) {
        console.error("Error fetching strategies backtest:", error)
        return NextResponse.json({ success: false, error: "Failed to fetch strategies backtest" }, { status: 500 })
    }
}