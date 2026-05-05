#!/usr/bin/env bash
set -euo pipefail

VAULT="/Users/ribo/Documents/Obsidian/Cortex/domains"
DEST="$(cd "$(dirname "$0")/.." && pwd)/content/domains"

mkdir -p "$DEST"

for domain_dir in "$VAULT"/*/; do
  domain=$(basename "$domain_dir")

  # Skip template, hidden, and underscore-prefixed folders
  case "$domain" in
    _*|.*) continue ;;
  esac

  src_wiki="$domain_dir/wiki/"
  if [ ! -d "$src_wiki" ]; then
    echo "  skip $domain (no wiki/)"
    continue
  fi

  dest_wiki="$DEST/$domain/wiki/"
  mkdir -p "$dest_wiki"

  # Sync only wiki/ — preserves dest-only files like meta.json at the domain root
  rsync -av \
    --delete \
    --exclude='.obsidian/' \
    --exclude='.DS_Store' \
    "$src_wiki" "$dest_wiki"
done

echo "Sync complete → $DEST"
