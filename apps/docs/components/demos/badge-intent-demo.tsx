'use client'

import { Badge } from '@intention-ui/ui'
import { PreviewGrid, PreviewRow } from '@/components/preview'

const INTENTS = ['success', 'warning', 'danger', 'neutral', 'info', 'brand'] as const

export function BadgeIntentDemo() {
  return (
    <PreviewGrid>
      <PreviewRow label="soft">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} appearance="soft">{intent}</Badge>
        ))}
      </PreviewRow>
      <PreviewRow label="solid">
        {INTENTS.map((intent) => (
          <Badge key={intent} intent={intent} appearance="solid">{intent}</Badge>
        ))}
      </PreviewRow>
    </PreviewGrid>
  )
}
