import React from "react";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn, formatDuration } from "@/lib/utils";
import { LabRunHistory } from "@/lib/api/algorithms";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Check } from "lucide-react";

type Props = {
    runHistorys: LabRunHistory[];
    selected: number[];
    toggle: (id: number) => void;
    onApply: (runId: number) => void;
};

const RunSelectionCard = ({ runHistorys, selected, toggle, onApply }: Props) => {
    if (!Array.isArray(runHistorys) || runHistorys.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>No Runs Available</CardTitle>
                </CardHeader>
                <CardContent>No run history data was loaded.</CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Backtest History</CardTitle>
                <CardDescription>
                    Select cards to compare. Click again to unselect.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {runHistorys.map((run) => {
                        const idNum = Number(run.id);
                        const isSelected = selected.includes(idNum);

                        return (
                            <div
                                key={run.id}
                                className={cn(
                                    "flex flex-col space-y-3 p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors",
                                    isSelected && "border-2 border-blue-300"
                                )}
                                onClick={() => toggle(idNum)}
                            >
                                {/* Header row */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="font-medium">Run {run.id}</div>
                                        <Badge variant="outline">{run.status}</Badge>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        {new Date(run.startTime).toLocaleString()}
                                    </div>

                                    {isSelected && (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onApply(Number(run.id));
                                                    }}
                                                >
                                                    <Check className="h-4 w-4 mr-1" />
                                                    Apply
                                                </Button>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" sideOffset={4}>
                                                Apply these parameters
                                            </TooltipContent>
                                        </Tooltip>
                                    )}
                                </div>

                                {/* Metrics row */}
                                <div className="grid grid-cols-5 gap-4">
                                    <Metric label="Return" value={run.performance.strategyReturn * 100} positive />
                                    <Metric label="Win Rate" value={run.performance.winRate * 100} />
                                    <Metric label="Sharpe" value={run.performance.sharpeRatio} />
                                    <Metric label="Drawdown" value={run.performance.maxDrawdown * 100} negative />
                                    <div>
                                        <div className="text-xs text-muted-foreground">Duration</div>
                                        <div className="text-sm font-medium">
                                            {formatDuration(run.startTime, run.endTime)}
                                        </div>
                                    </div>
                                </div>

                                {/* Meta row */}
                                <div className="grid grid-cols-5 gap-4">
                                    <Meta
                                        label="Mean Type"
                                        value={
                                            run.marketDetails.subType ||
                                            run.marketDetails.meanType ||
                                            run.parameters.meanType
                                        }
                                    />
                                    <Meta label="Trading Pair" value={run.marketDetails.pairs} />
                                    <Meta label="Timeframe" value={run.marketDetails.timeframe} />
                                    <Meta
                                        label="Initial Capital"
                                        value={
                                            run.marketDetails.initialCapital
                                                ? `$${run.marketDetails.initialCapital}`
                                                : "-"
                                        }
                                    />
                                    <Meta label="Direction" value={run.marketDetails.positionType} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
};

const Metric = ({
    label,
    value,
    positive = false,
    negative = false,
}: {
    label: string;
    value: number;
    positive?: boolean;
    negative?: boolean;
}) => (
    <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div
            className={cn(
                "text-sm font-medium",
                positive && "text-green-500",
                negative && "text-red-500"
            )}
        >
            {value.toFixed(2)}
            {label !== "Sharpe" && "%"}
        </div>
    </div>
);

const Meta = ({
    label,
    value,
}: {
    label: string;
    value?: string | number | null;
}) => (
    <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-sm font-medium">{value ?? "-"}</div>
    </div>
);

export default RunSelectionCard;