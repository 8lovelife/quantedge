'use client'

import { useQuantTerminalStore } from './store'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export function ExecutionLog() {
  const { logs, logCollapsed } = useQuantTerminalStore()

  return (
    <div
      className={cn(
        'flex-shrink-0 flex flex-col border-l border-border/40 bg-card transition-all duration-300 ease-out overflow-hidden',
        logCollapsed ? 'w-0 border-l-0' : 'w-[280px]'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border/40 flex-shrink-0">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
        <span className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase font-medium">
          执行日志
        </span>
        <span className="font-mono text-[10px] text-muted-foreground/50 tabular-nums ml-auto">
          {logs.length}
        </span>
      </div>

      {/* Log list */}
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