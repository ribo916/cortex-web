export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[—–\-]/g, ' ')
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export type LinkMap = Map<string, string>

export function resolveWikiLink(title: string, linkMap: LinkMap): string | null {
  return linkMap.get(normalizeTitle(title)) ?? null
}
