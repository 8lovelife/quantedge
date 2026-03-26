'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

interface LiveConfirmModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export function LiveConfirmModal({ open, onClose, onConfirm }: LiveConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent className="max-w-[440px]">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2.5 font-mono text-sm">
            <span className="text-lg">&#9888;&#65039;</span>
            确认启动实盘运行
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-[13px] text-muted-foreground leading-relaxed">
              <strong className="text-foreground">这将使用你的真实资金进行自动交易。</strong>
              <div className="mt-2.5 space-y-1.5">
                {[
                  '策略将 7×24 小时自动买卖，不会自动停止',
                  '市场剧烈波动时实际亏损可能超出止损设定值',
                  <>当前仓位为账户总资金的 <strong className="text-amber-500">10%</strong>，首次实盘建议调低至 5%</>,
                  '随时可点击面板内「暂停」彻底停止策略',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2.5">
                    <span className="text-red-500 flex-shrink-0">&#9654;</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-mono text-[11px] font-medium">
            取消
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-red-500/10 border border-red-500 text-red-500 hover:bg-red-500 hover:text-white font-mono text-[11px] font-medium"
          >
            我已了解，启动实盘 →
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
