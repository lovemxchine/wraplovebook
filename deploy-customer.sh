#!/bin/bash
# ponytail: one script per customer — copy the site into deploys/<slug>/,
# pause so you can edit that copy's js/data.js with the customer's actual
# names/dates/letter, then deploy that copy as its own Cloudflare Pages
# project. No templating engine, no shared backend — deploys/ is
# gitignored so 50-60 customers' personal data never touches git.
#
# One-time setup before first use: npx wrangler login  (opens your browser,
# log into your own Cloudflare account — free tier, no card needed)
#
# Usage: ./deploy-customer.sh <customer-slug>
#   <customer-slug> becomes both the folder name and the live URL:
#   https://<customer-slug>.lovememo-<customer-slug>.pages.dev (Cloudflare
#   picks the exact subdomain; it prints the real URL when deploy finishes)
set -e

SLUG="$1"
if [ -z "$SLUG" ]; then
  echo "Usage: ./deploy-customer.sh <customer-slug>"
  echo "Example: ./deploy-customer.sh nueng-tarn"
  exit 1
fi

SRC="$(cd "$(dirname "$0")" && pwd)"
DEST="$SRC/deploys/$SLUG"

if [ -d "$DEST" ]; then
  echo "deploys/$SLUG already exists — reusing it (edit js/data.js there if needed)."
else
  mkdir -p "$SRC/deploys"
  rsync -a \
    --exclude='.git' \
    --exclude='deploys' \
    --exclude='node_modules' \
    --exclude='.DS_Store' \
    "$SRC/" "$DEST/"
  echo "Copied site to $DEST"
fi

echo ""
echo "Now edit $DEST/js/data.js with this customer's names / date / letter / song."
echo "Press Enter when it's ready to deploy (Ctrl+C to stop and edit later)..."
read -r

npx wrangler pages deploy "$DEST" --project-name="lovememo-$SLUG"
