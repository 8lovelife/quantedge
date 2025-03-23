import type { BacktestParameters, BacktestResponse, BacktestRunHistoryItem, BacktestRunHistoryResponse } from "./types"

/**
 * Run a backtest with the provided parameters
 */
export async function runBacktest(
    params: BacktestParameters,
    timeframe: string,
    strategyId: string,
): Promise<BacktestResponse> {
    try {
        const response = await fetch("/api/backtest", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                params,
                timeframe,
                strategyId,
            }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()

        // Add the run to history
        if (result.success) {
            await addRunToHistory(result.version, result.date, params, strategyId)
        }

        return result
    } catch (error) {
        console.error("Failed to run backtest:", error)
        throw error
    }
}

/**
 * Get historical backtest data for a specific version
 */
export async function getHistoricalBacktest(
    version: number,
    timeframe: string,
    strategyId: string,
): Promise<BacktestResponse> {
    try {
        const response = await fetch(`/api/backtest?version=${version}&timeframe=${timeframe}&strategyId=${strategyId}`)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        return await response.json()
    } catch (error) {
        console.error("Failed to get historical backtest:", error)
        throw error
    }
}

/**
 * Compare multiple backtest runs
 */
export async function compareBacktests(versions: number[], timeframe: string, strategyId: string): Promise<any> {
    try {
        // Ensure we have at least 2 versions to compare
        if (!versions || versions.length < 2) {
            console.log("Not enough versions to compare, using versions 1 and 2")
            versions = [1, 2] // Default to versions 1 and 2
        }

        const versionsParam = versions.join(",")
        console.log(`Fetching comparison data for versions: ${versionsParam}`)

        // Make the API request
        const response = await fetch(
            `/api/backtest/compare?versions=${versionsParam}&timeframe=${timeframe}&strategyId=${strategyId}`,
        )

        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        // Parse the JSON response
        return await response.json()
    } catch (error) {
        console.error("Failed to compare backtests:", error)
        return {
            success: false,
            error: error.message || "Failed to compare backtests",
            comparisonData: [],
        }
    }
}

/**
 * Get backtest run history
 */
export async function getBacktestRunHistory(strategyId: string): Promise<BacktestRunHistoryItem[]> {
    try {
        const response = await fetch(`/api/backtest/history?strategyId=${strategyId}`)

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result: BacktestRunHistoryResponse = await response.json()

        if (!result.success) {
            throw new Error(result.error || "Failed to fetch backtest history")
        }

        return result.history
    } catch (error) {
        console.error("Failed to fetch backtest history:", error)
        return []
    }
}

/**
 * Add a run to history
 */
export async function addRunToHistory(
    version: number,
    date: string,
    parameters: BacktestParameters,
    strategyId: string,
): Promise<boolean> {
    try {
        const response = await fetch("/api/backtest/history", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                version,
                date,
                parameters,
                strategyId,
            }),
        })

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`)
        }

        const result = await response.json()
        return result.success
    } catch (error) {
        console.error("Failed to add run to history:", error)
        return false
    }
}

