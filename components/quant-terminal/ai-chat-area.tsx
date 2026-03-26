'use client'

import { useState, useRef, useEffect } from 'react'
import { useQuantTerminalStore } from './store'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const quickChips = [
  '最近7天可以赚钱的投资',
  '稳健 BTC 收益策略',
  '低风险 ETH 网格',
  'BTC 行情',
  '我的持仓',
]

interface StrategyData {
  title: string
  description: string
  metrics: { label: string; value: string; sub: string; color?: string }[]
  dsl: string
  asset: string
  timeframe: string
}

interface Message {
  id: string
  type: 'user' | 'ai'
  content: string
  timestamp: Date
  responseType?: 'text' | 'strategy'
  strategy?: StrategyData
}

function DSLCodeBlock({ code, asset, timeframe }: { code: string; asset: string; timeframe: string }) {
  // Parse and render DSL with syntax highlighting
  const renderLine = (line: string, idx: number) => {
    const tokens: React.ReactNode[] = []
    let remaining = line
    let keyIdx = 0
    
    // Keywords (purple)
    const keywords = ['strategy', 'asset', 'entry', 'exit', 'stop_loss', 'take_profit', 'position', 'type', 'grid_count', 'grid_gap', 'per_grid', 'tf']
    // Functions (cyan)
    const functions = ['ema', 'macd', 'rsi', 'vol', 'avg']
    // Operators (cyan)
    const operators = ['and', 'or']
    
    // Simple tokenizer
    const parts = remaining.split(/(\s+|[{}()<>])/g).filter(Boolean)
    
    for (const part of parts) {
      if (keywords.includes(part)) {
        tokens.push(<span key={keyIdx++} className="text-violet-400">{part}</span>)
      } else if (functions.includes(part) || operators.includes(part) || part === 'grid') {
        tokens.push(<span key={keyIdx++} className="text-cyan-400">{part}</span>)
      } else if (/^".*"$/.test(part)) {
        tokens.push(<span key={keyIdx++} className="text-amber-400">{part}</span>)
      } else if (/^(BTC|ETH)\/USDT$/.test(part)) {
        tokens.push(<span key={keyIdx++} className="text-blue-400">{part}</span>)
      } else if (/^\d+\.?\d*%$/.test(part) || /^(1h|4h|1d|15m)$/.test(part)) {
        tokens.push(<span key={keyIdx++} className="text-emerald-400">{part}</span>)
      } else {
        tokens.push(<span key={keyIdx++}>{part}</span>)
      }
    }
    
    return <div key={idx}>{tokens}</div>
  }
  
  const lines = code.split('\n')
  
  return (
    <div className="bg-[#1a1b26] rounded-lg overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
        <span className="font-mono text-[10px] text-white/60 tracking-wider uppercase">STRATEGY DSL</span>
        <span className="font-mono text-[10px] text-blue-400">{asset} · {timeframe}</span>
      </div>
      <pre className="p-4 font-mono text-[12px] leading-relaxed text-white/90 overflow-x-auto whitespace-pre">
        {lines.map((line, idx) => renderLine(line, idx))}
      </pre>
    </div>
  )
}

function StrategyCard({ message, onUseStrategy }: { message: Message; onUseStrategy?: (strategy: StrategyData) => void }) {
  const strategy = message.strategy!

  return (
    <div className="bg-card border border-border/50 border-l-[3px] border-l-violet-500 rounded-xl animate-in fade-in slide-in-from-bottom-1 duration-300 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-gradient-to-r from-violet-500/5 to-blue-500/5">
        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 flex items-center justify-center text-[10px] text-white shadow-md shadow-violet-500/25">
          &#10022;
        </div>
        <span className="text-sm font-semibold text-violet-500 flex-1">
          &#10022; 策略已生成 — {strategy.title}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col gap-4">
        {/* Description */}
        <p className="text-[13px] text-foreground leading-relaxed">{strategy.description}</p>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-2.5">
          {strategy.metrics.map((metric, i) => (
            <div key={i} className="bg-muted/50 border border-border/50 rounded-lg p-3">
              <div className="font-mono text-[9px] text-muted-foreground mb-1 tracking-wider uppercase">
                {metric.label}
              </div>
              <div 
                className="font-mono text-xl font-semibold"
                style={{ color: metric.color || 'inherit' }}
              >
                {metric.value}
              </div>
              <div className="text-[10px] text-muted-foreground mt-1">{metric.sub}</div>
            </div>
          ))}
        </div>

        {/* DSL Code Block */}
        <DSLCodeBlock code={strategy.dsl} asset={strategy.asset} timeframe={strategy.timeframe} />

        {/* Action Button */}
        <Button 
          onClick={() => onUseStrategy?.(strategy)}
          className="w-full h-11 bg-gradient-to-r from-violet-600 to-blue-500 text-white font-semibold text-sm shadow-lg shadow-violet-500/25 hover:opacity-90 transition-all"
        >
          使用此策略
        </Button>
      </div>
    </div>
  )
}

export function AIChatArea() {
  const { addLog, addStrategy } = useQuantTerminalStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleUseStrategy = (strategy: StrategyData) => {
    // Extract type from asset (e.g., BTC/USDT -> 趋势)
    const type = strategy.title.includes('网格') ? '震荡' : '趋势'
    
    addStrategy({
      name: strategy.title,
      asset: strategy.asset,
      timeframe: strategy.timeframe,
      type,
      returnRate: strategy.metrics[0]?.value || '',
      returnHint: '待回测',
    }, strategy.dsl)
    
    addLog('AI', `<span class="hi">添加策略</span> ${strategy.title}`)
  }

  const handleSend = async () => {
    if (!input.trim() || isThinking) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsThinking(true)

    // Simulate AI response
    setTimeout(() => {
      const aiResponse = generateAIResponse(userMessage.content)
      const aiMessage: Message = {
        id: crypto.randomUUID(),
        type: 'ai',
        content: aiResponse.content,
        timestamp: new Date(),
        responseType: aiResponse.type,
        strategy: aiResponse.strategy,
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsThinking(false)
      addLog('AI', '<span class="hi">响应</span> 已生成策略建议')
    }, 1500)
  }

  const handleChipClick = (chip: string) => {
    setInput(chip)
    textareaRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isThinking])

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 overflow-hidden h-full bg-muted/30">
      {/* Chat feed */}
      <ScrollArea className="flex-1 min-h-0">
        <div ref={scrollRef} className="p-4 flex flex-col gap-3">
          {messages.length === 0 && !isThinking && (
            <div className="flex flex-col items-center justify-center h-full py-20 gap-2 opacity-50">
              <div className="text-3xl text-violet-500">&#10022;</div>
              <div className="font-mono text-xs text-muted-foreground">
                告诉我你的投资想法，AI 帮你生成策略
              </div>
              <div className="font-mono text-[11px] text-muted-foreground/70 mt-1">
                例如："我要最近7天可以赚钱的投资"
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div key={message.id}>
              {message.type === 'user' ? (
                <div className="flex justify-end">
                  <div className="max-w-[68%] min-w-0 break-words bg-gradient-to-r from-violet-600 to-blue-500 rounded-[14px] rounded-br-[4px] px-4 py-2.5 text-[13px] text-white shadow-lg shadow-violet-500/20">
                    {message.content}
                  </div>
                </div>
              ) : message.responseType === 'strategy' && message.strategy ? (
                <StrategyCard message={message} onUseStrategy={handleUseStrategy} />
              ) : (
                <div className="bg-card border border-border/50 border-l-[3px] border-l-violet-500 rounded-xl animate-in fade-in slide-in-from-bottom-1 duration-300 shadow-sm">
                  <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/50">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 flex items-center justify-center text-[9px] text-white shadow-md shadow-violet-500/25">
                      &#10022;
                    </div>
                    <span className="text-xs font-semibold text-violet-500 flex-1">ASTRA AI</span>
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {message.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div
                    className="p-3 text-[13px] text-foreground leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="bg-card border border-border/50 border-l-[3px] border-l-violet-500 rounded-xl shadow-sm">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border/50 bg-muted/50">
                <div className="w-5 h-5 rounded-full bg-gradient-to-r from-violet-600 to-blue-500 flex items-center justify-center text-[9px] text-white shadow-md shadow-violet-500/25">
                  &#10022;
                </div>
                <span className="text-xs font-semibold text-violet-500 flex-1">ASTRA AI</span>
              </div>
              <div className="p-3">
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-[7px] h-[7px] rounded-full bg-violet-500 opacity-40 animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input bar */}
      <div className="border-t border-border/40 bg-card p-3 flex flex-col gap-2">
        <div className="flex gap-1.5 flex-wrap">
          {quickChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 rounded-full bg-muted border border-border/50 text-[11px] text-muted-foreground font-medium cursor-pointer transition-all hover:border-violet-500 hover:text-violet-500 hover:bg-violet-500/10"
            >
              {chip}
            </button>
          ))}
        </div>
        <div className={cn(
          "flex items-end gap-2.5 bg-card border border-border/50 rounded-xl px-3.5 py-2.5 transition-all shadow-sm",
          "focus-within:border-violet-500 focus-within:ring-[3px] focus-within:ring-violet-500/10"
        )}>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="用自然语言描述你的需求，例如「我要最近7天可以赚钱的投资」或「帮我做个稳健的BTC策略」..."
            className="flex-1 bg-transparent border-none outline-none resize-none text-foreground font-mono text-xs leading-relaxed max-h-16 placeholder:text-muted-foreground"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isThinking}
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-blue-500 text-white text-xs font-semibold shadow-lg shadow-violet-500/25 hover:opacity-90 hover:-translate-y-0.5 transition-all disabled:opacity-50"
          >
            发送 →
          </Button>
        </div>
      </div>
    </div>
  )
}

interface StrategyGeneration {
  title: string
  description: string
  metrics: { label: string; value: string; sub: string; color?: string }[]
  dsl: string
  asset: string
  timeframe: string
}

function generateAIResponse(query: string): { type: 'text' | 'strategy'; content: string; strategy?: StrategyGeneration } {
  const lowerQuery = query.toLowerCase()

  if (lowerQuery.includes('行情') || lowerQuery.includes('价格')) {
    return {
      type: 'text',
      content: `<p>当前 BTC/USDT 价格为 <strong>84,231</strong>，24h 涨幅 <span style="color:#10b981">+2.41%</span>。</p>
<p>技术面分析：4H 级别 EMA(7) 在 EMA(25) 上方，MACD 金叉，成交量放大，短期趋势偏多。支撑位 82,000，阻力位 86,500。</p>
<p>建议：可考虑逢低布局，设置 2% 止损。</p>`
    }
  }

  if (lowerQuery.includes('持仓')) {
    return {
      type: 'text',
      content: `<p>您当前的持仓情况：</p>
<p>• <strong>BTC</strong>: 0.012 BTC，成本 83,940，浮盈 <span style="color:#10b981">+¥348</span></p>
<p>• <strong>ETH</strong>: 0.5 ETH（模拟），成本 3,120</p>
<p>本月实盘总收益：<span style="color:#10b981">+12.4%</span> (¥5,952)</p>`
    }
  }

  if (lowerQuery.includes('7天') || lowerQuery.includes('赚钱') || lowerQuery.includes('短期') || lowerQuery.includes('短线')) {
    return {
      type: 'strategy',
      content: '针对最近7天行情优化的短线策略，抓住短期趋势波段。BTC 近期走势较好，策略信号活跃。',
      strategy: {
        title: '短线趋势 BTC',
        description: '针对最近7天行情优化的短线策略，抓住短期趋势波段。BTC 近期走势较好，策略信号活跃。',
        metrics: [
          { label: '预期收益', value: '+15~25%', sub: '历史估算', color: '#10b981' },
          { label: '止损', value: '1.5%', sub: '单次最大', color: '#ef4444' },
          { label: '止盈', value: '4%', sub: '目标', color: '#10b981' },
          { label: '仓位', value: '8%', sub: '账户占比' },
        ],
        dsl: `strategy "短线趋势 BTC" {
  asset       BTC/USDT  tf 1h
  entry  ema(5) > ema(12) and macd > 0 and vol > avg(10)*1.2
  exit   ema(5) < ema(12) or rsi > 72
  stop_loss  1.5%  take_profit 4%  position 8%
}`,
        asset: 'BTC/USDT',
        timeframe: '1h',
      }
    }
  }

  if (lowerQuery.includes('稳健') || lowerQuery.includes('低风险')) {
    return {
      type: 'strategy',
      content: '为您设计的稳健收益策略，仅在趋势明确时入场，严格控制风险。',
      strategy: {
        title: '稳健收益 BTC',
        description: '仅在趋势明确时入场，信号严格过滤，适合追求稳定增值的投资者。',
        metrics: [
          { label: '预期收益', value: '+8~15%', sub: '历史估算', color: '#10b981' },
          { label: '止损', value: '1%', sub: '单次最大', color: '#ef4444' },
          { label: '止盈', value: '3%', sub: '目标', color: '#10b981' },
          { label: '仓位', value: '5%', sub: '账户占比' },
        ],
        dsl: `strategy "稳健收益 BTC" {
  asset       BTC/USDT  tf 4h
  entry  ema(12) > ema(26) and macd > 0 and rsi < 65
  exit   ema(12) < ema(26) or rsi > 75
  stop_loss  1%  take_profit 3%  position 5%
}`,
        asset: 'BTC/USDT',
        timeframe: '4h',
      }
    }
  }

  if (lowerQuery.includes('网格')) {
    return {
      type: 'strategy',
      content: '为您生成网格交易策略，适用于震荡行情。',
      strategy: {
        title: '网格交易 ETH',
        description: '适用于震荡行情，在价格区间内低买高卖，网格间距 1.5%。',
        metrics: [
          { label: '预期收益', value: '+5~8%', sub: '月化', color: '#10b981' },
          { label: '网格数', value: '10', sub: '格' },
          { label: '间距', value: '1.5%', sub: '每格' },
          { label: '仓位', value: '15%', sub: '每格' },
        ],
        dsl: `strategy "网格交易 ETH" {
  asset       ETH/USDT  tf 1h
  type        grid
  grid_count  10  grid_gap 1.5%
  position    15%  per_grid
}`,
        asset: 'ETH/USDT',
        timeframe: '1h',
      }
    }
  }

  return {
    type: 'text',
    content: `<p>收到您的请求："${query}"</p>
<p>AI 正在分析市场数据和历史走势，为您定制��优策略...</p>
<p>建议您可以尝试以下问法获得更精准的策略：</p>
<p>• "帮我做个稳健的 BTC 策略"</p>
<p>• "最近7天可以赚钱的投资"</p>
<p>• "低风险 ETH 网格策略"</p>`
  }
}
