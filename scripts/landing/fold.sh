#!/usr/bin/env bash
# Fold a branch's commits onto the branch checked out here, one by one (an agent's work onto the lead's), carrying the
# conflicts that are always mechanical: the generated web bundle and handbook made again, a kept trace or the
# laboratory taken from the branch (redigest or regenerate after), the register's and features' rows unioned by id
# (resolve-rows.py). Any other conflict stops it, for a person to read (Mission 22, 19 November).
#   scripts/landing/fold.sh <since> <branch>       e.g. fold.sh origin/main burn-7
set -u
here=$(cd "$(dirname "$0")" && pwd)
git cherry-pick "$1..$2" > /dev/null 2>&1
for i in $(seq 1 60); do
  git status | grep -q 'cherry-pick' || break
  for f in $(git diff --name-only --diff-filter=U); do
    case $f in
      web/bundles.generated.json|doc/handbook/*|test/fixtures/traces/*|test/fixtures/laboratory/*)
        git checkout --theirs "$f" && git add "$f" ;;
      doc/architecture/open-register.md|doc/architecture/features.json|doc/architecture/*/current-sprint.md)
        python3 "$here/resolve-rows.py" "$f" && git add "$f" ;;
      *) echo "STOP: $f"; exit 2 ;;
    esac
  done
  GIT_EDITOR=true git cherry-pick --continue > /dev/null 2>&1 || git cherry-pick --skip > /dev/null 2>&1 || true
done
bun -e "import { AssetCatalog } from './src/cli/asset-catalog'; await AssetCatalog.write(process.cwd());"
git status --short | head -5
echo "folded: $(git log --oneline "$1..HEAD" | wc -l) commits past $1; regenerate the laboratory and traces if they moved"
