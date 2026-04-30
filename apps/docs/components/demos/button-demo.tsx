'use client'

import { Button } from '@intention-ui/ui'
import { Preview, PreviewGrid, PreviewRow } from '@/components/preview'

const INTENTS = ['neutral', 'brand', 'danger', 'success'] as const
const APPEARANCES = ['solid', 'soft', 'ghost', 'outline'] as const

export function ButtonIntentDemo() {
  return (
    <PreviewGrid>
      {APPEARANCES.map((appearance) => (
        <PreviewRow key={appearance} label={appearance}>
          {INTENTS.map((intent) => (
            <Button key={intent} intent={intent} appearance={appearance}>
              {intent}
            </Button>
          ))}
        </PreviewRow>
      ))}
    </PreviewGrid>
  )
}

export function ButtonSizeDemo() {
  return (
    <Preview className="items-end">
      <Button intent="brand" size="sm">Small</Button>
      <Button intent="brand" size="md">Medium</Button>
      <Button intent="brand" size="lg">Large</Button>
    </Preview>
  )
}

export function ButtonDestructiveDemo() {
  return (
    <Preview className="gap-3">
      <Button intent="neutral" appearance="soft">Cancel</Button>
      <Button intent="danger" appearance="solid">Delete account</Button>
    </Preview>
  )
}
