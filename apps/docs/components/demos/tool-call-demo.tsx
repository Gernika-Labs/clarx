'use client'

import { ToolCall } from '@intention-ui/ui'
import { Preview } from '@/components/preview'

export function ToolCallStatusDemo() {
  return (
    <Preview className="flex-col gap-3">
      <ToolCall name="read_file" status="pending" />
      <ToolCall name="search_web" status="running" />
      <ToolCall
        name="run_query"
        status="success"
        input={{ query: 'SELECT * FROM users LIMIT 10' }}
        output={{ rows: 10, data: ['...'] }}
        defaultOpen={true}
      />
      <ToolCall
        name="send_email"
        status="error"
        error="SMTP connection refused: timeout after 30s"
        defaultOpen={true}
      />
    </Preview>
  )
}
