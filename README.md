# Cortex Web

A Next.js webapp that renders a multi-domain markdown wiki ("Cortex") as a browsable, searchable site.

The wiki content is authored in a separate Obsidian vault at `~/Documents/Obsidian/Cortex/`, where it's maintained by Claude Code under an LLM-driven knowledge-base schema. **This repo only renders it** — content is never edited here directly.

> **Authoring docs:** See `~/Documents/Obsidian/Cortex/README.md` for the end-to-end workflow of creating a new domain and ingesting sources. This README focuses on the webapp side.

---

## Build & run

```bash
npm install
npm run sync          # pull latest wiki content from the vault
npm run build         # prebuild registry → next build → Pagefind index
npm run start         # serve at localhost:3000
```

For hot-reload dev:

```bash
npm run dev
```

Caveats in dev mode:
- **Search is disabled** — Pagefind is a post-build step, so the index doesn't exist in dev
- **Restart after content changes** — Next.js doesn't watch files outside `src/`, so changes to `content/` (including new domains) require a dev-server restart and hard refresh

---

## Sync content from the vault

After editing wiki content in the Obsidian vault:

```bash
npm run sync                                    # rsync vault → content/
git diff content/                               # review what changed
git add content/ && git commit -m "content: <summary>"
git push                                        # triggers Vercel auto-deploy
```

The sync script (`scripts/sync-content.sh`) only touches `content/domains/<slug>/wiki/` — `meta.json` files at the domain root are preserved. It also skips `_template/`, `raw/`, and `CLAUDE.md` from the vault.

**Never edit anything under `content/domains/<slug>/wiki/` by hand** — it will be overwritten on next sync.

---

## Add a new domain

The full workflow lives in the vault's `README.md`. Webapp-side, only one thing happens here: a `meta.json` is created at `content/domains/<slug>/meta.json` with display config:

```json
{
  "name": "Display Name",
  "description": "One-line summary shown on the home page.",
  "color": "#hex"
}
```

The vault-root `CLAUDE.md` bootstrap command creates this automatically when you ask Claude (in a session at the vault root) to "create a new domain." After that, `npm run sync` pulls in the wiki content and the domain auto-appears on the next build.

The webapp auto-discovers any folder under `content/domains/` containing a `meta.json` — no code changes are needed to support new domains.

---

## Deploy to Vercel

```bash
vercel login
vercel --prod
```

After first deploy, link the GitHub repo in Vercel for auto-deploys on every push to `main`.

The Vercel build runs the full pipeline:
1. `prebuild` → `node scripts/build-domain-registry.js` (scans `content/domains/` → writes `content/index.json`)
2. `next build` → static generation for every wiki page across all domains
3. `postbuild` → `node scripts/build-search-index.js` (Pagefind index against `.next/server/app`)

---

## Architecture

- **Next.js 16 App Router** with full static generation (`generateStaticParams`)
- **Pagefind** for client-side search (built post-compile)
- **shadcn/ui** + **Tailwind v4** for components
- **`next-mdx-remote/rsc`** for markdown rendering with custom remark plugin for `[[wiki links]]`
- **AI Ask** — stubbed; gated behind `NEXT_PUBLIC_ENABLE_ASK=true`

See [`CLAUDE.md`](./CLAUDE.md) for full project context, file layout, gotchas, and implementation plan.

---

## Where things live

| What | Where |
|---|---|
| Wiki source of truth | `~/Documents/Obsidian/Cortex/domains/<slug>/wiki/` (vault) |
| Synced wiki copy (build input) | `content/domains/<slug>/wiki/` (this repo, gitignored from edits) |
| Per-domain display config | `content/domains/<slug>/meta.json` (this repo, hand-maintained) |
| Auto-generated registry | `content/index.json` (this repo, regenerated on every build) |
| Sync script | `scripts/sync-content.sh` |
| Domain registry builder | `scripts/build-domain-registry.js` |
| Search index builder | `scripts/build-search-index.js` |
