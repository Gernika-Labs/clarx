import { exit } from 'node:process';
import { copyToClipboard } from '../utils/clipboard.js';
import { track } from '../utils/telemetry.js';

const RULE_EXPLANATIONS: Record<string, { title: string; severity: string; pillar: string; why: string; fix: string }> = {
  D1: { title: 'Root directory has ≤10 meaningful entries', severity: 'warning', pillar: 'Discoverability', why: 'Noise at the root forces an agent to scan everything before understanding anything. Every extra entry is a context cost.', fix: 'Move config files into a config/ directory, consolidate scripts, and ensure only top-level workspace directories are visible at the root.' },
  D2: { title: 'Every workspace or package has a one-line purpose statement', severity: 'warning', pillar: 'Discoverability', why: 'An agent that cannot read purpose from a file name alone must open the file — that costs context.', fix: 'Add a README.md to each workspace/package with at least one sentence describing what it owns. Or declare workspaces in clarx-manifest.json.' },
  D3: { title: 'Source, test, config, and generated directories are segregated', severity: 'warning', pillar: 'Discoverability', why: 'Mixing file types forces an agent to classify every file before using it.', fix: 'Move tests to __tests__/ or co-locate them with source files. Keep config in a dedicated directory.' },
  D4: { title: 'No utility dumping ground files', severity: 'warning', pillar: 'Discoverability', why: 'Files named utils.ts, helpers.ts, misc.ts, or common.ts carry no semantic information. An agent must read the whole file to understand what\'s inside.', fix: 'Split utility files by domain. utils/date.ts, utils/formatting.ts, utils/validation.ts are all better than utils.ts.' },
  D5: { title: 'Directory depth does not exceed 5 levels before a module boundary', severity: 'recommendation', pillar: 'Discoverability', why: 'Deep nesting without semantic meaning forces an agent to traverse multiple directories to understand structure.', fix: 'Introduce a package or clear domain directory boundary before depth 5.' },
  B1: { title: 'No circular imports between packages or workspaces', severity: 'hard_failure', pillar: 'Boundary Clarity', why: 'Circular dependencies make it impossible to reason about change scope. No agent can safely modify either side of a cycle in isolation.', fix: 'Use madge or tsc --project to detect cycles. Extract shared code into a third package that neither side owns.' },
  B2: { title: 'Shared code lives in a declared shared package', severity: 'warning', pillar: 'Boundary Clarity', why: 'Duplicated logic across packages means a change in one place does not propagate. An agent has no way to know which copy is canonical.', fix: 'Create a packages/shared (or packages/common) package and extract duplicated code there.' },
  B3: { title: 'Each package or workspace declares a public API surface', severity: 'warning', pillar: 'Boundary Clarity', why: 'Without an index.ts, an agent cannot know what is internal versus stable surface without reading every file.', fix: 'Add an index.ts to each package that explicitly exports only the public interface.' },
  B4: { title: 'UI primitives and application logic are in separate locations', severity: 'recommendation', pillar: 'Boundary Clarity', why: 'Generic reusable components mixed with screen-specific logic mean an agent building a new screen cannot tell what is safe to reuse without reading every file in the directory.', fix: 'Keep generic primitives (Button, Input, Badge) in a components/ui/ or packages/ui/ directory. Keep page-specific components in their feature directory.' },
  B5: { title: 'Test files mirror source structure or are co-located', severity: 'recommendation', pillar: 'Boundary Clarity', why: 'Scattered test files force an agent to search for coverage rather than predict it. An agent that cannot find the test for a file it edited cannot verify its change.', fix: 'Either co-locate tests next to source files (Button.tsx → Button.test.tsx) or mirror the source tree under a __tests__/ directory. Pick one pattern and apply it consistently.' },
  C1: { title: 'Generated artifacts are excluded from the source tree', severity: 'hard_failure', pillar: 'Context Efficiency', why: 'An agent that encounters generated files in a source tree cannot tell what is hand-written versus computed. It may attempt to edit generated output.', fix: 'Add generated directories to .gitignore and declare them in clarx-manifest.json. Never commit build output to source directories.' },
  C2: { title: 'No source file exceeds 400 lines', severity: 'warning', pillar: 'Context Efficiency', why: 'An agent asked to make a targeted change to a 900-line file must load the entire file to locate the relevant section.', fix: 'Split large files by responsibility. Extract types, constants, and helpers into separate files. Declare justified exceptions (registries, token maps) in clarx-manifest.json.' },
  C3: { title: 'No file imports from more than 15 distinct modules', severity: 'warning', pillar: 'Context Efficiency', why: 'A file with 20+ imports is likely a coordination layer mixing concerns that belong in separate files. Every import is a potential context chain an agent must follow to understand what the file does.', fix: 'Split coordination files by concern. If a file is a known registry or hub (e.g. an MDX component map), declare it in manifest.highFanIn to exempt it from this rule.' },
  C4: { title: 'High fan-in files are documented', severity: 'recommendation', pillar: 'Context Efficiency', why: 'A file imported by 10 or more other files is an architectural load-bearing point. A change to it has wide blast radius. An agent has no way to know this without being told.', fix: 'Add the file path to the highFanIn array in clarx-manifest.json. This signals to any agent that changes here require extra caution and broader verification.' },
  C5: { title: 'Import graph depth does not exceed 8 hops from entry to leaf', severity: 'recommendation', pillar: 'Context Efficiency', why: 'A chain of 12 imports means an agent following a call must load 12 files to understand the full path. Context is consumed before the relevant code is reached.', fix: 'Introduce an abstraction boundary or facade that flattens the import chain. Avoid deep re-export chains.' },
  C6: { title: 'Entry files expose a local boundary surface before infrastructure', severity: 'recommendation', pillar: 'Context Efficiency', why: 'The cost of a task is not just how many files an agent opens, but how many abstraction layers it must cross. Entry files that coordinate hooks, queries, services, and types directly force dependency tracing. A local boundary surface gives the agent one explicit place to stop.', fix: 'Introduce a nearby view-model, presenter, facade, or adapter for entry files that import multiple infrastructure dependencies. The entry file should consume that surface instead of reconstructing data ownership from lower layers.' },
  O1: { title: 'A machine-readable guidance file exists', severity: 'hard_failure', pillar: 'Operational Guidance', why: 'Without any guidance file, an agent has no declared entry point for understanding the project. It must guess at conventions and structure.', fix: 'Create a CLAUDE.md or AGENTS.md at the repo root, or add a clarx-manifest.json. These are not optional — they are the minimum contract between the repo and any AI agent.' },
  O2: { title: 'Guidance file declares generated directories', severity: 'warning', pillar: 'Operational Guidance', why: 'An agent that edits generated output wastes a full round trip and may break the build.', fix: 'Add a "generated" section to clarx-manifest.json or a "Do not edit" section to CLAUDE.md listing all generated directories.' },
  O3: { title: 'Guidance file declares verification commands', severity: 'warning', pillar: 'Operational Guidance', why: 'An agent that cannot verify its changes cannot close the loop. It must ask or guess.', fix: 'Add verificationCommands to clarx-manifest.json with at minimum typecheck, test, and lint.' },
  O4: { title: 'Guidance file declares where common changes belong', severity: 'warning', pillar: 'Operational Guidance', why: 'An agent should never guess where a standard change goes. That guess costs a round trip at minimum.', fix: 'Add a commonTasks section to clarx-manifest.json or a "Common changes" section to CLAUDE.md.' },
  O5: { title: 'Architecture document identifies high-risk files', severity: 'recommendation', pillar: 'Operational Guidance', why: 'High fan-in files, shared utilities, and other architectural load points are invisible to an agent unless they are named. An agent that edits a file imported by 20 others may not realize the blast radius.', fix: 'Add a highFanIn array to clarx-manifest.json listing files where changes have wide impact. Alternatively, add an ARCHITECTURE.md that calls out these locations explicitly.' },
  E1: { title: 'No multi-purpose controller or route files exceeding 300 lines', severity: 'warning', pillar: 'Edit Safety', why: 'A route handler mixing auth, validation, business logic, and formatting is a hazard. Any change risks corrupting another concern.', fix: 'Split by responsibility. Extract auth middleware, validation schemas, and business logic into separate files. The handler should only coordinate.' },
  E2: { title: 'Related files are co-located or grouped', severity: 'recommendation', pillar: 'Edit Safety', why: 'A component without a co-located test or type file forces an agent to search for related context. If it cannot find the type definition, it may invent one.', fix: 'Keep a component, its types, and its tests together in the same directory. If you use a separate __tests__/ structure, mirror it consistently.' },
  E3: { title: 'No utility file exports more than 20 unrelated functions', severity: 'warning', pillar: 'Edit Safety', why: 'A grab-bag utility with 35 exports across unrelated domains gives an agent no safe edit surface.', fix: 'Split by domain. date.ts, formatting.ts, validation.ts are all better than utils.ts with 35 exports.' },
  E4: { title: 'Package boundaries are enforced by tooling', severity: 'recommendation', pillar: 'Edit Safety', why: 'A boundary enforced only by convention is a boundary an agent will cross accidentally. Without path aliases or import rules, an agent importing from an internal path has no feedback that it is violating encapsulation.', fix: 'Add path aliases to tsconfig.json, configure eslint-plugin-import with import/no-internal-modules, or use the exports field in package.json to restrict internal paths.' },
  E5: { title: 'Each package has a single declared entry point', severity: 'warning', pillar: 'Edit Safety', why: 'Packages with arbitrary internal import paths have no encapsulation. An agent will follow the path of least resistance.', fix: 'Ensure all package consumers import only from the package name (e.g. @clarxai/ui), never from internal paths.' },
};

export function getRuleFix(ruleId: string): string | null {
  const rule = RULE_EXPLANATIONS[ruleId.toUpperCase()];
  return rule?.fix ?? null;
}

export function getRuleCopyText(ruleId: string): string | null {
  const rule = RULE_EXPLANATIONS[ruleId.toUpperCase()];
  if (!rule) return null;
  return [
    `${ruleId.toUpperCase()} — ${rule.title}`,
    '─'.repeat(56),
    `Pillar:   ${rule.pillar}`,
    `Severity: ${rule.severity}`,
    '',
    'Why this matters:',
    `  ${rule.why}`,
    '',
    'How to fix it:',
    `  ${rule.fix}`,
  ].join('\n');
}

export function formatExplanation(ruleId: string): string | null {
  const rule = RULE_EXPLANATIONS[ruleId.toUpperCase()];
  if (!rule) return null;
  return `
  ${ruleId.toUpperCase()} — ${rule.title}
  ${'─'.repeat(56)}
  Pillar:   ${rule.pillar}
  Severity: ${rule.severity}

  Why this matters:
    ${rule.why}

  How to fix it:
    ${rule.fix}
`;
}

export async function explainCommand(args: string[]) {
  const ruleId = args.find(a => !a.startsWith('--'))?.toUpperCase();
  const wantCopy = args.includes('--copy');

  if (!ruleId) {
    console.error('Usage: clarx explain <rule-id> [--copy]  (e.g. clarx explain C2)');
    exit(3);
  }

  const rule = RULE_EXPLANATIONS[ruleId];
  if (!rule) {
    console.error(`Unknown rule: ${ruleId}`);
    console.error('Valid rules: D1–D5, B1–B5, C1–C6, O1–O5, E1–E5');
    exit(3);
  }

  console.log(`
${ruleId} — ${rule.title}
${'─'.repeat(60)}
Pillar:   ${rule.pillar}
Severity: ${rule.severity}

Why this matters:
  ${rule.why}

How to fix it:
  ${rule.fix}
`);

  if (wantCopy) {
    const text = getRuleCopyText(ruleId)!;
    const ok = copyToClipboard(text);
    console.log(ok ? `✓ Copied to clipboard` : `✗ Clipboard not available on this system`);
    track({ action: 'copy', rule: ruleId });
  } else {
    track({ action: 'explain', rule: ruleId });
  }
}
