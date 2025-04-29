// Daily balance data point
export interface BacktestBalancePoint {
    date: string
    balance: number
    marketBalance: number
    trades: number
}

// Individual trade record
export interface BacktestTrade {
    day: number
    type: "buy" | "sell"
    result: "win" | "loss"
    profit: number
}

// Strategy parameters
export interface BacktestParameters {
    smaFast?: number
    smaSlow?: number
    riskLevel?: "low" | "medium" | "high"
    stopLoss?: number
    takeProfit?: number
    useTrailingStop?: boolean
    trailingStopDistance?: number
    tradeFrequency?: number
    winRate?: number

    [key: string]: any // Allow for additional parameters
}

// Performance metrics
export interface BacktestMetrics {
    strategyReturn: number
    marketReturn: number
    alpha: number
    maxDrawdown: number
    winRate: number
    sharpeRatio: number
    totalTrades: number
    profitFactor: number
}

// Monthly return data
export interface MonthlyReturnData {
    month: string
    strategyReturn: number
    marketReturn: number
}

// Return distribution data
export interface DistributionData {
    bin: string
    count: number
    binValue: number
}

// Main backtest data structure
export interface BacktestData {
    balances: BacktestBalancePoint[]
    trades: BacktestTrade[]
    params: BacktestParameters
    metrics?: BacktestMetrics
    monthlyReturns?: MonthlyReturnData[]
    returnDistribution?: DistributionData[]
}

// API response structure
export interface BacktestResponse {
    success: boolean
    version?: number
    date?: string
    strategyId?: string
    timeframe?: string
    data?: BacktestData
    error?: string
}

// Comparison response structure
export interface ComparisonRunData {
    version: number
    date: string
    data: {
        balances: BacktestBalancePoint[]
        trades: BacktestTrade[]
    }
    metrics: BacktestMetrics
    params: BacktestParameters
}

export interface ComparisonResponse {
    success: boolean
    comparisonData: ComparisonRunData[]
    error?: string
}

// Run history item
export interface BacktestRunHistoryItem {
    id: number
    date: string
    version: number
    result: string
    marketDetails?: MarketDetails
}

export interface MarketDetails {
    initialCapital: number,
    pairs: string,
    positionType: string,
    subType: string,
    timeframe: string,
}

// Run history response
export interface BacktestRunHistoryResponse {
    success: boolean
    history: BacktestRunHistoryItem[]
    error?: string
}



export interface StrategyRunBacktestRequest {
    strategyId: number
    type: string
    subType?: string
    params: Record<string, any>,
    timeframe: string
}

export interface StrategyRunHistory {
    id: string
    startTime: Date,
    endTime: Date,
    parameters: Record<string, any>,
    performance: BacktestMetrics,
    marketDetails: Record<string, any>,
    duration: string
    status: string
}

export interface StrategyRunHistoryResponse {
    historys: StrategyRunHistory[]
}

export interface StrategyRunComparison {
    runId: number,
    labRunHistory: StrategyRunHistory,
    backtestData: BacktestData,
}