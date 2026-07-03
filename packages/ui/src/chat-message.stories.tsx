import { ChatMessage } from './chat-message'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/ChatMessage',
  component: ChatMessage,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  args: {
    role: 'assistant',
    content: 'Example message',
  },
  render: () => (
    <StoryPage
      title="ChatMessage"
      description="Conversation bubble for user, assistant, and system messages with optional timestamps and streaming cursor."
    >
      <Section
        title="Variations"
        description="User and assistant messages align to opposite edges. System messages collapse into a centered status chip."
      >
        <VariantGrid>
          <PreviewCard title="Conversation" className="md:col-span-2 xl:col-span-2">
            <div className="flex w-full flex-col gap-4">
              <ChatMessage role="assistant" content="I reviewed the package and found one operational recommendation." timestamp="09:42" />
              <ChatMessage role="user" content="Show me the highest-risk file next." timestamp="09:43" />
              <ChatMessage role="assistant" content="The score command remains the highest fan-in entry point." isStreaming timestamp="09:43" />
            </div>
          </PreviewCard>
          <PreviewCard title="System">
            <div className="flex w-full flex-col gap-4">
              <ChatMessage role="system" content="Watch mode resumed" />
              <ChatMessage role="system" content="Copied findings to clipboard" />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'role', type: "'user' | 'assistant' | 'system'", description: 'Determines alignment, chrome, and avatar behavior.' },
            { name: 'content', type: 'ReactNode', description: 'Main message body.' },
            { name: 'isStreaming', type: 'boolean', defaultValue: 'false', description: 'Shows a trailing streaming cursor inside assistant or user bubbles.' },
            { name: 'avatar', type: 'ReactNode', description: 'Overrides the default avatar for non-system messages.' },
            { name: 'timestamp', type: 'string', description: 'Optional small timestamp below the bubble.' },
            { name: 'className', type: 'string', description: 'Adds wrapper classes.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Typical message rendering patterns.">
        <CodeExamples
          examples={[
            {
              title: 'Assistant message',
              code: `<ChatMessage
  role="assistant"
  content="I reviewed the package and found one operational recommendation."
  timestamp="09:42"
/>`,
            },
            {
              title: 'System message',
              code: `<ChatMessage role="system" content="Watch mode resumed" />`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
