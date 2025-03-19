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

// Improve error handling in the compareBacktests function
export async function compareBacktests(versions: number[], timeframe: string, strategyId: string) {
    try {
        console.log(`Making API request to compare versions: ${versions.join(",")} for timeframe ${timeframe}`)

        const versionsParam = versions.join(",")
        const response = await fetch(
            `/api/backtest/compare?versions=${versionsParam}&timeframe=${timeframe}&strategyId=${strategyId}`,
        )

        if (!response.ok) {
            console.error(`API error: ${response.status} ${response.statusText}`)
            throw new Error(`API error: ${response.status}`)
        }

        const data = await response.json()
        console.log("API response received:", data)
        return data
    } catch (error) {
        console.error("Failed to compare backtests:", error)
        throw error
    }
}

