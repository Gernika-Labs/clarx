import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./iframe-bdul4qPr.js";import{n as r,r as i,t as a}from"./jsx-runtime-DjvzIyLE.js";import{a as o,i as s,n as c,o as l,r as u,s as d,t as f}from"./story-layout-BcjpJy5n.js";import{n as p,t as m}from"./dist-BGPkfBdu.js";var h,g,_,v,y=e((()=>{h=t(n()),p(),i(),g=a(),_=m(`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50`,{variants:{intent:{neutral:``,brand:``,danger:``,success:``},appearance:{solid:``,soft:``,ghost:``,outline:``},size:{sm:`h-8 px-3 text-xs`,md:`h-9 px-4 text-sm`,lg:`h-11 px-6 text-base`}},compoundVariants:[{intent:`neutral`,appearance:`solid`,className:`bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200`},{intent:`neutral`,appearance:`soft`,className:`bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`},{intent:`neutral`,appearance:`ghost`,className:`text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800`},{intent:`neutral`,appearance:`outline`,className:`border border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800`},{intent:`brand`,appearance:`solid`,className:`bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600`},{intent:`brand`,appearance:`soft`,className:`bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900`},{intent:`brand`,appearance:`ghost`,className:`text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950`},{intent:`brand`,appearance:`outline`,className:`border border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950`},{intent:`danger`,appearance:`solid`,className:`bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600`},{intent:`danger`,appearance:`soft`,className:`bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900`},{intent:`danger`,appearance:`ghost`,className:`text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950`},{intent:`danger`,appearance:`outline`,className:`border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950`},{intent:`success`,appearance:`solid`,className:`bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600`},{intent:`success`,appearance:`soft`,className:`bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950 dark:text-green-300 dark:hover:bg-green-900`},{intent:`success`,appearance:`ghost`,className:`text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-950`},{intent:`success`,appearance:`outline`,className:`border border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-950`}],defaultVariants:{intent:`neutral`,appearance:`solid`,size:`md`}}),v=h.forwardRef(({className:e,intent:t,appearance:n,size:i,...a},o)=>(0,g.jsx)(`button`,{ref:o,className:r(_({intent:t,appearance:n,size:i}),e),...a})),v.displayName=`Button`,v.__docgenInfo={description:``,methods:[],displayName:`Button`}})),b,x,S,C;e((()=>{y(),d(),b=a(),x={title:`Components/Button`,component:v,parameters:{docs:{disable:!0}}},S={render:()=>(0,b.jsxs)(o,{title:`Button`,description:`Primary action component with semantic intent, multiple visual treatments, and three sizes.`,children:[(0,b.jsx)(s,{title:`Variations`,description:`The main API surface is intent plus appearance. Sizes should mostly follow information density, not emphasis.`,children:(0,b.jsxs)(l,{children:[(0,b.jsx)(c,{title:`Appearances`,children:(0,b.jsxs)(`div`,{className:`flex flex-wrap gap-3`,children:[(0,b.jsx)(v,{children:`Neutral solid`}),(0,b.jsx)(v,{appearance:`soft`,children:`Neutral soft`}),(0,b.jsx)(v,{appearance:`ghost`,children:`Neutral ghost`}),(0,b.jsx)(v,{appearance:`outline`,children:`Neutral outline`})]})}),(0,b.jsx)(c,{title:`Intents`,children:(0,b.jsxs)(`div`,{className:`flex flex-wrap gap-3`,children:[(0,b.jsx)(v,{intent:`brand`,children:`Brand`}),(0,b.jsx)(v,{intent:`success`,children:`Success`}),(0,b.jsx)(v,{intent:`danger`,children:`Danger`})]})}),(0,b.jsx)(c,{title:`Sizes and disabled`,children:(0,b.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3`,children:[(0,b.jsx)(v,{size:`sm`,children:`Small`}),(0,b.jsx)(v,{size:`md`,children:`Medium`}),(0,b.jsx)(v,{size:`lg`,children:`Large`}),(0,b.jsx)(v,{disabled:!0,children:`Disabled`})]})})]})}),(0,b.jsx)(s,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,b.jsx)(u,{rows:[{name:`intent`,type:`'neutral' | 'brand' | 'danger' | 'success'`,defaultValue:`'neutral'`,description:`Selects semantic color treatment.`},{name:`appearance`,type:`'solid' | 'soft' | 'ghost' | 'outline'`,defaultValue:`'solid'`,description:`Controls visual emphasis.`},{name:`size`,type:`'sm' | 'md' | 'lg'`,defaultValue:`'md'`,description:`Changes height, padding, and font size.`},{name:`children`,type:`ReactNode`,description:`Button label or custom content.`},{name:`className`,type:`string`,description:`Adds wrapper classes.`},{name:`...buttonProps`,type:`ButtonHTMLAttributes<HTMLButtonElement>`,description:`Supports the standard native button API.`}]})}),(0,b.jsx)(s,{title:`Code Examples`,description:`Representative action patterns.`,children:(0,b.jsx)(f,{examples:[{title:`Primary action`,code:`<Button intent="brand">Run analysis</Button>`},{title:`Low-emphasis action`,code:`<Button appearance="ghost">Dismiss</Button>`}]})})]})},S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="Button" description="Primary action component with semantic intent, multiple visual treatments, and three sizes.">
      <Section title="Variations" description="The main API surface is intent plus appearance. Sizes should mostly follow information density, not emphasis.">
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
        <PropsTable rows={[{
        name: 'intent',
        type: "'neutral' | 'brand' | 'danger' | 'success'",
        defaultValue: "'neutral'",
        description: 'Selects semantic color treatment.'
      }, {
        name: 'appearance',
        type: "'solid' | 'soft' | 'ghost' | 'outline'",
        defaultValue: "'solid'",
        description: 'Controls visual emphasis.'
      }, {
        name: 'size',
        type: "'sm' | 'md' | 'lg'",
        defaultValue: "'md'",
        description: 'Changes height, padding, and font size.'
      }, {
        name: 'children',
        type: 'ReactNode',
        description: 'Button label or custom content.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds wrapper classes.'
      }, {
        name: '...buttonProps',
        type: 'ButtonHTMLAttributes<HTMLButtonElement>',
        description: 'Supports the standard native button API.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Representative action patterns.">
        <CodeExamples examples={[{
        title: 'Primary action',
        code: \`<Button intent="brand">Run analysis</Button>\`
      }, {
        title: 'Low-emphasis action',
        code: \`<Button appearance="ghost">Dismiss</Button>\`
      }]} />
      </Section>
    </StoryPage>
}`,...S.parameters?.docs?.source}}},C=[`Showcase`]}))();export{S as Showcase,C as __namedExportsOrder,x as default};