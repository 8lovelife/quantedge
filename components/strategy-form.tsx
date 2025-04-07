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
import { AlertCircle, X } from "lucide-react"
import type { Strategy } from "@/lib/types"
import { type AlgorithmOption, fetchAlgorithms } from "@/lib/api/algorithms"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AssetWithAllocation, StrategyFormValues } from "@/lib/api/strategies"


// Form schema for strategy validation
const strategyFormSchema = z.object({
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    description: z.string().min(10, { message: "Description must be at least 10 characters." }),
    algorithm: z.string().min(2, { message: "Algorithm must be selected." }),
    risk: z.enum(["low", "medium", "high"], { message: "Risk level must be selected." }),
    allocation: z.number().min(1).max(100),
    timeframe: z.string().min(1, { message: "Timeframe must be selected." }),
    assets: z.array(
        z.object({
            symbol: z.string(),
            allocation: z.number(),
        }),
    ),
    status: z.enum(["active", "paused"]).optional(),
    parameters: z.record(z.string(), z.any()).optional(), // Changed to accept object
})


interface StrategyFormProps {
    strategy?: Strategy
    onSubmit: (data: StrategyFormValues) => void
}

// Function to convert object to Map
function objectToMap(obj: Record<string, any>): Map<string, any> {
    const map = new Map<string, any>()
    Object.entries(obj).forEach(([key, value]) => {
        map.set(key, value)
    })
    return map
}

// Function to convert Map to object
function mapToObject(map: Map<string, any>): Record<string, any> {
    const obj: Record<string, any> = {}
    map.forEach((value, key) => {
        obj[key] = value
    })
    return obj
}

// Function to parse assets string to AssetWithAllocation array
function parseAssetsString(assetsString: string): AssetWithAllocation[] {
    if (!assetsString) return []

    try {
        return JSON.parse(assetsString)
    } catch (e) {
        // Fallback for old format (comma-separated symbols)
        return assetsString.split(",").map((symbol) => ({
            symbol: symbol.trim(),
            allocation: 0,
        }))
    }
}

// Helper function to round to 2 decimal places
function roundToTwoDecimals(num: number): number {
    return Math.round(num * 100) / 100
}

export function StrategyForm({ strategy, onSubmit }: StrategyFormProps) {
    // Tab state
    const [activeTab, setActiveTab] = useState("assets")

    const [assetInput, setAssetInput] = useState("")
    const [assetAllocation, setAssetAllocation] = useState(10)
    const [selectedAssets, setSelectedAssets] = useState<AssetWithAllocation[]>(() => {
        if (!strategy?.assets) return []

        // Handle case where assets might be stored as a string in legacy data
        if (typeof strategy.assets === "string") {
            return parseAssetsString(strategy.assets)
        }

        // Assets is already an array
        return strategy.assets as AssetWithAllocation[]
    })
    const [assetAllocationError, setAssetAllocationError] = useState<string | null>(null)

    // State for confirmation dialog
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)
    const [pendingSubmitData, setPendingSubmitData] = useState<StrategyFormValues | null>(null)

    // Change parameters state to use Map
    const [paramKey, setParamKey] = useState("")
    const [paramValue, setParamValue] = useState("")
    const [parameters, setParameters] = useState<Map<string, any>>(
        strategy?.parameters ? objectToMap(strategy.parameters) : new Map<string, any>(),
    )

    // Add state for algorithms and parameter options
    const [algorithms, setAlgorithms] = useState<AlgorithmOption[]>([])
    const [isLoadingAlgorithms, setIsLoadingAlgorithms] = useState(false)
    const [parameterOptions, setParameterOptions] = useState<string[]>([])

    // Add a map to store algorithm default parameters
    const [algorithmDefaultParams, setAlgorithmDefaultParams] = useState<Map<string, Map<string, any>>>(
        new Map<string, Map<string, any>>(),
    )

    // Calculate total asset allocation
    const totalAssetAllocation = selectedAssets.reduce((sum, asset) => sum + asset.allocation, 0)
    // Round to 2 decimal places for display and comparison
    const roundedTotalAllocation = roundToTwoDecimals(totalAssetAllocation)

    // Default values for the form
    const defaultValues: Partial<StrategyFormValues> = {
        name: strategy?.name || "",
        description: strategy?.description || "",
        algorithm: strategy?.algorithm || "",
        risk: strategy?.risk || "medium",
        allocation: strategy?.allocation || 10,
        timeframe: strategy?.timeframe || "1d",
        assets: (() => {
            if (!strategy?.assets) return []

            if (typeof strategy.assets === "string") {
                return parseAssetsString(strategy.assets)
            }

            return strategy.assets as AssetWithAllocation[]
        })(),
        status: strategy?.status || "paused",
        parameters: strategy?.parameters || {},
    }

    const form = useForm<StrategyFormValues>({
        resolver: zodResolver(strategyFormSchema),
        defaultValues,
    })

    // Add useEffect to fetch algorithms when creating a new strategy
    useEffect(() => {
        // Only fetch algorithms when creating a new strategy
        if (!strategy) {
            const getAlgorithms = async () => {
                setIsLoadingAlgorithms(true)
                try {
                    const algorithmOptions = await fetchAlgorithms()
                    setAlgorithms(algorithmOptions)

                    // Process and store default parameters for each algorithm
                    const paramsMap = new Map<string, Map<string, any>>()

                    algorithmOptions.forEach((algo) => {
                        if (algo.defaultParameters) {
                            paramsMap.set(algo.value, objectToMap(algo.defaultParameters))
                        } else {
                            paramsMap.set(algo.value, new Map<string, any>())
                        }
                    })

                    setAlgorithmDefaultParams(paramsMap)
                } catch (error) {
                    console.error("Failed to fetch algorithms:", error)
                } finally {
                    setIsLoadingAlgorithms(false)
                }
            }

            getAlgorithms()
        }
    }, [strategy])

    // Add a useEffect hook to watch for algorithm changes and set default parameters
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "algorithm") {
                const algorithm = value.algorithm as string
                if (algorithm && algorithmDefaultParams.has(algorithm)) {
                    // Get default parameters for the selected algorithm
                    const defaultParams = algorithmDefaultParams.get(algorithm) || new Map<string, any>()

                    // Set parameters to default values
                    setParameters(new Map(defaultParams))

                    // Update form value with the parameters map converted to object
                    form.setValue("parameters", mapToObject(defaultParams))

                    // Get parameter options for the dropdown
                    setParameterOptions(Array.from(defaultParams.keys()))

                    // Switch to parameters tab when algorithm changes
                    setActiveTab("parameters")
                }
            }
        })

        return () => subscription.unsubscribe()
    }, [form, algorithmDefaultParams])

    // Validate asset allocations
    useEffect(() => {
        if (roundedTotalAllocation > 100) {
            setAssetAllocationError("Total asset allocation exceeds 100%")
        } else if (selectedAssets.length > 0 && roundedTotalAllocation < 100) {
            setAssetAllocationError("Total asset allocation is less than 100%")
        } else {
            setAssetAllocationError(null)
        }

        // Update the form value with the assets array directly
        form.setValue("assets", selectedAssets)
    }, [selectedAssets, form, roundedTotalAllocation])

    // Handle asset input
    const handleAddAsset = () => {
        if (assetInput && !selectedAssets.some((a) => a.symbol === assetInput)) {
            // Check if adding this asset would exceed 100%
            const newTotalAllocation = roundedTotalAllocation + assetAllocation
            if (newTotalAllocation > 100) {
                setAssetAllocationError(`Adding ${assetAllocation}% would exceed 100% total allocation`)
                return
            }

            const newAssets = [...selectedAssets, { symbol: assetInput, allocation: assetAllocation }]

            setSelectedAssets(newAssets)
            form.setValue("assets", newAssets)
            setAssetInput("")
            setAssetAllocation(Math.min(10, roundToTwoDecimals(100 - newTotalAllocation))) // Default to 10% or remaining allocation
        }
    }

    const handleRemoveAsset = (assetSymbol: string) => {
        const newAssets = selectedAssets.filter((a) => a.symbol !== assetSymbol)
        setSelectedAssets(newAssets)
        form.setValue("assets", newAssets)
    }

    const handleUpdateAssetAllocation = (assetSymbol: string, newAllocation: number) => {
        // Calculate what the total would be with this change
        const currentAsset = selectedAssets.find((a) => a.symbol === assetSymbol)
        if (!currentAsset) return

        const otherAssetsTotal = totalAssetAllocation - currentAsset.allocation
        const newTotal = roundToTwoDecimals(otherAssetsTotal + newAllocation)

        if (newTotal > 100) {
            setAssetAllocationError(`Allocation of ${newAllocation}% would exceed 100% total`)
            return
        }

        const newAssets = selectedAssets.map((asset) =>
            asset.symbol === assetSymbol ? { ...asset, allocation: newAllocation } : asset,
        )

        setSelectedAssets(newAssets)
        form.setValue("assets", newAssets)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            e.preventDefault()
            handleAddAsset()
        }
    }

    // Improved Distribute Remaining function
    const distributeRemaining = () => {
        if (selectedAssets.length === 0) return

        const remaining = 100 - roundedTotalAllocation
        if (remaining <= 0) return

        // First, create a copy of the assets array
        const newAssets = [...selectedAssets]

        // Calculate the amount to add per asset (rounded to 2 decimals)
        const addPerAsset = roundToTwoDecimals(remaining / selectedAssets.length)

        // First pass: add the per-asset amount to all assets except the last one
        for (let i = 0; i < newAssets.length - 1; i++) {
            newAssets[i] = {
                ...newAssets[i],
                allocation: roundToTwoDecimals(newAssets[i].allocation + addPerAsset),
            }
        }

        // Calculate the current total after updating all but the last asset
        const currentTotal = newAssets.slice(0, newAssets.length - 1).reduce((sum, asset) => sum + asset.allocation, 0)

        // Set the last asset's allocation to make the total exactly 100%
        const lastAssetAllocation = roundToTwoDecimals(100 - currentTotal)
        newAssets[newAssets.length - 1] = {
            ...newAssets[newAssets.length - 1],
            allocation: lastAssetAllocation,
        }

        setSelectedAssets(newAssets)
        form.setValue("assets", newAssets)
    }

    // Improved Balance Equally function
    const balanceAllocations = () => {
        if (selectedAssets.length === 0) return

        // First, create a copy of the assets array
        const newAssets = [...selectedAssets]

        // Calculate equal allocation per asset (rounded to 2 decimals)
        const equalAllocation = roundToTwoDecimals(100 / selectedAssets.length)

        // First pass: set all assets except the last one to the equal allocation
        for (let i = 0; i < newAssets.length - 1; i++) {
            newAssets[i] = {
                ...newAssets[i],
                allocation: equalAllocation,
            }
        }

        // Calculate the current total after updating all but the last asset
        const currentTotal = newAssets.slice(0, newAssets.length - 1).reduce((sum, asset) => sum + asset.allocation, 0)

        // Set the last asset's allocation to make the total exactly 100%
        const lastAssetAllocation = roundToTwoDecimals(100 - currentTotal)
        newAssets[newAssets.length - 1] = {
            ...newAssets[newAssets.length - 1],
            allocation: lastAssetAllocation,
        }

        setSelectedAssets(newAssets)
        form.setValue("assets", newAssets)
    }

    // Update handleAddParameter to work with Map
    const handleAddParameter = () => {
        if (paramKey.trim()) {
            // Convert value to number if it's numeric
            const value = !isNaN(Number(paramValue)) ? Number(paramValue) : paramValue

            // Create a new Map with the updated parameter
            const updatedParams = new Map(parameters)
            updatedParams.set(paramKey, value)

            setParameters(updatedParams)

            // Convert Map to object for form value
            form.setValue("parameters", mapToObject(updatedParams))

            setParamKey("")
            setParamValue("")
        }
    }

    // Update handleRemoveParameter to work with Map
    const handleRemoveParameter = (key: string) => {
        const updatedParams = new Map(parameters)
        updatedParams.delete(key)

        setParameters(updatedParams)

        // Convert Map to object for form value
        form.setValue("parameters", mapToObject(updatedParams))
    }

    // Modified onSubmit handler to check allocation before submission
    const handleSubmit = (data: StrategyFormValues) => {
        // If parameters is a Map, convert it to an object
        if (data.parameters instanceof Map) {
            data.parameters = mapToObject(data.parameters)
        }

        // Check if assets are defined and if allocation is not 100%
        if (selectedAssets.length > 0 && roundedTotalAllocation !== 100) {
            // Store the data for later submission if confirmed
            setPendingSubmitData(data)
            // Show confirmation dialog
            setShowConfirmDialog(true)
            return
        }

        // If allocation is 100% or no assets, submit directly
        onSubmit(data)
    }

    // Handle confirmation dialog confirm action
    const handleConfirmSubmit = () => {
        if (pendingSubmitData) {
            onSubmit(pendingSubmitData)
        }
        setShowConfirmDialog(false)
        setPendingSubmitData(null)
    }

    // Handle confirmation dialog cancel action
    const handleCancelSubmit = () => {
        setShowConfirmDialog(false)
        setPendingSubmitData(null)
        // Switch to assets tab to fix allocation
        setActiveTab("assets")
    }

    // Render the Assets tab content
    const renderAssetsTab = () => (
        <div className="space-y-4">
            <div className="flex space-x-2">
                <Input
                    placeholder="BTC, ETH, SOL..."
                    value={assetInput}
                    onChange={(e) => setAssetInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                />
                <div className="flex items-center space-x-2 w-48">
                    <span className="text-sm">Allocation:</span>
                    <Input
                        type="number"
                        min="1"
                        max="100"
                        value={assetAllocation}
                        onChange={(e) => setAssetAllocation(Number(e.target.value))}
                        className="w-20"
                    />
                    <span className="text-sm">%</span>
                </div>
                <Button type="button" onClick={handleAddAsset}>
                    Add
                </Button>
            </div>

            {assetAllocationError && (
                <Alert variant="destructive" className="py-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{assetAllocationError}</AlertDescription>
                </Alert>
            )}

            <div className="flex justify-between items-center">
                <div className="text-sm">
                    Total Allocation:{" "}
                    <span className={roundedTotalAllocation === 100 ? "text-green-500 font-bold" : "text-amber-500 font-bold"}>
                        {roundedTotalAllocation}%
                    </span>
                </div>
                <div className="space-x-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={distributeRemaining}
                        disabled={roundedTotalAllocation >= 100 || selectedAssets.length === 0}
                    >
                        Distribute Remaining
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={balanceAllocations}
                        disabled={selectedAssets.length === 0}
                    >
                        Balance Equally
                    </Button>
                </div>
            </div>

            <div className="rounded-md border p-4" style={{ height: "200px", overflowY: "auto" }}>
                {selectedAssets.length > 0 ? (
                    <div className="space-y-2">
                        {selectedAssets.map((asset) => (
                            <div key={asset.symbol} className="flex items-center justify-between">
                                <div className="font-medium">{asset.symbol}</div>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={asset.allocation}
                                        onChange={(e) => handleUpdateAssetAllocation(asset.symbol, Number(e.target.value))}
                                        className="w-20"
                                    />
                                    <span className="text-sm">%</span>
                                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveAsset(asset.symbol)}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No assets added yet. Add assets above.
                    </div>
                )}
            </div>
        </div>
    )

    // Render the Parameters tab content
    const renderParametersTab = () => (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">
                    Strategy Parameters for {form.watch("algorithm")}
                    {isLoadingAlgorithms && <span className="ml-2 text-xs text-muted-foreground">(Loading...)</span>}
                </h4>
            </div>

            <div className="flex space-x-2">
                <Select value={paramKey} onValueChange={setParamKey}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* Dynamic parameter options based on algorithm */}
                        {parameterOptions.map((param) => (
                            <SelectItem key={param} value={param}>
                                {param}
                            </SelectItem>
                        ))}
                        <SelectItem value="other">Other Parameter</SelectItem>
                    </SelectContent>
                </Select>
                <Input placeholder="Value" value={paramValue} onChange={(e) => setParamValue(e.target.value)} />
                <Button type="button" onClick={handleAddParameter} disabled={!paramKey || isLoadingAlgorithms}>
                    Add
                </Button>
            </div>

            <div className="h-[40px]">{/* This empty div ensures consistent spacing between sections */}</div>

            <div className="rounded-md border p-4" style={{ height: "200px", overflowY: "auto" }}>
                {parameters.size > 0 ? (
                    <div className="space-y-2">
                        {Array.from(parameters.entries()).map(([key, value]) => (
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
                ) : (
                    <div className="h-full flex items-center justify-center text-muted-foreground">
                        No parameters added yet. Add parameters above.
                    </div>
                )}
            </div>
        </div>
    )

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
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
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={!!strategy} // Disable when editing (strategy exists)
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select algorithm" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {strategy ? (
                                            // When editing, show the current algorithm
                                            <SelectItem value={field.value}>{field.value}</SelectItem>
                                        ) : (
                                            // When creating, show fetched algorithms
                                            algorithms.map((algo) => (
                                                <SelectItem key={algo.value} value={algo.value}>
                                                    {algo.label}
                                                </SelectItem>
                                            ))
                                        )}
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

                {/* Tabbed interface for Assets and Parameters */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="assets">
                            Assets
                            {selectedAssets.length > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {selectedAssets.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="parameters">
                            Parameters
                            {parameters.size > 0 && (
                                <Badge variant="secondary" className="ml-2">
                                    {parameters.size}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    <Card className="mt-4 border">
                        <CardContent className="pt-6">
                            <div className="relative" style={{ height: "350px" }}>
                                <div
                                    className={`absolute top-0 left-0 w-full transition-opacity duration-200 ${activeTab === "assets" ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                                >
                                    <FormField
                                        control={form.control}
                                        name="assets"
                                        render={() => (
                                            <FormItem>
                                                {renderAssetsTab()}
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div
                                    className={`absolute top-0 left-0 w-full transition-opacity duration-200 ${activeTab === "parameters" ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                                >
                                    {renderParametersTab()}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </Tabs>

                <DialogFooter>
                    <Button type="submit">{strategy ? "Update Strategy" : "Create Strategy"}</Button>
                </DialogFooter>
            </form>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Asset Allocation Warning</DialogTitle>
                        <DialogDescription>
                            Your asset allocations currently total {roundedTotalAllocation}%, which is{" "}
                            {roundedTotalAllocation < 100 ? "less" : "more"} than 100%.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <p>It's recommended that your asset allocations total exactly 100%. Would you like to:</p>
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                            <li>Go back and adjust your allocations</li>
                            <li>Automatically balance your allocations to 100%</li>
                            <li>Continue with the current allocations</li>
                        </ul>
                    </div>
                    <DialogFooter className="flex space-x-2">
                        <Button variant="outline" onClick={handleCancelSubmit}>
                            Adjust Allocations
                        </Button>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                balanceAllocations()
                                setShowConfirmDialog(false)
                            }}
                        >
                            Auto-Balance
                        </Button>
                        <Button onClick={handleConfirmSubmit}>Continue Anyway</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Form>
    )
}

