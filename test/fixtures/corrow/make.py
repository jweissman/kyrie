# Writes a fixture module per act: every source of the campaign but its company, and the act's own start.
import json, os, sys
here = os.path.dirname(os.path.abspath(__file__))
src = json.load(open(os.path.join(here, '../../../data/adventures/let-one-remember/module.json')))['source']
for act in sys.argv[1:]:
    d = os.path.join(here, act); os.makedirs(d, exist_ok=True)
    sources = ['../../../../data/adventures/let-one-remember/' + f for f in src if f != 'company.kyr'] + ['start.kyr']
    json.dump({'version': 1, 'source': sources, 'rules': ['world'], 'globals': ['party'], 'exports': {'party': 'party'}},
              open(os.path.join(d, 'module.json'), 'w'), indent=2)
