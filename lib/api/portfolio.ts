import type { PortfolioData, AssetData } from "@/lib/types"

// Mock data for frontend development
const mockPortfolioData: PortfolioData[] = [
  { date: "Feb 8", value: 21500 },
  { date: "Feb 15", value: 22100 },
  { date: "Feb 22", value: 21800 },
  { date: "Mar 1", value: 23200 },
  { date: "Mar 8", value: 24685 },
]

const mockAssetData: AssetData[] = [
  { name: "BTC", value: 45, fill: "var(--color-btc)" },
  { name: "ETH", value: 30, fill: "var(--color-eth)" },
  { name: "SOL", value: 15, fill: "var(--color-sol)" },
  { name: "Others", value: 10, fill: "var(--color-others)" },
]

// This function will be replaced with actual API call
export async function fetchPortfolioPerformance(): Promise<PortfolioData[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch('/api/portfolio/performance')
  // const data = await response.json()
  // return data

  return mockPortfolioData
}

// This function will be replaced with actual API call
export async function fetchAssetAllocation(): Promise<AssetData[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch('/api/portfolio/allocation')
  // const data = await response.json()
  // return data

  return mockAssetData
}

