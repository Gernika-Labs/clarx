# @clarxai/engine

Clarx codebase analysis engine. Scores any repository against the [Clarx AI-First Standard](../../standard/v0.1.md).

## Usage

```typescript
import { analyze } from '@clarxai/engine';

const result = await analyze({ root: '/path/to/repo' });
console.log(result.score);      // 0–100
console.log(result.confidence); // 'high' | 'medium' | 'low'
```

This package is consumed by `@clarxai/cli`. Import it directly when building custom integrations (editor extensions, CI platforms, dashboards).

See [engine docs](../../apps/docs/content/docs/engine/) for full API reference.
