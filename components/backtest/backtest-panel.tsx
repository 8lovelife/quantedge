"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ArrowRight, Calendar, Play } from "lucide-react"

// Mock data for backtest results
const backtestData = [
    { date: "2023-01-01", equity: 10000, benchmark: 10000 },
    { date: "2023-01-15", equity: 10250, benchmark: 10150 },
    { date: "2023-02-01", equity: 10400, benchmark: 10200 },
    { date: "2023-02-15", equity: 10300, benchmark: 10100 },
    { date: "2023-03-01", equity: 10500, benchmark: 10250 },
    { date: "2023-03-15", equity: 10700, benchmark: 10300 },
    { date: "2023-04-01", equity: 10900, benchmark: 10350 },
    { date: "2023-04-15", equity: 11100, benchmark: 10400 },
    { date: "2023-05-01", equity: 11300, benchmark: 10450 },
    { date: "2023-05-15", equity: 11200, benchmark: 10400 },
    { date: "2023-06-01", equity: 11400, benchmark: 10500 },
    { date: "2023-06-15", equity: 11600, benchmark: 10550 },
]

const monthlyReturns = [
    { month: "Jan", return: 2.5 },
    { month: "Feb", return: 1.2 },
    { month: "Mar", return: 3.8 },
    { month: "Apr", return: 3.7 },
    { month: "May", return: 0.9 },
    { month: "Jun", return: 3.6 },
]

export default function BacktestPanel() {
    const [isRunning, setIsRunning] = useState(false)

    const runBacktest = () => {
        setIsRunning(true)
        setTimeout(() => {
            setIsRunning(false)
        }, 2000)
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="col-span-1">
                <CardHeader>
                    <CardTitle>Backtest Configuration</CardTitle>
                    <CardDescription>Set parameters for historical testing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="strategy">Strategy</Label>
                        <Select defaultValue="mean-reversion">
                            <SelectTrigger id="strategy">
                                <SelectValue placeholder="Select strategy" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                                <SelectItem value="momentum">Momentum</SelectItem>
                                <SelectItem value="breakout">Breakout</SelectItem>
                                <SelectItem value="arbitrage">Arbitrage</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Date Range</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-8" defaultValue="2023-01-01" />
                            </div>
                            <ArrowRight className="h-4 w-4" />
                            <div className="relative flex-1">
                                <Calendar className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input type="date" className="pl-8" defaultValue="2023-06-30" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="initial-capital">Initial Capital</Label>
                        <Input id="initial-capital" type="number" defaultValue="10000" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="benchmark">Benchmark</Label>
                        <Select defaultValue="btc">
                            <SelectTrigger id="benchmark">
                                <SelectValue placeholder="Select benchmark" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="btc">BTC/USDT</SelectItem>
                                <SelectItem value="eth">ETH/USDT</SelectItem>
                                <SelectItem value="sp500">S&P 500</SelectItem>
                                <SelectItem value="none">None</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                        <Label>Advanced Settings</Label>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                                <Label htmlFor="slippage" className="text-xs">
                                    Slippage (%)
                                </Label>
                                <Input id="slippage" type="number" defaultValue="0.1" className="h-8" />
                            </div>
                            <div className="space-y-1">
                                <Label htmlFor="commission" className="text-xs">
                                    Commission (%)
                                </Label>
                                <Input id="commission" type="number" defaultValue="0.1" className="h-8" />
                            </div>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full" onClick={runBacktest} disabled={isRunning}>
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

            <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                    <CardTitle>Backtest Results</CardTitle>
                    <CardDescription>Performance analysis and metrics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">Total Return</div>
                            <div className="text-lg font-bold text-green-500">+16.0%</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">Sharpe Ratio</div>
                            <div className="text-lg font-bold">1.92</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">Max Drawdown</div>
                            <div className="text-lg font-bold text-red-500">-4.2%</div>
                        </div>
                        <div className="bg-muted/50 p-2 rounded-md">
                            <div className="text-xs text-muted-foreground">Win Rate</div>
                            <div className="text-lg font-bold">72%</div>
                        </div>
                    </div>

                    <Tabs defaultValue="equity">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="equity">Equity Curve</TabsTrigger>
                            <TabsTrigger value="returns">Monthly Returns</TabsTrigger>
                            <TabsTrigger value="trades">Trades</TabsTrigger>
                        </TabsList>
                        <TabsContent value="equity" className="pt-4">
                            <div className="h-[300px]">
                                <ChartContainer
                                    config={{
                                        equity: {
                                            label: "Strategy",
                                            color: "hsl(var(--chart-1))",
                                        },
                                        benchmark: {
                                            label: "Benchmark",
                                            color: "hsl(var(--chart-2))",
                                        },
                                    }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={backtestData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <XAxis
                                                dataKey="date"
                                                tickLine={false}
                                                axisLine={false}
                                                tickFormatter={(value) => value.slice(5)}
                                            />
                                            <YAxis domain={["auto", "auto"]} tickLine={false} axisLine={false} orientation="right" />
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <ChartTooltip content={<ChartTooltipContent />} />
                                            <Area
                                                type="monotone"
                                                dataKey="equity"
                                                stroke="hsl(var(--chart-1))"
                                                fillOpacity={1}
                                                fill="url(#colorEquity)"
                                            />
                                            <Line type="monotone" dataKey="benchmark" stroke="hsl(var(--chart-2))" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                        </TabsContent>
                        <TabsContent value="returns" className="pt-4">
                            <div className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={monthlyReturns} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="month" />
                                        <YAxis orientation="right" />
                                        <Tooltip
                                            formatter={(value) => [`${value}%`, "Return"]}
                                            labelFormatter={(label) => `Month: ${label}`}
                                        />
                                        <Bar dataKey="return" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </TabsContent>
                        <TabsContent value="trades" className="pt-4">
                            <div className="border rounded-md">
                                <div className="grid grid-cols-5 gap-2 p-2 border-b font-medium text-sm">
                                    <div>Date</div>
                                    <div>Pair</div>
                                    <div>Type</div>
                                    <div>Size</div>
                                    <div className="text-right">P&L</div>
                                </div>
                                <div className="max-h-[250px] overflow-auto">
                                    <div className="grid grid-cols-5 gap-2 p-2 border-b text-sm">
                                        <div>2023-01-05</div>
                                        <div>BTC/USDT</div>
                                        <div>Long</div>
                                        <div>0.25</div>
                                        <div className="text-right text-green-500">+2.3%</div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 p-2 border-b text-sm">
                                        <div>2023-01-12</div>
                                        <div>ETH/USDT</div>
                                        <div>Short</div>
                                        <div>2.5</div>
                                        <div className="text-right text-red-500">-1.2%</div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 p-2 border-b text-sm">
                                        <div>2023-01-18</div>
                                        <div>BTC/USDT</div>
                                        <div>Long</div>
                                        <div>0.15</div>
                                        <div className="text-right text-green-500">+3.5%</div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 p-2 border-b text-sm">
                                        <div>2023-02-02</div>
                                        <div>SOL/USDT</div>
                                        <div>Long</div>
                                        <div>25</div>
                                        <div className="text-right text-green-500">+5.2%</div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 p-2 border-b text-sm">
                                        <div>2023-02-15</div>
                                        <div>BTC/USDT</div>
                                        <div>Short</div>
                                        <div>0.1</div>
                                        <div className="text-right text-green-500">+1.8%</div>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2 p-2 text-sm">
                                        <div>2023-03-01</div>
                                        <div>ETH/USDT</div>
                                        <div>Long</div>
                                        <div>1.5</div>
                                        <div className="text-right text-green-500">+4.1%</div>
                                    </div>
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}
