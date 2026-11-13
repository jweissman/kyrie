# Regenerates ../index.md, ../gaps.md and ../briefs.md: one index over every findings register from Mission 16 on, the
# gap register of findings that never reached one (gaps.tsv) and the requirements traced from the briefs (briefs.tsv).
# It reads the registers as they are; it writes none of them. Run from anywhere:
#   python3 doc/architecture/findings/src/index.py
# The registers stay the record of each row (its evidence, its history); this index says where every id lives, what
# its last status is, what kind of thing it is, and whether what a Fixed row cites still exists.
import os, re, subprocess, sys
sys.dont_write_bytecode = True
from collections import Counter, OrderedDict
here = os.path.dirname(os.path.abspath(__file__))
root = os.path.abspath(os.path.join(here, '..', '..', '..', '..'))
arch = os.path.join(root, 'doc', 'architecture')
out_dir = os.path.join(here, '..')
sys.path.insert(0, os.path.join(arch, 'mission-19', 'inherited-src'))
from kinds import KIND  # noqa: E402  the audit's defect / obligation / recommendation / ambition

REGISTERS = OrderedDict([
    ('M16', 'mission-16/register.md'), ('M17', 'mission-17/register.md'), ('M18', 'mission-18/register.md'),
    ('M18 wishlist', 'mission-18/wishlist.md'), ('M19 inherited', 'mission-19/inherited.md'),
    ('M19', 'mission-19/register.md')])
ID = re.compile(r'^[A-Z][A-Z0-9]*-[A-Z]?[0-9]+[a-z]?$')
HEX = re.compile(r'\b[0-9a-f]{7,12}\b')
SPEC = re.compile(r'(?:test/)?([a-z0-9][a-z0-9-]+)\.test\.ts')

def parse(path):
    rows, header, sect = OrderedDict(), None, ''
    for line in open(path):
        line = line.rstrip('\n')
        if line.startswith('#'):
            sect, header = line.lstrip('# ').strip(), None
            continue
        if not line.startswith('|'):
            continue
        cells = [c.strip() for c in re.split(r'(?<!\\)\|', line)[1:-1]]
        if not cells:
            continue
        if cells[0] in ('ID', 'Id'):
            header = cells
            continue
        if header is None or not ID.match(cells[0]):
            continue
        col = next((header.index(n) for n in ('Now', 'Status', 'Disposition') if n in header), None)
        cell = cells[col] if col is not None and col < len(cells) else cells[-1]
        m = re.search(r'\*\*([A-Za-z][A-Za-z ]*?)\*\*', cell)
        st = m.group(1) if m else (cell.split()[0].strip('*;:,.') if cell.split() else '')
        st = 'Not reproduced' if st == 'Not' else st
        cls = cells[header.index('Class')] if 'Class' in header else ''
        fcol = next((header.index(n) for n in ('Finding', 'Requirement', 'Remedy') if n in header), 1)
        rows[cells[0]] = dict(status=st, section=sect, finding=cells[fcol] if fcol < len(cells) else '', line=line,
                              cls=cls)
    return rows

R = OrderedDict((k, parse(os.path.join(arch, p))) for k, p in REGISTERS.items())
TERMINAL = {'Fixed', 'Superseded', 'Not reproduced'}

# Rows the owner's working tree carried on 6 November and had not committed when this index was made (the seven
# Partial rows of Mission 18 its wishlist dropped, and Mission 19's rows from the experience pass). Each is listed until
# a register holds it; then the register's own row is read instead.
PENDING = [
    ('OWN-55', 'M19 inherited', 'Partial', 'U', 'The ordinary loop judged in play (carried from Mission 18; dropped from its wishlist)'),
    ('OWN-76', 'M19 inherited', 'Partial', 'U', 'Ordinary play to feel like a game (carried from Mission 18; dropped from its wishlist)'),
    ('OWN-77', 'M19 inherited', 'Partial', 'U', 'The town page (carried from Mission 18; dropped from its wishlist)'),
    ('OWN-78', 'M19 inherited', 'Partial', 'U', 'Depth past the first town (carried from Mission 18; dropped from its wishlist)'),
    ('OWN-79', 'M19 inherited', 'Partial', 'U', 'Every row given a first pass; what cannot yet be named is for independent players (carried from Mission 18)'),
    ('OWN-81', 'M19 inherited', 'Partial', 'U', 'Navigation between hexes and in towns (carried from Mission 18; dropped from its wishlist)'),
    ('NVR-23', 'M19 inherited', 'Superseded', 'U', 'The road page\'s browser spec (superseded by M19-50: the road page retired)'),
    ('M19-72', 'M19', 'Fixed', 'U', 'Underground and unlit places showed words where the painting goes'),
    ('M19-73', 'M19', 'Open', 'U', 'Go… lists every place of a town flat: no quarters, no geography a player can learn'),
    ('M19-74', 'M19', 'Fixed', 'U', 'New game took two clicks'),
    ('M19-75', 'M19', 'Open', 'A', 'Preset parties reachable by a player; the default company a trio; `kyrie new` scaffolds a trio; no fact tells companions from the one who plays'),
    ('M19-76', 'M19', 'Partial', 'C', 'The bestiary imported, not operational (measured danger, composed parties: landing on main)'),
    ('M19-77', 'M19', 'Open', 'R', 'No two adventures can contribute to one persistent city'),
    ('M19-78', 'M19', 'Open', 'U', 'The fight reads as a ledger'),
    ('M19-79', 'M19', 'Open', 'U', 'A new life is dropped into its first town: the way in told, never played'),
]

AUTHOR = {'BOF', 'QTC', 'WPC', 'GTR', 'CTH', 'LOR', 'TTN', 'LWR', 'FWR', 'BTW', 'QIS', 'AUT', 'IFR', 'HTH', 'GOS',
          'ICE', 'LUL', 'HSL'}
OVERRIDE = {'OWN-42': 'aesthetic/UX problem', 'OWN-44': 'aesthetic/UX problem', 'PRE-05': 'aesthetic/UX problem',
            'OWN-41': 'foundational architecture obligation', 'NAR-01': 'gameplay requirement',
            'M19-15': 'gameplay requirement', 'PD-08': 'foundational architecture obligation',
            'M19-69': 'foundational architecture obligation', 'M19-49': 'foundational architecture obligation',
            'PD-14': 'gameplay requirement', 'M19-75': 'defect', 'M19-77': 'foundational architecture obligation'}

def category(i, cls):
    """The owner's six kinds (6 November), by rule from the register's class and the audit's kind; OVERRIDE wins."""
    if i in OVERRIDE:
        return OVERRIDE[i]
    kind = KIND.get(i, ('', ''))[0]
    prefix = re.sub(r'-.*', '', i)
    # Class D (a larger ambition) is the register's scope, not what the row is (the process audit, §3): a D row the
    # audit calls a defect or an obligation is sorted as one; only an ambition, or a D row of no kind, is a wish.
    if kind == 'ambition' or (cls == 'D' and kind not in ('defect', 'obligation', 'recommendation')):
        return 'creative aspiration'
    if prefix in AUTHOR:
        return 'authorability blocker'
    if cls == 'R':
        return 'foundational architecture obligation'
    if cls == 'A':
        return 'defect'
    if prefix in ('PRE', 'PD') or cls == 'P':
        return 'aesthetic/UX problem'
    if cls == 'C':
        return 'authorability blocker' if kind != 'obligation' else 'gameplay requirement'
    if kind == 'defect':
        return 'defect'
    return 'gameplay requirement'

def tsv(name):
    lines = [l.rstrip('\n').split('\t') for l in open(os.path.join(here, name)) if l.strip()]
    return [dict(zip(lines[0], l)) for l in lines[1:]]

GAPS, BRIEFS = tsv('gaps.tsv'), tsv('briefs.tsv')

def commits_missing(hashes):
    if not hashes:
        return set()
    p = subprocess.run(['git', '-C', root, 'cat-file', '--batch-check'], input='\n'.join(sorted(hashes)) + '\n',
                       capture_output=True, text=True)
    return {l.split()[0] for l in p.stdout.splitlines() if l.endswith('missing') or 'ambiguous' in l}

specs = {f[:-8] for f in os.listdir(os.path.join(root, 'test')) if f.endswith('.test.ts')}
allhex = {h for rows in R.values() for r in rows.values() if r['status'] == 'Fixed' for h in HEX.findall(r['line'])}
missing = commits_missing(allhex)

def esc(s):
    return s.replace('|', '\\|')

def link(reg):
    return f'[{reg}](../{REGISTERS[reg]})'

# 1. Where every id lives now: the last register that holds it, and its status there.
last = OrderedDict()
for reg, rows in R.items():
    for i, r in rows.items():
        last[i] = (reg, r)
pending_new = [p for p in PENDING if p[0] not in R[p[1]]]
out = ['# Findings: the index', '',
       '*Generated by [src/index.py](src/index.py) from the registers as committed; do not edit by hand. Made 6 November',
       '2026 on `fbf38d58` for the documentation reconciliation ([../../reconciliation-2026-11.md](../../reconciliation-2026-11.md)).*', '',
       'Westernesse keeps its findings in one register per mission, each row under a stable id with its source and its',
       'history; an open row is carried forward, under the same id, into the next mission\'s register. This page is the',
       'single index over them: where each id lives now, its last status, what kind of thing it is, and whether what a',
       '**Fixed** row cites still exists. It adds no new master list: rows are changed in their own register (Mission 19\'s',
       'inherited ledger by its sources in [../mission-19/inherited-src](../mission-19/inherited-src), regenerated, never by',
       'hand), and findings that never reached any register are in [gaps.md](gaps.md), requirements of the briefs in',
       '[briefs.md](briefs.md). It supersedes nothing: Mission 16\'s [reconciliation](../mission-16/reconciliation.md), the',
       'registers\' own accounting tables and the [process audit](../m18-m19-process-audit.md) (an owner file, not in the',
       'repository at `fbf38d58`) remain the records they were.', '',
       '**A status here is a claim.** Fixed means the builder implemented and checked it (a commit, a spec, a scripted or',
       'builder play). No row from Mission 16 on has been accepted by the owner or an independent player through the',
       'page since the repairs; that acceptance is PD-14 (open).', '',
       '## 1. The registers and how they carry', '',
       '| Register | Rows | Statuses at its close (or now) |', '|---|---|---|']
for reg, rows in R.items():
    c = Counter(r['status'] for r in rows.values())
    held = sum(n for s, n in c.items() if s not in ('Fixed', 'Partial', 'Open', 'Open risk', 'Deferred', 'Superseded',
                                                    'Not reproduced', 'Wishlist'))
    parts = [f'{s} {n}' for s, n in c.most_common() if s in ('Fixed', 'Partial', 'Open', 'Open risk', 'Deferred',
                                                              'Superseded', 'Not reproduced', 'Wishlist')]
    if held:
        parts.append(f'held elsewhere {held}')
    out.append(f'| {link(reg)} | {len(rows)} | {", ".join(parts)} |')
out += ['', 'Held elsewhere: Mission 18\'s Grand Tour and Wapshott\'s Circus tables, whose rows name the row or commit',
        'that holds them instead of a status (the register\'s own table counts 25 held and 12 not reproduced: one held',
        'row\'s cell begins with the words, and is read here as one).', '']

def chain(a, b_regs, open_states):
    src = {i for i, r in R[a].items() if r['status'] in open_states}
    dst = set().union(*(set(R[b]) for b in b_regs))
    return src, sorted(src - dst)
checks = [('M16', ['M17'], {'Open', 'Partial'}), ('M17', ['M18', 'M18 wishlist'], {'Open', 'Partial', 'Not reproduced'}),
          ('M18 wishlist', ['M19 inherited'], {'Wishlist'}), ('M18', ['M19 inherited'], {'Partial'})]
out += ['**Carried forward, checked id by id:**', '', '| From | Rows to carry | Into | Not carried |', '|---|---|---|---|']
for a, bs, st in checks:
    src, lost = chain(a, bs, st)
    pend = [i for i in lost if i in {p[0] for p in PENDING}]
    note = ', '.join(lost) if lost else 'none'
    if pend and len(pend) == len(lost):
        note += ' (carried in the owner\'s working tree, 6 November, not yet committed)'
    out.append(f'| {a} ({"/".join(sorted(st))}) | {len(src)} | {", ".join(bs)} | {note} |')
dropped16 = [(i, r['status']) for i, r in R['M16'].items() if r['status'] in ('Deferred',)]
out += ['', 'Mission 16\'s two **Deferred** rows were not carried by Mission 17, which carried only Open and Partial:',
        ', '.join(f'{i} ({esc(R["M16"][i]["finding"])})' for i, _ in dropped16) + '. The Mission 18 audit named them',
        '(SLIP-02) and NAR-11\'s retrial (SLIP-03); neither was given a row (gap UNT-119).', '',
        '**136, 138 and 145.** Mission 18 carried 138 ids in its wishlist. Mission 19\'s first settlement (4 November)',
        'listed 136, omitting M17-73 and M17-99; the process audit found it, and both were restored (the generator adds',
        'them, M19-43). On 6 November the owner\'s review of Mission 18\'s obligations found seven Partial rows its',
        'register kept but its wishlist never carried (OWN-55, OWN-76 to OWN-79, OWN-81, NVR-23): with them the ledger has',
        ('145 rows, committed.' if not pending_new else '145 rows. That change is in the owner\'s working tree (triage.json, done.tsv, closures.md) and not'),
        ('' if not pending_new else 'committed at `fbf38d58`; this index lists the seven in §3 as pending until it is.') + ' M17-73 is Partial and M17-99 Fixed in the',
        'ledger, each re-examined on 4 November.', '',
        '**The committed ledger is not reproducible from its sources.** At `fbf38d58`, `inherited.md` holds a paragraph and',
        'a table of closure kinds that `inherited.py` does not write: regenerating it from the committed sources drops',
        'them. The owner\'s uncommitted change moves the table into `closures.md`, read by the generator, which cures this.', '']

# 2. What Fixed cites, and whether it still exists.
out += ['## 2. What a Fixed row cites', '',
        'Every **Fixed** row\'s cell was searched for commit hashes and spec names; each hash was looked up in this',
        'repository and each spec in `test/`. That a commit exists and its spec is still there is the cheapest check of a',
        'claim; it is not a re-proof (that a spec still passes was checked only for the few named in the reconciliation',
        'report).', '', '| Register | Fixed | Commit and spec | Commit only | Spec only | Neither (prose evidence) | Cited commit not found | Cited spec not found |',
        '|---|---|---|---|---|---|---|---|']
for reg, rows in R.items():
    fx = [(i, r) for i, r in rows.items() if r['status'] == 'Fixed']
    if not fx:
        continue
    c = Counter(); badc, bads = [], []
    for i, r in fx:
        hs, sp = HEX.findall(r['line']), set(SPEC.findall(r['line']))
        c['both' if hs and sp else 'commit' if hs else 'spec' if sp else 'none'] += 1
        badc += [f'{i} `{h}`' for h in hs if h in missing]
        bads += [f'{i} `{s}`' for s in sp if s not in specs]
    out.append(f'| {link(reg)} | {len(fx)} | {c["both"]} | {c["commit"]} | {c["spec"]} | {c["none"]} | '
               f'{", ".join(badc) or "none"} | {", ".join(bads) or "none"} |')
out += ['', 'A Fixed row citing neither is not therefore false: most of these cite a guide section, a play, or the row',
        'that answered it. They are the rows least able to be re-checked, and the first to re-examine when their area',
        'changes. (A hash-like word that is not a commit, such as a measured number, shows as "not found".)', '']

# 3. Everything not closed, by the owner's six kinds.
openrows = []
for i, (reg, r) in last.items():
    if r['status'] in TERMINAL or r['status'] not in ('Partial', 'Open', 'Open risk', 'Deferred', 'Wishlist'):
        continue
    if reg == 'M18 wishlist':
        continue  # every wishlist row is in the inherited ledger, read from there
    openrows.append((i, reg, r['status'], r['cls'], r['finding']))
for i, reg, st, cls, f in pending_new:
    if st not in TERMINAL:
        openrows.append((i, reg + ' (pending)', st, cls, f))
for g in GAPS:
    openrows.append((g['id'], 'gaps', g['proposed'] + ' (unregistered)', '', g['finding']))
KINDS = ['defect', 'foundational architecture obligation', 'gameplay requirement', 'authorability blocker',
         'aesthetic/UX problem', 'creative aspiration']
by = OrderedDict((k, []) for k in KINDS)
for i, reg, st, cls, f in openrows:
    cat = next((g['category'] for g in GAPS if g['id'] == i), None) or category(i, cls)
    by[cat].append((i, reg, st, f))
out += ['## 3. What is not closed, by kind', '',
        'Every id whose last status is not Fixed, Superseded or Not reproduced, in its newest register, with the gap',
        'register\'s rows beside them, sorted into the owner\'s six kinds (6 November): a **defect** is something wrong;',
        'a **foundational architecture obligation** a structural commitment the rest depends on; a **gameplay',
        'requirement** something play must do that it does not yet; an **authorability blocker** something an author',
        'cannot do, or can do only by a workaround; an **aesthetic/UX problem** how it looks or reads; a **creative',
        'aspiration** a wish, not an obligation. The kind is assigned by rule from the register\'s class and the audit\'s',
        'kind (`category()` in the generator, with its overrides); a row\'s own register is the authority for what it is.',
        '**Deferred** in the inherited ledger means an ambition or a recommendation; an unresolved defect or obligation',
        'there is **Open risk**.', '',
        '| Kind | Rows | Of which unregistered until now |', '|---|---|---|']
for k, v in by.items():
    out.append(f'| {k} | {len(v)} | {sum(1 for x in v if x[1] == "gaps")} |')
out.append(f'| **all** | **{sum(len(v) for v in by.values())}** | **{len(GAPS)}** |')
for k, v in by.items():
    out += ['', f'### {k[0].upper() + k[1:]} ({len(v)})', '', '| ID | Where | Status | Finding |', '|---|---|---|---|']
    for i, reg, st, f in sorted(v, key=lambda x: (x[1] == 'gaps', x[0])):
        where = '[gaps](gaps.md)' if reg == 'gaps' else (reg if '(pending)' in reg else link(reg))
        out.append(f'| {i} | {where} | {st} | {esc(f[:180])}{"…" if len(f) > 180 else ""} |')
out += ['', '## 4. Parents and children', '',
        'The process audit (4 November, §3 "Duplicates and merges") named findings that describe one concern at different',
        'layers. They stay separate rows; a parent\'s fix closes a child only when the child\'s own symptom is checked.', '',
        '| Concern | Rows |', '|---|---|',
        '| Perception and knowledge kept apart from truth | ARV-H5, COR-12, IFR-06, NAR-12, PD-08, UNT-113, UNT-123 |',
        '| Repeated prose and repeated structures | PT-15, SYS-08 |',
        '| Sparse causal wilderness travel | REV-03, IND-03, SYS-07, OWN-27, OWN-80 |',
        '| The novice danger covenant | PT-11, SYS-05, IND-04, UNT-124 |',
        '| Decision framing and contextual acts | REV-05, SYS-01, IND-04, IND-06, PD-05, PD-07, UNT-104 |',
        '| Economy and reward destinations | REV-11, REV-13, REV-24, SYS-04, UNT-116, UNT-234 |',
        '| The public authoring and generation boundary | ARV-H4, AUT-25, ARV-M3, ARV-M4, ARV-M6, SYS-06, UNT-120, UNT-128 |',
        '| Situations, conversation, initiative and aftermath | IFR-04, FWR-08, BOF-24, IND-06, UNT-222, UNT-236 |',
        '| The company: who plays, who travels with them | ARV-M7, NAR-18, M19-75, UNT-208, UNT-230 |',
        '| One persistent city that adventures share | M19-77, BRF-54, BRF-107, NAV-10 |',
        '| Gate carry-overs said to have rows that do not | UNT-122 (BRF-56 to BRF-59, BRF-61 to BRF-63), BRF-43 |', '']
open(os.path.join(out_dir, 'index.md'), 'w').write('\n'.join(out) + '\n')

# The gap register.
g = ['# Findings that never reached a register', '',
     '*Generated by [src/index.py](src/index.py) from [src/gaps.tsv](src/gaps.tsv); change the TSV and regenerate.*', '',
     'The documentation reconciliation of 6 November 2026 swept the playtests, reviews, audits and every adventure\'s',
     'friction report from 25 October on, and asked of each substantive finding whether any register holds it. These are',
     'the ones none does, or whose row lost a distinct concern. Ids are new and stable (UNT-1xx from plays and reviews,',
     'UNT-2xx from authors\' friction); nothing here is a disposition, only a proposal: **Open risk** (a defect or',
     'obligation, to be reproduced on the current build and fixed or narrowed), **Verify** (later code suggests it may',
     'be answered; confirm first), **Wishlist** (an aspiration). Each wants a row in the register of the mission that',
     'takes it up (Mission 19\'s inherited ledger, by its sources), under this id.', '',
     '**Assessment**: *unregistered* (no row anywhere), *dropped-between-missions* (named, or claimed carried, and not',
     'carried), *narrowed-lost* (a row exists but closed a narrower symptom and the rest went with it), *misclassified* (a',
     'row exists under the wrong kind, so it was deferred as a wish), *unverified-closure* (Fixed claims an audit',
     'contested, never revisited).', '',
     'Not swept item by item: the playtests of 19 to 24 October (the cold and product reviews of Caught Below, the',
     'March, Silkholme, Rededge, the High Country, the Long Man, Missions 9 to 12), each answered by its own mission\'s',
     'report and overtaken by four rebuilds of the interface since; the adventures\' literary critiques beyond their',
     'engine points.', '']
c = Counter((x['category']) for x in GAPS); a = Counter(x['assessment'] for x in GAPS); p = Counter(x['proposed'] for x in GAPS)
g += [f'**{len(GAPS)} rows.** By kind: ' + ', '.join(f'{k} {n}' for k, n in c.most_common()) + '. By assessment: ' +
      ', '.join(f'{k} {n}' for k, n in a.most_common()) + '. Proposed: ' + ', '.join(f'{k} {n}' for k, n in p.most_common()) + '.', '',
      '| ID | Kind | Assessment | Proposed | Finding | Source | Nearest rows | Note |', '|---|---|---|---|---|---|---|---|']
for x in GAPS:
    g.append('| ' + ' | '.join(esc(x[k]) for k in ('id', 'category', 'assessment', 'proposed', 'finding', 'source',
                                                    'nearest', 'note')) + ' |')
open(os.path.join(out_dir, 'gaps.md'), 'w').write('\n'.join(g) + '\n')

b = ['# What the briefs asked, and what became of it', '',
     '*Generated by [src/index.py](src/index.py) from [src/briefs.tsv](src/briefs.tsv).*', '',
     'The significant requirements of each mission\'s commission, read from the briefs themselves where the repository',
     'has them (Mission 13\'s and 16\'s plans, Mission 18\'s and 19\'s briefs, the October product specification and',
     'roadmap, the creative vision). **The commissions of Missions 15, 16 and 17 are not in the repository**: their rows',
     'cite the builder\'s memory summaries of them and say so; that the briefs themselves are missing is a gap of its',
     'own. Mission 18\'s gates A to F are reconciled in the owner\'s process audit; only what it lacks is here.', '',
     '**Status**: *implemented*; *superficial* (built, but short of what was asked); *superseded* (a later deliberate',
     'decision replaced it, named in the evidence); *deferred* (recorded as left, with or without a decision);',
     '*disappeared* (no later register row, report or directive mentions it); *unverified* (cannot be told from the',
     'record without a play that has not been made). "Same as" names the gap row that carries a disappeared one.', '']
c = Counter(x['status'] for x in BRIEFS)
b += [f'**{len(BRIEFS)} requirements**: ' + ', '.join(f'{k} {n}' for k, n in c.most_common()) + '.', '',
      '| ID | Status | Kind | Requirement | Brief | Evidence | Same as |', '|---|---|---|---|---|---|---|']
for x in BRIEFS:
    b.append('| ' + ' | '.join(esc(x[k]) for k in ('id', 'status', 'category', 'requirement', 'brief', 'evidence',
                                                    'same-as')) + ' |')
open(os.path.join(out_dir, 'briefs.md'), 'w').write('\n'.join(b) + '\n')
print('index:', {k: len(v) for k, v in by.items()}, 'gaps', len(GAPS), 'briefs', len(BRIEFS))
