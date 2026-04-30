import type { ReactNode } from 'react'
import { cn } from '@intention-ui/ui'

export function Preview({
  children,
  className,
  label,
}: {
  children: ReactNode
  className?: string
  label?: string
}) {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border">
      {label && (
        <div className="border-b bg-fd-muted/30 px-4 py-2 text-xs text-fd-muted-foreground">
          {label}
        </div>
      )}
      <div className={cn('flex flex-wrap items-center gap-3 p-8', className)}>
        {children}
      </div>
    </div>
  )
}

export function PreviewGrid({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'not-prose my-6 overflow-hidden rounded-xl border divide-y',
        className
      )}
    >
      {children}
    </div>
  )
}

export function PreviewRow({
  children,
  label,
  className,
}: {
  children: ReactNode
  label?: string
  className?: string
}) {
  return (
    <div className="flex items-center gap-0">
      {label && (
        <div className="w-24 shrink-0 border-r bg-fd-muted/30 px-4 py-5 text-xs font-medium text-fd-muted-foreground">
          {label}
        </div>
      )}
      <div
        className={cn(
          'flex flex-1 flex-wrap items-center gap-3 px-6 py-5',
          className
        )}
      >
        {children}
      </div>
    </div>
  )
}
