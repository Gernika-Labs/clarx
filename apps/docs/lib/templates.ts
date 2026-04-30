export const CLAUDE_TEMPLATE = `# UI Design System Rules

This project uses an intention-driven design system. When generating or modifying UI code, follow these rules.

## Prefer semantic props over styling

Use props that express meaning, state, or emphasis. Do not reconstruct the appearance of a known state with raw utility classes.

Bad:
\`\`\`tsx
<Badge className="text-red-700 bg-red-100" />
\`\`\`

Good:
\`\`\`tsx
<Badge intent="danger" />
\`\`\`

## Use \`className\` for layout only

On encapsulated components, \`className\` is for margin, width, grid placement, and positioning — not for color, font, padding, or visual overrides.

## Ask about meaning before implementing visual changes

If a request says "make this red," "make it smaller," or "make it stand out," first determine what the element needs to communicate. Then map it to the correct system prop.

Before implementing, ask:
1. What is this communicating? (status, severity, emphasis, system state, role)
2. Is this state stable or actively changing?
3. How much emphasis should it have?
4. Does the design system already have a concept for this?

## Expand the system instead of working around it

If the same styling override appears in more than one place, that is a signal the component API is missing a variant. Add the variant to the component — don't standardize the override.

## Use the project's existing vocabulary

If the codebase uses \`intent\`, \`appearance\`, \`status\`, \`priority\`, or \`role\` as prop names, use that vocabulary. Don't invent local variations.

## Available components

Semantic primitives:
- \`Badge\` — status labels, severity, AI agent states (props: intent, appearance, dot, keyword)
- \`Button\` — actions (props: intent, appearance, size)
- \`Alert\` — block-level notices (props: intent, appearance, title)
- \`Text\` — typography with semantic role (props: role, as)
- \`StatusIndicator\` — inline state dot (props: state, size, label)

AI-native primitives:
- \`ChatMessage\` — conversation bubbles (props: role, content, isStreaming)
- \`ChatInput\` — message composer (props: onSubmit, isStreaming)
- \`ToolCall\` — agent tool invocation (props: name, status, input, output)
- \`StreamingText\` — text with streaming cursor (props: content, isStreaming)
- \`AgentStatus\` — agent lifecycle state (props: state)
`

export const CURSOR_TEMPLATE = `---
description: Intention-driven design system rules
globs: ["**/*.tsx", "**/*.ts", "**/*.jsx"]
alwaysApply: true
---

# Design System — UI Generation Rules

## Semantic props over styling

Prefer component props that express meaning over raw Tailwind classes.

Bad: \`<Badge className="text-red-500 bg-red-50" />\`
Good: \`<Badge intent="danger" />\`

## className is for layout only

On encapsulated components, use className for margin, width, grid position, and alignment only — not for color, font, padding, or visual overrides.

## Ask about meaning before implementing

If the request describes a visual outcome ("make it red," "make it prominent," "make it smaller"), ask what the element should communicate before implementing.

The core questions:
- What is this communicating?
- Is the state stable or live/changing?
- How much emphasis should it have?
- Does the system already have a concept for this?

## Repeated overrides signal a missing variant

If the same className pattern appears in more than one place, the component likely needs a new prop or variant. Prefer adding it to the system over repeating the override.

## Use existing vocabulary

The codebase uses: intent, appearance, status, priority, role, emphasis.
Use these concepts. Don't introduce new local naming for the same ideas.

## Component reference

Semantic primitives:
- Badge: intent, appearance, dot, size, keyword, label
- Button: intent, appearance, size
- Alert: intent, appearance, title
- Text: role (heading | body | label | caption | muted | code), as
- StatusIndicator: state, size, label

AI-native primitives:
- ChatMessage: role (user | assistant | system), content, isStreaming
- ChatInput: onSubmit, isStreaming, placeholder
- ToolCall: name, status (pending | running | success | error), input, output, error
- StreamingText: content, isStreaming
- AgentStatus: state (idle | thinking | running | done | error | interrupted)
`

export const AGENTS_TEMPLATE = `## UI Generation — Design System Rules

This project uses an intention-driven design system. When generating or modifying UI:

### Always prefer semantic props

Use component props that express meaning, state, or emphasis. Do not reconstruct a known visual state with raw utility classes.

\`\`\`tsx
// Bad — visual encoding at the callsite
<span className="px-2 py-0.5 rounded-full text-xs text-red-700 bg-red-100">Failed</span>

// Good — semantic
<Badge keyword="failed" />
\`\`\`

### Use className for layout only

On encapsulated components, className is for positioning and layout: margin, width, grid column, flexbox alignment. It is not for color, font, internal padding, or visual overrides.

### Ask before implementing a visual change

If the request specifies a visual outcome without a semantic reason ("make it red," "make it bold"), ask what the element is meant to communicate before writing code.

Questions to ask:
1. What is this communicating to the user?
2. Is this state stable or actively changing?
3. How much emphasis does it need?
4. Does the design system already have a concept for this?

### Expand components instead of overriding them

If implementing a feature requires repeated className overrides on the same component, that component likely needs a new prop or variant. Prefer adding it to the component file.

### Use existing system vocabulary

The codebase uses: \`intent\`, \`appearance\`, \`status\`, \`priority\`, \`role\`.
Always prefer this vocabulary over inventing new local naming.

### Component reference

**Semantic primitives** — \`Badge\`, \`Button\`, \`Alert\`, \`Text\`, \`StatusIndicator\`

**AI-native primitives** — \`ChatMessage\`, \`ChatInput\`, \`ToolCall\`, \`StreamingText\`, \`AgentStatus\`

For details on props and keywords, see the design system documentation.
`
