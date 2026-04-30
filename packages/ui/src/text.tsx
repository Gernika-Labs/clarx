import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './utils'

export type TextRole = 'heading' | 'body' | 'label' | 'caption' | 'muted' | 'code'

const textVariants = cva('', {
  variants: {
    role: {
      heading: 'text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50',
      body:    'text-sm text-zinc-700 dark:text-zinc-300',
      label:   'text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400',
      caption: 'text-xs text-zinc-500 dark:text-zinc-400',
      muted:   'text-sm text-zinc-400 dark:text-zinc-500',
      code:    'font-mono text-sm text-zinc-800 dark:text-zinc-200',
    },
  },
  defaultVariants: {
    role: 'body',
  },
})

const DEFAULT_TAG: Record<TextRole, string> = {
  heading: 'h2',
  body:    'p',
  label:   'span',
  caption: 'span',
  muted:   'p',
  code:    'code',
}

export type TextProps = {
  role?: TextRole
  as?: string
  children?: React.ReactNode
  className?: string
  id?: string
  htmlFor?: string
}

export function Text({ role = 'body', as, className, children, ...props }: TextProps) {
  const Tag = (as ?? DEFAULT_TAG[role]) as React.ElementType
  return (
    <Tag className={cn(textVariants({ role }), className)} {...props}>
      {children}
    </Tag>
  )
}
