import type { StrategyPerformance, AssetData } from "@/lib/types"

// Mock data for frontend development
const mockPortfolioData: Record<string, StrategyPerformance[]> = {
  all: generatePerformanceData(100000, 120000),
  conservative: generatePerformanceData(100000, 110000),
  balanced: generatePerformanceData(100000, 115000),
  aggressive: generatePerformanceData(100000, 125000),
  custom: generatePerformanceData(100000, 118000),
}

const mockAssetData: Record<string, AssetData[]> = {
  all: [
    { name: "BTC", value: 40, fill: "var(--color-btc)" },
    { name: "ETH", value: 30, fill: "var(--color-eth)" },
    { name: "SOL", value: 15, fill: "var(--color-sol)" },
    { name: "Others", value: 15, fill: "var(--color-others)" },
  ],
  conservative: [
    { name: "BTC", value: 20, fill: "var(--color-btc)" },
    { name: "ETH", value: 15, fill: "var(--color-eth)" },
    { name: "Bonds", value: 50, fill: "var(--color-bonds)" },
    { name: "Others", value: 15, fill: "var(--color-others)" },
  ],
  balanced: [
    { name: "BTC", value: 30, fill: "var(--color-btc)" },
    { name: "ETH", value: 25, fill: "var(--color-eth)" },
    { name: "SOL", value: 10, fill: "var(--color-sol)" },
    { name: "Bonds", value: 25, fill: "var(--color-bonds)" },
    { name: "Others", value: 10, fill: "var(--color-others)" },
  ],
  aggressive: [
    { name: "BTC", value: 45, fill: "var(--color-btc)" },
    { name: "ETH", value: 35, fill: "var(--color-eth)" },
    { name: "SOL", value: 15, fill: "var(--color-sol)" },
    { name: "Others", value: 5, fill: "var(--color-others)" },
  ],
  custom: [
    { name: "BTC", value: 35, fill: "var(--color-btc)" },
    { name: "ETH", value: 25, fill: "var(--color-eth)" },
    { name: "SOL", value: 20, fill: "var(--color-sol)" },
    { name: "LINK", value: 10, fill: "var(--color-link)" },
    { name: "Others", value: 10, fill: "var(--color-others)" },
  ],
}

function generatePerformanceData(startValue: number, endValue: number): StrategyPerformance[] {
  const data: StrategyPerformance[] = []
  const now = new Date()
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
    const progress = 1 - i / 30
    const totalValue = startValue + progress * (endValue - startValue) + Math.random() * 1000 - 500
    const invested = startValue + progress * (endValue - startValue) * 0.8
    const profit = totalValue - invested
    data.push({
      date: date.toISOString().split("T")[0],
      totalValue,
      invested,
      profit,
    })
  }
  return data
}

export async function fetchPortfolioPerformance(strategy: string): Promise<StrategyPerformance[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch(`/api/portfolio/performance?strategy=${strategy}`)
  // const data = await response.json()
  // return data

  return mockPortfolioData[strategy] || mockPortfolioData["all"]
}

export async function fetchAssetAllocation(strategy: string): Promise<AssetData[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch(`/api/portfolio/allocation?strategy=${strategy}`)
  // const data = await response.json()
  // return data

  return mockAssetData[strategy] || mockAssetData["all"]
}