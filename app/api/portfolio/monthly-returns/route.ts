import { NextResponse } from "next/server"
import type { MonthlyReturn } from "@/lib/types"

// Mock data for API endpoint
const monthlyReturns: MonthlyReturn[] = [
  { month: "Jan", return: 3.2 },
  { month: "Feb", return: -1.7 },
  { month: "Mar", return: 5.4 },
  { month: "Apr", return: 2.1 },
  { month: "May", return: -0.8 },
  { month: "Jun", return: 4.3 },
  { month: "Jul", return: 6.2 },
  { month: "Aug", return: -2.5 },
  { month: "Sep", return: 1.9 },
  { month: "Oct", return: 3.7 },
  { month: "Nov", return: -1.2 },
  { month: "Dec", return: 4.8 },
]

export async function GET(request: Request) {
  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Query your database for the user's monthly returns
  // 3. Process the data
  // 4. Return the response

  const { searchParams } = new URL(request.url)
  const strategy = searchParams.get("strategy") || "all"

  // In a real implementation, you would filter based on strategy
  // For now, we'll just return the same data for all strategies

  return NextResponse.json(monthlyReturns)
}

