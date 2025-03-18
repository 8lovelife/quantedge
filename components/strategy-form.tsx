"use client"

import type React from "react"

import { useState } from "react"
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
})

type StrategyFormValues = z.infer<typeof strategyFormSchema>

interface StrategyFormProps {
    strategy?: Strategy
    onSubmit: (data: StrategyFormValues) => void
}

export function StrategyForm({ strategy, onSubmit }: StrategyFormProps) {
    const [assetInput, setAssetInput] = useState("")
    const [selectedAssets, setSelectedAssets] = useState<string[]>(strategy?.assets ? strategy.assets.split(",") : [])

    // Default values for the form
    const defaultValues: Partial<StrategyFormValues> = {
        name: strategy?.name || "",
        description: strategy?.description || "",
        algorithm: strategy?.algorithm || "",
        risk: strategy?.risk || "medium",
        allocation: strategy?.allocation || 10,
        timeframe: strategy?.timeframe || "1d",
        assets: strategy?.assets || "",
        status: strategy?.status || "active",
    }

    const form = useForm<StrategyFormValues>({
        resolver: zodResolver(strategyFormSchema),
        defaultValues,
    })

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

                <DialogFooter>
                    <Button type="submit">{strategy ? "Update Strategy" : "Create Strategy"}</Button>
                </DialogFooter>
            </form>
        </Form>
    )
}

