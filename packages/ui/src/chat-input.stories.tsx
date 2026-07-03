import { Badge } from './badge'
import { ChatInput } from './chat-input'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/ChatInput',
  component: ChatInput,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  render: () => (
    <StoryPage
      title="ChatInput"
      description="Multi-line message composer with submit, stop, keyboard shortcuts, and optional action slot."
    >
      <Section
        title="Variations"
        description="The component manages its own draft state. Use the action slot for adjacent status or secondary controls."
      >
        <VariantGrid>
          <PreviewCard title="Default composer" className="md:col-span-2 xl:col-span-1">
            <div className="w-full">
              <ChatInput placeholder="Ask Clarx to review the package boundary..." />
            </div>
          </PreviewCard>
          <PreviewCard title="With actions">
            <div className="w-full">
              <ChatInput
                placeholder="Summarize the highest-risk changes..."
                actions={<Badge keyword="beta" />}
              />
            </div>
          </PreviewCard>
          <PreviewCard title="Streaming and disabled">
            <div className="flex w-full flex-col gap-4">
              <ChatInput
                isStreaming
                placeholder="Generating response..."
                actions={<Badge keyword="streaming" />}
              />
              <ChatInput disabled placeholder="This workspace is read-only." />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'placeholder', type: 'string', defaultValue: "'Message...'", description: 'Textarea placeholder text.' },
            { name: 'onSubmit', type: '(value: string) => void', description: 'Called with trimmed content when the user submits.' },
            { name: 'onStop', type: '() => void', description: 'Called when the trailing button is pressed during streaming mode.' },
            { name: 'isStreaming', type: 'boolean', defaultValue: 'false', description: 'Disables typing and switches the action button to stop mode.' },
            { name: 'disabled', type: 'boolean', defaultValue: 'false', description: 'Disables the entire input shell.' },
            { name: 'actions', type: 'ReactNode', description: 'Optional slot rendered before the submit or stop button.' },
            { name: 'className', type: 'string', description: 'Adds wrapper classes.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Common chat shell configurations.">
        <CodeExamples
          examples={[
            {
              title: 'Default composer',
              code: `<ChatInput
  placeholder="Ask Clarx to review the package boundary..."
  onSubmit={(value) => console.log(value)}
/>`,
            },
            {
              title: 'Streaming composer',
              code: `<ChatInput
  isStreaming
  onStop={() => console.log('stop')}
  actions={<Badge keyword="streaming" />}
/>`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
