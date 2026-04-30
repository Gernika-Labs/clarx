'use client'

import * as React from 'react'
import { cn } from './utils'

export type ChatInputProps = {
  placeholder?: string
  onSubmit?: (value: string) => void
  onStop?: () => void
  isStreaming?: boolean
  disabled?: boolean
  actions?: React.ReactNode
  className?: string
}

export function ChatInput({
  placeholder = 'Message...',
  onSubmit,
  onStop,
  isStreaming = false,
  disabled = false,
  actions,
  className,
}: ChatInputProps) {
  const [value, setValue] = React.useState('')
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  function autoResize() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value)
    autoResize()
  }

  function submit() {
    const trimmed = value.trim()
    if (!trimmed || disabled) return
    onSubmit?.(trimmed)
    setValue('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
    if (e.key === 'Escape') {
      setValue('')
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }

  const hasValue = value.trim().length > 0

  return (
    <div
      className={cn(
        'flex items-end gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 dark:bg-zinc-900 dark:focus-within:ring-zinc-100/10',
        disabled && 'opacity-60 cursor-not-allowed',
        className
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled || isStreaming}
        rows={1}
        className="min-h-[1.5rem] flex-1 resize-none overflow-hidden bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed"
        style={{ maxHeight: 200 }}
      />
      {actions}
      <button
        type="button"
        onClick={isStreaming ? onStop : submit}
        disabled={disabled || (!isStreaming && !hasValue)}
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors',
          isStreaming
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : hasValue
            ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
            : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500',
          'disabled:opacity-50 disabled:cursor-not-allowed'
        )}
      >
        {isStreaming ? (
          // Stop icon
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="0" y="0" width="10" height="10" rx="1" />
          </svg>
        ) : (
          // Up-arrow icon
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 12V2M3 6l4-4 4 4" />
          </svg>
        )}
      </button>
    </div>
  )
}
