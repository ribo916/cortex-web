import Link from 'next/link'
import { TypeBadge } from './TypeBadge'
import { Separator } from '@/components/ui/separator'
import type { WikiPageFrontmatter } from '@/lib/types'

interface Props {
  frontmatter: WikiPageFrontmatter
  domain: string
}

export function FrontmatterPanel({ frontmatter, domain }: Props) {
  const { type, tags, created, updated, related } = frontmatter

  return (
    <aside className="space-y-4 text-sm">
      <div>
        <TypeBadge type={type} />
      </div>

      {tags?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Tags</p>
          <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/search?tag=${encodeURIComponent(tag)}&domain=${domain}`}
                className="inline-block text-xs bg-muted hover:bg-muted/80 rounded px-2 py-0.5 text-muted-foreground"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      )}

      <Separator />

      <div className="space-y-1 text-xs text-muted-foreground">
        {created && <p><span className="font-medium">Created</span> {created}</p>}
        {updated && <p><span className="font-medium">Updated</span> {updated}</p>}
      </div>

      {related?.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Related</p>
            <ul className="space-y-1">
              {related.map((rel) => {
                const href = `/domains/${domain}/${rel.replace(/\.md$/, '')}`
                const label = rel.split('/').pop()?.replace(/\.md$/, '').replace(/-/g, ' ') ?? rel
                return (
                  <li key={rel}>
                    <Link href={href} className="text-xs text-primary hover:underline capitalize">
                      {label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </>
      )}
    </aside>
  )
}
