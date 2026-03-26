'use client'

import { useState } from 'react'
import { useQuantTerminalStore } from '../store'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DraftTabProps {
  onStartBacktest: () => void
}

export function DraftTab({ onStartBacktest }: DraftTabProps) {
  const { togglePro, activeStrategyId, strategyStates } = useQuantTerminalStore()
  const state = strategyStates[activeStrategyId]
  const showPro = state?.showPro ?? false
  const [dslCode, setDslCode] = useState('')

  const pp = state?.parsedParams || {
    name: '均线突破策略',
    asset: 'BTC/USDT',
    tf: '4h',
    sl: '2%',
    tp: '6%',
    pos: '10%',
    stratType: 'ema_cross',
  }

  const dslMap: Record<string, string> = {
    ema_cross: `entry  ema(7) > ema(25) and vol > avg(20)*1.3\n  exit   close < ema(7)`,
    grid: `entry  price < lower_band(20, 2.0)\n  exit   price > upper_band(20, 2.0)`,
    low_risk: `entry  ema(7) > ema(25) and rsi < 65 and vol > avg(20)*1.2\n  exit   close < ema(7) or rsi > 75`,
  }

  const defaultDslCode = `strategy "${pp.name}" {
  asset      ${pp.asset}  tf ${pp.tf}
  ${dslMap[pp.stratType] || dslMap.ema_cross}
  stop_loss  ${pp.sl}  take_profit ${pp.tp}  position ${pp.pos}
  // AI 置信度 87% · 参数可调整
}`

  return (
    <div className="flex flex-col gap-4 flex-1">
      {/* Plain cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#128176;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">过去3个月如果用这个策略</div>
          <div className="text-sm font-semibold text-emerald-500">大概赚了 34%</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            投入 ¥10,000 约多了 ¥3,400（历史数据，不代表未来）
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#127919;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">10次交易里</div>
          <div className="text-sm font-semibold text-amber-500">大概 6次 赚钱</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            4次亏损，但赚的时候比亏的时候多，整体正收益
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#128737;&#65039;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">最坏情况</div>
          <div className="text-sm font-semibold text-red-500">最多亏过 8%</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            即 ¥10,000 最多单次亏 ¥800，之后自动止损离场
          </div>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-3 shadow-sm">
          <div className="text-lg mb-1.5">&#9201;&#65039;</div>
          <div className="text-[10px] text-muted-foreground mb-1 font-medium">需要你做什么</div>
          <div className="text-[13px] font-semibold text-foreground">几乎不用管</div>
          <div className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
            每4小时自动检查一次行情，条件满足自动买卖
          </div>
        </div>
      </div>

      {/* Strategy rules */}
      <div>
        <div className="font-mono text-[10px] text-muted-foreground tracking-wider mb-2 font-medium uppercase">
          策略规则（白话版）
        </div>
        <div className="space-y-2">
          {[
            { icon: '&#128994;', title: '什么时候买？', desc: '当短期趋势超过长期趋势，且今天交易量比平时多30%，自动买入。' },
            { icon: '&#128308;', title: '什么时候卖？', desc: '涨了 <strong>6%</strong> 锁定利润；或跌超 <strong>2%</strong> 自动止损，不让亏太多。' },
            { icon: '&#128188;', title: '每次用多少钱？', desc: '每次最多用账户的 <strong>10%</strong>，不会把所有钱押上。' },
          ].map((rule, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 bg-card border border-border/50 rounded-lg shadow-sm"
            >
              <span className="text-base flex-shrink-0" dangerouslySetInnerHTML={{ __html: rule.icon }} />
              <div>
                <div className="text-[13px] text-foreground mb-0.5 font-medium">{rule.title}</div>
                <div
                  className="text-xs text-muted-foreground leading-relaxed [&_strong]:text-foreground"
                  dangerouslySetInnerHTML={{ __html: rule.desc }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pro toggle */}
      <div
        className="flex items-center gap-1.5 cursor-pointer py-1.5 group"
        onClick={togglePro}
      >
        <span className="font-mono text-[10px] text-muted-foreground font-medium group-hover:text-violet-500 transition-colors">
          {showPro ? '&#9650; 收起' : '&#9660; 查看'} 专业模式（DSL代码）
        </span>
      </div>

      {showPro && (
        <div className="bg-card border border-border/50 border-l-[3px] border-l-violet-500 rounded-xl p-3 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="font-mono text-[10px] text-muted-foreground font-medium">DSL 代码 (可编辑)</span>
            <Button
              size="sm"
              variant="outline"
              className="h-6 px-2.5 text-[10px] font-mono bg-violet-500/10 border-violet-500/30 text-violet-500 hover:bg-violet-500 hover:text-white"
            >
              保存修改
            </Button>
          </div>
          <textarea
            className="w-full h-40 p-3 bg-muted/50 border border-border rounded-lg font-mono text-[11px] text-foreground leading-relaxed resize-y outline-none focus:border-violet-500 transition-colors"
            spellCheck={false}
            value={dslCode || defaultDslCode}
            onChange={(e) => setDslCode(e.target.value)}
          />
        </div>
      )}

      {/* Action button */}
      <div className="flex gap-2.5">
        <Button
          onClick={onStartBacktest}
          className="flex-1 h-10 bg-blue-500/10 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white font-mono text-[11px] font-medium"
          variant="outline"
        >
          &#9654; 开始回测 — 验证历史表现
        </Button>
      </div>
    </div>
  )
}
