import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DomainWithStats, WikiPageType } from '@/lib/types'

const CATEGORY_LABELS: Record<WikiPageType, string> = {
  entity: 'Entities',
  concept: 'Concepts',
  source: 'Sources',
  analysis: 'Analyses',
  overview: 'Overview',
}

export function DomainCard({ domain }: { domain: DomainWithStats }) {
  const categories = Object.entries(domain.categoryCounts).filter(([, count]) => count > 0)

  return (
    <Link href={`/domains/${domain.slug}`} className="block group">
      <Card className="h-full transition-shadow hover:shadow-md overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: domain.color }} />
        <CardHeader className="pb-2">
          <CardTitle className="text-base group-hover:text-primary transition-colors">
            {domain.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground line-clamp-2">{domain.description}</p>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {categories.map(([type, count]) => (
              <span key={type}>
                <span className="font-medium text-foreground">{count}</span> {CATEGORY_LABELS[type as WikiPageType]}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
