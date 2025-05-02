// API client functions for strategies
import type { Strategy, StrategiesResponse, StrategyFormValues, FetchStrategySummaryParams, StrategiySummarysResponse } from "./types"
import router from "next/router"

// Flag to toggle between mock and real API
const USE_MOCK_API = true


export async function fetchStrategies(params?: FetchStrategySummaryParams): Promise<StrategiySummarysResponse> {
    try {
        const queryParams = new URLSearchParams()
        if (params?.page) queryParams.set('page', params.page.toString())
        if (params?.limit) queryParams.set('limit', params.limit.toString())
        if (params?.search) queryParams.set('search', params.search)
        if (params?.status && params.status !== 'all') queryParams.set('status', params.status)
        if (params?.sort) queryParams.set('sort', params.sort)

        const response = await fetch(`/api/strategies?${queryParams.toString()}`)

        if (response.status === 401) {
            router.push("/login")
        }

        if (!response.ok) throw new Error('Failed to fetch strategies')
        const result = await response.json()

        const strategiesResponse = {
            items: result.data,
            total: result.total,
            totalPages: Math.ceil((result.total || result.data.length) / (params?.limit || 8))
        }
        return strategiesResponse
    } catch (error) {
        console.error('Error fetching strategies:', error)
        throw error
    }
}

/**
 * Fetch trading strategies with pagination
 */
export async function fetchTradingStrategies(page = 1, itemsPerPage = 6): Promise<StrategiesResponse> {
    // if (USE_MOCK_API) {
    //     return mockFetchTradingStrategies(page, itemsPerPage)
    // }

    // Real API implementation
    try {
        const response = await fetch(`/api/strategies?page=${page}&limit=${itemsPerPage}`)

        if (response.status === 401) {
            router.push("/login")
        }
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }
        return await response.json()
    } catch (error) {
        console.error("Failed to fetch trading strategies:", error)
        throw error
    }
}

/**
 * Create a new trading strategy
 */
export async function createStrategy(data: StrategyFormValues): Promise<Strategy> {
    // if (USE_MOCK_API) {
    //     const response = await mockCreateStrategy(data)
    //     return response.strategy
    // }

    // Real API implementation
    try {
        const response = await fetch("/api/strategies", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (response.status === 401) {
            router.push("/login")
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        return result.strategy
    } catch (error) {
        console.error("Failed to create strategy:", error)
        throw error
    }
}

/**
 * Update an existing trading strategy
 */
export async function updateStrategy(id: number, data: StrategyFormValues): Promise<Strategy> {
    // if (USE_MOCK_API) {
    //     const response = await mockUpdateStrategy(id, data)
    //     return response.strategy
    // }

    // Real API implementation
    try {
        const response = await fetch(`/api/strategies/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

        if (response.status === 401) {
            router.push("/login")
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        return result.strategy
    } catch (error) {
        console.error("Failed to update strategy:", error)
        throw error
    }
}

/**
 * Update a strategy's status (active/paused)
 */
export async function updateStrategyStatus(id: number, status: "active" | "paused"): Promise<Strategy> {
    // if (USE_MOCK_API) {
    // const response = await mockUpdateStrategyStatus(id, status)
    //     return response.strategy
    // }

    // Real API implementation
    try {
        const response = await fetch(`/api/strategies/${id}/status`, {
            method: "PATCH",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        })

        if (response.status === 401) {
            router.push("/login")
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        return result.strategy
    } catch (error) {
        console.error("Failed to update strategy status:", error)
        throw error
    }
}

/**
 * Delete a trading strategy
 */
export async function deleteStrategy(id: number): Promise<boolean> {
    // if (USE_MOCK_API) {
    //     const response = await mockDeleteStrategy(id)
    //     return response.success
    // }

    // Real API implementation
    try {
        const response = await fetch(`/api/strategies/${id}`, {
            method: "DELETE",
            credentials: "include",
        })

        if (response.status === 401) {
            router.push("/login")
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        return result.success
    } catch (error) {
        console.error("Failed to delete strategy:", error)
        throw error
    }
}


export async function saveStep(id: number | null, step: string, data: any): Promise<any | null> {
    const url = `/api/strategies/draft/${step}`

    try {
        const res = await fetch(url, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, data }),
        })

        if (res.status === 401) {
            router.push("/login")
        }
        if (!res.ok) throw new Error()
        const resData = await res.json()
        return resData
    } catch (error) {
        console.error("Failed to save strategy:", error)
        throw error
    }
}


export async function fetchStrategyDetails(id: number): Promise<any> {
    try {
        // const response = getMockStrategyById(id)

        const response = await fetch(`/api/strategies/${id}`, {
            credentials: "include",
        })

        if (response.status === 401) {
            router.push("/login")
        }
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }
        const data = await response.json()

        return data
    } catch (error) {
        console.error("Failed to fetch strategy detail:", error)
        throw error
    }
}


export async function applyStrategyRun(id: string, version: number): Promise<any> {
    try {
        const response = await fetch(`/api/strategies/run/${id}`, {
            method: "PUT",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ version: version }),
        })


        if (response.status === 401) {
            router.push("/login")
        }

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        return result.strategy
    } catch (error) {
        console.error("Failed to update strategy:", error)
        throw error
    }
}


// Mock data for strategies based on ID
function getMockStrategyById(id: number) {
    // Draft strategy
    if (id === 1) {
        return {
            id: 1,
            name: "Mean Reversion BTC",
            type: "Mean-Reversion",
            status: "draft", // Strategy is in draft stage
            created: "2023-06-15",
            updated: "2023-06-15",
            performance: null, // No performance data yet
            description: "Basic mean reversion strategy for Bitcoin",
            configuration: {
                parameters: {
                    lookbackPeriod: 20,
                    deviationThreshold: 2.5,
                    meanReversionStrength: 70,
                    timeframe: "1h",
                },
                assets: ["BTC/USDT"],
                timeframe: "4h",
                riskManagement: {
                    positionSize: 3,
                    maxPositions: 2,
                    stopLoss: 2.5,
                    takeProfit: 4,
                    trailingStop: false,
                },
            },
            trades: [], // No trades yet
            logs: [], // No logs yet
        }
    }

    // Backtested strategy
    else if (id === 2) {
        return {
            id: 2,
            name: "Momentum ETH",
            type: "Momentum",
            status: "backtest", // Strategy has been backtested
            created: "2023-06-10",
            updated: "2023-06-14",
            performance: {
                return: 18.5,
                sharpe: 1.92,
                drawdown: 12.3,
                winRate: 68.4,
                profitFactor: 2.3,
                averageTrade: 1.2,
                maxConsecutiveLosses: 3,
            },
            description: "Momentum strategy for Ethereum with RSI filter",
            configuration: {
                parameters: {
                    rsiPeriod: 14,
                    rsiLower: 30,
                    rsiUpper: 70,
                    momentumStrength: 65,
                },
                assets: ["ETH/USDT"],
                timeframe: "1h",
                riskManagement: {
                    positionSize: 5,
                    maxPositions: 3,
                    stopLoss: 2,
                    takeProfit: 5,
                    trailingStop: false,
                },
            },
            trades: [
                {
                    id: 1,
                    date: "2023-06-14",
                    type: "BUY",
                    asset: "ETH/USDT",
                    price: 1850.25,
                    size: 0.5,
                    pnl: 2.3,
                    status: "CLOSED",
                },
                {
                    id: 2,
                    date: "2023-06-13",
                    type: "SELL",
                    asset: "ETH/USDT",
                    price: 1820.75,
                    size: 0.5,
                    pnl: -1.2,
                    status: "CLOSED",
                },
                {
                    id: 3,
                    date: "2023-06-12",
                    type: "BUY",
                    asset: "ETH/USDT",
                    price: 1805.5,
                    size: 0.5,
                    pnl: 3.5,
                    status: "CLOSED",
                },
            ],
            logs: [
                { timestamp: "2023-06-14T10:15:00Z", level: "INFO", message: "Backtest completed successfully" },
                { timestamp: "2023-06-14T10:14:55Z", level: "INFO", message: "Processing trade #3" },
                { timestamp: "2023-06-14T10:14:50Z", level: "INFO", message: "Processing trade #2" },
                { timestamp: "2023-06-14T10:14:45Z", level: "INFO", message: "Processing trade #1" },
                { timestamp: "2023-06-14T10:14:30Z", level: "INFO", message: "Starting backtest for ETH/USDT" },
            ],
        }
    }

    // Paper trading strategy
    else if (id === 3) {
        return {
            id: 3,
            name: "Breakout Multi-Asset",
            type: "Breakout",
            status: "paper", // Strategy is in paper trading mode
            created: "2023-05-20",
            updated: "2023-06-12",
            performance: {
                return: 24.7,
                sharpe: 2.15,
                drawdown: 8.7,
                winRate: 72.1,
                profitFactor: 2.8,
                averageTrade: 1.5,
                maxConsecutiveLosses: 2,
            },
            paperPerformance: {
                // Additional paper trading performance data
                currentReturn: 8.3,
                openPositions: 2,
                lastTradeTime: "2023-06-16T14:32:00Z",
                runningTime: "3 days",
            },
            description: "Multi-asset breakout strategy with volume confirmation",
            configuration: {
                parameters: {
                    breakoutPeriod: 20,
                    volumeThreshold: 1.5,
                    confirmationCandles: 2,
                },
                assets: ["BTC/USDT", "ETH/USDT", "SOL/USDT"],
                timeframe: "2h",
                riskManagement: {
                    positionSize: 4,
                    maxPositions: 3,
                    stopLoss: 3,
                    takeProfit: 6,
                    trailingStop: true,
                },
            },
            trades: [
                {
                    id: 1,
                    date: "2023-06-16",
                    type: "BUY",
                    asset: "BTC/USDT",
                    price: 26750.5,
                    size: 0.02,
                    pnl: null,
                    status: "OPEN",
                },
                {
                    id: 2,
                    date: "2023-06-15",
                    type: "BUY",
                    asset: "SOL/USDT",
                    price: 15.75,
                    size: 10,
                    pnl: 3.2,
                    status: "OPEN",
                },
                {
                    id: 3,
                    date: "2023-06-14",
                    type: "SELL",
                    asset: "ETH/USDT",
                    price: 1740.25,
                    size: 0.3,
                    pnl: 2.1,
                    status: "CLOSED",
                },
            ],
            logs: [
                { timestamp: "2023-06-16T14:32:00Z", level: "INFO", message: "Opened BTC/USDT long position at $26750.50" },
                { timestamp: "2023-06-16T14:31:55Z", level: "INFO", message: "Breakout detected on BTC/USDT" },
                { timestamp: "2023-06-15T09:15:30Z", level: "INFO", message: "Opened SOL/USDT long position at $15.75" },
                { timestamp: "2023-06-14T16:22:10Z", level: "INFO", message: "Closed ETH/USDT position with 2.1% profit" },
                { timestamp: "2023-06-13T10:00:00Z", level: "INFO", message: "Paper trading started" },
            ],
        }
    }

    // Live trading strategy
    else if (id === 4) {
        return {
            id: 4,
            name: "RSI Divergence",
            type: "Custom",
            status: "live", // Strategy is in live trading mode
            created: "2023-04-05",
            updated: "2023-06-01",
            performance: {
                return: 32.1,
                sharpe: 2.43,
                drawdown: 14.2,
                winRate: 74.6,
                profitFactor: 3.1,
                averageTrade: 1.8,
                maxConsecutiveLosses: 2,
            },
            livePerformance: {
                // Additional live trading performance data
                currentReturn: 15.7,
                openPositions: 3,
                lastTradeTime: "2023-06-16T15:45:00Z",
                runningTime: "7 days",
                totalTrades: 12,
                profitableTrades: 9,
            },
            description: "RSI divergence strategy with multiple timeframe analysis",
            configuration: {
                parameters: {
                    rsiPeriod: 14,
                    divergenceThreshold: 10,
                    confirmationPeriod: 3,
                },
                assets: ["BTC/USDT", "ETH/USDT", "ADA/USDT", "DOT/USDT"],
                timeframe: "1h",
                riskManagement: {
                    positionSize: 5,
                    maxPositions: 4,
                    stopLoss: 2.5,
                    takeProfit: 7.5,
                    trailingStop: true,
                },
            },
            trades: [
                {
                    id: 1,
                    date: "2023-06-16",
                    type: "BUY",
                    asset: "DOT/USDT",
                    price: 5.25,
                    size: 50,
                    pnl: 1.2,
                    status: "OPEN",
                },
                {
                    id: 2,
                    date: "2023-06-15",
                    type: "BUY",
                    asset: "ADA/USDT",
                    price: 0.28,
                    size: 1000,
                    pnl: 3.5,
                    status: "OPEN",
                },
                {
                    id: 3,
                    date: "2023-06-14",
                    type: "BUY",
                    asset: "ETH/USDT",
                    price: 1720.5,
                    size: 0.5,
                    pnl: 2.8,
                    status: "OPEN",
                },
                {
                    id: 4,
                    date: "2023-06-13",
                    type: "SELL",
                    asset: "BTC/USDT",
                    price: 25980.75,
                    size: 0.05,
                    pnl: 4.2,
                    status: "CLOSED",
                },
            ],
            logs: [
                { timestamp: "2023-06-16T15:45:00Z", level: "INFO", message: "Opened DOT/USDT long position at $5.25" },
                { timestamp: "2023-06-16T15:44:50Z", level: "INFO", message: "RSI divergence detected on DOT/USDT" },
                { timestamp: "2023-06-15T12:30:15Z", level: "INFO", message: "Opened ADA/USDT long position at $0.28" },
                { timestamp: "2023-06-14T09:15:30Z", level: "INFO", message: "Opened ETH/USDT long position at $1720.50" },
                { timestamp: "2023-06-13T14:22:10Z", level: "INFO", message: "Closed BTC/USDT position with 4.2% profit" },
                { timestamp: "2023-06-13T14:22:00Z", level: "WARNING", message: "Take profit triggered for BTC/USDT" },
            ],
            alerts: [{ type: "warning", message: "Approaching stop loss on ETH position" }],
        }
    }

    // Default fallback strategy
    else {
        return {
            id: id,
            name: "Unknown Strategy",
            type: "Custom",
            status: "draft",
            created: "2023-06-01",
            updated: "2023-06-01",
            performance: null,
            description: "Strategy details not found",
            configuration: {
                parameters: {},
                assets: [],
                timeframe: "1h",
                riskManagement: {
                    positionSize: 5,
                    maxPositions: 3,
                    stopLoss: 2,
                    takeProfit: 5,
                    trailingStop: false,
                },
            },
            trades: [],
            logs: [],
        }
    }
}


