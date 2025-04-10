"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeftIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import StrategyTypeSelector from "./strategy-type-selector"
import StrategyParameters from "./strategy-parameters"
import AssetConfiguration from "./asset-configuration"
import RiskManagement from "./risk-management"
import { SidebarInset, SidebarProvider } from "../ui/sidebar"
import { AppSidebar } from "../layout/app-sidebar"
import { SiteHeader } from "../layout/site-header"

/* ─── constants ───────────────────────────────────────────────────────────── */
const steps = ["type", "general", "assets", "risk"] as const
const labels: Record<(typeof steps)[number], string> = {
    type: "Strategy Type",
    general: "General",
    assets: "Assets",
    risk: "Risk",
}
type StrategyType = Parameters<typeof StrategyTypeSelector>[0]["value"]

/* timeline dot */
function Dot({ active, done }: { active: boolean; done: boolean }) {
    return (
        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center
      ${done ? "bg-green-500 border-green-500 text-white"
                : active ? "bg-blue-500 border-blue-500 text-white"
                    : "border-muted-foreground"}`}>
            {done && <CheckCircle2 className="h-3 w-3" />}
        </div>
    )
}

/* ─── main wizard component ──────────────────────────────────────────────── */
export default function StrategyBuilderWizard() {
    const router = useRouter()
    const [stepIdx, setStepIdx] = useState(0)
    const [saving, setSaving] = useState(false)

    /* header fields */
    const [name, setName] = useState("")
    const [type, setType] = useState<StrategyType>("mean-reversion")
    const [description, setDesc] = useState("")

    /* auto‑save draft mock */
    useEffect(() => {
        const draft = { name, type, description, stepIdx }
        localStorage.setItem("strategy-draft", JSON.stringify(draft))
        toast.success("Draft saved ✨")
    }, [stepIdx, type])

    const next = () => setStepIdx(i => Math.min(i + 1, steps.length - 1))
    const back = () => setStepIdx(i => Math.max(i - 1, 0))
    const finish = () => {
        setSaving(true)
        setTimeout(() => {
            setSaving(false)
            toast("Saved to DB ✅")
            router.push("/strategies")
        }, 1000)
    }

    /* cards per step */
    const cards: Record<(typeof steps)[number], JSX.Element> = {
        type: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>Select Strategy Type</CardTitle></CardHeader>
                <CardContent><StrategyTypeSelector value={type} onChange={setType} /></CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={next} disabled={!type}>Next</Button>
                </CardFooter>
            </Card>
        ),
        general: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>General</CardTitle></CardHeader>
                <CardContent><StrategyParameters strategyType={type} /></CardContent>
                <CardFooter className="justify-between">
                    <Button variant="outline" onClick={back}>Back</Button>
                    <Button onClick={next}>Next</Button>
                </CardFooter>
            </Card>
        ),
        assets: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
                <CardContent><AssetConfiguration strategyType={type} /></CardContent>
                <CardFooter className="justify-between">
                    <Button variant="outline" onClick={back}>Back</Button>
                    <Button onClick={next}>Next</Button>
                </CardFooter>
            </Card>
        ),
        risk: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>Risk</CardTitle></CardHeader>
                <CardContent><RiskManagement /></CardContent>
                <CardFooter className="justify-between">
                    <Button variant="outline" onClick={back}>Back</Button>
                    <Button onClick={finish} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                        Finish
                    </Button>
                </CardFooter>
            </Card>
        ),
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="max-w-6xl mx-auto py-6 space-y-8">
                    {/* header */}
                    <div className="flex items-center gap-3 mb-6">
                        <Button variant="outline" size="icon" onClick={() => router.back()}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Strategy Builder</h1>
                    </div>

                    {/* name & description */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-6">
                        <div className="space-y-1">
                            <Label>Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Input value={description} onChange={e => setDesc(e.target.value)} />
                        </div>
                    </div>

                    {/* horizontal stepper */}
                    <div className="flex items-center gap-4 mb-8">
                        {steps.map((s, i) => (
                            <div key={s} className="flex items-center gap-2 cursor-pointer"
                                onClick={() => i <= stepIdx && setStepIdx(i)}>
                                <Dot active={i === stepIdx} done={i < stepIdx} />
                                <span className={`text-sm ${i === stepIdx ? "text-primary font-medium" : "text-muted-foreground"}`}>
                                    {labels[s]}
                                </span>
                                {i < steps.length - 1 && <div className="h-px w-8 bg-muted mx-2" />}
                            </div>
                        ))}
                    </div>

                    {/* current step card */}
                    {cards[steps[stepIdx]]}
                </div>
            </SidebarInset >
        </SidebarProvider >
    )
}