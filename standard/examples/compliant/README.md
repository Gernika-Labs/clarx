# Compliant Example — AI-First Monorepo

This example shows a repo structure that scores 100/100 on the Clarx AI-First Standard.
Every decision here is intentional and maps to a specific rule.

---

## Directory structure

```
my-app/
├── CLAUDE.md                     # O1 ✓ — machine-readable guidance file
├── README.md                     # root overview
├── clarx-manifest.json           # O1 ✓ O2 ✓ O3 ✓ O4 ✓
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
├── packages/
│   ├── core/
│   │   ├── README.md             # D2 ✓ — purpose statement
│   │   ├── package.json          # exports field → E5 ✓
│   │   ├── src/
│   │   │   ├── index.ts          # B3 ✓ — index.ts present
│   │   │   ├── auth.ts           # domain-specific name → D4 ✓
│   │   │   └── formatting.ts     # domain-specific name → D4 ✓
│   │   └── src/__tests__/
│   │       ├── auth.test.ts      # B5 ✓ — mirrored test structure
│   │       └── formatting.test.ts
│   └── ui/
│       ├── README.md             # D2 ✓
│       ├── package.json          # exports field → E5 ✓
│       └── src/
│           ├── index.ts          # B3 ✓
│           ├── button.tsx
│           └── badge.tsx
└── apps/
    └── web/
        ├── README.md             # D2 ✓
        ├── package.json
        └── src/
            ├── pages/            # route files < 300 lines → E1 ✓
            └── components/
```

**Root has 7 meaningful entries** — well under the D1 limit of 10.

---

## clarx-manifest.json

```json
{
  "version": "0.1",
  "generated": ["**/dist", "**/node_modules", "**/coverage", "**/.next"],
  "workspaces": {
    "packages/core": "Authentication, formatting, and shared business logic",
    "packages/ui": "Reusable UI component library",
    "apps/web": "Customer-facing Next.js web application"
  },
  "highFanIn": ["packages/core/src/index.ts", "packages/ui/src/index.ts"],
  "verificationCommands": {
    "typecheck": "pnpm typecheck",
    "test": "pnpm test",
    "lint": "pnpm lint"
  },
  "commonTasks": {
    "add a UI component": "packages/ui/src/ — export from index.ts",
    "add an API route": "apps/web/src/pages/ — keep under 300 lines",
    "add shared logic": "packages/core/src/ — use domain-specific filenames"
  }
}
```

---

## CLAUDE.md

```markdown
# my-app

Monorepo with three packages. See clarx-manifest.json for workspace descriptions.

## Verification
- Typecheck: `pnpm typecheck`
- Test: `pnpm test`
- Lint: `pnpm lint`

## Common tasks
- Add a UI component → packages/ui/src/
- Add shared logic → packages/core/src/ (domain-specific filenames only)
- Add a page → apps/web/src/pages/ (keep under 300 lines)

## Generated directories
- **/dist, **/node_modules, **/.next, **/coverage
```

---

## Why this scores 100/100

| Rule | Status | Reason |
|------|--------|--------|
| D1 | ✓ | 7 root entries (limit: 10) |
| D2 | ✓ | All workspaces have purpose statements in manifest |
| D3 | ✓ | No config files inside src/ directories |
| D4 | ✓ | No utils.ts / helpers.ts / misc.ts dump files |
| D5 | ✓ | Max depth 3 within any workspace |
| B1 | ✓ | No circular imports between packages |
| B2 | ✓ | No duplicate filenames across packages |
| B3 | ✓ | Every package has src/index.ts |
| B4 | ✓ | UI primitives and pages in separate directories |
| B5 | ✓ | Tests mirror source structure in __tests__/ |
| C1 | ✓ | Generated dirs declared in manifest — not in source tree |
| C2 | ✓ | No files exceed 400 lines |
| C3 | ✓ | No file imports more than 15 modules |
| C4 | ✓ | High fan-in files declared in manifest.highFanIn |
| C5 | ✓ | Import depth does not exceed 8 |
| O1 | ✓ | CLAUDE.md and clarx-manifest.json present |
| O2 | ✓ | Generated directories declared |
| O3 | ✓ | Verification commands declared |
| O4 | ✓ | Common task locations declared |
| O5 | ✓ | High fan-in files identified in manifest |
| E1 | ✓ | Route files under 300 lines |
| E2 | ✓ | Components have co-located tests |
| E3 | ✓ | No utility files with excessive exports |
| E4 | ✓ | Package boundaries enforced via exports field |
| E5 | ✓ | All library packages have an exports field |
