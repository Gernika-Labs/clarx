import * as React from 'react'
import { cn } from './utils'

export type IndicatorState = 'active' | 'idle' | 'success' | 'warning' | 'error' | 'pending'

const DOT_CLASS: Record<IndicatorState, string> = {
  active:  'bg-blue-500 animate-pulse',
  pending: 'bg-zinc-400 animate-pulse',
  idle:    'bg-zinc-300 dark:bg-zinc-600',
  success: 'bg-green-500',
  warning: 'bg-amber-500',
  error:   'bg-red-500',
}

export type StatusIndicatorProps = {
  state?: IndicatorState
  size?: 'sm' | 'md'
  label?: string
  className?: string
}

export function StatusIndicator({
  state = 'idle',
  size = 'md',
  label,
  className,
}: StatusIndicatorProps) {
  const dotSize = size === 'sm' ? 'size-1.5' : 'size-2'
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className={cn('shrink-0 rounded-full', dotSize, DOT_CLASS[state])} />
      {label && (
        <span className="text-xs text-zinc-600 dark:text-zinc-400">{label}</span>
      )}
    </span>
  )
}
