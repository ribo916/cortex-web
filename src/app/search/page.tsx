import { Suspense } from 'react'
import { SearchResults } from '@/components/search/SearchResults'

export default function SearchPage() {
  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-xl font-bold mb-6">Search</h1>
      <Suspense fallback={<p className="text-muted-foreground text-sm">Loading...</p>}>
        <SearchResults />
      </Suspense>
    </div>
  )
}
