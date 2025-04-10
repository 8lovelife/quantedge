"use client"

import type React from "react"

import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, ArrowDownUp, LineChart, Activity, Info, Plus } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

interface StrategyTypeSelectorProps {
    value: string
    onChange: (value: string) => void
}

export default function StrategyTypeSelector({ value, onChange }: StrategyTypeSelectorProps) {
    const [showStrategyInfo, setShowStrategyInfo] = useState(false)
    const [selectedInfoStrategy, setSelectedInfoStrategy] = useState("mean-reversion")

    const handleInfoClick = (strategyType: string, e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setSelectedInfoStrategy(strategyType)
        setShowStrategyInfo(true)
    }

    return (
        <>
            <RadioGroup value={value} onValueChange={onChange} className="grid grid-cols-1 gap-3">
                <div
                    className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer ${value === "mean-reversion" ? "border-primary bg-primary/5" : "border-input"}`}
                >
                    <RadioGroupItem value="mean-reversion" id="mean-reversion" className="sr-only" />
                    <ArrowDownUp className={`h-5 w-5 ${value === "mean-reversion" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                        <Label htmlFor="mean-reversion" className="font-medium cursor-pointer">
                            Mean Reversion
                        </Label>
                        <p className="text-xs text-muted-foreground">Trade price returns to historical average</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0"
                        onClick={(e) => handleInfoClick("mean-reversion", e)}
                    >
                        <Info className="h-4 w-4" />
                        <span className="sr-only">More info</span>
                    </Button>
                </div>

                <div
                    className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer ${value === "breakout" ? "border-primary bg-primary/5" : "border-input"}`}
                >
                    <RadioGroupItem value="breakout" id="breakout" className="sr-only" />
                    <TrendingUp className={`h-5 w-5 ${value === "breakout" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                        <Label htmlFor="breakout" className="font-medium cursor-pointer">
                            Breakout
                        </Label>
                        <p className="text-xs text-muted-foreground">Trade when price breaks support/resistance</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => handleInfoClick("breakout", e)}>
                        <Info className="h-4 w-4" />
                        <span className="sr-only">More info</span>
                    </Button>
                </div>

                <div
                    className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer ${value === "rsi" ? "border-primary bg-primary/5" : "border-input"}`}
                >
                    <RadioGroupItem value="rsi" id="rsi" className="sr-only" />
                    <Activity className={`h-5 w-5 ${value === "rsi" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                        <Label htmlFor="rsi" className="font-medium cursor-pointer">
                            RSI
                        </Label>
                        <p className="text-xs text-muted-foreground">Trade based on Relative Strength Index</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => handleInfoClick("rsi", e)}>
                        <Info className="h-4 w-4" />
                        <span className="sr-only">More info</span>
                    </Button>
                </div>

                <div
                    className={`flex items-center space-x-2 border rounded-md p-3 cursor-pointer ${value === "macd" ? "border-primary bg-primary/5" : "border-input"}`}
                >
                    <RadioGroupItem value="macd" id="macd" className="sr-only" />
                    <LineChart className={`h-5 w-5 ${value === "macd" ? "text-primary" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                        <Label htmlFor="macd" className="font-medium cursor-pointer">
                            MACD
                        </Label>
                        <p className="text-xs text-muted-foreground">Moving Average Convergence Divergence</p>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={(e) => handleInfoClick("macd", e)}>
                        <Info className="h-4 w-4" />
                        <span className="sr-only">More info</span>
                    </Button>
                </div>

                <Dialog>
                    <DialogTrigger asChild>
                        <div className="flex items-center space-x-2 border border-dashed rounded-md p-3 cursor-pointer hover:border-primary hover:bg-primary/5">
                            <Plus className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1">
                                <p className="font-medium">Create Custom Strategy</p>
                                <p className="text-xs text-muted-foreground">Combine multiple indicators and conditions</p>
                            </div>
                        </div>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Create Custom Strategy</DialogTitle>
                            <DialogDescription>
                                Build a custom strategy by combining multiple indicators and conditions
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="custom-strategy-name">Strategy Name</Label>
                                <Input id="custom-strategy-name" placeholder="My Custom Strategy" />
                            </div>

                            <Tabs defaultValue="indicators">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="indicators">Indicators</TabsTrigger>
                                    <TabsTrigger value="conditions">Conditions</TabsTrigger>
                                    <TabsTrigger value="filters">Filters</TabsTrigger>
                                </TabsList>
                                <TabsContent value="indicators" className="space-y-4 pt-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <Card>
                                            <CardHeader className="p-3">
                                                <CardTitle className="text-sm">Moving Averages</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-0">
                                                <div className="space-y-2">
                                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                                        <Plus className="h-3 w-3 mr-2" />
                                                        Simple MA
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                                        <Plus className="h-3 w-3 mr-2" />
                                                        Exponential MA
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                                        <Plus className="h-3 w-3 mr-2" />
                                                        Weighted MA
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <Card>
                                            <CardHeader className="p-3">
                                                <CardTitle className="text-sm">Oscillators</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-3 pt-0">
                                                <div className="space-y-2">
                                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                                        <Plus className="h-3 w-3 mr-2" />
                                                        RSI
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                                        <Plus className="h-3 w-3 mr-2" />
                                                        Stochastic
                                                    </Button>
                                                    <Button variant="outline" size="sm" className="w-full justify-start">
                                                        <Plus className="h-3 w-3 mr-2" />
                                                        MACD
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </TabsContent>
                                <TabsContent value="conditions" className="pt-4">
                                    <div className="border rounded-md p-4">
                                        <p className="text-center text-muted-foreground">
                                            Add indicators first, then create conditions between them
                                        </p>
                                    </div>
                                </TabsContent>
                                <TabsContent value="filters" className="pt-4">
                                    <div className="border rounded-md p-4">
                                        <p className="text-center text-muted-foreground">Add filters to refine your strategy signals</p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </div>
                        <DialogFooter>
                            <Button variant="outline">Cancel</Button>
                            <Button onClick={() => onChange("custom")}>Create Strategy</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </RadioGroup>

            <Dialog open={showStrategyInfo} onOpenChange={setShowStrategyInfo}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedInfoStrategy === "mean-reversion" && "Mean Reversion Strategy"}
                            {selectedInfoStrategy === "breakout" && "Breakout Strategy"}
                            {selectedInfoStrategy === "rsi" && "RSI Strategy"}
                            {selectedInfoStrategy === "macd" && "MACD Strategy"}
                        </DialogTitle>
                        <DialogDescription>Strategy details and configuration options</DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        {selectedInfoStrategy === "mean-reversion" && (
                            <div className="space-y-4">
                                <p>
                                    Mean reversion is a trading strategy based on the idea that asset prices tend to revert to their
                                    historical average or mean over time. This strategy identifies when prices have deviated significantly
                                    from their historical average and trades on the expectation that they will return to that average.
                                </p>

                                <h4 className="font-medium">Key Parameters:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Lookback Period: Number of periods to calculate the mean</li>
                                    <li>Standard Deviation Threshold: How far from the mean to trigger a trade</li>
                                    <li>Mean Type: Simple, Exponential, or Weighted Moving Average</li>
                                </ul>

                                <h4 className="font-medium">When to Use:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Sideways or range-bound markets</li>
                                    <li>Assets with historical tendency to revert to a mean</li>
                                    <li>Markets with low volatility</li>
                                </ul>

                                <div className="bg-muted p-3 rounded-md">
                                    <h4 className="font-medium">Example Logic:</h4>
                                    <p className="text-sm">
                                        Buy when price is 2 standard deviations below the 20-period moving average.
                                        <br />
                                        Sell when price returns to the moving average.
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedInfoStrategy === "breakout" && (
                            <div className="space-y-4">
                                <p>
                                    Breakout strategies identify when an asset's price breaks through established support or resistance
                                    levels with increased volume, signaling a potential new trend. This strategy aims to capture profits
                                    from the strong price movements that often follow breakouts.
                                </p>

                                <h4 className="font-medium">Key Parameters:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Period Length: Number of periods to establish support/resistance</li>
                                    <li>Breakout Threshold: Percentage or price amount to confirm breakout</li>
                                    <li>Confirmation Candles: Number of candles to confirm the breakout</li>
                                    <li>Volume Increase: Required volume increase to validate breakout</li>
                                </ul>

                                <h4 className="font-medium">When to Use:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>After periods of consolidation or low volatility</li>
                                    <li>When key technical levels are being approached</li>
                                    <li>During potential trend changes</li>
                                </ul>

                                <div className="bg-muted p-3 rounded-md">
                                    <h4 className="font-medium">Example Logic:</h4>
                                    <p className="text-sm">
                                        Buy when price breaks above the highest high of the last 20 periods with 50% higher volume.
                                        <br />
                                        Sell when price breaks below a trailing stop or support level.
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedInfoStrategy === "rsi" && (
                            <div className="space-y-4">
                                <p>
                                    The Relative Strength Index (RSI) strategy uses the RSI oscillator to identify overbought and oversold
                                    conditions in the market. This momentum oscillator measures the speed and change of price movements on
                                    a scale from 0 to 100.
                                </p>

                                <h4 className="font-medium">Key Parameters:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>RSI Period: Number of periods to calculate RSI (typically 14)</li>
                                    <li>Overbought Level: Upper threshold (typically 70)</li>
                                    <li>Oversold Level: Lower threshold (typically 30)</li>
                                    <li>Signal Confirmation: Number of periods to confirm signal</li>
                                </ul>

                                <h4 className="font-medium">When to Use:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Range-bound markets</li>
                                    <li>To identify potential reversal points</li>
                                    <li>As a filter for other strategies</li>
                                </ul>

                                <div className="bg-muted p-3 rounded-md">
                                    <h4 className="font-medium">Example Logic:</h4>
                                    <p className="text-sm">
                                        Buy when RSI crosses above 30 from below.
                                        <br />
                                        Sell when RSI crosses below 70 from above.
                                    </p>
                                </div>
                            </div>
                        )}

                        {selectedInfoStrategy === "macd" && (
                            <div className="space-y-4">
                                <p>
                                    The Moving Average Convergence Divergence (MACD) strategy uses the MACD indicator to identify changes
                                    in momentum, direction, and strength of a price trend. It consists of the MACD line, signal line, and
                                    histogram.
                                </p>

                                <h4 className="font-medium">Key Parameters:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Fast Period: Shorter-term EMA (typically 12)</li>
                                    <li>Slow Period: Longer-term EMA (typically 26)</li>
                                    <li>Signal Period: EMA of MACD line (typically 9)</li>
                                    <li>Histogram Threshold: Minimum histogram value for signal</li>
                                </ul>

                                <h4 className="font-medium">When to Use:</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Trending markets</li>
                                    <li>To identify trend changes</li>
                                    <li>For momentum confirmation</li>
                                </ul>

                                <div className="bg-muted p-3 rounded-md">
                                    <h4 className="font-medium">Example Logic:</h4>
                                    <p className="text-sm">
                                        Buy when MACD line crosses above the signal line.
                                        <br />
                                        Sell when MACD line crosses below the signal line.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            onClick={() => {
                                onChange(selectedInfoStrategy)
                                setShowStrategyInfo(false)
                            }}
                        >
                            Select This Strategy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
