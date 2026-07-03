import { ClarxLogo } from './clarx-logo'
import {
  CodeExamples,
  PropsTable,
  Section,
  StoryPage,
} from './stories/story-layout'

const meta = {
  title: 'Components/ClarxLogo',
  component: ClarxLogo,
  parameters: {
    docs: { disable: true },
  },
}

export default meta

export const Showcase = {
  render: () => (
    <StoryPage
      title="ClarxLogo"
      description="Dedicated wordmark surface for the Clarx identity. The Storybook component matches the terminal logo gradient used by the Ink CLI as closely as the DOM renderer allows."
    >
      <Section
        title="Variations"
        description="Use the logo mostly on dark surfaces. These examples show the wordmark at the sizes that make sense for CLI-inspired headers and product chrome."
      >
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h3 className="mb-5 text-sm font-semibold text-zinc-100">Sizes</h3>
            <div className="flex w-full flex-col gap-6">
              <ClarxLogo size="sm" />
              <ClarxLogo size="md" />
              <ClarxLogo size="lg" />
            </div>
          </div>
          <div>
            <h3 className="mb-5 text-sm font-semibold text-zinc-100">Header context</h3>
            <div className="flex w-full items-end gap-3">
              <ClarxLogo size="md" />
              <span className="font-mono text-4xl font-semibold tracking-tight text-zinc-50">
                score
              </span>
            </div>
          </div>
        </div>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable
          rows={[
            {
              name: 'size',
              type: "'sm' | 'md' | 'lg'",
              defaultValue: "'md'",
              description: 'Controls the wordmark scale.',
            },
            {
              name: 'className',
              type: 'string',
              description: 'Adds classes on top of the default gradient wordmark.',
            },
          ]}
        />
      </Section>
      <Section title="Code Examples" description="Use the logo directly or compose it into a CLI-like title row.">
        <CodeExamples
          examples={[
            {
              title: 'Wordmark',
              code: `<ClarxLogo size="lg" />`,
            },
            {
              title: 'Score header',
              code: `<div className="flex items-end gap-3">
  <ClarxLogo size="md" />
  <span className="font-mono text-4xl font-semibold text-zinc-50">score</span>
</div>`,
            },
          ]}
        />
      </Section>
    </StoryPage>
  ),
}
