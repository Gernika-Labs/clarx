import defaultMdxComponents from 'fumadocs-ui/mdx'
import { BadgeIntentDemo } from '@/components/demos/badge-intent-demo'
import { BadgeDotDemo } from '@/components/demos/badge-dot-demo'
import { BadgeSizeDemo } from '@/components/demos/badge-size-demo'
import { BadgeKeywordDemo, BadgeKeywordTable } from '@/components/demos/badge-keyword-demo'
import {
  ChatMessageVariantsDemo,
  ChatMessageStreamingDemo,
  ChatMessageTimestampDemo,
} from '@/components/demos/chat-message-demo'
import {
  ChatInputDefaultDemo,
  ChatInputStreamingDemo,
  ChatInputDisabledDemo,
} from '@/components/demos/chat-input-demo'
import { ToolCallStatusDemo } from '@/components/demos/tool-call-demo'
import {
  StreamingTextLiveDemo,
  StreamingTextStatesDemo,
} from '@/components/demos/streaming-text-demo'
import { AgentStatusAllStatesDemo } from '@/components/demos/agent-status-demo'
import { ConversationLayoutDemo } from '@/components/demos/conversation-layout-demo'
import { IntentFlowDemo } from '@/components/demos/intent-flow-demo'
import {
  ButtonIntentDemo,
  ButtonSizeDemo,
  ButtonDestructiveDemo,
} from '@/components/demos/button-demo'
import { TextRoleDemo } from '@/components/demos/text-demo'
import { AlertIntentDemo, AlertAppearanceDemo } from '@/components/demos/alert-demo'
import {
  StatusIndicatorAllStatesDemo,
  StatusIndicatorSizeDemo,
} from '@/components/demos/status-indicator-demo'
import { TemplateCopyBlock } from '@/components/template-copy-block'

export const mdxComponents = {
  ...defaultMdxComponents,
  BadgeIntentDemo,
  BadgeDotDemo,
  BadgeSizeDemo,
  BadgeKeywordDemo,
  BadgeKeywordTable,
  ChatMessageVariantsDemo,
  ChatMessageStreamingDemo,
  ChatMessageTimestampDemo,
  ChatInputDefaultDemo,
  ChatInputStreamingDemo,
  ChatInputDisabledDemo,
  ToolCallStatusDemo,
  StreamingTextLiveDemo,
  StreamingTextStatesDemo,
  AgentStatusAllStatesDemo,
  ConversationLayoutDemo,
  IntentFlowDemo,
  ButtonIntentDemo,
  ButtonSizeDemo,
  ButtonDestructiveDemo,
  TextRoleDemo,
  AlertIntentDemo,
  AlertAppearanceDemo,
  StatusIndicatorAllStatesDemo,
  StatusIndicatorSizeDemo,
  TemplateCopyBlock,
}
