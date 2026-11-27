#!/usr/bin/env python3
# The feature map's tree (doc/architecture/feature-map.json) merged from two sides, for a rebase or a stack: it is
# hand-kept (each capability's pins and words, placed by the builder who wrote them), never generated, so taking one
# side whole drops the other's placements (27 November: fights foretold, words before blows and the parley lost).
# Each capability, matched by its id, takes the union of both sides' pins and words, ours first; a capability or a
# section only one side has is kept where it stands. The markdown (feature-map.md) is written again from it after.
#   python3 scripts/landing/feature-map-merge.py <ours.json> <theirs.json> [<out.json>]
# With no files named, it merges a conflicted feature-map.json from the index's stages 2 and 3.
import json, subprocess, sys

PATH = 'doc/architecture/feature-map.json'
LISTS = ('pins', 'words')

def stage(n):
    return json.loads(subprocess.check_output(['git', 'show', f':{n}:{PATH}']))

def merge_capability(ours, theirs):
    out = dict(ours)
    for key in LISTS:
        merged = list(ours.get(key, []))
        merged += [x for x in theirs.get(key, []) if x not in merged]
        if merged:
            out[key] = merged
    return out

def merge_items(ours, theirs, key, merge):
    by_key = {x[key]: x for x in theirs}
    out = [merge(x, by_key[x[key]]) if x[key] in by_key else x for x in ours]
    seen = {x[key] for x in ours}
    return out + [x for x in theirs if x[key] not in seen]

def merge_section(ours, theirs):
    out = dict(ours)
    out['capabilities'] = merge_items(ours.get('capabilities', []), theirs.get('capabilities', []), 'id',
                                      merge_capability)
    return out

def merge_aspect(ours, theirs):
    out = dict(ours)
    out['sections'] = merge_items(ours.get('sections', []), theirs.get('sections', []), 'name', merge_section)
    return out

def merge(ours, theirs):
    out = dict(ours)
    out['aspects'] = merge_items(ours.get('aspects', []), theirs.get('aspects', []), 'n', merge_aspect)
    return out

if __name__ == '__main__':
    if len(sys.argv) >= 3:
        ours, theirs = (json.load(open(p)) for p in sys.argv[1:3])
        target = sys.argv[3] if len(sys.argv) > 3 else PATH
    else:
        ours, theirs, target = stage(2), stage(3), PATH
    open(target, 'w').write(json.dumps(merge(ours, theirs), indent=1, ensure_ascii=False) + '\n')
    if len(sys.argv) < 3:
        subprocess.run(['git', 'add', PATH])
