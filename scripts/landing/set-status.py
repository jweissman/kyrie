#!/usr/bin/env python3
# Set rows' status cells in the register by id (row text, never a global replace).
# Usage: setstatus.py <register.md> <edits.json>   edits: {"ID": {"status": "...", "pri": "P1", "what_append": "..."}}
import json, sys
p, edits = sys.argv[1], json.load(open(sys.argv[2]))
L = open(p).read().split('\n')
header = None; done = set()
for i, l in enumerate(L):
    if not l.startswith('|'): header = None; continue
    cells = l.strip().strip('|').split('|')
    first = cells[0].strip()
    if first.lower() in ('id', 'review'):
        names = [c.strip().lower() for c in cells]
        header = names; continue
    if header is None or first not in edits: continue
    e = edits[first]
    n = len(header)
    si = next(k for k, c in enumerate(header) if c.startswith(('status', 'state')))
    pi = next((k for k, c in enumerate(header) if c.startswith(('pri', 'severity'))), None)
    body = l.rstrip()
    assert body.endswith(' |'), first
    parts = body[:-2].split(' | ')
    # count from the end: cells after status
    tail = n - si
    head, rest = parts[:len(parts) - tail], parts[len(parts) - tail:]
    if 'status' in e: rest[0] = e['status']
    if 'pri' in e and pi is not None: rest[pi - si] = e['pri']
    if 'what_append' in e: head[-1] = head[-1] + ' ' + e['what_append']
    L[i] = ' | '.join(head + rest) + ' |'
    assert first not in done, f'{first} twice'; done.add(first)
missing = set(edits) - done
assert not missing, missing
open(p, 'w').write('\n'.join(L))
print('set', len(done))
