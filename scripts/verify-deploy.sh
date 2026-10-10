#!/usr/bin/env bash
# Confirms the live site is serving a given build: a few key files must match
# it byte for byte, and every page in it must load. Run by CI after a deploy.
#
# Usage: scripts/verify-deploy.sh <dist-dir> [site-url]
set -euo pipefail

dist=${1:?usage: verify-deploy.sh <dist-dir> [site-url]}
site=${2:-https://melgart.net}

# GitHub Pages' CDN caches pages for up to 10 minutes (max-age=600), so a fresh
# deploy can take that long to show up. The query string skips the cache where
# it can.
deadline=$((SECONDS + 660))
live=$(mktemp)
trap 'rm -f "$live"' EXIT
for file in index.html posts/index.html rss.xml; do
  url="$site/${file%index.html}"
  until curl -fsS -o "$live" "$url?deploy-check=$RANDOM" && cmp -s "$live" "$dist/$file"; do
    if ((SECONDS > deadline)); then
      echo "::error::$url still doesn't match the deployed build after 11 minutes"
      exit 1
    fi
    sleep 20
  done
  echo "matches build: $url"
done

failed=0
while IFS= read -r file; do
  path=${file#"$dist"}
  path=${path%index.html}
  url="$site${path// /%20}"
  status=$(curl -s -o /dev/null -w '%{http_code}' "$url")
  if [[ $status != 200 ]]; then
    echo "::error::$url returned $status"
    failed=1
  fi
done < <(find "$dist" -name '*.html' -o -path "$dist/images/*" -type f)
((failed == 0)) && echo "all pages and images load"
exit "$failed"
