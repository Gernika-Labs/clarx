export function ProblemSection() {
  return (
    <section id="problem">
      <div className="wrap">
        <div className="section-head">
          <div className="section-label">
            <span className="id">§01</span>The problem
          </div>
          <h2 className="section-title">
            Your codebase isn&apos;t broken.
            <br className="break-md" />{' '}
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
  )
}

export function PillarsSection() {
  return (
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
  )
}
