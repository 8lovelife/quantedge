'use client'

import { TerminalNav } from './terminal-nav'
import { MarketQuotes } from './market-quotes'
import { StrategyList } from './strategy-list'
import { StrategyPanel } from './strategy-panel'
import { AIChatArea } from './ai-chat-area'
import { ExecutionLog } from './execution-log'
import { useQuantTerminalStore } from './store'
import { cn } from '@/lib/utils'
import { useRef, useState, useCallback } from 'react'
import { ChevronRight } from 'lucide-react'

export function QuantTerminal() {
  const { panelCollapsed, logCollapsed, toggleLog, unreadLogCount } = useQuantTerminalStore()
  const [panelWidth, setPanelWidth] = useState(55)
  const mainRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const handleMouseDown = useCallback(() => {
    isDragging.current = true
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'ew-resize'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging.current || !mainRef.current) return
    const mainRect = mainRef.current.getBoundingClientRect()
    const newWidth = ((e.clientX - mainRect.left) / mainRect.width) * 100
    setPanelWidth(Math.min(Math.max(newWidth, 20), 75))
  }, [])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }, [])

  const handleResizeStart = useCallback(() => {
    handleMouseDown()
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', () => {
      handleMouseUp()
      document.removeEventListener('mousemove', handleMouseMove)
    }, { once: true })
  }, [handleMouseDown, handleMouseMove, handleMouseUp])

  return (
    <div className="h-screen overflow-hidden flex flex-col bg-muted/50">
      <TerminalNav />

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left sidebar */}
        <div className="w-[240px] border-r border-border/40 bg-card flex flex-col overflow-hidden h-full min-h-0 flex-shrink-0">
          <MarketQuotes />
          <StrategyList />
        </div>

        {/* Center main area */}
        <div ref={mainRef} className="flex flex-1 flex-row overflow-hidden bg-muted/30 h-full min-h-0">
          <div
            className={cn(
              "flex-shrink-0 transition-all duration-300 ease-out",
              panelCollapsed ? "w-0" : ""
            )}
            style={{ width: panelCollapsed ? 0 : `${panelWidth}%` }}
          >
            <StrategyPanel />
          </div>

          {/* Resize handle */}
          {!panelCollapsed && (
            <div
              onMouseDown={handleResizeStart}
              className={cn(
                "w-1 h-full cursor-ew-resize flex-shrink-0 bg-border/40 relative transition-colors hover:bg-violet-500",
                "before:content-[''] before:absolute before:top-1/2 before:left-1/2 before:-translate-x-1/2 before:-translate-y-1/2 before:w-0.5 before:h-8 before:bg-current before:rounded-full before:opacity-40"
              )}
            />
          )}

          <AIChatArea />
        </div>

        {/* Right sidebar */}
        <ExecutionLog />

        {/* Log toggle button — floats above layout on the right edge, always visible */}
        <button
          onClick={toggleLog}
          title={logCollapsed ? '展开执行日志' : '收起执行日志'}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 right-0 z-30',
            'w-5 h-12 rounded-l-lg',
            'flex flex-col items-center justify-center gap-1.5',
            'bg-card border border-r-0 border-border/60',
            'shadow-[-3px_0_10px_rgba(0,0,0,0.07)]',
            'text-muted-foreground hover:text-violet-500 hover:border-violet-500/40',
            'hover:shadow-[-3px_0_14px_rgba(139,92,246,0.15)]',
            'transition-all duration-200 cursor-pointer',
            // shift left when panel is open to sit on its edge
            logCollapsed ? 'translate-x-0' : '-translate-x-[280px]'
          )}
        >
          <ChevronRight
            className={cn(
              'w-2.5 h-2.5 transition-transform duration-300',
              !logCollapsed && 'rotate-180'
            )}
          />
          {logCollapsed && (
            <div className="flex flex-col items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.8)]" />
              {unreadLogCount > 0 && (
                <div className="font-mono text-[8px] font-bold text-emerald-500 leading-none"
                  style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                  +{unreadLogCount > 99 ? '99' : unreadLogCount}
                </div>
              )}
            </div>
          )}
        </button>
      </div>
    </div>
  )
}