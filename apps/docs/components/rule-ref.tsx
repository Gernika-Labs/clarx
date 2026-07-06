import Link from 'next/link'
import { RULE_DESCRIPTIONS } from '@/lib/rule-descriptions'

/**
 * Inline reference to a rule code (C3, O1, …) for use in MDX prose.
 *
 * Renders the code as a small chip that shows a plain-language tooltip on
 * hover/focus and links to the rule's definition on the pillars page
 * (headings there carry stable [#c3]-style anchors). Pure CSS tooltip —
 * no client JS, works in RSC.
 *
 * Usage in MDX: `<RuleRef id="C3" />`
 */
export function RuleRef({ id }: { id: string }) {
  const code = id.toUpperCase()
  const rule = RULE_DESCRIPTIONS[code]

  if (!rule) return <code>{code}</code>

  return (
    <Link
      href={`/docs/standard/pillars#${code.toLowerCase()}`}
      className="group relative inline-block align-baseline no-underline"
    >
      <code className="rounded border border-fd-border bg-fd-muted px-1 py-0.5 text-[0.8em] font-medium text-fd-foreground transition-colors group-hover:border-fd-primary/50 group-hover:text-fd-primary">
        {code}
      </code>
      <span
        role="tooltip"
        className="rule-ref-tooltip pointer-events-none invisible absolute bottom-full left-1/2 z-[100] mb-1.5 w-72 -translate-x-1/2 rounded-lg border border-zinc-200 p-3 text-left text-xs font-normal leading-relaxed text-zinc-700 shadow-lg group-hover:visible group-focus-visible:visible dark:border-zinc-700 dark:text-zinc-300"
      >
        <span className="mb-1 block font-semibold text-zinc-900 dark:text-zinc-50">
          {code} — {rule.title}
        </span>
        {rule.hint}
        <span className="mt-1.5 block text-zinc-500 dark:text-zinc-400">
          Click for the full definition →
        </span>
      </span>
    </Link>
  )
}
