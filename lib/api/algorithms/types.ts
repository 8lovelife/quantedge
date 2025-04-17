export interface AlgorithmOption {
    id?: number,
    value: string
    label: string
    desc: string,
    info: string,
    defaultParameters?: Record<string, any> // ← most JSON-friendly
    defaultRisk?: Record<string, any> // ← most JSON-friendly
    defaultExecution?: Record<string, any> // ← most JSON-friendly
}


const defaultParams = {
    lookbackPeriod: 20,
    entryThreshold: 2,
    exitThreshold: 0.5,
    stopLoss: 2,
    takeProfit: 4,
    positionSize: 100,
    riskPerTrade: 1,
    maxPositions: 3,
    minVolume: 1000000
}

export interface Parameter {
    name: string
    key: keyof typeof defaultParams
    description: string
    min: number
    max: number
    step: number
    unit?: string
    category: "core" | "advanced" | "position"
}

export const parameters: Parameter[] = [
    {
        name: "Lookback Period",
        key: "lookbackPeriod",
        description: "Number of periods to calculate mean and standard deviation",
        min: 5,
        max: 100,
        step: 1,
        category: "core"
    },
    {
        name: "Entry Threshold",
        key: "entryThreshold",
        description: "Number of standard deviations for entry signal",
        min: 0.5,
        max: 5,
        step: 0.1,
        unit: "σ",
        category: "core"
    },
    {
        name: "Exit Threshold",
        key: "exitThreshold",
        description: "Number of standard deviations for exit signal",
        min: 0.1,
        max: 2,
        step: 0.1,
        unit: "σ",
        category: "core"
    },
    {
        name: "Stop Loss",
        key: "stopLoss",
        description: "Maximum loss per trade",
        min: 0.5,
        max: 10,
        step: 0.1,
        unit: "%",
        category: "risk"
    },
    {
        name: "Take Profit",
        key: "takeProfit",
        description: "Profit target per trade",
        min: 1,
        max: 20,
        step: 0.1,
        unit: "%",
        category: "risk"
    },
    {
        name: "Position Size",
        key: "positionSize",
        description: "Size of each position as percentage of portfolio",
        min: 1,
        max: 100,
        step: 1,
        unit: "%",
        category: "position"
    },
    {
        name: "Risk Per Trade",
        key: "riskPerTrade",
        description: "Maximum risk per trade as percentage of portfolio",
        min: 0.1,
        max: 5,
        step: 0.1,
        unit: "%",
        category: "risk"
    },
    {
        name: "Max Positions",
        key: "maxPositions",
        description: "Maximum number of concurrent positions",
        min: 1,
        max: 10,
        step: 1,
        category: "position"
    },
    {
        name: "Min Volume",
        key: "minVolume",
        description: "Minimum 24h trading volume for asset selection",
        min: 100000,
        max: 10000000,
        step: 100000,
        unit: "USDT",
        category: "position"
    }
]


export interface ParameterField {
    key: string
    name: string
    description: string
    min?: number
    max?: number
    step?: number
    unit?: string
    category?: string
}


export const parameterSchemas: Record<string, ParameterField[]> = {
    "ma-crossover": [
        {
            key: "fastPeriod",
            name: "Fast Period",
            description: "Number of periods for the fast moving average",
            min: 1,
            max: 200,
            step: 1,
            unit: "bars",
            category: "core"
        },
        {
            key: "slowPeriod",
            name: "Slow Period",
            description: "Number of periods for the slow moving average",
            min: 1,
            max: 500,
            step: 1,
            unit: "bars",
            category: "core"
        },
        {
            key: "entryThreshold",
            name: "Entry Threshold",
            description: "Minimum MA difference to trigger entry",
            min: 0,
            max: 10,
            step: 0.1,
            unit: "σ",
            category: "advanced"
        },
        {
            key: "exitThreshold",
            name: "Exit Threshold",
            description: "Number of standard deviations for exit signal",
            min: 0.1,
            max: 2,
            step: 0.1,
            unit: "σ",
            category: "advanced"
        }
    ],
    "mean-reversion": [
        {
            key: "lookback_period",
            name: "Lookback Period",
            description: "Number of periods to calculate mean and std deviation",
            min: 1,
            max: 100,
            step: 1,
            unit: "bars",
            category: "core"
        },
        {
            key: "entry_threshold",
            name: "Entry Threshold (Z-score)",
            description: "Z-score above/below which to enter",
            min: 0.5,
            max: 5,
            step: 0.1,
            unit: "",
            category: "core"
        },
        {
            key: "exit_threshold",
            name: "Exit Threshold (Z-score)",
            description: "Z-score range to trigger exit",
            min: 0,
            max: 2,
            step: 0.1,
            unit: "",
            category: "core"
        }
    ]
}

export const riskSchemas: Record<string, ParameterField[]> = {
    "risk": [
        {
            name: "Stop Loss",
            key: "stopLoss",
            description: "Maximum loss per trade",
            min: 0.5,
            max: 10,
            step: 0.1,
            unit: "%",
            category: "core"
        },
        {
            name: "Take Profit",
            key: "takeProfit",
            description: "Profit target per trade",
            min: 1,
            max: 20,
            step: 0.1,
            unit: "%",
            category: "core"
        },
        {
            name: "Risk Per Trade",
            key: "riskPerTrade",
            description: "Maximum risk per trade as percentage of portfolio",
            min: 0.1,
            max: 5,
            step: 0.1,
            unit: "%",
            category: "core"
        },
        {
            name: "Max Positions",
            key: "maxConcurrentPositions",
            description: "Maximum number of concurrent positions",
            min: 1,
            max: 10,
            step: 1,
            category: "position"
        },
        {
            name: "Position Size",
            key: "positionSize",
            description: "Size of each position as percentage of portfolio",
            min: 1,
            max: 100,
            step: 1,
            unit: "%",
            category: "position"
        }
    ]
}


export const defaultParams2 = {
    fastPeriod: 10,
    slowPeriod: 30,
    subType: "sma",
    entryThreshold: 1,
    exitThreshold: 0.5,
    stopLoss: 0.05,
    takeProfit: 0.1,
    riskPerTrade: 0.02,
    positionSize: 0.3,
    maxConcurrentPositions: 1,
    slippage: 0.001,
    commission: 0.0005,
    entryDelay: 1,
    minHoldingPeriod: 3,
    maxHoldingPeriod: 10
};

export interface StrategyDefaultParams {
    fastPeriod: number;
    slowPeriod: number;
    maType: string;
    entryThreshold: number;
    exitThreshold: number;
    stopLoss: number;
    takeProfit: number;
    riskPerTrade: number;
    positionSize: number;
    maxConcurrentPositions: number;
    slippage: number;
    commission: number;
    entryDelay: number;
    minHoldingPeriod: number;
    maxHoldingPeriod: number;
}