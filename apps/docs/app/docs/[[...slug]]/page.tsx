import { source } from '@/app/source'
import {
  DocsPage,
  DocsBody,
  DocsTitle,
  DocsDescription,
} from 'fumadocs-ui/page'
import { notFound } from 'next/navigation'
import defaultMdxComponents from 'fumadocs-ui/mdx'
import {
  BadgeIntentDemo,
  BadgeDotDemo,
  BadgeSizeDemo,
  BadgeKeywordDemo,
  BadgeKeywordTable,
} from '@/components/demos/badge-demo'
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

const mdxComponents = {
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
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = page.data as any
  const MDX = data.body

  return (
    <DocsPage toc={data.toc} full={data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={mdxComponents} />
      </DocsBody>
    </DocsPage>
  )
}

export async function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>
}) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()

  return {
    title: page.data.title,
    description: page.data.description,
  }
}
