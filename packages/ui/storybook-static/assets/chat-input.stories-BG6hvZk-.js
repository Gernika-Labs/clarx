import{i as e,s as t}from"./preload-helper-xPQekRTU.js";import{t as n}from"./iframe-bdul4qPr.js";import{n as r,r as i,t as a}from"./jsx-runtime-DjvzIyLE.js";import{a as o,i as s,n as c,o as l,r as u,s as d,t as f}from"./story-layout-BcjpJy5n.js";import{n as p,t as m}from"./badge-DjHvVtbj.js";function h({placeholder:e=`Message...`,onSubmit:t,onStop:n,isStreaming:i=!1,disabled:a=!1,actions:o,className:s}){let[c,l]=g.useState(``),u=g.useRef(null);function d(){let e=u.current;e&&(e.style.height=`auto`,e.style.height=Math.min(e.scrollHeight,200)+`px`)}function f(e){l(e.target.value),d()}function p(){let e=c.trim();!e||a||(t?.(e),l(``),u.current&&(u.current.style.height=`auto`))}function m(e){e.key===`Enter`&&!e.shiftKey&&(e.preventDefault(),p()),e.key===`Escape`&&(l(``),u.current&&(u.current.style.height=`auto`))}let h=c.trim().length>0;return(0,_.jsxs)(`div`,{className:r(`flex items-end gap-2 rounded-2xl border bg-white px-4 py-3 shadow-sm focus-within:ring-2 focus-within:ring-zinc-900/10 dark:bg-zinc-900 dark:focus-within:ring-zinc-100/10`,a&&`opacity-60 cursor-not-allowed`,s),children:[(0,_.jsx)(`textarea`,{ref:u,value:c,onChange:f,onKeyDown:m,placeholder:e,disabled:a||i,rows:1,className:`min-h-[1.5rem] flex-1 resize-none overflow-hidden bg-transparent text-sm focus:outline-none disabled:cursor-not-allowed`,style:{maxHeight:200}}),o,(0,_.jsx)(`button`,{type:`button`,onClick:i?n:p,disabled:a||!i&&!h,className:r(`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors`,i||h?`bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900`:`bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500`,`disabled:opacity-50 disabled:cursor-not-allowed`),children:i?(0,_.jsx)(`svg`,{width:`10`,height:`10`,viewBox:`0 0 10 10`,fill:`currentColor`,children:(0,_.jsx)(`rect`,{x:`0`,y:`0`,width:`10`,height:`10`,rx:`1`})}):(0,_.jsx)(`svg`,{width:`14`,height:`14`,viewBox:`0 0 14 14`,fill:`none`,stroke:`currentColor`,strokeWidth:`2`,strokeLinecap:`round`,strokeLinejoin:`round`,children:(0,_.jsx)(`path`,{d:`M7 12V2M3 6l4-4 4 4`})})})]})}var g,_,v=e((()=>{g=t(n()),i(),_=a(),h.__docgenInfo={description:``,methods:[],displayName:`ChatInput`,props:{placeholder:{required:!1,tsType:{name:`string`},description:``,defaultValue:{value:`'Message...'`,computed:!1}},onSubmit:{required:!1,tsType:{name:`signature`,type:`function`,raw:`(value: string) => void`,signature:{arguments:[{type:{name:`string`},name:`value`}],return:{name:`void`}}},description:``},onStop:{required:!1,tsType:{name:`signature`,type:`function`,raw:`() => void`,signature:{arguments:[],return:{name:`void`}}},description:``},isStreaming:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},disabled:{required:!1,tsType:{name:`boolean`},description:``,defaultValue:{value:`false`,computed:!1}},actions:{required:!1,tsType:{name:`ReactReactNode`,raw:`React.ReactNode`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),y,b,x,S;e((()=>{p(),v(),d(),y=a(),b={title:`Components/ChatInput`,component:h,parameters:{docs:{disable:!0}}},x={render:()=>(0,y.jsxs)(o,{title:`ChatInput`,description:`Multi-line message composer with submit, stop, keyboard shortcuts, and optional action slot.`,children:[(0,y.jsx)(s,{title:`Variations`,description:`The component manages its own draft state. Use the action slot for adjacent status or secondary controls.`,children:(0,y.jsxs)(l,{children:[(0,y.jsx)(c,{title:`Default composer`,className:`md:col-span-2 xl:col-span-1`,children:(0,y.jsx)(`div`,{className:`w-full`,children:(0,y.jsx)(h,{placeholder:`Ask Clarx to review the package boundary...`})})}),(0,y.jsx)(c,{title:`With actions`,children:(0,y.jsx)(`div`,{className:`w-full`,children:(0,y.jsx)(h,{placeholder:`Summarize the highest-risk changes...`,actions:(0,y.jsx)(m,{keyword:`beta`})})})}),(0,y.jsx)(c,{title:`Streaming and disabled`,children:(0,y.jsxs)(`div`,{className:`flex w-full flex-col gap-4`,children:[(0,y.jsx)(h,{isStreaming:!0,placeholder:`Generating response...`,actions:(0,y.jsx)(m,{keyword:`streaming`})}),(0,y.jsx)(h,{disabled:!0,placeholder:`This workspace is read-only.`})]})})]})}),(0,y.jsx)(s,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,y.jsx)(u,{rows:[{name:`placeholder`,type:`string`,defaultValue:`'Message...'`,description:`Textarea placeholder text.`},{name:`onSubmit`,type:`(value: string) => void`,description:`Called with trimmed content when the user submits.`},{name:`onStop`,type:`() => void`,description:`Called when the trailing button is pressed during streaming mode.`},{name:`isStreaming`,type:`boolean`,defaultValue:`false`,description:`Disables typing and switches the action button to stop mode.`},{name:`disabled`,type:`boolean`,defaultValue:`false`,description:`Disables the entire input shell.`},{name:`actions`,type:`ReactNode`,description:`Optional slot rendered before the submit or stop button.`},{name:`className`,type:`string`,description:`Adds wrapper classes.`}]})}),(0,y.jsx)(s,{title:`Code Examples`,description:`Common chat shell configurations.`,children:(0,y.jsx)(f,{examples:[{title:`Default composer`,code:`<ChatInput
  placeholder="Ask Clarx to review the package boundary..."
  onSubmit={(value) => console.log(value)}
/>`},{title:`Streaming composer`,code:`<ChatInput
  isStreaming
  onStop={() => console.log('stop')}
  actions={<Badge keyword="streaming" />}
/>`}]})})]})},x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="ChatInput" description="Multi-line message composer with submit, stop, keyboard shortcuts, and optional action slot.">
      <Section title="Variations" description="The component manages its own draft state. Use the action slot for adjacent status or secondary controls.">
        <VariantGrid>
          <PreviewCard title="Default composer" className="md:col-span-2 xl:col-span-1">
            <div className="w-full">
              <ChatInput placeholder="Ask Clarx to review the package boundary..." />
            </div>
          </PreviewCard>
          <PreviewCard title="With actions">
            <div className="w-full">
              <ChatInput placeholder="Summarize the highest-risk changes..." actions={<Badge keyword="beta" />} />
            </div>
          </PreviewCard>
          <PreviewCard title="Streaming and disabled">
            <div className="flex w-full flex-col gap-4">
              <ChatInput isStreaming placeholder="Generating response..." actions={<Badge keyword="streaming" />} />
              <ChatInput disabled placeholder="This workspace is read-only." />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable rows={[{
        name: 'placeholder',
        type: 'string',
        defaultValue: "'Message...'",
        description: 'Textarea placeholder text.'
      }, {
        name: 'onSubmit',
        type: '(value: string) => void',
        description: 'Called with trimmed content when the user submits.'
      }, {
        name: 'onStop',
        type: '() => void',
        description: 'Called when the trailing button is pressed during streaming mode.'
      }, {
        name: 'isStreaming',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Disables typing and switches the action button to stop mode.'
      }, {
        name: 'disabled',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Disables the entire input shell.'
      }, {
        name: 'actions',
        type: 'ReactNode',
        description: 'Optional slot rendered before the submit or stop button.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Common chat shell configurations.">
        <CodeExamples examples={[{
        title: 'Default composer',
        code: \`<ChatInput
  placeholder="Ask Clarx to review the package boundary..."
  onSubmit={(value) => console.log(value)}
/>\`
      }, {
        title: 'Streaming composer',
        code: \`<ChatInput
  isStreaming
  onStop={() => console.log('stop')}
  actions={<Badge keyword="streaming" />}
/>\`
      }]} />
      </Section>
    </StoryPage>
}`,...x.parameters?.docs?.source}}},S=[`Showcase`]}))();export{x as Showcase,S as __namedExportsOrder,b as default};