import { NextResponse } from "next/server";

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

// PUT handler for updating a strategy
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = Number.parseInt((await params).id)
        const req: Number = await request.json()

        // const response = await mockUpdateStrategy(id, data)

        const response = await fetch(`${BACKENT_SERVER_API}/api/strategies/run/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(req),
        })

        if (!response.ok) throw new Error(`API Error: ${response.status}`);

        return NextResponse.json({
            success: true,
        })
    } catch (error) {
        console.error("Error updating strategy run:", error)
        return NextResponse.json({ success: false, error: "Failed to update strategy run" }, { status: 500 })
    }
}