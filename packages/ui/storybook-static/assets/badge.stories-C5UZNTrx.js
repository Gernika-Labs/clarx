import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-DjvzIyLE.js";import{a as n,i as r,n as i,o as a,r as o,s,t as c}from"./story-layout-BcjpJy5n.js";import{n as l,t as u}from"./badge-DjHvVtbj.js";var d,f,p,m;e((()=>{l(),s(),d=t(),f={title:`Components/Badge`,component:u,parameters:{docs:{disable:!0}}},p={render:()=>(0,d.jsxs)(n,{title:`Badge`,description:`Compact status chip for lifecycle states, severities, tool activity, and small inline annotations.`,children:[(0,d.jsx)(r,{title:`Variations`,description:`Use keyword presets for common semantics, or set visual props directly for bespoke labels.`,children:(0,d.jsxs)(a,{children:[(0,d.jsx)(i,{title:`Keyword presets`,children:(0,d.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,d.jsx)(u,{keyword:`ready`}),(0,d.jsx)(u,{keyword:`running`}),(0,d.jsx)(u,{keyword:`pending`}),(0,d.jsx)(u,{keyword:`failed`}),(0,d.jsx)(u,{keyword:`critical`})]})}),(0,d.jsx)(i,{title:`Direct styling`,children:(0,d.jsxs)(`div`,{className:`flex flex-wrap gap-2`,children:[(0,d.jsx)(u,{intent:`brand`,appearance:`soft`,dot:`pulse`,label:`Streaming`}),(0,d.jsx)(u,{intent:`info`,appearance:`solid`,label:`Preview`}),(0,d.jsx)(u,{intent:`success`,appearance:`soft`,size:`sm`,children:`Healthy`})]})})]})}),(0,d.jsx)(r,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,d.jsx)(o,{rows:[{name:`keyword`,type:`BadgeKeyword`,description:`Maps to a predefined label, intent, appearance, and optional dot.`},{name:`intent`,type:`Intent`,defaultValue:`'neutral'`,description:`Overrides semantic color selection.`},{name:`appearance`,type:`'soft' | 'solid'`,defaultValue:`'soft'`,description:`Chooses contextual or filled treatment.`},{name:`dot`,type:`false | 'static' | 'pulse'`,defaultValue:`keyword-specific`,description:`Controls optional leading dot visibility and animation.`},{name:`size`,type:`'sm' | 'md'`,defaultValue:`'md'`,description:`Adjusts chip density.`},{name:`label`,type:`string`,description:`Overrides the preset text.`},{name:`children`,type:`ReactNode`,description:`Alternative slot for custom badge content.`},{name:`className`,type:`string`,description:`Adds wrapper classes.`}]})}),(0,d.jsx)(r,{title:`Code Examples`,description:`Common composition styles.`,children:(0,d.jsx)(c,{examples:[{title:`Keyword shortcut`,code:`<Badge keyword="running" />`},{title:`Custom badge`,code:`<Badge intent="brand" appearance="soft" dot="pulse" label="Streaming" />`}]})})]})},p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="Badge" description="Compact status chip for lifecycle states, severities, tool activity, and small inline annotations.">
      <Section title="Variations" description="Use keyword presets for common semantics, or set visual props directly for bespoke labels.">
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
        <PropsTable rows={[{
        name: 'keyword',
        type: 'BadgeKeyword',
        description: 'Maps to a predefined label, intent, appearance, and optional dot.'
      }, {
        name: 'intent',
        type: 'Intent',
        defaultValue: "'neutral'",
        description: 'Overrides semantic color selection.'
      }, {
        name: 'appearance',
        type: "'soft' | 'solid'",
        defaultValue: "'soft'",
        description: 'Chooses contextual or filled treatment.'
      }, {
        name: 'dot',
        type: "false | 'static' | 'pulse'",
        defaultValue: 'keyword-specific',
        description: 'Controls optional leading dot visibility and animation.'
      }, {
        name: 'size',
        type: "'sm' | 'md'",
        defaultValue: "'md'",
        description: 'Adjusts chip density.'
      }, {
        name: 'label',
        type: 'string',
        description: 'Overrides the preset text.'
      }, {
        name: 'children',
        type: 'ReactNode',
        description: 'Alternative slot for custom badge content.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Common composition styles.">
        <CodeExamples examples={[{
        title: 'Keyword shortcut',
        code: \`<Badge keyword="running" />\`
      }, {
        title: 'Custom badge',
        code: \`<Badge intent="brand" appearance="soft" dot="pulse" label="Streaming" />\`
      }]} />
      </Section>
    </StoryPage>
}`,...p.parameters?.docs?.source}}},m=[`Showcase`]}))();export{p as Showcase,m as __namedExportsOrder,f as default};