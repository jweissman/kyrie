#!/usr/bin/env python3
# Resolve a rebase's conflicts in the register's files, three-way by row id against the merge base: a row takes the
# side that changed it from the base (both changed: the commit being applied); rows only one side has are kept.
#   open-register.md: by table row; register-kinds.json: semantically (written as json.dumps indent 1, its own form);
#   features.json: its conflicted "ID": "feature" pairs. Exit 2 if any file is left unresolved.
import json, re, subprocess, sys
def stage(n, p):
    r = subprocess.run(['git', 'show', f':{n}:{p}'], capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else ''
def pick(k, base, ours, theirs):
    if k in theirs and theirs.get(k) != base.get(k): return theirs[k]
    return ours.get(k, theirs.get(k))
def merge3(base, ours, theirs):
    if not all(isinstance(x, dict) for x in (ours, theirs)): return theirs if theirs != base else ours
    base = base if isinstance(base, dict) else {}
    out = {}
    for k in list(ours) + [k for k in theirs if k not in ours]:
        if k in ours and k in theirs: out[k] = merge3(base.get(k), ours[k], theirs[k])
        elif k in theirs: out[k] = theirs[k] if k not in base or theirs[k] != base[k] else None
        else: out[k] = ours[k] if k not in base or ours[k] != base[k] else None
        if out[k] is None and k not in (ours if k in ours else theirs): del out[k]
    # a key one side deleted and the other left as the base: deleted
    for k in list(out):
        if k in base and ((k not in ours and theirs.get(k) == base[k]) or (k not in theirs and ours.get(k) == base[k])): del out[k]
    return out
HUNK = re.compile(r'<<<<<<< [^\n]*\n(.*?)=======\n(.*?)>>>>>>> [^\n]*\n', re.S)
ROW = lambda l: (re.match(r'\s*\|\s*([A-Z]+-\d+)\s*\|', l) or [None, l])[1]
PAIR = re.compile(r'"([A-Z]+-\d+)"\s*:\s*"([^"]*)"')
bad = 0
for p in sys.argv[1:]:
    if p.endswith('test/timings.json'):
        # Each spec's kept time: the union, the commit being applied winning where both changed (indent 2, its form).
        try:
            m = merge3(json.loads(stage(1, p) or '{}'), json.loads(stage(2, p)), json.loads(stage(3, p)))
            open(p, 'w').write(json.dumps(m, indent=2) + '\n'); continue
        except Exception as e: print(f'unresolved {p}: {e}'); bad = 1; continue
    if p.endswith('register-kinds.json'):
        try:
            m = merge3(json.loads(stage(1, p) or '{}'), json.loads(stage(2, p)), json.loads(stage(3, p)))
            open(p, 'w').write(json.dumps(m, indent=1, ensure_ascii=False) + '\n'); continue
        except Exception as e: print(f'unresolved {p}: {e}'); bad = 1; continue
    s = open(p).read()
    if p.endswith('.md'):
        base = {ROW(l): l for l in stage(1, p).split('\n') if l}
        def res(m):
            o = [l for l in m.group(1).split('\n') if l]; t = [l for l in m.group(2).split('\n') if l]
            od = {ROW(l): l for l in o}; td = {ROW(l): l for l in t}
            gone = lambda k: k in base and ((k not in od and td.get(k) == base[k]) or (k not in td and od.get(k) == base[k]))
            out = [pick(ROW(l), base, od, td) for l in o if not gone(ROW(l))] + [l for l in t if ROW(l) not in od and not gone(ROW(l))]
            return '\n'.join(out) + '\n'
    else:
        base = dict(PAIR.findall(stage(1, p)))
        def res(m):
            od = dict(PAIR.findall(m.group(1))); td = dict(PAIR.findall(m.group(2)))
            ks = list(od) + [k for k in td if k not in od]
            # deleted on one side and left as the base on the other: deleted
            ks = [k for k in ks if not (k in base and ((k not in od and td.get(k) == base[k]) or (k not in td and od.get(k) == base[k])))]
            # Lines that hold no row's pair (the pins' placements: "conflict/parley": "fight", …) kept from both sides,
            # verbatim, ours first: they had been dropped, and every pin placed on either side with them (27 November).
            other = [l for l in m.group(1).split('\n') + m.group(2).split('\n') if l.strip() and not PAIR.search(l)]
            kept = list(dict.fromkeys(l if l.rstrip().endswith(',') else l.rstrip() + ',' for l in other))
            return ''.join(l + '\n' for l in kept) + ''.join(f'  "{k}": "{pick(k, base, od, td)}",\n' for k in ks)
    s = HUNK.sub(res, s)
    if p.endswith('.json'):
        # A hunk's pairs are written each with its comma: where the hunk closed an object, drop the last.
        s = re.sub(r',(\s*\n\s*[}\]])', r'\1', s)
        try: json.loads(s)
        except Exception as e: print(f'unresolved {p}: {e}'); bad = 1; continue
    open(p, 'w').write(s)
sys.exit(2 if bad else 0)
