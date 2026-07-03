import { Badge } from './badge'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/Badge',
  component: Badge,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  render: () => (
    <StoryPage
      title="Badge"
      description="Compact status chip for lifecycle states, severities, tool activity, and small inline annotations."
    >
      <Section
        title="Variations"
        description="Use keyword presets for common semantics, or set visual props directly for bespoke labels."
      >
        <VariantGrid>
          <PreviewCard title="Keyword presets">
            <div className="flex flex-wrap gap-2">
              <Badge keyword="ready" />
              <Badge keyword="running" />
              <Badge keyword="pending" />
              <Badge keyword="failed" />
              <Badge keyword="critical" />
            </div>
          </PreviewCard>
          <PreviewCard title="Direct styling">
            <div className="flex flex-wrap gap-2">
              <Badge intent="brand" appearance="soft" dot="pulse" label="Streaming" />
              <Badge intent="info" appearance="solid" label="Preview" />
              <Badge intent="success" appearance="soft" size="sm">Healthy</Badge>
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'keyword', type: 'BadgeKeyword', description: 'Maps to a predefined label, intent, appearance, and optional dot.' },
            { name: 'intent', type: 'Intent', defaultValue: "'neutral'", description: 'Overrides semantic color selection.' },
            { name: 'appearance', type: "'soft' | 'solid'", defaultValue: "'soft'", description: 'Chooses contextual or filled treatment.' },
            { name: 'dot', type: "false | 'static' | 'pulse'", defaultValue: 'keyword-specific', description: 'Controls optional leading dot visibility and animation.' },
            { name: 'size', type: "'sm' | 'md'", defaultValue: "'md'", description: 'Adjusts chip density.' },
            { name: 'label', type: 'string', description: 'Overrides the preset text.' },
            { name: 'children', type: 'ReactNode', description: 'Alternative slot for custom badge content.' },
            { name: 'className', type: 'string', description: 'Adds wrapper classes.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Common composition styles.">
        <CodeExamples
          examples={[
            {
              title: 'Keyword shortcut',
              code: `<Badge keyword="running" />`,
            },
            {
              title: 'Custom badge',
              code: `<Badge intent="brand" appearance="soft" dot="pulse" label="Streaming" />`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
