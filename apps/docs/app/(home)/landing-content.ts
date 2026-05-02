export const JSON_BODY = `<span class="pun">{</span>
  <span class="key">"version"</span><span class="pun">:</span> <span class="str">"0.1"</span><span class="pun">,</span>
  <span class="key">"purpose"</span><span class="pun">:</span> <span class="str">"AI-first design system and codebase standard"</span><span class="pun">,</span>
  <span class="key">"generatedDirectories"</span><span class="pun">:</span> <span class="pun">[</span>
    <span class="str">".next"</span><span class="pun">,</span> <span class="str">".source"</span><span class="pun">,</span> <span class="str">"dist"</span>
  <span class="pun">],</span>
  <span class="key">"verificationCommands"</span><span class="pun">: {</span>
    <span class="key">"typecheck"</span><span class="pun">:</span> <span class="str">"pnpm tsc --noEmit"</span><span class="pun">,</span>
    <span class="key">"test"</span><span class="pun">:</span> <span class="str">"pnpm test"</span><span class="pun">,</span>
    <span class="key">"lint"</span><span class="pun">:</span> <span class="str">"pnpm lint"</span>
  <span class="pun">},</span>
  <span class="key">"commonTaskLocations"</span><span class="pun">: {</span>
    <span class="key">"components"</span><span class="pun">:</span> <span class="str">"packages/ui/src/"</span><span class="pun">,</span>
    <span class="key">"engine rules"</span><span class="pun">:</span> <span class="str">"packages/engine/src/scoring/rules.ts"</span>
  <span class="pun">}</span>
<span class="pun">}</span>`

export const BEFORE_CODE = `<span class="com">// Status badge</span>
<span class="pun">&lt;</span><span class="tag">span</span> <span class="attr">className</span><span class="pun">=</span><span class="str">"inline-flex items-center px-2 py-0.5
        rounded text-xs font-medium
        bg-red-100 text-red-800"</span><span class="pun">&gt;</span>
  Failed
<span class="pun">&lt;/</span><span class="tag">span</span><span class="pun">&gt;</span>`

export const AFTER_CODE = `<span class="com">// Same output. Different contract.</span>
<span class="pun">&lt;</span><span class="tag">Badge</span> <span class="attr">intent</span><span class="pun">=</span><span class="str">"danger"</span> <span class="attr">keyword</span><span class="pun">=</span><span class="str">"failed"</span> <span class="pun">/&gt;</span>

<span class="pun">&lt;</span><span class="tag">Button</span> <span class="attr">intent</span><span class="pun">=</span><span class="str">"danger"</span><span class="pun">&gt;</span>Delete<span class="pun">&lt;/</span><span class="tag">Button</span><span class="pun">&gt;</span>`
