'use client'

import { useEffect, useRef, useState } from 'react'

export function CopyButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('clarx score .')
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <span className="copy" onClick={handleCopy}>
      {copied ? 'copied' : 'copy'}
    </span>
  )
}

export function ScoreCounter({ target }: { target: number }) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        io.disconnect()
        const dur = 900
        const t0 = performance.now()
        const tick = (t: number) => {
          const p = Math.min(1, (t - t0) / dur)
          const eased = 1 - Math.pow(1 - p, 3)
          setValue(Math.round(target * eased))
          if (p < 1) requestAnimationFrame(tick)
          else setValue(target)
        }
        requestAnimationFrame(tick)
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [target])

  return <span ref={ref}>{value}</span>
}
