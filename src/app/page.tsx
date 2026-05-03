import { getAllDomainsWithStats } from '@/lib/content'
import { DomainGrid } from '@/components/domain/DomainGrid'

export default function HomePage() {
  const domains = getAllDomainsWithStats()

  return (
    <div className="container max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Cortex</h1>
        <p className="text-muted-foreground mt-1">
          {domains.length} {domains.length === 1 ? 'domain' : 'domains'}
        </p>
      </div>
      <DomainGrid domains={domains} />
    </div>
  )
}
