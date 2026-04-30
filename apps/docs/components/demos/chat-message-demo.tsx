'use client'

import { ChatMessage } from '@clarxai/ui'
import { Preview } from '@/components/preview'

export function ChatMessageVariantsDemo() {
  return (
    <Preview className="flex-col">
      <ChatMessage role="user" content="Can you summarize this document for me?" />
      <ChatMessage
        role="assistant"
        content="Sure! Here's a concise summary of the key points..."
      />
      <ChatMessage role="system" content="Conversation started" />
    </Preview>
  )
}

export function ChatMessageStreamingDemo() {
  return (
    <Preview className="flex-col">
      <ChatMessage
        role="assistant"
        content="Analyzing the document structure and key themes"
        isStreaming={true}
      />
    </Preview>
  )
}

export function ChatMessageTimestampDemo() {
  return (
    <Preview className="flex-col">
      <ChatMessage
        role="user"
        content="Can you summarize this document for me?"
        timestamp="2:31 PM"
      />
      <ChatMessage
        role="assistant"
        content="Sure! Here's a concise summary of the key points..."
        timestamp="2:31 PM"
      />
    </Preview>
  )
}
