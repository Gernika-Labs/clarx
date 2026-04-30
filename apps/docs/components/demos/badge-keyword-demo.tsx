'use client'

import { Badge, BADGE_KEYWORDS } from '@clarxai/ui'
import { PreviewGrid, PreviewRow } from '@/components/preview'

type AnyKeywordDef = { intent: string; appearance?: string; dot?: string; label: string }

const STATUS_KEYWORDS   = ['ready', 'running', 'pending', 'paused', 'failed', 'error', 'cancelled', 'done'] as const
const AI_KEYWORDS       = ['thinking', 'streaming', 'tool-call', 'uncertain'] as const
const SEVERITY_KEYWORDS = ['low', 'medium', 'high', 'critical'] as const
const LIFECYCLE_KEYWORDS = ['new', 'beta', 'alpha', 'deprecated'] as const

export function BadgeKeywordDemo() {
  return (
    <PreviewGrid>
      <PreviewRow label="Status">
        {STATUS_KEYWORDS.map((kw) => <Badge key={kw} keyword={kw} />)}
      </PreviewRow>
      <PreviewRow label="AI agent">
        {AI_KEYWORDS.map((kw) => <Badge key={kw} keyword={kw} />)}
      </PreviewRow>
      <PreviewRow label="Severity">
        {SEVERITY_KEYWORDS.map((kw) => <Badge key={kw} keyword={kw} />)}
      </PreviewRow>
      <PreviewRow label="Lifecycle">
        {LIFECYCLE_KEYWORDS.map((kw) => <Badge key={kw} keyword={kw} />)}
      </PreviewRow>
    </PreviewGrid>
  )
}

export function BadgeKeywordTable() {
  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-fd-muted/30">
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">keyword</th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">preview</th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">intent</th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">appearance</th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">dot</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(Object.entries(BADGE_KEYWORDS) as [string, AnyKeywordDef][]).map(([kw, def]) => (
            <tr key={kw} className="hover:bg-fd-muted/20">
              <td className="px-4 py-2.5 font-mono text-xs text-fd-muted-foreground">{kw}</td>
              <td className="px-4 py-2.5"><Badge keyword={kw as keyof typeof BADGE_KEYWORDS} /></td>
              <td className="px-4 py-2.5 text-fd-muted-foreground">{def.intent}</td>
              <td className="px-4 py-2.5 text-fd-muted-foreground">{def.appearance ?? 'soft'}</td>
              <td className="px-4 py-2.5 text-fd-muted-foreground">{def.dot ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
