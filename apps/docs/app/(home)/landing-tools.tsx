import styles from './landing.module.css'
import { JSON_BODY, BEFORE_CODE, AFTER_CODE } from './landing-content'

export function CliSection() {
  return (
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
              <span className="bar-track">
                <span className="bar-fill" style={{ width: '72%' }} />
              </span>
              <span className="num">72</span>
              <span className="note">clean root, missing purpose stmts</span>
            </div>
            <div className="row">
              <span className="name">Boundary clarity</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: '94%' }} />
              </span>
              <span className="num">94</span>
              <span className="note ok">✓</span>
            </div>
            <div className="row">
              <span className="name">Context efficiency</span>
              <span className="bar-track warn">
                <span className="bar-fill" style={{ width: '82%' }} />
              </span>
              <span className="num">82</span>
              <span className="note warn">3 files over 400 lines</span>
            </div>
            <div className="row">
              <span className="name">Operational guidance</span>
              <span className="bar-track">
                <span className="bar-fill" style={{ width: '100%' }} />
              </span>
              <span className="num">100</span>
              <span className="note ok">✓</span>
            </div>
            <div className="row">
              <span className="name">Edit safety</span>
              <span className="bar-track bad">
                <span className="bar-fill" style={{ width: '66%' }} />
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
            <div className="c"><span className="dollar">$</span>clarx score</div>
            <div className="d">Score the current repo against all five pillars.</div>
          </div>
          <div className="cmd-pill">
            <div className="c"><span className="dollar">$</span>clarx init</div>
            <div className="d">
              Generate a starting <span className="mono">clarx-manifest.json</span> from your repo shape.
            </div>
          </div>
          <div className="cmd-pill">
            <div className="c"><span className="dollar">$</span>clarx explain &lt;rule&gt;</div>
            <div className="d">Print rule rationale, examples, and the fix path.</div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function ManifestSection() {
  return (
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
  )
}

export function UIKitSection() {
  return (
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
                <span className="dot" />Failed
              </span>
              <span className="badge-new" data-intent="warn">
                <span className="dot" />Pending
              </span>
              <span className="badge-new" data-intent="success">
                <span className="dot" />Healthy
              </span>
              <button className="btn-new" data-intent="primary">Save</button>
              <button className="btn-new" data-intent="danger">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
