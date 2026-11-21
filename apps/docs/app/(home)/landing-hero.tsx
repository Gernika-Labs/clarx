import Link from 'next/link'
import { BrandMark } from '@/components/brand-mark'
import { CopyButton } from '@/components/landing-interactive'
import { formatClarxVersion } from '@/lib/version'

export function Nav() {
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <BrandMark />
          Clarx
          <span className="ver mono">{formatClarxVersion()}</span>
        </Link>
        <nav className="nav-links" aria-label="Primary">
          <a className="nav-anchor" href="#standard">
            Standard
          </a>
          <a className="nav-anchor" href="#cli">
            CLI
          </a>
          <a className="nav-anchor" href="#manifest">
            Manifest
          </a>
          <Link href="/docs">Docs</Link>
        </nav>
        <a className="nav-cta mono" href="#cli">
          <span className="dollar">$</span>{' '}
          <span className="cta-full">npx clarx score .</span>
          <span className="cta-short">clarx score</span>
        </a>
      </div>
    </header>
  )
}

export function HeroSection() {
  return (
    <section className="hero" style={{ borderTop: 0 }}>
      <div className="wrap">
        <h1 className="hero-title">
          Is your codebase built
          <br className="break-md" />{' '}
          <span className="em">for AI agents?</span>
        </h1>

        <p className="hero-sub">
          <strong>Clarx</strong> scores how well your repository is structured for agents to find
          the right files, make safe changes, and verify their work.
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

        <div className="score-readout" aria-label="Sample score readout">
          <div className="score-side">
            <span className="lbl">Overall score</span>
            <div className="num mono">
              83
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
  )
}
