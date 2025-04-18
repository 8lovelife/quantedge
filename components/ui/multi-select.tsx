/* components/ui/multi-select.tsx */
import * as React from "react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"

interface MultiSelectProps {
    values: number[]
    options: number[]
    placeholder?: string
    onChange: (v: number[]) => void
}

export function MultiSelect({ values, options, placeholder, onChange }: MultiSelectProps) {
    const toggle = (v: number) =>
        values.includes(v)
            ? onChange(values.filter(x => x !== v))
            : onChange([...values, v])

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-between">
                    {values.length === 0 ? (
                        <span className="text-muted-foreground">{placeholder}</span>
                    ) : (
                        values.join(", ")
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-48 p-2 space-y-1">
                {options.map(opt => (
                    <label key={opt} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                            checked={values.includes(opt)}
                            onCheckedChange={() => toggle(opt)}
                        />
                        <span>{opt}</span>
                    </label>
                ))}
            </PopoverContent>
        </Popover>
    )
}