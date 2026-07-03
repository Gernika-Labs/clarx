import{i as e}from"./preload-helper-xPQekRTU.js";import{t}from"./jsx-runtime-DjvzIyLE.js";import{a as n,i as r,s as i,t as a}from"./story-layout-BcjpJy5n.js";function o({name:e,hex:t,usage:n}){return(0,c.jsxs)(`div`,{className:`space-y-3 rounded-2xl bg-zinc-900/40 p-4`,children:[(0,c.jsx)(`div`,{className:`h-24 w-full rounded-xl border border-white/10`,style:{backgroundColor:t}}),(0,c.jsxs)(`div`,{className:`space-y-1 font-mono`,children:[(0,c.jsx)(`div`,{className:`text-lg font-semibold text-zinc-50`,children:e}),(0,c.jsx)(`div`,{className:`text-sm text-zinc-300`,children:t}),(0,c.jsx)(`div`,{className:`font-sans text-sm leading-6 text-zinc-400`,children:n})]})]})}function s(){return(0,c.jsx)(`div`,{className:`overflow-hidden rounded-[2rem] border border-white/10`,children:(0,c.jsx)(`div`,{className:`h-40 w-full`,style:{background:`linear-gradient(135deg, #080B17 0%, #121533 20%, #241B59 36%, #A94CFF 52%, #FF4FBF 66%, #FF6B8E 76%, #FF9A3D 88%, #FFD166 100%)`}})})}var c,l,u,d,f;e((()=>{i(),c=t(),l={title:`Foundation/Colors`,parameters:{docs:{disable:!0},controls:{disable:!0}}},u=[{name:`Laser Cyan`,hex:`#63E7FF`,usage:`Primary neon strokes, grid lines, electric outlines`},{name:`Arcade Blue`,hex:`#2FA7FF`,usage:`Secondary cool glow, cyan-to-blue transitions`},{name:`Hot Magenta`,hex:`#FF4FBF`,usage:`Hero script lettering, edge lighting, UI emphasis`},{name:`Neon Violet`,hex:`#A94CFF`,usage:`Purple glow edges, shadow bloom, deep neon mixes`},{name:`Sunset Coral`,hex:`#FF6B8E`,usage:`Warm highlight band between pink and orange`},{name:`Retro Orange`,hex:`#FF9A3D`,usage:`Sun core, heat accents, arcade warmth`},{name:`Solar Gold`,hex:`#FFD166`,usage:`Sun stripes, bright flare centers, nostalgic warmth`},{name:`Night Indigo`,hex:`#241B59`,usage:`Sky backdrop, deep contrast layer`},{name:`Synth Navy`,hex:`#121533`,usage:`Base dark surface, terminal-style background`},{name:`Deep Space`,hex:`#080B17`,usage:`Near-black grounding color behind neon glows`}],d={render:()=>(0,c.jsxs)(n,{title:`80s Neon Colors`,description:`Palette extracted from the reference image: electric cyan, hot magenta, violet glow, and sunset heat over deep indigo backgrounds. These are approximate design values meant to capture the image’s flavor, not exact sampled pixels.`,children:[(0,c.jsx)(r,{title:`Palette`,description:`Use the dark indigos as the base. Then layer cyan, magenta, and violet as light sources instead of flat fills. The warm oranges and golds should stay concentrated in focal areas so the palette keeps its arcade-night contrast.`,children:(0,c.jsx)(`div`,{className:`grid gap-4 md:grid-cols-2 xl:grid-cols-3`,children:u.map(e=>(0,c.jsx)(o,{name:e.name,hex:e.hex,usage:e.usage},e.hex))})}),(0,c.jsx)(r,{title:`Palette Blend`,description:`This is the overall synthwave ramp suggested by the image: dark space to indigo, then violet, then hot pink, then coral and orange into a gold flare.`,children:(0,c.jsx)(s,{})}),(0,c.jsx)(r,{title:`Practical Notes`,description:`To keep the 80s neon feel, avoid treating all colors as equals. Most of the scene should stay dark and let a few luminous accents carry the composition.`,children:(0,c.jsxs)(`div`,{className:`space-y-3 text-sm leading-7 text-zinc-300`,children:[(0,c.jsx)(`p`,{children:"Use `Deep Space`, `Synth Navy`, and `Night Indigo` for the canvas, shells, and quiet zones."}),(0,c.jsx)(`p`,{children:"Reserve `Laser Cyan` and `Hot Magenta` for brand moments, interactive emphasis, and edge glows."}),(0,c.jsx)(`p`,{children:"Use `Retro Orange` and `Solar Gold` sparingly as flare colors so the palette keeps contrast and doesn’t collapse into pastel."}),(0,c.jsx)(`p`,{children:`When combining colors, prefer gradients and glow stacks over flat blocks. The reference image gets its look from luminous transitions, not solid panels.`})]})}),(0,c.jsx)(r,{title:`Code Examples`,description:`Starter CSS tokens for the palette and a gradient you can reuse in stories or product surfaces.`,children:(0,c.jsx)(a,{examples:[{title:`CSS variables`,code:`:root {
  --clarx-neon-cyan: #63E7FF;
  --clarx-arcade-blue: #2FA7FF;
  --clarx-hot-magenta: #FF4FBF;
  --clarx-neon-violet: #A94CFF;
  --clarx-sunset-coral: #FF6B8E;
  --clarx-retro-orange: #FF9A3D;
  --clarx-solar-gold: #FFD166;
  --clarx-night-indigo: #241B59;
  --clarx-synth-navy: #121533;
  --clarx-deep-space: #080B17;
}`},{title:`Hero gradient`,code:`.clarx-80s-gradient {
  background: linear-gradient(
    135deg,
    #080B17 0%,
    #121533 20%,
    #241B59 36%,
    #A94CFF 52%,
    #FF4FBF 66%,
    #FF6B8E 76%,
    #FF9A3D 88%,
    #FFD166 100%
  );
}`}]})})]})},d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <StoryPage title="80s Neon Colors" description="Palette extracted from the reference image: electric cyan, hot magenta, violet glow, and sunset heat over deep indigo backgrounds. These are approximate design values meant to capture the image’s flavor, not exact sampled pixels.">
      <Section title="Palette" description="Use the dark indigos as the base. Then layer cyan, magenta, and violet as light sources instead of flat fills. The warm oranges and golds should stay concentrated in focal areas so the palette keeps its arcade-night contrast.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {PALETTE.map(color => <Swatch key={color.hex} name={color.name} hex={color.hex} usage={color.usage} />)}
        </div>
      </Section>

      <Section title="Palette Blend" description="This is the overall synthwave ramp suggested by the image: dark space to indigo, then violet, then hot pink, then coral and orange into a gold flare.">
        <GradientBand />
      </Section>

      <Section title="Practical Notes" description="To keep the 80s neon feel, avoid treating all colors as equals. Most of the scene should stay dark and let a few luminous accents carry the composition.">
        <div className="space-y-3 text-sm leading-7 text-zinc-300">
          <p>Use \`Deep Space\`, \`Synth Navy\`, and \`Night Indigo\` for the canvas, shells, and quiet zones.</p>
          <p>Reserve \`Laser Cyan\` and \`Hot Magenta\` for brand moments, interactive emphasis, and edge glows.</p>
          <p>Use \`Retro Orange\` and \`Solar Gold\` sparingly as flare colors so the palette keeps contrast and doesn’t collapse into pastel.</p>
          <p>When combining colors, prefer gradients and glow stacks over flat blocks. The reference image gets its look from luminous transitions, not solid panels.</p>
        </div>
      </Section>

      <Section title="Code Examples" description="Starter CSS tokens for the palette and a gradient you can reuse in stories or product surfaces.">
        <CodeExamples examples={[{
        title: 'CSS variables',
        code: \`:root {
  --clarx-neon-cyan: #63E7FF;
  --clarx-arcade-blue: #2FA7FF;
  --clarx-hot-magenta: #FF4FBF;
  --clarx-neon-violet: #A94CFF;
  --clarx-sunset-coral: #FF6B8E;
  --clarx-retro-orange: #FF9A3D;
  --clarx-solar-gold: #FFD166;
  --clarx-night-indigo: #241B59;
  --clarx-synth-navy: #121533;
  --clarx-deep-space: #080B17;
}\`
      }, {
        title: 'Hero gradient',
        code: \`.clarx-80s-gradient {
  background: linear-gradient(
    135deg,
    #080B17 0%,
    #121533 20%,
    #241B59 36%,
    #A94CFF 52%,
    #FF4FBF 66%,
    #FF6B8E 76%,
    #FF9A3D 88%,
    #FFD166 100%
  );
}\`
      }]} />
      </Section>
    </StoryPage>
}`,...d.parameters?.docs?.source}}},f=[`Showcase`]}))();export{d as Showcase,f as __namedExportsOrder,l as default};