#!/bin/bash
# Cherry-pick commits in order onto the current HEAD, resolving the register's conflicts as rebase-register.sh does
# (resolve-register.py for the register's files; the feature map and the bundle taken and written again); any other
# conflict stops, naming the file and the commit (exit 2). Refuses the owner's checkout (the main worktree): a stack
# is made in a worktree of its own.
#   cd /var/tmp/kyrie/wt-stack-1127 && scripts/landing/stack.sh <sha>...
L=$(cd "$(dirname "$0")" && pwd)
owner=$(git worktree list --porcelain | awk 'NR == 1 { print $2 }')
[ "$(git rev-parse --show-toplevel 2> /dev/null)" = "$owner" ] && { echo "REFUSED: stack.sh in the owner's checkout"; exit 9; }
for c in "$@"; do
  if git cherry-pick "$c" > /dev/null 2>&1; then continue; fi
  files=$(git diff --name-only --diff-filter=U)
  [ -z "$files" ] && { git cherry-pick --skip > /dev/null 2>&1; echo "skip (empty) $c"; continue; }
  reg=$(echo "$files" | grep -E "open-register.md|features.json|register-kinds.json|test/timings.json")
  other=$(echo "$files" | grep -vE "open-register.md|features.json|register-kinds.json|test/timings.json|feature-map.md|feature-map.json|bundles.generated.json|mission-22/planning.json")
  [ -n "$other" ] && { echo "STOP at $c: $other"; exit 2; }
  [ -z "$reg" ] || python3 "$L/resolve-register.py" $reg || { echo "STOP register at $c"; exit 2; }
  echo "$files" | grep -q planning.json && python3 "$L/planning-merge.py"
  echo "$files" | grep -qx doc/architecture/feature-map.json && python3 "$L/feature-map-merge.py"
  for f in doc/architecture/feature-map.md web/bundles.generated.json; do
    echo "$files" | grep -qx "$f" && git checkout --theirs "$f"
  done
  git add -A doc test web data 2> /dev/null
  GIT_EDITOR=true git cherry-pick --continue > /dev/null 2>&1 || { echo "STOP continue at $c"; exit 2; }
done
bun scripts/feature-map.ts --write > /dev/null 2>&1; bun run web:build > /dev/null 2>&1
git add -A doc web 2> /dev/null
git diff --cached --quiet || git commit -q -m "The feature map and the page's bundle written again for the stack"
echo "stacked $(git rev-parse --short HEAD)"
