import { AlgorithmOption, StrategyTemplate } from "@/lib/api/algorithms";
import { NextResponse } from "next/server";

const BACKENT_SERVER_API = process.env.BACKENT_SERVER_API

export async function GET(request: Request, { params }: { params: { id: number } }) {
    try {
        const id = (await params).id
        const response = await fetch(`${BACKENT_SERVER_API}/api/lab/${id}`)
        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        const data = await response.json();
        return NextResponse.json(data)
    } catch (error) {
        console.error("Error get strategy template:", error)
        return NextResponse.json({ success: false, error: "get strategy template" }, { status: 500 })
    }
}

// export function convertTemplateToAlgorithmOption(template: StrategyTemplate): AlgorithmOption {
//     return {
//         id: template.id,
//         value: template.type,
//         label: template.name,
//         desc: template.description,
//         info: template.parameters?.options ? JSON.stringify(template.parameters.options) : template.description,
//         defaultParameters: template.parameters?.default,
//         defaultRisk: template.risk,
//         defaultExecution: template.execution,
//         latest_lab_backtest_version: template.latest_lab_backtest_version,
//     };
// }