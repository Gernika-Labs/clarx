import Link from 'next/link'

export function AdoptionSection() {
  return (
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
              <div><span className="check">✓</span>Read the standard</div>
              <div><span className="check">✓</span>Apply rule names in review</div>
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
              <div><span className="check">✓</span>Manifest committed</div>
              <div><span className="check">✓</span>CLI in CI</div>
              <div><span className="check">✓</span>Scoring gate on PRs</div>
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
              <div><span className="check">✓</span>Manifest + CI</div>
              <div><span className="check">✓</span>Reference components</div>
              <div><span className="check">✓</span>Org-wide score dashboard</div>
            </div>
          </div>

          <svg className="tier-arrow a1" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 4l4 4-4 4" />
          </svg>
          <svg className="tier-arrow a2" width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 4l4 4-4 4" />
          </svg>
        </div>
      </div>
    </section>
  )
}

export function ManifestoSection() {
  return (
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
  )
}

export function FooterCtaSection() {
  return (
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
  )
}

export function Footer() {
  return (
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
  )
}
