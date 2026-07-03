import { ClarxLogo } from './clarx-logo'

const meta = {
  title: 'Screens/ScoreWatch',
  parameters: {
    docs: { disable: true },
    controls: { disable: true },
  },
}

export default meta

type RuleChipProps = {
  label: string
  tone: 'warning' | 'recommendation' | 'neutral'
}

function RuleChip({ label, tone }: RuleChipProps) {
  const styles =
    tone === 'warning'
      ? 'text-amber-300'
      : tone === 'recommendation'
        ? 'text-cyan-300'
        : 'text-zinc-400'

  return (
    <span className={`inline-flex items-center text-[1.1rem] ${styles}`}>
      {label}
    </span>
  )
}

function ScoreRow({
  label,
  score,
}: {
  label: string
  score: string
}) {
  return (
    <div className="grid grid-cols-[1fr_auto] items-center gap-6 py-1">
      <span className="text-[2rem] leading-none text-zinc-100 sm:text-[2.4rem]">
        {label}
      </span>
      <span className="text-[2rem] font-semibold leading-none text-zinc-50 sm:text-[2.4rem]">
        {score}
      </span>
    </div>
  )
}

function CommandHint({
  tone,
  children,
}: {
  tone: 'muted' | 'accent'
  children: React.ReactNode
}) {
  return (
    <span className={tone === 'accent' ? 'text-zinc-100' : 'text-zinc-500'}>
      {children}
    </span>
  )
}

function ScoreWatchScreen() {
  return (
    <div className="bg-black font-mono text-zinc-100">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-8 px-8 py-8 sm:px-10">
        <div>
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
            <div className="flex items-baseline gap-8">
              <ClarxLogo size="lg" className="text-[3rem] sm:text-[4.4rem]" />
              <span className="font-mono text-[3rem] font-semibold leading-none text-zinc-50 sm:text-[4.4rem]">
                score
              </span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-[3rem] font-semibold leading-none text-cyan-400 sm:text-[4.4rem]">
                95
              </span>
              <span className="text-[3rem] font-semibold leading-none text-zinc-100 sm:text-[4.4rem]">
                / 100
              </span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[1.6rem] text-zinc-400 sm:text-[2rem]">
            <span>
              Confidence <span className="text-zinc-100">high</span>
            </span>
            <span className="text-zinc-700">•</span>
            <span>Engine v0.1.8</span>
            <span className="text-zinc-700">•</span>
            <span>220 files</span>
            <span className="text-zinc-700">•</span>
            <span>watch mode</span>
          </div>
        </div>

        <div className="space-y-2 text-[2.8rem] leading-none sm:text-[4rem]">
          <div className="text-zinc-100">
            Hard failures: <span className="text-zinc-50">0</span>
          </div>
          <div className="text-amber-300">
            Warnings: <span className="text-zinc-50">1</span>
          </div>
          <div className="text-cyan-300">
            Recommendations: <span className="text-zinc-50">2</span>
          </div>
        </div>

        <div>
          <div className="mb-3 text-[2.4rem] font-semibold text-zinc-100 sm:text-[3.2rem]">
            Pillars
          </div>
          <div className="space-y-1">
            <ScoreRow label="discoverability" score="100" />
            <ScoreRow label="boundary_clarity" score="100" />
            <ScoreRow label="context_efficiency" score="75" />
            <ScoreRow label="operational_guidance" score="100" />
            <ScoreRow label="edit_safety" score="100" />
          </div>
        </div>

        <div>
          <div className="mb-3 text-[2.4rem] font-semibold text-zinc-100 sm:text-[3.2rem]">
            Top issue
          </div>
          <div className="text-[2.3rem] leading-tight text-amber-300 sm:text-[3.3rem]">
            C3 · 1 file import from more than 15 modules
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <RuleChip label="Warnings C3" tone="warning" />
            <RuleChip label="Recs C4" tone="recommendation" />
            <RuleChip label="Recs E2" tone="recommendation" />
          </div>
        </div>

        <div>
          <div className="mb-3 text-[2.1rem] text-zinc-400 sm:text-[2.6rem]">
            Command prompt
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-2 text-[1.4rem] sm:text-[1.9rem]">
            <CommandHint tone="muted">Type a rule ID</CommandHint>
            <CommandHint tone="muted">·</CommandHint>
            <CommandHint tone="accent">C1</CommandHint>
            <CommandHint tone="muted">·</CommandHint>
            <CommandHint tone="accent">C</CommandHint>
            <CommandHint tone="muted">·</CommandHint>
            <CommandHint tone="accent">show all</CommandHint>
            <CommandHint tone="muted">·</CommandHint>
            <CommandHint tone="accent">copy all</CommandHint>
            <CommandHint tone="muted">·</CommandHint>
            <CommandHint tone="accent">copy E2</CommandHint>
            <CommandHint tone="muted">·</CommandHint>
            <CommandHint tone="accent">r</CommandHint>
            <CommandHint tone="muted">via command</CommandHint>
          </div>

          <div className="mt-5 flex items-center gap-3 text-[2rem] text-zinc-400 sm:text-[2.8rem]">
            <span className="text-cyan-400">›</span>
            <span>Type a command and press Enter</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-x-3 gap-y-2 text-[1.4rem] sm:text-[1.9rem]">
            <CommandHint tone="muted">History:</CommandHint>
            <CommandHint tone="accent">↑ older</CommandHint>
            <CommandHint tone="muted">·</CommandHint>
            <CommandHint tone="accent">↓ newer</CommandHint>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Showcase = {
  render: () => (
    <ScoreWatchScreen />
  ),
}
