import { cva, type VariantProps } from 'class-variance-authority'
import * as React from 'react'
import { cn } from './utils'
import type { Intent, Appearance, Size } from './tokens'

// ─── Variants ────────────────────────────────────────────────────────────────

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors select-none',
  {
    variants: {
      intent: {
        success: '',
        warning: '',
        danger: '',
        neutral: '',
        info: '',
        brand: '',
      },
      appearance: {
        soft: '',
        solid: '',
      },
      size: {
        sm: 'text-[11px] leading-none px-2 py-1',
        md: 'text-xs leading-none px-2.5 py-1.5',
      },
    },
    compoundVariants: [
      // success
      {
        intent: 'success',
        appearance: 'soft',
        className:
          'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-400',
      },
      {
        intent: 'success',
        appearance: 'solid',
        className: 'bg-green-600 text-white dark:bg-green-500',
      },
      // warning
      {
        intent: 'warning',
        appearance: 'soft',
        className:
          'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400',
      },
      {
        intent: 'warning',
        appearance: 'solid',
        className: 'bg-amber-500 text-white',
      },
      // danger
      {
        intent: 'danger',
        appearance: 'soft',
        className: 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400',
      },
      {
        intent: 'danger',
        appearance: 'solid',
        className: 'bg-red-600 text-white dark:bg-red-500',
      },
      // neutral
      {
        intent: 'neutral',
        appearance: 'soft',
        className:
          'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300',
      },
      {
        intent: 'neutral',
        appearance: 'solid',
        className: 'bg-zinc-600 text-white dark:bg-zinc-500',
      },
      // info
      {
        intent: 'info',
        appearance: 'soft',
        className:
          'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
      },
      {
        intent: 'info',
        appearance: 'solid',
        className: 'bg-blue-600 text-white dark:bg-blue-500',
      },
      // brand
      {
        intent: 'brand',
        appearance: 'soft',
        className:
          'bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-400',
      },
      {
        intent: 'brand',
        appearance: 'solid',
        className: 'bg-violet-600 text-white dark:bg-violet-500',
      },
    ],
    defaultVariants: {
      intent: 'neutral',
      appearance: 'soft',
      size: 'md',
    },
  }
)

const dotVariants = cva('rounded-full shrink-0', {
  variants: {
    intent: {
      success: 'bg-green-500 dark:bg-green-400',
      warning: 'bg-amber-500 dark:bg-amber-400',
      danger: 'bg-red-500 dark:bg-red-400',
      neutral: 'bg-zinc-400 dark:bg-zinc-500',
      info: 'bg-blue-500 dark:bg-blue-400',
      brand: 'bg-violet-500 dark:bg-violet-400',
    },
    pulse: {
      true: 'animate-pulse',
      false: '',
    },
    size: {
      sm: 'h-1.5 w-1.5',
      md: 'h-2 w-2',
    },
  },
  defaultVariants: {
    pulse: false,
    size: 'md',
  },
})

// ─── Keyword map ─────────────────────────────────────────────────────────────

type DotMode = 'static' | 'pulse'

type KeywordDef = {
  intent: Intent
  appearance?: Appearance
  dot?: DotMode
  label: string
  size?: Size
}

export const BADGE_KEYWORDS = {
  // ── Pipeline / job status ──
  ready: { intent: 'success', appearance: 'soft', dot: 'static', label: 'Ready' },
  running: { intent: 'brand', appearance: 'soft', dot: 'pulse', label: 'Running' },
  pending: { intent: 'warning', appearance: 'soft', dot: 'pulse', label: 'Pending' },
  paused: { intent: 'neutral', appearance: 'soft', dot: 'static', label: 'Paused' },
  failed: { intent: 'danger', appearance: 'soft', dot: 'static', label: 'Failed' },
  error: { intent: 'danger', appearance: 'soft', dot: 'static', label: 'Error' },
  cancelled: { intent: 'neutral', appearance: 'soft', dot: 'static', label: 'Cancelled' },
  done: { intent: 'success', appearance: 'soft', dot: 'static', label: 'Done' },
  // ── AI agent states ──
  thinking: { intent: 'neutral', appearance: 'soft', dot: 'pulse', label: 'Thinking' },
  streaming: { intent: 'brand', appearance: 'soft', dot: 'pulse', label: 'Streaming' },
  'tool-call': { intent: 'info', appearance: 'soft', dot: 'pulse', label: 'Using tool' },
  uncertain: { intent: 'warning', appearance: 'soft', label: 'Uncertain' },
  // ── Severity ──
  low: { intent: 'success', appearance: 'soft', label: 'Low' },
  medium: { intent: 'warning', appearance: 'soft', label: 'Medium' },
  high: { intent: 'danger', appearance: 'soft', label: 'High' },
  critical: { intent: 'danger', appearance: 'solid', label: 'Critical' },
  // ── Lifecycle ──
  new: { intent: 'brand', appearance: 'soft', label: 'New' },
  beta: { intent: 'info', appearance: 'soft', label: 'Beta' },
  alpha: { intent: 'warning', appearance: 'soft', label: 'Alpha' },
  deprecated: { intent: 'neutral', appearance: 'soft', label: 'Deprecated' },
} as const satisfies Record<string, KeywordDef>

export type BadgeKeyword = keyof typeof BADGE_KEYWORDS

// ─── Component ───────────────────────────────────────────────────────────────

export type BadgeProps = {
  /** Shorthand: resolves intent, appearance, dot, and label from a named state */
  keyword?: BadgeKeyword
  intent?: Intent
  appearance?: Appearance
  /** false = no dot; "static" = solid dot; "pulse" = animated dot */
  dot?: false | DotMode
  size?: Size
  /** Overrides the keyword's default label */
  label?: string
  children?: React.ReactNode
  className?: string
}

export function Badge({
  keyword,
  intent,
  appearance,
  dot,
  size,
  label,
  children,
  className,
}: BadgeProps) {
  const kw = (keyword ? BADGE_KEYWORDS[keyword] : null) as KeywordDef | null

  const resolvedIntent = intent ?? kw?.intent ?? 'neutral'
  const resolvedAppearance = appearance ?? kw?.appearance ?? 'soft'
  const resolvedSize = size ?? kw?.size ?? 'md'

  // dot resolution: explicit prop > keyword default > false
  const resolvedDot: false | DotMode =
    dot !== undefined ? dot : kw?.dot ?? false

  const resolvedLabel = label ?? kw?.label

  return (
    <span
      className={cn(
        badgeVariants({
          intent: resolvedIntent,
          appearance: resolvedAppearance,
          size: resolvedSize,
        }),
        className
      )}
      data-slot="badge"
      data-intent={resolvedIntent}
      data-appearance={resolvedAppearance}
    >
      {resolvedDot !== false && (
        <span
          className={cn(
            dotVariants({
              intent: resolvedIntent,
              pulse: resolvedDot === 'pulse',
              size: resolvedSize,
            })
          )}
        />
      )}
      {children ?? resolvedLabel}
    </span>
  )
}
