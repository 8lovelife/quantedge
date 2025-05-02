// import {
//     Card, CardHeader, CardTitle, CardContent, CardFooter
// } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import { Button } from "@/components/ui/button"
// import { Clock, CheckCircle2, XCircle } from "lucide-react"
// import { cn } from "@/lib/utils"

// interface Props {
//     ex: Exchange
//     onEdit(ex: Exchange): void
//     onDelete(id: number): void
//     onTest(id: number): void
// }

// function ExchangeCard({ ex, onEdit, onDelete, onTest }: Props) {
//     const lastTest = ex.lastTestTime
//         ? new Date(ex.lastTestTime).toLocaleString()
//         : "Never"

//     return (
//         <Card className="flex flex-col">
//             <CardHeader className="flex justify-between items-center pb-2">
//                 <div className="flex items-center gap-2">
//                     <span
//                         className={cn(
//                             "inline-block w-2 h-2 rounded-full",
//                             ex.enabled ? "bg-green-500" : "bg-red-500"
//                         )}
//                     />
//                     <CardTitle className="text-lg">{ex.name}</CardTitle>
//                 </div>
//                 <Badge variant="outline">{ex.type}</Badge>
//             </CardHeader>

//             <CardContent className="flex-1 space-y-2 text-sm">
//                 <div>
//                     <span className="font-medium">Base URL:</span> {ex.baseUrl}
//                 </div>
//                 <div>
//                     <span className="font-medium">API Key:</span> {ex.apiKey}
//                 </div>
//                 <div className="flex items-center gap-1">
//                     <Clock className="h-4 w-4 text-muted-foreground" />
//                     <span className="text-xs text-muted-foreground">
//                         Last test: {lastTest}
//                     </span>
//                 </div>
//             </CardContent>

//             <CardFooter className="flex justify-between">
//                 <div className="space-x-2">
//                     <Button size="sm" onClick={() => onTest(ex.id)}>
//                         Test
//                     </Button>
//                     <Button size="sm" variant="outline" onClick={() => onEdit(ex)}>
//                         Configure
//                     </Button>
//                 </div>
//                 <Button
//                     size="sm"
//                     variant="destructive"
//                     onClick={() => onDelete(ex.id)}
//                 >
//                     Delete
//                 </Button>
//             </CardFooter>
//         </Card>
//     )
// }