@AGENTS.md

# Cortex Web — Project Context

This file governs every Claude Code session in this directory. Read it in full before doing anything.

---

## What this is

A Next.js webapp that renders a multi-domain markdown wiki ("Cortex") as a browsable, searchable site. The wiki itself lives in a separate Obsidian vault (`/Users/ribo/Documents/Obsidian/Cortex/`) where Claude Code maintains it; this repo only renders it. Content is **synced** from the vault into `content/` and committed to this repo so Vercel builds are self-contained.

The wiki is an LLM-maintained "second brain" pattern: an LLM (Claude in Obsidian) writes structured pages with YAML frontmatter — entities, concepts, sources, analyses — interlinked with `[[wiki link]]` syntax. This webapp is the public read interface.

**Currently one domain:** `polly-api` (Polly's product and pricing engine — mortgage-lending API knowledge). The architecture supports unlimited domains.

---

## Architecture decisions (locked in)

- **Framework:** Next.js 16 App Router with Turbopack. RSC by default. All wiki pages use `generateStaticParams` → fully static HTML. Only `/api/ask` is a serverless function.
- **Search:** Pagefind v1, built **post-compile** via `scripts/build-search-index.js` running Pagefind's Node API against `.next/server/app`. Browser loads `/pagefind/pagefind.js` via dynamically injected `<script type="module">` (Turbopack does not support server-relative imports).
- **Markdown:** `gray-matter` for frontmatter, `next-mdx-remote/rsc` (`compileMDX`) for body. Plugins: `remark-gfm`, custom `remark-wiki-links`, `rehype-slug`, `rehype-autolink-headings`. No syntax highlighting yet.
- **UI:** shadcn/ui + Tailwind v4. Three-column layout on wiki pages (sidebar / prose / frontmatter panel).
- **AI Ask:** Stubbed. UI shows "Coming soon" until `NEXT_PUBLIC_ENABLE_ASK=true`. The endpoint at `src/app/api/ask/route.ts` returns 503 until then. The plan is to wire Vercel AI SDK + `@ai-sdk/anthropic` with BM25-style top-K retrieval over raw page content (no vector DB needed at current 332KB scale).
- **Auth:** None. Public site. Sourced wiki knowledge with no restriction needed.
- **Rejected:** Astro Starlight (multi-domain switching fights its sidebar abstraction; custom frontmatter panel requires fragile layout overrides).

---

## Repo layout

```
cortex-web/
├── CLAUDE.md                          ← this file
├── AGENTS.md                          ← Next.js framework agent rules (imported by CLAUDE.md)
├── README.md                          ← human-facing project intro
├── vercel.json                        ← framework: nextjs
├── content/
│   ├── index.json                     ← generated; domain registry
│   └── domains/
│       └── polly-api/
│           ├── meta.json              ← display name, description, color
│           └── wiki/                  ← synced from Obsidian vault
│               ├── overview.md
│               ├── index.md           ← skipped by content loader
│               ├── log.md             ← skipped by content loader
│               ├── entities/
│               ├── concepts/
│               ├── sources/
│               └── analyses/
├── scripts/
│   ├── sync-content.sh                ← rsync vault → content/ (excludes raw/, CLAUDE.md, .claude/, .obsidian/)
│   ├── build-domain-registry.js       ← prebuild: scans content/domains/ → content/index.json
│   └── build-search-index.js          ← postbuild: Pagefind Node API against .next/server/app → public/pagefind/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 ← root layout + SiteHeader
│   │   ├── page.tsx                   ← home: DomainGrid
│   │   ├── search/page.tsx            ← /search?q=&type=&domain=&tag=
│   │   ├── domains/[domain]/
│   │   │   ├── page.tsx               ← domain index (categorized listing)
│   │   │   └── wiki/[...slug]/page.tsx ← wiki page (statically generated)
│   │   └── api/ask/route.ts           ← AI endpoint (stubbed, returns 503)
│   ├── components/
│   │   ├── layout/                    ← SiteHeader, SiteSidebar
│   │   ├── domain/                    ← DomainGrid, DomainCard
│   │   ├── wiki/                      ← TypeBadge, FrontmatterPanel
│   │   ├── search/                    ← SearchTrigger, SearchDialog, SearchResults
│   │   ├── ask/                       ← AskPanel (stub)
│   │   └── ui/                        ← shadcn primitives
│   └── lib/
│       ├── types.ts                   ← WikiPage, DomainMeta, etc.
│       ├── content.ts                 ← server-only file I/O + compileMDX
│       ├── wiki-links.ts              ← title→href normalization
│       ├── remark-wiki-links.ts       ← [[Title]] → <a> remark plugin
│       ├── search.ts                  ← Pagefind browser wrapper
│       ├── useDebounce.ts
│       └── utils.ts                   ← shadcn `cn()` helper
└── public/pagefind/                   ← gitignored; generated each build
```

---

## Routing

| Path | Source |
|---|---|
| `/` | `src/app/page.tsx` — DomainGrid |
| `/domains/[domain]` | `src/app/domains/[domain]/page.tsx` — domain index |
| `/domains/[domain]/wiki/[...slug]` | `src/app/domains/[domain]/wiki/[...slug]/page.tsx` — wiki viewer |
| `/search` | `src/app/search/page.tsx` — full-page search |
| `/api/ask` | `src/app/api/ask/route.ts` — POST, returns 503 until `NEXT_PUBLIC_ENABLE_ASK=true` |

`generateStaticParams` is implemented at the domain level and the wiki-slug level. As of the initial build that's **61 static pages** (1 home + 1 domain + 54 wiki pages + search + 4 system).

---

## Content pipeline

`src/lib/content.ts` is the single source of truth for reading wiki content. **Server-only** — never import into client components.

Key behaviors:
- `getAllDomainSlugs()` scans `content/domains/` for any directory containing `meta.json`.
- `getAllPages(domain)` recursively walks `content/domains/<domain>/wiki/`, **skipping `index.md` and `log.md`** (those are vault-internal navigation/changelog files).
- `normalizeFrontmatter()` converts JS `Date` objects (which `js-yaml` produces from ISO date strings like `2026-05-02`) back to YYYY-MM-DD strings before they hit React. Without this, React throws "Objects are not valid as a React child".
- `buildLinkMap(domain)` builds a `Map<normalizedTitle, href>` over all pages. Normalization lowercases, strips em-dashes/punctuation, collapses whitespace — so `[[Lock Management — Overview]]` resolves to the page titled "Lock Management Overview".
- `compilePage(page)` uses `compileMDX` from `next-mdx-remote/rsc` with the remark/rehype pipeline. Returns a React node ready to drop into a server component.

### Wiki frontmatter schema

```yaml
---
title: Human-readable title
type: entity | concept | source | analysis | overview
tags: [tag1, tag2]
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [filename.md, "string with: colons must be quoted"]
related: [wiki/concepts/page.md, ...]
---
```

**Critical YAML gotcha:** flow-sequence strings containing colons (`[swagger: Lock Management tag]`) crash `js-yaml`. They must be quoted: `["swagger: Lock Management tag"]`. Six vault files were fixed during initial build; watch for this in any new pages from the wiki side.

---

## Search

Pagefind facets are emitted in `src/app/domains/[domain]/wiki/[...slug]/page.tsx` as `<span data-pagefind-filter="type:..."` etc. (visually hidden via `sr-only`). The Pagefind crawl picks these up post-build.

Client search wrapper (`src/lib/search.ts`):
- Loads `/pagefind/pagefind.js` via dynamic `<script type="module">` injection (Turbopack does **not** support server-absolute `import('/path')`).
- Caches `window.pagefind` after first load.

Two search UIs:
- **`SearchTrigger`** + **`SearchDialog`** — `⌘K` cmdk dialog from anywhere
- **`SearchResults`** — full-page on `/search`

---

## Workflows

### Local dev

```bash
npm run dev          # localhost:3000, no Pagefind
npm run build        # full pipeline: prebuild → next build → postbuild
npm run start        # serve the built output (use this to test search)
```

Pagefind is **not** generated by `next dev`. To test search locally, run `npm run build && npm run start`.

### Sync content from the Obsidian vault

The vault path is hardcoded in `scripts/sync-content.sh`: `/Users/ribo/Documents/Obsidian/Cortex/domains`.

```bash
npm run sync         # rsync vault → content/ (excludes raw/, CLAUDE.md, .claude/, .obsidian/)
git diff content/    # review what changed
git add content/ && git commit -m "content: <summary>"
git push             # triggers Vercel deploy
```

**Do not edit files in `content/` by hand** — they will be overwritten on next sync. Edit the vault, then sync.

The vault contains a `raw/` directory with source PDFs/HTML — **never copy this** (it's huge, immutable, and includes API specs not meant for public exposure). The sync script excludes it.

### Adding a new domain

1. In the vault: `mkdir /Users/ribo/Documents/Obsidian/Cortex/domains/<new-domain>/wiki`
2. Author a `CLAUDE.md` schema for that domain (see polly-api as template)
3. Build out `wiki/` content
4. In this repo: `mkdir content/domains/<new-domain>` and add `meta.json`:
   ```json
   { "name": "Display Name", "description": "...", "color": "#hex" }
   ```
5. `npm run sync && git add content/ && git commit && git push`

No code changes needed. Routing handles new domains automatically via `generateStaticParams`.

### Vercel deployment

**Initial setup (once):**

```bash
vercel login                 # opens browser
vercel --prod                # follow prompts: link or create project
```

After first deploy, connect the GitHub repo in the Vercel dashboard so future pushes auto-deploy.

**Environment variables** (Vercel dashboard → Project Settings → Environment Variables):

| Variable | Required? | Purpose |
|---|---|---|
| `ANTHROPIC_API_KEY` | only if AI is enabled | Vercel AI SDK calls Anthropic |
| `NEXT_PUBLIC_ENABLE_ASK` | optional | set `true` to show Ask UI; otherwise stubbed |

**Build pipeline on Vercel:**
- `prebuild` runs `node scripts/build-domain-registry.js`
- `build` runs `next build`
- `postbuild` runs `node scripts/build-search-index.js` against `.next/server/app`, writes `public/pagefind/`

Vercel Hobby plan is sufficient. Static pages = zero serverless invocations. Only `/api/ask` (when enabled) consumes function quota.

---

## Working in this repo

### Things that will bite you

- **Don't import `src/lib/content.ts` into client components.** It uses `fs` and is server-only.
- **Date objects from YAML.** Always run new frontmatter through `normalizeFrontmatter()`. If you add fields like `published` or `expires`, they'll break the same way.
- **Pagefind is gitignored.** First-time clone needs `npm run build` before search works locally.
- **Turbopack and absolute imports.** `import('/foo.js')` does not work. Use `<script>` injection or relative paths.
- **next-mdx-remote v6.** Use `compileMDX` from `next-mdx-remote/rsc` (not `serialize` / `<MDXRemote>` from v5 docs you may find).
- **Wiki link resolution is by title, not filename.** Renaming a page's `title:` field breaks `[[links]]` to it. Renaming the *file* doesn't (since links use the title map).
- **Editing `content/` by hand.** Will be silently clobbered by next `npm run sync`.

### Things that aren't built but were planned

- **Breadcrumbs component** — shadcn primitive exists in `src/components/ui/breadcrumb.tsx` but no `Breadcrumbs.tsx` wrapper using it
- **`FilterChips` for search** — search currently has no filter UI
- **`CitationCard`** — for AI Ask answers
- **`MarkdownRenderer` / `WikiPage` wrappers** — page route currently inlines the rendering
- **AI Ask backend** — endpoint returns 503; plan is in the section below

### AI Ask implementation plan (when ready)

Endpoint at `src/app/api/ask/route.ts`:
1. Receive `{ question, domain }` from client
2. Load all `getAllPages(domain)` raw content in memory (332KB total — fits)
3. Top-8 retrieval via term-frequency scoring against `rawContent`
4. `streamText` from `ai` package with `@ai-sdk/anthropic` (`claude-sonnet-4-6`)
5. Return `result.toDataStreamResponse()`

Client (`AskPanel.tsx`):
- `useChat` hook from `ai/react`
- Stream answer as markdown
- Post-completion: regex-extract `[Page Title]` citations from answer, resolve via `linkMap`, render citation cards

Cost estimate: ~$0.003–0.01/question with `claude-sonnet-4-6`. Vercel Hobby function timeout is 10s — sufficient.

**Note:** `ai` package is v6 in this repo, not v3 as some docs/tutorials reference. APIs differ.

---

## Tech stack quick reference

| Concern | Package | Version |
|---|---|---|
| Framework | next | 16.2.4 |
| React | react | 19.2.4 |
| Markdown | gray-matter, next-mdx-remote | 4, 6 |
| Remark/rehype | remark-gfm, rehype-slug, rehype-autolink-headings | latest |
| Search | pagefind, @pagefind/default-ui | 1.5.x |
| AI SDK | ai, @ai-sdk/anthropic | 6.x, 3.x |
| UI | shadcn/ui (Tailwind v4) | — |
| Icons | lucide-react | 1.x |

---

## Reference paths

- **Vault root:** `/Users/ribo/Documents/Obsidian/Cortex/`
- **Vault domain (template for new domains):** `/Users/ribo/Documents/Obsidian/Cortex/domains/polly-api/CLAUDE.md`
- **Wiki schema source of truth:** the vault domain's `CLAUDE.md`
- **This webapp:** `/Users/ribo/Dev/cortex-web/`

---

## Session startup checklist

1. Read this file (`CLAUDE.md`) in full.
2. Skim `package.json` to confirm script names haven't drifted.
3. If the user is doing content work: remind them to edit in the vault, not in `content/`.
4. If the user wants to see local search behavior: tell them to `npm run build && npm run start` — `next dev` does not produce the Pagefind index.
