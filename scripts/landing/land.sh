#!/usr/bin/env bash
# Land a commit on main from a spare worktree, so the working tree it was made in stays free (Mission 22, 19 November).
# Waits for main's push lane and Pages to be idle (a workflow_dispatch run is never waited on), rebases onto main there
# and gates it with check:fast if main moved, runs the type-aware lint CI runs (check:fast's is not), pushes, and
# watches its own run by head sha; it says which register rows cite a spec the landing changes, to be read again
# (scripts/spec-citers.ts). One landing at a time, whoever runs it (a lock): two at once shared the spare tree and
# one's checkout swallowed the other's.
#   scripts/landing/land.sh [commit]          default the branch checked out where it is run from
# Settings, by environment: KYRIE_LAND_TREE (the spare worktree, default /var/tmp/kyrie/wt-land), KYRIE_LAND_LOCK
# (default /var/tmp/kyrie/land.lock), KYRIE_LAND_LOGS (default /var/tmp/kyrie), KYRIE_LAND_FF (a checkout to
# fast-forward once it has landed, e.g. the owner's; none by default).
set -u
from=$(git rev-parse --show-toplevel)
L=${KYRIE_LAND_TREE:-/var/tmp/kyrie/wt-land} logs=${KYRIE_LAND_LOGS:-/var/tmp/kyrie}
[ -d "$L" ] || git -C "$from" worktree add -q --detach "$L" origin/main || exit 1
exec 9>"${KYRIE_LAND_LOCK:-/var/tmp/kyrie/land.lock}"
flock 9
c=$(git -C "$from" rev-parse "${1:-HEAD}")
cd "$L" && git checkout -q --detach "$c" || exit 1
for i in $(seq 1 40); do
  busy=$(gh run list --branch main --limit 8 --json status,event -q '[.[] | select(.status!="completed" and .event!="workflow_dispatch")] | length')
  if [ "$busy" = "0" ]; then
    git fetch -q
    if ! git merge-base --is-ancestor origin/main HEAD; then
      git rebase -q origin/main || { echo "REBASE CONFLICT"; git rebase --abort; exit 1; }
      env -u KYRIE_BROWSER bun run check:fast > "$logs/land-fast.log" 2>&1 || { echo "GATE RED after rebase"; exit 1; }
      continue
    fi
    [ -n "${linted:-}" ] || { bun run lint > "$logs/land-lint.log" 2>&1 \
      || { echo "LINT RED"; tail -5 "$logs/land-lint.log"; exit 1; }; linted=1; }
    # The rows citing a spec this landing changes, to be read again (MT-19, pattern 4): told, never a bar.
    bun scripts/spec-citers.ts origin/main | grep -v ': 0 rows cite' | sed 's/^/READ AGAIN: /'
    h=$(git rev-parse --short HEAD)
    git push -q origin HEAD:main || { echo "PUSH REFUSED"; continue; }
    echo "PUSHED $h"
    # The push's run, waited for until it is listed: read 25 seconds after the push, it had not always been, and an
    # empty id watched read as red (roundE, 28 November: a docs landing said "main is red" with its run still going).
    id=""; for _ in $(seq 1 20); do
      sleep 15
      id=$(gh run list --branch main --limit 6 --json databaseId,headSha,name,event \
        -q ".[] | select(.name==\"CI\" and .event==\"push\" and (.headSha|startswith(\"$h\"))) | .databaseId" | head -1)
      [ -n "$id" ] && break
    done
    [ -n "$id" ] || { echo "CI RUN NOT FOUND $h"; exit 1; }
    green=0; gh run watch "$id" --interval 60 --exit-status > /dev/null 2>&1 && green=1
    [ "$green" = 1 ] && echo "CI GREEN $h" || echo "CI RED $h"
    # The owner's checkout is fast-forwarded only to a green main: a red one is mended or reverted first (25 November:
    # a red main had been brought into the owner's checkout).
    if [ "$green" != 1 ] && [ -n "${KYRIE_LAND_FF:-}" ]; then echo "FF HELD (main is red)"; exit 1; fi
    if [ -n "${KYRIE_LAND_FF:-}" ]; then
      git -C "$KYRIE_LAND_FF" fetch -q
      # A file the owner wrote and left untracked that main now carries byte for byte (checked in from their checkout)
      # is set aside only where it is identical, so the fast-forward can bring it back as tracked; any other stays,
      # and the fast-forward stops as before.
      git -C "$KYRIE_LAND_FF" ls-files --others --exclude-standard | while read -r f; do
        git -C "$KYRIE_LAND_FF" cat-file -e "origin/main:$f" 2>/dev/null \
          && git -C "$KYRIE_LAND_FF" show "origin/main:$f" | cmp -s - "$KYRIE_LAND_FF/$f" && rm -- "$KYRIE_LAND_FF/$f"
      done
      # So is a tracked file the owner changed that main now carries byte for byte (their edit checked in as written):
      # restored to what it was, which the fast-forward then brings again; a change main does not hold stays, and stops
      # the fast-forward as before.
      git -C "$KYRIE_LAND_FF" diff --name-only | while read -r f; do
        git -C "$KYRIE_LAND_FF" show "origin/main:$f" 2>/dev/null | cmp -s - "$KYRIE_LAND_FF/$f" \
          && git -C "$KYRIE_LAND_FF" checkout -q -- "$f"
      done
      git -C "$KYRIE_LAND_FF" merge -q --ff-only origin/main && echo ff || echo "FF STOPPED (local changes main does not hold)"
    fi
    exit 0
  fi
  id=$(gh run list --branch main --limit 8 --json databaseId,status,event \
    -q '[.[] | select(.status!="completed" and .event!="workflow_dispatch")][0].databaseId')
  gh run watch "$id" --interval 60 > /dev/null 2>&1
done
echo "GAVE UP WAITING"
