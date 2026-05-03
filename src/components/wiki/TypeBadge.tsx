import { Badge } from '@/components/ui/badge'
import type { WikiPageType } from '@/lib/types'

const colors: Record<WikiPageType, string> = {
  entity: 'bg-blue-100 text-blue-800 border-blue-200',
  concept: 'bg-violet-100 text-violet-800 border-violet-200',
  source: 'bg-amber-100 text-amber-800 border-amber-200',
  analysis: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  overview: 'bg-slate-100 text-slate-800 border-slate-200',
}

export function TypeBadge({ type }: { type: WikiPageType }) {
  return (
    <Badge variant="outline" className={`capitalize text-xs font-medium ${colors[type] ?? colors.overview}`}>
      {type}
    </Badge>
  )
}
