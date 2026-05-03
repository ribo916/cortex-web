import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import type { WikiPage, WikiPageFrontmatter, WikiPageType, DomainMeta, DomainWithStats } from './types'
import { normalizeTitle, type LinkMap } from './wiki-links'
import remarkWikiLinks from './remark-wiki-links'

const CONTENT_DIR = path.join(process.cwd(), 'content', 'domains')

export function getDomainDir(domain: string) {
  return path.join(CONTENT_DIR, domain, 'wiki')
}

export function getAllDomainSlugs(): string[] {
  if (!fs.existsSync(CONTENT_DIR)) return []
  return fs.readdirSync(CONTENT_DIR).filter((d) => {
    const metaPath = path.join(CONTENT_DIR, d, 'meta.json')
    return fs.existsSync(metaPath)
  })
}

export function getDomainMeta(domain: string): DomainMeta {
  const metaPath = path.join(CONTENT_DIR, domain, 'meta.json')
  const raw = fs.readFileSync(metaPath, 'utf-8')
  return { slug: domain, ...JSON.parse(raw) }
}

function normalizeFrontmatter(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const [key, val] of Object.entries(data)) {
    if (val instanceof Date) {
      result[key] = val.toISOString().slice(0, 10)
    } else {
      result[key] = val
    }
  }
  return result
}

function collectMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...collectMarkdownFiles(full))
    } else if (
      entry.name.endsWith('.md') &&
      entry.name !== 'index.md' &&
      entry.name !== 'log.md'
    ) {
      files.push(full)
    }
  }
  return files
}

function fileToSlug(filePath: string, wikiDir: string): string[] {
  const rel = path.relative(wikiDir, filePath)
  return rel.replace(/\.md$/, '').split(path.sep)
}

export function getAllPages(domain: string): WikiPage[] {
  const wikiDir = getDomainDir(domain)
  const files = collectMarkdownFiles(wikiDir)
  return files.map((file) => {
    const raw = fs.readFileSync(file, 'utf-8')
    const { data, content } = matter(raw)
    return {
      slug: fileToSlug(file, wikiDir),
      domain,
      frontmatter: normalizeFrontmatter(data) as unknown as WikiPageFrontmatter,
      rawContent: content,
    }
  })
}

export function getPage(domain: string, slug: string[]): WikiPage | null {
  const wikiDir = getDomainDir(domain)
  const filePath = path.join(wikiDir, ...slug) + '.md'
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(raw)
  return {
    slug,
    domain,
    frontmatter: normalizeFrontmatter(data) as unknown as WikiPageFrontmatter,
    rawContent: content,
  }
}

export function buildLinkMap(domain: string): LinkMap {
  const pages = getAllPages(domain)
  const map: LinkMap = new Map()
  for (const page of pages) {
    if (page.frontmatter.title) {
      const href = `/domains/${domain}/wiki/${page.slug.join('/')}`
      map.set(normalizeTitle(page.frontmatter.title), href)
    }
  }
  return map
}

export async function compilePage(page: WikiPage) {
  const linkMap = buildLinkMap(page.domain)
  const { content } = await compileMDX<WikiPageFrontmatter>({
    source: page.rawContent,
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm, [remarkWikiLinks, { linkMap }]],
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
      },
    },
  })
  return content
}

export function getDomainWithStats(domain: string): DomainWithStats {
  const meta = getDomainMeta(domain)
  const pages = getAllPages(domain)
  const categoryCounts: Record<WikiPageType, number> = {
    entity: 0,
    concept: 0,
    source: 0,
    analysis: 0,
    overview: 0,
  }
  for (const page of pages) {
    const t = page.frontmatter.type
    if (t && t in categoryCounts) categoryCounts[t]++
  }
  return { ...meta, pageCount: pages.length, categoryCounts }
}

export function getAllDomainsWithStats(): DomainWithStats[] {
  return getAllDomainSlugs().map(getDomainWithStats)
}
