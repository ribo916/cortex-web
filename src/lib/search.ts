'use client'

import type { SearchFilters } from './types'

interface PagefindResult {
  excerpt: string
  meta: { title?: string }
  filters: Record<string, string[]>
  url: string
}

interface PagefindModule {
  search: (
    query: string,
    options?: { filters?: Record<string, string> }
  ) => Promise<{ results: Array<{ id: string; data: () => Promise<PagefindResult> }> }>
}

declare global {
  interface Window {
    pagefind?: PagefindModule
  }
}

async function getPagefind(): Promise<PagefindModule | null> {
  if (typeof window === 'undefined') return null
  if (window.pagefind) return window.pagefind

  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = '/pagefind/pagefind.js'
    script.type = 'module'
    script.onload = () => resolve(window.pagefind ?? null)
    script.onerror = () => resolve(null)
    document.head.appendChild(script)
  })
}

export interface SearchResult {
  id: string
  title: string
  excerpt: string
  url: string
  filters: Record<string, string[]>
}

export async function search(query: string, filters: SearchFilters = {}): Promise<SearchResult[]> {
  const pf = await getPagefind()
  if (!pf) return []

  const pfFilters: Record<string, string> = {}
  if (filters.type) pfFilters.type = filters.type
  if (filters.domain) pfFilters.domain = filters.domain
  if (filters.tag) pfFilters.tags = filters.tag

  const { results } = await pf.search(query, {
    filters: Object.keys(pfFilters).length ? pfFilters : undefined,
  })

  const resolved = await Promise.all(
    results.slice(0, 20).map(async (r) => {
      const data = await r.data()
      return {
        id: r.id,
        title: data.meta?.title ?? 'Untitled',
        excerpt: data.excerpt,
        url: data.url,
        filters: data.filters,
      }
    })
  )
  return resolved
}
