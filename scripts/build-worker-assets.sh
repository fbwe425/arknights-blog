#!/usr/bin/env bash
# Build a clean Worker static-asset directory without local Git/Wrangler metadata.
set -euo pipefail
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_DIR="$ROOT_DIR/dist"
rm -rf "$OUTPUT_DIR"
mkdir -p "$OUTPUT_DIR"
# tar is available in the deployment image; its exclusion list prevents source-control
# metadata and Worker-only files from being exposed as public site assets.
(
  cd "$ROOT_DIR"
  tar -cf - \
    --exclude='.git' \
    --exclude='.wrangler' \
    --exclude='dist' \
    --exclude='scripts' \
    --exclude='worker.js' \
    --exclude='wrangler.jsonc' \
    --exclude='.gitignore' \
    --exclude='README.md' \
    .
) | (
  cd "$OUTPUT_DIR"
  tar -xf -
)
printf 'Worker asset bundle created at %s\n' "$OUTPUT_DIR"
