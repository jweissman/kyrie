#!/bin/bash
# A builder's worktree of Kyrie without assets/ (the owner's paintings and sheets, 1.7 GB): a sparse checkout of
# '/*' '!/assets/', set for this worktree alone (its config.worktree and its own info/sparse-checkout), never in the
# shared .git/config, so the owner's checkout and every other worktree are untouched. Then bun install.
# The specs that read image bytes are CI's (test/lanes.json, the images lane); FULL=1 makes a full checkout for
# painting work (bg-import, the portrait scripts).
#   scripts/machine/worktree.sh <name> <base> [<new branch>]     e.g. worktree.sh wt-foo-1125 origin/main foo-1125
#   FULL=1 scripts/machine/worktree.sh wt-art-1125 origin/main art-1125
# A relative name is made under KYRIE_WORKTREES (default /var/tmp/kyrie). The repository is the one this script is
# in, or KYRIE_REPO.
set -euo pipefail
here=$(cd "$(dirname "$0")" && pwd)
REPO=${KYRIE_REPO:-$(git -C "$here" rev-parse --show-toplevel)}
name=${1:?usage: worktree.sh <name> <base> [<new branch>]}
base=${2:?usage: worktree.sh <name> <base> [<new branch>]}
branch=${3:-}
case "$name" in /*) P=$name ;; *) P=${KYRIE_WORKTREES:-/var/tmp/kyrie}/$name ;; esac
test ! -e "$P" || { echo "worktree.sh: $P is already there" >&2; exit 1; }
if [ -n "$branch" ]; then
  git -C "$REPO" worktree add -q --no-checkout -b "$branch" "$P" "$base"
else
  git -C "$REPO" worktree add -q --no-checkout --detach "$P" "$base"
fi
if [ -z "${FULL:-}" ]; then
  git -C "$REPO" config extensions.worktreeConfig true
  git -C "$P" config --worktree core.sparseCheckout true
  git -C "$P" config --worktree core.sparseCheckoutCone false
  f=$(git -C "$P" rev-parse --path-format=absolute --git-path info/sparse-checkout)
  mkdir -p "$(dirname "$f")" && printf '/*\n!/assets/\n' > "$f"
fi
git -C "$P" read-tree -mu HEAD
(cd "$P" && bun install --frozen-lockfile > /dev/null)
if [ -n "${FULL:-}" ]; then echo "$P (full)"; else echo "$P (without assets/)"; fi
