// Dashboard Types
export interface DashboardData {
  portfolioValue: number
  portfolioChange: number
  activeStrategies: number
  strategiesChange: number
  monthlyProfit: number
  profitChange: number
  winRate: number
  winRateChange: number
}

// Market Types
export interface MarketData {
  name: string
  price: number
  change: number
  volume: string
  marketCap: string
  sparkline: { price: number }[]
}

export interface PriceData {
  date: string
  price: number
}

export interface PriceParams {
  params: {
    symbol: string
  }
}

export interface PriceResponse {
  prices: PriceData[]
  currentPrice: number
  change: {
    value: number
    percentage: number
  }
}

// Portfolio Types
export interface StrategyPerformance {
  date: string
  totalValue: number
  invested: number
  profit: number
}

export interface PortfolioData {
  date: string
  value: number
}

export interface AssetData {
  name: string
  value: number
  fill: string
}

// Monthly Returns
export interface MonthlyReturn {
  month: string
  return: number
}

// Benchmark Comparison
export interface BenchmarkData {
  date: string
  portfolio: number
  btc: number
  sp500: number
}

// Strategy Types
export interface Strategy {
  id: number
  name: string
  description: string
  status: "active" | "paused"
  performance: number
  allocation: number
  risk: "low" | "medium" | "high"
}

// Trade Types
export interface Trade {
  id: string
  strategy: string
  type: "buy" | "sell"
  asset: string
  amount: number
  price: number
  timestamp: string
  status: "completed" | "pending" | "failed"
  profit: number | null
}

// Pagination Types
export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

