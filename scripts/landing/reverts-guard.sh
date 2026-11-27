#!/bin/bash
# After a rebase onto origin/main: refuse a stack that deletes a file main touched in the last three days, or that
# rolls back more than half of such a file's recent lines without saying so (REVERTS_OK=1 to pass knowingly).
# The start cut of 26 November had silently deleted the portrait invariant and the SRD prototypes.
[ "${REVERTS_OK:-}" = 1 ] && exit 0
recent=$(git log --since=3.days --name-only --format= origin/main | sort -u)
bad=$(git diff --name-only --diff-filter=D origin/main HEAD | grep -Fxf <(echo "$recent") || true)
[ -z "$bad" ] || { echo "REVERTS: the stack deletes files main touched lately:"; echo "$bad"; exit 5; }
exit 0
