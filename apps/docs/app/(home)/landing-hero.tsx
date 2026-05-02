import Link from 'next/link'
import { CopyButton, ScoreCounter } from '@/components/landing-interactive'

export function Nav() {
  return (
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
  )
}

export function HeroSection() {
  return (
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
              <span className="name"><span className="ruleid">D</span>Discoverability</span>
              <span className="track"><span style={{ width: '72%' }} /></span>
              <span className="pct">72</span>
            </div>
            <div className="score-bar">
              <span className="name"><span className="ruleid">B</span>Boundary clarity</span>
              <span className="track"><span style={{ width: '94%' }} /></span>
              <span className="pct">94</span>
            </div>
            <div className="score-bar warn">
              <span className="name"><span className="ruleid">C</span>Context efficiency</span>
              <span className="track"><span style={{ width: '82%' }} /></span>
              <span className="pct">82</span>
            </div>
            <div className="score-bar">
              <span className="name"><span className="ruleid">O</span>Operational guidance</span>
              <span className="track"><span style={{ width: '100%' }} /></span>
              <span className="pct">100</span>
            </div>
            <div className="score-bar bad">
              <span className="name"><span className="ruleid">E</span>Edit safety</span>
              <span className="track"><span style={{ width: '66%' }} /></span>
              <span className="pct">66</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
