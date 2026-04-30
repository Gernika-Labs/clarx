import { docs } from '@/.source'
import { loader } from 'fumadocs-core/source'

const rawSource = docs.toFumadocsSource()

export const source = loader({
  baseUrl: '/docs',
  source: {
    // fumadocs-mdx@11 returns files as a lazy fn; fumadocs-core@15 expects an array
    files:
      typeof rawSource.files === 'function'
        ? (rawSource.files as () => unknown[])()
        : rawSource.files,
  },
})
