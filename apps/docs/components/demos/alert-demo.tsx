import { Alert } from '@intention-ui/ui'
import { Preview, PreviewGrid, PreviewRow } from '@/components/preview'

const INTENTS = ['success', 'warning', 'danger', 'info', 'neutral', 'brand'] as const

export function AlertIntentDemo() {
  return (
    <div className="not-prose my-6 flex flex-col gap-3">
      <Alert intent="success" title="Deployment complete">
        Your changes are live in production.
      </Alert>
      <Alert intent="warning" title="Approaching limit">
        You have used 90% of your monthly quota.
      </Alert>
      <Alert intent="danger" title="Action required">
        Your payment method failed. Update it to continue.
      </Alert>
      <Alert intent="info" title="Scheduled maintenance">
        The system will be unavailable on Sunday from 2–4 AM UTC.
      </Alert>
      <Alert intent="neutral" title="Note">
        Changes to this setting take effect on next login.
      </Alert>
    </div>
  )
}

export function AlertAppearanceDemo() {
  return (
    <div className="not-prose my-6 flex flex-col gap-3">
      <Alert intent="danger" appearance="soft" title="soft — subdued, reads inline">
        Soft is the default. Good for contextual notices within a page.
      </Alert>
      <Alert intent="danger" appearance="solid" title="solid — high-emphasis">
        Solid commands attention. Use for critical blocking errors.
      </Alert>
    </div>
  )
}
