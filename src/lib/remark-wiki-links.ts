import { visit } from 'unist-util-visit'
import type { Root, Text, Link, Parent } from 'mdast'
import type { Plugin } from 'unified'
import { normalizeTitle, type LinkMap } from './wiki-links'

const WIKI_LINK_RE = /\[\[([^\]]+)\]\]/g

interface Options {
  linkMap: LinkMap
}

const remarkWikiLinks: Plugin<[Options], Root> = ({ linkMap }) => {
  return (tree) => {
    visit(tree, 'text', (node: Text, index: number | undefined, parent: Parent | undefined) => {
      if (!parent || index === undefined) return
      if (!node.value.includes('[[')) return

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parts: any[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null

      WIKI_LINK_RE.lastIndex = 0
      while ((match = WIKI_LINK_RE.exec(node.value)) !== null) {
        const before = node.value.slice(lastIndex, match.index)
        if (before) parts.push({ type: 'text', value: before })

        const title = match[1]
        const href = linkMap.get(normalizeTitle(title))

        if (href) {
          const link: Link = {
            type: 'link',
            url: href,
            children: [{ type: 'text', value: title }],
          }
          parts.push(link)
        } else {
          parts.push({ type: 'text', value: title })
        }

        lastIndex = match.index + match[0].length
      }

      const trailing = node.value.slice(lastIndex)
      if (trailing) parts.push({ type: 'text', value: trailing })

      if (parts.length > 1) {
        parent.children.splice(index, 1, ...parts)
      }
    })
  }
}

export default remarkWikiLinks
