import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./iframe-bdul4qPr.js";import{n as r,r as i,t as a}from"./jsx-runtime-DjvzIyLE.js";import{a as o,i as s,n as c,o as l,r as u,s as d,t as f}from"./story-layout-BcjpJy5n.js";function p({status:e}){return e===`pending`?(0,g.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,className:`text-zinc-400`,stroke:`currentColor`,strokeWidth:`1.5`,children:[(0,g.jsx)(`circle`,{cx:`8`,cy:`8`,r:`6.5`}),(0,g.jsx)(`path`,{d:`M8 4.5v4l2.5 1.5`,strokeLinecap:`round`,strokeLinejoin:`round`})]}):e===`running`?(0,g.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,className:`animate-spin text-blue-500`,children:[(0,g.jsx)(`circle`,{cx:`8`,cy:`8`,r:`6.5`,stroke:`currentColor`,strokeWidth:`1.5`,strokeOpacity:`0.25`}),(0,g.jsx)(`path`,{d:`M14.5 8A6.5 6.5 0 0 0 8 1.5`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`})]}):e===`success`?(0,g.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,className:`text-green-500`,stroke:`currentColor`,strokeWidth:`1.5`,children:[(0,g.jsx)(`circle`,{cx:`8`,cy:`8`,r:`6.5`}),(0,g.jsx)(`path`,{d:`M5 8.5l2 2 4-4`,strokeLinecap:`round`,strokeLinejoin:`round`})]}):(0,g.jsxs)(`svg`,{width:`16`,height:`16`,viewBox:`0 0 16 16`,fill:`none`,className:`text-red-500`,stroke:`currentColor`,strokeWidth:`1.5`,children:[(0,g.jsx)(`circle`,{cx:`8`,cy:`8`,r:`6.5`}),(0,g.jsx)(`path`,{d:`M8 5v4M8 11v.5`,strokeLinecap:`round`})]})}function m({name:e,status:t=`pending`,input:n,output:i,error:a,defaultOpen:o,className:s}){let c=t===`error`?!0:o??!1,[l,u]=h.useState(c);return(0,g.jsxs)(`div`,{className:r(`overflow-hidden rounded-xl border ring-1 ring-inset`,_[t],s),children:[(0,g.jsxs)(`button`,{type:`button`,onClick:()=>u(e=>!e),className:`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50`,children:[(0,g.jsx)(p,{status:t}),(0,g.jsx)(`span`,{className:`flex-1 font-mono text-sm font-medium text-zinc-700 dark:text-zinc-300`,children:e}),(0,g.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 14 14`,fill:`none`,stroke:`currentColor`,strokeWidth:`1.5`,strokeLinecap:`round`,strokeLinejoin:`round`,className:r(`shrink-0 text-zinc-400 transition-transform duration-200`,l&&`rotate-90`),children:(0,g.jsx)(`path`,{d:`M5 3l4 4-4 4`})})]}),l&&(0,g.jsxs)(`div`,{className:`space-y-3 border-t px-4 pb-4 pt-3`,children:[n!==void 0&&(0,g.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,g.jsx)(`p`,{className:`text-[11px] font-medium uppercase tracking-wide text-zinc-400`,children:`Input`}),(0,g.jsx)(`pre`,{className:`overflow-auto rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800`,children:JSON.stringify(n,null,2)})]}),t===`success`&&i!==void 0&&(0,g.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,g.jsx)(`p`,{className:`text-[11px] font-medium uppercase tracking-wide text-zinc-400`,children:`Output`}),(0,g.jsx)(`pre`,{className:`overflow-auto rounded-lg bg-zinc-50 p-3 text-xs dark:bg-zinc-800`,children:JSON.stringify(i,null,2)})]}),t===`error`&&a&&(0,g.jsx)(`p`,{className:`rounded-lg bg-red-50 p-3 text-xs text-red-600 dark:bg-red-950 dark:text-red-400`,children:a})]})]})}var h,g,_,v=e((()=>{h=t(n()),i(),g=a(),_={pending:`ring-zinc-200 dark:ring-zinc-700`,running:`ring-blue-200 dark:ring-blue-800`,success:`ring-green-200 dark:ring-green-800`,error:`ring-red-200 dark:ring-red-800`},m.__docgenInfo={description:``,methods:[],displayName:`ToolCall`,props:{name:{required:!0,tsType:{name:`string`},description:``},status:{required:!1,tsType:{name:`union`,raw:`'pending' | 'running' | 'success' | 'error'`,elements:[{name:`literal`,value:`'pending'`},{name:`literal`,value:`'running'`},{name:`literal`,value:`'success'`},{name:`literal`,value:`'error'`}]},description:``,defaultValue:{value:`'pending'`,computed:!1}},input:{required:!1,tsType:{name:`Record`,elements:[{name:`string`},{name:`unknown`}],raw:`Record<string, unknown>`},description:``},output:{required:!1,tsType:{name:`unknown`},description:``},error:{required:!1,tsType:{name:`string`},description:``},defaultOpen:{required:!1,tsType:{name:`boolean`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),y,b,x,S;e((()=>{v(),d(),y=a(),b={title:`Components/ToolCall`,component:m,parameters:{docs:{disable:!0}}},x={args:{name:`example_tool`},render:()=>(0,y.jsxs)(o,{title:`ToolCall`,description:`Expandable execution row for tool invocations with status, input payloads, outputs, and errors.`,children:[(0,y.jsx)(s,{title:`Variations`,description:`Use closed rows for routine activity and open rows for detailed inspection, especially on success output or errors.`,children:(0,y.jsx)(l,{children:(0,y.jsx)(c,{title:`Lifecycle states`,className:`md:col-span-2 xl:col-span-2`,children:(0,y.jsxs)(`div`,{className:`flex w-full flex-col gap-3`,children:[(0,y.jsx)(m,{name:`read_repo_map`,status:`pending`,input:{root:`packages/ui`}}),(0,y.jsx)(m,{name:`score_workspace`,status:`running`,input:{scope:`packages/ui`}}),(0,y.jsx)(m,{name:`collect_findings`,status:`success`,defaultOpen:!0,input:{limit:5},output:{findings:3,highest:`E4`}}),(0,y.jsx)(m,{name:`push_release`,status:`error`,input:{channel:`stable`},error:`Permission denied for protected branch.`})]})})})}),(0,y.jsx)(s,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,y.jsx)(u,{rows:[{name:`name`,type:`string`,description:`Monospace label for the invoked tool or action.`},{name:`status`,type:`'pending' | 'running' | 'success' | 'error'`,defaultValue:`'pending'`,description:`Controls icon, accent ring, and open-by-default error behavior.`},{name:`input`,type:`Record<string, unknown>`,description:`Optional JSON payload rendered in the details body.`},{name:`output`,type:`unknown`,description:`Optional success payload rendered when status is success.`},{name:`error`,type:`string`,description:`Optional error copy rendered when status is error.`},{name:`defaultOpen`,type:`boolean`,defaultValue:`false`,description:`Initial expanded state for non-error calls.`},{name:`className`,type:`string`,description:`Adds wrapper classes.`}]})}),(0,y.jsx)(s,{title:`Code Examples`,description:`Typical activity log patterns.`,children:(0,y.jsx)(f,{examples:[{title:`Successful tool call`,code:`<ToolCall
  name="collect_findings"
  status="success"
  defaultOpen
  input={{ limit: 5 }}
  output={{ findings: 3, highest: 'E4' }}
/>`},{title:`Errored tool call`,code:`<ToolCall
  name="push_release"
  status="error"
  input={{ channel: 'stable' }}
  error="Permission denied for protected branch."
/>`}]})})]})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    name: 'example_tool'
  },
  render: () => <StoryPage title="ToolCall" description="Expandable execution row for tool invocations with status, input payloads, outputs, and errors.">
      <Section title="Variations" description="Use closed rows for routine activity and open rows for detailed inspection, especially on success output or errors.">
        <VariantGrid>
          <PreviewCard title="Lifecycle states" className="md:col-span-2 xl:col-span-2">
            <div className="flex w-full flex-col gap-3">
              <ToolCall name="read_repo_map" status="pending" input={{
              root: 'packages/ui'
            }} />
              <ToolCall name="score_workspace" status="running" input={{
              scope: 'packages/ui'
            }} />
              <ToolCall name="collect_findings" status="success" defaultOpen input={{
              limit: 5
            }} output={{
              findings: 3,
              highest: 'E4'
            }} />
              <ToolCall name="push_release" status="error" input={{
              channel: 'stable'
            }} error="Permission denied for protected branch." />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable rows={[{
        name: 'name',
        type: 'string',
        description: 'Monospace label for the invoked tool or action.'
      }, {
        name: 'status',
        type: "'pending' | 'running' | 'success' | 'error'",
        defaultValue: "'pending'",
        description: 'Controls icon, accent ring, and open-by-default error behavior.'
      }, {
        name: 'input',
        type: 'Record<string, unknown>',
        description: 'Optional JSON payload rendered in the details body.'
      }, {
        name: 'output',
        type: 'unknown',
        description: 'Optional success payload rendered when status is success.'
      }, {
        name: 'error',
        type: 'string',
        description: 'Optional error copy rendered when status is error.'
      }, {
        name: 'defaultOpen',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Initial expanded state for non-error calls.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Typical activity log patterns.">
        <CodeExamples examples={[{
        title: 'Successful tool call',
        code: \`<ToolCall
  name="collect_findings"
  status="success"
  defaultOpen
  input={{ limit: 5 }}
  output={{ findings: 3, highest: 'E4' }}
/>\`
      }, {
        title: 'Errored tool call',
        code: \`<ToolCall
  name="push_release"
  status="error"
  input={{ channel: 'stable' }}
  error="Permission denied for protected branch."
/>\`
      }]} />
      </Section>
    </StoryPage>
}`,...x.parameters?.docs?.source}}},S=[`Showcase`]}))();export{x as Showcase,S as __namedExportsOrder,b as default};