'use client'

import { ChatMessage } from '@clarxai/ui'

export function ConversationLayoutDemo() {
  return (
    <div className="not-prose my-6 flex h-[440px] flex-col overflow-hidden rounded-xl border">
      {/* Header */}
      <div className="shrink-0 flex items-center gap-2 border-b bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-zinc-100 ring-1 ring-zinc-200 text-[11px] font-medium text-zinc-500 dark:bg-zinc-800 dark:ring-zinc-700">
          AI
        </div>
        <span className="text-sm font-medium text-zinc-800 dark:text-zinc-100">Assistant</span>
        <span className="h-2 w-2 rounded-full bg-green-500" />
      </div>

      {/* Thread */}
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-zinc-50/50 px-4 py-4 dark:bg-zinc-950/50">
        <ChatMessage
          role="assistant"
          content="Hello! I'm here to help. What would you like to work on today?"
        />
        <ChatMessage
          role="user"
          content="Can you help me analyze our Q3 sales data?"
        />
        <ChatMessage
          role="assistant"
          content="Of course! Please share the data or describe what you're working with and I'll get started."
        />
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t bg-white px-4 py-3 dark:bg-zinc-900">
        <div className="flex items-center gap-2 rounded-2xl border bg-white px-4 py-2.5 shadow-sm dark:bg-zinc-900">
          <span className="flex-1 text-sm text-zinc-400">Message...</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 12V2M3 6l4-4 4 4" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  )
}
