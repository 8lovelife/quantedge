import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "../ui/card"

export default function StrategyTempleteObserveResultsLoadingSkeleton() {
    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <div className="space-y-4">
                    <Skeleton className="h-8 w-[200px]" /> {/* Title */}
                    <Skeleton className="h-4 w-[300px]" /> {/* Description */}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Key Metrics Skeleton */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {Array(4).fill(null).map((_, i) => (
                        <div key={i} className="bg-muted/50 p-3 rounded-lg space-y-2">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-6 w-20" />
                        </div>
                    ))}
                </div>

                {/* Chart Skeleton */}
                <div>
                    <Skeleton className="h-[400px] w-full" />
                </div>

                {/* Additional Stats Skeleton */}
                <div className="grid grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array(3).fill(null).map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-5 w-32" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {Array(3).fill(null).map((_, i) => (
                                    <div key={i} className="flex justify-between">
                                        <Skeleton className="h-4 w-24" />
                                        <Skeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </CardContent>
        </Card>
    )
}