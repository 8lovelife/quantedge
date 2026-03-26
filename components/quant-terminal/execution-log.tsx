'use client'

import { useQuantTerminalStore } from './store'
import { ScrollArea } from '@/components/ui/scroll-area'

export function ExecutionLog() {
  const { logs } = useQuantTerminalStore()

  return (
    <div className="flex flex-col h-full border-l border-border/40 bg-card">
      <div className="p-3 border-b border-border/40">
        <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
          执行日志
        </div>
      </div>
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-2">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-2 py-1.5 border-b border-muted/50 last:border-b-0">
              <span className="font-mono text-[10px] text-muted-foreground flex-shrink-0 pt-0.5 min-w-[36px]">
                {log.time}
              </span>
              <span
                className="text-xs text-muted-foreground leading-relaxed [&_.hi]:text-violet-500 [&_.hi]:font-medium [&_.buy]:text-emerald-500 [&_.buy]:font-medium [&_.sell]:text-red-500 [&_.sell]:font-medium [&_.warn]:text-amber-500 [&_.warn]:font-medium [&_.mono]:font-mono [&_.mono]:text-[10px]"
                dangerouslySetInnerHTML={{ __html: log.message }}
              />
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}
