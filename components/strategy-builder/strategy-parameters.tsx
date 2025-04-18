"use client"

import { useEffect, useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card"
import { Parameter, ParameterField, parameters, parameterSchemas } from "@/lib/api/algorithms"
import { toast } from "sonner"
import DynamicStrategyParameters from "./strategy-dynamic-parameters"

interface StrategyParametersProps {
    strategyType: string
    data: Record<string, any>
    onChange: (data: Record<string, any>) => void
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


const validateParam = (param: Parameter, value: number) => {
    if (value < param.min || value > param.max) {
        toast.error(`${param.name} must be between ${param.min} and ${param.max}`)
        return false
    }
    return true
}

export default function StrategyParameters({ strategyType, data, onChange }: StrategyParametersProps) {


    const handleChange = (key: string, value: any) => {
        onChange({ ...data, [key]: value })
    }


    // const [params, setParams] = useState(data)

    // const handleParamChange = (param: Parameter, value: string) => {
    //     const numValue = parseFloat(value)
    //     if (validateParam(param, numValue)) {
    //         setParams(prev => ({
    //             ...prev,
    //             [param.key]: numValue
    //         }))
    //     }
    // }



    return (
        <div className="space-y-6">
            {/* <Separator /> */}

            {/* <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Strategy Parameters</h3>
            </div> */}

            {strategyType === "mean-reversion" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="slow-period">Slow Period</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="w-[200px] text-xs">Number of periods to calculate the mean price</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                id="slow-period"
                                type="number"
                                value={data.slowPeriod ?? ""}
                                placeholder="20"
                                onChange={(e) => handleChange("slowPeriod", Number(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="fast-period">Fast Period</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="w-[200px] text-xs">Number of periods to calculate the mean price</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                id="fast-period"
                                type="number"
                                value={data.fastPeriod ?? ""}
                                step="0.1"
                                placeholder="2"
                                onChange={(e) => handleChange("fastPeriod", Number(e.target.value))}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mean-type">Mean Type</Label>
                            <Select value={data.meanType} onValueChange={(v) => handleChange("meanType", v)}>
                                <SelectTrigger id="mean-type">
                                    <SelectValue placeholder="Select mean type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sma">Simple Moving Average</SelectItem>
                                    <SelectItem value="ema">Exponential Moving Average</SelectItem>
                                    <SelectItem value="wma">Weighted Moving Average</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeframe">Timeframe</Label>
                            <Select value={data.timeframe} onValueChange={(v) => handleChange("timeframe", v)}>
                                <SelectTrigger id="timeframe">
                                    <SelectValue placeholder="Select timeframe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5m">5 minutes</SelectItem>
                                    <SelectItem value="15m">15 minutes</SelectItem>
                                    <SelectItem value="1h">1 hour</SelectItem>
                                    <SelectItem value="4h">4 hours</SelectItem>
                                    <SelectItem value="1d">1 day</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced">
                            <AccordionTrigger>Advanced Parameters</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="entry-threshold">Entry Threshold (%)</Label>
                                            <Input
                                                id="entry-threshold"
                                                type="number"
                                                value={data.entry_threshold ?? ""}
                                                step="0.1"
                                                onChange={(e) => handleChange("entry_threshold", Number(e.target.value))}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="exit-threshold">Exit Threshold (%)</Label>
                                            <Input
                                                id="exit-threshold"
                                                type="number"
                                                value={data.exit_threshold ?? ""}
                                                step="0.1"
                                                onChange={(e) => handleChange("exit_threshold", Number(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-volume-filter">Use Volume Filter</Label>
                                            <Switch
                                                id="use-volume-filter"
                                                checked={!!data.use_volume_filter}
                                                onCheckedChange={(v) => handleChange("use_volume_filter", v)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}


            {strategyType === "breakout" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="period">Period Length</Label>
                            <Input
                                id="period"
                                type="number"
                                defaultValue={"20"}
                                placeholder="20"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="breakout-threshold">Breakout Threshold (%)</Label>
                            <Input
                                id="breakout-threshold"
                                type="number"
                                defaultValue={"2"}
                                step="0.1"
                                placeholder="2"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="confirmation-candles">Confirmation Candles</Label>
                            <Input
                                id="confirmation-candles"
                                type="number"
                                defaultValue={"2"}
                                placeholder="2"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeframe">Timeframe</Label>
                            <Select defaultValue={"4h"}>
                                <SelectTrigger id="timeframe">
                                    <SelectValue placeholder="Select timeframe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5m">5 minutes</SelectItem>
                                    <SelectItem value="15m">15 minutes</SelectItem>
                                    <SelectItem value="1h">1 hour</SelectItem>
                                    <SelectItem value="4h">4 hours</SelectItem>
                                    <SelectItem value="1d">1 day</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced">
                            <AccordionTrigger>Advanced Parameters</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="volume-increase">Volume Increase Threshold (%)</Label>
                                            <Input
                                                id="volume-increase"
                                                type="number"
                                                defaultValue={"50"}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="consolidation-period">Consolidation Period</Label>
                                            <Input
                                                id="consolidation-period"
                                                type="number"
                                                defaultValue={"5"}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-atr">Use ATR for Breakout Calculation</Label>
                                            <Switch
                                                id="use-atr"
                                                defaultChecked={true}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}


            {strategyType === "rsi" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="rsi-period">RSI Period</Label>
                            <Input
                                id="rsi-period"
                                type="number"
                                defaultValue={"14"}
                                placeholder="14"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="timeframe">Timeframe</Label>
                            <Select defaultValue={"1h"}>
                                <SelectTrigger id="timeframe">
                                    <SelectValue placeholder="Select timeframe" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5m">5 minutes</SelectItem>
                                    <SelectItem value="15m">15 minutes</SelectItem>
                                    <SelectItem value="1h">1 hour</SelectItem>
                                    <SelectItem value="4h">4 hours</SelectItem>
                                    <SelectItem value="1d">1 day</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Overbought/Oversold Thresholds</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="oversold">Oversold (Buy Signal)</Label>
                                <Input
                                    id="oversold"
                                    type="number"
                                    defaultValue={"30"}
                                    placeholder="30"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="overbought">Overbought (Sell Signal)</Label>
                                <Input
                                    id="overbought"
                                    type="number"
                                    defaultValue={"70"}
                                    placeholder="70"
                                />
                            </div>
                        </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced">
                            <AccordionTrigger>Advanced Parameters</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="signal-confirmation">Signal Confirmation Periods</Label>
                                        <Input
                                            id="signal-confirmation"
                                            type="number"
                                            defaultValue={"2"}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-divergence">Use RSI Divergence</Label>
                                            <Switch
                                                id="use-divergence"
                                                defaultChecked={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-ma-filter">Use Moving Average Filter</Label>
                                            <Switch
                                                id="use-ma-filter"
                                                defaultChecked={false}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>
            )}


            {strategyType === "ma-crossover" && (
                <div className="space-y-4">
                    {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fast-period">Fast Period</Label>
                            <Input
                                id="fast-period"
                                type="number"
                                value={data.fastPeriod ?? ""}
                                placeholder="10"
                                onChange={(e) => handleChange("fast_period", Number(e.target.value))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slow-period">Slow Period</Label>
                            <Input
                                id="slow-period"
                                type="number"
                                value={data.slowPeriod ?? ""}
                                placeholder="30"
                                onChange={(e) => handleChange("slow_period", Number(e.target.value))}
                            />
                        </div>
                    </div> */}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ma-type">MA Type</Label>
                            <Select
                                value={data.maType}
                                onValueChange={(v) => handleChange("maType", v)}
                            >
                                <SelectTrigger id="ma-type">
                                    <SelectValue placeholder="Select MA Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="sma">Simple Moving Average</SelectItem>
                                    <SelectItem value="ema">Exponential Moving Average</SelectItem>
                                    <SelectItem value="wma">Weighted Moving Average</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="position-type">Position Type</Label>
                            <Select
                                value={data.positionType}
                                onValueChange={(v) => handleChange("position_type", v)}
                            >
                                <SelectTrigger id="position-type">
                                    <SelectValue placeholder="Select position type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="long">Long Only</SelectItem>
                                    <SelectItem value="short">Short Only</SelectItem>
                                    <SelectItem value="both">Long & Short</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="rebalance-interval">Rebalance Interval</Label>
                        <Select
                            value={data.rebalanceInterval}
                            onValueChange={(v) => handleChange("rebalance_interval", v)}
                        >
                            <SelectTrigger id="rebalance-interval">
                                <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1h">1 Hour</SelectItem>
                                <SelectItem value="4h">4 Hours</SelectItem>
                                <SelectItem value="daily">Daily</SelectItem>
                                <SelectItem value="weekly">Weekly</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DynamicStrategyParameters
                        strategyType={strategyType}
                        params={data}
                        schemas={parameterSchemas[strategyType]}
                        onChange={onChange} />

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced">
                            <AccordionTrigger>Advanced Parameters</AccordionTrigger>
                            <AccordionContent>
                                <DynamicStrategyParameters
                                    strategyType={strategyType}
                                    params={data}
                                    category="advanced"
                                    schemas={parameterSchemas[strategyType]}
                                    onChange={onChange} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                </div>
            )}

            {/* {strategyType === "custom" && (
                <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground">Custom strategy configuration is available in the advanced editor</p>
                </div>
            )} */}
        </div>
    )
}