# Regenerates ../inherited.md from triage.json (the 136 rows as first classed), done.tsv (each row's disposition as
# re-examined), kinds.py (defect, obligation, recommendation, ambition; root-cause cluster) and reasons.py (why a row
# waits). Run: python3 doc/architecture/mission-19/inherited-src/inherited.py
import json, sys, re, os
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
from reasons import REASONS
from kinds import KIND, TRIGGER
t = json.load(open(os.path.join(here, 'triage.json')))
# The two rows the settlement of 4 November dropped (the process audit): restored.
t += [['M17-73', 'U', 'An inn bed taken in the morning slept until evening; a ranger with "Set Spear", a deer of three hit points, and no specialty', ''],
      ['M17-99', 'C', 'Sites named in twelve words, with two asks each at the inn: "the north-western cave in the hillside in the heart of Rhawtaur"', '']]
done = {}
for l in open(os.path.join(here, 'done.tsv')):
    i, _, d = l.rstrip('\n').partition('\t'); done[i] = d
classes = {'A': 'Correctness or action integrity', 'U': 'UX or gameplay', 'C': 'Content or authoring',
           'R': 'Architecture', 'D': 'Deferred beyond Mission 19'}
def reason(i):
    if i in REASONS: return REASONS[i]
    p = i.split('-')[0]
    return REASONS.get(p, 'Deferred beyond Mission 19.')
rows = []
for i, c, f, disp in t:
    if i in done:
        d = done[i]; raw = d.split()[0]; word = raw.rstrip(':'); rest = d[len(raw):].strip()
        status = {'Fixed': 'Fixed', 'Partial': 'Partial', 'Not': 'Not reproduced', 'Superseded': 'Superseded', 'Deferred': 'Deferred'}.get(word, word)
        if word == 'Not': rest = rest.split(' ', 1)[1] if rest.startswith('reproduced') else rest
        cell = f'**{status}** {rest}'.strip()
        cls = c if c != 'D' else 'D'
    else:
        cls = c if c in 'ARUC' else 'D'
        cell = f'**Deferred** {reason(i)}'
    f = f.replace('|', '\\|')
    kind, cluster = KIND.get(i, ('defect', ''))
    if cell.startswith('**Deferred**') and kind in ('defect', 'obligation'):
        cell = '**Open risk**' + cell[len('**Deferred**'):] + ' ' + TRIGGER[kind]
    elif cell.startswith('**Deferred**') and TRIGGER[kind]:
        cell = cell + ' ' + TRIGGER[kind]
    rows.append((i, cls, kind, cluster or '', f, cell))
from collections import Counter
counts = Counter(r[5].split('**')[1] for r in rows)
out = ['# Mission 18\'s wishlist, reconciled', '',
 'Every row Mission 18 carried to Mission 19 ([../mission-18/wishlist.md](../mission-18/wishlist.md)): 138 ids, two of',
 'which (M17-73, M17-99) the first settlement of 4 November dropped and the process audit',
 '([../m18-m19-process-audit.md](../m18-m19-process-audit.md)) restored. Each is classed as the brief\'s §XIII asks',
 '(**A** correctness or action integrity, **U** UX or gameplay, **C** content or authoring, **R** architecture, **D** a',
 'larger ambition), said to be a **defect**, an **obligation** (commissioned or asked by the owner), a reviewer\'s',
 '**recommendation**, or an **ambition**, and tied to the audit\'s root-cause cluster where one fits (**A** legal state',
 'taken for a decision, **B** identity inferred from words, **C** pipelines that do not compose, **D** tests that prove',
 'components, **E** the reference journey overfitted, **F** workarounds counted as authorability).', '',
 'Dispositions: **Fixed** (implemented, with the commit and a spec: builder evidence, not acceptance), **Partial** (what',
 'was done and what remains), **Not reproduced** (on what build and route), **Open risk** (a defect or obligation not',
 'yet resolved: open, with its re-entry), **Deferred** (an ambition or recommendation only, with why). A parent\'s fix',
 'does not close a child: each row is closed only when its own symptom is checked. Mission 19\'s own findings are in',
 '[register.md](register.md); the evidence for what was played is in [evidence.md](evidence.md).', '',
 f'**{len(rows)} rows**: ' + ', '.join(f'{k} {v}' for k, v in sorted(counts.items(), key=lambda kv: -kv[1])) + '.', '',
 '| ID | Class | Kind | Cluster | Finding | Disposition |', '|---|---|---|---|---|---|']
for i, c, k, cl, f, cell in rows:
    out.append(f'| {i} | {c} | {k} | {cl} | {f} | {cell} |')
open(os.path.join(here, '..', 'inherited.md'), 'w').write('\n'.join(out) + '\n')
print(counts)
