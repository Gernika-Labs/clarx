import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./iframe-bdul4qPr.js";import{n,r,t as i}from"./jsx-runtime-DjvzIyLE.js";import{a,i as o,n as s,o as c,r as l,s as u,t as d}from"./story-layout-BcjpJy5n.js";function f({text:e,isStreaming:t,className:r}){return(0,p.jsxs)(`span`,{className:n(r),children:[e,t&&(0,p.jsx)(`span`,{className:`ml-0.5 inline-block h-[1em] w-0.5 translate-y-[0.1em] animate-pulse rounded-sm bg-current`})]})}var p,m=e((()=>{t(),r(),p=i(),f.__docgenInfo={description:``,methods:[],displayName:`StreamingText`,props:{text:{required:!0,tsType:{name:`string`},description:``},isStreaming:{required:!1,tsType:{name:`boolean`},description:``},className:{required:!1,tsType:{name:`string`},description:``}}}})),h,g,_,v;e((()=>{m(),u(),h=i(),g={title:`Components/StreamingText`,component:f,parameters:{docs:{disable:!0}}},_={args:{text:`Example text`},render:()=>(0,h.jsxs)(a,{title:`StreamingText`,description:`Tiny utility for inline streaming responses when a full message bubble is unnecessary.`,children:[(0,h.jsx)(o,{title:`Variations`,description:`The component is intentionally narrow: plain text plus an optional trailing streaming cursor.`,children:(0,h.jsxs)(c,{children:[(0,h.jsx)(s,{title:`Static text`,children:(0,h.jsx)(`div`,{className:`text-sm text-zinc-800`,children:(0,h.jsx)(f,{text:`Package boundary looks healthy.`})})}),(0,h.jsx)(s,{title:`Streaming text`,children:(0,h.jsx)(`div`,{className:`text-sm text-zinc-800`,children:(0,h.jsx)(f,{text:`Analyzing export graph`,isStreaming:!0})})})]})}),(0,h.jsx)(o,{title:`Props`,description:`Manual prop reference for the public component API.`,children:(0,h.jsx)(l,{rows:[{name:`text`,type:`string`,description:`Plain text content to render.`},{name:`isStreaming`,type:`boolean`,defaultValue:`false`,description:`Shows the trailing cursor when true.`},{name:`className`,type:`string`,description:`Adds wrapper classes.`}]})}),(0,h.jsx)(o,{title:`Code Examples`,description:`Most usages should stay this simple.`,children:(0,h.jsx)(d,{examples:[{title:`Static text`,code:`<StreamingText text="Package boundary looks healthy." />`},{title:`Streaming text`,code:`<StreamingText text="Analyzing export graph" isStreaming />`}]})})]})},_.parameters={..._.parameters,docs:{..._.parameters?.docs,source:{originalSource:`{
  args: {
    text: 'Example text'
  },
  render: () => <StoryPage title="StreamingText" description="Tiny utility for inline streaming responses when a full message bubble is unnecessary.">
      <Section title="Variations" description="The component is intentionally narrow: plain text plus an optional trailing streaming cursor.">
        <VariantGrid>
          <PreviewCard title="Static text">
            <div className="text-sm text-zinc-800">
              <StreamingText text="Package boundary looks healthy." />
            </div>
          </PreviewCard>
          <PreviewCard title="Streaming text">
            <div className="text-sm text-zinc-800">
              <StreamingText text="Analyzing export graph" isStreaming />
            </div>
          </PreviewCard>
        </VariantGrid>
      </Section>
      <Section title="Props" description="Manual prop reference for the public component API.">
        <PropsTable rows={[{
        name: 'text',
        type: 'string',
        description: 'Plain text content to render.'
      }, {
        name: 'isStreaming',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Shows the trailing cursor when true.'
      }, {
        name: 'className',
        type: 'string',
        description: 'Adds wrapper classes.'
      }]} />
      </Section>
      <Section title="Code Examples" description="Most usages should stay this simple.">
        <CodeExamples examples={[{
        title: 'Static text',
        code: \`<StreamingText text="Package boundary looks healthy." />\`
      }, {
        title: 'Streaming text',
        code: \`<StreamingText text="Analyzing export graph" isStreaming />\`
      }]} />
      </Section>
    </StoryPage>
}`,..._.parameters?.docs?.source}}},v=[`Showcase`]}))();export{_ as Showcase,v as __namedExportsOrder,g as default};