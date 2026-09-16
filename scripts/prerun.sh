#!/usr/bin/env bash
# Pre-run context: CodeGraph for code + decisions/logs for prior agent records.
# Usage: scripts/prerun.sh <keywords...>   (mandatory before planning or /build)
set -u
[ $# -eq 0 ] && { echo "usage: scripts/prerun.sh <keywords...>"; exit 1; }
q="$*"
hits() { for w in $q; do grep -rli -- "$w" "$1" 2>/dev/null; done | grep -v README | sort -u; }

echo "## codegraph"
codegraph sync . >/dev/null 2>&1
codegraph explore "$q" 2>&1 | head -60

# ponytail: codegraph does not index .md, so grep is the docs index. Swap if codegraph ever parses markdown.
echo "## decisions (touching: $q)"
hits docs/decisions/ | while read -r f; do
  echo "# $f"; grep -E '^## D-|^- (chosen|revisit-when|touches|supersedes):' "$f"
done
echo "## logs (open issues / next touching: $q)"
hits docs/logs/ | while read -r f; do
  echo "# $f"; awk '/^## issues-open/{p=1} p' "$f"
done
