import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-DjvzIyLE.js";import{a as n,i as r,r as i,s as a,t as o}from"./story-layout-BcjpJy5n.js";import{n as s,t as c}from"./clarx-logo-BDiiFtu9.js";var l,u,d,f;e((()=>{s(),a(),l=t(),u={title:`Components/ClarxLogo`,component:c,parameters:{docs:{disable:!0}}},d={render:()=>(0,l.jsxs)(n,{title:`ClarxLogo`,description:`Dedicated wordmark surface for the Clarx identity. The Storybook component matches the terminal logo gradient used by the Ink CLI as closely as the DOM renderer allows.`,children:[(0,l.jsx)(r,{title:`Variations`,description:`Use the logo mostly on dark surfaces. These examples show the wordmark at the sizes that make sense for CLI-inspired headers and product chrome.`,children:(0,l.jsxs)(`div`,{className:`grid gap-8 lg:grid-cols-[1.1fr_0.9fr]`,children:[(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`h3`,{className:`mb-5 text-sm font-semibold text-zinc-100`,children:`Sizes`}),(0,l.jsxs)(`div`,{className:`flex w-full flex-col gap-6`,children:[(0,l.jsx)(c,{size:`sm`}),(0,l.jsx)(c,{size:`md`}),(0,l.jsx)(c,{size:`lg`})]})]}),(0,l.jsxs)(`div`,{children:[(0,l.jsx)(`h3`,{className:`mb-5 text-sm font-semibold text-zinc-100`,children:`Header context`}),(0,l.jsxs)(`div`,{className:`flex w-full items-end gap-3`,children:[(0,l.jsx)(c,{size:`md`}),(0,l.jsx)(`span`,{className:`font-mono text-4xl font-semibold tracking-tight text-zinc-50`,children:`score`})]})]})]})}),(0,l.jsx)(r,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,l.jsx)(i,{rows:[{name:`size`,type:`'sm' | 'md' | 'lg'`,defaultValue:`'md'`,description:`Controls the wordmark scale.`},{name:`className`,type:`string`,description:`Adds classes on top of the default gradient wordmark.`}]})}),(0,l.jsx)(r,{title:`Code Examples`,description:`Use the logo directly or compose it into a CLI-like title row.`,children:(0,l.jsx)(o,{examples:[{title:`Wordmark`,code:`<ClarxLogo size="lg" />`},{title:`Score header`,code:`<div className="flex items-end gap-3">
  <ClarxLogo size="md" />
  <span className="font-mono text-4xl font-semibold text-zinc-50">score</span>
</div>`}]})})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="ClarxLogo" description="Dedicated wordmark surface for the Clarx identity. The Storybook component matches the terminal logo gradient used by the Ink CLI as closely as the DOM renderer allows.">
      <Section title="Variations" description="Use the logo mostly on dark surfaces. These examples show the wordmark at the sizes that make sense for CLI-inspired headers and product chrome.">
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
        <PropsTable rows={[{
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        defaultValue: "'md'",
        description: 'Controls the wordmark scale.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds classes on top of the default gradient wordmark.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Use the logo directly or compose it into a CLI-like title row.">
        <CodeExamples examples={[{
        title: 'Wordmark',
        code: \`<ClarxLogo size="lg" />\`
      }, {
        title: 'Score header',
        code: \`<div className="flex items-end gap-3">
  <ClarxLogo size="md" />
  <span className="font-mono text-4xl font-semibold text-zinc-50">score</span>
</div>\`
      }]} />
      </Section>
    </StoryPage>
}`,...d.parameters?.docs?.source}}},f=[`Showcase`]}))();export{d as Showcase,f as __namedExportsOrder,u as default};