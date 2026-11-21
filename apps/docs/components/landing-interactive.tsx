'use client'

import { useState } from 'react'

export function CopyButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText('clarx score .')
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <button
      type="button"
      className="copy"
      onClick={handleCopy}
      aria-label={copied ? 'Copied' : 'Copy command'}
    >
      {copied ? 'copied' : 'copy'}
    </button>
  )
}
