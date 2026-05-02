import Link from 'next/link'
import styles from './landing.module.css'
import { CopyButton, ScoreCounter } from '@/components/landing-interactive'

const JSON_BODY = `<span class="pun">{</span>
  <span class="key">"version"</span><span class="pun">:</span> <span class="str">"0.1"</span><span class="pun">,</span>
  <span class="key">"purpose"</span><span class="pun">:</span> <span class="str">"AI-first design system and codebase standard"</span><span class="pun">,</span>
  <span class="key">"generatedDirectories"</span><span class="pun">:</span> <span class="pun">[</span>
    <span class="str">".next"</span><span class="pun">,</span> <span class="str">".source"</span><span class="pun">,</span> <span class="str">"dist"</span>
  <span class="pun">],</span>
  <span class="key">"verificationCommands"</span><span class="pun">: {</span>
    <span class="key">"typecheck"</span><span class="pun">:</span> <span class="str">"pnpm tsc --noEmit"</span><span class="pun">,</span>
    <span class="key">"test"</span><span class="pun">:</span> <span class="str">"pnpm test"</span><span class="pun">,</span>
    <span class="key">"lint"</span><span class="pun">:</span> <span class="str">"pnpm lint"</span>
  <span class="pun">},</span>
  <span class="key">"commonTaskLocations"</span><span class="pun">: {</span>
    <span class="key">"components"</span><span class="pun">:</span> <span class="str">"packages/ui/src/"</span><span class="pun">,</span>
    <span class="key">"engine rules"</span><span class="pun">:</span> <span class="str">"packages/engine/src/scoring/rules.ts"</span>
  <span class="pun">}</span>
<span class="pun">}</span>`

const BEFORE_CODE = `<span class="com">// Status badge</span>
<span class="pun">&lt;</span><span class="tag">span</span> <span class="attr">className</span><span class="pun">=</span><span class="str">"inline-flex items-center px-2 py-0.5
        rounded text-xs font-medium
        bg-red-100 text-red-800"</span><span class="pun">&gt;</span>
  Failed
<span class="pun">&lt;/</span><span class="tag">span</span><span class="pun">&gt;</span>`

const AFTER_CODE = `<span class="com">// Same output. Different contract.</span>
<span class="pun">&lt;</span><span class="tag">Badge</span> <span class="attr">intent</span><span class="pun">=</span><span class="str">"danger"</span> <span class="attr">keyword</span><span class="pun">=</span><span class="str">"failed"</span> <span class="pun">/&gt;</span>

<span class="pun">&lt;</span><span class="tag">Button</span> <span class="attr">intent</span><span class="pun">=</span><span class="str">"danger"</span><span class="pun">&gt;</span>Delete<span class="pun">&lt;/</span><span class="tag">Button</span><span class="pun">&gt;</span>`

export default function HomePage() {
  return (
    <div className={styles.root}>
      {/* NAV */}
      <header className="nav">
        <div className="nav-inner">
          <Link className="brand" href="/">
            <span className="brand-mark" />
            Clarx
            <span className="ver mono">v0.1.4</span>
          </Link>
          <div className="nav-links">
            <a href="#standard">Standard</a>
            <a href="#cli">CLI</a>
            <a href="#manifest">Manifest</a>
            <a href="#kit">UI Kit</a>
            <Link href="/docs">Docs</Link>
          </div>
          <a className="nav-cta mono" href="#cli">
            <span className="dollar">$</span> npx clarx score .
          </a>
        </div>
      </header>

      {/* HERO */}
      <section className="hero" style={{ borderTop: 0 }}>
        <div className="wrap">
          <div className="eyebrow">
            <span className="accent">CLARX</span>
            <span>The standard for AI-first codebases</span>
          </div>

          <h1 className="hero-title">
            Make your codebase
            <br />
            legible <span className="em">to AI.</span>
          </h1>

          <p className="hero-sub">
            <strong>Clarx</strong> scores your repository against five structural pillars, generates
            a manifest agents can follow, and gives you a semantic component vocabulary that means
            the same thing to engineers and AI.
          </p>

          <div className="hero-cmd-row">
            <div className="cmd mono">
              <span className="dollar">$</span>
              <span>clarx score .</span>
              <CopyButton />
            </div>
            <a className="read-spec" href="#standard">
              Read the standard →
            </a>
          </div>

          {/* Score readout */}
          <div className="score-readout" aria-label="Sample score readout">
            <div className="score-side">
              <span className="lbl">Overall score</span>
              <div className="num mono">
                <ScoreCounter target={83} />
                <span className="of">/100</span>
              </div>
              <div className="conf">
                <span className="pill">B+</span>
                <span>confidence: high</span>
              </div>
              <div className="meta">
                <span>$ clarx score .</span>
                <span>scope: 218 files · 4 packages</span>
                <span>2 warnings · 1 recommendation</span>
              </div>
            </div>
            <div className="score-bars">
              <div className="score-bar">
                <span className="name">
                  <span className="ruleid">D</span>Discoverability
                </span>
                <span className="track">
                  <span style={{ width: '72%' }} />
                </span>
                <span className="pct">72</span>
              </div>
              <div className="score-bar">
                <span className="name">
                  <span className="ruleid">B</span>Boundary clarity
                </span>
                <span className="track">
                  <span style={{ width: '94%' }} />
                </span>
                <span className="pct">94</span>
              </div>
              <div className="score-bar warn">
                <span className="name">
                  <span className="ruleid">C</span>Context efficiency
                </span>
                <span className="track">
                  <span style={{ width: '82%' }} />
                </span>
                <span className="pct">82</span>
              </div>
              <div className="score-bar">
                <span className="name">
                  <span className="ruleid">O</span>Operational guidance
                </span>
                <span className="track">
                  <span style={{ width: '100%' }} />
                </span>
                <span className="pct">100</span>
              </div>
              <div className="score-bar bad">
                <span className="name">
                  <span className="ruleid">E</span>Edit safety
                </span>
                <span className="track">
                  <span style={{ width: '66%' }} />
                </span>
                <span className="pct">66</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §01 PROBLEM */}
      <section id="problem">
        <div className="wrap">
          <div className="section-head">
            <div className="section-label">
              <span className="id">§01</span>The problem
            </div>
            <h2 className="section-title">
              Your codebase isn&apos;t broken.
              <br />
              It wasn&apos;t designed for agents.
            </h2>
            <p className="section-lede">
              Three failure modes agents hit in unprepared repos. Each is detected by a Clarx rule.
            </p>
          </div>

          <div className="problem-grid">
            <div className="problem-cell">
              <div className="head">
                <div className="ttl">Context waste</div>
                <span className="rule mono">C1</span>
              </div>
              <div className="desc">Agent loads 12 files to answer a question that touched 2.</div>
              <div className="signal mono">
                <span className="down">●</span> Context efficiency · –24
              </div>
            </div>
            <div className="problem-cell">
              <div className="head">
                <div className="ttl">Unsafe edits</div>
                <span className="rule mono">E3</span>
              </div>
              <div className="desc">
                Agent modifies a shared utility with 40 callsites. No signal it&apos;s load-bearing.
              </div>
              <div className="signal mono">
                <span className="down">●</span> Edit safety · –31
              </div>
            </div>
            <div className="problem-cell">
              <div className="head">
                <div className="ttl">Lost guidance</div>
                <span className="rule mono">O1</span>
              </div>
              <div className="desc">
                Agent doesn&apos;t know how to verify its work. No manifest. No verification command.
              </div>
              <div className="signal mono">
                <span className="down">●</span> Operational guidance · capped at 50
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §02 FIVE PILLARS */}
      <section id="standard">
        <div className="wrap">
          <div className="section-head">
            <div className="section-label">
              <span className="id">§02</span>The five pillars
            </div>
            <h2 className="section-title">A scoring framework, not a magic number.</h2>
            <p className="section-lede">
              Five structural properties. Each weighted 20%. Each auditable. Score capped if a hard
              rule fails.
            </p>
          </div>

          <div className="pillars">
            <article className="pillar">
              <div className="row1">
                <span className="num mono">01 · DISCOVERABILITY</span>
                <span className="weight mono">20%</span>
              </div>
              <h3>Find the right file in two attempts.</h3>
              <p className="def">
                An agent should locate any module by name, purpose, or callsite without reading
                implementations.
              </p>
              <div className="rule-card">
                <span className="id">D2</span>
                Every package directory must contain a{' '}
                <span style={{ color: 'var(--term-blue)' }}>PURPOSE</span> statement.
              </div>
            </article>

            <article className="pillar">
              <div className="row1">
                <span className="num mono">02 · BOUNDARY CLARITY</span>
                <span className="weight mono">20%</span>
              </div>
              <h3>Infer ownership without reading code.</h3>
              <p className="def">
                Module boundaries are explicit at the file system level. Imports cross them
                deliberately, not casually.
              </p>
              <div className="rule-card">
                <span className="id">B4</span>
                A module&apos;s public API must live in one entry file; deep imports flagged.
              </div>
            </article>

            <article className="pillar">
              <div className="row1">
                <span className="num mono">03 · CONTEXT EFFICIENCY</span>
                <span className="weight mono">20%</span>
              </div>
              <h3>Complete a task loading ≤5 files.</h3>
              <p className="def">
                Average task footprint stays low. Files have one job. Cross-cutting concerns are
                factored, not threaded.
              </p>
              <div className="rule-card">
                <span className="id">C3</span>
                File length capped at 400 lines; warnings emitted at 300.
              </div>
            </article>

            <article className="pillar">
              <div className="row1">
                <span className="num mono">04 · OPERATIONAL GUIDANCE</span>
                <span className="weight mono">20%</span>
              </div>
              <h3>Tell an agent how to work.</h3>
              <p className="def">
                The repo declares its verification commands, generated paths, and task locations in a
                single manifest.
              </p>
              <div className="rule-card">
                <span className="hard">Hard failure</span>
                <span className="id"> · O1</span>
                No <span style={{ color: 'var(--term-blue)' }}>clarx-manifest.json</span> → score
                capped at 50.
              </div>
            </article>

            <article className="pillar span2">
              <div className="row1">
                <span className="num mono">05 · EDIT SAFETY</span>
                <span className="weight mono">20%</span>
              </div>
              <h3>Make incorrect changes structurally hard.</h3>
              <p className="def">
                Load-bearing files are signalled. Utility sprawl is bounded. The blast radius of any
                single edit is visible from the file alone.
              </p>
              <div className="rule-card">
                <span className="id">E2</span>
                Utility files capped at 20 exports; over-cap files require a{' '}
                <span style={{ color: 'var(--term-blue)' }}>@callsites</span> tag.
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* §03 CLI DEMO */}
      <section id="cli">
        <div className="wrap">
          <div className="section-head">
            <div className="section-label">
              <span className="id">§03</span>The CLI
            </div>
            <h2 className="section-title">Run it on your repo. Read the score.</h2>
            <p className="section-lede">No telemetry. No login. The scoring engine is open source.</p>
          </div>

          <div className="terminal">
            <div className="term-bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span className="label mono">~/work/your-repo — clarx</span>
              <span className="right mono">zsh</span>
            </div>
            <div className="term-body">
              <div>
                <span className="prompt">$ </span>
                <span className="cmdtxt">clarx score .</span>
              </div>
              <div className="ver">clarx v0.1.4 · scoring 218 files…</div>
              <div className="row">
                <span className="name">Discoverability</span>
                <span className="bar">
                  <span className="filled">████████████░░░░</span>
                </span>
                <span className="num">72</span>
                <span className="note">clean root, missing purpose stmts</span>
              </div>
              <div className="row">
                <span className="name">Boundary clarity</span>
                <span className="bar">
                  <span className="filled">███████████████░</span>
                </span>
                <span className="num">94</span>
                <span className="note ok">✓</span>
              </div>
              <div className="row">
                <span className="name">Context efficiency</span>
                <span className="bar warn">
                  <span className="filled">█████████████░░░</span>
                </span>
                <span className="num">82</span>
                <span className="note warn">3 files over 400 lines</span>
              </div>
              <div className="row">
                <span className="name">Operational guidance</span>
                <span className="bar">
                  <span className="filled">████████████████</span>
                </span>
                <span className="num">100</span>
                <span className="note ok">✓</span>
              </div>
              <div className="row">
                <span className="name">Edit safety</span>
                <span className="bar bad">
                  <span className="filled">██████████░░░░░░</span>
                </span>
                <span className="num">66</span>
                <span className="note bad">2 utility files over 20 exports</span>
              </div>
              <div className="total">
                <span className="name">Overall score</span>
                <span className="v">
                  83 / 100<span className="conf">(confidence: high)</span>
                </span>
              </div>
              <div className="summary">
                <span className="warn">2 warnings</span> · 1 recommendation
              </div>
              <div className="summary">
                Run <span className="acc">clarx explain C3</span> for details
                <span className={styles.cursor} />
              </div>
            </div>
          </div>

          <div className="cmd-pills">
            <div className="cmd-pill">
              <div className="c">
                <span className="dollar">$</span>clarx score
              </div>
              <div className="d">Score the current repo against all five pillars.</div>
            </div>
            <div className="cmd-pill">
              <div className="c">
                <span className="dollar">$</span>clarx init
              </div>
              <div className="d">
                Generate a starting <span className="mono">clarx-manifest.json</span> from your repo
                shape.
              </div>
            </div>
            <div className="cmd-pill">
              <div className="c">
                <span className="dollar">$</span>clarx explain &lt;rule&gt;
              </div>
              <div className="d">Print rule rationale, examples, and the fix path.</div>
            </div>
          </div>
        </div>
      </section>

      {/* §04 MANIFEST */}
      <section id="manifest">
        <div className="wrap">
          <div className="section-head">
            <div className="section-label">
              <span className="id">§04</span>The manifest
            </div>
            <h2 className="section-title">One file. The on-ramp to every other pillar.</h2>
            <p className="section-lede">
              Agents know where to look, what to skip, and how to verify their work. Works with any
              stack — drop it in alongside your <span className="mono">package.json</span>.
            </p>
          </div>

          <div className="manifest-row">
            <div className="manifest-text">
              <h3>Why a manifest, not docs?</h3>
              <p>
                Documentation is read once, by humans, when motivation is high. A manifest is read
                every time, by every agent, in every session. It&apos;s load-bearing infrastructure for
                AI workflows.
              </p>
              <p>
                It&apos;s three things together: an intent declaration, a navigation map, and a
                verification contract.
              </p>
              <div className="tags">
                <span className="tag">stack-agnostic</span>
                <span className="tag">~30 lines</span>
                <span className="tag">version-pinned</span>
                <span className="tag">CI-checked</span>
              </div>
            </div>
            <div className="json-card">
              <div className="json-tabs">
                <div className="json-tab active">
                  clarx-manifest.json<span className="check">✓ valid</span>
                </div>
                <div className="json-tab">.clarxignore</div>
              </div>
              {/* eslint-disable-next-line react/no-danger */}
              <pre className="json-body" dangerouslySetInnerHTML={{ __html: JSON_BODY }} />
            </div>
          </div>
        </div>
      </section>

      {/* §05 SEMANTIC UI KIT */}
      <section id="kit">
        <div className="wrap">
          <div className="section-head">
            <div className="section-label">
              <span className="id">§05</span>The semantic UI kit
            </div>
            <h2 className="section-title">A component API that speaks in intent.</h2>
            <p className="section-lede">
              Legible to AI tools, design tokens, and the engineer on call at 2am.
            </p>
          </div>

          <div className="compare">
            <div className="col">
              <div className="col-head">
                <span className="ttl">Before · utility sprawl</span>
                <span className="badge mono">opaque</span>
              </div>
              {/* eslint-disable-next-line react/no-danger */}
              <div className="codeblock" dangerouslySetInnerHTML={{ __html: BEFORE_CODE }} />
              <div className="preview-row">
                <span className="badge-old">Failed</span>
                <button className="btn-old">Delete</button>
              </div>
            </div>
            <div className="col">
              <div className="col-head">
                <span className="ttl">After · semantic Clarx</span>
                <span className="badge mono">intent-driven</span>
              </div>
              {/* eslint-disable-next-line react/no-danger */}
              <div className="codeblock" dangerouslySetInnerHTML={{ __html: AFTER_CODE }} />
              <div className="preview-row">
                <span className="badge-new" data-intent="danger">
                  <span className="dot" />
                  Failed
                </span>
                <span className="badge-new" data-intent="warn">
                  <span className="dot" />
                  Pending
                </span>
                <span className="badge-new" data-intent="success">
                  <span className="dot" />
                  Healthy
                </span>
                <button className="btn-new" data-intent="primary">
                  Save
                </button>
                <button className="btn-new" data-intent="danger">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §06 ADOPTION */}
      <section id="adoption">
        <div className="wrap">
          <div className="section-head">
            <div className="section-label">
              <span className="id">§06</span>Adoption
            </div>
            <h2 className="section-title">Start where you are.</h2>
            <p className="section-lede">
              The standard works without the components. The components work without the CLI.
              Everything gets better together.
            </p>
          </div>

          <div className="tiers">
            <div className="tier">
              <span className="step mono">01 · Lightest</span>
              <h3>Philosophy</h3>
              <div className="desc">
                Use the vocabulary and the thinking. Talk about discoverability and edit safety in
                PRs. No code changes.
              </div>
              <div className="what">
                <div>
                  <span className="check">✓</span>Read the standard
                </div>
                <div>
                  <span className="check">✓</span>Apply rule names in review
                </div>
              </div>
            </div>
            <div className="tier">
              <span className="step mono">02 · Medium</span>
              <h3>Rules only</h3>
              <div className="desc">
                Add <span className="mono">clarx-manifest.json</span> and guidance files. Run{' '}
                <span className="mono">clarx score</span> in CI. Works with any stack.
              </div>
              <div className="what">
                <div>
                  <span className="check">✓</span>Manifest committed
                </div>
                <div>
                  <span className="check">✓</span>CLI in CI
                </div>
                <div>
                  <span className="check">✓</span>Scoring gate on PRs
                </div>
              </div>
            </div>
            <div className="tier">
              <span className="step mono">03 · Full</span>
              <h3>Full adoption</h3>
              <div className="desc">
                Standard + CLI + reference components. The same intent vocabulary from the README to
                the runtime.
              </div>
              <div className="what">
                <div>
                  <span className="check">✓</span>Manifest + CI
                </div>
                <div>
                  <span className="check">✓</span>Reference components
                </div>
                <div>
                  <span className="check">✓</span>Org-wide score dashboard
                </div>
              </div>
            </div>

            <svg
              className="tier-arrow a1"
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 4l4 4-4 4" />
            </svg>
            <svg
              className="tier-arrow a2"
              width="20"
              height="20"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M5 4l4 4-4 4" />
            </svg>
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <section className="manifesto">
        <div className="wrap-narrow">
          <div className="quote-mark">▎</div>
          <blockquote>
            The interface is not a decoration layer.
            <br />
            <span className="dim">It is a communication layer.</span>
          </blockquote>
          <cite>— from the Clarx standard, §0 · Premise</cite>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="footer-cta">
        <div className="wrap">
          <p className="lede">
            Two paths in.
            <br />
            <span className="em">Pick the one that fits today.</span>
          </p>
          <div className="paths">
            <div className="path">
              <span className="lbl">Run it now</span>
              <div className="cmd-text mono">
                <span className="dollar">$</span>npx clarx score .
                <span className="arrow">→</span>
              </div>
              <span className="sub">Zero install. Reads your repo, prints a score, exits.</span>
            </div>
            <Link className="path" href="/docs/standard/overview">
              <span className="lbl">Read the standard</span>
              <div className="cmd-text">
                The Clarx specification
                <span className="arrow">→</span>
              </div>
              <span className="sub">29 rules across 5 pillars. Open source. Versioned.</span>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="foot">
        <div className="wrap">
          <div className="foot-inner">
            <span className="copy">© 2026 · Clarx · v0.1.4 · MIT licensed</span>
            <nav>
              <a href="#standard">Standard</a>
              <a href="#cli">CLI</a>
              <a href="#manifest">Manifest</a>
              <Link href="https://github.com/clarxai/clarx">GitHub</Link>
              <Link href="/docs/changelog">Changelog</Link>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  )
}
