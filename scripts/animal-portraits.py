#!/usr/bin/env python3
"""Cuts the portraits of animals and monsters out of the matrices in assets/animals and assets/monsters (see
data/paintings/animals.json and monsters.json).

  python3 scripts/animal-portraits.py [animals|monsters]

Each sheet is three by three paintings in gold frames, a kind to a cell in the order the manifest gives. A cell's
opening is found by its frame as the portraits of player characters are (scripts/pc-portraits.py); the whole opening
is kept, a square inset from it clear of the frame's corners, for an animal is its shape (a bat's wings, a centipede's
length), not a face. Each is written small, for a card, and large, for a page, as WebP under web/reader/paintings;
its box is written back to the manifest. Needs Pillow. A development aid only: the game reads the copies and the
manifest, never the sheets.
"""
import importlib.util, json, os, sys
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SET = sys.argv[1] if len(sys.argv) > 1 else 'animals'
MANIFEST = os.path.join(ROOT, f'data/paintings/{SET}.json')
OUT = os.path.join(ROOT, 'web/reader')
spec = importlib.util.spec_from_file_location('pc', os.path.join(ROOT, 'scripts/pc-portraits.py'))
pc = importlib.util.module_from_spec(spec); spec.loader.exec_module(pc)
# How far in from the opening's edge the square sits (clear of the frame's rounded or arched corners), as a part of
# the opening's shorter side; and the sizes written.
INSET = 0.075
SIZES = {'file': 320, 'large': 640}
# A sheet whose openings are arched at the top (the first): further in, and the square kept to the bottom of it.
ARCHED = {'menagerie i.png': 0.09}


def main():
    manifest = json.load(open(MANIFEST))
    sheets = {}
    for p in manifest['portraits']:
        if p['source'] not in sheets:
            image = Image.open(os.path.join(ROOT, 'assets', SET, p['source'])).convert('RGB')
            sheets[p['source']] = (image, pc.openings(image.load(), *image.size))
        image, cells = sheets[p['source']]
        x0, y0, x1, y1 = cells[tuple(p['cell'])]
        side, inset = min(x1 - x0, y1 - y0), ARCHED.get(p['source'], INSET)
        s = int(side * (1 - 2 * inset))
        a = int(x0 + (x1 - x0 - s) / 2)
        b = int(y0 + (y1 - y0 - s) * (0.8 if p['source'] in ARCHED else 0.5))
        p['crop'] = [a, b, a + s, b + s]
        cut = image.crop(tuple(p['crop']))
        for key, size in SIZES.items():
            path = os.path.join(OUT, p[key])
            os.makedirs(os.path.dirname(path), exist_ok=True)
            cut.resize((size, size), Image.LANCZOS).save(path, 'WEBP', quality=82, method=6)
    lines = ',\n'.join(' ' + json.dumps(p) for p in manifest['portraits'])
    with open(MANIFEST, 'w') as f:
        f.write(f'{{\n "about": {json.dumps(manifest["about"])},\n "portraits": [\n{lines}\n ]\n}}\n')
    print(f'Cut {len(manifest["portraits"])} portraits')


if __name__ == '__main__':
    main()
