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


export async function fetchAlgorithm(templateId: string): Promise<AlgorithmOption> {
    try {
        // Replace this with your actual API call
        // const response = await fetch(`/api/algorithms/${templateId}`);
        // if (!response.ok) {
        //     throw new Error(`Failed to fetch algorithm with templateId: ${templateId}`);
        // }
        // const data = await response.json();
        // return data;

        return algorithmOption;
    } catch (error) {
        console.error("Failed to fetch default parameters:", error);
        // Return an empty object or some default values in case of an error
        return algorithmOption;
    }
};

// const combinedDefaults: Record<string, any> = {
//     ...data.defaultParameters,
//     ...data.defaultRisk,
//     ...data.defaultExecution
// }


export const algorithmOption = {
    id: 1,
    value: "ma-crossover",
    label: "MA Crossover",
    desc: "Price returns to historical average",
    info: "Price returns to historical average",
    defaultParameters: {
        fastPeriod: 10,
        slowPeriod: 30,
        subType: "sma",
        entryThreshold: 1,
        exitThreshold: 0.5
    },
    defaultRisk: {
        stopLoss: 0.05,
        takeProfit: 0.1,
        riskPerTrade: 0.02,
        positionSize: 0.3,
        maxConcurrentPositions: 1,
    },
    defaultExecution: {
        slippage: 0.001,
        commission: 0.0005,
        entryDelay: 1,
        minHoldingPeriod: 3,
        maxHoldingPeriod: 10
    }
}