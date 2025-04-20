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



export interface LabRunHistory {
    id: string
    startTime: Date,
    endTime: Date,
    parameters: Record<string, any>,
    performance: BacktestMetrics,
    marketDetails: Record<string, any>,
    duration: string
    status: string
}

export interface LabRunHistoryResponse {
    historys: LabRunHistory[]
}

export interface LabRunComparison {
    runId: number,
    labRunHistory: LabRunHistory,
    backtestData: BacktestData,
}








// mock/grid-result.ts
export interface GridMetrics {
    cagr: number      // 年化收益率 (%)
    maxDrawdown: number      // 最大回撤 (%，负值)
    sharpe: number
    totalReturn: number      // 累计收益 (%)
}

export interface GridEntry {
    id: string
    params: Record<string, number>
    metrics: GridMetrics
    equity: { t: string; v: number }[]   // 时间序列 (可选，如果没用到可删)
}

export interface GridResult {
    generatedAt: string          // 生成时间（ISO 字符串）
    symbol: string          // 资产，如 "BTC/USDT"
    combinations: number          // 一共跑了多少组合
    leaderboard: GridEntry[]       // 已按 “收益‑回撤” 排序
    paretoFront: GridEntry[]       // 帕累托前沿点
    entries: GridEntry[]       // 全量（如果只用 leaderboard 也 OK）
}

ies: []
// mock/grid-result.ts
import { GridResult } from "@/app/lab/[id]/observe/optimize-result/page"; // adjust path if needed
import { BacktestData, BacktestMetrics, BacktestResponse } from "../backtest/types"

export const mockGridResult: GridResult = {
    generatedAt: new Date().toISOString(),
    symbol: "BTC/USDT",
    combinations: 18,

    // ───────────────────────────────────────────────────────────
    // 📈 Leaderboard  (already sorted: best first)
    // ───────────────────────────────────────────────────────────
    leaderboard: [
        {
            id: "fp5-sp20",
            params: { fastPeriod: 5, slowPeriod: 20, entryThreshold: 0.01, stopLoss: 0.03 },
            metrics: { cagr: 42.6, max_drawdown: -8.7, sharpe: 2.3, trades: 145 },
            // tiny equity‑curve sample (timestamp, equity)
            equityCurve: [
                ["2024‑01‑01", 1_0000],
                ["2024‑03‑01", 1_0820],
                ["2024‑06‑01", 1_1560],
                ["2024‑09‑01", 1_3200],
                ["2024‑12‑31", 1_4260]
            ]
        },
        {
            id: "fp5-sp30",
            params: { fastPeriod: 5, slowPeriod: 30, entryThreshold: 0.01, stopLoss: 0.05 },
            metrics: { cagr: 38.1, max_drawdown: -7.9, sharpe: 2.1, trades: 131 },
            equityCurve: [
                ["2024‑01‑01", 1_0000],
                ["2024‑03‑01", 1_0600],
                ["2024‑06‑01", 1_1300],
                ["2024‑09‑01", 1_2700],
                ["2024‑12‑31", 1_3810]
            ]
        },
        {
            id: "fp10-sp20",
            params: { fastPeriod: 10, slowPeriod: 20, entryThreshold: 0.02, stopLoss: 0.03 },
            metrics: { cagr: 34.4, max_drawdown: -6.5, sharpe: 1.9, trades: 118 },
            equityCurve: [
                ["2024‑01‑01", 1_0000],
                ["2024‑03‑01", 1_0550],
                ["2024‑06‑01", 1_1200],
                ["2024‑09‑01", 1_2400],
                ["2024‑12‑31", 1_3440]
            ]
        }
        /* …more entries … */
    ],

    // ───────────────────────────────────────────────────────────
    // 🟡 Pareto front  (subset of leaderboard or other points)
    // ───────────────────────────────────────────────────────────
    paretoFront: [
        {
            id: "fp5-sp20",
            params: { fastPeriod: 5, slowPeriod: 20, entryThreshold: 0.01, stopLoss: 0.03 },
            metrics: { cagr: 42.6, max_drawdown: -8.7, sharpe: 2.3, trades: 145 },
            equityCurve: []    // curve not needed for scatter – can keep empty
        },
        {
            id: "fp5-sp30",
            params: { fastPeriod: 5, slowPeriod: 30, entryThreshold: 0.01, stopLoss: 0.05 },
            metrics: { cagr: 38.1, max_drawdown: -7.9, sharpe: 2.1, trades: 131 },
            equityCurve: []
        },
        {
            id: "fp15-sp50",
            params: { fastPeriod: 15, slowPeriod: 50, entryThreshold: 0.02, stopLoss: 0.05 },
            metrics: { cagr: 29.8, max_drawdown: -5.0, sharpe: 1.7, trades: 92 },
            equityCurve: []
        }
    ],

    // ───────────────────────────────────────────────────────────
    // 📜 Full list (can be big – here we just reuse leaderboard)
    // ───────────────────────────────────────────────────────────
    entries: [] // tip: just spread leaderboard for demo
};

mockGridResult.entries = [...mockGridResult.leaderboard];