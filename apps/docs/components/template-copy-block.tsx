'use client'

import { useState } from 'react'
import { CLAUDE_TEMPLATE, CURSOR_TEMPLATE, AGENTS_TEMPLATE } from '@/lib/templates'

const TEMPLATES = {
  claude: { content: CLAUDE_TEMPLATE, filename: 'CLAUDE.md' },
  cursor: { content: CURSOR_TEMPLATE, filename: '.cursor/rules/design-system.mdc' },
  agents: { content: AGENTS_TEMPLATE, filename: 'AGENTS.md' },
} as const

type TemplateName = keyof typeof TEMPLATES

function CopyIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" />
      <path d="M9.5 4.5V2A.5.5 0 0 0 9 1.5H2A.5.5 0 0 0 1.5 2v7a.5.5 0 0 0 .5.5h2.5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 7.5l3 3 6-6" />
    </svg>
  )
}

export function TemplateCopyBlock({ name }: { name: TemplateName }) {
  const [copied, setCopied] = useState(false)
  const { content, filename } = TEMPLATES[name]

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="not-prose my-6 overflow-hidden rounded-xl border">
      <div className="flex items-center justify-between border-b bg-fd-muted/30 px-4 py-2">
        <span className="font-mono text-xs text-fd-muted-foreground">{filename}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-fd-muted-foreground transition-colors hover:bg-fd-accent hover:text-fd-accent-foreground"
        >
          {copied ? <><CheckIcon />Copied</> : <><CopyIcon />Copy</>}
        </button>
      </div>
      <pre className="overflow-auto p-4 text-[12px] leading-relaxed text-fd-foreground">
        {content}
      </pre>
    </div>
  )
}
