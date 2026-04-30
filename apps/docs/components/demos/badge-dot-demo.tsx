'use client'

import { Badge } from '@intention-ui/ui'
import { PreviewGrid, PreviewRow } from '@/components/preview'

const INTENTS = ['success', 'warning', 'danger', 'neutral', 'info', 'brand'] as const

export function BadgeDotDemo() {
  return (
    <PreviewGrid>
      <PreviewRow label="no dot">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent}>{intent}</Badge>
        ))}
      </PreviewRow>
      <PreviewRow label="static">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} dot="static">{intent}</Badge>
        ))}
      </PreviewRow>
      <PreviewRow label="pulse">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} dot="pulse">{intent}</Badge>
        ))}
      </PreviewRow>
    </PreviewGrid>
  )
}
