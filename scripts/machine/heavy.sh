#!/bin/bash
# Run a heavy command (a suite, a world walk, the page build) without exhausting the machine. On the lead's WSL
# (19 GB, 8 GB swap) at most three run at once (three slots, 5 GB each), each under a memory ceiling, so a runaway run
# is killed (exit 137) instead of hanging WSL (25 November: twice). A waiting run takes whichever slot frees first.
# Where there is no lock directory or no systemd-run (a cloud builder, CI), the command simply runs: one builder alone
# on its machine needs no lock.
#   scripts/machine/heavy.sh bun run test:small
# KYRIE_HEAVY_MAX overrides the ceiling; KYRIE_HEAVY_LOCKS the lock directory (default /var/tmp/kyrie).
locks=${KYRIE_HEAVY_LOCKS:-/var/tmp/kyrie}
if [ ! -d "$locks" ] || ! command -v systemd-run > /dev/null || ! command -v flock > /dev/null; then exec "$@"; fi
while :; do
  for slot in 0 1 2; do
    exec 8>"$locks/heavy$([ $slot = 0 ] && echo "" || echo ".$slot").lock"
    flock -n 8 && break 2
    exec 8>&-
  done
  sleep 5
done
exec systemd-run --user --scope -q -p MemoryMax="${KYRIE_HEAVY_MAX:-5G}" -p MemorySwapMax=1G -- "$@"
