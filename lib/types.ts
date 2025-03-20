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
  algorithm?: string
  timeframe?: string
  assets?: string
  parameters?: any
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


export interface OrderBookData {
  depthData: {
    price: number
    bidVolume: number
    askVolume: number
  }[]
  bidWall: {
    price: number
    volume: number
  }
  askWall: {
    price: number
    volume: number
  }
}


export interface TradeResult {
  day: number; // The day of the trade in the backtest
  type: "buy" | "sell"; // Trade type
  result: "win" | "loss"; // Trade outcome
  profit: number; // Profit or loss in USD
}

export interface StrategyParams {
  smaFast: number; // Fast moving average period
  smaSlow: number; // Slow moving average period
  riskLevel: "low" | "medium" | "high"; // Risk level setting
  stopLoss: number; // Stop-loss percentage
  takeProfit: number; // Take-profit percentage
  useTrailingStop: boolean; // Whether trailing stop is enabled
  trailingStopDistance: number; // Distance for trailing stop
}


export interface DailyPerformance {
  date: string; // ISO date string
  balance: number; // Total account balance
  marketBalance: number; // Market exposure
  trades: number; // Number of trades executed that day
};


export interface BacktestReport {
  dailyPerformance: DailyPerformance[]; // Daily balance & trades
  trades: TradeResult[]; // Individual trades
  params: StrategyParams; // Strategy configuration
}