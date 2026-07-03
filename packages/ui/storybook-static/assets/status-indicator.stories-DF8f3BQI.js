import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-bdul4qPr.js";import{n,r,t as i}from"./jsx-runtime-DjvzIyLE.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./story-layout-BcjpJy5n.js";function f({state:e=`idle`,size:t=`md`,label:r,className:i}){let a=t===`sm`?`size-1.5`:`size-2`;return(0,p.jsxs)(`span`,{className:n(`inline-flex items-center gap-1.5`,i),children:[(0,p.jsx)(`span`,{className:n(`shrink-0 rounded-full`,a,m[e])}),r&&(0,p.jsx)(`span`,{className:`text-xs text-zinc-600 dark:text-zinc-400`,children:r})]})}var p,m,h=e((()=>{t(),r(),p=i(),m={active:`bg-blue-500 animate-pulse`,pending:`bg-zinc-400 animate-pulse`,idle:`bg-zinc-300 dark:bg-zinc-600`,success:`bg-green-500`,warning:`bg-amber-500`,error:`bg-red-500`},f.__docgenInfo={description:``,methods:[],displayName:`StatusIndicator`,props:{state:{required:!1,tsType:{name:`union`,raw:`'active' | 'idle' | 'success' | 'warning' | 'error' | 'pending'`,elements:[{name:`literal`,value:`'active'`},{name:`literal`,value:`'idle'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'warning'`},{name:`literal`,value:`'error'`},{name:`literal`,value:`'pending'`}]},description:``,defaultValue:{value:`'idle'`,computed:!1}},size:{required:!1,tsType:{name:`union`,raw:`'sm' | 'md'`,elements:[{name:`literal`,value:`'sm'`},{name:`literal`,value:`'md'`}]},description:``,defaultValue:{value:`'md'`,computed:!1}},label:{required:!1,tsType:{name:`string`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),g,_,v,y;e((()=>{h(),u(),g=i(),_={title:`Components/StatusIndicator`,component:f,parameters:{docs:{disable:!0}}},v={render:()=>(0,g.jsxs)(a,{title:`StatusIndicator`,description:`Minimal dot indicator for compact lists, background job rows, and tool execution metadata.`,children:[(0,g.jsx)(o,{title:`Variations`,description:`Use the bare dot in dense layouts or add a label when the status needs explicit copy.`,children:(0,g.jsxs)(c,{children:[(0,g.jsx)(s,{title:`States with labels`,children:(0,g.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,g.jsx)(f,{state:`active`,label:`Active`}),(0,g.jsx)(f,{state:`pending`,label:`Pending`}),(0,g.jsx)(f,{state:`success`,label:`Success`}),(0,g.jsx)(f,{state:`warning`,label:`Warning`}),(0,g.jsx)(f,{state:`error`,label:`Error`})]})}),(0,g.jsx)(s,{title:`Compact sizes`,children:(0,g.jsxs)(`div`,{className:`flex flex-wrap items-center gap-4`,children:[(0,g.jsx)(f,{state:`idle`,size:`sm`}),(0,g.jsx)(f,{state:`active`,size:`sm`}),(0,g.jsx)(f,{state:`success`,size:`md`})]})})]})}),(0,g.jsx)(o,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,g.jsx)(l,{rows:[{name:`state`,type:`'active' | 'idle' | 'success' | 'warning' | 'error' | 'pending'`,defaultValue:`'idle'`,description:`Controls the dot color and pulse animation.`},{name:`size`,type:`'sm' | 'md'`,defaultValue:`'md'`,description:`Adjusts the size of the dot.`},{name:`label`,type:`string`,description:`Optional small caption to the right of the dot.`},{name:`className`,type:`string`,description:`Adds wrapper classes.`}]})}),(0,g.jsx)(o,{title:`Code Examples`,description:`Typical compact usage.`,children:(0,g.jsx)(d,{examples:[{title:`Labeled status`,code:`<StatusIndicator state="active" label="Watching files" />`},{title:`Dot only`,code:`<StatusIndicator state="success" size="sm" />`}]})})]})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="StatusIndicator" description="Minimal dot indicator for compact lists, background job rows, and tool execution metadata.">
      <Section title="Variations" description="Use the bare dot in dense layouts or add a label when the status needs explicit copy.">
        <VariantGrid>
          <PreviewCard title="States with labels">
            <div className="flex flex-col gap-3">
              <StatusIndicator state="active" label="Active" />
              <StatusIndicator state="pending" label="Pending" />
              <StatusIndicator state="success" label="Success" />
              <StatusIndicator state="warning" label="Warning" />
              <StatusIndicator state="error" label="Error" />
            </div>
          </PreviewCard>
          <PreviewCard title="Compact sizes">
            <div className="flex flex-wrap items-center gap-4">
              <StatusIndicator state="idle" size="sm" />
              <StatusIndicator state="active" size="sm" />
              <StatusIndicator state="success" size="md" />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable rows={[{
        name: 'state',
        type: "'active' | 'idle' | 'success' | 'warning' | 'error' | 'pending'",
        defaultValue: "'idle'",
        description: 'Controls the dot color and pulse animation.'
      }, {
        name: 'size',
        type: "'sm' | 'md'",
        defaultValue: "'md'",
        description: 'Adjusts the size of the dot.'
      }, {
        name: 'label',
        type: 'string',
        description: 'Optional small caption to the right of the dot.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Typical compact usage.">
        <CodeExamples examples={[{
        title: 'Labeled status',
        code: \`<StatusIndicator state="active" label="Watching files" />\`
      }, {
        title: 'Dot only',
        code: \`<StatusIndicator state="success" size="sm" />\`
      }]} />
      </Section>
    </StoryPage>
}`,...v.parameters?.docs?.source}}},y=[`Showcase`]}))();export{v as Showcase,y as __namedExportsOrder,_ as default};