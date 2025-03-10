import { NextResponse } from "next/server"

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = Number.parseInt((await params).id)
  const body = await request.json()

  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Validate the request body
  // 3. Update the strategy status in your database
  // 4. Return the updated strategy

  return NextResponse.json({ id, status: body.status })
}