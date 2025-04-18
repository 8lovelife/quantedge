// app/lab/[id]/observe/optimize-result/page.tsx

import GridResultPage from "@/components/strategy-template/optimize-result";
import { mockGridResult } from "@/lib/api/algorithms";

export default function Page() {
    return <GridResultPage data={mockGridResult} />
}