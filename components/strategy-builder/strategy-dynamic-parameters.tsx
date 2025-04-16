// DynamicStrategyParameters.tsx
"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { HoverCard, HoverCardTrigger, HoverCardContent } from "@/components/ui/hover-card"
import { Info } from "lucide-react"
import { ParameterField } from "@/lib/api/algorithms"

interface DynamicStrategyParametersProps {
    strategyType: string
    category?: string
    params: Record<string, any>
    schemas: ParameterField[]
    onChange: (data: Record<string, any>) => void
}

export default function DynamicStrategyParameters({
    strategyType,
    category = "Core",
    params,
    schemas,
    onChange
}: DynamicStrategyParametersProps) {


    const handleParamChange = (param: ParameterField, value: string | number) => {
        onChange({ ...params, [param.key]: Number(value) })
    }

    // const parameters = parameterSchemas[strategyType] || []

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {schemas
                .filter((p) => p.category === category)
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
                                    <div className="text-xs text-muted-foreground">
                                        Range: {param.min} - {param.max} {param.unit}
                                    </div>
                                </div>
                            </HoverCardContent>
                        </HoverCard>


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
                                <span className="text-xs text-muted-foreground w-8">{param.unit}</span>
                            )}
                        </div>
                    </div>
                ))}
        </div>
    )
}
