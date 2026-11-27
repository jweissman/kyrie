#!/bin/bash
# Gates a branch and lands it. WT=<builder's worktree dir> TAG=<log tag> [SHA=<commit>, default WT's HEAD].
# Never in the builder's worktree (it may be mid-edit): a throwaway worktree at the sha, removed after.
# Rebased onto main first, the register's conflicts resolved by row (rebase-register.sh); then only the fast
# verifiers (the owner, 25 November: long tests are CI's load), check:fast and test:small; land.sh pushes and watches
# CI, and the owner's checkout (the repository's main worktree) is fast-forwarded only to green.
#   WT=wt-foo-1127 TAG=foo SHA=<sha> scripts/landing/gate.sh
# Worktrees are under KYRIE_WORKTREES (default /var/tmp/kyrie), logs under KYRIE_LOGS (default its logs/).
L=$(cd "$(dirname "$0")" && pwd)
W=${KYRIE_WORKTREES:-/var/tmp/kyrie}; S=${KYRIE_LOGS:-$W/logs}; mkdir -p "$S"
R=$(git -C "$L" worktree list --porcelain | awk 'NR == 1 { print $2 }')
src=$W/${WT:?}; sha=${SHA:-$(git -C "$src" rev-parse HEAD)} || exit 9
G=$W/wt-gate-${TAG:?}
: > "$S/${TAG}-run.log"
echo "gating $sha" >> "$S/${TAG}-run.log"
git -C "$R" worktree remove --force "$G" 2> /dev/null
git -C "$R" worktree add -q --detach "$G" "$sha" && cd "$G" && bun install --frozen-lockfile > /dev/null 2>&1 \
  || { echo "worktree failed" >> "$S/${TAG}-run.log"; exit 9; }
done_() { cd /; git -C "$R" worktree remove --force "$G"; exit "$1"; }
"$L/rebase-register.sh" >> "$S/${TAG}-run.log" 2>&1 || { echo "rebase exit $?" >> "$S/${TAG}-run.log"; done_ 1; }
"$L/reverts-guard.sh" >> "$S/${TAG}-run.log" 2>&1 || { echo "reverts guard exit $?" >> "$S/${TAG}-run.log"; done_ 1; }
for g in check:fast test:small; do
  "$L/../machine/heavy.sh" bun run $g > "$S/${TAG}-$g.log" 2>&1; r=$?
  # Once more on failure: under the machine's load a fast spec can time out (doc-links took 52 s at load 5.6);
  # a real failure fails twice.
  if [ $r -ne 0 ]; then echo "$g exit $r, retried" >> "$S/${TAG}-run.log"; mv "$S/${TAG}-$g.log" "$S/${TAG}-$g.first.log"
    "$L/../machine/heavy.sh" bun run $g > "$S/${TAG}-$g.log" 2>&1; r=$?; fi
  echo "$g exit $r" >> "$S/${TAG}-run.log"
  [ $r -ne 0 ] && done_ 1
done
# Main may have moved while the gates ran: rebased again with the register's resolver, so land.sh's own rebase meets
# nothing (and land.sh runs check:fast again when main moved).
"$L/rebase-register.sh" >> "$S/${TAG}-run.log" 2>&1 || { echo "rebase exit $?" >> "$S/${TAG}-run.log"; done_ 1; }
KYRIE_LAND_FF=$R scripts/landing/land.sh "$(git rev-parse HEAD)" > "$S/${TAG}-land.log" 2>&1; r=$?
echo "land exit $r" >> "$S/${TAG}-run.log"
done_ $r
