import { NextResponse } from "next/server"
import type { BenchmarkData } from "@/lib/types"

// Mock data for API endpoint
const benchmarkData: BenchmarkData[] = [
  { date: "Jan '23", portfolio: 0, btc: 0, sp500: 0 },
  { date: "Feb '23", portfolio: 2.1, btc: 3.5, sp500: 1.8 },
  { date: "Mar '23", portfolio: 3.8, btc: 5.2, sp500: 2.5 },
  { date: "Apr '23", portfolio: 5.2, btc: 4.1, sp500: 3.7 },
  { date: "May '23", portfolio: 6.7, btc: 8.3, sp500: 4.2 },
  { date: "Jun '23", portfolio: 8.3, btc: 7.5, sp500: 5.8 },
  { date: "Jul '23", portfolio: 10.5, btc: 12.7, sp500: 6.9 },
  { date: "Aug '23", portfolio: 12.1, btc: 10.2, sp500: 8.3 },
  { date: "Sep '23", portfolio: 14.3, btc: 15.8, sp500: 9.5 },
  { date: "Oct '23", portfolio: 16.7, btc: 18.3, sp500: 10.8 },
  { date: "Nov '23", portfolio: 18.2, btc: 20.5, sp500: 12.1 },
  { date: "Dec '23", portfolio: 20.5, btc: 22.7, sp500: 13.5 },
  { date: "Jan '24", portfolio: 22.8, btc: 24.9, sp500: 14.8 },
]

export async function GET(request: Request) {
  // In a real implementation, you would:
  // 1. Authenticate the user
  // 2. Query your database for benchmark comparison data
  // 3. Process the data
  // 4. Return the response

  const { searchParams } = new URL(request.url)
  const strategy = searchParams.get("strategy") || "all"

  // In a real implementation, you would filter based on strategy
  // For now, we'll just return the same data for all strategies

  return NextResponse.json(benchmarkData)
}

