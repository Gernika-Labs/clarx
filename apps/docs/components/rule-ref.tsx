'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { RULE_DESCRIPTIONS } from '@/lib/rule-descriptions'

/**
 * Inline reference to a rule code (C3, O1, …) for use in MDX prose.
 *
 * Tooltip is portaled to document.body so surrounding prose text cannot paint
 * on top of it (absolute positioning inside inline prose caused bleed-through).
 *
 * Usage in MDX: `<RuleRef id="C3" />`
 */
export function RuleRef({ id }: { id: string }) {
  const code = id.toUpperCase()
  const rule = RULE_DESCRIPTIONS[code]
  const anchorRef = useRef<HTMLSpanElement>(null)
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const updatePosition = useCallback(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const rect = anchor.getBoundingClientRect()
    setCoords({
      top: rect.top - 6,
      left: rect.left + rect.width / 2,
    })
  }, [])

  useEffect(() => {
    if (!open) return
    const reposition = () => updatePosition()
    window.addEventListener('scroll', reposition, true)
    window.addEventListener('resize', reposition)
    return () => {
      window.removeEventListener('scroll', reposition, true)
      window.removeEventListener('resize', reposition)
    }
  }, [open, updatePosition])

  const show = useCallback(() => {
    updatePosition()
    setOpen(true)
  }, [updatePosition])

  const hide = useCallback(() => {
    setOpen(false)
  }, [])

  if (!rule) return <code>{code}</code>

  const tooltip =
    open && mounted
      ? createPortal(
          <span
            role="tooltip"
            className="rule-ref-tooltip pointer-events-none fixed z-[9999] w-72 -translate-x-1/2 -translate-y-full rounded-lg border border-zinc-200 p-3 text-left text-xs font-normal leading-relaxed text-zinc-700 shadow-lg dark:border-zinc-700 dark:text-zinc-300"
            style={{ top: coords.top, left: coords.left }}
          >
            <span className="mb-1 block font-semibold text-zinc-900 dark:text-zinc-50">
              {code} — {rule.title}
            </span>
            {rule.hint}
            <span className="mt-1.5 block text-zinc-500 dark:text-zinc-400">
              Click for the full definition →
            </span>
          </span>,
          document.body,
        )
      : null

  return (
    <>
      <Link
        href={`/docs/standard/pillars#${code.toLowerCase()}`}
        className="inline-block align-baseline no-underline"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        <span ref={anchorRef}>
          <code className="rounded border border-fd-border bg-fd-muted px-1 py-0.5 text-[0.8em] font-medium text-fd-foreground transition-colors hover:border-fd-primary/50 hover:text-fd-primary">
            {code}
          </code>
        </span>
      </Link>
      {tooltip}
    </>
  )
}