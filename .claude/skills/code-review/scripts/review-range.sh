#!/usr/bin/env bash
# Print a git range for an isolated reviewer. Does not mutate the tree.
set -euo pipefail

BASE="${1:-origin/main}"
HEAD="${2:-HEAD}"

if ! git rev-parse --verify "$BASE" >/dev/null 2>&1; then
  echo "Unknown BASE ref: $BASE" >&2
  exit 1
fi
if ! git rev-parse --verify "$HEAD" >/dev/null 2>&1; then
  echo "Unknown HEAD ref: $HEAD" >&2
  exit 1
fi

echo "BASE_SHA=$(git rev-parse "$BASE")"
echo "HEAD_SHA=$(git rev-parse "$HEAD")"
echo
git diff --stat "$BASE".."$HEAD"
