# @clarxai/ui

**Internal only** — reference components used by the docs site. Not published or promoted as part of the Clarx product.

The public Clarx offering is the [AI-first standard](https://github.com/clarxai/clarx/tree/main/standard) and scoring tools (`@clarxai/cli`, `@clarxai/engine`).

## Files

```
src/tokens.ts             — shared vocabulary: Intent, Appearance, Size types
src/utils.ts              — cn() utility (twMerge + clsx)
src/badge.tsx             — foundational semantic component, full reference pattern
src/button.tsx            — intent × appearance × size
src/alert.tsx             — block-level intent notices
src/text.tsx              — semantic typography (role prop)
src/status-indicator.tsx  — inline state dot
src/chat-message.tsx      — user / assistant / system conversation bubbles
src/chat-input.tsx        — composer with send affordance
src/tool-call.tsx         — agent tool invocation card
src/streaming-text.tsx    — typewriter streaming display
src/agent-status.tsx      — agent lifecycle indicator
```

## Component pattern

Read `badge.tsx` first. Every other component is a simpler version of the same shape:

1. Types from `tokens.ts` (`Intent`, `Appearance`, `Size`)
2. CVA variants mapping semantic props → Tailwind classes
3. Pure function, no side effects, no context