import { Alert } from './alert'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/Alert',
  component: Alert,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  render: () => (
    <StoryPage
      title="Alert"
      description="Prominent message block for validation feedback, success confirmations, and workflow warnings."
    >
      <Section
        title="Variations"
        description="Use soft appearance for contextual status and solid appearance for higher visual urgency."
      >
        <VariantGrid>
          <PreviewCard title="Soft intents">
            <div className="flex w-full flex-col gap-3">
              <Alert intent="success" title="Sync complete">The latest scan has been stored.</Alert>
              <Alert intent="warning" title="Review before merge">Two recommendations still need attention.</Alert>
              <Alert intent="danger" title="Deployment blocked">A hard failure is preventing release.</Alert>
            </div>
          </PreviewCard>
          <PreviewCard title="Solid intents">
            <div className="flex w-full flex-col gap-3">
              <Alert intent="brand" appearance="solid" title="Workspace update">A new analysis is available.</Alert>
              <Alert intent="info" appearance="solid" title="Heads up">This package is being rescanned.</Alert>
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'intent', type: 'Intent', defaultValue: "'neutral'", description: 'Selects semantic color treatment.' },
            { name: 'appearance', type: "'soft' | 'solid'", defaultValue: "'soft'", description: 'Controls whether the alert feels contextual or emphatic.' },
            { name: 'title', type: 'string', description: 'Optional headline rendered above the body.' },
            { name: 'children', type: 'ReactNode', description: 'Body content for the alert.' },
            { name: 'className', type: 'string', description: 'Adds outer wrapper classes.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Representative usage patterns.">
        <CodeExamples
          examples={[
            {
              title: 'Soft alert',
              code: `<Alert intent="warning" title="Review before merge">
  Two recommendations still need attention.
</Alert>`,
            },
            {
              title: 'Solid alert',
              code: `<Alert intent="brand" appearance="solid" title="Workspace update">
  A new analysis is available.
</Alert>`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
