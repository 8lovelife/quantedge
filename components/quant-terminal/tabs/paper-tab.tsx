'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuantTerminalStore } from '../store'
import { Button } from '@/components/ui/button'
import { drawPaperChart } from '../chart-utils'

interface PaperTabProps {
  onStartLive: () => void
  viewOnly?: boolean
  viewOnlyReason?: 'paper' | 'live'
  readOnly?: boolean
  onClone?: () => void
}

interface PaperTrade {
  time: string
  dir: '买入' | '卖出'
  price: string
  qty: string
  pnl: string
  trigger: string
  isBuy: boolean
  isUp: boolean
  isPending: boolean
}

export function PaperTab({ onStartLive, viewOnly, viewOnlyReason, readOnly, onClone }: PaperTabProps) {
  const { activeStrategyId, strategyStates, setStrategyState, addLog } = useQuantTerminalStore()
  const state = strategyStates[activeStrategyId]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [trades, setTrades] = useState<PaperTrade[]>([])
  const [elapsed, setElapsed] = useState(0)
  const elapsedRef = useRef(0)

  const isRunning = state?.stages.paper === 'running'
  const isPaused = state?.stages.paper === 'paused'
  const isDone = state?.stages.paper === 'done'

  // Initialize paper data on first run
  useEffect(() => {
    if (isRunning && !state.paperPts.length) {
      const pts: number[] = []
      let v = 0
      for (let i = 0; i < 20; i++) {
        v += (Math.random() - 0.44) * 1.2 + 0.2
        pts.push(v)
      }
      setStrategyState(activeStrategyId, { paperPts: pts, paperSigs: [], paperRef: [] })
    }
  }, [isRunning, activeStrategyId, state, setStrategyState])

  // Real-time interval — identical architecture to live-tab
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      return
    }

    intervalRef.current = setInterval(() => {
      const currentState = useQuantTerminalStore.getState().strategyStates[activeStrategyId]
      if (currentState.stages.paper !== 'running') return

      const pts = [...currentState.paperPts]
      const sigs = [...currentState.paperSigs]
      const last = pts[pts.length - 1] ?? 0
      const nv = last + (Math.random() - 0.46) * 1.4 + 0.15
      pts.push(nv)
      if (pts.length > 120) pts.shift()

      if (pts.length > 5) {
        const delta = pts[pts.length - 1] - pts[pts.length - 4]
        if (delta > 1.8 && (sigs.length === 0 || sigs[sigs.length - 1].type === 'sell')) {
          sigs.push({ i: pts.length - 1, type: 'buy' })
          const price = (83000 + Math.round(nv * 200)).toLocaleString()
          addLog('模拟', `<span class="buy">模拟买入</span> BTC <span class="mono">@ ${price}</span>`)
          setTrades((prev) => [{
            time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
            dir: '买入', price, qty: '0.012', pnl: '持仓中',
            trigger: 'EMA金叉+量', isBuy: true, isUp: true, isPending: true,
          }, ...prev].slice(0, 20))
        }
        if (delta < -1.3 && sigs.length > 0 && sigs[sigs.length - 1].type === 'buy') {
          sigs.push({ i: pts.length - 1, type: 'sell' })
          const pnlPct = `${nv > last ? '+' : ''}${Math.round(Math.abs(delta) * 1.2 * 10) / 10}%`
          const isUp = nv > last
          const price = (83000 + Math.round(nv * 200)).toLocaleString()
          addLog('模拟', `<span class="sell">模拟卖出</span> <span class="${isUp ? 'buy' : 'sell'}">${pnlPct}</span>`)
          setTrades((prev) => {
            const updated = [...prev]
            const openIdx = updated.findIndex((t) => t.isPending && t.isBuy)
            if (openIdx !== -1) updated[openIdx] = { ...updated[openIdx], pnl: pnlPct, isPending: false, isUp }
            return [{
              time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
              dir: '卖出', price, qty: '0.012', pnl: pnlPct,
              trigger: isUp ? '止盈 tp=6%' : '止损 sl=2%', isBuy: false, isUp, isPending: false,
            }, ...updated].slice(0, 20)
          })
        }
      }

      elapsedRef.current += 1
      setElapsed(elapsedRef.current)
      setStrategyState(activeStrategyId, { paperPts: pts, paperSigs: sigs })
      if (canvasRef.current) drawPaperChart(canvasRef.current, pts, sigs, [])
    }, 300)

    return () => { if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null } }
  }, [isRunning, activeStrategyId, setStrategyState, addLog])

  useEffect(() => {
    if (canvasRef.current && state?.paperPts.length) {
      drawPaperChart(canvasRef.current, state.paperPts, state.paperSigs, [])
    }
  }, [state, isPaused, isDone])

  const latestPt = state?.paperPts[state.paperPts.length - 1] ?? 0
  const floatPnl = Math.round(latestPt * 80)
  const floatPnlStr = `${floatPnl >= 0 ? '+' : ''}${floatPnl}¥`

  const fmtElapsed = () => {
    const h = Math.floor(elapsed / 3600), m = Math.floor((elapsed % 3600) / 60), s = elapsed % 60
    if (h > 0) return `${h}h ${m}m`
    if (m > 0) return `${m}m ${s}s`
    return `${s}s`
  }

  const winCount = trades.filter((t) => !t.isBuy && t.isUp && !t.isPending).length
  const lossCount = trades.filter((t) => !t.isBuy && !t.isUp && !t.isPending).length
  const totalClosed = winCount + lossCount
  const winRate = totalClosed > 0 ? Math.round((winCount / totalClosed) * 100) : 0
  const hasOpenPosition = trades.some((t) => t.isPending && t.isBuy)

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Notice banner */}
      <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/25 text-sm">
        <strong className="text-violet-500">&#128203; 模拟账户</strong>
        <span className="text-foreground"> · 虚拟资金 ¥100,000 · 真实行情信号 · 零资金风险</span>
      </div>

      {/* View-only banner — shown when live is running and user navigates here */}
      {viewOnly && viewOnlyReason === 'live' && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/25 flex items-center gap-2">
          <span className="text-red-500 text-[11px]">&#9888;</span>
          <span className="font-mono text-[10px] text-red-500">
            实盘运行中 · 模拟数据仅供查看 · 需修改策略请先终止实盘，再点击「📊 调整参数再跑一次」
          </span>
        </div>
      )}

      {/* Paused banner */}
      {isPaused && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 border-l-[3px] border-l-amber-500">
          <div className="text-sm font-medium text-amber-500 mb-0.5">&#9208; 模拟已暂停</div>
          <div className="text-[11px] text-amber-500/80">信号检测已暂停，<strong>虚拟持仓保持不动</strong>，可随时继续运行。</div>
        </div>
      )}

      {/* Top stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card border border-violet-500/30 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">模拟收益</div>
          <div className={`font-mono text-xl font-semibold ${latestPt >= 0 ? 'text-violet-500' : 'text-red-500'}`}>
            {latestPt >= 0 ? '+' : ''}{(latestPt * 0.4).toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">运行 {fmtElapsed()} · 虚拟资金</div>
        </div>
        <div className={`bg-card border rounded-xl p-3 shadow-sm ${isPaused ? 'border-amber-500/20' : 'border-border/50'}`}>
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">当前持仓</div>
          <div className="font-mono text-xl font-semibold text-foreground">{hasOpenPosition ? 'BTC 0.012' : '空仓'}</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {hasOpenPosition ? `成本 83,940 · 浮盈 ${floatPnlStr}` : '等待信号'}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider font-medium uppercase">
            模拟净值 — {isDone ? '归档快照' : '实时行情（虚拟资金）'}
          </span>
          <span className={`font-mono text-[10px] font-medium ${isDone ? 'text-muted-foreground' : isPaused ? 'text-amber-500' : 'text-violet-500'}`}>
            {isDone ? '&#128193; 已结束' : isPaused ? '&#9208; 暂停中' : '● PAPER'}
          </span>
        </div>
        <canvas ref={canvasRef} className="w-full h-[140px] rounded-lg bg-card" />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">最大回撤</div>
          <div className="font-mono text-xl font-semibold text-red-500">
            -{Math.max(0, Math.round(Math.abs(Math.min(0, latestPt)) * 0.3 + 0.5)).toFixed(1)}%
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">模拟期间</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">已执行</div>
          <div className="font-mono text-xl font-semibold text-foreground">{trades.length}笔</div>
          <div className="text-[10px] text-muted-foreground mt-1">{totalClosed > 0 ? `胜率 ${winRate}%` : '等待成交'}</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">滑点</div>
          <div className="font-mono text-xl font-semibold text-cyan-500">0.07%</div>
          <div className="text-[10px] text-muted-foreground mt-1">正常范围</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">引擎</div>
          <div
            className={`font-mono text-xs font-semibold ${isDone ? 'text-muted-foreground' : isPaused ? 'text-amber-500' : 'text-violet-500'}`}
            dangerouslySetInnerHTML={{ __html: isDone ? '&#128193; 已结束' : isPaused ? '&#9208; 暂停' : '● 运行中' }}
          />
          <div className="text-[10px] text-muted-foreground mt-1">
            {isDone ? '模拟完成' : isPaused ? '持仓保留中' : '4h 信号检测'}
          </div>
        </div>
      </div>

      {/* Trades table */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
          {isDone ? '模拟成交记录' : '模拟订单（实时）'}
        </div>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                {['时间', '方向', '价格', '数量', '盈亏', '触发条件'].map((h) => (
                  <th key={h} className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td className="px-2.5 py-3 font-mono text-[11px] text-muted-foreground" colSpan={6}>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                      等待信号触发...
                    </span>
                  </td>
                </tr>
              ) : (
                trades.map((row, i) => (
                  <tr key={i} className="border-t border-muted/30 hover:bg-muted/30 transition-colors">
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.time}</td>
                    <td className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isBuy ? 'text-emerald-500' : 'text-red-500'}`}>{row.dir}</td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.price}</td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.qty}</td>
                    <td className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isPending ? 'text-muted-foreground' : row.isUp ? 'text-emerald-500' : 'text-red-500'}`}>{row.pnl}</td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-muted-foreground">{row.trigger}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action buttons */}
      {!readOnly && !viewOnly && (
        <div className="flex gap-2.5">
          {isDone ? (
            <>
              {onClone && (
                <Button onClick={onClone} className="h-10 px-4 bg-muted border border-border/60 text-muted-foreground hover:border-violet-500 hover:text-violet-500 font-mono text-[11px] font-medium" variant="outline">
                  📊 调整参数再跑一次
                </Button>
              )}
              <Button onClick={onStartLive} className="flex-1 h-10 bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono text-[11px] font-medium" variant="outline">
                &#9888; 启动实盘 — 使用真实资金，请谨慎
              </Button>
            </>
          ) : isPaused ? (
            <>
              <Button
                onClick={() => { setStrategyState(activeStrategyId, { stages: { ...state.stages, paper: 'running' } }); addLog('模拟', '<span class="hi">已恢复</span>') }}
                className="flex-1 h-10 bg-violet-500/10 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9654; 继续运行
              </Button>
              <Button
                onClick={() => { setStrategyState(activeStrategyId, { stages: { ...state.stages, paper: 'done', live: 'ready' }, paperDone: true }); addLog('模拟', `<span class="hi">已结束</span> · ${trades.length}笔 · ${totalClosed > 0 ? `胜率${winRate}%` : '无成交'}`) }}
                className="flex-1 h-10 bg-muted border border-muted-foreground/30 text-muted-foreground hover:border-violet-500 hover:text-violet-500 font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9632; 结束模拟
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => { setStrategyState(activeStrategyId, { stages: { ...state.stages, paper: 'paused' } }); addLog('模拟', '<span class="warn">已暂停</span>，虚拟持仓保持') }}
                className="flex-1 h-10 bg-muted border border-muted-foreground/30 text-muted-foreground hover:border-amber-500 hover:text-amber-500 font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9208; 暂停模拟
              </Button>
              <Button
                onClick={() => { setStrategyState(activeStrategyId, { stages: { ...state.stages, paper: 'done', live: 'ready' }, paperDone: true }); addLog('模拟', `<span class="hi">已结束</span> · ${trades.length}笔`) }}
                className="flex-1 h-10 bg-violet-500/10 border border-violet-500/50 text-violet-500 hover:bg-violet-500 hover:text-white font-mono text-[11px] font-medium"
                variant="outline"
              >
                &#9632; 结束并进入实盘
              </Button>
            </>
          )}
        </div>
      )}

      {/* Clone button in view-only mode */}
      {(viewOnly || readOnly) && onClone && (
        <Button onClick={onClone} className="h-10 w-full bg-muted border border-border/60 text-muted-foreground hover:border-violet-500 hover:text-violet-500 font-mono text-[11px] font-medium" variant="outline">
          📊 调整参数再跑一次 — 创建新版本重新配置
        </Button>
      )}
    </div>
  )
}