import { NextRequest, NextResponse } from "next/server"
import { mockFetchTradingStrategies, mockCreateStrategy } from "@/lib/api/strategies/mock"
import type { StrategyFormValues } from "@/lib/api/strategies/types"
const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API


export async function GET(request: NextRequest) {
  try {
    // Get URL parameters

    const token = request.cookies.get("session_id")?.value
    const { searchParams } = new URL(request.url)
    const apiUrl = `${BACKENT_SERVER_API}/api/strategies?${searchParams.toString()}`
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        Cookie: `session_id=${token}`
      },
    })

    if (response.status === 401) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const result = await response.json()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching strategies:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch strategies" }, { status: 500 })
  }
}
// GET handler for fetching strategies with pagination
// export async function GET(request: Request) {
//   try {
//     // Get URL parameters
//     const url = new URL(request.url)
//     const page = Number.parseInt(url.searchParams.get("page") || "1")
//     const limit = Number.parseInt(url.searchParams.get("limit") || "6")

//     const urlS = `${BACKENT_SERVER_API}/api/strategies?page=${page}&limit=${limit}`
//     const response = await fetch(urlS)

//     // Fetch strategies
//     // const strategiesResponse = await mockFetchTradingStrategies(page, limit)

//     const strategies = await response.json();
//     const transformStrategies = strategies.data.map((strategy, index) => ({
//       id: strategy.id,
//       name: strategy.name,
//       description: strategy.description,
//       status: strategy.status,
//       allocation: strategy.allocation,
//       risk: strategy.risk,
//       algorithm: strategy.algorithm,
//       timeframe: strategy.timeframe,
//       latestVersion: strategy.latestVersion,
//       assets: strategy.assets,
//       parameters: JSON.parse(strategy.parameters) // Convert JSON string to object
//     }));

//     const strategiesResponse = {
//       items: transformStrategies,
//       totalPages: Math.ceil(strategies.data / limit),
//       currentPage: page,
//       totalItems: strategies.total,
//     }
//     return NextResponse.json(strategiesResponse)
//   } catch (error) {
//     console.error("Error fetching strategies:", error)
//     return NextResponse.json({ success: false, error: "Failed to fetch strategies" }, { status: 500 })
//   }
// }

// POST handler for creating a new strategy
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("session_id")?.value
    const req: StrategyFormValues = await request.json()
    console.log("req -> " + JSON.stringify(req))
    const response = await fetch(`${BACKENT_SERVER_API}/api/strategies`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Cookie: `session_id=${token}` },
      body: JSON.stringify(req),
    });
    if (response.status === 401) {
      return new Response("Unauthorized", { status: 401 })
    }
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

