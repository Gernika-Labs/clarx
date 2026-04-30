import { docs } from '@/.source'
import { loader, type Source } from 'fumadocs-core/source'

const rawSource = docs.toFumadocsSource()

// fumadocs-mdx@11 returns `files` as a lazy function; fumadocs-core@15 expects an array
const resolvedFiles =
  typeof rawSource.files === 'function'
    ? (rawSource.files as () => Source['files'])()
    : rawSource.files

export const source = loader({
  baseUrl: '/docs',
  source: { files: resolvedFiles },
})
