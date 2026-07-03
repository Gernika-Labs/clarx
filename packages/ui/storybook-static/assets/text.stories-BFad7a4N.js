import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-bdul4qPr.js";import{n,r,t as i}from"./jsx-runtime-DjvzIyLE.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./story-layout-BcjpJy5n.js";import{n as f,t as p}from"./dist-BGPkfBdu.js";function m({role:e=`body`,as:t,className:r,children:i,...a}){return(0,h.jsx)(t??_[e],{className:n(g({role:e}),r),...a,children:i})}var h,g,_,v=e((()=>{t(),f(),r(),h=i(),g=p(``,{variants:{role:{heading:`text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50`,body:`text-sm text-zinc-700 dark:text-zinc-300`,label:`text-[11px] font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400`,caption:`text-xs text-zinc-500 dark:text-zinc-400`,muted:`text-sm text-zinc-400 dark:text-zinc-500`,code:`font-mono text-sm text-zinc-800 dark:text-zinc-200`}},defaultVariants:{role:`body`}}),_={heading:`h2`,body:`p`,label:`span`,caption:`span`,muted:`p`,code:`code`},m.__docgenInfo={description:``,methods:[],displayName:`Text`,props:{role:{required:!1,tsType:{name:`union`,raw:`'heading' | 'body' | 'label' | 'caption' | 'muted' | 'code'`,elements:[{name:`literal`,value:`'heading'`},{name:`literal`,value:`'body'`},{name:`literal`,value:`'label'`},{name:`literal`,value:`'caption'`},{name:`literal`,value:`'muted'`},{name:`literal`,value:`'code'`}]},description:``,defaultValue:{value:`'body'`,computed:!1}},as:{required:!1,tsType:{name:`string`},description:``},children:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},className:{required:!1,tsType:{name:`string`},description:``},id:{required:!1,tsType:{name:`string`},description:``},htmlFor:{required:!1,tsType:{name:`string`},description:``}}}})),y,b,x,S;e((()=>{v(),u(),y=i(),b={title:`Components/Text`,component:m,parameters:{docs:{disable:!0}}},x={render:()=>(0,y.jsxs)(a,{title:`Text`,description:`Semantic typography primitive for headings, labels, captions, muted copy, and inline code.`,children:[(0,y.jsx)(o,{title:`Variations`,description:`The role prop is the main styling entry point. Override the tag only when semantics differ from the visual role.`,children:(0,y.jsxs)(c,{children:[(0,y.jsx)(s,{title:`Type roles`,className:`md:col-span-2 xl:col-span-2`,children:(0,y.jsxs)(`div`,{className:`flex w-full flex-col gap-3`,children:[(0,y.jsx)(m,{role:`heading`,children:`Package score summary`}),(0,y.jsx)(m,{role:`body`,children:`This package has strong boundaries and clear operational guidance.`}),(0,y.jsx)(m,{role:`label`,children:`Pillars`}),(0,y.jsx)(m,{role:`caption`,children:`Updated 2 minutes ago`}),(0,y.jsx)(m,{role:`muted`,children:`No additional issues detected.`}),(0,y.jsx)(m,{role:`code`,children:`pnpm --filter @clarxai/ui storybook`})]})}),(0,y.jsx)(s,{title:`Semantic override`,children:(0,y.jsxs)(`div`,{className:`flex w-full flex-col gap-3`,children:[(0,y.jsx)(m,{role:`heading`,as:`h3`,children:`Section title rendered as h3`}),(0,y.jsx)(m,{role:`label`,as:`label`,htmlFor:`workspace-name`,children:`Workspace name`})]})})]})}),(0,y.jsx)(o,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,y.jsx)(l,{rows:[{name:`role`,type:`'heading' | 'body' | 'label' | 'caption' | 'muted' | 'code'`,defaultValue:`'body'`,description:`Selects the typography treatment.`},{name:`as`,type:`string`,description:`Overrides the underlying HTML tag.`},{name:`children`,type:`ReactNode`,description:`Text content.`},{name:`className`,type:`string`,description:`Adds classes on top of the role styles.`},{name:`id`,type:`string`,description:`Passed through to the rendered element.`},{name:`htmlFor`,type:`string`,description:`Useful when rendering as a label.`}]})}),(0,y.jsx)(o,{title:`Code Examples`,description:`Representative typography usage.`,children:(0,y.jsx)(d,{examples:[{title:`Heading`,code:`<Text role="heading">Package score summary</Text>`},{title:`Label`,code:`<Text role="label" as="label" htmlFor="workspace-name">
  Workspace name
</Text>`}]})})]})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="Text" description="Semantic typography primitive for headings, labels, captions, muted copy, and inline code.">
      <Section title="Variations" description="The role prop is the main styling entry point. Override the tag only when semantics differ from the visual role.">
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
        <PropsTable rows={[{
        name: 'role',
        type: "'heading' | 'body' | 'label' | 'caption' | 'muted' | 'code'",
        defaultValue: "'body'",
        description: 'Selects the typography treatment.'
      }, {
        name: 'as',
        type: 'string',
        description: 'Overrides the underlying HTML tag.'
      }, {
        name: 'children',
        type: 'ReactNode',
        description: 'Text content.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds classes on top of the role styles.'
      }, {
        name: 'id',
        type: 'string',
        description: 'Passed through to the rendered element.'
      }, {
        name: 'htmlFor',
        type: 'string',
        description: 'Useful when rendering as a label.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Representative typography usage.">
        <CodeExamples examples={[{
        title: 'Heading',
        code: \`<Text role="heading">Package score summary</Text>\`
      }, {
        title: 'Label',
        code: \`<Text role="label" as="label" htmlFor="workspace-name">
  Workspace name
</Text>\`
      }]} />
      </Section>
    </StoryPage>
}`,...x.parameters?.docs?.source}}},S=[`Showcase`]}))();export{x as Showcase,S as __namedExportsOrder,b as default};