import { ToolCall } from './tool-call'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/ToolCall',
  component: ToolCall,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  args: {
    name: 'example_tool',
  },
  render: () => (
    <StoryPage
      title="ToolCall"
      description="Expandable execution row for tool invocations with status, input payloads, outputs, and errors."
    >
      <Section
        title="Variations"
        description="Use closed rows for routine activity and open rows for detailed inspection, especially on success output or errors."
      >
        <VariantGrid>
          <PreviewCard title="Lifecycle states" className="md:col-span-2 xl:col-span-2">
            <div className="flex w-full flex-col gap-3">
              <ToolCall name="read_repo_map" status="pending" input={{ root: 'packages/ui' }} />
              <ToolCall name="score_workspace" status="running" input={{ scope: 'packages/ui' }} />
              <ToolCall
                name="collect_findings"
                status="success"
                defaultOpen
                input={{ limit: 5 }}
                output={{ findings: 3, highest: 'E4' }}
              />
              <ToolCall
                name="push_release"
                status="error"
                input={{ channel: 'stable' }}
                error="Permission denied for protected branch."
              />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'name', type: 'string', description: 'Monospace label for the invoked tool or action.' },
            { name: 'status', type: "'pending' | 'running' | 'success' | 'error'", defaultValue: "'pending'", description: 'Controls icon, accent ring, and open-by-default error behavior.' },
            { name: 'input', type: 'Record<string, unknown>', description: 'Optional JSON payload rendered in the details body.' },
            { name: 'output', type: 'unknown', description: 'Optional success payload rendered when status is success.' },
            { name: 'error', type: 'string', description: 'Optional error copy rendered when status is error.' },
            { name: 'defaultOpen', type: 'boolean', defaultValue: 'false', description: 'Initial expanded state for non-error calls.' },
            { name: 'className', type: 'string', description: 'Adds wrapper classes.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Typical activity log patterns.">
        <CodeExamples
          examples={[
            {
              title: 'Successful tool call',
              code: `<ToolCall
  name="collect_findings"
  status="success"
  defaultOpen
  input={{ limit: 5 }}
  output={{ findings: 3, highest: 'E4' }}
/>`,
            },
            {
              title: 'Errored tool call',
              code: `<ToolCall
  name="push_release"
  status="error"
  input={{ channel: 'stable' }}
  error="Permission denied for protected branch."
/>`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
