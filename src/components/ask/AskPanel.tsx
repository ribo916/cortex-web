'use client'

import { Sparkles } from 'lucide-react'

export function AskPanel() {
  const enabled = process.env.NEXT_PUBLIC_ENABLE_ASK === 'true'

  if (!enabled) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground text-center space-y-1">
        <Sparkles className="h-4 w-4 mx-auto mb-2 opacity-50" />
        <p className="font-medium">Ask AI</p>
        <p className="text-xs">Coming soon</p>
      </div>
    )
  }

  return null
}
