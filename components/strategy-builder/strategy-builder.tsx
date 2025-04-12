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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

import StrategyTypeSelector from "./strategy-type-selector"
import StrategyParameters from "./strategy-parameters"
import AssetConfiguration from "./asset-configuration"
import RiskManagement from "./risk-management"
import { SidebarInset, SidebarProvider } from "../ui/sidebar"
import { AppSidebar } from "../layout/app-sidebar"
import { SiteHeader } from "../layout/site-header"
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

type SavedStep = {
    type?: {
        name: string,
        description: string,
        strategyName: string,
    }
    parameters?: Record<string, any>
    assets?: AssetAllocationData[]
    risk?: Record<string, any>
}

export default function StrategyBuilderWizard() {
    const router = useRouter()
    const [stepIdx, setStepIdx] = useState(0)
    const [saving, setSaving] = useState(false)
    const [draftId, setDraftId] = useState<string | null>(null)
    const [completedSteps, setCompletedSteps] = useState<SavedStep>({})

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
        const loadStrategyTypes = async () => {
            const strategyTypes = await fetchAlgorithms()
            setStrategyTypes(strategyTypes)
        }
        loadStrategyTypes()
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

        if (stepName === "type") {
            payload = { name, type, description }
            setCompletedSteps(prev => ({
                ...prev,
                type: {
                    name,
                    description,
                    strategyName: strategyTypes.find(s => s.value === type)?.label || type
                }
            }))
        }
        if (stepName === "parameters") setCompletedSteps(prev => ({ ...prev, parameters: paramData }))
        if (stepName === "assets") setCompletedSteps(prev => ({ ...prev, assets: assetData }))
        if (stepName === "risk") setCompletedSteps(prev => ({ ...prev, risk: riskData }))

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
        type: <StrategyTypeSelector strategies={strategyTypes} value={type} onChange={setType} />,
        parameters: <StrategyParameters strategyType={type} onChange={setParamData} data={paramData} />,
        assets: <AssetConfiguration onChange={setAssetData} data={assetData} />,
        risk: <RiskManagement onChange={setRiskData} data={riskData} />,
    }

    return (
        <SidebarProvider>
            <AppSidebar variant="inset" />
            <SidebarInset>
                <SiteHeader />
                <div className="flex flex-col gap-6 px-6 pt-6">
                    <div className="flex items-start gap-3">
                        <Button variant="outline" size="icon" onClick={() => router.back()}>
                            <ArrowLeftIcon className="h-4 w-4" />
                        </Button>
                        <h1 className="text-3xl font-bold tracking-tight">Strategy Builder</h1>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6 justify-center items-start">
                        {stepIdx > 0 && (
                            <Card className="w-full max-w-sm">
                                <CardHeader><CardTitle>Summary</CardTitle></CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    {completedSteps.type && (
                                        <div>
                                            <p><strong>Name:</strong> {completedSteps.type.name}</p>
                                            <p><strong>Description:</strong> {completedSteps.type.description}</p>
                                            <p><strong>Type:</strong> <Badge>{completedSteps.type.strategyName}</Badge></p>
                                        </div>
                                    )}
                                    {completedSteps.parameters && (
                                        <div>
                                            <Separator className="my-2" />
                                            <p className="font-medium">Parameters:</p>
                                            {Object.entries(completedSteps.parameters).map(([k, v]) => (
                                                <p key={k}><strong>{k}:</strong> {v.toString()}</p>
                                            ))}
                                        </div>
                                    )}
                                    {completedSteps.assets && (
                                        <div>
                                            <Separator className="my-2" />
                                            <p className="font-medium">Assets:</p>
                                            {completedSteps.assets.map((a, i) => (
                                                <p key={i}><strong>{a.symbol}:</strong> {a.weight}%</p>
                                            ))}
                                        </div>
                                    )}
                                    {completedSteps.risk && (
                                        <div>
                                            <Separator className="my-2" />
                                            <p className="font-medium">Risk:</p>
                                            {Object.entries(completedSteps.risk).map(([k, v]) => (
                                                <p key={k}><strong>{k}:</strong> {v.toString()}</p>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <div className="w-full max-w-3xl space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div>
                                    <Label>Description</Label>
                                    <Textarea value={description} onChange={e => setDesc(e.target.value)} />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
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

                            <Card>
                                <CardContent className="pt-6">
                                    {cards[steps[stepIdx]]}
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    {stepIdx > 0 ? (
                                        <Button variant="outline" onClick={back}>Back</Button>
                                    ) : <div />}
                                    <Button
                                        onClick={stepIdx === steps.length - 1 ? finish : saveAndNext}
                                        disabled={(stepIdx === 0 && (!type || !nameDescValid)) || (stepIdx === 2 && !allocationValid) || saving}
                                    >
                                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                        {stepIdx === steps.length - 1 ? "Finish" : "Next"}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
