import { Card, CardContent, CardFooter, CardHeader } from "../ui/card"

export default function ConfigurationPanelSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">
            <div className="h-10 bg-muted rounded-md" /> {/* Tabs skeleton */}
            <Card>
                <CardHeader>
                    <div className="h-6 w-1/3 bg-muted rounded-md mb-2" /> {/* Title skeleton */}
                    <div className="h-4 w-2/3 bg-muted rounded-md" /> {/* Description skeleton */}
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Market Configuration skeleton */}
                    <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-1/3 bg-muted rounded-md" />
                                <div className="h-10 bg-muted rounded-md" />
                            </div>
                        ))}
                    </div>

                    <div className="h-[1px] bg-muted" /> {/* Separator */}

                    {/* Parameters skeleton */}
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="space-y-2">
                                <div className="h-4 w-1/4 bg-muted rounded-md" />
                                <div className="h-10 bg-muted rounded-md" />
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter>
                    <div className="h-10 w-full bg-muted rounded-md" /> {/* Button skeleton */}
                </CardFooter>
            </Card>
        </div>
    )
}