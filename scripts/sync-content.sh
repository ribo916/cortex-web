#!/usr/bin/env bash
set -euo pipefail

VAULT="/Users/ribo/Documents/Obsidian/Cortex/domains"
DEST="$(cd "$(dirname "$0")/.." && pwd)/content/domains"

mkdir -p "$DEST"

for domain_dir in "$VAULT"/*/; do
  domain=$(basename "$domain_dir")
  dest_domain="$DEST/$domain"
  mkdir -p "$dest_domain"

  rsync -av \
    --exclude='raw/' \
    --exclude='CLAUDE.md' \
    --exclude='.obsidian/' \
    --exclude='.claude/' \
    "$domain_dir" "$dest_domain/"
done

echo "Sync complete → $DEST"
