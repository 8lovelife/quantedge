'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuantTerminalStore, initialStrategies } from '../store'
import { Button } from '@/components/ui/button'
import { drawBacktestChart, generateBacktestData } from '../chart-utils'

interface BacktestTabProps {
  onStartPaper: () => void
  onStartBacktest: () => void
  readOnly?: boolean
}

export function BacktestTab({ onStartPaper, onStartBacktest, readOnly }: BacktestTabProps) {
  const { activeStrategyId, strategyStates, setStrategyState, addLog } = useQuantTerminalStore()
  const state = strategyStates[activeStrategyId]
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [progress, setProgress] = useState(0)
  const [progressMsg, setProgressMsg] = useState('加载历史数据...')

  const isDone = state?.stages.bt === 'done'
  const isRunning = state?.stages.bt === 'running'

  // Generate data if not exists
  useEffect(() => {
    if (state && (!state.btPts.length || !state.btSigs.length) && (isDone || isRunning)) {
      const { pts, sigs } = generateBacktestData()
      setStrategyState(activeStrategyId, { btPts: pts, btSigs: sigs })
    }
  }, [activeStrategyId, state, isDone, isRunning, setStrategyState])

  // Animation for running state
  useEffect(() => {
    if (!isRunning) return

    let idx = 0
    const total = 90
    let animFrame: number

    const animate = () => {
      idx = Math.min(idx + 1, total - 1)
      setProgress(Math.round((idx / total) * 100))

      if (idx < 30) setProgressMsg('加载历史数据...')
      else if (idx < 60) setProgressMsg('运行信号检测...')
      else if (idx < 88) setProgressMsg('计算盈亏...')
      else setProgressMsg('生成报告...')

      if (canvasRef.current && state?.btPts.length) {
        const pts = state.btPts.slice(0, idx + 1)
        const sigs = state.btSigs.filter((s) => s.i <= idx)
        drawBacktestChart(canvasRef.current, pts, sigs, { showAnimation: true, currentIndex: idx })
      }

      if (idx < total - 1) {
        animFrame = requestAnimationFrame(animate)
      } else {
        // Complete backtest
        setStrategyState(activeStrategyId, {
          stages: { ...state.stages, bt: 'done', paper: 'ready' },
          btDone: true,
        })
        addLog('回测', '<span class="hi">完成</span> · 胜率 61.3%')
      }
    }

    animFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrame)
  }, [isRunning, activeStrategyId, state, setStrategyState, addLog])

  // Draw static chart for done state
  useEffect(() => {
    if (isDone && canvasRef.current && state?.btPts.length) {
      drawBacktestChart(canvasRef.current, state.btPts, state.btSigs)
    }
  }, [isDone, state])

  if (isRunning) {
    return (
      <div className="flex flex-col gap-4 flex-1">
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider font-medium uppercase">
          回测进行中 — 加载历史K线数据...
        </div>
        <div className="flex items-center gap-2.5 mb-2.5">
          <span className="font-mono text-[10px] text-muted-foreground min-w-[140px]">{progressMsg}</span>
          <div className="flex-1 h-1 bg-muted rounded-sm overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-sm transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-[10px] text-blue-500 min-w-[40px] text-right font-medium">
            {progress}%
          </span>
        </div>
        <canvas ref={canvasRef} className="w-full h-[140px] rounded-lg bg-card" />
      </div>
    )
  }

  if (isDone) {
    return (
      <div className="flex flex-col gap-4 flex-1">
        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2.5">
          <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
            <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">总收益</div>
            <div className="font-mono text-xl font-semibold text-emerald-500">+34.2%</div>
            <div className="text-[10px] text-muted-foreground mt-1">近3个月</div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
            <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">稳定性</div>
            <div className="font-mono text-xl font-semibold text-cyan-500">1.82</div>
            <div className="text-[10px] text-muted-foreground mt-1">夏普比率</div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
            <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">最大回撤</div>
            <div className="font-mono text-xl font-semibold text-red-500">-8.4%</div>
            <div className="text-[10px] text-muted-foreground mt-1">可控范围</div>
          </div>
          <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
            <div className="font-mono text-[9px] text-muted-foreground mb-1.5 tracking-wider font-medium">胜率</div>
            <div className="font-mono text-xl font-semibold text-foreground">61.3%</div>
            <div className="text-[10px] text-muted-foreground mt-1">57笔</div>
          </div>
        </div>

        {/* Chart */}
        <div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
            回测净值曲线 — BTC/USDT 4h · 2024-12 ~ 2025-03
          </div>
          <div className="flex gap-3.5 mb-2 text-[10px] font-mono text-muted-foreground">
            <span><span className="text-blue-500">━</span> 策略净值</span>
            <span><span className="text-muted-foreground">╌</span> BTC持仓</span>
            <span><span className="text-emerald-500">●</span> 买入</span>
            <span><span className="text-red-500">●</span> 卖出</span>
          </div>
          <canvas ref={canvasRef} className="w-full h-[140px] rounded-lg bg-card" />
        </div>

        {/* Trade table */}
        <div>
          <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
            回测交易记录
          </div>
          <div className="bg-card border border-border/50 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">时间</th>
                  <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">方向</th>
                  <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">价格</th>
                  <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">数量</th>
                  <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">盈亏</th>
                  <th className="px-2.5 py-2 text-left font-mono text-[10px] text-muted-foreground font-medium">触发条件</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { time: '03-19', dir: '卖出', price: '85,210', qty: '0.012', pnl: '+6.0%', trigger: '止盈 tp=6%', isUp: true, isBuy: false },
                  { time: '03-14', dir: '买入', price: '80,380', qty: '0.012', pnl: '+6.0%', trigger: 'EMA金叉+量', isUp: true, isBuy: true },
                  { time: '03-10', dir: '卖出', price: '79,200', qty: '0.010', pnl: '-2.1%', trigger: '止损 sl=2%', isUp: false, isBuy: false },
                  { time: '02-28', dir: '卖出', price: '84,100', qty: '0.011', pnl: '+4.8%', trigger: 'close<ema(7)', isUp: true, isBuy: false },
                ].map((row, i) => (
                  <tr key={i} className="border-t border-muted/30 hover:bg-muted/30">
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.time}</td>
                    <td className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isBuy ? 'text-emerald-500' : 'text-red-500'}`}>{row.dir}</td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.price}</td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-foreground">{row.qty}</td>
                    <td className={`px-2.5 py-2 font-mono text-[11px] font-medium ${row.isUp ? 'text-emerald-500' : 'text-red-500'}`}>{row.pnl}</td>
                    <td className="px-2.5 py-2 font-mono text-[11px] text-muted-foreground">{row.trigger}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action button */}
        {!readOnly && <div className="flex gap-2.5">
          <Button
            onClick={onStartPaper}
            className="flex-1 h-10 bg-violet-500/10 border border-violet-500 text-violet-500 hover:bg-violet-500 hover:text-white font-mono text-[11px] font-medium"
            variant="outline"
          >
            &#9654; 开始模拟交易
          </Button>
        </div>}
      </div>
    )
  }

  // Ready state
  return (
    <div className="flex flex-col items-center justify-center h-full gap-2.5 opacity-50">
      <div className="text-3xl">&#128202;</div>
      <div className="font-mono text-xs text-muted-foreground">尚未回测</div>
      <Button
        onClick={onStartBacktest}
        className="mt-4 h-10 px-6 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-mono text-[11px] font-medium"
        variant="outline"
      >
        &#9654; 开始回测
      </Button>
    </div>
  )
}