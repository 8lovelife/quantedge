import { NextResponse } from "next/server"
import type { PortfolioData } from "@/lib/types"

// Mock data for API endpoint
const portfolioData: PortfolioData[] = [
  { date: "Feb 8", value: 21500 },
  { date: "Feb 15", value: 22100 },
  { date: "Feb 22", value: 21800 },
  { date: "Mar 1", value: 23200 },
  { date: "Mar 8", value: 24685 },
]

export async function GET() {
  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Query your database for the user's portfolio history
  // 3. Process the data
  // 4. Return the response

  return NextResponse.json(portfolioData)
}