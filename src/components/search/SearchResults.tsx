'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { search, type SearchResult } from '@/lib/search'
import { useDebounce } from '@/lib/useDebounce'

export function SearchResults() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQ)
  const [results, setResults] = useState<SearchResult[]>([])
  const [searched, setSearched] = useState(false)

  const runSearch = useCallback(async (q: string) => {
    setSearched(true)
    if (!q.trim()) { setResults([]); return }
    const res = await search(q, {
      type: searchParams.get('type') as never ?? undefined,
      domain: searchParams.get('domain') ?? undefined,
      tag: searchParams.get('tag') ?? undefined,
    })
    setResults(res)
  }, [searchParams])

  useDebounce(query, 300, runSearch)

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
        className="text-base"
      />
      {searched && results.length === 0 && query && (
        <p className="text-muted-foreground text-sm">No results for &ldquo;{query}&rdquo;</p>
      )}
      <ul className="space-y-3">
        {results.map((r) => (
          <li key={r.id}>
            <Link href={r.url} className="block p-4 rounded-lg border hover:bg-accent/50 transition-colors group">
              <p className="font-medium text-sm group-hover:text-primary">{r.title}</p>
              <p
                className="text-xs text-muted-foreground mt-1 line-clamp-2"
                dangerouslySetInnerHTML={{ __html: r.excerpt }}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
