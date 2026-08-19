#!/bin/bash
# ponytail: one script per customer — copy the site into deploys/<slug>/,
# overlay that customer's content (user_data/*.json + assets/photos/*) from
# a prepared data folder, then deploy that copy as its own Cloudflare Pages
# project. No pause, no templating engine, no shared backend — deploys/ is
# gitignored so many customers' personal data never touches git.
#
# One-time setup before first use: npx wrangler login  (opens your browser,
# log into your own Cloudflare account — free tier, no card needed)
#
# Per customer, prepare a data folder first (can be done by anyone, doesn't
# need this script) containing whatever differs from the base site:
#   <data-dir>/user_data/*.json   — see user_data/README.md for the fields
#   <data-dir>/assets/photos/*    — their actual photos
# Only include the files that differ; anything not present falls back to
# whatever's already in the base repo.
#
# Usage: ./deploy-customer.sh <customer-slug> <data-dir>
#   <customer-slug> becomes both the folder name and the live URL:
#   https://<customer-slug>.lovememo-<customer-slug>.pages.dev (Cloudflare
#   picks the exact subdomain; it prints the real URL when deploy finishes)
set -e

SLUG="$1"
DATA_DIR="$2"
if [ -z "$SLUG" ] || [ -z "$DATA_DIR" ]; then
  echo "Usage: ./deploy-customer.sh <customer-slug> <data-dir>"
  echo "Example: ./deploy-customer.sh nueng-tarn ./customer-data/nueng-tarn"
  exit 1
fi
if [ ! -d "$DATA_DIR" ]; then
  echo "Data dir not found: $DATA_DIR"
  exit 1
fi

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$SRC/deploys/$SLUG"

mkdir -p "$SRC/deploys"
rsync -a \
  --exclude='.git' \
  --exclude='deploys' \
  --exclude='customer-data' \
  --exclude='node_modules' \
  --exclude='.DS_Store' \
  "$SRC/" "$DEST/"
echo "Copied base site to $DEST"

rsync -a "$DATA_DIR/" "$DEST/"
echo "Overlaid customer data from $DATA_DIR"

# ponytail: privacy guard — anything that ships is public, so refuse to deploy
# if another customer's folder ended up inside this copy.
if [ -d "$DEST/customer-data" ] || [ -d "$DEST/deploys" ]; then
  echo "ABORT: other customers' data leaked into $DEST — not deploying"
  exit 1
fi

npx wrangler pages deploy "$DEST" --project-name="lovememo-$SLUG"
