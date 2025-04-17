"use client"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
    CheckCircle2,
    ArrowLeft,
    Loader2,
    Pencil,
    Trash2,
    ChevronRight,
    ChevronLeft,
    Save,
    Info,
    ArrowLeftIcon
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import StrategyTypeSelector from "./strategy-type-selector"
import StrategyParameters from "./strategy-parameters"
import AssetConfiguration from "./asset-configuration"
import RiskManagement from "./risk-management"
import { SidebarInset, SidebarProvider } from "../ui/sidebar"
import { AppSidebar } from "../layout/app-sidebar"
import { SiteHeader } from "../layout/site-header"
import {
    AssetAllocationData,
    saveStep,
    deleteStrategy,
    fetchStrategyDetails,
} from "@/lib/api/strategies"
import { AlgorithmOption, fetchAlgorithms } from "@/lib/api/algorithms"
import { cn } from "@/lib/utils"

const steps = ["type", "parameters", "assets", "risk", "completed"] as const;
const labels = {
    type: "Strategy Type",
    parameters: "Parameters",
    assets: "Asset Allocation",
    risk: "Risk Management",
    completed: "Completed",
} as const


const CURRENT_USER = "8lovelife"
const CURRENT_DATE = "2025-04-15 01:19:35"
interface StrategyBuilderWizardProps {
    mode?: 'create' | 'edit'
    strategyId?: number
}

export default function StrategyBuilderWizard({ mode = 'create', strategyId }: StrategyBuilderWizardProps) {
    const router = useRouter()
    const headerRef = useRef(null)
    const [stepIdx, setStepIdx] = useState(0)
    const [saving, setSaving] = useState(false)
    const [draftId, setDraftId] = useState<number | null>(null)
    const [completedSteps, setCompletedSteps] = useState<any>({})
    const [headerFixed, setHeaderFixed] = useState(false)
    const [isLoading, setIsLoading] = useState(mode === 'edit')


    // Form data
    const [name, setName] = useState("")
    const [type, setType] = useState("ma-crossover")
    const [description, setDesc] = useState("")
    const [paramData, setParamData] = useState<Record<string, any>>({})
    const [assetData, setAssetData] = useState<AssetAllocationData[]>([])
    const [riskData, setRiskData] = useState<Record<string, any>>({})

    // UI state
    const [strategyTypes, setStrategyTypes] = useState<AlgorithmOption[]>([])
    const [editingStep, setEditingStep] = useState<string | null>(null)
    const [resumeStepIdx, setResumeStepIdx] = useState<number | null>(null)
    const [editingNameDesc, setEditingNameDesc] = useState(false)
    const [tempName, setTempName] = useState("")
    const [tempDesc, setTempDesc] = useState("")
    const [showSummary, setShowSummary] = useState(false)
    const [animateSummary, setAnimateSummary] = useState(false)
    const [isMovingToCenter, setIsMovingToCenter] = useState(false)
    const [configExiting, setConfigExiting] = useState(false)
    const [animateTransition, setAnimateTransition] = useState(false)
    const [isAnimatingRight, setIsAnimatingRight] = useState(false)
    const [latestStepIdx, setLatestStepIdx] = useState(0);


    // Validation
    const nameDescValid = name.trim() && description.trim()
    const tempNameDescValid = tempName.trim() && tempDesc.trim()
    const totalWeight = assetData.reduce((sum, a) => sum + Number(a.weight), 0)
    const allocationValid = totalWeight === 100



    useEffect(() => {
        const loadStrategy = async () => {
            if (mode === 'edit' && strategyId) {
                try {
                    setIsLoading(true)
                    // 获取策略详情
                    const strategy = await fetchStrategyDetails(strategyId)

                    // 基本信息总是设置
                    setName(strategy.name)
                    setType(strategy.type)
                    setDesc(strategy.description)

                    // 处理可能为 null 的配置数据
                    const { configuration } = strategy

                    // 设置参数数据，如果为 null 则使用默认值
                    if (configuration?.parameters) {
                        setParamData(configuration.parameters)
                        // 标记参数步骤为完成
                        setCompletedSteps(prev => ({
                            ...prev,
                            parameters: configuration.parameters
                        }))
                    }

                    // 设置资产数据，如果为 null 则使用空数组
                    if (configuration?.assets) {
                        setAssetData(configuration.assets)
                        // 标记资产步骤为完成
                        setCompletedSteps(prev => ({
                            ...prev,
                            assets: configuration.assets
                        }))
                    } else {
                        setAssetData([])
                    }

                    // 设置风险管理数据，如果为 null 则使用默认值
                    if (configuration?.riskManagement) {
                        setRiskData(configuration.riskManagement)
                        // 标记风险管理步骤为完成
                        setCompletedSteps(prev => ({
                            ...prev,
                            risk: configuration.riskManagement
                        }))
                    }

                    setDraftId(strategyId)

                    // 根据已完成的步骤设置当前步骤
                    // 如果没有参数数据，从参数配置开始
                    if (!configuration?.parameters) {
                        setStepIdx(1) // parameters 步骤索引
                    }
                    // 如果有参数但没有资产配置，从资产配置开始
                    else if (!configuration?.assets) {
                        setStepIdx(2) // assets 步骤索引
                    }
                    // 如果有参数和资产但没有风险配置，从风险配置开始
                    else if (!configuration?.riskManagement) {
                        setStepIdx(3) // risk 步骤索引
                    }

                    // 设置完成的类型步骤
                    setCompletedSteps(prev => ({
                        ...prev,
                        type: {
                            name: strategy.name,
                            description: strategy.description,
                            strategyName: strategy.type
                        }
                    }))

                    // 设置最新步骤索引
                    setLatestStepIdx(getLatestCompletedStepIndex(configuration))

                    // 显示总结面板
                    setShowSummary(true)
                    setTimeout(() => setAnimateSummary(true), 50)

                } catch (error) {
                    toast.error("Failed to load strategy")
                } finally {
                    setIsLoading(false)
                }
            }
        }

        loadStrategy()
    }, [mode, strategyId])

    // 辅助函数：获取最新完成的步骤索引
    const getLatestCompletedStepIndex = (configuration: any) => {
        if (!configuration?.parameters) {
            return 1 // parameters 步骤
        }
        if (!configuration?.assets) {
            return 2 // assets 步骤
        }
        if (!configuration?.riskManagement) {
            return 3 // risk 步骤
        }
        return 4 // 所有步骤都完成
    }

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

    // Add scroll event listener to fix header
    useEffect(() => {
        const handleScroll = () => {
            if (!headerRef.current) return

            // Get the header's position relative to the viewport
            const headerRect = headerRef.current.getBoundingClientRect()

            // Check if the header's top edge is at or above the top of the viewport
            if (headerRect.top <= 0) {
                setHeaderFixed(true)
            } else {
                setHeaderFixed(false)
            }
        }

        window.addEventListener('scroll', handleScroll)
        return () => {
            window.removeEventListener('scroll', handleScroll)
        }
    }, [])

    // Animation effect for summary panel
    useEffect(() => {
        if (draftId && completedSteps.type) {
            setShowSummary(true)
            // Trigger animation after a short delay to ensure DOM is ready
            setTimeout(() => {
                setAnimateSummary(true)
            }, 50)
        }
    }, [draftId, completedSteps.type])


    // useEffect(() => {
    //     if (stepIdx === steps.length - 1) {
    //         setShowSummary(false)
    //         setTimeout(() => setAnimateSummary(false), 50)
    //         // const stepperEl = document.querySelector(".stepper-container")
    //         // if (stepperEl) {
    //         //     const top = stepperEl.getBoundingClientRect().top + window.scrollY
    //         //     window.scrollTo({ top: top - 24, behavior: "smooth" })
    //         // }
    //     }
    // }, [stepIdx])


    const canSubmit = () => {
        const step = editingStep ?? steps[stepIdx]
        if (saving) return false
        if (step === "type") return !!type && nameDescValid
        if (step === "assets") return allocationValid
        return true
    }

    const saveStepAndState = async (stepName: string) => {
        let payload: any = {}

        if (stepName === "type") {
            payload = { name, type, description }
            const label = strategyTypes.find(s => s.value === type)?.label || type
            setCompletedSteps((prev: any) => ({ ...prev, type: { name, description, strategyName: label } }))
        }
        if (stepName === "parameters") setCompletedSteps((prev: any) => ({ ...prev, parameters: paramData }))
        if (stepName === "assets") setCompletedSteps((prev: any) => ({ ...prev, assets: assetData }))
        if (stepName === "risk") setCompletedSteps((prev: any) => ({ ...prev, risk: riskData }))

        if (stepName === "parameters") payload = paramData
        if (stepName === "assets") payload = assetData
        if (stepName === "risk") payload = riskData

        const id = await saveStep(draftId, stepName, payload)
        if (!draftId && id) setDraftId(id)
    }

    const saveAndNext = async () => {
        setSaving(true);
        await saveStepAndState(steps[stepIdx]);
        setSaving(false);
        const nextStepIdx = Math.min(stepIdx + 1, steps.length - 1);
        setStepIdx(nextStepIdx);
        setLatestStepIdx(nextStepIdx); // 更新最新步骤
    };

    const getLatestIncompleteStep = () => {
        // 如果是从 type 步骤编辑回来，且 parameters 还未完成，返回 parameters 索引
        if (editingStep === "type" && !completedSteps.parameters) {
            return steps.findIndex(s => s === "parameters");
        }

        // 返回 resumeStepIdx（如果存在），否则保持在当前步骤
        return resumeStepIdx ?? stepIdx;
    };

    const saveAndPrevious = async () => {
        if (stepIdx <= 0) return;

        const previousStep = steps[stepIdx - 1];

        // 如果前一个步骤已完成，则进入编辑模式
        if (completedSteps[previousStep]) {
            setResumeStepIdx(stepIdx); // 保存当前步骤
            setEditingStep(previousStep); // 设置编辑状态
            setStepIdx(stepIdx - 1); // 移动到前一步
        } else {
            // 如果前一步未完成，保持原有逻辑
            setSaving(true);
            await saveStepAndState(steps[stepIdx]);
            setSaving(false);
            const prevStepIdx = Math.max(stepIdx - 1, 0);
            setStepIdx(prevStepIdx);
            setLatestStepIdx(prevStepIdx); // 更新最新步骤
        }
    };

    const handleCancel = () => {
        // 取消编辑时返回到最新步骤
        setStepIdx(latestStepIdx);

        // 清除编辑状态
        setEditingStep(null);
        setResumeStepIdx(null);
    };
    // 修改 saveAndUpdate 函数
    const saveAndUpdate = async () => {
        if (!editingStep) return;
        setSaving(true);

        try {
            await saveStepAndState(editingStep);

            // 编辑完成后返回到最新步骤
            setStepIdx(latestStepIdx);

            // 清除编辑状态
            setEditingStep(null);
            setResumeStepIdx(null);

            toast.success("Updated successfully");
        } catch (error) {
            toast.error("Failed to update");
        } finally {
            setSaving(false);
        }
    };

    const startEditingNameDesc = () => {
        setTempName(name)
        setTempDesc(description)
        setEditingNameDesc(true)
    }

    const saveNameDescChanges = async () => {
        if (!tempNameDescValid) return
        setSaving(true)
        setName(tempName)
        setDesc(tempDesc)
        const label = strategyTypes.find(s => s.value === type)?.label || type
        setCompletedSteps((prev: any) => ({
            ...prev,
            type: { ...prev.type, name: tempName, description: tempDesc, strategyName: label }
        }))
        await saveStep(draftId, "type", { name: tempName, type, description: tempDesc })
        setSaving(false)
        setEditingNameDesc(false)
    }

    const cancelNameDescEdit = () => setEditingNameDesc(false)


    const animateWithDelay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const finish = async () => {
        setSaving(true);

        try {
            // 1. 保存 Risk 数据
            await saveStep(draftId, "risk", riskData);

            // 2. 更新 Risk 完成状态和进度条
            setCompletedSteps(prev => ({
                ...prev,
                risk: riskData
            }));

            // 3. 等待进度条动画
            await new Promise(resolve => setTimeout(resolve, 500));

            // 4. 先设置完成状态，触发 completed stepper 点亮动画
            setCompletedSteps(prev => ({
                ...prev,
                completed: true
            }));

            // 5. 等待完成动画
            await new Promise(resolve => setTimeout(resolve, 500));

            // 6. 移动到 Completed 步骤并更新最新步骤
            setStepIdx(steps.length - 1);
            setLatestStepIdx(steps.length - 1);

            // 7. 等待一段时间后开始布局转换动画
            await new Promise(resolve => setTimeout(resolve, 800));

            // 8. 开始移动和淡出动画
            setIsAnimatingRight(true);
            await new Promise(resolve => setTimeout(resolve, 100));
            setConfigExiting(true);

            toast.success("Strategy saved successfully");
        } catch (error) {
            toast.error("Failed to save strategy");
        } finally {
            setSaving(false);
        }
    };



    const handleEdit = (step: string) => {
        if (step === "type") return;

        // 保存当前步骤索引用于稍后恢复
        setResumeStepIdx(stepIdx);

        // 设置编辑状态
        setEditingStep(step);

        // 更新 stepIdx 到对应步骤
        const targetStepIdx = steps.findIndex(s => s === step);
        if (targetStepIdx !== -1) {
            setStepIdx(targetStepIdx);
        }
    };

    const handleDelete = async () => {
        if (draftId) {
            await deleteStrategy(draftId)
            toast.success("Draft strategy deleted")
            router.push("/strategies")
        }
    }

    // const goToStep = (index: number) => {
    //     if (editingStep) return; // 更新过程中禁止切换步骤
    //     if (index < stepIdx || completedSteps[steps[index]]) {
    //         setStepIdx(index);
    //     }
    // };


    const goToStep = (index: number) => {
        const targetStep = steps[index];

        // 只允许跳转到已完成的步骤或最新步骤
        if (index > latestStepIdx) return;

        // 如果已经完成了该步骤，并且不是最后一步（completed）
        if (completedSteps[targetStep] && targetStep !== "completed") {
            // 直接触发编辑模式
            setResumeStepIdx(stepIdx); // 保存当前步骤
            setEditingStep(targetStep); // 设置编辑状态
            setStepIdx(index); // 更新步骤索引
        } else if (index <= latestStepIdx) {
            // 允许跳转到最新步骤及之前的步骤
            setStepIdx(index);
            // 清除编辑状态
            setEditingStep(null);
            setResumeStepIdx(null);
        }
    };

    const cards = {
        type: <StrategyTypeSelector strategies={strategyTypes} value={type} onChange={setType} isEditMode={!!completedSteps.parameters}

        />,
        parameters: <StrategyParameters strategyType={type} onChange={setParamData} data={paramData} />,
        assets: <AssetConfiguration onChange={setAssetData} data={assetData} />,
        risk: <RiskManagement strategyType={type} onChange={setRiskData} data={riskData} />,
        completed: (
            <div className={cn(
                "w-full max-w-7xl mx-auto p-6",
                completedSteps.completed && "animate-in fade-in duration-1000"
            )}>
                <Card className={cn(
                    "shadow-lg",
                    completedSteps.completed && "animate-in zoom-in-50 duration-1000"
                )}>
                    <CardHeader className="text-center pb-2">
                        <CheckCircle2 className={cn(
                            "h-16 w-16 text-green-500 mx-auto mb-4",
                            completedSteps.completed && "animate-in spin-in-90 duration-1000"
                        )} />
                        <CardTitle className="text-3xl font-bold mb-2">Strategy Completed!</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                            Your strategy has been saved successfully. Here's a summary of your strategy:
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* Basic Info 和 Parameters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Basic Info */}
                            {completedSteps.type && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl text-primary">Basic Info</h3>
                                    <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                        <div>
                                            <span className="text-sm text-muted-foreground">Name:</span>
                                            <p className="font-medium text-lg">{completedSteps.type.name}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Type:</span>
                                            <div>
                                                <Badge variant="outline">{completedSteps.type.strategyName}</Badge>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm text-muted-foreground">Description:</span>
                                            <p className="text-sm">{completedSteps.type.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Parameters */}
                            {completedSteps.parameters && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl text-primary">Parameters</h3>
                                    <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                        {Object.entries(completedSteps.parameters).map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">{k}:</span>
                                                <p className="font-medium text-sm">{v.toString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Asset Allocation 和 Risk Management */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Asset Allocation */}
                            {completedSteps.assets && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl text-primary">Asset Allocation</h3>
                                    <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                        {completedSteps.assets.map((a, i) => (
                                            <div key={i} className="flex justify-between">
                                                <span className="font-medium text-sm">{a.symbol}</span>
                                                <span className="text-sm">{a.weight}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Risk Management */}
                            {completedSteps.risk && (
                                <div className="space-y-4">
                                    <h3 className="font-semibold text-xl text-primary">Risk Management</h3>
                                    <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                        {Object.entries(completedSteps.risk).map(([k, v]) => (
                                            <div key={k} className="flex justify-between">
                                                <span className="text-sm text-muted-foreground">{k}:</span>
                                                <p className="font-medium text-sm">{v.toString()}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between pt-6">
                        {draftId && (
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handleDelete}
                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                                <Trash2 className="h-5 w-5 mr-2" />
                                Delete Strategy
                            </Button>
                        )}

                        <Button
                            size="lg"
                            className="ml-auto"
                            onClick={() => router.push("/strategies")}
                        >
                            Back to Strategies
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        )
    }

    const currentStep = editingStep ?? steps[stepIdx]

    // Header content component - reused for both fixed and normal positions
    const HeaderContent = () => (
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => router.back()}
                    className="mr-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold flex items-center">
                        <span>{mode === 'edit' ? 'Edit Strategy' : 'Strategy Setup'}</span>
                        {currentStep === "completed" ? (
                            <Badge variant="secondary" className="ml-2">
                                Completed
                            </Badge>
                        ) : (
                            <Badge variant="secondary" className="ml-2">
                                {labels[currentStep]} {mode === 'edit' ? 'Editing' : 'Configuration'}
                            </Badge>
                        )}
                    </h1>
                    <p className="text-muted-foreground">
                        {mode === 'edit'
                            ? `Last updated: ${CURRENT_DATE} by ${CURRENT_USER}`
                            : 'Create and configure your trading strategy'
                        }
                    </p>
                </div>
            </div>
        </div>
    )



    // 
    if (isLoading) {
        return (
            <div className="flex min-h-screen flex-col">
                <main className="flex-1 space-y-4 p-4 md:p-6">
                    <HeaderContent />
                    <div className="flex items-center justify-center h-[400px]">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                </main>
            </div>
        )
    }

    return (

        <div className="flex min-h-screen flex-col bg-background">
            <main className="flex-1 space-y-4 p-4 md:p-6">
                <HeaderContent />
                <div className="max-w-6xl mx-auto w-full">
                    <div className="grid grid-cols-12 gap-6">
                        {/* Summary panel - initially hidden, slides in from left */}
                        <div
                            className={cn(
                                "col-span-12 transition-all duration-1000 ease-in-out transform",
                                !showSummary && "hidden",
                                currentStep === "completed"
                                    ? "lg:col-span-8 lg:col-start-3 animate-slide-in-center"
                                    : "lg:col-span-4 xl:col-span-3",
                                !animateSummary && showSummary && "opacity-0 -translate-x-full",
                                animateSummary && "opacity-100 translate-x-0",
                                isAnimatingRight && currentStep !== "completed" && "translate-x-[200%] opacity-0"
                            )}
                        >
                            <Card className={cn(
                                "transition-all duration-1000",
                                currentStep === "completed"
                                    ? "max-w-6xl mx-auto shadow-lg animate-scale-up"
                                    : "sticky top-24"
                            )}>
                                <CardHeader className={cn(
                                    currentStep === "completed" ? "text-center" : ""
                                )}>
                                    <div className="flex items-center justify-between w-full">

                                        <div className="flex items-center flex-1">
                                            <CardTitle className="text-lg">Strategy Summary</CardTitle>
                                        </div>
                                        {draftId && currentStep !== "completed" && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={handleDelete}
                                                            className="h-8 w-8"
                                                        >
                                                            <Trash2 className="h-4 w-4 text-destructive" />
                                                        </Button>
                                                    </TooltipTrigger>
                                                    <TooltipContent>Delete draft strategy</TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className={cn(
                                    "space-y-6",
                                    currentStep === "completed" ? "p-6" : "space-y-4 text-sm"
                                )}>
                                    {currentStep === "completed" ? (
                                        // 完成状态的内容布局
                                        <div className="space-y-8">
                                            {/* 头部 */}
                                            <div className="text-center">
                                                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                                                <h2 className="text-3xl font-bold mb-2">Strategy Completed!</h2>
                                                <p className="text-lg text-muted-foreground">
                                                    Your strategy has been saved successfully. Here's a summary:
                                                </p>
                                            </div>

                                            {/* Basic Info 和 Parameters 并排 */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Basic Info */}
                                                {completedSteps.type && (
                                                    <div className="space-y-4">
                                                        <h3 className="font-semibold text-xl text-primary">Basic Info</h3>
                                                        <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                                            <div>
                                                                <span className="text-sm text-muted-foreground">Name:</span>
                                                                <p className="font-medium text-lg">{completedSteps.type.name}</p>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-muted-foreground">Type:</span>
                                                                <div>
                                                                    <Badge variant="outline">
                                                                        {completedSteps.type.strategyName}
                                                                    </Badge>
                                                                </div>
                                                            </div>
                                                            <div>
                                                                <span className="text-sm text-muted-foreground">Description:</span>
                                                                <p className="text-sm">{completedSteps.type.description}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Parameters */}
                                                {completedSteps.parameters && (
                                                    <div className="space-y-4">
                                                        <h3 className="font-semibold text-xl text-primary">Parameters</h3>
                                                        <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                                            {Object.entries(completedSteps.parameters).map(([k, v]) => (
                                                                <div key={k} className="flex justify-between">
                                                                    <span className="text-sm text-muted-foreground">{k}:</span>
                                                                    <p className="font-medium text-sm">{v.toString()}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Asset Allocation 和 Risk Management */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Asset Allocation */}
                                                {completedSteps.assets && (
                                                    <div className="space-y-4">
                                                        <h3 className="font-semibold text-xl text-primary">Asset Allocation</h3>
                                                        <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                                            {completedSteps.assets.map((a, i) => (
                                                                <div key={i} className="flex justify-between">
                                                                    <span className="font-medium text-sm">{a.symbol}</span>
                                                                    <span className="text-sm">{a.weight}%</span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Risk Management */}
                                                {completedSteps.risk && (
                                                    <div className="space-y-4">
                                                        <h3 className="font-semibold text-xl text-primary">Risk Management</h3>
                                                        <div className="rounded-md bg-muted/50 p-4 space-y-2">
                                                            {Object.entries(completedSteps.risk).map(([k, v]) => (
                                                                <div key={k} className="flex justify-between">
                                                                    <span className="text-sm text-muted-foreground">{k}:</span>
                                                                    <p className="font-medium text-sm">{v.toString()}</p>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Back button */}
                                            <div className="flex justify-center pt-6">
                                                <Button
                                                    size="lg"
                                                    className="ml-auto" // 使用 ml-auto 将按钮推到右侧
                                                    onClick={() => router.push("/strategies")}
                                                >
                                                    Back to Strategies
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        // 正常状态的 Summary 面板内容
                                        <div className="space-y-4">
                                            {draftId && (
                                                <>
                                                    {completedSteps.type && (
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <h3 className="font-semibold text-primary">Basic Info</h3>
                                                                {/* {!editingNameDesc && (
                                                                            <Button variant="ghost" size="sm" onClick={startEditingNameDesc}>
                                                                                <Pencil className="h-3 w-3 mr-1" /> Edit
                                                                            </Button>
                                                                        )} */}
                                                            </div>

                                                            {editingNameDesc ? (
                                                                <div className="space-y-2 mt-2">
                                                                    <Label className="text-xs">Name</Label>
                                                                    <Input
                                                                        value={tempName}
                                                                        onChange={(e) => setTempName(e.target.value)}
                                                                        className="h-8 text-sm"
                                                                    />

                                                                    <Label className="text-xs">Description</Label>
                                                                    <Textarea
                                                                        value={tempDesc}
                                                                        onChange={(e) => setTempDesc(e.target.value)}
                                                                        rows={2}
                                                                        className="text-sm min-h-[60px]"
                                                                    />

                                                                    <div className="flex justify-end gap-2 mt-2">
                                                                        <Button variant="outline" size="sm" onClick={handleCancel}>
                                                                            Cancel
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={saveNameDescChanges}
                                                                            disabled={!tempNameDescValid || saving}
                                                                        >
                                                                            {saving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                                                                            Save
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="rounded-md bg-muted/50 p-3 space-y-1">
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">Name:</span>
                                                                        <p className="font-medium">{completedSteps.type.name}</p>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">Type:</span>
                                                                        <div><Badge variant="outline">{completedSteps.type.strategyName}</Badge></div>
                                                                    </div>
                                                                    <div>
                                                                        <span className="text-xs text-muted-foreground">Description:</span>
                                                                        <p className="text-xs">{completedSteps.type.description}</p>
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    {completedSteps.parameters && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <h3 className="font-semibold text-primary">Parameters</h3>
                                                                    {/* <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleEdit("parameters")}
                                                                            >
                                                                                <Pencil className="h-3 w-3 mr-1" /> Edit
                                                                            </Button> */}
                                                                </div>
                                                                <div className="rounded-md bg-muted/50 p-3 space-y-1">
                                                                    {Object.entries(completedSteps.parameters).map(([k, v]) => (
                                                                        <div key={k}>
                                                                            <span className="text-xs text-muted-foreground">{k}:</span>
                                                                            <p className="font-medium">{v.toString()}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {completedSteps.assets && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <h3 className="font-semibold text-primary">Asset Allocation</h3>
                                                                    {/* <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleEdit("assets")}
                                                                            >
                                                                                <Pencil className="h-3 w-3 mr-1" /> Edit
                                                                            </Button> */}
                                                                </div>
                                                                <div className="rounded-md bg-muted/50 p-3 space-y-1">
                                                                    {completedSteps.assets.map((a, i) => (
                                                                        <div key={i} className="flex justify-between">
                                                                            <span className="font-medium">{a.symbol}</span>
                                                                            <span>{a.weight}%</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}

                                                    {completedSteps.risk && (
                                                        <>
                                                            <Separator />
                                                            <div className="space-y-2">
                                                                <div className="flex justify-between items-center">
                                                                    <h3 className="font-semibold text-primary">Risk Management</h3>
                                                                    {/* <Button
                                                                                variant="ghost"
                                                                                size="sm"
                                                                                onClick={() => handleEdit("risk")}
                                                                            >
                                                                                <Pencil className="h-3 w-3 mr-1" /> Edit
                                                                            </Button> */}
                                                                </div>
                                                                <div className="rounded-md bg-muted/50 p-3 space-y-1">
                                                                    {Object.entries(completedSteps.risk).map(([k, v]) => (
                                                                        <div key={k}>
                                                                            <span className="text-xs text-muted-foreground">{k}:</span>
                                                                            <p className="font-medium">{v.toString()}</p>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>



                        {/* Right side with progress and content */}
                        {/* {currentStep !== "completed" && ( */}

                        <div
                            className={cn(
                                "col-span-12 transition-all duration-1000 ease-in-out transform",
                                configExiting
                                    ? "translate-x-[200%] opacity-0"
                                    : "translate-x-0 opacity-100",
                                // 修改这里，使初始状态和显示 Summary 后的宽度一致
                                "lg:col-span-8 xl:col-span-9", // 移除条件判断，统一宽度
                                currentStep === "completed" && "hidden"
                            )}
                        >
                            {/* Progress indicator */}
                            <div className="stepper-container bg-card rounded-lg p-4 shadow-sm mb-6">
                                <div className="flex justify-between items-center">
                                    {steps.map((step, i) => {
                                        const isLastStep = i === steps.length - 1;
                                        const isCompleted =
                                            i < stepIdx ||
                                            !!completedSteps[step] ||
                                            (isLastStep && completedSteps.completed) ||
                                            (completedSteps.completed && i === steps.length - 1);


                                        const isActive = i === stepIdx || step === editingStep;
                                        const isUpdating = editingStep === step;
                                        const isLatest = i === latestStepIdx;

                                        const isCompletedStep = step === "completed";
                                        const showCompletedAnimation = isCompletedStep && completedSteps.completed;

                                        return (
                                            <div
                                                key={step}
                                                className={cn(
                                                    "flex flex-col items-center",
                                                    !isCompletedStep && "cursor-pointer",
                                                    isCompletedStep && completedSteps.completed && 'transition-transform duration-500'
                                                )}
                                                onClick={() => !isCompletedStep && goToStep(i)}
                                            >
                                                <div
                                                    className={cn(
                                                        "flex items-center justify-center w-10 h-10 rounded-full mb-2",
                                                        "transition-all duration-500 ease-out",
                                                        isUpdating && "ring-2 ring-blue-500 ring-offset-2",
                                                        isCompletedStep && completedSteps.completed && "animate-pulse-once",
                                                        isCompleted
                                                            ? "bg-green-500 text-white transform scale-105"
                                                            : isActive
                                                                ? "bg-blue-500 text-white"
                                                                : isLatest
                                                                    ? "bg-blue-500/50 text-white"
                                                                    : "bg-muted text-muted-foreground"
                                                    )}
                                                >
                                                    {isCompleted && !isUpdating ? (
                                                        <CheckCircle2 className={cn(
                                                            "h-5 w-5",
                                                            isCompletedStep && completedSteps.completed && "animate-bounce-once"
                                                        )} />
                                                    ) : isUpdating ? (
                                                        <Loader2 className="h-5 w-5 animate-spin" />
                                                    ) : (
                                                        <span>{i + 1}</span>
                                                    )}
                                                </div>
                                                <span className={cn(
                                                    "text-xs font-medium",
                                                    isActive ? "text-primary" : "text-muted-foreground",
                                                    isCompletedStep && completedSteps.completed && "animate-fade-in"
                                                )}>
                                                    {labels[step]}
                                                </span>
                                                {isUpdating && (
                                                    <span className="text-xs text-blue-500 animate-pulse mt-1">
                                                        Updating...
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Progress track */}
                                <div className="mt-4 relative">
                                    <div className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2 bg-muted" />
                                    <div
                                        className={cn(
                                            "absolute top-1/2 left-0 h-1 -translate-y-1/2",
                                            editingStep ? "bg-blue-400" : "bg-blue-500",
                                            "transition-all duration-500 ease-out"
                                        )}
                                        style={{
                                            width: completedSteps.completed
                                                ? "100%" // 如果完成了，进度条填满
                                                : `${(stepIdx / (steps.length - 1)) * 100}%`
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Main content */}
                            <Card className="shadow-md">
                                <CardHeader className={currentStep === "type" ? "pb-0" : ""}>
                                    <CardTitle className="text-xl">{labels[currentStep]}</CardTitle>
                                    {currentStep === "type" && (
                                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <Label htmlFor="strategy-name" className="text-sm font-medium mb-1.5 block">Strategy Name</Label>
                                                <Input
                                                    id="strategy-name"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="Enter strategy name"
                                                />
                                            </div>
                                            <div>
                                                <Label htmlFor="strategy-desc" className="text-sm font-medium mb-1.5 block">Description</Label>
                                                <Textarea
                                                    id="strategy-desc"
                                                    value={description}
                                                    onChange={(e) => setDesc(e.target.value)}
                                                    placeholder="Brief description of your strategy"
                                                    className="h-full min-h-[100px]"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </CardHeader>

                                <CardContent className={cn(
                                    "pb-6",
                                    currentStep === "type" ? "pt-6" : ""
                                )}>
                                    {cards[currentStep]}
                                </CardContent>

                                <CardFooter className="flex justify-between pt-6 pb-4">
                                    <div>
                                        {stepIdx > 0 && !editingStep && (
                                            <Button
                                                variant="outline"
                                                onClick={saveAndPrevious}
                                                disabled={saving || !!editingStep} // 添加 editingStep 检查
                                            >
                                                <ChevronLeft className="h-4 w-4 mr-1" /> Previous
                                            </Button>
                                        )}

                                        {editingStep && (
                                            <Button
                                                variant="outline"
                                                onClick={handleCancel}
                                            >
                                                Cancel
                                            </Button>
                                        )}
                                    </div>

                                    <Button
                                        onClick={
                                            editingStep
                                                ? saveAndUpdate
                                                : stepIdx === steps.length - 2  // 改为检查是否是倒数第二步
                                                    ? finish
                                                    : saveAndNext
                                        }
                                        disabled={!canSubmit()}
                                        className="min-w-[100px]"
                                    >
                                        {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                                        {editingStep ? (
                                            <>Update <Save className="h-4 w-4 ml-1" /></>
                                        ) : stepIdx === steps.length - 2 ? (  // 改为检查是否是倒数第二步
                                            <>Finish <CheckCircle2 className="h-4 w-4 ml-1" /></>
                                        ) : stepIdx === steps.length - 1 ? (
                                            <>Done</>
                                        ) : (
                                            <>Next <ChevronRight className="h-4 w-4 ml-1" /></>
                                        )}
                                    </Button>
                                </CardFooter>
                            </Card>
                        </div>
                        {/* )} */}

                    </div>

                </div>
            </main>
        </div>
    )
}