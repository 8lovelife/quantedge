// API client functions for strategies
import type { Strategy, StrategiesResponse, StrategyFormValues } from "./types"
import {
    mockFetchTradingStrategies,
    mockCreateStrategy,
    mockUpdateStrategy,
    mockUpdateStrategyStatus,
    mockDeleteStrategy,
} from "./mock"

// Flag to toggle between mock and real API
const USE_MOCK_API = true

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
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

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
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })

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
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ status }),
        })

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
        })

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

