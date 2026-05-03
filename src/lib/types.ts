export type WikiPageType = 'entity' | 'concept' | 'source' | 'analysis' | 'overview'

export interface WikiPageFrontmatter {
  title: string
  type: WikiPageType
  tags: string[]
  created: string
  updated: string
  sources: string[]
  related: string[]
}

export interface WikiPage {
  slug: string[]
  domain: string
  frontmatter: WikiPageFrontmatter
  rawContent: string
}

export interface DomainMeta {
  slug: string
  name: string
  description: string
  color: string
}

export interface DomainWithStats extends DomainMeta {
  pageCount: number
  categoryCounts: Record<WikiPageType, number>
}

export interface SearchFilters {
  type?: WikiPageType
  domain?: string
  tag?: string
}

export interface DomainRegistry {
  domains: DomainMeta[]
  generated: string
}
