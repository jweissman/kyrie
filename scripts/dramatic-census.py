#!/usr/bin/env python3
"""Structural census of the adventure corpus, for doc/history/activation/dramatic-assessment.md.

Read-only. Counts, by text, what each module's Kyr declares: rules keyed on the clock (and how many of those name no
party, so run whether or not the company is there), objectives, endings, topics (and how many are `once`, or change
nothing), hostile creatures and flips to hostile. Run: python3 scripts/dramatic-census.py [data-dir]
A rule is "autonomous" when its condition names the clock (watch/day/hour/dice/untilLight...) and does not mention
the party, the actor or `been(`. The counts are lexical: they say what is declared, not what a player meets.
"""
import glob, os, re, sys

ROOT = (sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(__file__), '..', 'data')).rstrip('/') + '/'
CLK = re.compile(r'\b(watch|day|hour|nightCount|untilLight|season|dice)\(|\b(first|second|third|fourth|fifth|sixth|seventh)Day\(|\bdark\(\)')
STARTS = r'(?:Rule|Event|Topic|Place|Person|Thing|Ending|Objective|Greets|Comes|Warns|Observe|Measure|Quest|Initially|Arrives|Action)'


def header(p):
    m = re.search(r'\{|\bsays\b', p)
    return p[:m.start()] if m else p[:300]


def stats(text):
    parts = re.split(r'\n(?=\s*' + STARTS + r'\b)', text)
    rules = [p for p in parts if p.strip().startswith('Rule ')]
    topics = [p for p in parts if p.strip().startswith('Topic ')]
    c = dict(rules=len(rules), clock=0, auto=0, auto_move=0, auto_count=0, auto_state=0, auto_say=0,
             topics=len(topics), once=0, effect=0)
    for p in rules:
        h = header(p)
        body = p[len(h):]
        if not CLK.search(h):
            continue
        c['clock'] += 1
        if re.search(r'\bparty\b|\bactor\b|been\(', h):
            continue
        c['auto'] += 1
        if re.search(r'(Assert|Retract) at\(|\bBring\b', body):
            c['auto_move'] += 1
        if re.search(r'\b(Increase|Decrease)\b', body):
            c['auto_count'] += 1
        if re.search(r'(Assert|Retract) (?!at\()', body):
            c['auto_state'] += 1
        if re.search(r'\bsays\b', p[:len(h) + 12]):
            c['auto_say'] += 1
    for p in topics:
        first = p.split('\n')[0]
        if re.search(r'\bonce\s*\{?\s*$', first):
            c['once'] += 1
        if 'On discuss' in p:
            c['effect'] += 1
    n = lambda pat: len(re.findall(pat, text, re.M))
    c.update(events=n(r'^\s*Event '), objectives=n(r'^\s*Objective '), endings=n(r'^\s*Ending '),
             temper=n(r'Temperament '), lair=n(r'^\s*Lair '), hostile=n(r'Assert (?:assails|hostile)\('),
             persons=n(r'^\s*Person '), places=n(r'^\s*Place '), signs=n(r'Observe .* as sign'),
             measures=n(r'^\s*Measure '), lines=text.count('\n'))
    return c


def module_text(d):
    return '\n'.join(open(f, errors='ignore').read() for f in sorted(glob.glob(d + '**/*.kyr', recursive=True)))


def main():
    rows = {}
    for kind, tag in (('adventures', ''), ('situations', 'S:'), ('goings-on', 'G:')):
        for d in sorted(glob.glob(ROOT + kind + '/*/')):
            rows[tag + os.path.basename(d.rstrip('/'))] = stats(module_text(d))
    keys = ['lines', 'rules', 'clock', 'auto', 'auto_move', 'auto_state', 'auto_count', 'objectives', 'endings', 'topics',
            'once', 'temper', 'hostile', 'signs']
    print('| module | ' + ' | '.join(keys) + ' |')
    print('|---|' + '---:|' * len(keys))
    tot = {k: 0 for k in keys}
    for n, r in rows.items():
        print('| ' + n + ' | ' + ' | '.join(str(r[k]) for k in keys) + ' |')
        if not n.startswith(('S:', 'G:')):
            for k in keys:
                tot[k] += r[k]
    print('| **adventures total** | ' + ' | '.join(str(tot[k]) for k in keys) + ' |')


main()
