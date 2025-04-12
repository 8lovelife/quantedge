// StrategyBuilderWizard.tsx

"use client"

import { JSX, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle2, ArrowLeftIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
    Card, CardContent, CardFooter, CardHeader, CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

import StrategyTypeSelector from "./strategy-type-selector"
import StrategyParameters from "./strategy-parameters"
import AssetConfiguration from "./asset-configuration"
import RiskManagement from "./risk-management"
import { SidebarInset, SidebarProvider } from "../ui/sidebar"
import { AppSidebar } from "../layout/app-sidebar"
import { SiteHeader } from "../layout/site-header"
import { AssetData } from "@/lib/types"
import { AssetAllocationData, saveStep } from "@/lib/api/strategies"
import { AlgorithmOption, fetchAlgorithms } from "@/lib/api/algorithms"

const steps = ["type", "parameters", "assets", "risk"] as const
const labels = {
    type: "Strategy Type",
    parameters: "Parameters",
    assets: "Assets",
    risk: "Risk",
} as const

type StrategyType = Parameters<typeof StrategyTypeSelector>[0]["value"]
type ParametersData = Record<string, any>
type RiskData = { maxDrawdown: number }


export default function StrategyBuilderWizard() {
    const router = useRouter()
    const [stepIdx, setStepIdx] = useState(0)
    const [saving, setSaving] = useState(false)
    const [draftId, setDraftId] = useState<string | null>(null)

    const [name, setName] = useState("")
    const [type, setType] = useState<StrategyType>("mean-reversion")
    const [description, setDesc] = useState("")

    const [paramData, setParamData] = useState<Record<string, any>>(null)
    const [assetData, setAssetData] = useState<AssetAllocationData[]>([])
    const [riskData, setRiskData] = useState<Record<string, any>>(null)

    const [strategyTypes, setStrategyTypes] = useState<AlgorithmOption[]>([])

    const nameDescValid = name.trim() && description.trim()

    const totalWeight = assetData.reduce((sum, a) => sum + Number(a.weight), 0)
    const allocationValid = totalWeight === 100


    useEffect(() => {
        const laodStrategyTypes = async () => {
            const strategyTypes = await fetchAlgorithms();
            setStrategyTypes(strategyTypes)
        }
        laodStrategyTypes()
    }, [])


    useEffect(() => {
        if (!type || strategyTypes.length === 0) return
        const selected = strategyTypes.find((s) => s.value === type)
        if (selected) {
            setParamData(selected.defaultParameters ?? {})
            setRiskData(selected.defaultRisk ?? {})
        }
    }, [type, strategyTypes])


    const saveAndNext = async () => {
        setSaving(true)
        const stepName = steps[stepIdx]
        let payload: any = {}
        if (stepName === "type") payload = { name, type, description }
        if (stepName === "parameters") payload = paramData
        if (stepName === "assets") payload = assetData
        if (stepName === "risk") payload = riskData
        const id = await saveStep(draftId, stepName, payload)
        if (!draftId && id) setDraftId(id)
        setSaving(false)
        setStepIdx(i => Math.min(i + 1, steps.length - 1))
    }

    const finish = async () => {
        setSaving(true)
        const id = await saveStep(draftId, "risk", riskData)
        if (!draftId && id) setDraftId(id)
        setSaving(false)
        toast("Strategy saved to DB ✅")
        router.push(`/strategies/${id}`)
    }

    const back = () => setStepIdx(i => Math.max(i - 1, 0))

    const Dot = ({ active, done }: { active: boolean; done: boolean }) => (
        <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center
      ${done ? "bg-green-500 border-green-500 text-white"
                : active ? "bg-blue-500 border-blue-500 text-white"
                    : "border-muted-foreground"}`}>
            {done && <CheckCircle2 className="h-3 w-3" />}
        </div>
    )

    const cards = {
        type: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>Select Strategy Type</CardTitle></CardHeader>
                <CardContent><StrategyTypeSelector strategies={strategyTypes} value={type} onChange={setType} /></CardContent>
                <CardFooter className="justify-end">
                    <Button onClick={saveAndNext} disabled={!type || !nameDescValid || saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Next
                    </Button>
                </CardFooter>
            </Card>
        ),
        parameters: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>Parameters</CardTitle></CardHeader>
                <CardContent>
                    <StrategyParameters strategyType={type} onChange={setParamData} data={paramData} />
                </CardContent>
                <CardFooter className="justify-between">
                    <Button variant="outline" onClick={back}>Back</Button>
                    <Button onClick={saveAndNext} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Next
                    </Button>
                </CardFooter>
            </Card>
        ),
        assets: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>Assets</CardTitle></CardHeader>
                <CardContent>
                    <AssetConfiguration onChange={setAssetData} data={assetData} />
                </CardContent>
                <CardFooter className="justify-between">
                    <Button variant="outline" onClick={back}>Back</Button>
                    <Button onClick={saveAndNext} disabled={!allocationValid || saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Next
                    </Button>
                </CardFooter>
            </Card>
        ),
        risk: (
            <Card className="max-w-3xl">
                <CardHeader><CardTitle>Risk</CardTitle></CardHeader>
                <CardContent>
                    <RiskManagement onChange={setRiskData} data={riskData} />
                </CardContent>
                <CardFooter className="justify-between">
                    <Button variant="outline" onClick={back}>Back</Button>
                    <Button onClick={finish} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />} Finish
                    </Button>
                </CardFooter>
            </Card>
        )
    } as Record<(typeof steps)[number], JSX.Element>

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="max-w-6xl mx-auto py-6 space-y-8">
                    <div className="flex items-center gap-3 mb-6">
                        <Button variant="outline" size="icon" onClick={() => router.back()}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Strategy Builder</h1>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mb-6">
                        <div className="space-y-1">
                            <Label>Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} />
                        </div>
                        <div className="space-y-1">
                            <Label>Description</Label>
                            <Textarea value={description} onChange={e => setDesc(e.target.value)} />
                        </div>
                    </div>
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
                    {cards[steps[stepIdx]]}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
