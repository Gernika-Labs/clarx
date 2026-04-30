'use client'

import dynamic from 'next/dynamic'

export const SearchDialog = dynamic(
  () => import('./search-dialog').then((m) => m.CustomSearchDialog),
  { ssr: false }
)
