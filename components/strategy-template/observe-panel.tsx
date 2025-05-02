"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import {
    Calendar,
    Play,
    ArrowLeft,
    Info,
    History,
    Settings,
    Zap,
    Star,
    ChevronRight,
    Loader2,
    BarChart3,
    ChevronLeft,
} from "lucide-react"
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card"
import { toast } from "sonner"
import { cn, formatDuration } from "@/lib/utils"
import { Avatar, AvatarFallback } from "../ui/avatar"
import { BacktestData, BacktestMetrics, BacktestParameters } from "@/lib/api/backtest/types"
import { mockRunBacktest } from "@/lib/api/backtest/mock"
import { AlgorithmOption, algorithmOption, defaultParams2, executionParameterSchemas, fetchStrategyTemplateById, LabRunBacktestRequest, LabRunComparison, labRunHistory, LabRunHistory, labRunHistoryBacktest, labRunHistoryComparison, LabRunHistoryResponse, normalizeParams, parameterSchemas, riskSchemas, runLabBacktest, StrategyTemplate } from "@/lib/api/algorithms"
import StrategyTempleteObserveResultsLoadingSkeleton from "./observe-results-panel-skeleton"
import StrategyTempleteObserveResultsPanel from "./observe-results-panel"
import { useParams, useRouter } from "next/navigation"
import ConfigurationPanelSkeleton from "./observe-config-skeleton"
import { sub } from "date-fns"
import { MultiSelect } from "../ui/multi-select"
import router from "next/router"
import RunSelectionCard from "./comparison/run-selection-card"
import BasicTabContent from "./comparison/basic-tab-content"
import AdvancedTabContent from "./comparison/advanced-tab-content"
import { calculateExtendedMetrics, getBestMetricValues, mergeDrawdowns, mergeLines, prepareRadarData, prepareWinLossData } from "./comparison/chart-utils"
import StrategyObserveComparisonPanel from "./observe-comparison"
import DynamicStrategyParameters from "../parameters-configuration"

// ... keep your existing chart imports ...

const CURRENT_USER = "8lovelife"
const CURRENT_DATE = "2025-04-15 19:46:11"

// Add these interfaces at the top of your file
interface ParameterOptimization {
    param: string
    current: number
    suggested: number
    improvement: number
    confidence: number
    correlation: {
        param: string
        value: number
    }[]
}

interface OptimizationResult {
    expectedReturn: number
    winRate: number
    sharpeRatio: number
    maxDrawdown: number
    parameters: ParameterOptimization[]
}

interface StrategyType {
    id: string
    name: string
    description: string
    hasSubTypes?: boolean
}

const strategyTypes: StrategyType[] = [
    {
        id: "mean_reversion",
        name: "Mean Reversion",
        description: "Trade price reversals to the mean",
        hasSubTypes: true
    },
    {
        id: "trend_following",
        name: "Trend Following",
        description: "Follow established market trends"
    },
    {
        id: "momentum",
        name: "Momentum",
        description: "Capitalize on price momentum"
    }
]

const meanReversionTypes = [
    { id: "sma", name: "Simple Moving Average" },
    { id: "ema", name: "Exponential Moving Average" },
    { id: "wma", name: "Weighted Moving Average" },
    { id: "bollinger", name: "Bollinger Bands" }
]

const maCrossoverTypes = [
    { id: "sma", name: "Simple Moving Average" },
    { id: "ema", name: "Exponential Moving Average" },
    { id: "wma", name: "Weighted Moving Average" },
]

const timeframes = [
    { id: "1m", name: "1 Minute" },
    { id: "5m", name: "5 Minutes" },
    { id: "15m", name: "15 Minutes" },
    { id: "1h", name: "1 Hour" },
    { id: "4h", name: "4 Hours" },
    { id: "1d", name: "1 Day" }
]

// const defaultParams = {
//     fastPeriod: 10,
//     slowPeriod: 30,
//     maType: "sma",
//     entryThreshold: 1,
//     exitThreshold: 0.5,
//     stopLoss: 0.05,
//     takeProfit: 0.1,
//     riskPerTrade: 0.02,
//     positionSize: 0.3,
//     maxConcurrentPositions: 1,
//     slippage: 0.001,
//     commission: 0.0005,
//     entryDelay: 1,
//     minHoldingPeriod: 3,
//     maxHoldingPeriod: 10
// } as const

interface BacktestRun {
    id: string
    date: string
    params: Record<string, any>,
    performance: BacktestMetrics,
    duration: string
    status: string
}

// Add mock data
const optimizationResult: OptimizationResult = {
    expectedReturn: 35.2,
    winRate: 78,
    sharpeRatio: 2.8,
    maxDrawdown: -9.5,
    parameters: [
        {
            param: "lookbackPeriod",
            current: 20,
            suggested: 25,
            improvement: 15,
            confidence: 85,
            correlation: [
                { param: "entryThreshold", value: 0.75 },
                { param: "exitThreshold", value: -0.45 }
            ]
        },
        {
            param: "entryThreshold",
            current: 2,
            suggested: 2.5,
            improvement: 12,
            confidence: 82,
            correlation: [
                { param: "lookbackPeriod", value: 0.75 },
                { param: "stopLoss", value: 0.65 }
            ]
        },
        // Add more parameter optimizations...
    ]
}



// const recentRuns: BacktestRun[] = [
//     {
//         id: "BT-001",
//         date: "2025-04-15 19:50:22",
//         params: {
//             ...algorithmOption.defaultParameters,
//             lookbackPeriod: 25,
//             entryThreshold: 2.5
//         },
//         performance: {
//             returnRate: 32.5,
//             winRate: 75,
//             sharpeRatio: 2.6,
//             maxDrawdown: -10.2,
//             totalTrades: 145
//         },
//         duration: "2m 15s",
//         status: "completed"
//     },
//     {
//         id: "BT-002",
//         date: "2025-04-15 19:45:10",
//         params: algorithmOption.defaultParameters
//         ,
//         performance: {
//             returnRate: 28.5,
//             winRate: 72,
//             sharpeRatio: 2.4,
//             maxDrawdown: -12.5,
//             totalTrades: 156
//         },
//         duration: "2m 05s",
//         status: "completed"
//     },
//     // Add more runs...
// ]

// export interface Parameter {
//     name: string
//     key: keyof typeof defaultParams
//     description: string
//     min: number
//     max: number
//     step: number
//     unit?: string
//     category: "core" | "risk" | "position"
// }

// const parameters: Parameter[] = [
//     {
//         name: "Lookback Period",
//         key: "lookbackPeriod",
//         description: "Number of periods to calculate mean and standard deviation",
//         min: 5,
//         max: 100,
//         step: 1,
//         category: "core"
//     },
//     {
//         name: "Entry Threshold",
//         key: "entryThreshold",
//         description: "Number of standard deviations for entry signal",
//         min: 0.5,
//         max: 5,
//         step: 0.1,
//         unit: "σ",
//         category: "core"
//     },
//     {
//         name: "Exit Threshold",
//         key: "exitThreshold",
//         description: "Number of standard deviations for exit signal",
//         min: 0.1,
//         max: 2,
//         step: 0.1,
//         unit: "σ",
//         category: "core"
//     },
//     {
//         name: "Stop Loss",
//         key: "stopLoss",
//         description: "Maximum loss per trade",
//         min: 0.5,
//         max: 10,
//         step: 0.1,
//         unit: "%",
//         category: "risk"
//     },
//     {
//         name: "Take Profit",
//         key: "takeProfit",
//         description: "Profit target per trade",
//         min: 1,
//         max: 20,
//         step: 0.1,
//         unit: "%",
//         category: "risk"
//     },
//     {
//         name: "Position Size",
//         key: "positionSize",
//         description: "Size of each position as percentage of portfolio",
//         min: 1,
//         max: 100,
//         step: 1,
//         unit: "%",
//         category: "position"
//     },
//     {
//         name: "Risk Per Trade",
//         key: "riskPerTrade",
//         description: "Maximum risk per trade as percentage of portfolio",
//         min: 0.1,
//         max: 5,
//         step: 0.1,
//         unit: "%",
//         category: "risk"
//     },
//     {
//         name: "Max Positions",
//         key: "maxPositions",
//         description: "Maximum number of concurrent positions",
//         min: 1,
//         max: 10,
//         step: 1,
//         category: "position"
//     },
//     {
//         name: "Min Volume",
//         key: "minVolume",
//         description: "Minimum 24h trading volume for asset selection",
//         min: 100000,
//         max: 10000000,
//         step: 100000,
//         unit: "USDT",
//         category: "position"
//     }
// ]

const GRID_PRESETS: Record<string, number[]> = {
    fastPeriod: [5, 10, 15],
    slowPeriod: [20, 30, 50],
    entryThreshold: [1, 2],
    exitThreshold: [0.5, 1],
    stopLoss: [3, 5],
    takeProfit: [8, 10],
    positionSize: [2, 3],
}

const optimizedParams = {
    lookbackPeriod: 25,
    entryThreshold: 2.5,
    exitThreshold: 0.4,
    stopLoss: 1.8,
    takeProfit: 4.5,
    positionSize: 80,
    riskPerTrade: 0.8,
    maxPositions: 4,
    minVolume: 2000000
}

const mockFetchDefaultParams = async (templateId: string) => {
    // Simulate an API call
    return new Promise((resolve) => {
        setTimeout(() => {
            const defaultParams = {
                fastPeriod: 10,
                slowPeriod: 30,
                maType: "sma",
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
            resolve(defaultParams);
        }, 500); // Simulate a 500ms API call
    });
};

const optimizeParams = [
    { name: "Fast Period", key: "fastPeriod" },
    { name: "Slow Period", key: "slowPeriod" },
    { name: "Entry Threshold", key: "entryThreshold" },
    { name: "Exit Threshold", key: "exitThreshold" },
    // { name: "Risk Per Trade", key: "riskPerTrade" },
    // { name: "Stop Loss", key: "stopLoss" }
]

export default function StrategyTempleteObservePage() {

    const pathParams = useParams()
    const router = useRouter();


    const [isRunning, setIsRunning] = useState(false)
    const [params, setParams] = useState<Record<string, any>>()
    const [algorithmOption, setAlgorithmOption] = useState<StrategyTemplate>()
    const [selectedAssets, setSelectedAssets] = useState<string[]>(["BTC/USDT"])
    const [activeTab, setActiveTab] = useState("parameters")
    const [backtestData, setBacktestData] = useState<BacktestData | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
    const [configPanelExpanded, setConfigPanelExpanded] = useState(false);




    // Add new state variables
    const [selectedStrategy, setSelectedStrategy] = useState("ma-crossover")
    // const [selectedMeanType, setSelectedMeanType] = useState("sma")
    const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
    const [selectedBenchmark, setSelectedBenchmark] = useState("BTC/USDT")
    const [selectedPairs, setSelectedPairs] = useState("BTC/USDT")
    const [initialCapital, setInitialCapital] = useState(10000)
    const [direction, setDirection] = useState<"long" | "short" | "both">("both")
    const [showAdvanced, setShowAdvanced] = useState(false)
    const [rangeInputs, setRangeInputs] = useState<Record<string, number[]>>(
        Object.fromEntries(
            Object.keys(GRID_PRESETS).map(k => [k, []])
        )
    )
    const [selected, setSelected] = useState<number[]>([]);

    const [gridResults, setGridResults] = useState<any[]>([])
    const [bestParams, setBestParams] = useState<Record<string, any> | null>(null)

    const [runHistory, setRunHistory] = useState<LabRunHistoryResponse>()
    const [selectedRun, setSelectedRun] = useState(() => runHistory?.historys?.[0] || null);
    const [runsToBacktest, setRunsToBacktest] = useState<Record<number, LabRunComparison>>({});
    const [pareto, setPareto] = useState<number[]>([]);
    const [isComparisonLoading, setIsComparisonLoading] = useState(false)

    const templateId = typeof pathParams.id === "string" ? pathParams.id : "1"


    // const handleRangeInputChange = (key: string, value: string) => {
    //     setRangeInputs((prev) => ({ ...prev, [key]: value }))
    // }


    // Update the viewComparisonResults function
    const viewComparisonResults = (templateId: string) => {

        console.log("templateId", templateId)

        // If latestVersion is undefined, don't include it in the URL
        // This will show the empty state in the backtest page
        router.push(`/lab/${templateId}/observe/comparison`)
    }


    function generateCombinations(grid: Record<string, number[]>): Record<string, any>[] {
        const keys = Object.keys(grid)
        const cartesian = (arr: number[][]): number[][] =>
            arr.reduce((acc, val) =>
                acc.flatMap(d => val.map(v => [...d, v])), [[]]
            )

        const values = Object.values(grid)
        return cartesian(values).map(comb =>
            Object.fromEntries(comb.map((v, i) => [keys[i], v]))
        )
    }


    const handleRunGridSearch = async () => {
        const parsedGrid = rangeInputs

        const allCombos = generateCombinations(parsedGrid)
        const backtestRequest = {
            templateId: parseInt(templateId),
            type: selectedStrategy,
            gridParams: parsedGrid,
            pairs: selectedPairs,
            timeframe: selectedTimeframe,
            initialCapital: initialCapital,
            positionType: direction
        }

        console.log("Grid search request:", JSON.stringify(backtestRequest))
        // const results = []
        // for (const combo of allCombos) {
        //     const result = await runLabBacktest({ ...backtestRequest, params: combo })
        //     results.push({ ...result.data.metrics, params: combo })
        // }

        // // sort by return - drawdown
        // const sorted = results.sort((a, b) => (b.strategyReturn - b.maxDrawdown) - (a.strategyReturn - a.maxDrawdown))
        // setGridResults(sorted)
        // setBestParams(sorted[0]?.params)
    }

    const loadTemplateParameters = async () => {
        try {
            setIsLoading(true)
            if (templateId) {
                const fetchedParams = await fetchStrategyTemplateById(templateId);
                const combinedDefaults: Record<string, any> = {
                    ...fetchedParams.parameters.default,
                    ...fetchedParams.risk,
                    ...fetchedParams.execution
                }
                setParams(combinedDefaults);
                setAlgorithmOption(fetchedParams);
                setSelectedStrategy(fetchedParams.type)
                loadRunHistoryData(parseInt(templateId))
                return fetchedParams.latest_lab_backtest_version;
            }

        } catch (error) {
            console.error("Failed to load latest template parameters:", error)
        } finally {
            setIsLoading(false)

        }
    }
    useEffect(() => {
        (async () => {
            const latestVersion = await loadTemplateParameters();
            if (latestVersion !== undefined) {
                await loadLatestBacktest(latestVersion);
            }
        })();
    }, [templateId]);

    // useEffect(() => {
    //     loadLatestBacktest()
    // }, [])

    useEffect(() => {
        const ids: number[] = [];
        const list = effectiveSelected
            .map(id => runsToBacktest[id])
            .filter(Boolean);
        list.forEach(a => {
            const dom = list.some(b =>
                b.runId !== a.runId &&
                b.backtestData.metrics.strategyReturn >= a.backtestData.metrics.strategyReturn &&
                b.backtestData.metrics.maxDrawdown <= a.backtestData.metrics.maxDrawdown &&
                b.backtestData.metrics.sharpeRatio >= a.backtestData.metrics.sharpeRatio &&
                (
                    b.backtestData.metrics.strategyReturn > a.backtestData.metrics.strategyReturn ||
                    b.backtestData.metrics.maxDrawdown < a.backtestData.metrics.maxDrawdown ||
                    b.backtestData.metrics.sharpeRatio > a.backtestData.metrics.sharpeRatio
                )
            );

            if (!dom) ids.push(a.runId);
        });

        setPareto(ids);
    }, [selected, runsToBacktest]);


    const renderResultsPanel = () => {
        if (isInitialLoad || isLoading) {
            return <StrategyTempleteObserveResultsLoadingSkeleton />
        }

        if (!backtestData || !selectedRun) {
            return (
                <Card className="col-span-1 md:col-span-2">
                    <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-medium">No Backtest Results</h3>
                            <p className="text-sm text-muted-foreground">
                                Configure parameters and run a backtest to see results here
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setActiveTab("parameters")}
                        >
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Parameters
                        </Button>
                    </div>
                </Card>
            )
        }

        return <StrategyTempleteObserveResultsPanel data={backtestData} isLoading={isLoading} templateId={templateId} version={selectedRun.id} strategy={selectedStrategy} />
    }

    const loadLatestBacktest = async (version) => {
        try {
            setIsLoading(true)
            const response = await labRunHistoryBacktest(parseInt(templateId), version);
            if (response.success) {
                setBacktestData(response.data)
            }

        } catch (error) {
            console.error("Failed to load latest backtest:", error)
        } finally {
            setIsLoading(false)
            setIsInitialLoad(false)
        }
    }


    const loadHistoryBacktest = async (latestRun) => {
        try {

            setIsInitialLoad(true);
            let version = latestRun.id;
            setSelectedRun(latestRun)
            const response = await labRunHistoryBacktest(parseInt(templateId), version)
            if (response.success) {
                setBacktestData(response.data)
            }
        } catch (error) {
            console.error("Failed to load latest backtest:", error)
        } finally {
            setIsInitialLoad(false)
        }
    }

    const fetchComparisonData = async () => {
        try {
            setIsComparisonLoading(true);
            const comparisonData = await labRunHistoryComparison(parseInt(templateId));
            if (comparisonData?.length) {
                setSelected([comparisonData[0].runId]);
                setRunsToBacktest(Object.fromEntries(comparisonData.map(item => [item.runId, item])));
            }
        } catch (err) {
            console.error("Failed to fetch run backtest data", err);
        } finally {
            setIsComparisonLoading(false);
        }
    };



    const runBacktestData = async (customParams: LabRunBacktestRequest) => {
        try {
            setIsInitialLoad(true)


            const response = await runLabBacktest(customParams);
            if (response.success) {
                setBacktestData(response.data)
            } else {
                throw new Error(response.error || "Failed to run backtest")
            }


            // Fetch the latest run history after running the backtest
            const data = await labRunHistory(customParams.templateId);
            setSelectedRun(data.historys?.[0] || null)
            setRunHistory(data)

        } catch (err) {
            console.error("Failed to fetch backtest data:", err)
            // Show error message to user
            alert("Failed to run backtest. Please try again.")
        } finally {
            setIsInitialLoad(false)
        }
    }

    const loadRunHistoryData = async (templateId: number) => {
        try {
            const data = await labRunHistory(templateId);
            setSelectedRun(data.historys?.[0] || null)
            setRunHistory(data)
        } catch (err) {
            console.error("Failed to fetch backtest data:", err)
        }
    }


    // const validateParam = (param: Parameter, value: number) => {
    //     if (value < param.min || value > param.max) {
    //         toast.error(`${param.name} must be between ${param.min} and ${param.max}`)
    //         return false
    //     }
    //     return true
    // }

    // const handleParamChange = (param: Parameter, value: string) => {
    //     const numValue = parseFloat(value)
    //     if (validateParam(param, numValue)) {
    //         setParams(prev => ({
    //             ...prev,
    //             [param.key]: numValue
    //         }))
    //     }
    // }

    const applyOptimizedParams = () => {
        setParams(optimizedParams)
        toast.success("Applied optimized parameters")
    }

    const resetToDefault = () => {
        setParams(defaultParams2)
        toast.success("Reset to default parameters")
    }

    const resetAdvancedToNull = () => {
        const paramsSchema = parameterSchemas[selectedStrategy] || [];
        const riskSchema = riskSchemas["risk"] || [];
        const executionSchema = executionParameterSchemas || [];
        const combinedSchema = [
            ...paramsSchema,
            ...riskSchema,
            ...executionSchema
        ];

        const advancedKeys = combinedSchema
            .filter(field => field.category === "advanced")
            .map(field => field.key);

        setParams(prev => {
            const next = { ...prev };
            for (const key of advancedKeys) {
                next[key] = null;
            }
            return next;
        });
    }

    const runBacktest = () => {

        setIsRunning(true)


        const paramsSchema = parameterSchemas[selectedStrategy] || [];
        const riskSchema = riskSchemas["risk"] || [];
        const executionSchema = executionParameterSchemas || [];
        const combinedSchema = [
            ...paramsSchema,
            ...riskSchema,
            ...executionSchema
        ];
        const normalized = normalizeParams(params, combinedSchema)

        const backtestRequest = {
            templateId: parseInt(templateId),
            type: selectedStrategy,
            params: normalized,
            pairs: selectedPairs,
            timeframe: selectedTimeframe,
            initialCapital: initialCapital,
            positionType: direction
        }

        runBacktestData(backtestRequest)

        setIsRunning(false)
    }

    useEffect(() => {
        if (activeTab !== "comparison") return
        if (isComparisonLoading) return
        fetchComparisonData()
    }, [activeTab, templateId])


    const toggle = (id: number) => {
        setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);
    };


    const effectiveSelected: number[] = selected.map(id => typeof id === "string" ? parseInt(id, 10) : id);

    // const palette = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b"]

    const palette = [
        "rgba(137, 170, 255, 0.7)",
        "rgba(180, 210, 255, 0.7)",
        "rgba(120, 168, 255, 0.7)",
        "rgba(155, 185, 230, 0.7)",

        "rgba(160, 175, 210, 0.7)",
        "rgba(180, 195, 205, 0.7)",
        "rgba(170, 185, 200, 0.7)",
        "rgba(145, 160, 175, 0.7)",

        "rgba(150, 210, 220, 0.7)",
        "rgba(170, 200, 190, 0.7)",
        "rgba(135, 185, 175, 0.7)",
        "rgba(120, 200, 200, 0.7)",

        "rgba(190, 200, 230, 0.7)",
        "rgba(200, 210, 250, 0.7)",
        "rgba(170, 170, 210, 0.7)",
        "rgba(160, 180, 230, 0.7)",

        "rgba(200, 180, 210, 0.7)",
        "rgba(215, 190, 220, 0.7)",
        "rgba(195, 175, 200, 0.7)",
        "rgba(225, 205, 230, 0.7)"
    ]


    // Data for charts
    const lineData = mergeLines(effectiveSelected, runsToBacktest);
    const drawdownData = mergeDrawdowns(effectiveSelected, runsToBacktest);
    const winLossData = prepareWinLossData(effectiveSelected, runsToBacktest);
    const radarData = prepareRadarData(effectiveSelected, runsToBacktest);
    const scatter = effectiveSelected.map((id, idx) => {
        const numericId = typeof id === "string" ? parseInt(id, 10) : id;

        return {
            id: numericId,
            ret: runsToBacktest[numericId]?.backtestData?.metrics.strategyReturn,
            dd: runsToBacktest[numericId]?.backtestData?.metrics.maxDrawdown,
            sharpe: runsToBacktest[numericId]?.backtestData?.metrics.sharpeRatio,
            color: pareto.includes(numericId) ? "#ff7f0e" : ["#1f77b4", "#2ca02c", "#d62728", "#9467bd"][idx % 4]
        };
    });


    const runsToParameters = Object.fromEntries(
        (runHistory?.historys ?? []).map(run => [Number(run.id), run.parameters])
    )

    const months = Array.from(new Set(
        effectiveSelected.flatMap(id => {
            const run = runsToBacktest?.[id];
            return run?.backtestData?.monthlyReturns?.map(m => m.month) ?? [];
        })
    )).sort();

    const monthlyData = months.map(m => {
        const row: any = { month: m }
        effectiveSelected.forEach(id => {
            const rec = runsToBacktest[id].backtestData.monthlyReturns.find(x => x.month === m)
            if (rec) row[`run${id}`] = +(+rec.strategyReturn * 100).toFixed(2)
        })
        return row
    })

    const metricsTableData = effectiveSelected
        .map(id => {
            const run = runsToBacktest[id]?.backtestData;
            if (!run) return null;
            return {
                id,
                ...calculateExtendedMetrics(run)
            };
        })
        .filter(Boolean);

    const bestValues = getBestMetricValues(metricsTableData);

    const gridColsClass = sidebarCollapsed ? "grid-cols-1" : "md:grid-cols-3"

    return (
        <div className="flex min-h-screen flex-col">
            <main className="flex-1 space-y-4 p-4 md:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Button variant="outline" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            {isLoading || !algorithmOption ? (
                                <div className="space-y-2">
                                    <div className="h-8 w-48 bg-muted animate-pulse rounded-md" />
                                    <div className="h-4 w-64 bg-muted animate-pulse rounded-md" />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2">
                                        <h1 className="text-2xl font-bold">{algorithmOption.name}</h1>
                                        <Badge variant="secondary">v1.0.0</Badge>
                                    </div>
                                    <p className="text-muted-foreground">
                                        {algorithmOption.description}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    {/* <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                            <Avatar className="border-2 border-background">
                                <AvatarFallback>TM</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <div className="font-medium">tradingmaster</div>
                                <div className="text-xs text-muted-foreground">
                                    Strategy Author
                                </div>
                            </div>
                        </div>
                        <Separator orientation="vertical" className="h-8" />
                        <div className="flex items-center gap-2">
                            <Avatar>
                                <AvatarFallback>{CURRENT_USER[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="text-sm">
                                <div className="font-medium">{CURRENT_USER}</div>
                                <div className="text-xs text-muted-foreground">
                                    {CURRENT_DATE} UTC
                                </div>
                            </div>
                        </div>
                    </div> */}
                </div>

                <div
                    className={`grid grid-cols-1 ${configPanelExpanded ? "md:grid-cols-1" : sidebarCollapsed ? "" : "md:grid-cols-3"
                        } gap-4`}
                >                    {/* Configuration Panel */}
                    <div className="relative">

                        {!sidebarCollapsed && (
                            <div className="space-y-4">
                                {isLoading ? (
                                    <ConfigurationPanelSkeleton />
                                ) : (


                                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                                        <TabsList className="grid w-full grid-cols-4">
                                            <TabsTrigger value="parameters">
                                                <Settings className="h-4 w-4 mr-2" />
                                                Run Backtest
                                            </TabsTrigger>
                                            <TabsTrigger value="optimize" disabled={true}>
                                                <Zap className="h-4 w-4 mr-2" />
                                                Optimize
                                            </TabsTrigger>
                                            <TabsTrigger value="history" disabled={isRunning}>
                                                <History className="h-4 w-4 mr-2" />
                                                History
                                            </TabsTrigger>
                                            <TabsTrigger value="comparison">
                                                <BarChart3 className="h-4 w-4 mr-2" />
                                                Comparison
                                            </TabsTrigger>
                                        </TabsList>

                                        <TabsContent value="parameters">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Backtest Configuration</CardTitle>
                                                    <CardDescription>Configure strategy and market parameters for backtesting</CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        {/* Trading Pairs */}
                                                        <div className="space-y-2">
                                                            <Label>Trading Pairs</Label>
                                                            <Select value={selectedPairs} onValueChange={setSelectedPairs}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select trading pairs" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
                                                                    <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
                                                                    <SelectItem value="BNB/USDT">SOL/USDT</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Timeframe */}
                                                        <div className="space-y-2">
                                                            <Label>Timeframe</Label>
                                                            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Select timeframe" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    {timeframes.map(tf => (
                                                                        <SelectItem key={tf.id} value={tf.id}>
                                                                            {tf.name}
                                                                        </SelectItem>
                                                                    ))}
                                                                </SelectContent>
                                                            </Select>
                                                        </div>

                                                        {/* Add Initial Capital Input */}
                                                        <div className="space-y-2">
                                                            <Label>Initial Capital</Label>
                                                            <div className="flex items-center gap-2">
                                                                <Input
                                                                    type="number"
                                                                    value={initialCapital}
                                                                    onChange={(e) => setInitialCapital(Number(e.target.value))}
                                                                    min={1000}
                                                                    step={1000}
                                                                />
                                                                <span className="text-xs text-muted-foreground w-8">USDT</span>

                                                            </div>
                                                        </div>


                                                        <div className="space-y-2">
                                                            <Label>Direction</Label>
                                                            <Select value={direction} onValueChange={(v) => setDirection(v as any)}>
                                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="long">Long Only</SelectItem>
                                                                    <SelectItem value="short">Short Only</SelectItem>
                                                                    <SelectItem value="both">Long & Short</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>


                                                    </div>
                                                    <Separator />

                                                    {/* Core Parameters */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label>Core Parameters</Label>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={resetToDefault}
                                                                className="h-8"
                                                            >
                                                                <Settings className="h-4 w-4 mr-2" />
                                                                Reset
                                                            </Button>
                                                        </div>

                                                        <DynamicStrategyParameters
                                                            strategyType={selectedStrategy}
                                                            category="core"
                                                            params={params}
                                                            schemas={parameterSchemas[selectedStrategy]}
                                                            onChange={setParams}
                                                        />



                                                        {/* <DynamicStrategyParameters
                                                            strategyType={selectedStrategy}
                                                            category="core"
                                                            params={params}
                                                            schemas={riskSchemas["risk"]}
                                                            onChange={setParams}
                                                        /> */}

                                                    </div>

                                                    {/* Risk Parameters */}
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between">
                                                            <Label>Risk Parameters</Label>
                                                        </div>

                                                        <DynamicStrategyParameters
                                                            strategyType={selectedStrategy}
                                                            category="core"
                                                            params={params}
                                                            schemas={riskSchemas["risk"]}
                                                            onChange={setParams}
                                                        />
                                                    </div>

                                                    {/* Advanced Parameters Section */}
                                                    <div className="space-y-4">
                                                        <Button
                                                            variant="ghost"
                                                            className="w-full justify-between"
                                                            onClick={() => setShowAdvanced(!showAdvanced)}
                                                        >
                                                            <span>Advanced Parameters</span>
                                                            <ChevronRight className={cn(
                                                                "h-4 w-4 transition-transform",
                                                                showAdvanced && "transform rotate-90"
                                                            )} />
                                                        </Button>

                                                        {showAdvanced && (
                                                            <div className="space-y-6">
                                                                <DynamicStrategyParameters
                                                                    strategyType={selectedStrategy}
                                                                    category="advanced"
                                                                    params={params}
                                                                    schemas={parameterSchemas[selectedStrategy]}
                                                                    onChange={setParams}
                                                                />
                                                                <DynamicStrategyParameters
                                                                    strategyType={selectedStrategy}
                                                                    category="advanced"
                                                                    params={params}
                                                                    schemas={riskSchemas["risk"]}
                                                                    onChange={setParams}
                                                                />

                                                                <DynamicStrategyParameters
                                                                    strategyType={selectedStrategy}
                                                                    category="advanced"
                                                                    params={params}
                                                                    schemas={executionParameterSchemas}
                                                                    onChange={setParams}
                                                                />


                                                                <DynamicStrategyParameters
                                                                    strategyType={selectedStrategy}
                                                                    category="core"
                                                                    params={params}
                                                                    schemas={executionParameterSchemas}
                                                                    onChange={setParams}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button
                                                        className="w-full"
                                                        onClick={runBacktest}
                                                        disabled={isRunning}
                                                    >
                                                        {isRunning ? (
                                                            <>Running Backtest...</>
                                                        ) : (
                                                            <>
                                                                <Play className="h-4 w-4 mr-2" />
                                                                Run Backtest
                                                            </>
                                                        )}
                                                    </Button>
                                                </CardFooter>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="optimize">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Grid Search Optimization</CardTitle>
                                                    <CardDescription>
                                                        Define parameter ranges and run batch optimization using grid search.
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent className="space-y-6">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        {/* Parameter Ranges UI */}
                                                        {optimizeParams.map((param) => (
                                                            <div key={param.key} className="space-y-2">
                                                                <Label>{param.name}</Label>

                                                                <MultiSelect
                                                                    values={rangeInputs[param.key] || []}
                                                                    options={GRID_PRESETS[param.key] ?? []}
                                                                    placeholder="Select..."
                                                                    onChange={(newArr) =>
                                                                        setRangeInputs(prev => ({ ...prev, [param.key]: newArr }))
                                                                    }
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>

                                                    <div className="flex items-center justify-between">
                                                        <div className="text-sm text-muted-foreground">
                                                            Total Combinations:
                                                        </div>
                                                        <Button onClick={handleRunGridSearch}>
                                                            <Zap className="h-4 w-4 mr-2" />
                                                            Run Grid Search
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                                <CardFooter>
                                                    <Button disabled={!bestParams}>
                                                        Apply Best Result
                                                    </Button>
                                                </CardFooter>
                                            </Card>

                                            {/* Optimization Result Table */}
                                            {gridResults.length > 0 && (
                                                <Card className="mt-6">
                                                    <CardHeader>
                                                        <CardTitle>Optimization Results</CardTitle>
                                                        <CardDescription>Sorted by Return - Drawdown</CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <table className="w-full text-sm">
                                                            <thead>
                                                                <tr className="border-b">
                                                                    <th className="text-left py-1">Return</th>
                                                                    <th className="text-left py-1">Drawdown</th>
                                                                    <th className="text-left py-1">Sharpe</th>
                                                                    <th className="text-left py-1">Params</th>
                                                                </tr>
                                                            </thead>
                                                            {/* <tbody>
                                                        {gridResults.map((res, i) => (
                                                            <tr key={i} className="border-b hover:bg-muted/50 cursor-pointer">
                                                                <td className="py-1 text-green-500 font-medium">{res.strategyReturn}%</td>
                                                                <td className="py-1 text-red-500">{res.maxDrawdown}%</td>
                                                                <td className="py-1">{res.sharpeRatio}</td>
                                                                <td className="py-1">
                                                                    {Object.entries(res.params).map(([k, v]) => (
                                                                        <Badge key={k} variant="outline" className="mr-1">{k}: {v}</Badge>
                                                                    ))}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody> */}
                                                        </table>
                                                    </CardContent>
                                                </Card>
                                            )}
                                        </TabsContent>

                                        {/* <TabsContent value="history">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Recent Backtests</CardTitle>
                                            <CardDescription>
                                                Your previous backtest runs
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                        </CardContent>
                                    </Card>
                                </TabsContent> */}

                                        <TabsContent value="optimize">
                                            <div className="space-y-4">
                                                <Card>
                                                    <CardHeader>
                                                        <CardTitle>Parameter Optimization</CardTitle>
                                                        <CardDescription>
                                                            AI-powered parameter suggestions based on historical data
                                                        </CardDescription>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-6">
                                                            {/* Expected Performance */}
                                                            <div>
                                                                <h4 className="text-sm font-medium mb-4">Expected Performance</h4>
                                                                <div className="grid grid-cols-4 gap-4">
                                                                    <div className="bg-muted/50 p-3 rounded-lg">
                                                                        <div className="text-xs text-muted-foreground">Return</div>
                                                                        <div className="text-lg font-bold text-green-500">
                                                                            +{optimizationResult.expectedReturn}%
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-muted/50 p-3 rounded-lg">
                                                                        <div className="text-xs text-muted-foreground">Win Rate</div>
                                                                        <div className="text-lg font-bold">
                                                                            {optimizationResult.winRate}%
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-muted/50 p-3 rounded-lg">
                                                                        <div className="text-xs text-muted-foreground">Sharpe</div>
                                                                        <div className="text-lg font-bold">
                                                                            {optimizationResult.sharpeRatio}
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-muted/50 p-3 rounded-lg">
                                                                        <div className="text-xs text-muted-foreground">Drawdown</div>
                                                                        <div className="text-lg font-bold text-red-500">
                                                                            {optimizationResult.maxDrawdown}%
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Parameter Suggestions */}
                                                            <div>
                                                                <h4 className="text-sm font-medium mb-4">Suggested Parameters</h4>
                                                                <div className="space-y-4">
                                                                    {optimizationResult.parameters.map((param) => (
                                                                        <div
                                                                            key={param.param}
                                                                            className="bg-muted/30 p-4 rounded-lg space-y-3"
                                                                        >
                                                                            <div className="flex items-center justify-between">
                                                                                <div>
                                                                                    <div className="font-medium">{param.param}</div>
                                                                                    <div className="text-sm text-muted-foreground">
                                                                                        Expected improvement: +{param.improvement}%
                                                                                    </div>
                                                                                </div>
                                                                                <Badge variant="secondary">
                                                                                    {param.confidence}% confidence
                                                                                </Badge>
                                                                            </div>

                                                                            <div className="grid grid-cols-2 gap-4">
                                                                                <div>
                                                                                    <div className="text-sm text-muted-foreground">Current</div>
                                                                                    <div className="text-lg">{param.current}</div>
                                                                                </div>
                                                                                <div>
                                                                                    <div className="text-sm text-muted-foreground">Suggested</div>
                                                                                    <div className="text-lg font-medium text-primary">
                                                                                        {param.suggested}
                                                                                    </div>
                                                                                </div>
                                                                            </div>

                                                                            <div>
                                                                                <div className="text-sm text-muted-foreground mb-2">
                                                                                    Parameter Correlations
                                                                                </div>
                                                                                <div className="flex gap-2">
                                                                                    {param.correlation.map((corr) => (
                                                                                        <Badge
                                                                                            key={corr.param}
                                                                                            variant="outline"
                                                                                            className={cn(
                                                                                                "cursor-help",
                                                                                                corr.value > 0 ? "text-green-500" : "text-red-500"
                                                                                            )}
                                                                                        >
                                                                                            {corr.param}: {corr.value > 0 ? "+" : ""}{corr.value}
                                                                                        </Badge>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                    <CardFooter className="flex gap-2">
                                                        <Button
                                                            className="flex-1"
                                                            onClick={applyOptimizedParams}
                                                        >
                                                            <Zap className="h-4 w-4 mr-2" />
                                                            Apply All Suggestions
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                        // onClick={() => setIsOptimizing(true)}
                                                        >
                                                            <Settings className="h-4 w-4 mr-2" />
                                                            Run New Optimization
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            </div>
                                        </TabsContent>

                                        <TabsContent value="history">
                                            <Card>
                                                <CardHeader>
                                                    <CardTitle>Backtest History</CardTitle>
                                                    <CardDescription>
                                                        Your recent 10 backtest runs and their results
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="space-y-4">
                                                        {runHistory?.historys?.map((run) => (
                                                            <div
                                                                key={run.id}
                                                                className={cn(
                                                                    "flex flex-col space-y-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
                                                                    selectedRun?.id === run.id && "border-second bg-muted"
                                                                )} onClick={() => loadHistoryBacktest(run)}
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="font-medium">Run {run.id}</div>
                                                                        <Badge variant="outline">
                                                                            {run.status}
                                                                        </Badge>
                                                                    </div>
                                                                    <div className="text-sm text-muted-foreground">
                                                                        {new Date(run.startTime).toLocaleString()}
                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-5 gap-4">
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Return</div>
                                                                        <div className="text-sm font-medium text-green-500">
                                                                            {Number(run.performance.strategyReturn * 100).toFixed(2)}%
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Win Rate</div>
                                                                        <div className="text-sm font-medium">
                                                                            {Number(run.performance.winRate * 100).toFixed(2)}%
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Sharpe</div>
                                                                        <div className="text-sm font-medium">
                                                                            {Number(run.performance.sharpeRatio).toFixed(2)}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Drawdown</div>
                                                                        <div className="text-sm font-medium text-red-500">
                                                                            {Number(run.performance.maxDrawdown * 100).toFixed(2)}%
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Duration</div>
                                                                        <div className="text-sm font-medium">
                                                                            {formatDuration(run.startTime, run.endTime)}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* New grid for the additional parameters */}
                                                                <div className="grid grid-cols-5 gap-4">
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Mean Type</div>
                                                                        <div className="text-sm font-medium">
                                                                            {run.marketDetails.subType || "-"}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Trading Pair</div>
                                                                        <div className="text-sm font-medium">
                                                                            {run.marketDetails.pairs || "-"}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Timeframe</div>
                                                                        <div className="text-sm font-medium">
                                                                            {run.marketDetails.timeframe || "-"}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Initial Capital</div>
                                                                        <div className="text-sm font-medium">
                                                                            {run.marketDetails.initialCapital ? `$${run.marketDetails.initialCapital}` : "-"}
                                                                        </div>
                                                                    </div>
                                                                    <div>
                                                                        <div className="text-xs text-muted-foreground">Direction</div>
                                                                        <div className="text-sm font-medium">
                                                                            {run.marketDetails.positionType || "-"}
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* <div className="flex gap-2 flex-wrap">
                                                                    {Object.entries(run.parameters)
                                                                        .filter(([key, value]) =>
                                                                            value !== defaultParams2[key as keyof typeof defaultParams2]
                                                                        )
                                                                        .map(([key, value]) => (
                                                                            <Badge key={key} variant="outline">
                                                                                {key}: {value}
                                                                            </Badge>
                                                                        ))
                                                                    }
                                                                </div> */}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </CardContent>
                                                {/* <CardFooter>
                                                    <Button variant="outline" className="w-full">
                                                        <History className="h-4 w-4 mr-2" />
                                                        View Full History
                                                    </Button>
                                                </CardFooter> */}
                                            </Card>
                                        </TabsContent>


                                        <TabsContent value="comparison">
                                            <RunSelectionCard
                                                runHistorys={runHistory?.historys}
                                                selected={selected}
                                                toggle={toggle}
                                                onApply={() => { }}
                                            />
                                        </TabsContent>
                                    </Tabs>)}
                            </div>
                        )}

                    </div>

                    {/* Results Panel - Add sticky positioning */}
                    {!configPanelExpanded && (

                        <div className={sidebarCollapsed ? "" : "md:col-span-2"}>

                            <div className="sticky top-4">

                                {/* 
                                <button
                                    onClick={() => setConfigPanelExpanded((prev) => !prev)}
                                    className="absolute top-1/4 -right-3 transform -translate-y-1/2 bg-background border rounded-full p-1 shadow hover:bg-muted transition-colors z-20"
                                >
                                    {configPanelExpanded ? (
                                        <ChevronLeft className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button> */}

                                <button
                                    onClick={() => setSidebarCollapsed(prev => !prev)}
                                    className="absolute top-1/2 -left-3 transform -translate-y-1/2 bg-background border rounded-full p-1 shadow hover:bg-muted transition-colors"
                                >
                                    {sidebarCollapsed
                                        ? <ChevronRight className="h-4 w-4" />
                                        : <ChevronLeft className="h-4 w-4" />
                                    }
                                </button>


                                {activeTab === "comparison"
                                    ? (
                                        <StrategyObserveComparisonPanel
                                            selected={selected}
                                            runs={runsToBacktest}
                                            lineData={lineData}
                                            monthlyData={monthlyData}
                                            scatter={scatter}
                                            pareto={pareto}
                                            drawdownData={drawdownData}
                                            radarData={radarData}
                                            winLossData={winLossData}
                                            metricsTableData={metricsTableData}
                                            bestValues={bestValues}
                                            palette={palette}
                                            runsToParameters={runsToParameters}
                                            strategyKey={selectedStrategy}
                                        />
                                    )
                                    : renderResultsPanel()
                                }

                            </div>
                        </div>)}


                </div>
            </main >
        </div >
    )
}