#!/bin/bash
# Rebase the worktree here onto origin/main, resolving conflicts confined to the register's files (resolve-register.py)
# and writing the feature map again; any other conflict aborts the rebase and fails (exit 2), for a person to read.
L=$(cd "$(dirname "$0")" && pwd)
git fetch -q origin && git rebase origin/main > /dev/null 2>&1
for i in $(seq 1 80); do
  [ -d "$(git rev-parse --git-path rebase-merge)" ] || [ -d "$(git rev-parse --git-path rebase-apply)" ] || break
  files=$(git diff --name-only --diff-filter=U)
  if [ -n "$files" ]; then
    for f in $files; do case $f in
      doc/architecture/open-register.md|doc/architecture/features.json|doc/architecture/register-kinds.json|test/timings.json) ;;
      doc/architecture/feature-map.md) git checkout --theirs "$f" ;;
      doc/architecture/feature-map.json) python3 "$L/feature-map-merge.py" || { git rebase --abort; exit 2; } ;;
      doc/architecture/mission-22/planning.json) python3 "$L/planning-merge.py" || { git rebase --abort; exit 2; } ;;
      # Generated (fold.sh's mechanical set): either side, written again below from the tree as it stands.
      web/bundles.generated.json|doc/handbook/*) git checkout --theirs "$f" && regen=1 ;;
      *) echo "STOP: $f"; git rebase --abort; exit 2 ;;
    esac; done
    reg=$(echo "$files" | grep -E "open-register.md|features.json|register-kinds.json|test/timings.json")
    [ -z "$reg" ] || python3 "$L/resolve-register.py" $reg || { git rebase --abort; exit 2; }
    bun scripts/feature-map.ts --write > /dev/null 2>&1
    [ -z "${regen:-}" ] || bun -e "import { AssetCatalog } from './src/cli/asset-catalog'; await AssetCatalog.write(process.cwd());"
    git add doc/architecture web/bundles.generated.json doc/handbook test/timings.json 2> /dev/null; regen=
  fi
  GIT_EDITOR=true git rebase --continue > /dev/null 2>&1 || true
done
git merge-base --is-ancestor origin/main HEAD || { echo "NOT REBASED (a dirty tree, or a stop)"; exit 4; }
d=$(grep -o "^| [A-Z0-9]*-[0-9]* |" doc/architecture/open-register.md | sort | uniq -d)
[ -z "$d" ] || { echo "DUPLICATE ROWS: $d"; exit 3; }
echo "rebased onto $(git rev-parse --short origin/main)"
