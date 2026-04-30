# apps/docs

Documentation site for intention/ui. Next.js 15 + fumadocs.

## Key files

```
app/layout.tsx                    — root layout, search dialog wired here
app/docs/[[...slug]]/page.tsx     — fumadocs catch-all route (route logic only)
app/api/search/route.ts           — Orama search endpoint (powers Cmd+K)
app/source.ts                     — fumadocs source loader (see CLAUDE.md for workaround note)

content/docs/                     — MDX pages (all doc content lives here)
content/docs/meta.json            — sidebar ordering and section labels

lib/mdx-components.ts             — MDX component registry (single place for demo registration)
lib/templates.ts                  — canonical template strings (CLAUDE.md, Cursor, AGENTS.md)

components/demos/                 — live demo components used inside MDX pages
components/search-dialog.tsx      — custom Cmd+K dialog with copy actions
components/search-loader.tsx      — 'use client' wrapper required for ssr:false in layout
components/template-copy-block.tsx — renders template strings from lib/templates.ts
```

## How MDX demos work

1. An MDX page uses a tag like `<BadgeIntentDemo />`
2. fumadocs passes `mdxComponents` from `lib/mdx-components.ts` to the MDX renderer
3. The tag resolves to the matching demo component

**To add a demo:** create the component file, then add it to `lib/mdx-components.ts`. That is the only file to edit.

## How template pages work

Template pages (`ai-rules/templates/*.mdx`) use `<TemplateCopyBlock name="claude" />`.  
The content comes from `lib/templates.ts` — one source, rendered in docs and copied via search.
