#!/usr/bin/env python3
"""Drives the playtest server (scripts/play-server.ts) by labels, as a player would: arrow keys to a choice, then Enter.

  python3 scripts/play-driver.py [--port 7359] step [step ...]

A step is one of:  goto:<query>   key:<keys>   pick:<label prefix>   shot:<name>   wait:<ms>   eval:<js>   text
Picking looks for a choice on show whose label starts with the prefix (case-insensitive), then whose label
contains it. A development aid only; nothing in the game depends on it.
"""
import json, sys, urllib.parse, urllib.request

args = sys.argv[1:]
port = '7359'
if args[:1] == ['--port']:
    port, args = args[1], args[2:]
base = f'http://127.0.0.1:{port}'


def get(path, **params):
    query = urllib.parse.urlencode(params)
    with urllib.request.urlopen(f'{base}{path}?{query}', timeout=120) as r:
        return r.read().decode()


def post(path, body):
    req = urllib.request.Request(f'{base}{path}', data=body.encode(), method='POST')
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read().decode()


def inspect():
    return json.loads(json.loads(post('/eval', 'JSON.stringify(window.kyrieMono.inspect())')))


def pick(label):
    state = inspect()
    choices = state.get('choices') or []
    low = label.lower()
    index = next((i for i, c in enumerate(choices) if c['label'].lower().startswith(low)), None)
    if index is None:
        index = next((i for i, c in enumerate(choices) if low in c['label'].lower()), None)
    if index is None:
        print(f'NO CHOICE "{label}" among: ' + ' | '.join(c['label'] for c in choices))
        return False
    current = next((i for i, c in enumerate(choices) if c['id'] == state.get('selected')), 0)
    delta = index - current
    keys = ['ArrowDown' if delta > 0 else 'ArrowUp'] * abs(delta) + ['Enter']
    get('/key', k=','.join(keys), wait='900')
    return True


for step in args:
    kind, _, value = step.partition(':')
    if kind == 'goto':
        get('/goto', q=value, wait='2500')
    elif kind == 'key':
        get('/key', k=value, wait='700')
    elif kind == 'pick':
        if not pick(value):
            break
    elif kind == 'shot':
        get('/x', shot=value, wait='300')
        print(f'shot {value}')
    elif kind == 'wait':
        get('/x', wait=value)
    elif kind == 'eval':
        print(post('/eval', value))
    elif kind == 'text':
        print(get('/x', wait='200'))
