#!/usr/bin/env node
const path = require('path')

async function main() {
  const { createIndex } = await import('pagefind')
  const { index } = await createIndex({})

  const appDir = path.join(__dirname, '..', '.next', 'server', 'app')
  await index.addDirectory({ path: appDir })

  const outputPath = path.join(__dirname, '..', 'public', 'pagefind')
  await index.writeFiles({ outputPath })
  console.log(`Pagefind index written to ${outputPath}`)
}

main().catch((err) => {
  console.error('Search index build failed:', err)
  process.exit(1)
})
