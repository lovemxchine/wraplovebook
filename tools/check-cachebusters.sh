#!/bin/sh
# Fails if css/style.css or js/app.js changed since the commit that last bumped
# its ?v= in index.html. Returning visitors get the cached old file otherwise —
# it silently shipped two CSS changes on a stale v=161.
# Run before pushing:  sh tools/check-cachebusters.sh
status=0
for f in css/style.css js/app.js js/data.js; do
  v=$(grep -oE "$(echo "$f" | sed 's/[./]/\\&/g')\?v=[0-9]+" index.html | grep -oE '[0-9]+$')
  [ -z "$v" ] && continue
  # newest commit that set this exact ?v= value
  bump=$(git log -1 --format=%H -S"$f?v=$v" -- index.html)
  [ -z "$bump" ] && continue
  if [ -n "$(git log --format=%H "$bump"..HEAD -- "$f")" ]; then
    echo "STALE: $f changed after ?v=$v was set — bump it in index.html"
    status=1
  fi
done
[ $status -eq 0 ] && echo "cache-busters OK"
exit $status
