import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { source } from '@/app/source'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="font-semibold tracking-tight">Clarx</span>
        ),
      }}
      sidebar={{
        banner: null,
        collapsible: false,
      }}
    >
      {children}
    </DocsLayout>
  )
}
