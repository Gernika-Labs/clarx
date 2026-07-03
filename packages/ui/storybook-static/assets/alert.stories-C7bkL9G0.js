import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-bdul4qPr.js";import{n,r,t as i}from"./jsx-runtime-DjvzIyLE.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./story-layout-BcjpJy5n.js";import{n as f,t as p}from"./dist-BGPkfBdu.js";function m({intent:e=`neutral`,appearance:t=`soft`,title:r,children:i,className:a}){return(0,h.jsxs)(`div`,{role:`alert`,"data-intent":e,"data-appearance":t,className:n(g({intent:e,appearance:t}),a),children:[r&&(0,h.jsx)(`p`,{className:`mb-1 text-sm font-semibold`,children:r}),i&&(0,h.jsx)(`div`,{className:`text-sm`,children:i})]})}var h,g,_=e((()=>{t(),f(),r(),h=i(),g=p(`rounded-xl border p-4`,{variants:{intent:{success:``,warning:``,danger:``,neutral:``,info:``,brand:``},appearance:{soft:``,solid:``}},compoundVariants:[{intent:`success`,appearance:`soft`,className:`border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-300`},{intent:`warning`,appearance:`soft`,className:`border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300`},{intent:`danger`,appearance:`soft`,className:`border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-300`},{intent:`neutral`,appearance:`soft`,className:`border-zinc-200 bg-zinc-50 text-zinc-800 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300`},{intent:`info`,appearance:`soft`,className:`border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300`},{intent:`brand`,appearance:`soft`,className:`border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300`},{intent:`success`,appearance:`solid`,className:`border-transparent bg-green-600 text-white dark:bg-green-500`},{intent:`warning`,appearance:`solid`,className:`border-transparent bg-amber-500 text-white dark:bg-amber-400 dark:text-amber-900`},{intent:`danger`,appearance:`solid`,className:`border-transparent bg-red-600 text-white dark:bg-red-500`},{intent:`neutral`,appearance:`solid`,className:`border-transparent bg-zinc-800 text-white dark:bg-zinc-700`},{intent:`info`,appearance:`solid`,className:`border-transparent bg-sky-600 text-white dark:bg-sky-500`},{intent:`brand`,appearance:`solid`,className:`border-transparent bg-blue-600 text-white dark:bg-blue-500`}],defaultVariants:{intent:`neutral`,appearance:`soft`}}),m.__docgenInfo={description:``,methods:[],displayName:`Alert`,props:{intent:{required:!1,tsType:{name:`unknown[number]`,raw:`(typeof INTENT)[number]`},description:``,defaultValue:{value:`'neutral'`,computed:!1}},appearance:{required:!1,tsType:{name:`union`,raw:`'soft' | 'solid'`,elements:[{name:`literal`,value:`'soft'`},{name:`literal`,value:`'solid'`}]},description:``,defaultValue:{value:`'soft'`,computed:!1}},title:{required:!1,tsType:{name:`string`},description:``},children:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),v,y,b,x;e((()=>{_(),u(),v=i(),y={title:`Components/Alert`,component:m,parameters:{docs:{disable:!0}}},b={render:()=>(0,v.jsxs)(a,{title:`Alert`,description:`Prominent message block for validation feedback, success confirmations, and workflow warnings.`,children:[(0,v.jsx)(o,{title:`Variations`,description:`Use soft appearance for contextual status and solid appearance for higher visual urgency.`,children:(0,v.jsxs)(c,{children:[(0,v.jsx)(s,{title:`Soft intents`,children:(0,v.jsxs)(`div`,{className:`flex w-full flex-col gap-3`,children:[(0,v.jsx)(m,{intent:`success`,title:`Sync complete`,children:`The latest scan has been stored.`}),(0,v.jsx)(m,{intent:`warning`,title:`Review before merge`,children:`Two recommendations still need attention.`}),(0,v.jsx)(m,{intent:`danger`,title:`Deployment blocked`,children:`A hard failure is preventing release.`})]})}),(0,v.jsx)(s,{title:`Solid intents`,children:(0,v.jsxs)(`div`,{className:`flex w-full flex-col gap-3`,children:[(0,v.jsx)(m,{intent:`brand`,appearance:`solid`,title:`Workspace update`,children:`A new analysis is available.`}),(0,v.jsx)(m,{intent:`info`,appearance:`solid`,title:`Heads up`,children:`This package is being rescanned.`})]})})]})}),(0,v.jsx)(o,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,v.jsx)(l,{rows:[{name:`intent`,type:`Intent`,defaultValue:`'neutral'`,description:`Selects semantic color treatment.`},{name:`appearance`,type:`'soft' | 'solid'`,defaultValue:`'soft'`,description:`Controls whether the alert feels contextual or emphatic.`},{name:`title`,type:`string`,description:`Optional headline rendered above the body.`},{name:`children`,type:`ReactNode`,description:`Body content for the alert.`},{name:`className`,type:`string`,description:`Adds outer wrapper classes.`}]})}),(0,v.jsx)(o,{title:`Code Examples`,description:`Representative usage patterns.`,children:(0,v.jsx)(d,{examples:[{title:`Soft alert`,code:`<Alert intent="warning" title="Review before merge">
  Two recommendations still need attention.
</Alert>`},{title:`Solid alert`,code:`<Alert intent="brand" appearance="solid" title="Workspace update">
  A new analysis is available.
</Alert>`}]})})]})},b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="Alert" description="Prominent message block for validation feedback, success confirmations, and workflow warnings.">
      <Section title="Variations" description="Use soft appearance for contextual status and solid appearance for higher visual urgency.">
        <VariantGrid>
          <PreviewCard title="Soft intents">
            <div className="flex w-full flex-col gap-3">
              <Alert intent="success" title="Sync complete">The latest scan has been stored.</Alert>
              <Alert intent="warning" title="Review before merge">Two recommendations still need attention.</Alert>
              <Alert intent="danger" title="Deployment blocked">A hard failure is preventing release.</Alert>
            </div>
          </PreviewCard>
          <PreviewCard title="Solid intents">
            <div className="flex w-full flex-col gap-3">
              <Alert intent="brand" appearance="solid" title="Workspace update">A new analysis is available.</Alert>
              <Alert intent="info" appearance="solid" title="Heads up">This package is being rescanned.</Alert>
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable rows={[{
        name: 'intent',
        type: 'Intent',
        defaultValue: "'neutral'",
        description: 'Selects semantic color treatment.'
      }, {
        name: 'appearance',
        type: "'soft' | 'solid'",
        defaultValue: "'soft'",
        description: 'Controls whether the alert feels contextual or emphatic.'
      }, {
        name: 'title',
        type: 'string',
        description: 'Optional headline rendered above the body.'
      }, {
        name: 'children',
        type: 'ReactNode',
        description: 'Body content for the alert.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds outer wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Representative usage patterns.">
        <CodeExamples examples={[{
        title: 'Soft alert',
        code: \`<Alert intent="warning" title="Review before merge">
  Two recommendations still need attention.
</Alert>\`
      }, {
        title: 'Solid alert',
        code: \`<Alert intent="brand" appearance="solid" title="Workspace update">
  A new analysis is available.
</Alert>\`
      }]} />
      </Section>
    </StoryPage>
}`,...b.parameters?.docs?.source}}},x=[`Showcase`]}))();export{b as Showcase,x as __namedExportsOrder,y as default};