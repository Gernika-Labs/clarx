import * as React from 'react'
import { cn } from './utils'

export type ClarxLogoProps = {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const SIZE_CLASS: Record<NonNullable<ClarxLogoProps['size']>, string> = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
}

export function ClarxLogo({ size = 'md', className }: ClarxLogoProps) {
  return (
    <span
      className={cn(
        'inline-block font-mono font-semibold tracking-tight text-transparent bg-clip-text',
        'bg-[linear-gradient(90deg,var(--clarx-neon-cyan)_0%,var(--clarx-arcade-blue)_24%,var(--clarx-neon-violet)_52%,var(--clarx-hot-magenta)_76%,var(--clarx-solar-gold)_100%)]',
        SIZE_CLASS[size],
        className,
      )}
    >
      clarx ai
    </span>
  )
}
