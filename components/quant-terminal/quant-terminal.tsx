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

export function QuantTerminal() {
  const { panelCollapsed } = useQuantTerminalStore()
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

  // Add/remove global listeners
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
      {/* Background gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: `
            radial-gradient(ellipse 60% 40% at 20% 10%, rgba(124, 58, 237, 0.03) 0%, transparent 60%),
            radial-gradient(ellipse 50% 35% at 80% 80%, rgba(59, 130, 246, 0.03) 0%, transparent 55%),
            radial-gradient(ellipse 40% 30% at 60% 30%, rgba(139, 92, 246, 0.02) 0%, transparent 50%)
          `,
        }}
      />

      <TerminalNav />

      <div className="flex-1 grid grid-cols-[240px_1fr_280px] overflow-hidden relative">
        {/* Left sidebar */}
        <div className="border-r border-border/40 bg-card flex flex-col overflow-hidden h-full min-h-0">
          <MarketQuotes />
          <StrategyList />
        </div>

        {/* Center main area */}
        <div ref={mainRef} className="flex flex-row overflow-hidden bg-muted/30 h-full min-h-0">
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
      </div>
    </div>
  )
}
