import * as React from 'react'
import { cn } from './utils'

export type AgentState = 'idle' | 'thinking' | 'using-tool' | 'responding' | 'done' | 'error'

export type AgentStatusProps = {
  state: AgentState
  label?: string
  className?: string
}

type StateConfig = {
  dotColor?: string
  pulse?: boolean
  textColor: string
  defaultLabel: string
}

const STATE_CONFIG: Record<AgentState, StateConfig> = {
  idle: {
    textColor: 'text-zinc-400 dark:text-zinc-500',
    defaultLabel: 'Idle',
  },
  thinking: {
    dotColor: 'bg-zinc-400',
    pulse: true,
    textColor: 'text-zinc-600 dark:text-zinc-300',
    defaultLabel: 'Thinking...',
  },
  'using-tool': {
    dotColor: 'bg-blue-500',
    pulse: true,
    textColor: 'text-blue-600 dark:text-blue-400',
    defaultLabel: 'Using tool...',
  },
  responding: {
    dotColor: 'bg-violet-500',
    pulse: true,
    textColor: 'text-violet-600 dark:text-violet-400',
    defaultLabel: 'Responding...',
  },
  done: {
    dotColor: 'bg-green-500',
    pulse: false,
    textColor: 'text-green-600 dark:text-green-400',
    defaultLabel: 'Done',
  },
  error: {
    dotColor: 'bg-red-500',
    pulse: false,
    textColor: 'text-red-600 dark:text-red-400',
    defaultLabel: 'Error',
  },
}

export function AgentStatus({ state, label, className }: AgentStatusProps) {
  const config = STATE_CONFIG[state]
  const resolvedLabel = label ?? config.defaultLabel

  return (
    <div className={cn('inline-flex items-center gap-2 text-sm font-medium', config.textColor, className)}>
      {config.dotColor && (
        <span
          className={cn(
            'h-2 w-2 rounded-full',
            config.dotColor,
            config.pulse && 'animate-pulse'
          )}
        />
      )}
      {resolvedLabel}
    </div>
  )
}
