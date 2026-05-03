import { DomainCard } from './DomainCard'
import type { DomainWithStats } from '@/lib/types'

export function DomainGrid({ domains }: { domains: DomainWithStats[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {domains.map((d) => (
        <DomainCard key={d.slug} domain={d} />
      ))}
    </div>
  )
}
