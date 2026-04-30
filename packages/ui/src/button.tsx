'use client'

import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from './utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      intent: {
        neutral: '',
        brand: '',
        danger: '',
        success: '',
      },
      appearance: {
        solid: '',
        soft: '',
        ghost: '',
        outline: '',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-6 text-base',
      },
    },
    compoundVariants: [
      { intent: 'neutral', appearance: 'solid',   className: 'bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200' },
      { intent: 'neutral', appearance: 'soft',    className: 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700' },
      { intent: 'neutral', appearance: 'ghost',   className: 'text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800' },
      { intent: 'neutral', appearance: 'outline', className: 'border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800' },
      { intent: 'brand',   appearance: 'solid',   className: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600' },
      { intent: 'brand',   appearance: 'soft',    className: 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900' },
      { intent: 'brand',   appearance: 'ghost',   className: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950' },
      { intent: 'brand',   appearance: 'outline', className: 'border border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950' },
      { intent: 'danger',  appearance: 'solid',   className: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600' },
      { intent: 'danger',  appearance: 'soft',    className: 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900' },
      { intent: 'danger',  appearance: 'ghost',   className: 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950' },
      { intent: 'danger',  appearance: 'outline', className: 'border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950' },
      { intent: 'success', appearance: 'solid',   className: 'bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600' },
      { intent: 'success', appearance: 'soft',    className: 'bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900' },
      { intent: 'success', appearance: 'ghost',   className: 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950' },
      { intent: 'success', appearance: 'outline', className: 'border border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950' },
    ],
    defaultVariants: {
      intent: 'neutral',
      appearance: 'solid',
      size: 'md',
    },
  }
)

export type ButtonIntent = 'neutral' | 'brand' | 'danger' | 'success'
export type ButtonAppearance = 'solid' | 'soft' | 'ghost' | 'outline'

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, intent, appearance, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ intent, appearance, size }), className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'
