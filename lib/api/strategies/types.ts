export interface Strategy {
    id: number
    name: string
    description: string
    status: "active" | "paused"
    performance: number
    allocation: number
    risk: "low" | "medium" | "high"
    algorithm: string
    timeframe: string
    latestVersion: number
    assets: string
    parameters?: Record<string, any>
}

export interface StrategySummary {
    id: number
    name: string
    type: string
    status: "draft" | "backtest" | "paper" | "live"
    description: string
    created: string
    updated: string
    backtestPerformance: {
        strategyReturn: number
        maxDrawdown: number
        winRate: number
    } | null
    alerts?: Array<{ type: string; message: string }>
    isIncomplete: boolean
}


export interface StrategiySummarysResponse {
    items: StrategySummary[]
    total: number
    totalPages: number
}

export interface FetchStrategySummaryParams {
    page?: number
    limit?: number
    search?: string
    status?: string
    sort?: string
}

// Define an interface for asset with allocation
export interface AssetWithAllocation {
    symbol: string
    weight: number
    direction: string
    exchange?: string
}

export interface AssetAllocationData {

    symbol: string
    direction: "long" | "short" | "both"
    weight: number

}

export interface StrategyFormValues {
    name: string
    description: string
    algorithm: string
    risk: "low" | "medium" | "high"
    allocation: number
    timeframe: string
    assets: AssetWithAllocation[]
    status?: "active" | "paused"
    parameters?: Record<string, any>
}

export interface StrategiesResponse {
    items: Strategy[]
    totalPages: number
    currentPage: number
    totalItems: number
}

export interface StrategyResponse {
    success: boolean
    strategy: Strategy
}


export interface StrategyDetail {
    id: number
    name: string
    type: string
    status: "draft" | "backtest" | "paper" | "live"
    created: string
    updated: string
    description: string
    performance?: Record<string, any>
    configuration?: {
        parameters?: Record<string, any>
        assets?: Record<string, any>[]
        timeframe?: string
        riskManagement?: Record<string, any>
    }
    trades?: any[]
    logs?: {
        timestamp: string
        level: string
        message: string
    }[]
}

