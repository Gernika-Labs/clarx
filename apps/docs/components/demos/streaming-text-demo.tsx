'use client'

import { useEffect, useState } from 'react'
import { StreamingText } from '@intention-ui/ui'
import { Preview, PreviewGrid, PreviewRow } from '@/components/preview'

const SENTENCE = 'The agent analyzed 47 documents and identified 3 key patterns in the data.'
const WORDS = SENTENCE.split(' ')

export function StreamingTextLiveDemo() {
  const [wordIndex, setWordIndex] = useState(0)
  const [isStreaming, setIsStreaming] = useState(true)

  useEffect(() => {
    if (wordIndex < WORDS.length) {
      const t = setTimeout(() => setWordIndex((i) => i + 1), 120)
      return () => clearTimeout(t)
    } else {
      setIsStreaming(false)
      const t = setTimeout(() => {
        setWordIndex(0)
        setIsStreaming(true)
      }, 2000)
      return () => clearTimeout(t)
    }
  }, [wordIndex])

  const text = WORDS.slice(0, wordIndex).join(' ')

  return (
    <Preview>
      <StreamingText text={text} isStreaming={isStreaming} className="text-sm" />
    </Preview>
  )
}

export function StreamingTextStatesDemo() {
  return (
    <PreviewGrid>
      <PreviewRow label="streaming">
        <StreamingText text="Processing your request" isStreaming={true} className="text-sm" />
      </PreviewRow>
      <PreviewRow label="done">
        <StreamingText text="Processing your request" isStreaming={false} className="text-sm" />
      </PreviewRow>
    </PreviewGrid>
  )
}
