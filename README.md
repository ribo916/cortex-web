# Cortex Web

A Next.js webapp that renders a multi-domain markdown wiki ("Cortex") as a browsable, searchable site.

The wiki content lives in a separate Obsidian vault (`/Users/ribo/Documents/Obsidian/Cortex/`) where it's maintained by Claude Code under an LLM-driven knowledge-base schema. This repo only renders it.

## Quick start

```bash
npm install
npm run sync          # pull latest content from the Obsidian vault
npm run build         # generates static pages + Pagefind search index
npm run start         # serve at localhost:3000
```

For local iteration with hot reload, `npm run dev` — but search won't work in dev mode (Pagefind is a post-build step).

## Common workflows

**Update content from the vault:**
```bash
npm run sync
git add content/ && git commit -m "content: <summary>" && git push
```

**Add a new domain:**
1. Create the vault folder + content
2. `mkdir content/domains/<name>` and add `meta.json` (`{ name, description, color }`)
3. Sync, commit, push — routing handles it automatically

**Deploy to Vercel:**
```bash
vercel login
vercel --prod
```

After first deploy, link the GitHub repo in Vercel for auto-deploys.

## Architecture

- **Next.js 16 App Router** with full static generation (`generateStaticParams`)
- **Pagefind** for client-side search (built post-compile)
- **shadcn/ui** + **Tailwind v4** for components
- **`next-mdx-remote/rsc`** for markdown rendering
- **AI Ask** — stubbed; gated behind `NEXT_PUBLIC_ENABLE_ASK=true`

See [`CLAUDE.md`](./CLAUDE.md) for full project context, file layout, gotchas, and the AI Ask implementation plan.
