// Mock data for strategies API
import type { Strategy, StrategiesResponse, StrategyFormValues, StrategyResponse } from "./types"

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Mock strategies data
const mockStrategies: Strategy[] = [
    {
        id: 1,
        name: "Moving Average Crossover",
        description: "A strategy that uses the crossover of two moving averages to generate buy and sell signals.",
        status: "active",
        performance: 12.5,
        allocation: 25,
        risk: "medium",
        algorithm: "moving_average",
        timeframe: "1d",
        assets: "BTC,ETH",
        parameters: {
            smaFast: 10,
            smaSlow: 50,
        },
    },
    {
        id: 2,
        name: "RSI Overbought/Oversold",
        description: "Uses the Relative Strength Index to identify overbought and oversold conditions.",
        status: "active",
        performance: 8.3,
        allocation: 15,
        risk: "medium",
        algorithm: "rsi",
        timeframe: "4h",
        assets: "BTC,SOL",
        parameters: {
            rsiPeriod: 14,
            overbought: 70,
            oversold: 30,
        },
    },
    {
        id: 3,
        name: "MACD Momentum",
        description: "Uses the Moving Average Convergence Divergence indicator to identify momentum shifts.",
        status: "paused",
        performance: -3.2,
        allocation: 10,
        risk: "high",
        algorithm: "macd",
        timeframe: "1h",
        assets: "ETH,SOL,AVAX",
        parameters: {
            fastPeriod: 12,
            slowPeriod: 26,
            signalPeriod: 9,
        },
    },
    {
        id: 4,
        name: "Bollinger Bands Squeeze",
        description: "Identifies periods of low volatility followed by breakouts using Bollinger Bands.",
        status: "active",
        performance: 15.7,
        allocation: 20,
        risk: "high",
        algorithm: "bollinger",
        timeframe: "1d",
        assets: "BTC",
        parameters: {
            period: 20,
            stdDev: 2,
        },
    },
    {
        id: 5,
        name: "Conservative DCA",
        description: "A simple dollar-cost averaging strategy with weekly purchases.",
        status: "active",
        performance: 5.2,
        allocation: 30,
        risk: "low",
        algorithm: "custom",
        timeframe: "1w",
        assets: "BTC,ETH",
        parameters: {
            purchaseDay: "Monday",
            amount: 100,
        },
    },
]

// Mock function to fetch strategies with pagination
export const mockFetchTradingStrategies = async (page = 1, itemsPerPage = 6): Promise<StrategiesResponse> => {
    await delay(800)

    const startIndex = (page - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedItems = mockStrategies.slice(startIndex, endIndex)

    return {
        items: paginatedItems,
        totalPages: Math.ceil(mockStrategies.length / itemsPerPage),
        currentPage: page,
        totalItems: mockStrategies.length,
    }
}

// Mock function to create a strategy
export const mockCreateStrategy = async (data: StrategyFormValues): Promise<StrategyResponse> => {
    await delay(1000)

    const newStrategy: Strategy = {
        id: Math.max(...mockStrategies.map((s) => s.id), 0) + 1,
        ...data,
        status: data.status || "active",
        performance: Math.random() * 20 - 5, // Random performance between -5% and 15%
    }

    mockStrategies.unshift(newStrategy)

    return {
        success: true,
        strategy: newStrategy,
    }
}

// Mock function to update a strategy
export const mockUpdateStrategy = async (id: number, data: StrategyFormValues): Promise<StrategyResponse> => {
    await delay(1000)

    const index = mockStrategies.findIndex((s) => s.id === id)
    if (index === -1) {
        throw new Error(`Strategy with ID ${id} not found`)
    }

    const updatedStrategy: Strategy = {
        ...mockStrategies[index],
        ...data,
    }

    mockStrategies[index] = updatedStrategy

    return {
        success: true,
        strategy: updatedStrategy,
    }
}

// Mock function to update strategy status
export const mockUpdateStrategyStatus = async (id: number, status: "active" | "paused"): Promise<StrategyResponse> => {
    await delay(500)

    const index = mockStrategies.findIndex((s) => s.id === id)
    if (index === -1) {
        throw new Error(`Strategy with ID ${id} not found`)
    }

    mockStrategies[index].status = status

    return {
        success: true,
        strategy: mockStrategies[index],
    }
}

// Mock function to delete a strategy
export const mockDeleteStrategy = async (id: number): Promise<{ success: boolean }> => {
    await delay(500)

    const index = mockStrategies.findIndex((s) => s.id === id)
    if (index === -1) {
        throw new Error(`Strategy with ID ${id} not found`)
    }

    mockStrategies.splice(index, 1)

    return {
        success: true,
    }
}

