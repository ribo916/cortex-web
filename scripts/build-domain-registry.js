#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const contentDir = path.join(__dirname, '..', 'content', 'domains')
const outputPath = path.join(__dirname, '..', 'content', 'index.json')

if (!fs.existsSync(contentDir)) {
  console.log('No content/domains directory found — skipping registry build')
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, JSON.stringify({ domains: [], generated: new Date().toISOString() }))
  process.exit(0)
}

const domains = fs
  .readdirSync(contentDir)
  .filter((d) => {
    const metaPath = path.join(contentDir, d, 'meta.json')
    return fs.existsSync(metaPath)
  })
  .map((d) => {
    const meta = JSON.parse(fs.readFileSync(path.join(contentDir, d, 'meta.json'), 'utf-8'))
    return { slug: d, ...meta }
  })

const registry = { domains, generated: new Date().toISOString() }
fs.writeFileSync(outputPath, JSON.stringify(registry, null, 2))
console.log(`Domain registry written: ${domains.length} domain(s)`)
