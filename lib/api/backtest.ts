// API client functions for backtest operations

/**
 * Run a backtest with the provided parameters
 */
export async function runBacktest(params: any, timeframe: string, strategyId: string) {
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

        return await response.json()
    } catch (error) {
        console.error("Failed to run backtest:", error)
        throw error
    }
}

/**
 * Get historical backtest data for a specific version
 */
export async function getHistoricalBacktest(version: number, timeframe: string, strategyId: string) {
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
 * This is a simplified and more robust implementation
 */
export async function compareBacktests(versions: number[], timeframe: string, strategyId: string) {
    try {
        // Ensure we have at least 2 versions to compare
        if (!versions || versions.length < 2) {
            console.log("Not enough versions to compare, using versions 1 and 2")
            versions = [1, 2] // Default to versions 1 and 2
        }

        const versionsParam = versions.join(",")
        console.log(`Fetching comparison data for versions: ${versionsParam}`)

        // Make the API request
        const response = await fetch(`/api/backtest/compare?versions=${versionsParam}`)

        // Check for HTTP errors
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        // Parse the JSON response
        const data = await response.json()
        console.log("Received comparison data:", data)

        // Return the data or a default structure if something is wrong
        if (!data || !data.success || !data.comparisonData) {
            console.warn("Invalid response format from API")
            return {
                success: false,
                error: "Invalid response format",
                comparisonData: [],
            }
        }

        return data
    } catch (error) {
        console.error("Error comparing backtests:", error)
        // Return a default structure instead of throwing
        return {
            success: false,
            error: error.message || "Failed to compare backtests",
            comparisonData: [],
        }
    }
}

