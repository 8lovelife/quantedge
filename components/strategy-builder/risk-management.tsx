"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import DynamicStrategyParameters from "./strategy-dynamic-parameters"
import { riskSchemas } from "@/lib/api/algorithms"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion"


interface StrategyRiskProps {
    strategyType: string
    data: Record<string, any>
    onChange: (data: Record<string, any>) => void
}


export default function RiskManagement({ strategyType, data, onChange }: StrategyRiskProps) {
    const [useTrailingStop, setUseTrailingStop] = useState(false)

    return (
        <div className="space-y-6">
            {/* <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Risk Management Settings</h3>
            </div>

            <Separator /> */}

            <div className="space-y-6">
                <div className="space-y-4">
                    <DynamicStrategyParameters
                        strategyType="risk"
                        params={data}
                        category="core"
                        schemas={riskSchemas["risk"]}
                        onChange={onChange} />

                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="advanced">
                            <AccordionTrigger>Advanced Parameters</AccordionTrigger>
                            <AccordionContent>
                                <DynamicStrategyParameters
                                    strategyType="risk"
                                    category="position"
                                    params={data}
                                    schemas={riskSchemas["risk"]}
                                    onChange={onChange} />
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>


                    {/* 
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center">
                                <Label htmlFor="max-position-size">Max Position Size (% of Portfolio)</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Info className="h-4 w-4 ml-2 text-muted-foreground" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="w-[200px] text-xs">
                                                Maximum percentage of portfolio allocated to a single position
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <Input id="max-position-size" type="number" defaultValue="5" min="1" max="100" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="max-positions">Maximum Open Positions</Label>
                            <Input id="max-positions" type="number" defaultValue="5" min="1" />
                        </div>
                    </div> */}

                    {/* <div className="space-y-2">
                        <Label htmlFor="position-sizing-method">Position Sizing Method</Label>
                        <Select defaultValue="fixed">
                            <SelectTrigger id="position-sizing-method">
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="fixed">Fixed Percentage</SelectItem>
                                <SelectItem value="kelly">Kelly Criterion</SelectItem>
                                <SelectItem value="volatility">Volatility Adjusted</SelectItem>
                                <SelectItem value="equal">Equal Weighting</SelectItem>
                            </SelectContent>
                        </Select>
                    </div> */}
                </div>

                {/* <Separator /> */}

                {/* <div className="space-y-4">
                    <h4 className="font-medium">Stop Loss & Take Profit</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stop-loss">Default Stop Loss (%)</Label>
                            <Input id="stop-loss" type="number" defaultValue="2" step="0.1" min="0.1" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="take-profit">Default Take Profit (%)</Label>
                            <Input id="take-profit" type="number" defaultValue="6" step="0.1" min="0.1" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="use-trailing-stop">Use Trailing Stop Loss</Label>
                            <Switch id="use-trailing-stop" checked={useTrailingStop} onCheckedChange={setUseTrailingStop} />
                        </div>
                    </div>

                    {useTrailingStop && (
                        <div className="space-y-2">
                            <Label htmlFor="trailing-distance">Trailing Distance (%)</Label>
                            <Input id="trailing-distance" type="number" defaultValue="1" step="0.1" min="0.1" />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="stop-loss-type">Stop Loss Type</Label>
                        <Select defaultValue="percent">
                            <SelectTrigger id="stop-loss-type">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percent">Percentage</SelectItem>
                                <SelectItem value="atr">ATR Multiple</SelectItem>
                                <SelectItem value="fixed">Fixed Price</SelectItem>
                                <SelectItem value="support">Support/Resistance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div> */}

                {/* <Separator />

                <div className="space-y-4">
                    <h4 className="font-medium">Risk Limits</h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="max-drawdown">Maximum Drawdown (%)</Label>
                            <Input id="max-drawdown" type="number" defaultValue="15" min="1" max="100" />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="daily-loss-limit">Daily Loss Limit (%)</Label>
                            <Input id="daily-loss-limit" type="number" defaultValue="5" min="0.1" max="100" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="use-auto-shutdown">Auto Shutdown on Limit Breach</Label>
                            <Switch id="use-auto-shutdown" defaultChecked />
                        </div>
                    </div>
                </div>

                <Separator /> */}

                {/* <div className="space-y-4">
                    <h4 className="font-medium">Advanced Risk Settings</h4> */}

                {/* <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="use-correlation-filter">Use Correlation Filter</Label>
                            <Switch id="use-correlation-filter" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="use-volatility-filter">Use Volatility Filter</Label>
                            <Switch id="use-volatility-filter" defaultChecked />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="max-leverage">Maximum Leverage</Label>
                        <Select defaultValue="2">
                            <SelectTrigger id="max-leverage">
                                <SelectValue placeholder="Select leverage" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">1x (No Leverage)</SelectItem>
                                <SelectItem value="2">2x</SelectItem>
                                <SelectItem value="3">3x</SelectItem>
                                <SelectItem value="5">5x</SelectItem>
                                <SelectItem value="10">10x</SelectItem>
                                <SelectItem value="20">20x</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div> */}
            </div>
        </div>
    )
}
