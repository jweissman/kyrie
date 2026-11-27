#!/bin/bash
# The landing queue: one runner over one file, in place of hand-made chains of waits (27 November: a chain watched
# the wrong file, a cd failed into the owner's checkout, a stack was pushed onto a red main). Each line of the queue
# file is one landing, taken in order:
#   <tag> <worktree> <sha>                  a branch's head, gated and landed as it is (gate.sh)
#   <tag> - <sha>,<sha>,...                 a batch: stacked in a fresh worktree off main (stack.sh), gated once
#   # …                                     a comment; a line the runner has taken is rewritten "# done <tag> …"
# Before each landing the runner reads main's last push run: on red it stops, unless the line's tag begins "mend"
# (a mend is what a red main is waiting for). A gate that fails is marked "# failed <tag> …" and the queue goes on;
# a landing that leaves main red stops the queue, naming it, for a person to mend or revert.
#   scripts/landing/queue.sh /var/tmp/kyrie/queue.txt
# Lines added to the file while it runs are taken in their turn. With --watch it waits for new lines when the file
# is empty, looking each minute, and stops after KYRIE_QUEUE_IDLE seconds with none (default six hours).
L=$(cd "$(dirname "$0")" && pwd)
watch=; [ "${1:-}" = --watch ] && { watch=1; shift; }
Q=${1:?usage: queue.sh [--watch] <queue file>}
idle=0
W=${KYRIE_WORKTREES:-/var/tmp/kyrie}; S=${KYRIE_LOGS:-$W/logs}; mkdir -p "$S"
R=$(git -C "$L" worktree list --porcelain | awk 'NR == 1 { print $2 }')
say() { echo "$(date +%H:%M) $*" | tee -a "$S/queue.log"; }
mark() { sed -i "0,/^$1 /s//# $2 $1 /" "$Q"; }
red() {
  local c; c=$(cd "$R" && gh run list --workflow ci.yml --branch main --event push --limit 1 --json conclusion,status \
    -q '.[0] | if .status == "completed" then .conclusion else "pending" end' 2> /dev/null)
  [ "$c" = failure ]
}
while :; do
  line=$(grep -vE '^\s*(#|$)' "$Q" | head -1)
  if [ -z "$line" ]; then
    [ -n "$watch" ] && [ "$idle" -lt "${KYRIE_QUEUE_IDLE:-21600}" ] || { say "queue empty"; exit 0; }
    sleep 60; idle=$((idle + 60)); continue
  fi
  idle=0
  read -r tag wt shas <<< "$line"
  if red && [[ $tag != mend* ]]; then say "main is red: stopped before $tag"; exit 3; fi
  if [ "$wt" = - ]; then
    wt=wt-q-$tag; P=$W/$wt
    git -C "$R" fetch -q origin && "$L/../machine/worktree.sh" "$P" origin/main > /dev/null || { say "$tag: no worktree"; mark "$tag" failed; continue; }
    (cd "$P" || exit 1; "$L/stack.sh" ${shas//,/ } > "$S/$tag-stack.log" 2>&1) || { say "$tag: stack stopped ($(tail -1 "$S/$tag-stack.log"))"; mark "$tag" failed; continue; }
    sha=$(git -C "$P" rev-parse --short HEAD)
  else
    sha=$shas
  fi
  say "$tag: gating $sha"
  WT=$wt TAG=$tag SHA=$sha "$L/gate.sh"; r=$?
  if [ $r -eq 0 ]; then say "$tag: landed"; mark "$tag" done; continue; fi
  if grep -q "CI RED" "$S/$tag-land.log" 2> /dev/null; then say "$tag: pushed and main is red: stopped"; mark "$tag" red; exit 4; fi
  say "$tag: gate failed ($(tail -1 "$S/$tag-run.log"))"; mark "$tag" failed
done
