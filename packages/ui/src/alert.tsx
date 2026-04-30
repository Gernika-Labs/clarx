import * as React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from './utils'
import type { Intent } from './tokens'

const alertVariants = cva('rounded-xl border p-4', {
  variants: {
    intent: {
      success: '',
      warning: '',
      danger:  '',
      neutral: '',
      info:    '',
      brand:   '',
    },
    appearance: {
      soft:  '',
      solid: '',
    },
  },
  compoundVariants: [
    { intent: 'success', appearance: 'soft',  className: 'border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300' },
    { intent: 'warning', appearance: 'soft',  className: 'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300' },
    { intent: 'danger',  appearance: 'soft',  className: 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300' },
    { intent: 'neutral', appearance: 'soft',  className: 'border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300' },
    { intent: 'info',    appearance: 'soft',  className: 'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300' },
    { intent: 'brand',   appearance: 'soft',  className: 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300' },
    { intent: 'success', appearance: 'solid', className: 'border-transparent bg-green-600 text-white dark:bg-green-500' },
    { intent: 'warning', appearance: 'solid', className: 'border-transparent bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-900' },
    { intent: 'danger',  appearance: 'solid', className: 'border-transparent bg-red-600 text-white dark:bg-red-500' },
    { intent: 'neutral', appearance: 'solid', className: 'border-transparent bg-zinc-800 text-white dark:bg-zinc-700' },
    { intent: 'info',    appearance: 'solid', className: 'border-transparent bg-sky-600 text-white dark:bg-sky-500' },
    { intent: 'brand',   appearance: 'solid', className: 'border-transparent bg-blue-600 text-white dark:bg-blue-500' },
  ],
  defaultVariants: {
    intent: 'neutral',
    appearance: 'soft',
  },
})

export type AlertProps = {
  intent?: Intent
  appearance?: 'soft' | 'solid'
  title?: string
  children?: React.ReactNode
  className?: string
}

export function Alert({
  intent = 'neutral',
  appearance = 'soft',
  title,
  children,
  className,
}: AlertProps) {
  return (
    <div
      role="alert"
      data-intent={intent}
      data-appearance={appearance}
      className={cn(alertVariants({ intent, appearance }), className)}
    >
      {title && <p className="mb-1 text-sm font-semibold">{title}</p>}
      {children && <div className="text-sm">{children}</div>}
    </div>
  )
}
