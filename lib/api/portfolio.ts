import type { StrategyPerformance, AssetData, MonthlyReturn, BenchmarkData } from "@/lib/types"

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

// Mock data for monthly returns
const mockMonthlyReturns: Record<string, MonthlyReturn[]> = {
  all: [
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
  ],
  conservative: [
    { month: "Jan", return: 1.8 },
    { month: "Feb", return: -0.9 },
    { month: "Mar", return: 2.7 },
    { month: "Apr", return: 1.5 },
    { month: "May", return: -0.3 },
    { month: "Jun", return: 2.1 },
    { month: "Jul", return: 3.0 },
    { month: "Aug", return: -1.2 },
    { month: "Sep", return: 0.8 },
    { month: "Oct", return: 1.9 },
    { month: "Nov", return: -0.6 },
    { month: "Dec", return: 2.4 },
  ],
  balanced: [
    { month: "Jan", return: 2.5 },
    { month: "Feb", return: -1.3 },
    { month: "Mar", return: 3.8 },
    { month: "Apr", return: 1.7 },
    { month: "May", return: -0.5 },
    { month: "Jun", return: 3.2 },
    { month: "Jul", return: 4.5 },
    { month: "Aug", return: -1.8 },
    { month: "Sep", return: 1.4 },
    { month: "Oct", return: 2.8 },
    { month: "Nov", return: -0.9 },
    { month: "Dec", return: 3.6 },
  ],
  aggressive: [
    { month: "Jan", return: 4.7 },
    { month: "Feb", return: -2.5 },
    { month: "Mar", return: 7.2 },
    { month: "Apr", return: 3.4 },
    { month: "May", return: -1.2 },
    { month: "Jun", return: 5.8 },
    { month: "Jul", return: 8.3 },
    { month: "Aug", return: -3.7 },
    { month: "Sep", return: 2.9 },
    { month: "Oct", return: 5.1 },
    { month: "Nov", return: -1.8 },
    { month: "Dec", return: 6.4 },
  ],
  custom: [
    { month: "Jan", return: 3.9 },
    { month: "Feb", return: -2.1 },
    { month: "Mar", return: 6.3 },
    { month: "Apr", return: 2.8 },
    { month: "May", return: -1.0 },
    { month: "Jun", return: 4.9 },
    { month: "Jul", return: 7.1 },
    { month: "Aug", return: -3.2 },
    { month: "Sep", return: 2.4 },
    { month: "Oct", return: 4.3 },
    { month: "Nov", return: -1.5 },
    { month: "Dec", return: 5.7 },
  ],
}

// Mock data for benchmark comparison
const mockBenchmarkData: Record<string, BenchmarkData[]> = {
  all: generateBenchmarkData(20, 25, 15),
  conservative: generateBenchmarkData(12, 25, 15),
  balanced: generateBenchmarkData(18, 25, 15),
  aggressive: generateBenchmarkData(24, 25, 15),
  custom: generateBenchmarkData(22, 25, 15),
}

function generateBenchmarkData(portfolioMax: number, btcMax: number, sp500Max: number): BenchmarkData[] {
  const data: BenchmarkData[] = []
  const now = new Date()

  for (let i = 12; i >= 0; i--) {
    const date = new Date(now)
    date.setMonth(date.getMonth() - i)

    // Generate cumulative returns that show relative performance
    const progress = (12 - i) / 12
    const portfolioReturn = progress * portfolioMax * (0.8 + Math.random() * 0.4)
    const btcReturn = progress * btcMax * (0.7 + Math.random() * 0.6)
    const sp500Return = progress * sp500Max * (0.9 + Math.random() * 0.2)

    // Format date explicitly in English to avoid localization issues
    const formattedDate = date.toLocaleString("en-US", { month: "short", year: "2-digit" })

    data.push({
      date: formattedDate,
      portfolio: Number(portfolioReturn.toFixed(1)),
      btc: Number(btcReturn.toFixed(1)),
      sp500: Number(sp500Return.toFixed(1)),
    })
  }

  return data
}

export async function fetchMonthlyReturns(strategy: string): Promise<MonthlyReturn[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch(`/api/portfolio/monthly-returns?strategy=${strategy}`);
  // const data = await response.json();
  // return data;

  return mockMonthlyReturns[strategy] || mockMonthlyReturns["all"]
}

export async function fetchBenchmarkComparison(strategy: string): Promise<BenchmarkData[]> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In production, this would be:
  // const response = await fetch(`/api/portfolio/benchmark?strategy=${strategy}`);
  // const data = await response.json();
  // return data;

  return mockBenchmarkData[strategy] || mockBenchmarkData["all"]
}

