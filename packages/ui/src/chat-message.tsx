import * as React from 'react'
import { cn } from './utils'

export type ChatMessageRole = 'user' | 'assistant' | 'system'

export type ChatMessageProps = {
  role: ChatMessageRole
  content: React.ReactNode
  isStreaming?: boolean
  avatar?: React.ReactNode
  timestamp?: string
  className?: string
}

function DefaultAvatar({ role }: { role: 'user' | 'assistant' }) {
  return (
    <div
      className={cn(
        'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium',
        role === 'user'
          ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
          : 'bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 text-zinc-500'
      )}
    >
      {role === 'user' ? 'U' : 'AI'}
    </div>
  )
}

export function ChatMessage({
  role,
  content,
  isStreaming,
  avatar,
  timestamp,
  className,
}: ChatMessageProps) {
  if (role === 'system') {
    return (
      <div className={cn('flex justify-center', className)}>
        <span className="rounded-full border bg-zinc-50 px-3 py-1 text-xs text-zinc-400 dark:bg-zinc-900">
          {content}
        </span>
      </div>
    )
  }

  const isUser = role === 'user'

  return (
    <div
      className={cn(
        'flex w-full gap-2',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {avatar ?? <DefaultAvatar role={role} />}
      <div className={cn('flex flex-col gap-1', isUser ? 'items-end' : 'items-start')}>
        <div
          className={cn(
            'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'rounded-tr-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
              : 'rounded-tl-md bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100'
          )}
        >
          {content}
          {isStreaming && (
            <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.1em] animate-pulse rounded-sm bg-current" />
          )}
        </div>
        {timestamp && (
          <span className="text-[11px] text-zinc-400">{timestamp}</span>
        )}
      </div>
    </div>
  )
}
