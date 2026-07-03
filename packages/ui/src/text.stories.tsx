import { Text } from './text'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/Text',
  component: Text,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  render: () => (
    <StoryPage
      title="Text"
      description="Semantic typography primitive for headings, labels, captions, muted copy, and inline code."
    >
      <Section
        title="Variations"
        description="The role prop is the main styling entry point. Override the tag only when semantics differ from the visual role."
      >
        <VariantGrid>
          <PreviewCard title="Type roles" className="md:col-span-2 xl:col-span-2">
            <div className="flex w-full flex-col gap-3">
              <Text role="heading">Package score summary</Text>
              <Text role="body">This package has strong boundaries and clear operational guidance.</Text>
              <Text role="label">Pillars</Text>
              <Text role="caption">Updated 2 minutes ago</Text>
              <Text role="muted">No additional issues detected.</Text>
              <Text role="code">pnpm --filter @clarxai/ui storybook</Text>
            </div>
          </PreviewCard>
          <PreviewCard title="Semantic override">
            <div className="flex w-full flex-col gap-3">
              <Text role="heading" as="h3">Section title rendered as h3</Text>
              <Text role="label" as="label" htmlFor="workspace-name">Workspace name</Text>
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'role', type: "'heading' | 'body' | 'label' | 'caption' | 'muted' | 'code'", defaultValue: "'body'", description: 'Selects the typography treatment.' },
            { name: 'as', type: 'string', description: 'Overrides the underlying HTML tag.' },
            { name: 'children', type: 'ReactNode', description: 'Text content.' },
            { name: 'className', type: 'string', description: 'Adds classes on top of the role styles.' },
            { name: 'id', type: 'string', description: 'Passed through to the rendered element.' },
            { name: 'htmlFor', type: 'string', description: 'Useful when rendering as a label.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Representative typography usage.">
        <CodeExamples
          examples={[
            {
              title: 'Heading',
              code: `<Text role="heading">Package score summary</Text>`,
            },
            {
              title: 'Label',
              code: `<Text role="label" as="label" htmlFor="workspace-name">
  Workspace name
</Text>`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
