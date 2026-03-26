'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuantTerminalStore } from '../store'
import { Button } from '@/components/ui/button'
import { drawPaperChart, generatePaperData } from '../chart-utils'

interface PaperTabProps {
  onStartLive: () => void
}

export function PaperTab({ onStartLive }: PaperTabProps) {
  const { activeStrategyId, strategyStates, setStrategyState, addLog } = useQuantTerminalStore()
  const state = strategyStates[activeStrategyId]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)
  const [days, setDays] = useState(0)

  const isDone = state?.stages.paper === 'done'
  const isRunning = state?.stages.paper === 'running'

  // Generate data if not exists
  useEffect(() => {
    if (state && !state.paperPts.length && (isDone || isRunning)) {
      const { pts, sigs, ref } = generatePaperData()
      setStrategyState(activeStrategyId, { paperPts: pts, paperSigs: sigs, paperRef: ref })
    }
  }, [activeStrategyId, state, isDone, isRunning, setStrategyState])

  // Animation for running state
  useEffect(() => {
    if (!isRunning) return

    let idx = 0
    const total = 120
    let animFrame: number

    const animate = () => {
      idx = Math.min(idx + 1, total - 1)
      const pct = Math.round((idx / total) * 100)
      const d = Math.round((idx / total) * 14)
      setProgress(pct)
      setDays(d)

      if (canvasRef.current && state?.paperPts.length) {
        const pts = state.paperPts.slice(0, idx + 1)
        const sigs = state.paperSigs.filter((s) => s.i <= idx)
        drawPaperChart(canvasRef.current, pts, sigs, state.paperRef)
      }

      if (idx === 35) {
        addLog('模拟', '<span class="buy">模拟买入</span> BTC @ 83,940')
      }
      if (idx === 65) {
        addLog('模拟', '<span class="sell">模拟卖出</span> <span class="buy">+5.7%</span>')
      }

      if (idx < total - 1) {
        animFrame = requestAnimationFrame(animate)
      } else {
        // Complete paper trading
        setStrategyState(activeStrategyId, {
          stages: { ...state.stages, paper: 'done', live: 'ready' },
          paperDone: true,
        })
        addLog('模拟', '<span class="hi">完成</span> · 14天 · +5.2%')
      }
    }

    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [isRunning, activeStrategyId, state, setStrategyState, addLog])

  // Draw static chart for done state
  useEffect(() => {
    if (isDone && canvasRef.current && state?.paperPts.length) {
      drawPaperChart(canvasRef.current, state.paperPts, state.paperSigs, state.paperRef)
    }
  }, [isDone, state])

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Notice */}
      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/25 text-sm">
        <strong className="text-violet-500">&#128203; 模拟账户</strong>
        <span className="text-foreground"> · 虚拟资金 ¥100,000 · 真实行情 · 零资金风险</span>
      </div>

      {isRunning && (
        <>
          <div className="flex items-center gap-2.5 mb-2.5">
            <span className="font-mono text-[10px] text-muted-foreground min-w-[120px]">模拟交易运行中...</span>
            <div className="flex-1 h-1 bg-muted rounded-sm overflow-hidden">
              <div
                className="h-full bg-violet-500 rounded-sm transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-violet-500 min-w-[50px] text-right font-medium">
              {days}/14天
            </span>
          </div>
          <canvas ref={canvasRef} className="w-full h-[140px] rounded-lg bg-card" />
        </>
      )}

      {isDone && (
        <>
          {/* Stats grid */}
          <div className="grid grid-cols-4 gap-2.5">
            <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
              <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">模拟收益</div>
              <div className="font-mono text-xl font-semibold text-violet-500">+5.2%</div>
              <div className="text-[10px] text-muted-foreground mt-1">14天</div>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
              <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">vs 回测</div>
              <div className="font-mono text-xl font-semibold text-cyan-500">-0.8%</div>
              <div className="text-[10px] text-muted-foreground mt-1">偏差正常</div>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
              <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">胜率</div>
              <div className="font-mono text-xl font-semibold text-foreground">58.3%</div>
              <div className="text-[10px] text-muted-foreground mt-1">12笔</div>
            </div>
            <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
              <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">滑点</div>
              <div className="font-mono text-xl font-semibold text-foreground">0.07%</div>
              <div className="text-[10px] text-muted-foreground mt-1">正常范围</div>
            </div>
          </div>

          {/* Chart */}
          <div>
            <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
              模拟净值 — 近14天真实行情（虚拟资金）
            </div>
            <div className="flex gap-3.5 mb-2 text-[10px] font-mono text-muted-foreground">
              <span><span className="text-violet-500">━</span> 模拟净值</span>
              <span><span className="text-blue-500">╌</span> 回测预测</span>
            </div>
            <canvas ref={canvasRef} className="w-full h-[140px] rounded-lg bg-card" />
          </div>

          {/* Action button */}
          <div className="flex gap-2.5">
            <Button
              onClick={onStartLive}
              className="flex-1 h-10 bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono text-[11px] font-medium"
              variant="outline"
            >
              &#9888; 启动实盘 — 使用真实资金，请谨慎
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
