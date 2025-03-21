"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { DialogFooter } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"
import type { Strategy } from "@/lib/types"

// Form schema for strategy validation
const strategyFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    algorithm: z.string().min(2, { message: "Algorithm must be selected." }),
    risk: z.enum(["low", "medium", "high"], { message: "Risk level must be selected." }),
    allocation: z.number().min(1).max(100),
    timeframe: z.string().min(1, { message: "Timeframe must be selected." }),
    assets: z.string().min(1, { message: "At least one asset must be specified." }),
    status: z.enum(["active", "paused"]).optional(),
    parameters: z.record(z.string(), z.any()).optional(),
})

type StrategyFormValues = z.infer<typeof strategyFormSchema>

interface StrategyFormProps {
    strategy?: Strategy
    onSubmit: (data: StrategyFormValues) => void
}

// Add a mapping of algorithm types to their default parameters after the imports
const algorithmParameters = {
    moving_average: {
        smaFast: "10",
        smaSlow: "50",
    },
    rsi: {
        rsiPeriod: "14",
        overbought: "70",
        oversold: "30",
    },
    macd: {
        fastPeriod: "12",
        slowPeriod: "26",
        signalPeriod: "9",
    },
    bollinger: {
        period: "20",
        stdDev: "2",
    },
    custom: {},
}

export function StrategyForm({ strategy, onSubmit }: StrategyFormProps) {
    const [assetInput, setAssetInput] = useState("")
    const [selectedAssets, setSelectedAssets] = useState<string[]>(strategy?.assets ? strategy.assets.split(",") : [])

    // Add parameter input functionality to the form
    // First, add state for managing parameters
    const [paramKey, setParamKey] = useState("")
    const [paramValue, setParamValue] = useState("")
    const [parameters, setParameters] = useState<Record<string, any>>(strategy?.parameters || {})

    // Default values for the form
    const defaultValues: Partial<StrategyFormValues> = {
        name: strategy?.name || "",
        description: strategy?.description || "",
        algorithm: strategy?.algorithm || "",
        risk: strategy?.risk || "medium",
        allocation: strategy?.allocation || 10,
        timeframe: strategy?.timeframe || "1d",
        assets: strategy?.assets || "",
        status: strategy?.status || "paused",
        parameters: strategy?.parameters || {},
    }

    const form = useForm<StrategyFormValues>({
        resolver: zodResolver(strategyFormSchema),
        defaultValues,
    })

    // Add a useEffect hook to watch for algorithm changes after the form initialization
    // Add this inside the StrategyForm component, after the form initialization
    useEffect(() => {
        // Watch for algorithm changes
        const subscription = form.watch((value, { name }) => {
            if (name === "algorithm") {
                const algorithm = value.algorithm as string
                if (algorithm && algorithmParameters[algorithm as keyof typeof algorithmParameters]) {
                    // Reset parameters when algorithm changes
                    setParameters(algorithmParameters[algorithm as keyof typeof algorithmParameters])
                    form.setValue("parameters", algorithmParameters[algorithm as keyof typeof algorithmParameters])
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [form])

    // Handle asset input
    const handleAddAsset = () => {
        if (assetInput && !selectedAssets.includes(assetInput)) {
            const newAssets = [...selectedAssets, assetInput]
            setSelectedAssets(newAssets)
            form.setValue("assets", newAssets.join(","))
            setAssetInput("")
        }
    }

    const handleRemoveAsset = (asset: string) => {
        const newAssets = selectedAssets.filter((a) => a !== asset)
        setSelectedAssets(newAssets)
        form.setValue("assets", newAssets.join(","))
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddAsset()
        }
    }

    // Add the handleAddParameter function after the handleKeyDown function
    const handleAddParameter = () => {
        if (paramKey.trim()) {
            // Convert value to number if it's numeric
            const value = !isNaN(Number(paramValue)) ? Number(paramValue) : paramValue
            const updatedParams = { ...parameters, [paramKey]: value }
            setParameters(updatedParams)
            form.setValue("parameters", updatedParams)
            setParamKey("")
            setParamValue("")
        }
    }

    const handleRemoveParameter = (key: string) => {
        const { [key]: _, ...rest } = parameters
        setParameters(rest)
        form.setValue("parameters", rest)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Strategy Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Moving Average Crossover" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="algorithm"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Algorithm</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select algorithm" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="moving_average">Moving Average Crossover</SelectItem>
                                        <SelectItem value="rsi">RSI Strategy</SelectItem>
                                        <SelectItem value="macd">MACD Strategy</SelectItem>
                                        <SelectItem value="bollinger">Bollinger Bands</SelectItem>
                                        <SelectItem value="custom">Custom Algorithm</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                                <Textarea placeholder="Describe your trading strategy..." className="resize-none" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="risk"
                        render={({ field }) => (
                            <FormItem className="space-y-3">
                                <FormLabel>Risk Level</FormLabel>
                                <FormControl>
                                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex space-x-4">
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="low" />
                                            </FormControl>
                                            <FormLabel className="font-normal text-green-500">Low</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="medium" />
                                            </FormControl>
                                            <FormLabel className="font-normal text-yellow-500">Medium</FormLabel>
                                        </FormItem>
                                        <FormItem className="flex items-center space-x-2 space-y-0">
                                            <FormControl>
                                                <RadioGroupItem value="high" />
                                            </FormControl>
                                            <FormLabel className="font-normal text-red-500">High</FormLabel>
                                        </FormItem>
                                    </RadioGroup>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="timeframe"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Timeframe</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select timeframe" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="1h">1 Hour</SelectItem>
                                        <SelectItem value="4h">4 Hours</SelectItem>
                                        <SelectItem value="1d">1 Day</SelectItem>
                                        <SelectItem value="1w">1 Week</SelectItem>
                                        <SelectItem value="1m">1 Month</SelectItem>
                                        <SelectItem value="3m">3 Months</SelectItem>
                                        <SelectItem value="6m">6 Months</SelectItem>
                                        <SelectItem value="1y">1 Year</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <FormField
                    control={form.control}
                    name="allocation"
                    render={({ field: { value, onChange } }) => (
                        <FormItem>
                            <FormLabel>Allocation ({value}%)</FormLabel>
                            <FormControl>
                                <Slider min={1} max={100} step={1} defaultValue={[value]} onValueChange={(vals) => onChange(vals[0])} />
                            </FormControl>
                            <FormDescription>Percentage of portfolio to allocate to this strategy</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="assets"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Assets</FormLabel>
                            <div className="flex space-x-2">
                                <Input
                                    placeholder="BTC, ETH, SOL..."
                                    value={assetInput}
                                    onChange={(e) => setAssetInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                <Button type="button" onClick={handleAddAsset}>
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {selectedAssets.map((asset) => (
                                    <Badge key={asset} variant="secondary" className="flex items-center gap-1">
                                        {asset}
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-4 w-4 p-0"
                                            onClick={() => handleRemoveAsset(asset)}
                                        >
                                            <X className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                            <input type="hidden" {...field} />
                            <FormMessage />
                        </FormItem>
                    )}
                />

                {/* Add the parameters input UI to the form, before the DialogFooter */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Strategy Parameters for {form.watch("algorithm")}</h4>
                    </div>

                    <div className="flex space-x-2">
                        <Select value={paramKey} onValueChange={setParamKey}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select parameter" />
                            </SelectTrigger>
                            <SelectContent>
                                {form.watch("algorithm") === "moving_average" && (
                                    <>
                                        <SelectItem value="smaFast">Fast SMA Period</SelectItem>
                                        <SelectItem value="smaSlow">Slow SMA Period</SelectItem>
                                        <SelectItem value="takeProfit">Take Profit</SelectItem>
                                        <SelectItem value="stopLoss">Stop Loss</SelectItem>
                                        <SelectItem value="trailingStopDistance">Trailing Stop Distance</SelectItem>
                                    </>
                                )}
                                {form.watch("algorithm") === "rsi" && (
                                    <>
                                        <SelectItem value="rsiPeriod">RSI Period</SelectItem>
                                        <SelectItem value="overbought">Overbought Level</SelectItem>
                                        <SelectItem value="oversold">Oversold Level</SelectItem>
                                    </>
                                )}
                                {form.watch("algorithm") === "macd" && (
                                    <>
                                        <SelectItem value="fastPeriod">Fast Period</SelectItem>
                                        <SelectItem value="slowPeriod">Slow Period</SelectItem>
                                        <SelectItem value="signalPeriod">Signal Period</SelectItem>
                                    </>
                                )}
                                {form.watch("algorithm") === "bollinger" && (
                                    <>
                                        <SelectItem value="period">Period</SelectItem>
                                        <SelectItem value="stdDev">Standard Deviation</SelectItem>
                                        <SelectItem value="useClose">Use Close Price</SelectItem>
                                    </>
                                )}
                                {form.watch("algorithm") === "custom" && <SelectItem value="custom">Custom Parameter</SelectItem>}
                                <SelectItem value="other">Other Parameter</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input placeholder="Value" value={paramValue} onChange={(e) => setParamValue(e.target.value)} />
                        <Button type="button" onClick={handleAddParameter} disabled={!paramKey}>
                            Add
                        </Button>
                    </div>

                    {Object.keys(parameters).length > 0 && (
                        <div className="rounded-md border p-4 max-h-[200px] overflow-y-auto">
                            <div className="space-y-2">
                                {Object.entries(parameters).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">{key}:</span>
                                            <span>{typeof value === "string" ? value : JSON.stringify(value)}</span>
                                        </div>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveParameter(key)}>
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <input type="hidden" {...form.register("parameters")} value={JSON.stringify(parameters)} />

                <DialogFooter>
                    <Button type="submit">{strategy ? "Update Strategy" : "Create Strategy"}</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}

