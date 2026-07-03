import { StreamingText } from './streaming-text'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/StreamingText',
  component: StreamingText,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  args: {
    text: 'Example text',
  },
  render: () => (
    <StoryPage
      title="StreamingText"
      description="Tiny utility for inline streaming responses when a full message bubble is unnecessary."
    >
      <Section
        title="Variations"
        description="The component is intentionally narrow: plain text plus an optional trailing streaming cursor."
      >
        <VariantGrid>
          <PreviewCard title="Static text">
            <div className="text-sm text-zinc-800">
              <StreamingText text="Package boundary looks healthy." />
            </div>
          </PreviewCard>
          <PreviewCard title="Streaming text">
            <div className="text-sm text-zinc-800">
              <StreamingText text="Analyzing export graph" isStreaming />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'text', type: 'string', description: 'Plain text content to render.' },
            { name: 'isStreaming', type: 'boolean', defaultValue: 'false', description: 'Shows the trailing cursor when true.' },
            { name: 'className', type: 'string', description: 'Adds wrapper classes.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Most usages should stay this simple.">
        <CodeExamples
          examples={[
            {
              title: 'Static text',
              code: `<StreamingText text="Package boundary looks healthy." />`,
            },
            {
              title: 'Streaming text',
              code: `<StreamingText text="Analyzing export graph" isStreaming />`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
