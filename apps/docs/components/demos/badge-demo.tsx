'use client'

import { Badge, BADGE_KEYWORDS, type BadgeKeyword } from '@intention-ui/ui'

type AnyKeywordDef = { intent: string; appearance?: string; dot?: string; label: string; size?: string }
import { Preview, PreviewGrid, PreviewRow } from '@/components/preview'

const INTENTS = [
  'success',
  'warning',
  'danger',
  'neutral',
  'info',
  'brand',
] as const

export function BadgeIntentDemo() {
  return (
    <PreviewGrid>
      <PreviewRow label="soft">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} appearance="soft">
            {intent}
          </Badge>
        ))}
      </PreviewRow>
      <PreviewRow label="solid">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} appearance="solid">
            {intent}
          </Badge>
        ))}
      </PreviewRow>
    </PreviewGrid>
  )
}

export function BadgeDotDemo() {
  return (
    <PreviewGrid>
      <PreviewRow label="no dot">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent}>
            {intent}
          </Badge>
        ))}
      </PreviewRow>
      <PreviewRow label="static">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} dot="static">
            {intent}
          </Badge>
        ))}
      </PreviewRow>
      <PreviewRow label="pulse">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} dot="pulse">
            {intent}
          </Badge>
        ))}
      </PreviewRow>
    </PreviewGrid>
  )
}

export function BadgeSizeDemo() {
  return (
    <Preview className="items-baseline">
      <Badge size="sm" intent="brand" dot="static">
        sm
      </Badge>
      <Badge size="md" intent="brand" dot="static">
        md
      </Badge>
    </Preview>
  )
}

const STATUS_KEYWORDS = [
  'ready',
  'running',
  'pending',
  'paused',
  'failed',
  'error',
  'cancelled',
  'done',
] as const

const AI_KEYWORDS = [
  'thinking',
  'streaming',
  'tool-call',
  'uncertain',
] as const

const SEVERITY_KEYWORDS = ['low', 'medium', 'high', 'critical'] as const

const LIFECYCLE_KEYWORDS = ['new', 'beta', 'alpha', 'deprecated'] as const

export function BadgeKeywordDemo() {
  return (
    <PreviewGrid>
      <PreviewRow label="Status">
        {STATUS_KEYWORDS.map((kw) => (
          <Badge key={kw} keyword={kw} />
        ))}
      </PreviewRow>
      <PreviewRow label="AI agent">
        {AI_KEYWORDS.map((kw) => (
          <Badge key={kw} keyword={kw} />
        ))}
      </PreviewRow>
      <PreviewRow label="Severity">
        {SEVERITY_KEYWORDS.map((kw) => (
          <Badge key={kw} keyword={kw} />
        ))}
      </PreviewRow>
      <PreviewRow label="Lifecycle">
        {LIFECYCLE_KEYWORDS.map((kw) => (
          <Badge key={kw} keyword={kw} />
        ))}
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
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">
              keyword
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">
              preview
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">
              intent
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">
              appearance
            </th>
            <th className="px-4 py-2.5 text-left font-medium text-fd-muted-foreground">
              dot
            </th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {(Object.entries(BADGE_KEYWORDS) as [string, AnyKeywordDef][]).map(
            ([kw, def]) => (
              <tr key={kw} className="hover:bg-fd-muted/20">
                <td className="px-4 py-2.5 font-mono text-xs text-fd-muted-foreground">
                  {kw}
                </td>
                <td className="px-4 py-2.5">
                  <Badge keyword={kw as keyof typeof BADGE_KEYWORDS} />
                </td>
                <td className="px-4 py-2.5 text-fd-muted-foreground">
                  {def.intent}
                </td>
                <td className="px-4 py-2.5 text-fd-muted-foreground">
                  {def.appearance ?? 'soft'}
                </td>
                <td className="px-4 py-2.5 text-fd-muted-foreground">
                  {def.dot ?? '—'}
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  )
}
