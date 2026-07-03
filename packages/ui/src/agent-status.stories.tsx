import { AgentStatus } from './agent-status'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/AgentStatus',
  component: AgentStatus,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  args: {
    state: 'idle',
  },
  render: () => (
    <StoryPage
      title="AgentStatus"
      description="Lightweight agent lifecycle status for chat surfaces, tool execution rows, and inline response states."
    >
      <Section
        title="Variations"
        description="State coverage includes passive, active, success, and failure states. Override the label when the surrounding product language needs a more explicit description."
      >
        <VariantGrid>
          <PreviewCard title="Default states" note="The component carries its own default labels.">
            <div className="flex flex-col gap-3">
              <AgentStatus state="idle" />
              <AgentStatus state="thinking" />
              <AgentStatus state="using-tool" />
              <AgentStatus state="responding" />
              <AgentStatus state="done" />
              <AgentStatus state="error" />
            </div>
          </PreviewCard>
          <PreviewCard title="Custom labels" note="Useful when the product vocabulary is domain-specific.">
            <div className="flex flex-col gap-3">
              <AgentStatus state="thinking" label="Analyzing repository" />
              <AgentStatus state="using-tool" label="Fetching workspace context" />
              <AgentStatus state="responding" label="Drafting recommendation" />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            {
              name: 'state',
              type: "'idle' | 'thinking' | 'using-tool' | 'responding' | 'done' | 'error'",
              description: 'Selects dot behavior, label color, and default copy.',
            },
            {
              name: 'label',
              type: 'string',
              defaultValue: 'state-specific',
              description: 'Overrides the default state label.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Adds outer wrapper classes.',
            },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Typical inline usage patterns.">
        <CodeExamples
          examples={[
            {
              title: 'Basic state',
              code: `<AgentStatus state="thinking" />`,
            },
            {
              title: 'Custom label',
              code: `<AgentStatus state="using-tool" label="Calling GitHub" />`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
