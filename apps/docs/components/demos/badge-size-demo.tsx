'use client'

import { Badge } from '@intention-ui/ui'
import { Preview } from '@/components/preview'

export function BadgeSizeDemo() {
  return (
    <Preview className="items-baseline">
      <Badge size="sm" intent="brand" dot="static">sm</Badge>
      <Badge size="md" intent="brand" dot="static">md</Badge>
    </Preview>
  )
}
