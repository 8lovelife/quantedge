"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { PlayIcon } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { BacktestParameters } from "@/lib/api/backtest/types"

// Define the schema for backtest parameters
const backtestParamsSchema = z.object({
    smaFast: z.number().min(1).max(50),
    smaSlow: z.number().min(10).max(200),
    riskLevel: z.enum(["low", "medium", "high"]),
    stopLoss: z.number().min(0.5).max(10),
    takeProfit: z.number().min(1).max(20),
    useTrailingStop: z.boolean().optional(),
    trailingStopDistance: z.number().min(0.5).max(10).optional(),
})

export type BacktestParamsFormValues = z.infer<typeof backtestParamsSchema>

// Update the BacktestParametersDialogProps interface to include progress and isCalculating
interface BacktestParametersDialogProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    defaultParams: BacktestParameters
    onSubmit: (values: BacktestParamsFormValues) => void
    progress: number
    isCalculating: boolean
}

// Update the component to accept and use the new props
export function BacktestParametersDialog({
    isOpen,
    onOpenChange,
    defaultParams,
    onSubmit,
    progress,
    isCalculating,
}: BacktestParametersDialogProps) {
    // Setup form for backtest parameters
    const form = useForm<BacktestParamsFormValues>({
        resolver: zodResolver(backtestParamsSchema),
        defaultValues: {
            smaFast: defaultParams.smaFast || 10,
            smaSlow: defaultParams.smaSlow || 50,
            riskLevel: defaultParams.riskLevel || "medium",
            stopLoss: defaultParams.stopLoss || 2,
            takeProfit: defaultParams.takeProfit || 6,
            useTrailingStop: defaultParams.useTrailingStop || false,
            trailingStopDistance: defaultParams.trailingStopDistance || 2,
        },
    })

    const handleSubmit = (values: BacktestParamsFormValues) => {
        onSubmit(values)
    }

    // Get progress color based on current progress
    const getProgressColor = () => {
        if (progress < 30) return "bg-orange-500"
        if (progress < 70) return "bg-blue-500"
        return "bg-green-500"
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Configure Backtest Parameters</DialogTitle>
                    <DialogDescription>Set the parameters for your backtest simulation</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                        {/* Form fields */}
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="smaFast"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fast MA Period</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={50}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>Short-term moving average period</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="smaSlow"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Slow MA Period</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={10}
                                                max={200}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>Long-term moving average period</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="riskLevel"
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

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="stopLoss"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Stop Loss (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0.5}
                                                max={10}
                                                step={0.1}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>Percentage loss to trigger stop</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="takeProfit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Take Profit (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={20}
                                                step={0.1}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>Percentage gain to take profit</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="useTrailingStop"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Trailing Stop</FormLabel>
                                        <FormDescription>Use trailing stop loss to lock in profits</FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                                    </FormControl>
                                </FormItem>
                            )}
                        />

                        {form.watch("useTrailingStop") && (
                            <FormField
                                control={form.control}
                                name="trailingStopDistance"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trailing Stop Distance (%)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                min={0.5}
                                                max={10}
                                                step={0.1}
                                                {...field}
                                                onChange={(e) => field.onChange(Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>Distance to maintain for trailing stop</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <DialogFooter className="flex flex-col space-y-2">
                            <Button type="submit" className="w-full" disabled={isCalculating}>
                                <PlayIcon className="mr-2 h-4 w-4" />
                                Run Backtest
                            </Button>

                            {isCalculating && (
                                <div className="w-full space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span>Processing backtest...</span>
                                        <span>{progress}% complete</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${getProgressColor()} transition-all duration-300 ease-out`}
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                </div>
                            )}
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}

