import { Chakra_Petch, JetBrains_Mono } from 'next/font/google'
import type { ReactNode } from 'react'

const jbMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jb-mono',
  weight: ['400', '500', '600'],
  display: 'swap',
})

const chakra = Chakra_Petch({
  subsets: ['latin'],
  variable: '--font-chakra',
  weight: ['500', '600', '700'],
  display: 'swap',
})

export default function HomeLayout({ children }: { children: ReactNode }) {
  return <div className={`${jbMono.variable} ${chakra.variable}`}>{children}</div>
}
