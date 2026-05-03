'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WikiPage, WikiPageType } from '@/lib/types'

const CATEGORY_ORDER: WikiPageType[] = ['overview', 'entity', 'concept', 'source', 'analysis']
const CATEGORY_LABELS: Record<WikiPageType, string> = {
  overview: 'Overview',
  entity: 'Entities',
  concept: 'Concepts',
  source: 'Sources',
  analysis: 'Analyses',
}

interface Props {
  domain: string
  pages: WikiPage[]
}

export function SiteSidebar({ domain, pages }: Props) {
  const pathname = usePathname()
  const grouped = CATEGORY_ORDER.reduce<Record<WikiPageType, WikiPage[]>>(
    (acc, type) => {
      acc[type] = pages.filter((p) => p.frontmatter.type === type)
      return acc
    },
    { overview: [], entity: [], concept: [], source: [], analysis: [] }
  )

  return (
    <nav className="w-64 shrink-0 border-r h-full overflow-y-auto py-4 px-3 space-y-1 text-sm">
      <Link
        href={`/domains/${domain}`}
        className="block px-2 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground uppercase tracking-wide mb-2"
      >
        ← All Domains
      </Link>

      {CATEGORY_ORDER.map((type) => {
        const group = grouped[type]
        if (group.length === 0) return null
        return (
          <Collapsible key={type} defaultOpen>
            <CollapsibleTrigger className="flex items-center gap-1 w-full px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground group">
              <ChevronRight className="h-3 w-3 transition-transform group-data-[state=open]:rotate-90" />
              {CATEGORY_LABELS[type]}
              <span className="ml-auto font-normal normal-case">{group.length}</span>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ul className="pl-4 mt-0.5 space-y-0.5">
                {group.map((page) => {
                  const href = `/domains/${domain}/wiki/${page.slug.join('/')}`
                  const active = pathname === href
                  return (
                    <li key={page.slug.join('/')}>
                      <Link
                        href={href}
                        className={cn(
                          'block rounded px-2 py-1 text-sm truncate',
                          active
                            ? 'bg-accent text-accent-foreground font-medium'
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
                        )}
                      >
                        {page.frontmatter.title ?? page.slug.at(-1)}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </CollapsibleContent>
          </Collapsible>
        )
      })}
    </nav>
  )
}
