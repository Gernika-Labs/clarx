'use client'

import { ChatInput } from '@clarxai/ui'
import { Preview } from '@/components/preview'

export function ChatInputDefaultDemo() {
  return (
    <Preview className="block p-6">
      <ChatInput />
    </Preview>
  )
}

export function ChatInputStreamingDemo() {
  return (
    <Preview className="block p-6">
      <ChatInput isStreaming={true} placeholder="Message..." />
    </Preview>
  )
}

export function ChatInputDisabledDemo() {
  return (
    <Preview className="block p-6">
      <ChatInput disabled={true} placeholder="Conversation ended" />
    </Preview>
  )
}
