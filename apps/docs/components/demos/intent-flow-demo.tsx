'use client'

import { ChatMessage, Badge, ToolCall } from '@clarxai/ui'

export function IntentFlowDemo() {
  return (
    <div className="not-prose my-6 flex flex-col gap-4">
      <ChatMessage role="user" content="Deploy the API service to production" />

      <div className="flex items-center gap-2 pl-9">
        <span className="text-xs text-zinc-400">Intent detected</span>
        <Badge keyword="running" label="Deploy service" />
      </div>

      <div className="pl-0">
        <ToolCall name="run_deployment" status="running" />
      </div>

      <div className="pl-0">
        <ToolCall
          name="run_deployment"
          status="success"
          output={{ version: 'v2.4.1', replicas: 3, duration: '42s' }}
          defaultOpen={true}
        />
      </div>

      <ChatMessage
        role="assistant"
        content="Deployment complete. Version v2.4.1 is live across 3 replicas."
      />
    </div>
  )
}
