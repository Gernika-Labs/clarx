'use client'

import { AgentStatus, type AgentState } from '@clarxai/ui'
import { PreviewGrid, PreviewRow } from '@/components/preview'

const STATES: AgentState[] = ['idle', 'thinking', 'using-tool', 'responding', 'done', 'error']

export function AgentStatusAllStatesDemo() {
  return (
    <PreviewGrid>
      {STATES.map((state) => (
        <PreviewRow key={state} label={state}>
          <AgentStatus state={state} />
        </PreviewRow>
      ))}
    </PreviewGrid>
  )
}
