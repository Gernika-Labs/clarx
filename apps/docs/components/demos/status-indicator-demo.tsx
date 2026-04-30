import { StatusIndicator } from '@clarxai/ui'
import { Preview, PreviewGrid, PreviewRow } from '@/components/preview'

const STATES = ['active', 'pending', 'idle', 'success', 'warning', 'error'] as const

export function StatusIndicatorAllStatesDemo() {
  return (
    <Preview className="flex-wrap gap-6">
      {STATES.map((state) => (
        <StatusIndicator key={state} state={state} label={state} />
      ))}
    </Preview>
  )
}

export function StatusIndicatorSizeDemo() {
  return (
    <Preview className="items-center gap-6">
      <StatusIndicator state="active" size="sm" label="sm" />
      <StatusIndicator state="active" size="md" label="md" />
    </Preview>
  )
}
