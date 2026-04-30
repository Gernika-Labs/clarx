import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-2xl">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Early preview
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          Clarx
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          An AI-first, intention-based design system for conversational
          interfaces. Copy, compose, and ship AI experiences.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-6 py-2.5 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/docs/components/chat-message"
            className="inline-flex items-center justify-center rounded-md border px-6 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            Components
          </Link>
        </div>
      </div>
    </main>
  )
}
