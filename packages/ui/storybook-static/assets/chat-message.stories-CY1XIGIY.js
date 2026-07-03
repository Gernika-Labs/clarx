import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-bdul4qPr.js";import{n,r,t as i}from"./jsx-runtime-DjvzIyLE.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./story-layout-BcjpJy5n.js";function f({role:e}){return(0,m.jsx)(`div`,{className:n(`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-medium`,e===`user`?`bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900`:`bg-zinc-100 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:ring-zinc-700 text-zinc-500`),children:e===`user`?`U`:`AI`})}function p({role:e,content:t,isStreaming:r,avatar:i,timestamp:a,className:o}){if(e===`system`)return(0,m.jsx)(`div`,{className:n(`flex justify-center`,o),children:(0,m.jsx)(`span`,{className:`rounded-full border bg-zinc-50 px-3 py-1 text-xs text-zinc-400 dark:bg-zinc-900`,children:t})});let s=e===`user`;return(0,m.jsxs)(`div`,{className:n(`flex w-full gap-2`,s?`flex-row-reverse`:`flex-row`,o),children:[i??(0,m.jsx)(f,{role:e}),(0,m.jsxs)(`div`,{className:n(`flex flex-col gap-1`,s?`items-end`:`items-start`),children:[(0,m.jsxs)(`div`,{className:n(`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed`,s?`rounded-tr-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900`:`rounded-tl-md bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100`),children:[t,r&&(0,m.jsx)(`span`,{className:`ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.1em] animate-pulse rounded-sm bg-current`})]}),a&&(0,m.jsx)(`span`,{className:`text-[11px] text-zinc-400`,children:a})]})]})}var m,h=e((()=>{t(),r(),m=i(),p.__docgenInfo={description:``,methods:[],displayName:`ChatMessage`,props:{role:{required:!0,tsType:{name:`union`,raw:`'user' | 'assistant' | 'system'`,elements:[{name:`literal`,value:`'user'`},{name:`literal`,value:`'assistant'`},{name:`literal`,value:`'system'`}]},description:``},content:{required:!0,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},isStreaming:{required:!1,tsType:{name:`boolean`},description:``},avatar:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},timestamp:{required:!1,tsType:{name:`string`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),g,_,v,y;e((()=>{h(),u(),g=i(),_={title:`Components/ChatMessage`,component:p,parameters:{docs:{disable:!0}}},v={args:{role:`assistant`,content:`Example message`},render:()=>(0,g.jsxs)(a,{title:`ChatMessage`,description:`Conversation bubble for user, assistant, and system messages with optional timestamps and streaming cursor.`,children:[(0,g.jsx)(o,{title:`Variations`,description:`User and assistant messages align to opposite edges. System messages collapse into a centered status chip.`,children:(0,g.jsxs)(c,{children:[(0,g.jsx)(s,{title:`Conversation`,className:`md:col-span-2 xl:col-span-2`,children:(0,g.jsxs)(`div`,{className:`flex w-full flex-col gap-4`,children:[(0,g.jsx)(p,{role:`assistant`,content:`I reviewed the package and found one operational recommendation.`,timestamp:`09:42`}),(0,g.jsx)(p,{role:`user`,content:`Show me the highest-risk file next.`,timestamp:`09:43`}),(0,g.jsx)(p,{role:`assistant`,content:`The score command remains the highest fan-in entry point.`,isStreaming:!0,timestamp:`09:43`})]})}),(0,g.jsx)(s,{title:`System`,children:(0,g.jsxs)(`div`,{className:`flex w-full flex-col gap-4`,children:[(0,g.jsx)(p,{role:`system`,content:`Watch mode resumed`}),(0,g.jsx)(p,{role:`system`,content:`Copied findings to clipboard`})]})})]})}),(0,g.jsx)(o,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,g.jsx)(l,{rows:[{name:`role`,type:`'user' | 'assistant' | 'system'`,description:`Determines alignment, chrome, and avatar behavior.`},{name:`content`,type:`ReactNode`,description:`Main message body.`},{name:`isStreaming`,type:`boolean`,defaultValue:`false`,description:`Shows a trailing streaming cursor inside assistant or user bubbles.`},{name:`avatar`,type:`ReactNode`,description:`Overrides the default avatar for non-system messages.`},{name:`timestamp`,type:`string`,description:`Optional small timestamp below the bubble.`},{name:`className`,type:`string`,description:`Adds wrapper classes.`}]})}),(0,g.jsx)(o,{title:`Code Examples`,description:`Typical message rendering patterns.`,children:(0,g.jsx)(d,{examples:[{title:`Assistant message`,code:`<ChatMessage
  role="assistant"
  content="I reviewed the package and found one operational recommendation."
  timestamp="09:42"
/>`},{title:`System message`,code:`<ChatMessage role="system" content="Watch mode resumed" />`}]})})]})},v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    role: 'assistant',
    content: 'Example message'
  },
  render: () => <StoryPage title="ChatMessage" description="Conversation bubble for user, assistant, and system messages with optional timestamps and streaming cursor.">
      <Section title="Variations" description="User and assistant messages align to opposite edges. System messages collapse into a centered status chip.">
        <VariantGrid>
          <PreviewCard title="Conversation" className="md:col-span-2 xl:col-span-2">
            <div className="flex w-full flex-col gap-4">
              <ChatMessage role="assistant" content="I reviewed the package and found one operational recommendation." timestamp="09:42" />
              <ChatMessage role="user" content="Show me the highest-risk file next." timestamp="09:43" />
              <ChatMessage role="assistant" content="The score command remains the highest fan-in entry point." isStreaming timestamp="09:43" />
            </div>
          </PreviewCard>
          <PreviewCard title="System">
            <div className="flex w-full flex-col gap-4">
              <ChatMessage role="system" content="Watch mode resumed" />
              <ChatMessage role="system" content="Copied findings to clipboard" />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable rows={[{
        name: 'role',
        type: "'user' | 'assistant' | 'system'",
        description: 'Determines alignment, chrome, and avatar behavior.'
      }, {
        name: 'content',
        type: 'ReactNode',
        description: 'Main message body.'
      }, {
        name: 'isStreaming',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Shows a trailing streaming cursor inside assistant or user bubbles.'
      }, {
        name: 'avatar',
        type: 'ReactNode',
        description: 'Overrides the default avatar for non-system messages.'
      }, {
        name: 'timestamp',
        type: 'string',
        description: 'Optional small timestamp below the bubble.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Typical message rendering patterns.">
        <CodeExamples examples={[{
        title: 'Assistant message',
        code: \`<ChatMessage
  role="assistant"
  content="I reviewed the package and found one operational recommendation."
  timestamp="09:42"
/>\`
      }, {
        title: 'System message',
        code: \`<ChatMessage role="system" content="Watch mode resumed" />\`
      }]} />
      </Section>
    </StoryPage>
}`,...v.parameters?.docs?.source}}},y=[`Showcase`]}))();export{v as Showcase,y as __namedExportsOrder,_ as default};