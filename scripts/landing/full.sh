#!/usr/bin/env bash
# The whole suite on CI for a commit before it lands (doc/architecture/landing.md): a change that moves the world
# (content, paintings, generation, rules) is seen whole only by the full run, which the push lane does not make.
# Pushes the commit to a check branch, dispatches CI there, waits for that run (it can take a minute to be listed),
# and only if it passes lands the same commit by land.sh.
#   scripts/landing/full.sh <sha> [check-branch]      from the worktree that holds the commit
set -u
c=$(git rev-parse "${1:?a commit to land}") branch=${2:-check-$(git rev-parse --short "$c")}
git push -q -f origin "$c:refs/heads/$branch" || { echo "PUSH FAILED"; exit 1; }
sleep 5
gh workflow run ci.yml --ref "$branch" || exit 1
id=
for _ in 1 2 3 4 5 6 7 8 9; do
  sleep 20
  id=$(gh run list --branch "$branch" --event workflow_dispatch --limit 1 --json databaseId -q '.[0].databaseId')
  [ -n "$id" ] && break
done
[ -n "$id" ] || { echo "NO RUN FOUND"; exit 1; }
echo "full $id ($c)"
gh run watch "$id" --interval 60 --exit-status > /dev/null 2>&1 || { echo "full FAILED: gh run view $id --log-failed"; exit 1; }
echo "full success"
exec "$(dirname "$0")/land.sh" "$c"
