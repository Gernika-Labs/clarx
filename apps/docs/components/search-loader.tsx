'use client'

// 'use client' is required here because next/dynamic with ssr:false is only
// valid inside a Client Component. layout.tsx is a Server Component, so this
// shim exists purely to satisfy that constraint.

import dynamic from 'next/dynamic'

export const SearchDialog = dynamic(
  () => import('./search-dialog').then((m) => m.CustomSearchDialog),
  { ssr: false }
)
