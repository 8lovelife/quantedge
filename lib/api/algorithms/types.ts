export interface AlgorithmOption {
    id?: number,
    value: string
    label: string
    desc: string,
    info: string,
    defaultParameters?: Record<string, any> // ← most JSON-friendly
    defaultRisk?: Record<string, any> // ← most JSON-friendly
    defaultExecution?: Record<string, any> // ← most JSON-friendly
    latest_lab_backtest_version: number;
}



export interface StrategyTemplatesResponse {
    items: StrategyTemplate[]
    total: number
    totalPages: number
}

export interface StrategyTemplate {
    id: number;
    name: string;
    description: string;
    info: string;
    type: string;
    updated: string;
    performance?: Record<string, any>,
    parameters?: StrategyParameterConfig,
    risk?: Record<string, any>,
    execution?: Record<string, any>,
    likes: number;
    usage: number;
    author: string;
    latest_lab_backtest_version: number;
}


export interface StrategyParameterConfig {
    options?: Record<string, any>,
    default?: Record<string, any>
}

export interface FetchStrategyTemplateParams {
    page?: number
    limit?: number
    search?: string
    status?: string
    sort?: string
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
    type: "number" | "select" | "radio"
    default: any;
    min?: number
    max?: number
    step?: number
    unit?: string
    category?: string
    options?: { label: string; value: string }[]
    showIf?: { key: string; value: any }
    group?: string
    groupLabel?: string
    order?: number
    fullWidth?: boolean
}




export const parameterSchemas: Record<string, ParameterField[]> = {
    "ma-crossover": [
        {
            key: "meanType",
            name: "Moving Average Type",
            description: "Type of moving average used",
            type: "select",
            default: "sma",
            options: [
                { label: "Simple Moving Average", value: "sma" },
                { label: "Exponential Moving Average", value: "ema" },
                { label: "Weighted Moving Average", value: "wma" }
            ],
            category: "core",
            order: 1
        },
        // {
        //     key: "smoothingFactor",
        //     name: "Smoothing Factor",
        //     description: "Smoothing multiplier used in EMA",
        //     type: "number",
        //     default: 1,
        //     min: 0,
        //     max: 100,
        //     step: 1,
        //     category: "core",
        //     showIf: { key: "maType", value: "ema" },
        //     unit: "%",
        //     order: 1
        // },
        {
            key: "weightDecay",
            name: "Weight Decay",
            description: "Weight decay factor used in WMA",
            type: "number",
            default: 50,
            min: 0,
            max: 100,
            step: 1,
            category: "core",
            showIf: { key: "meanType", value: "wma" },
            unit: "%",
            order: 1
        },
        {
            key: "fastPeriod",
            name: "Fast Period",
            description: "Number of periods for the fast moving average",
            type: "number",
            default: 5,
            min: 2,
            max: 50,
            step: 1,
            unit: "bars",
            category: "core",
            order: 0

        },
        {
            key: "slowPeriod",
            name: "Slow Period",
            description: "Number of periods for the slow moving average",
            type: "number",
            default: 20,
            min: 10,
            max: 200,
            step: 1,
            unit: "bars",
            category: "core",
            order: 0
        },
        {
            key: "entryThreshold",
            name: "Entry Threshold",
            description: "Minimum MA difference to trigger entry",
            type: "number",
            default: 2,
            min: 0.5,
            max: 5.0,
            step: 0.1,
            unit: "σ",
            category: "core"
        },
        {
            key: "exitThreshold",
            name: "Exit Threshold",
            description: "Number of standard deviations for exit signal",
            type: "number",
            default: 0.5,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            unit: "σ",
            category: "core"
        },
        {
            key: "cooldownPeriod",
            name: "Cooldown Period",
            description: "Wait N bars before re-entering a new trade",
            type: "number",
            default: 5,
            min: 0,
            max: 20,
            step: 1,
            unit: "bars",
            category: "advanced",
            order: 7
        },
        {
            key: "rebalanceInterval",
            name: "Rebalance Interval",
            description: "How often to rebalance the portfolio",
            type: "select",
            default: "daily",
            options: [
                { label: "Daily", value: "daily" },
                { label: "4H", value: "4h" },
                { label: "1H", value: "1h" }
            ],
            category: "advanced",
            order: 9
        }
    ],
    "mean-reversion": [
        {
            key: "reversionStyle",
            name: "Reversion Style",
            description: "Type of mean reversion strategy logic",
            type: "select",
            default: "z-score",
            options: [
                { label: "Z-Score", value: "z-score" },
                { label: "Bollinger Bands", value: "bollinger" }
            ],
            category: "core",
            order: 0
        },
        {
            key: "entryZScore",
            name: "Entry Z-Score",
            description: "Z-score above/below which to enter a trade",
            type: "number",
            default: 2,
            min: 0.5,
            max: 5,
            step: 0.1,
            unit: "",
            showIf: { key: "reversionStyle", value: "z-score" },
            group: "zscore",
            groupLabel: "Z-Score Config",
            category: "core",
            order: 1
        },
        {
            key: "exitZScore",
            name: "Exit Z-Score",
            description: "Z-score range to exit the trade",
            type: "number",
            default: 0.5,
            min: 0,
            max: 2,
            step: 0.1,
            unit: "",
            showIf: { key: "reversionStyle", value: "z-score" },
            group: "zscore",
            groupLabel: "Z-Score Config",
            category: "core",
            order: 1
        },
        {
            key: "exitThreshold",
            name: "Exit Threshold",
            description: "Number of standard deviations for exit signal",
            type: "number",
            default: 0.5,
            min: 0.1,
            max: 2.0,
            step: 0.1,
            unit: "σ",
            category: "core",
            showIf: { key: "reversionStyle", value: "bollinger" },
            order: 3

        },
        {
            key: "bandMultiplier",
            name: "Bollinger Band Multiplier",
            description: "Width of the Bollinger Bands (in standard deviations)",
            type: "number",
            default: 2,
            min: 0.5,
            max: 4,
            step: 0.1,
            unit: "σ",
            showIf: { key: "reversionStyle", value: "bollinger" },
            category: "core",
            order: 1,
            fullWidth: true
        },
        {
            key: "lookbackPeriod",
            name: "Lookback Period",
            description: "Number of periods to calculate mean and std deviation",
            type: "number",
            default: 20,
            min: 1,
            max: 100,
            step: 1,
            unit: "bars",
            category: "core",
            order: 0
        },
        {
            key: "meanType",
            name: "Moving Average Type",
            description: "Type of moving average used for mean calculation",
            type: "select",
            default: "sma",
            options: [
                { label: "Simple Moving Average", value: "sma" },
                { label: "Exponential Moving Average", value: "ema" },
                { label: "Weighted Moving Average", value: "wma" }
            ],
            category: "core",
            order: 1
        },
        // {
        //     key: "smoothingFactor",
        //     name: "Smoothing Factor",
        //     description: "Only for EMA",
        //     type: "number",
        //     default: 0.1,
        //     min: 0.01,
        //     max: 1.0,
        //     step: 0.01,
        //     unit: "%",
        //     showIf: { key: "meanType", value: "ema" },
        //     category: "core",
        //     order: 1
        // },
        {
            key: "weightDecay",
            name: "Weight Decay",
            description: "Weight decay factor used in WMA",
            type: "number",
            default: 50,
            min: 0,
            max: 100,
            step: 1,
            category: "core",
            showIf: { key: "maType", value: "wma" },
            unit: "%",
            order: 1
        },
        {
            key: "cooldownPeriod",
            name: "Cooldown Period",
            description: "Wait N bars before re-entering a new trade",
            type: "number",
            default: 5,
            min: 0,
            max: 20,
            step: 1,
            unit: "bars",
            category: "advanced",
            order: 7
        },
        {
            key: "rebalanceInterval",
            name: "Rebalance Interval",
            description: "How often to rebalance the portfolio",
            type: "select",
            default: "daily",
            options: [
                { label: "Daily", value: "daily" },
                { label: "4H", value: "4h" },
                { label: "1H", value: "1h" }
            ],
            category: "advanced",
            order: 9
        }
    ]
}



export function normalizeParams(
    rawParams: Record<string, any>,
    schema: ParameterField[]
): Record<string, any> {
    const out: Record<string, any> = {}

    for (const field of schema) {
        const { key, showIf } = field
        const val = rawParams[key]

        if (val == null) continue

        if (showIf) {
            const actual = rawParams[showIf.key]
            if (actual !== showIf.value) {
                continue
            }
        }

        out[key] = val
    }

    return out
}


export function filterParamsByStyle(raw: any): any {
    const out: any = { ...raw };

    if (raw.reversionStyle === "bollinger") {
        delete out.entryZScore;
        delete out.exitZScore;
    } else if (raw.reversionStyle === "z-score") {
        delete out.bandMultiplier;
        delete out.exitThreshold;
    }

    return out;
}


export const defaultParams2 = {
    fastPeriod: 10,
    slowPeriod: 30,
    maType: "sma",
    meanType: "sma",
    entryThreshold: 1.0,
    exitThreshold: 0.5,
    stopLoss: 5.0,      // ← 百分比显示：5%
    takeProfit: 10.0,   // ← 百分比显示：10%
    riskPerTrade: 2.0,  // ← 百分比显示：2%
    positionSize: 30.0, // ← 百分比显示：30%
    slippage: 0.1,      // ← 百分比显示：0.1%
    commission: 0.05,   // ← 百分比显示：0.05%
    entryDelay: 1,
    minHoldingPeriod: 3,
    maxHoldingPeriod: 10,
    reversionStyle: "z-score",
    cooldownPeriod: 5,
    lookbackPeriod: 20,
    rebalanceInterval: "daily",
    exitZScore: 0.5,
    entryZScore: 2,
    bandMultiplier: 2,
    maxConcurrentPositions: 1,
};


export const riskSchemas: Record<string, ParameterField[]> = {
    "risk": [
        {
            name: "Stop Loss",
            key: "stopLoss",
            description: "Maximum loss per trade",
            type: "number",
            default: 5,
            min: 1,
            max: 10,
            step: 0.1,
            unit: "%",
            category: "core"
        },
        {
            name: "Take Profit",
            key: "takeProfit",
            description: "Profit target per trade",
            type: "number",
            default: 10,
            min: 5,
            max: 20,
            step: 0.1,
            unit: "%",
            category: "core"
        },
        {
            name: "Risk Per Trade",
            key: "riskPerTrade",
            description: "Maximum risk per trade as percentage of portfolio",
            type: "number",
            default: 2,
            min: 0.5,
            max: 5,
            step: 0.1,
            unit: "%",
            category: "core"
        },
        {
            name: "Max Positions",
            key: "maxConcurrentPositions",
            description: "Maximum number of concurrent positions",
            type: "number",
            default: 1,
            min: 1,
            max: 10,
            step: 1,
            category: "advanced"
        },
        {
            name: "Position Size",
            key: "positionSize",
            description: "Size of each position as percentage of portfolio",
            type: "number",
            default: 10,
            min: 5,
            max: 50,
            step: 1,
            unit: "%",
            category: "advanced"
        }
    ]
}

export const executionParameterSchemas: ParameterField[] = [
    {
        name: "Slippage",
        key: "slippage",
        description: "Simulated slippage as percentage of order price",
        type: "number",
        default: 0.1,
        min: 0,
        max: 1,
        step: 0.01,
        unit: "%",
        category: "core"
    },
    {
        name: "Commission",
        key: "commission",
        description: "Simulated commission as percentage of trade value",
        type: "number",
        default: 0.05,
        min: 0,
        max: 0.5,
        step: 0.01,
        unit: "%",
        category: "core"
    },
    {
        name: "Entry Delay",
        key: "entryDelay",
        description: "Number of bars (or ticks) to wait after signal before entry",
        type: "number",
        default: 1,
        min: 0,
        max: 10,
        step: 1,
        unit: "bars",
        category: "advanced"
    },
    {
        name: "Min Holding Period",
        key: "minHoldingPeriod",
        description: "Minimum number of bars to hold a position before exit allowed",
        type: "number",
        default: 3,
        min: 0,
        max: 50,
        step: 1,
        unit: "bars",
        category: "advanced"
    },
    {
        name: "Max Holding Period",
        key: "maxHoldingPeriod",
        description: "Maximum number of bars to hold a position before forced exit",
        type: "number",
        default: 10,
        min: 1,
        max: 500,
        step: 1,
        unit: "bars",
        category: "advanced"
    }
];




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


export interface LabRunBacktestRequest {
    templateId: number
    type: string
    subType?: string
    params: Record<string, any>,
    pairs: string
    timeframe: string
    initialCapital: number
    positionType: string
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