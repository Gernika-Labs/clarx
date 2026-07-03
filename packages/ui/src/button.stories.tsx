import { Button } from './button'
import {
  CodeExamples,
  PreviewCard,
  PropsTable,
  Section,
  StoryPage,
  VariantGrid,
} from './stories/story-layout'

const meta = {
  title: 'Components/Button',
  component: Button,
  parameters: {
    docs: { disable: true },
  },
}

export default meta
export const Showcase = {
  render: () => (
    <StoryPage
      title="Button"
      description="Primary action component with semantic intent, multiple visual treatments, and three sizes."
    >
      <Section
        title="Variations"
        description="The main API surface is intent plus appearance. Sizes should mostly follow information density, not emphasis."
      >
        <VariantGrid>
          <PreviewCard title="Appearances">
            <div className="flex flex-wrap gap-3">
              <Button>Neutral solid</Button>
              <Button appearance="soft">Neutral soft</Button>
              <Button appearance="ghost">Neutral ghost</Button>
              <Button appearance="outline">Neutral outline</Button>
            </div>
          </PreviewCard>
          <PreviewCard title="Intents">
            <div className="flex flex-wrap gap-3">
              <Button intent="brand">Brand</Button>
              <Button intent="success">Success</Button>
              <Button intent="danger">Danger</Button>
            </div>
          </PreviewCard>
          <PreviewCard title="Sizes and disabled">
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button disabled>Disabled</Button>
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            { name: 'intent', type: "'neutral' | 'brand' | 'danger' | 'success'", defaultValue: "'neutral'", description: 'Selects semantic color treatment.' },
            { name: 'appearance', type: "'solid' | 'soft' | 'ghost' | 'outline'", defaultValue: "'solid'", description: 'Controls visual emphasis.' },
            { name: 'size', type: "'sm' | 'md' | 'lg'", defaultValue: "'md'", description: 'Changes height, padding, and font size.' },
            { name: 'children', type: 'ReactNode', description: 'Button label or custom content.' },
            { name: 'className', type: 'string', description: 'Adds wrapper classes.' },
            { name: '...buttonProps', type: 'ButtonHTMLAttributes<HTMLButtonElement>', description: 'Supports the standard native button API.' },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Representative action patterns.">
        <CodeExamples
          examples={[
            {
              title: 'Primary action',
              code: `<Button intent="brand">Run analysis</Button>`,
            },
            {
              title: 'Low-emphasis action',
              code: `<Button appearance="ghost">Dismiss</Button>`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
