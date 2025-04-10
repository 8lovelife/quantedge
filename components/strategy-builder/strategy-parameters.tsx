"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface StrategyParametersProps {
    strategyType: string
}

type Props = {
    strategyType: string
    data: { slow_period: number; fast_period: number }
    onChange: (data: { slow_period: number; fast_period: number }) => void
}

export default function StrategyParameters({ strategyType, data, onChange }: Props) {
    // const [useDefaultParams, setUseDefaultParams] = useState(true)

    // Strategy templates for each type
    const strategyTemplates = {
        "mean-reversion": [
            { name: "Standard Mean Reversion", lookback: 20, stdDev: 2, meanType: "sma" },
            { name: "Aggressive Mean Reversion", lookback: 10, stdDev: 1.5, meanType: "ema" },
            { name: "Conservative Mean Reversion", lookback: 30, stdDev: 2.5, meanType: "wma" },
        ],
        breakout: [
            { name: "Standard Breakout", period: 20, threshold: 2, confirmation: 2 },
            { name: "Fast Breakout", period: 10, threshold: 1.5, confirmation: 1 },
            { name: "Volume Breakout", period: 20, threshold: 2, confirmation: 2, volumeIncrease: 100 },
        ],
        rsi: [
            { name: "Standard RSI", period: 14, oversold: 30, overbought: 70 },
            { name: "Aggressive RSI", period: 7, oversold: 35, overbought: 65 },
            { name: "Conservative RSI", period: 21, oversold: 25, overbought: 75 },
        ],
        macd: [
            { name: "Standard MACD", fast: 12, slow: 26, signal: 9 },
            { name: "Fast MACD", fast: 8, slow: 17, signal: 9 },
            { name: "Slow MACD", fast: 19, slow: 39, signal: 9 },
        ],
    }

    const [selectedTemplate, setSelectedTemplate] = useState("")

    return (
        <div className="space-y-6">
            <Separator />

            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium">Strategy Parameters</h3>
                {/* <div className="flex items-center space-x-2">
                    <Select
                        value={selectedTemplate}
                        onValueChange={(value) => {
                            setSelectedTemplate(value)
                            if (value) {
                                setUseDefaultParams(false)
                                // Here you would apply the template parameters
                            }
                        }}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Load Template" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="none">Select Template</SelectItem>
                            {strategyType === "mean-reversion" &&
                                strategyTemplates["mean-reversion"].map((template, index) => (
                                    <SelectItem key={index} value={`mean-reversion-${index}`}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            {strategyType === "breakout" &&
                                strategyTemplates["breakout"].map((template, index) => (
                                    <SelectItem key={index} value={`breakout-${index}`}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            {strategyType === "rsi" &&
                                strategyTemplates["rsi"].map((template, index) => (
                                    <SelectItem key={index} value={`rsi-${index}`}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                            {strategyType === "macd" &&
                                strategyTemplates["macd"].map((template, index) => (
                                    <SelectItem key={index} value={`macd-${index}`}>
                                        {template.name}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                        <Label htmlFor="use-defaults" className="text-sm">
                            Use Default Parameters
                        </Label>
                        <Switch id="use-defaults" checked={useDefaultParams} onCheckedChange={setUseDefaultParams} />
                    </div>
                </div> */}
            </div>

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
                                defaultValue={data.slow_period}
                                placeholder="20"
                                onChange={(e) => onChange({ ...data, slow_period: Number(e.target.value) })}
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
                                            <p className="w-[200px] text-xs">
                                                Number of periods to calculate the mean price
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input
                                id="fast-period"
                                type="number"
                                defaultValue={data.fast_period}
                                step="0.1"
                                placeholder="2"
                                onChange={(e) => onChange({ ...data, fast_period: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="mean-type">Mean Type</Label>
                            <Select defaultValue={"sma"} >
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
                                                defaultValue={"1.5"}
                                                step="0.1"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="exit-threshold">Exit Threshold (%)</Label>
                                            <Input
                                                id="exit-threshold"
                                                type="number"
                                                defaultValue={"0.5"}
                                                step="0.1"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-volume-filter">Use Volume Filter</Label>
                                            <Switch
                                                id="use-volume-filter"
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

            {strategyType === "macd" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="fast-period">Fast Period</Label>
                            <Input
                                id="fast-period"
                                type="number"
                                defaultValue={"12"}
                                placeholder="12"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="slow-period">Slow Period</Label>
                            <Input
                                id="slow-period"
                                type="number"
                                defaultValue={"26"}
                                placeholder="26"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="signal-period">Signal Period</Label>
                            <Input
                                id="signal-period"
                                type="number"
                                defaultValue={"9"}
                                placeholder="9"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <div className="space-y-2">
                            <Label htmlFor="source">Price Source</Label>
                            <Select defaultValue={"close"}>
                                <SelectTrigger id="source">
                                    <SelectValue placeholder="Select price source" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="close">Close</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="hl2">HL/2</SelectItem>
                                    <SelectItem value="hlc3">HLC/3</SelectItem>
                                    <SelectItem value="ohlc4">OHLC/4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced">
                            <AccordionTrigger>Advanced Parameters</AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 pt-2">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-histogram">Use Histogram for Signals</Label>
                                            <Switch
                                                id="use-histogram"
                                                defaultChecked={true}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="histogram-threshold">Histogram Threshold</Label>
                                        <Input
                                            id="histogram-threshold"
                                            type="number"
                                            defaultValue={"0.001"}
                                            step="0.001"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="use-zero-cross">Use Zero Line Crossover</Label>
                                            <Switch
                                                id="use-zero-cross"
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

            {strategyType === "custom" && (
                <div className="flex items-center justify-center h-[200px]">
                    <p className="text-muted-foreground">Custom strategy configuration is available in the advanced editor</p>
                </div>
            )}
        </div>
    )
}
