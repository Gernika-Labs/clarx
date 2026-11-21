import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import type { ReactNode } from 'react'
import { source } from '@/app/source'
import { BrandMark } from '@/components/brand-mark'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <DocsLayout
      tree={source.pageTree}
      nav={{
        title: (
          <span className="inline-flex items-center gap-2 font-semibold tracking-tight">
            <BrandMark />
            Clarx
          </span>
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
