import { NextRequest, NextResponse } from "next/server"
import type { StrategyFormValues } from "@/lib/api/strategies/types"


const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

// PUT handler for updating a strategy
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }
) {
  try {
    const id = Number.parseInt((await params).id)
    const req: StrategyFormValues = await request.json()

    // const response = await mockUpdateStrategy(id, data)
    const token = request.cookies.get("session_id")?.value

    const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json", Cookie: `session_id=${token}`
      },
      body: JSON.stringify(req),
    })

    if (response.status === 401) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();

    return NextResponse.json({
      success: true,
      strategy: data,
    })
  } catch (error) {
    console.error("Error updating strategy:", error)
    return NextResponse.json({ success: false, error: "Failed to update strategy" }, { status: 500 })
  }
}

// DELETE handler for deleting a strategy
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const id = Number.parseInt((await params).id)
    const token = request.cookies.get("session_id")?.value
    const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/${id}`, {
      method: "DELETE",
      headers: {
        Cookie: `session_id=${token}`
      },
    })

    if (response.status === 401) {
      return new Response("Unauthorized", { status: 401 })
    }
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error deleting strategy:", error)
    return NextResponse.json({ success: false, error: "Failed to delete strategy" }, { status: 500 })
  }
}


export async function GET(request: NextRequest, { params }: { params: Promise<{ id: number }> }) {
  try {

    const token = request.cookies.get("session_id")?.value
    const id = (await params).id
    const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/details?id=${id}`, {
      method: "GET",
      headers: {
        Cookie: `session_id=${token}`
      },
    })

    if (response.status === 401) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (!response.ok) throw new Error(`API Error: ${response.status}`);
    const data = await response.json();
    console.log("Data:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating strategy:", error)
    return NextResponse.json({ success: false, error: "Failed to update strategy" }, { status: 500 })
  }
}

