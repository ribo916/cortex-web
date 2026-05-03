import Link from 'next/link'
import { SearchTrigger } from '@/components/search/SearchTrigger'

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
      <div className="flex h-14 items-center px-4 gap-4">
        <Link href="/" className="font-semibold text-sm tracking-tight shrink-0">
          Cortex
        </Link>
        <div className="flex-1" />
        <SearchTrigger />
      </div>
    </header>
  )
}
