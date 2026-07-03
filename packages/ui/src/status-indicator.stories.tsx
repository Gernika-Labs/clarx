import { StatusIndicator } from './status-indicator'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/StatusIndicator',
  component: StatusIndicator,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  render: () => (
    <StoryPage
      title="StatusIndicator"
      description="Minimal dot indicator for compact lists, background job rows, and tool execution metadata."
    >
      <Section
        title="Variations"
        description="Use the bare dot in dense layouts or add a label when the status needs explicit copy."
      >
        <VariantGrid>
          <PreviewCard title="States with labels">
            <div className="flex flex-col gap-3">
              <StatusIndicator state="active" label="Active" />
              <StatusIndicator state="pending" label="Pending" />
              <StatusIndicator state="success" label="Success" />
              <StatusIndicator state="warning" label="Warning" />
              <StatusIndicator state="error" label="Error" />
            </div>
          </PreviewCard>
          <PreviewCard title="Compact sizes">
            <div className="flex flex-wrap items-center gap-4">
              <StatusIndicator state="idle" size="sm" />
              <StatusIndicator state="active" size="sm" />
              <StatusIndicator state="success" size="md" />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'state', type: "'active' | 'idle' | 'success' | 'warning' | 'error' | 'pending'", defaultValue: "'idle'", description: 'Controls the dot color and pulse animation.' },
            { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Adjusts the size of the dot.' },
            { name: 'label', type: 'string', description: 'Optional small caption to the right of the dot.' },
            { name: 'className', type: 'string', description: 'Adds wrapper classes.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Typical compact usage.">
        <CodeExamples
          examples={[
            {
              title: 'Labeled status',
              code: `<StatusIndicator state="active" label="Watching files" />`,
            },
            {
              title: 'Dot only',
              code: `<StatusIndicator state="success" size="sm" />`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
