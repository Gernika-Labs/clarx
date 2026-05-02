import Link from 'next/link'

const productBlocks = [
  {
    title: 'Standard',
    body: 'A versioned rubric for what makes a repository legible to AI agents.',
  },
  {
    title: 'Engine',
    body: 'Structural analysis across five pillars, with rule-level output and confidence.',
  },
  {
    title: 'CLI',
    body: 'Run `clarx score`, initialize guidance, and gate quality in local workflows or CI.',
  },
  {
    title: 'UI',
    body: 'Semantic interface primitives for chat, tool calls, streaming, and agent status.',
  },
]

const pillars = [
  'Discoverability',
  'Boundary Clarity',
  'Context Efficiency',
  'Operational Guidance',
  'Edit Safety',
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <header className="border-b border-zinc-200/80">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5 sm:px-8">
          <Link
            href="/"
            className="flex items-center gap-[10px] rounded-2xl px-2 py-1 text-zinc-950"
          >
            <span className="relative h-[18px] w-[18px] shrink-0 rounded-[4px] bg-zinc-950 after:absolute after:inset-[4px] after:rounded-[1px] after:bg-white after:content-['']" />
            <span className="text-[18px] font-semibold tracking-[-0.01em]">Clarx</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/clarxai/clarx"
              className="text-[15px] text-zinc-500 transition-colors hover:text-zinc-950"
            >
              GitHub
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center rounded-xl bg-zinc-950 px-5 text-[15px] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Open docs →
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-16 pt-24 sm:px-8 sm:pb-24 sm:pt-32">
        <div className="max-w-5xl">
          <div className="inline-flex items-center gap-3 rounded-full border border-zinc-200 px-4 py-2 text-sm text-zinc-500">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="font-mono">v0.1.2 · AI-First Codebase Standard</span>
          </div>

          <h1 className="mt-10 max-w-5xl text-[54px] font-semibold tracking-[-0.05em] text-zinc-950 sm:text-[86px] sm:leading-[0.95]">
            Continuous repository
            <br />
            scoring <span className="text-zinc-400">for teams</span>
            <br />
            <span className="text-zinc-400">shipping with AI.</span>
          </h1>

          <p className="mt-10 max-w-4xl text-xl leading-10 text-zinc-500 sm:text-[22px]">
            Clarx measures how safely and efficiently an AI agent can navigate, modify,
            and verify changes in your repository across five pillars, 25 rules, with
            scores that improve as teams codify intent.
          </p>

          <div className="mt-12 flex flex-wrap items-center gap-4">
            <Link
              href="/docs/introduction"
              className="inline-flex h-12 items-center rounded-xl bg-zinc-950 px-6 text-lg font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Get started →
            </Link>
            <Link
              href="/docs/standard/overview"
              className="inline-flex h-12 items-center rounded-xl border border-zinc-200 px-6 text-lg font-medium text-zinc-950 transition-colors hover:bg-zinc-50"
            >
              Explore the standard
            </Link>
            <code className="text-sm text-zinc-400 sm:ml-2">npx clarx score</code>
          </div>
        </div>

        <div className="mt-20 grid gap-6 border-t border-zinc-200 pt-8 text-sm text-zinc-500 sm:grid-cols-4">
          <Stat label="Scoring model" value="5 pillars" />
          <Stat label="Rule system" value="25 checks" />
          <Stat label="Analysis output" value="Score + confidence" />
          <Stat label="Surface area" value="Standard, engine, CLI, UI" />
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[28px] border border-zinc-200 bg-white p-6 sm:p-8">
            <div className="grid gap-8 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Authored intent</p>
                <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5">
                  <ul className="space-y-3 text-sm text-zinc-600">
                    <li className="flex items-center gap-3">
                      <span className="text-green-600">✓</span>
                      Generated directories are declared
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-600">✓</span>
                      Verification commands are explicit
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-600">✓</span>
                      Common task locations are known
                    </li>
                    <li className="flex items-center gap-3">
                      <span className="text-green-600">✓</span>
                      High-risk files are named up front
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Rendered behavior</p>
                <div className="mt-6 space-y-4 rounded-2xl border border-zinc-200 bg-zinc-50/60 p-5">
                  <SignalRow label="Discoverability" value="92" tone="good" />
                  <SignalRow label="Boundary Clarity" value="88" tone="good" />
                  <SignalRow label="Context Efficiency" value="81" tone="good" />
                  <SignalRow label="Operational Guidance" value="95" tone="good" />
                  <SignalRow label="Edit Safety" value="84" tone="warn" />
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-[28px] border border-zinc-200 bg-zinc-50/60 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-zinc-200 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">How Clarx compounds</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-950">
                  The repository teaches the system.
                </h2>
              </div>
              <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs text-zinc-500">
                confidence: high
              </span>
            </div>

            <div className="mt-6 space-y-5 text-[15px] leading-7 text-zinc-600">
              <p>
                Clarx gets sharper as teams add manifests, document verification paths,
                and codify where work belongs.
              </p>
              <p>
                The result is a stronger contract between people, code, and the agents
                operating inside the repository.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {pillars.map((pillar) => (
                <div
                  key={pillar}
                  className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600"
                >
                  <span>{pillar}</span>
                  <span className="font-mono text-zinc-400">system pillar</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-zinc-50/40">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">System</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-950 sm:text-4xl">
              Open infrastructure for AI-first software.
            </h2>
            <p className="mt-5 text-lg leading-8 text-zinc-500">
              Clarx is not another coding assistant. It is the standard, analysis layer,
              and semantic interface system underneath safer AI-assisted development.
            </p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {productBlocks.map((block) => (
              <article
                key={block.title}
                className="rounded-[24px] border border-zinc-200 bg-white p-6"
              >
                <h3 className="text-lg font-semibold tracking-tight text-zinc-950">
                  {block.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-zinc-500">{block.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-400">{label}</p>
      <p className="mt-2 text-base font-medium text-zinc-700">{value}</p>
    </div>
  )
}

function SignalRow({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'good' | 'warn'
}) {
  const dotClass = tone === 'good' ? 'bg-green-500' : 'bg-amber-500'

  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3">
      <div className="flex items-center gap-3">
        <span className={`h-2.5 w-2.5 rounded-full ${dotClass}`} />
        <span className="text-sm text-zinc-600">{label}</span>
      </div>
      <span className="font-mono text-sm text-zinc-400">{value}</span>
    </div>
  )
}
