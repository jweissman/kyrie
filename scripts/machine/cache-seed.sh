#!/bin/bash
# The caches a fresh worktree would otherwise build from nothing: tsc's incremental build info and Kyr's parse store
# (node_modules/.cache). A new worktree paid a cold typecheck and a world's every parse before its first check (the
# lead's measure of 27 November: typecheck 67 s cold, 12 s seeded). tsc's build info names files relative to itself
# and the parse store is keyed by content, so both carry. ESLint's does not: its cache is keyed by a hash of the
# resolved config, which holds the worktree's own root (typescript-eslint's tsconfigRootDir), so a copied cache is
# never valid and is not seeded. A seed that is stale costs only what changed since; a missing one, nothing.
#   scripts/machine/cache-seed.sh in <worktree>    seed a worktree's caches (worktree.sh and gate.sh do this)
#   scripts/machine/cache-seed.sh out <worktree>   keep a warm worktree's caches as the seed
# The seed is KYRIE_CACHE_SEED (default /var/tmp/kyrie/cache-seed). It never reads or writes the owner's checkout.
set -uo pipefail
mode=${1:?usage: cache-seed.sh in|out <worktree>}
W=$(cd "${2:?usage: cache-seed.sh in|out <worktree>}" && pwd)
S=${KYRIE_CACHE_SEED:-/var/tmp/kyrie/cache-seed}
C="$W/node_modules/.cache"
case "$mode" in
  out)
    test -d "$C/tsc" || { echo "cache-seed: $W has no warm caches" >&2; exit 1; }
    rm -rf "$S.new" && mkdir -p "$S.new" || exit 1
    cp -a "$C/tsc" "$S.new/tsc" 2> /dev/null
    test -d "$C/kyrie-parse" && cp -a "$C/kyrie-parse" "$S.new/kyrie-parse"
    echo "$W" > "$S.new/root"
    rm -rf "$S" && mv "$S.new" "$S" && echo "cache-seed: kept $W's caches as the seed"
    ;;
  in)
    test -f "$S/root" || exit 0
    test -d "$S/tsc" && { rm -rf "$C/tsc"; cp -a "$S/tsc" "$C/tsc"; }
    test -d "$S/kyrie-parse" && { rm -rf "$C/kyrie-parse"; cp -a "$S/kyrie-parse" "$C/kyrie-parse"; }
    ;;
  *) echo "usage: cache-seed.sh in|out <worktree>" >&2; exit 2 ;;
esac
exit 0
