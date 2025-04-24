"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    HoverCard,
    HoverCardTrigger,
    HoverCardContent
} from "@/components/ui/hover-card"
import { Info } from "lucide-react"
import { ParameterField } from "@/lib/api/algorithms"

interface DynamicStrategyParametersProps {
    strategyType: string
    category?: string
    params: Record<string, any>
    schemas: ParameterField[]
    onChange: (data: Record<string, any>) => void
}

export default function DynamicStrategyParametersNoGroup({
    strategyType,
    category = "core",
    params,
    schemas,
    onChange
}: DynamicStrategyParametersProps) {
    const handleParamChange = (
        param: ParameterField,
        value: string | number | boolean
    ) => {
        const castedValue =
            param.type === "number" ? Number(value) : value

        onChange({ ...params, [param.key]: castedValue })
    }

    const isVisible = (param: ParameterField): boolean => {
        if (!param.showIf) return true
        return params[param.showIf.key] === param.showIf.value
    }

    const renderField = (param: ParameterField) => {
        if (param.type === "select" && param.options) {
            const rawOptions = param.options
            // const options = rawOptions as { label: string; value: string }[]
            console.log("params " + JSON.stringify(params) + " and param " + JSON.stringify(param))
            const currentValue = params[param.key]
            const selectedLabel =
                rawOptions.find((opt) => opt.value === currentValue)?.label ?? currentValue

            return (
                <Select
                    value={currentValue}
                    onValueChange={(value) => handleParamChange(param, value)}
                >
                    <SelectTrigger>
                        <SelectValue>{selectedLabel}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {rawOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            )
        } else {
            return (
                <div className="flex items-center gap-2">
                    <Input
                        id={param.key}
                        type="number"
                        value={params[param.key] ?? ""}
                        onChange={(e) => handleParamChange(param, e.target.value)}
                        step={param.step}
                        min={param.min}
                        max={param.max}
                    />
                    {param.unit && (
                        <span className="text-xs text-muted-foreground w-8">
                            {param.unit}
                        </span>
                    )}
                </div>
            )
        }
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {schemas
                .filter((p) => p.category === category && isVisible(p))
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((param) => (
                    <div key={param.key} className="space-y-2">
                        <HoverCard>
                            <HoverCardTrigger asChild>
                                <Label
                                    htmlFor={param.key}
                                    className="text-sm flex items-center gap-1 cursor-help"
                                >
                                    {param.name}
                                    <Info className="h-3 w-3" />
                                </Label>
                            </HoverCardTrigger>
                            <HoverCardContent>
                                <div className="space-y-2">
                                    <p className="text-sm">{param.description}</p>
                                    {param.min !== undefined &&
                                        param.max !== undefined && (
                                            <div className="text-xs text-muted-foreground">
                                                Range: {param.min} - {param.max} {param.unit ?? ""}
                                            </div>
                                        )}
                                </div>
                            </HoverCardContent>
                        </HoverCard>

                        {renderField(param)}
                    </div>
                ))}
        </div>
    )
}