'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import { search, type SearchResult } from '@/lib/search'
import { useDebounce } from '@/lib/useDebounce'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: Props) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return }
    const res = await search(q)
    setResults(res)
  }, [])

  useDebounce(query, 300, runSearch)

  const navigate = (url: string) => {
    onOpenChange(false)
    router.push(url)
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search wiki..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {query && results.length === 0 && (
          <CommandEmpty>No results found.</CommandEmpty>
        )}
        {results.length > 0 && (
          <CommandGroup heading="Pages">
            {results.map((r) => (
              <CommandItem
                key={r.id}
                value={r.id}
                onSelect={() => navigate(r.url)}
                className="flex flex-col items-start gap-0.5"
              >
                <span className="font-medium">{r.title}</span>
                <span
                  className="text-xs text-muted-foreground line-clamp-1"
                  dangerouslySetInnerHTML={{ __html: r.excerpt }}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  )
}
