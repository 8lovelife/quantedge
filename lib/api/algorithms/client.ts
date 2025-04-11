import { algorithmOptions } from "./mock"
import { AlgorithmOption } from "./types"

export async function fetchAlgorithms(): Promise<AlgorithmOption[]> {
    try {
        // Replace with your actual API endpoint
        const response = await fetch("/api/algorithms")

        console.log(JSON.stringify(response))
        if (!response.ok) {
            throw new Error("Failed to fetch algorithms")
        }

        return await response.json()
    } catch (error) {
        console.error("Error fetching algorithms:", error)
        // Return default algorithms as fallback
        return algorithmOptions
    }
}  