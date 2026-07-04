export const JSON_BODY = `<span class="pun">{</span>
  <span class="key">"version"</span><span class="pun">:</span> <span class="str">"0.1"</span><span class="pun">,</span>
  <span class="key">"purpose"</span><span class="pun">:</span> <span class="str">"AI-first codebase standard and scoring tools"</span><span class="pun">,</span>
  <span class="key">"generatedDirectories"</span><span class="pun">:</span> <span class="pun">[</span>
    <span class="str">".next"</span><span class="pun">,</span> <span class="str">".source"</span><span class="pun">,</span> <span class="str">"dist"</span>
  <span class="pun">],</span>
  <span class="key">"verificationCommands"</span><span class="pun">: {</span>
    <span class="key">"typecheck"</span><span class="pun">:</span> <span class="str">"pnpm tsc --noEmit"</span><span class="pun">,</span>
    <span class="key">"test"</span><span class="pun">:</span> <span class="str">"pnpm test"</span><span class="pun">,</span>
    <span class="key">"lint"</span><span class="pun">:</span> <span class="str">"pnpm lint"</span>
  <span class="pun">},</span>
  <span class="key">"commonTaskLocations"</span><span class="pun">: {</span>
    <span class="key">"engine rules"</span><span class="pun">:</span> <span class="str">"packages/engine/src/scoring/rules.ts"</span><span class="pun">,</span>
    <span class="key">"CLI commands"</span><span class="pun">:</span> <span class="str">"packages/cli/src/commands/"</span>
  <span class="pun">}</span>
<span class="pun">}</span>`