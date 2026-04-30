import * as React from 'react'
import { cn } from './utils'

export type StreamingTextProps = {
  text: string
  isStreaming?: boolean
  className?: string
}

export function StreamingText({ text, isStreaming, className }: StreamingTextProps) {
  return (
    <span className={cn(className)}>
      {text}
      {isStreaming && (
        <span className="ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.1em] animate-pulse rounded-sm bg-current" />
      )}
    </span>
  )
}
