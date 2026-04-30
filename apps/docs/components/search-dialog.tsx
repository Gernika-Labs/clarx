'use client'

import { useDocsSearch } from 'fumadocs-core/search/client'
import { useMemo } from 'react'
import {
  SearchDialog,
  SearchDialogClose,
  SearchDialogContent,
  SearchDialogHeader,
  SearchDialogIcon,
  SearchDialogInput,
  SearchDialogList,
  SearchDialogOverlay,
  type SearchItemType,
  type SharedProps,
} from 'fumadocs-ui/components/dialog/search'
import { CLAUDE_TEMPLATE, CURSOR_TEMPLATE, AGENTS_TEMPLATE } from '@/lib/templates'

const ACTION_TRIGGERS = ['copy', 'template', 'claude', 'cursor', 'agent', 'rules', '.md']

function CopyIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="4.5" y="4.5" width="8" height="8" rx="1.5" />
      <path d="M9.5 4.5V2A.5.5 0 0 0 9 1.5H2A.5.5 0 0 0 1.5 2v7a.5.5 0 0 0 .5.5h2.5" />
    </svg>
  )
}

function ActionNode({ label, description }: { label: string; description: string }) {
  return (
    <span className="flex w-full items-center gap-3">
      <span className="flex size-7 shrink-0 items-center justify-center rounded bg-fd-muted text-fd-muted-foreground">
        <CopyIcon />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-medium">{label}</span>
        <span className="block truncate text-xs text-fd-muted-foreground">{description}</span>
      </span>
    </span>
  )
}

const COPY_ACTIONS: SearchItemType[] = [
  {
    id: 'copy-claude',
    type: 'action',
    node: <ActionNode label="Copy CLAUDE.md" description="Drop-in rules for Claude Code" />,
    onSelect: () => navigator.clipboard.writeText(CLAUDE_TEMPLATE),
  },
  {
    id: 'copy-cursor',
    type: 'action',
    node: <ActionNode label="Copy Cursor rules" description=".cursor/rules/design-system.mdc" />,
    onSelect: () => navigator.clipboard.writeText(CURSOR_TEMPLATE),
  },
  {
    id: 'copy-agents',
    type: 'action',
    node: <ActionNode label="Copy AGENTS.md snippet" description="Drop-in section for any agent tool" />,
    onSelect: () => navigator.clipboard.writeText(AGENTS_TEMPLATE),
  },
]

export function CustomSearchDialog(props: SharedProps) {
  const { search, setSearch, query } = useDocsSearch({ type: 'fetch' })

  const showActions =
    search.length === 0 ||
    ACTION_TRIGGERS.some((k) => search.toLowerCase().includes(k))

  const items = useMemo<SearchItemType[] | null>(() => {
    const results = query.data !== 'empty' ? query.data ?? null : null
    if (!results) return showActions ? COPY_ACTIONS : null
    return showActions ? [...COPY_ACTIONS, ...results] : results
  }, [query.data, showActions])

  return (
    <SearchDialog
      search={search}
      onSearchChange={setSearch}
      isLoading={query.isLoading}
      {...props}
    >
      <SearchDialogOverlay />
      <SearchDialogContent>
        <SearchDialogHeader>
          <SearchDialogIcon />
          <SearchDialogInput />
          <SearchDialogClose />
        </SearchDialogHeader>
        <SearchDialogList items={items} />
      </SearchDialogContent>
    </SearchDialog>
  )
}
