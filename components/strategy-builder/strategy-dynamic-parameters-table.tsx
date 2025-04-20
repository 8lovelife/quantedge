import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Award, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { parameterSchemas, riskSchemas } from "@/lib/api/algorithms"

const flattenSchemas = (strategyKey: string) => {
    const paramDefs = parameterSchemas[strategyKey] ?? []
    const riskDefs = riskSchemas["risk"] ?? []
    return [...paramDefs, ...riskDefs]
}

const ParametersTable = ({ selected, runsToParameters, strategyKey, highlightedRunIds }: {
    selected: number[],
    runsToParameters: Record<number, any>,
    strategyKey: string,
    highlightedRunIds: number[]
}) => {


    const effectiveSelected = selected.length === 0 ? [1] : selected
    const schema = flattenSchemas(strategyKey)


    console.log("run to parameters " + JSON.stringify(runsToParameters))

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Strategy Parameters
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <div className="overflow-x-auto">

                    <Table>
                        <TableHeader>
                            <TableRow className="text-xs">
                                <TableHead className="w-[80px]">Parameter</TableHead>
                                {effectiveSelected.map(id => (
                                    <TableHead key={id}>Run {id}</TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schema.map((param, rowIdx) => (
                                <TableRow key={param.key}>
                                    <TableCell className="font-medium">{param.name}</TableCell>
                                    {effectiveSelected.map(id => (
                                        // <TableCell
                                        //     key={id}
                                        //     className={cn(
                                        //         "transition-all",
                                        //         highlightedRunIds.includes(id) &&
                                        //         "bg-emerald-50 dark:bg-emerald-900/20 ring-1 ring-emerald-500 font-semibold"
                                        //     )}
                                        // >
                                        //     {runsToParameters[id]?.[param.key] ?? <span className="text-muted-foreground italic">–</span>}
                                        // </TableCell>

                                        // <TableCell key={id}>
                                        //     <div
                                        //         className={cn(
                                        //             "rounded-md px-2 py-1 transition-all text-sm",
                                        //             highlightedRunIds.includes(id)
                                        //                 ? "bg-emerald-100 dark:bg-emerald-900/20 ring-1 ring-emerald-500 font-semibold"
                                        //                 : "bg-muted/10"
                                        //         )}
                                        //     >
                                        //         {runsToParameters[id]?.[param.key] ?? <span className="text-muted-foreground italic">–</span>}
                                        //     </div>
                                        // </TableCell>

                                        <TableCell key={id} className="p-0">
                                            <div
                                                className={cn(
                                                    "px-3 py-1 text-sm transition-all h-full border-l border-r",
                                                    highlightedRunIds.includes(id)
                                                        ? cn(
                                                            "bg-indigo-50 dark:bg-indigo-900/20",
                                                            rowIdx === 0 && "rounded-t-md border-t",
                                                            rowIdx === schema.length - 1 && "rounded-b-md border-b"
                                                        )
                                                        : "border-transparent"
                                                )}
                                                style={{ minHeight: '100%' }}
                                            >
                                                {runsToParameters[id]?.[param.key] ?? (
                                                    <span className="text-muted-foreground italic">–</span>
                                                )}
                                            </div>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground">
                {effectiveSelected.length > 1
                    ? "Compare parameter values across different runs."
                    : "Select multiple runs to compare parameters."}
            </CardFooter>
        </Card>
    )
}

export default ParametersTable