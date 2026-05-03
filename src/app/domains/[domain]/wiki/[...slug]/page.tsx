import { notFound } from 'next/navigation'
import { getAllDomainSlugs, getAllPages, getPage, compilePage } from '@/lib/content'
import { SiteSidebar } from '@/components/layout/SiteSidebar'
import { FrontmatterPanel } from '@/components/wiki/FrontmatterPanel'
import { AskPanel } from '@/components/ask/AskPanel'

export async function generateStaticParams() {
  const params: { domain: string; slug: string[] }[] = []
  for (const domain of getAllDomainSlugs()) {
    for (const page of getAllPages(domain)) {
      params.push({ domain, slug: page.slug })
    }
  }
  return params
}

export default async function WikiPageRoute({
  params,
}: {
  params: Promise<{ domain: string; slug: string[] }>
}) {
  const { domain, slug } = await params
  const page = getPage(domain, slug)
  if (!page) notFound()

  const allPages = getAllPages(domain)
  const content = await compilePage(page)

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      <SiteSidebar domain={domain} pages={allPages} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[1100px] mx-auto px-6 py-8 flex gap-8">
          <article className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold tracking-tight mb-6">
              {page.frontmatter.title}
            </h1>
            <div className="prose prose-sm max-w-none dark:prose-invert [&_table]:overflow-x-auto [&_table]:block [&_table]:w-full">
              {content}
            </div>
          </article>

          <aside className="w-56 shrink-0 sticky top-0 pt-[3.5rem] -mt-[3.5rem] h-screen overflow-y-auto py-4 space-y-6">
            <FrontmatterPanel frontmatter={page.frontmatter} domain={domain} />
            <AskPanel />
            <span data-pagefind-filter={`type:${page.frontmatter.type}`} className="sr-only" />
            <span data-pagefind-filter={`domain:${domain}`} className="sr-only" />
            {page.frontmatter.tags?.map((t) => (
              <span key={t} data-pagefind-filter={`tags:${t}`} className="sr-only" />
            ))}
          </aside>
        </div>
      </div>
    </div>
  )
}
