'use client'

import { useEffect, useRef } from 'react'
import { useQuantTerminalStore } from '../store'
import { Button } from '@/components/ui/button'
import { drawLiveChart } from '../chart-utils'

interface LiveTabProps {
  onPause: () => void
  onResume: () => void
}

export function LiveTab({ onPause, onResume }: LiveTabProps) {
  const { activeStrategyId, strategyStates, setStrategyState, addLog, setBtcPrice } = useQuantTerminalStore()
  const state = strategyStates[activeStrategyId]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const isRunning = state?.stages.live === 'running'
  const isPaused = state?.stages.live === 'paused'

  // Initialize live data
  useEffect(() => {
    if (isRunning && !state.livePts.length) {
      const pts: number[] = []
      let v = 0
      for (let i = 0; i < 20; i++) {
        v += (Math.random() - 0.44) * 1.2 + 0.2
        pts.push(v)
      }
      setStrategyState(activeStrategyId, { livePts: pts, liveSigs: [] })
    }
  }, [isRunning, activeStrategyId, state, setStrategyState])

  // Live animation
  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      const currentState = useQuantTerminalStore.getState().strategyStates[activeStrategyId]
      if (currentState.stages.live !== 'running') return

      const pts = [...currentState.livePts]
      const sigs = [...currentState.liveSigs]
      const last = pts[pts.length - 1]
      const nv = last + (Math.random() - 0.46) * 1.4 + 0.15
      pts.push(nv)
      if (pts.length > 120) pts.shift()

      // Check for signals
      if (pts.length > 5) {
        const delta = pts[pts.length - 1] - pts[pts.length - 4]
        if (delta > 1.8 && (sigs.length === 0 || sigs[sigs.length - 1].type === 'sell')) {
          sigs.push({ i: pts.length - 1, type: 'buy' })
          addLog('实盘', `<span class="buy">买入</span> BTC <span class="mono">@ ${(83000 + Math.round(nv * 200)).toLocaleString()}</span>`)
        }
        if (delta < -1.3 && sigs.length > 0 && sigs[sigs.length - 1].type === 'buy') {
          sigs.push({ i: pts.length - 1, type: 'sell' })
          addLog('实盘', `<span class="sell">卖出</span> <span class="${nv > last ? 'buy' : 'sell'}">${nv > last ? '+' : ''}${Math.round(Math.abs(delta) * 1.2)}%</span>`)
        }
      }

      setBtcPrice(84231 + Math.round(nv * 80))
      setStrategyState(activeStrategyId, { livePts: pts, liveSigs: sigs })

      if (canvasRef.current) {
        drawLiveChart(canvasRef.current, pts, sigs)
      }
    }, 300)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isRunning, activeStrategyId, setStrategyState, addLog, setBtcPrice])

  // Draw chart on mount and when paused
  useEffect(() => {
    if (canvasRef.current && state?.livePts.length) {
      drawLiveChart(canvasRef.current, state.livePts, state.liveSigs)
    }
  }, [state, isPaused])

  const latestPt = state?.livePts[state.livePts.length - 1] || 0
  const floatPnl = Math.round(latestPt * 80)

  return (
    <div className="flex flex-col gap-4 flex-1">
      {isPaused && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border border-l-[3px] border-l-muted-foreground text-sm text-muted-foreground">
          &#9208; 策略已暂停，持仓保持不动，可随时重启
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-card border border-emerald-500/30 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">本月实盘收益</div>
          <div className="font-mono text-xl font-semibold text-emerald-500">+12.4%</div>
          <div className="text-[10px] text-muted-foreground mt-1">¥ 5,952 实际盈利</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">当前持仓</div>
          <div className="font-mono text-xl font-semibold text-foreground">BTC 0.012</div>
          <div className="text-[10px] text-muted-foreground mt-1">
            {isPaused ? '策略已暂停' : `成本 83,940 · 浮盈 ${floatPnl >= 0 ? '+' : ''}${floatPnl}¥`}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="font-mono text-[10px] text-muted-foreground tracking-wider font-medium uppercase">
            实盘净值 — 实时账户
          </span>
          <span className={`font-mono text-[10px] font-medium ${isPaused ? 'text-muted-foreground' : 'text-emerald-500'}`}>
            {isPaused ? '&#9208; 暂停' : '● LIVE'}
          </span>
        </div>
        <canvas ref={canvasRef} className="w-full h-[140px] rounded-lg bg-card" />
      </div>

      {/* More stats */}
      <div className="grid grid-cols-4 gap-2.5">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">本月回撤</div>
          <div className="font-mono text-xl font-semibold text-red-500">-3.1%</div>
          <div className="text-[10px] text-muted-foreground mt-1">低于止损</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">已执行</div>
          <div className="font-mono text-xl font-semibold text-foreground">18笔</div>
          <div className="text-[10px] text-muted-foreground mt-1">胜率 61%</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">月收益</div>
          <div className="font-mono text-xl font-semibold text-emerald-500">+12.4%</div>
          <div className="text-[10px] text-muted-foreground mt-1">¥5,952</div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">引擎</div>
          <div className={`font-mono text-xs font-semibold ${isPaused ? 'text-foreground' : 'text-emerald-500'}`}>
            {isPaused ? '&#9208; 暂停' : '● 运行中'}
          </div>
          <div className="text-[10px] text-muted-foreground mt-1">{isPaused ? '已暂停' : '4h检测'}</div>
        </div>
      </div>

      {/* Recent trades */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
          最近成交
        </div>
        <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-muted/50">
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">时间</th>
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">方向</th>
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">价格</th>
                <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">盈亏</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '03-22 09:42', dir: '买入', price: '83,940', pnl: '持仓中', isBuy: true, isPending: true },
                { time: '03-19 14:10', dir: '卖出', price: '85,140', pnl: '+¥342', isBuy: false, isPending: false, isUp: true },
                { time: '03-12 11:00', dir: '卖出', price: '79,180', pnl: '-¥204', isBuy: false, isPending: false, isUp: false },
              ].map((row, i) => (
                <tr key={i} className="border-t border-muted/30 hover:bg-muted/30">
                  <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.time}</td>
                  <td className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isBuy ? 'text-emerald-500' : 'text-red-500'}`}>{row.dir}</td>
                  <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.price}</td>
                  <td className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isPending ? 'text-muted-foreground' : row.isUp ? 'text-emerald-500' : 'text-red-500'}`}>{row.pnl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action button */}
      <div className="flex gap-2.5">
        {isPaused ? (
          <Button
            onClick={onResume}
            className="flex-1 h-10 bg-emerald-500/10 border border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white font-mono text-[11px] font-medium"
            variant="outline"
          >
            &#9654; 重新启动策略
          </Button>
        ) : (
          <Button
            onClick={onPause}
            className="flex-1 h-10 bg-muted border border-muted-foreground/30 text-muted-foreground hover:border-red-500 hover:text-red-500 font-mono text-[11px] font-medium"
            variant="outline"
          >
            &#9208; 暂停策略运行
          </Button>
        )}
      </div>
    </div>
  )
}
