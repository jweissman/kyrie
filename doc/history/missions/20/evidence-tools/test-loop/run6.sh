#!/bin/bash
# The quick set as six plain `bun test` processes over chunks balanced by kept time (test-loop.md §2a, item 1).
# Run from the repository's root: writes the chunks to $OUT (default /tmp/kyrie-chunks) and runs them together.
OUT=${OUT:-/tmp/kyrie-chunks}; mkdir -p "$OUT"; N=${N:-6}
python3 - "$OUT" "$N" <<'PY'
import json, glob, sys
out, n = sys.argv[1], int(sys.argv[2])
f = json.load(open('test/timings.json'))['files']
q = sorted((k for k in glob.glob('test/**/*.test.ts', recursive=True) if k in f and f[k] < 2000), key=lambda k: -f[k])
ch, tot = [[] for _ in range(n)], [0] * n
for k in q:
    i = tot.index(min(tot)); ch[i].append('./' + k); tot[i] += f[k]
for i, c in enumerate(ch): open(f'{out}/chunk{i}.txt', 'w').write('\n'.join(c))
PY
for i in $(seq 0 $((N - 1))); do bun test $(cat "$OUT/chunk$i.txt") > "$OUT/chunk$i.out" 2>&1 & done; wait
cat "$OUT"/chunk*.out | grep -E "^ *[0-9]+ (pass|fail)" | awk '{s[$2]+=$1} END {for (k in s) print k, s[k]}'
