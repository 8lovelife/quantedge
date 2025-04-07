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

// Define an interface for asset with allocation
export interface AssetWithAllocation {
    symbol: string
    allocation: number
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

