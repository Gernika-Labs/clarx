import { JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jb-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
})

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <div className={jbMono.variable}>{children}</div>
}
