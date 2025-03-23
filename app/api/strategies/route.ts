import { NextResponse } from "next/server"
import { mockFetchTradingStrategies, mockCreateStrategy } from "@/lib/api/strategies/mock"
import type { StrategyFormValues } from "@/lib/api/strategies/types"


// GET handler for fetching strategies with pagination
export async function GET(request: Request) {
  try {
    // Get URL parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const limit = Number.parseInt(url.searchParams.get("limit") || "6")

    const urlS = `http://127.0.0.1:3001/api/strategies?page=${page}&limit=${limit}`
    const response = await fetch(urlS)

    // Fetch strategies
    // const strategiesResponse = await mockFetchTradingStrategies(page, limit)

    const strategies = await response.json();
    const transformStrategies = strategies.data.map((strategy, index) => ({
      id: strategy.id,
      name: strategy.name,
      description: strategy.description,
      status: strategy.status,
      allocation: strategy.allocation,
      risk: strategy.risk,
      algorithm: strategy.algorithm,
      timeframe: strategy.timeframe,
      latestVersion: strategy.latestVersion,
      assets: strategy.assets,
      parameters: JSON.parse(strategy.parameters) // Convert JSON string to object
    }));

    const strategiesResponse = {
      items: transformStrategies,
      totalPages: Math.ceil(strategies.data / limit),
      currentPage: page,
      totalItems: strategies.total,
    }
    return NextResponse.json(strategiesResponse)
  } catch (error) {
    console.error("Error fetching strategies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch strategies" }, { status: 500 })
  }
}

// POST handler for creating a new strategy
export async function POST(request: Request) {
  try {
    const req: StrategyFormValues = await request.json()
    const response = await fetch("http://localhost:3001/api/strategies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    console.log(response)
    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    data.parameters = JSON.parse(data.parameters) // Convert JSON string to object

    return NextResponse.json({
      success: true,
      strategy: data,
    })
  } catch (error) {
    console.error("Error creating strategy:", error)
    return NextResponse.json({ success: false, error: "Failed to create strategy" }, { status: 500 })
  }
}

