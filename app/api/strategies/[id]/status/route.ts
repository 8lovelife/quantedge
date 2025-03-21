import { NextResponse } from "next/server"
import { mockUpdateStrategyStatus } from "@/lib/api/strategies/mock"


const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

// PATCH handler for updating a strategy's status
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {

    const id = Number.parseInt((await params).id)
    const { status } = await request.json()

    if (status !== "active" && status !== "paused") {
      return NextResponse.json(
        { success: false, error: "Invalid status. Must be 'active' or 'paused'" },
        { status: 400 },
      )
    }

    const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/${id}/status`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status }),
    })
    return NextResponse.json(response)
  } catch (error) {
    console.error("Error updating strategy status:", error)
    return NextResponse.json({ success: false, error: "Failed to update strategy status" }, { status: 500 })
  }
}

