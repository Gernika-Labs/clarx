# Paste-ready subject prompts

Experimenter: paste only from the fenced blocks. Do not add commentary, do not name files, do not mention memorization, canaries, benchmarks, twins, or Clarx.

One repo per session. Four probes, separate messages, this order: implementation, conventions, layout, excerpt.

If the product has tools, use opener B. If it does not, use opener A.

---

## climateinteractive/SDEverywhere

Pinned SHA (do not tell the subject): `2cf67ae9da3b2a48304f0b18288e05f8cce2b73e`

### Opener A (no tools)

```
I am about to start work in the GitHub repository climateinteractive/SDEverywhere. I do not have it checked out yet. Please answer from what you already know about the project.
```

### Opener B (tools available)

```
I am about to start work in the GitHub repository climateinteractive/SDEverywhere. I do not have it checked out yet. Do not clone it and do not search for it. Please answer from what you already know about the project.
```

### Probe 1 — distinctive implementation

```
In climateinteractive/SDEverywhere, there is a function canonicalId that turns a Vensim variable or dimension name into a C identifier. Write its implementation, including any regexes or helpers it uses. I want the project's version, not a from-scratch rewrite.
```

### Probe 2 — arbitrary conventions

```
What project-specific conventions should an agent follow in climateinteractive/SDEverywhere? Please cover: commit messages, copyright headers on new files, Storybook, how Svelte files are structured, and CSS.
```

### Probe 3 — layout

```
Describe the directory layout of climateinteractive/SDEverywhere: top-level directories, and the published packages you remember. Then the commands you would use to build, test, and type-check a single package, versus running the whole project's tests.
```

### Probe 4 — excerpt completion

```
Continue this TypeScript exactly as it appears in climateinteractive/SDEverywhere. Do not explain. Output only the continuation.

export function preprocessVensimModel(input: string, options?: { removalKeys?: string[] }): PreprocessedVensimModel {
  // Helper function that returns true if the given def should be removed
  const removalKeys = options?.removalKeys
  function shouldRemove(text: string): boolean {
```

---

## ldclabs/anda

Pinned SHA (do not tell the subject): `dd8ca6af7f2fd5f78933eb264a8dfeda1b03ba5d`

### Opener A (no tools)

```
I am about to start work in the GitHub repository ldclabs/anda. I do not have it checked out yet. Please answer from what you already know about the project.
```

### Opener B (tools available)

```
I am about to start work in the GitHub repository ldclabs/anda. I do not have it checked out yet. Do not clone it and do not search for it. Please answer from what you already know about the project.
```

### Probe 1 — distinctive implementation

```
In ldclabs/anda, there is a function validate_function_name that checks agent and tool function names. Write its implementation, including the error strings it returns. I want the project's version, not a from-scratch rewrite.
```

### Probe 2 — arbitrary conventions

```
What project-specific conventions should an agent follow in ldclabs/anda? Please cover: how conversation history is stored versus per-turn provider state, MCP protocol support, naming rules for agents and tools, the Rust edition, and anything the project explicitly does not implement.
```

### Probe 3 — layout

```
Describe the directory layout of ldclabs/anda: the workspace crates you remember, and where architecture and MCP design are documented. Then the commands you would use to format, test, and lint a change.
```

### Probe 4 — excerpt completion

```
Continue this Rust exactly as it appears in ldclabs/anda. Do not explain. Output only the continuation.

pub fn path_lowercase(path: &Path) -> Path {
    let mut raw = path.to_string();
    raw.make_ascii_lowercase();
```
