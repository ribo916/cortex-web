import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getAllDomainSlugs, getDomainWithStats, getAllPages } from '@/lib/content'
import { TypeBadge } from '@/components/wiki/TypeBadge'
import type { WikiPageType } from '@/lib/types'

export async function generateStaticParams() {
  return getAllDomainSlugs().map((domain) => ({ domain }))
}

const CATEGORY_ORDER: WikiPageType[] = ['overview', 'entity', 'concept', 'source', 'analysis']
const CATEGORY_LABELS: Record<WikiPageType, string> = {
  overview: 'Overview',
  entity: 'Entities',
  concept: 'Concepts',
  source: 'Sources',
  analysis: 'Analyses',
}

export default async function DomainPage({ params }: { params: Promise<{ domain: string }> }) {
  const { domain } = await params
  const slugs = getAllDomainSlugs()
  if (!slugs.includes(domain)) notFound()

  const meta = getDomainWithStats(domain)
  const pages = getAllPages(domain)

  const grouped = CATEGORY_ORDER.reduce<Record<WikiPageType, typeof pages>>(
    (acc, type) => {
      acc[type] = pages.filter((p) => p.frontmatter.type === type)
      return acc
    },
    { overview: [], entity: [], concept: [], source: [], analysis: [] }
  )

  return (
    <div className="container max-w-5xl mx-auto px-4 py-10">
      <div className="mb-2">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">← All Domains</Link>
      </div>
      <div className="flex items-center gap-3 mb-1">
        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: meta.color }} />
        <h1 className="text-2xl font-bold tracking-tight">{meta.name}</h1>
      </div>
      <p className="text-muted-foreground mb-8 ml-6">{meta.description}</p>

      <div className="space-y-10">
        {CATEGORY_ORDER.map((type) => {
          const group = grouped[type]
          if (group.length === 0) return null
          return (
            <section key={type}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                {CATEGORY_LABELS[type]} <span className="font-normal">({group.length})</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {group.map((page) => (
                  <Link
                    key={page.slug.join('/')}
                    href={`/domains/${domain}/wiki/${page.slug.join('/')}`}
                    className="flex items-center gap-2 p-3 rounded-lg border hover:bg-accent/50 transition-colors group"
                  >
                    <TypeBadge type={page.frontmatter.type} />
                    <span className="text-sm font-medium group-hover:text-primary transition-colors truncate">
                      {page.frontmatter.title ?? page.slug.at(-1)}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
