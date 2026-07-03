import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-bdul4qPr.js";import{n,r,t as i}from"./jsx-runtime-DjvzIyLE.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./story-layout-BcjpJy5n.js";function f({state:e,label:t,className:r}){let i=m[e],a=t??i.defaultLabel;return(0,p.jsxs)(`div`,{className:n(`inline-flex items-center gap-2 text-sm font-medium`,i.textColor,r),children:[i.dotColor&&(0,p.jsx)(`span`,{className:n(`h-2 w-2 rounded-full`,i.dotColor,i.pulse&&`animate-pulse`)}),a]})}var p,m,h=e((()=>{t(),r(),p=i(),m={idle:{textColor:`text-zinc-400 dark:text-zinc-500`,defaultLabel:`Idle`},thinking:{dotColor:`bg-zinc-400`,pulse:!0,textColor:`text-zinc-600 dark:text-zinc-300`,defaultLabel:`Thinking...`},"using-tool":{dotColor:`bg-blue-500`,pulse:!0,textColor:`text-blue-600 dark:text-blue-400`,defaultLabel:`Using tool...`},responding:{dotColor:`bg-violet-500`,pulse:!0,textColor:`text-violet-600 dark:text-violet-400`,defaultLabel:`Responding...`},done:{dotColor:`bg-green-500`,pulse:!1,textColor:`text-green-600 dark:text-green-400`,defaultLabel:`Done`},error:{dotColor:`bg-red-500`,pulse:!1,textColor:`text-red-600 dark:text-red-400`,defaultLabel:`Error`}},f.__docgenInfo={description:``,methods:[],displayName:`AgentStatus`,props:{state:{required:!0,tsType:{name:`union`,raw:`'idle' | 'thinking' | 'using-tool' | 'responding' | 'done' | 'error'`,elements:[{name:`literal`,value:`'idle'`},{name:`literal`,value:`'thinking'`},{name:`literal`,value:`'using-tool'`},{name:`literal`,value:`'responding'`},{name:`literal`,value:`'done'`},{name:`literal`,value:`'error'`}]},description:``},label:{required:!1,tsType:{name:`string`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),g,_,v,y;e((()=>{h(),u(),g=i(),_={title:`Components/AgentStatus`,component:f,parameters:{docs:{disable:!0}}},v={args:{state:`idle`},render:()=>(0,g.jsxs)(a,{title:`AgentStatus`,description:`Lightweight agent lifecycle status for chat surfaces, tool execution rows, and inline response states.`,children:[(0,g.jsx)(o,{title:`Variations`,description:`State coverage includes passive, active, success, and failure states. Override the label when the surrounding product language needs a more explicit description.`,children:(0,g.jsxs)(c,{children:[(0,g.jsx)(s,{title:`Default states`,note:`The component carries its own default labels.`,children:(0,g.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,g.jsx)(f,{state:`idle`}),(0,g.jsx)(f,{state:`thinking`}),(0,g.jsx)(f,{state:`using-tool`}),(0,g.jsx)(f,{state:`responding`}),(0,g.jsx)(f,{state:`done`}),(0,g.jsx)(f,{state:`error`})]})}),(0,g.jsx)(s,{title:`Custom labels`,note:`Useful when the product vocabulary is domain-specific.`,children:(0,g.jsxs)(`div`,{className:`flex flex-col gap-3`,children:[(0,g.jsx)(f,{state:`thinking`,label:`Analyzing repository`}),(0,g.jsx)(f,{state:`using-tool`,label:`Fetching workspace context`}),(0,g.jsx)(f,{state:`responding`,label:`Drafting recommendation`})]})})]})}),(0,g.jsx)(o,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,g.jsx)(l,{rows:[{name:`state`,type:`'idle' | 'thinking' | 'using-tool' | 'responding' | 'done' | 'error'`,description:`Selects dot behavior, label color, and default copy.`},{name:`label`,type:`string`,defaultValue:`state-specific`,description:`Overrides the default state label.`},{name:`className`,type:`string`,description:`Adds outer wrapper classes.`}]})}),(0,g.jsx)(o,{title:`Code Examples`,description:`Typical inline usage patterns.`,children:(0,g.jsx)(d,{examples:[{title:`Basic state`,code:`<AgentStatus state="thinking" />`},{title:`Custom label`,code:`<AgentStatus state="using-tool" label="Calling GitHub" />`}]})})]})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    state: 'idle'
  },
  render: () => <StoryPage title="AgentStatus" description="Lightweight agent lifecycle status for chat surfaces, tool execution rows, and inline response states.">
      <Section title="Variations" description="State coverage includes passive, active, success, and failure states. Override the label when the surrounding product language needs a more explicit description.">
        <VariantGrid>
          <PreviewCard title="Default states" note="The component carries its own default labels.">
            <div className="flex flex-col gap-3">
              <AgentStatus state="idle" />
              <AgentStatus state="thinking" />
              <AgentStatus state="using-tool" />
              <AgentStatus state="responding" />
              <AgentStatus state="done" />
              <AgentStatus state="error" />
            </div>
          </PreviewCard>
          <PreviewCard title="Custom labels" note="Useful when the product vocabulary is domain-specific.">
            <div className="flex flex-col gap-3">
              <AgentStatus state="thinking" label="Analyzing repository" />
              <AgentStatus state="using-tool" label="Fetching workspace context" />
              <AgentStatus state="responding" label="Drafting recommendation" />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable rows={[{
        name: 'state',
        type: "'idle' | 'thinking' | 'using-tool' | 'responding' | 'done' | 'error'",
        description: 'Selects dot behavior, label color, and default copy.'
      }, {
        name: 'label',
        type: 'string',
        defaultValue: 'state-specific',
        description: 'Overrides the default state label.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds outer wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Typical inline usage patterns.">
        <CodeExamples examples={[{
        title: 'Basic state',
        code: \`<AgentStatus state="thinking" />\`
      }, {
        title: 'Custom label',
        code: \`<AgentStatus state="using-tool" label="Calling GitHub" />\`
      }]} />
      </Section>
    </StoryPage>
}`,...v.parameters?.docs?.source}}},y=[`Showcase`]}))();export{v as Showcase,y as __namedExportsOrder,_ as default};