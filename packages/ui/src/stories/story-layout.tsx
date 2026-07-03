import * as React from 'react'
import { cn } from '../utils'

type StoryPageProps = {
  title: string
  description: string
  children: React.ReactNode
}

type SectionProps = {
  title: string
  description?: string
  children: React.ReactNode
}

type PreviewCardProps = {
  title: string
  note?: string
  children: React.ReactNode
  className?: string
}

type PropRow = {
  name: string
  type: string
  defaultValue?: string
  description: string
}

type CodeExample = {
  title: string
  code: string
}

export function StoryPage({ title, description, children }: StoryPageProps) {
  return (
    <div className="min-h-screen bg-zinc-950 px-6 py-8 text-zinc-100 sm:px-8 lg:px-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-10">
        <header className="pb-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-zinc-500">
            Clarx UI
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-50">
            {title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">
            {description}
          </p>
        </header>
        {children}
      </div>
    </div>
  )
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="border-t border-[var(--clarx-panel-border)]/35 pt-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-50">{title}</h2>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  )
}

export function VariantGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
}

export function PreviewCard({
  title,
  note,
  children,
  className,
}: PreviewCardProps) {
  return (
    <div
      className={cn(
        'bg-zinc-950/40 p-0',
        className
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          {note ? <p className="mt-1 text-xs leading-5 text-zinc-500">{note}</p> : null}
        </div>
      </div>
      <div
        className="flex min-h-24 items-start rounded-2xl border border-[var(--clarx-panel-border)]/35 p-4"
        style={{ backgroundImage: 'var(--clarx-panel-blend)' }}
      >
        {children}
      </div>
    </div>
  )
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <div className="overflow-hidden border border-[var(--clarx-panel-border)]/35">
      <table className="w-full border-collapse text-left">
        <thead className="bg-[color:var(--clarx-synth-navy)]">
          <tr className="text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-4 py-3 font-semibold">Prop</th>
            <th className="px-4 py-3 font-semibold">Type</th>
            <th className="px-4 py-3 font-semibold">Default</th>
            <th className="px-4 py-3 font-semibold">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className="border-t border-[var(--clarx-panel-border)]/25 align-top text-sm">
              <td className="px-4 py-3 font-mono text-xs text-zinc-100">{row.name}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">{row.type}</td>
              <td className="px-4 py-3 font-mono text-xs text-zinc-400">
                {row.defaultValue ?? '—'}
              </td>
              <td className="px-4 py-3 text-zinc-300">{row.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function CodeExamples({ examples }: { examples: CodeExample[] }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {examples.map((example) => (
        <div
          key={example.title}
          className="overflow-hidden border border-[var(--clarx-panel-border)]/35 bg-[color:var(--clarx-deep-space)]"
        >
          <div className="border-b border-[var(--clarx-panel-border)]/30 px-4 py-3 text-sm font-semibold text-zinc-200">
            {example.title}
          </div>
          <pre className="overflow-x-auto p-4 text-xs leading-6 text-zinc-300">
            <code>{example.code}</code>
          </pre>
        </div>
      ))}
    </div>
  )
}
