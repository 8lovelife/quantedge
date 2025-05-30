// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Separator } from "@/components/ui/separator"
// import { Badge } from "@/components/ui/badge"
// import {
//     Calendar,
//     Play,
//     ArrowLeft,
//     Info,
//     History,
//     Settings,
//     Zap,
//     Star,
//     ChevronRight,
//     Loader2,
// } from "lucide-react"
// import {
//     HoverCard,
//     HoverCardContent,
//     HoverCardTrigger,
// } from "@/components/ui/hover-card"
// import { toast } from "sonner"
// import { cn } from "@/lib/utils"
// import { Avatar, AvatarFallback } from "../ui/avatar"
// import ResultsPanel from "./results-panel"
// import { BacktestData, BacktestParameters } from "@/lib/api/backtest/types"
// import { mockRunBacktest } from "@/lib/api/backtest/mock"
// import ResultsLoadingSkeleton from "./results-panel-skeleton"
// import DynamicStrategyParameters from "../strategy-builder/strategy-dynamic-parameters"
// import { parameterSchemas, riskSchemas } from "@/lib/api/algorithms"
// import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"

// // ... keep your existing chart imports ...

// const CURRENT_USER = "8lovelife"
// const CURRENT_DATE = "2025-04-15 19:46:11"

// // Add these interfaces at the top of your file
// interface ParameterOptimization {
//     param: string
//     current: number
//     suggested: number
//     improvement: number
//     confidence: number
//     correlation: {
//         param: string
//         value: number
//     }[]
// }

// interface OptimizationResult {
//     expectedReturn: number
//     winRate: number
//     sharpeRatio: number
//     maxDrawdown: number
//     parameters: ParameterOptimization[]
// }

// interface StrategyType {
//     id: string
//     name: string
//     description: string
//     hasSubTypes?: boolean
// }

// const strategyTypes: StrategyType[] = [
//     {
//         id: "mean_reversion",
//         name: "Mean Reversion",
//         description: "Trade price reversals to the mean",
//         hasSubTypes: true
//     },
//     {
//         id: "trend_following",
//         name: "Trend Following",
//         description: "Follow established market trends"
//     },
//     {
//         id: "momentum",
//         name: "Momentum",
//         description: "Capitalize on price momentum"
//     }
// ]

// const meanReversionTypes = [
//     { id: "sma", name: "Simple Moving Average" },
//     { id: "ema", name: "Exponential Moving Average" },
//     { id: "bollinger", name: "Bollinger Bands" }
// ]

// const maCrossoverTypes = [
//     { id: "sma", name: "Simple Moving Average" },
//     { id: "ema", name: "Exponential Moving Average" },
//     { id: "ema", name: "Exponential Moving Average" }
// ]

// const timeframes = [
//     { id: "1m", name: "1 Minute" },
//     { id: "5m", name: "5 Minutes" },
//     { id: "15m", name: "15 Minutes" },
//     { id: "1h", name: "1 Hour" },
//     { id: "4h", name: "4 Hours" },
//     { id: "1d", name: "1 Day" }
// ]

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

// interface BacktestRun {
//     id: string
//     date: string
//     params: typeof defaultParams
//     performance: {
//         returnRate: number
//         winRate: number
//         sharpeRatio: number
//         maxDrawdown: number
//         totalTrades: number
//     }
//     duration: string
//     status: "completed" | "failed" | "running"
// }

// // Add mock data
// const optimizationResult: OptimizationResult = {
//     expectedReturn: 35.2,
//     winRate: 78,
//     sharpeRatio: 2.8,
//     maxDrawdown: -9.5,
//     parameters: [
//         {
//             param: "lookbackPeriod",
//             current: 20,
//             suggested: 25,
//             improvement: 15,
//             confidence: 85,
//             correlation: [
//                 { param: "entryThreshold", value: 0.75 },
//                 { param: "exitThreshold", value: -0.45 }
//             ]
//         },
//         {
//             param: "entryThreshold",
//             current: 2,
//             suggested: 2.5,
//             improvement: 12,
//             confidence: 82,
//             correlation: [
//                 { param: "lookbackPeriod", value: 0.75 },
//                 { param: "stopLoss", value: 0.65 }
//             ]
//         },
//         // Add more parameter optimizations...
//     ]
// }

// const recentRuns: BacktestRun[] = [
//     {
//         id: "BT-001",
//         date: "2025-04-15 19:50:22",
//         params: {
//             ...defaultParams,
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
//         params: defaultParams,
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

// const optimizedParams = {
//     lookbackPeriod: 25,
//     entryThreshold: 2.5,
//     exitThreshold: 0.4,
//     stopLoss: 1.8,
//     takeProfit: 4.5,
//     positionSize: 80,
//     riskPerTrade: 0.8,
//     maxPositions: 4,
//     minVolume: 2000000
// }

// export default function BacktestPanel() {
//     const [isRunning, setIsRunning] = useState(false)
//     const [params, setParams] = useState(defaultParams)
//     const [selectedAssets, setSelectedAssets] = useState<string[]>(["BTC/USDT"])
//     const [activeTab, setActiveTab] = useState("parameters")
//     const [backtestData, setBacktestData] = useState<BacktestData | null>(null)
//     const [isLoading, setIsLoading] = useState(true)
//     const [isInitialLoad, setIsInitialLoad] = useState(true)

//     // Add new state variables
//     const [selectedStrategy, setSelectedStrategy] = useState("ma-crossover")
//     const [selectedMeanType, setSelectedMeanType] = useState("sma")
//     const [selectedTimeframe, setSelectedTimeframe] = useState("1h")
//     const [selectedBenchmark, setSelectedBenchmark] = useState("BTC/USDT")
//     const [selectedPairs, setSelectedPairs] = useState(["BTC/USDT"])
//     const [initialCapital, setInitialCapital] = useState(10000)
//     const [showAdvanced, setShowAdvanced] = useState(false)

//     const renderResultsPanel = () => {
//         if (isInitialLoad || isLoading) {
//             return <ResultsLoadingSkeleton />
//         }

//         if (!backtestData) {
//             return (
//                 <Card className="col-span-1 md:col-span-2">
//                     <div className="flex flex-col items-center justify-center h-[600px] space-y-4">
//                         <div className="text-center space-y-2">
//                             <h3 className="text-lg font-medium">No Backtest Results</h3>
//                             <p className="text-sm text-muted-foreground">
//                                 Configure parameters and run a backtest to see results here
//                             </p>
//                         </div>
//                         <Button
//                             variant="outline"
//                             onClick={() => setActiveTab("parameters")}
//                         >
//                             <Settings className="h-4 w-4 mr-2" />
//                             Configure Parameters
//                         </Button>
//                     </div>
//                 </Card>
//             )
//         }

//         return <ResultsPanel data={backtestData} isLoading={isLoading} />
//     }

//     // 加载最新的回测数据
//     const loadLatestBacktest = async () => {
//         try {
//             setIsLoading(true)
//             // 这里模拟从 API 获取最新的回测数据
//             const response = await mockRunBacktest(defaultParams, "6m", "1")
//             if (response.success) {
//                 setBacktestData(response.data)
//             }
//         } catch (error) {
//             console.error("Failed to load latest backtest:", error)
//         } finally {
//             setIsLoading(false)
//             setIsInitialLoad(false)
//         }
//     }

//     // 组件加载时检查历史数据
//     useEffect(() => {
//         loadLatestBacktest()
//     }, [])

//     // Define loadBacktestData outside of useEffect so it can be called from the button
//     const loadBacktestData = async (customParams: BacktestParameters | null = null) => {
//         try {
//             setIsLoading(true)

//             // Use provided parameters or default ones
//             const params = customParams

//             // Call the API to run the backtest
//             const response = await mockRunBacktest(params, "1m", "1")

//             console.log("run backtest result " + JSON.stringify(response))

//             if (response.success) {
//                 setBacktestData(response.data)
//             } else {
//                 throw new Error(response.error || "Failed to run backtest")
//             }
//         } catch (err) {
//             console.error("Failed to fetch backtest data:", err)
//             // Show error message to user
//             alert("Failed to run backtest. Please try again.")
//         } finally {
//             setIsLoading(false)
//         }
//     }

//     const validateParam = (param: Parameter, value: number) => {
//         if (value < param.min || value > param.max) {
//             toast.error(`${param.name} must be between ${param.min} and ${param.max}`)
//             return false
//         }
//         return true
//     }

//     const handleParamChange = (param: Parameter, value: string) => {
//         const numValue = parseFloat(value)
//         if (validateParam(param, numValue)) {
//             setParams(prev => ({
//                 ...prev,
//                 [param.key]: numValue
//             }))
//         }
//     }

//     const applyOptimizedParams = () => {
//         setParams(optimizedParams)
//         toast.success("Applied optimized parameters")
//     }

//     const resetToDefault = () => {
//         setParams(defaultParams)
//         toast.success("Reset to default parameters")
//     }

//     const runBacktest = () => {
//         setIsRunning(true)
//         // Simulate backtest run

//         loadBacktestData({})

//         setTimeout(() => {
//             setIsRunning(false)
//             toast.success("Backtest completed successfully")
//         }, 2000)
//     }

//     return (
//         <div className="flex min-h-screen flex-col">
//             <main className="flex-1 space-y-4 p-4 md:p-6">
//                 <div className="flex items-center justify-between mb-6">
//                     <div className="flex items-center gap-4">
//                         <Button variant="outline" size="icon">
//                             <ArrowLeft className="h-4 w-4" />
//                         </Button>
//                         <div>
//                             <div className="flex items-center gap-2">
//                                 <h1 className="text-2xl font-bold">Mean Reversion Strategy</h1>
//                                 <Badge variant="secondary">v1.0.0</Badge>
//                             </div>
//                             <p className="text-muted-foreground">
//                                 Advanced mean reversion strategy for crypto markets
//                             </p>
//                         </div>
//                     </div>
//                     <div className="flex items-center gap-4">
//                         <div className="flex -space-x-2">
//                             <Avatar className="border-2 border-background">
//                                 <AvatarFallback>TM</AvatarFallback>
//                             </Avatar>
//                             <div className="text-sm">
//                                 <div className="font-medium">tradingmaster</div>
//                                 <div className="text-xs text-muted-foreground">
//                                     Strategy Author
//                                 </div>
//                             </div>
//                         </div>
//                         <Separator orientation="vertical" className="h-8" />
//                         <div className="flex items-center gap-2">
//                             <Avatar>
//                                 <AvatarFallback>{CURRENT_USER[0].toUpperCase()}</AvatarFallback>
//                             </Avatar>
//                             <div className="text-sm">
//                                 <div className="font-medium">{CURRENT_USER}</div>
//                                 <div className="text-xs text-muted-foreground">
//                                     {CURRENT_DATE} UTC
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                     {/* Configuration Panel */}
//                     <div className="space-y-4">
//                         <Tabs value={activeTab} onValueChange={setActiveTab}>
//                             <TabsList className="grid w-full grid-cols-3">
//                                 <TabsTrigger value="parameters">
//                                     <Settings className="h-4 w-4 mr-2" />
//                                     Run Backtest
//                                 </TabsTrigger>
//                                 <TabsTrigger value="optimize">
//                                     <Zap className="h-4 w-4 mr-2" />
//                                     Optimize
//                                 </TabsTrigger>
//                                 <TabsTrigger value="history">
//                                     <History className="h-4 w-4 mr-2" />
//                                     History
//                                 </TabsTrigger>
//                             </TabsList>

//                             <TabsContent value="parameters">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Backtest Configuration</CardTitle>
//                                         <CardDescription>Configure strategy and market parameters for backtesting</CardDescription>
//                                     </CardHeader>
//                                     <CardContent className="space-y-6">
//                                         {/* Strategy Configuration and Market Configuration stay the same */}
//                                         {/* Mean Reversion Type - Only show if mean reversion is selected */}
//                                         {selectedStrategy === "ma-crossover" && (
//                                             <div className="space-y-2">
//                                                 <Label>Mean Type</Label>
//                                                 <Select value={selectedMeanType} onValueChange={setSelectedMeanType}>
//                                                     <SelectTrigger>
//                                                         <SelectValue placeholder="Select mean type" />
//                                                     </SelectTrigger>
//                                                     <SelectContent>
//                                                         {meanReversionTypes.map(type => (
//                                                             <SelectItem key={type.id} value={type.id}>
//                                                                 {type.name}
//                                                             </SelectItem>
//                                                         ))}
//                                                     </SelectContent>
//                                                 </Select>
//                                             </div>
//                                         )}
//                                         {/* Market Configuration */}
//                                         <div className="grid grid-cols-2 gap-4">
//                                             {/* Trading Pairs */}
//                                             <div className="space-y-2">
//                                                 <Label>Trading Pairs</Label>
//                                                 <Select>
//                                                     <SelectTrigger>
//                                                         <SelectValue placeholder="Select trading pairs" />
//                                                     </SelectTrigger>
//                                                     <SelectContent>
//                                                         <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
//                                                         <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
//                                                         <SelectItem value="BNB/USDT">BNB/USDT</SelectItem>
//                                                     </SelectContent>
//                                                 </Select>
//                                             </div>

//                                             {/* Benchmark */}
//                                             {/* <div className="space-y-2">
//                                                     <Label>Benchmark</Label>
//                                                     <Select value={selectedBenchmark} onValueChange={setSelectedBenchmark}>
//                                                         <SelectTrigger>
//                                                             <SelectValue placeholder="Select benchmark" />
//                                                         </SelectTrigger>
//                                                         <SelectContent>
//                                                             <SelectItem value="BTC/USDT">BTC/USDT</SelectItem>
//                                                             <SelectItem value="ETH/USDT">ETH/USDT</SelectItem>
//                                                         </SelectContent>
//                                                     </Select>
//                                                 </div> */}

//                                             {/* Timeframe */}
//                                             <div className="space-y-2">
//                                                 <Label>Timeframe</Label>
//                                                 <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
//                                                     <SelectTrigger>
//                                                         <SelectValue placeholder="Select timeframe" />
//                                                     </SelectTrigger>
//                                                     <SelectContent>
//                                                         {timeframes.map(tf => (
//                                                             <SelectItem key={tf.id} value={tf.id}>
//                                                                 {tf.name}
//                                                             </SelectItem>
//                                                         ))}
//                                                     </SelectContent>
//                                                 </Select>
//                                             </div>

//                                             {/* Add Initial Capital Input */}
//                                             <div className="space-y-2">
//                                                 <Label>Initial Capital</Label>
//                                                 <div className="flex items-center gap-2">
//                                                     <Input
//                                                         type="number"
//                                                         value={initialCapital}
//                                                         onChange={(e) => setInitialCapital(Number(e.target.value))}
//                                                         min={1000}
//                                                         step={1000}
//                                                     />
//                                                     <span className="text-xs text-muted-foreground w-8">USDT</span>

//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <Separator />

//                                         {/* Core Parameters */}
//                                         <div className="space-y-4">
//                                             <div className="flex items-center justify-between">
//                                                 <Label>Core Parameters</Label>
//                                                 <Button
//                                                     variant="outline"
//                                                     size="sm"
//                                                     onClick={resetToDefault}
//                                                     className="h-8"
//                                                 >
//                                                     <Settings className="h-4 w-4 mr-2" />
//                                                     Reset
//                                                 </Button>
//                                             </div>

//                                             <DynamicStrategyParameters
//                                                 strategyType={selectedStrategy}
//                                                 category="core"
//                                                 params={params}
//                                                 schemas={parameterSchemas[selectedStrategy]}
//                                                 onChange={setParams}
//                                             />



//                                             <DynamicStrategyParameters
//                                                 strategyType={selectedStrategy}
//                                                 category="core"
//                                                 params={params}
//                                                 schemas={riskSchemas["risk"]}
//                                                 onChange={setParams}
//                                             />

//                                             {/* <Accordion type="single" collapsible className="w-full">
//                                                 <AccordionItem value="advanced">
//                                                     <AccordionTrigger>Advanced Core Parameters</AccordionTrigger>
//                                                     <AccordionContent>
//                                                         <DynamicStrategyParameters
//                                                             strategyType={selectedStrategy}
//                                                             category="advanced"
//                                                             params={params}
//                                                             schemas={parameterSchemas[selectedStrategy]}
//                                                             onChange={setParams}
//                                                         />
//                                                     </AccordionContent>
//                                                 </AccordionItem>
//                                             </Accordion> */}
//                                         </div>

//                                         {/* Advanced Parameters Section */}
//                                         <div className="space-y-4">
//                                             <Button
//                                                 variant="ghost"
//                                                 className="w-full justify-between"
//                                                 onClick={() => setShowAdvanced(!showAdvanced)}
//                                             >
//                                                 <span>Advanced Parameters</span>
//                                                 <ChevronRight className={cn(
//                                                     "h-4 w-4 transition-transform",
//                                                     showAdvanced && "transform rotate-90"
//                                                 )} />
//                                             </Button>

//                                             {showAdvanced && (
//                                                 <div className="space-y-6">
//                                                     <DynamicStrategyParameters
//                                                         strategyType={selectedStrategy}
//                                                         category="advanced"
//                                                         params={params}
//                                                         schemas={parameterSchemas[selectedStrategy]}
//                                                         onChange={setParams}
//                                                     />

//                                                     <DynamicStrategyParameters
//                                                         strategyType={selectedStrategy}
//                                                         category="position"
//                                                         params={params}
//                                                         schemas={riskSchemas["risk"]}
//                                                         onChange={setParams}
//                                                     />
//                                                 </div>
//                                             )}
//                                         </div>
//                                     </CardContent>
//                                     <CardFooter>
//                                         <Button
//                                             className="w-full"
//                                             onClick={runBacktest}
//                                             disabled={isRunning}
//                                         >
//                                             {isRunning ? (
//                                                 <>Running Backtest...</>
//                                             ) : (
//                                                 <>
//                                                     <Play className="h-4 w-4 mr-2" />
//                                                     Run Backtest
//                                                 </>
//                                             )}
//                                         </Button>
//                                     </CardFooter>
//                                 </Card>
//                             </TabsContent>

//                             <TabsContent value="optimize">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Parameter Optimization</CardTitle>
//                                         <CardDescription>
//                                             Optimized parameters based on historical performance
//                                         </CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         {/* Add optimization results and suggestions */}
//                                     </CardContent>
//                                     <CardFooter>
//                                         <Button
//                                             className="w-full"
//                                             onClick={applyOptimizedParams}
//                                             variant="outline"
//                                         >
//                                             <Zap className="h-4 w-4 mr-2" />
//                                             Apply Optimized Parameters
//                                         </Button>
//                                     </CardFooter>
//                                 </Card>
//                             </TabsContent>

//                             <TabsContent value="history">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Recent Backtests</CardTitle>
//                                         <CardDescription>
//                                             Your previous backtest runs
//                                         </CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         {/* Add backtest history list */}
//                                     </CardContent>
//                                 </Card>
//                             </TabsContent>

//                             <TabsContent value="optimize">
//                                 <div className="space-y-4">
//                                     <Card>
//                                         <CardHeader>
//                                             <CardTitle>Parameter Optimization</CardTitle>
//                                             <CardDescription>
//                                                 AI-powered parameter suggestions based on historical data
//                                             </CardDescription>
//                                         </CardHeader>
//                                         <CardContent>
//                                             <div className="space-y-6">
//                                                 {/* Expected Performance */}
//                                                 <div>
//                                                     <h4 className="text-sm font-medium mb-4">Expected Performance</h4>
//                                                     <div className="grid grid-cols-4 gap-4">
//                                                         <div className="bg-muted/50 p-3 rounded-lg">
//                                                             <div className="text-xs text-muted-foreground">Return</div>
//                                                             <div className="text-lg font-bold text-green-500">
//                                                                 +{optimizationResult.expectedReturn}%
//                                                             </div>
//                                                         </div>
//                                                         <div className="bg-muted/50 p-3 rounded-lg">
//                                                             <div className="text-xs text-muted-foreground">Win Rate</div>
//                                                             <div className="text-lg font-bold">
//                                                                 {optimizationResult.winRate}%
//                                                             </div>
//                                                         </div>
//                                                         <div className="bg-muted/50 p-3 rounded-lg">
//                                                             <div className="text-xs text-muted-foreground">Sharpe</div>
//                                                             <div className="text-lg font-bold">
//                                                                 {optimizationResult.sharpeRatio}
//                                                             </div>
//                                                         </div>
//                                                         <div className="bg-muted/50 p-3 rounded-lg">
//                                                             <div className="text-xs text-muted-foreground">Drawdown</div>
//                                                             <div className="text-lg font-bold text-red-500">
//                                                                 {optimizationResult.maxDrawdown}%
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>

//                                                 {/* Parameter Suggestions */}
//                                                 <div>
//                                                     <h4 className="text-sm font-medium mb-4">Suggested Parameters</h4>
//                                                     <div className="space-y-4">
//                                                         {optimizationResult.parameters.map((param) => (
//                                                             <div
//                                                                 key={param.param}
//                                                                 className="bg-muted/30 p-4 rounded-lg space-y-3"
//                                                             >
//                                                                 <div className="flex items-center justify-between">
//                                                                     <div>
//                                                                         <div className="font-medium">{param.param}</div>
//                                                                         <div className="text-sm text-muted-foreground">
//                                                                             Expected improvement: +{param.improvement}%
//                                                                         </div>
//                                                                     </div>
//                                                                     <Badge variant="secondary">
//                                                                         {param.confidence}% confidence
//                                                                     </Badge>
//                                                                 </div>

//                                                                 <div className="grid grid-cols-2 gap-4">
//                                                                     <div>
//                                                                         <div className="text-sm text-muted-foreground">Current</div>
//                                                                         <div className="text-lg">{param.current}</div>
//                                                                     </div>
//                                                                     <div>
//                                                                         <div className="text-sm text-muted-foreground">Suggested</div>
//                                                                         <div className="text-lg font-medium text-primary">
//                                                                             {param.suggested}
//                                                                         </div>
//                                                                     </div>
//                                                                 </div>

//                                                                 <div>
//                                                                     <div className="text-sm text-muted-foreground mb-2">
//                                                                         Parameter Correlations
//                                                                     </div>
//                                                                     <div className="flex gap-2">
//                                                                         {param.correlation.map((corr) => (
//                                                                             <Badge
//                                                                                 key={corr.param}
//                                                                                 variant="outline"
//                                                                                 className={cn(
//                                                                                     "cursor-help",
//                                                                                     corr.value > 0 ? "text-green-500" : "text-red-500"
//                                                                                 )}
//                                                                             >
//                                                                                 {corr.param}: {corr.value > 0 ? "+" : ""}{corr.value}
//                                                                             </Badge>
//                                                                         ))}
//                                                                     </div>
//                                                                 </div>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </CardContent>
//                                         <CardFooter className="flex gap-2">
//                                             <Button
//                                                 className="flex-1"
//                                                 onClick={applyOptimizedParams}
//                                             >
//                                                 <Zap className="h-4 w-4 mr-2" />
//                                                 Apply All Suggestions
//                                             </Button>
//                                             <Button
//                                                 variant="outline"
//                                             // onClick={() => setIsOptimizing(true)}
//                                             >
//                                                 <Settings className="h-4 w-4 mr-2" />
//                                                 Run New Optimization
//                                             </Button>
//                                         </CardFooter>
//                                     </Card>
//                                 </div>
//                             </TabsContent>

//                             <TabsContent value="history">
//                                 <Card>
//                                     <CardHeader>
//                                         <CardTitle>Backtest History</CardTitle>
//                                         <CardDescription>
//                                             Your recent backtest runs and their results
//                                         </CardDescription>
//                                     </CardHeader>
//                                     <CardContent>
//                                         <div className="space-y-4">
//                                             {recentRuns.map((run) => (
//                                                 <div
//                                                     key={run.id}
//                                                     className="flex flex-col space-y-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
//                                                 >
//                                                     <div className="flex items-center justify-between">
//                                                         <div className="flex items-center gap-2">
//                                                             <div className="font-medium">{run.id}</div>
//                                                             <Badge variant="outline">
//                                                                 {run.status}
//                                                             </Badge>
//                                                         </div>
//                                                         <div className="text-sm text-muted-foreground">
//                                                             {new Date(run.date).toLocaleString()}
//                                                         </div>
//                                                     </div>

//                                                     <div className="grid grid-cols-5 gap-4">
//                                                         <div>
//                                                             <div className="text-xs text-muted-foreground">Return</div>
//                                                             <div className="text-sm font-medium text-green-500">
//                                                                 +{run.performance.returnRate}%
//                                                             </div>
//                                                         </div>
//                                                         <div>
//                                                             <div className="text-xs text-muted-foreground">Win Rate</div>
//                                                             <div className="text-sm font-medium">
//                                                                 {run.performance.winRate}%
//                                                             </div>
//                                                         </div>
//                                                         <div>
//                                                             <div className="text-xs text-muted-foreground">Sharpe</div>
//                                                             <div className="text-sm font-medium">
//                                                                 {run.performance.sharpeRatio}
//                                                             </div>
//                                                         </div>
//                                                         <div>
//                                                             <div className="text-xs text-muted-foreground">Drawdown</div>
//                                                             <div className="text-sm font-medium text-red-500">
//                                                                 {run.performance.maxDrawdown}%
//                                                             </div>
//                                                         </div>
//                                                         <div>
//                                                             <div className="text-xs text-muted-foreground">Duration</div>
//                                                             <div className="text-sm font-medium">
//                                                                 {run.duration}
//                                                             </div>
//                                                         </div>
//                                                     </div>

//                                                     <div className="flex gap-2 flex-wrap">
//                                                         {Object.entries(run.params)
//                                                             .filter(([key, value]) =>
//                                                                 value !== defaultParams[key as keyof typeof defaultParams]
//                                                             )
//                                                             .map(([key, value]) => (
//                                                                 <Badge key={key} variant="outline">
//                                                                     {key}: {value}
//                                                                 </Badge>
//                                                             ))
//                                                         }
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </CardContent>
//                                     <CardFooter>
//                                         <Button variant="outline" className="w-full">
//                                             <History className="h-4 w-4 mr-2" />
//                                             View Full History
//                                         </Button>
//                                     </CardFooter>
//                                 </Card>
//                             </TabsContent>
//                         </Tabs>
//                     </div>

//                     {/* Results Panel - Add sticky positioning */}
//                     <div className="md:col-span-2">
//                         <div className="sticky top-4">
//                             {renderResultsPanel()}
//                         </div>
//                     </div>
//                 </div>
//             </main >
//         </div >
//     )
// }