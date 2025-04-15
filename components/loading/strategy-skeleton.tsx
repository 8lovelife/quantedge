import { Card, CardHeader, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function StrategySkeleton() {
    return (
        <Card className="overflow-hidden border flex flex-col">
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-6 w-32" />
                </div>
                <Skeleton className="h-8 w-8 rounded-full" />
            </CardHeader>

            <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-16" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-muted/30 p-2 rounded-md h-[72px] flex flex-col justify-center">
                            <Skeleton className="h-3 w-12 mx-auto mb-2" />
                            <Skeleton className="h-4 w-16 mx-auto" />
                        </div>
                    ))}
                </div>

                <div className="flex gap-2 mt-auto">
                    <Skeleton className="h-9 flex-1" />
                    <Skeleton className="h-9 flex-1" />
                </div>
            </CardContent>
        </Card>
    )
}