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
    assets: string
    parameters?: Record<string, any>
}

export interface StrategyFormValues {
    name: string
    description: string
    algorithm: string
    risk: "low" | "medium" | "high"
    allocation: number
    timeframe: string
    assets: string
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

