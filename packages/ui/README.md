# @intention-ui/ui

Semantic UI component library. Copy-and-own model — no install, you own the source.

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
src/chat-input.tsx        — message composer with streaming state
src/tool-call.tsx         — collapsible agent tool invocation card
src/streaming-text.tsx    — text with live streaming cursor
src/agent-status.tsx      — agent lifecycle state display
src/index.ts              — barrel export
```

## The pattern

Read `badge.tsx` first. Every other component is a simpler version of the same shape.  
The keyword map in `badge.tsx` is the most complex part of the system — everything else is just CVA variants.

## Adding a component

1. Follow the `badge.tsx` pattern
2. Import types from `tokens.ts`
3. Export from `index.ts`
4. See root `CLAUDE.md` for the full docs wiring steps
