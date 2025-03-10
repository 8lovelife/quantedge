import type { DashboardData } from "@/lib/types"

// Mock data for frontend development
const mockDashboardData: DashboardData = {
  portfolioValue: 24685.93,
  portfolioChange: 3.2,
  activeStrategies: 7,
  strategiesChange: 2,
  monthlyProfit: 1294.32,
  profitChange: -1.8,
  winRate: 68.3,
  winRateChange: 2.1,
}

// This function will be replaced with actual API call
export async function fetchDashboardData(): Promise<DashboardData> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch('/api/dashboard')
  // const data = await response.json()
  // return data

  return mockDashboardData
}