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
# How far in from the opening's sides the square sits, and how far down from its top, as parts of the opening's
# shorter side: as high as the frame's rounded corners allow (their arc is about a sixth of the side), since a head is
# at the top of a painting (the owner, 6 November: the birds', the monkey's and the otter's had been cut too close,
# centred in the opening); and the sizes written.
INSET = 0.06
TOP = 0.052
SIZES = {'file': 320, 'large': 640}
# A sheet whose openings are arched at the top (the first): further in, and the square kept to the bottom of it.
ARCHED = {'menagerie i.png': 0.09}


# Raised that far, the tip of the frame's arc comes into the square's top corners (a few pixels of burnt orange and
# gilt): within so many pixels of each top corner, what is warm or bright is frame, and is filled from the painting
# round it, a ring at a time.
TIP = 16


def framed(c):
    r, g, b = c
    return r - b > 45 or (r > 220 and g > 190)


def mend(img):
    w, h = img.size
    px = img.load()
    mask = {(x, j) for j in range(TIP) for i in range(TIP - j) for x in (i, w - 1 - i) if framed(px[x, j])}
    todo = {(x + dx, y + dy) for (x, y) in mask for dx in (-1, 0, 1) for dy in (-1, 0, 1)
            if 0 <= x + dx < w and 0 <= y + dy < h}
    while todo:
        ring = []
        for (x, y) in todo:
            near = [px[x + dx, y + dy] for dx, dy in ((1, 0), (-1, 0), (0, 1), (1, 1), (-1, 1))
                    if 0 <= x + dx < w and 0 <= y + dy < h and (x + dx, y + dy) not in todo]
            if near:
                ring.append(((x, y), tuple(sum(c[k] for c in near) // len(near) for k in range(3))))
        if not ring:
            break
        for point, colour in ring:
            px[point] = colour
            todo.discard(point)
    return img


def main():
    manifest = json.load(open(MANIFEST))
    sheets = {}
    for p in manifest['portraits']:
        if p['source'] not in sheets:
            image = Image.open(os.path.join(ROOT, 'assets', SET, p['source'])).convert('RGB')
            sheets[p['source']] = (image, pc.openings(image.load(), *image.size))
        image, cells = sheets[p['source']]
        x0, y0, x1, y1 = cells[tuple(p['cell'])]
        # A cell whose frame comes further in (the discerner's gilt corner) says how far in its own square sits.
        side, inset = min(x1 - x0, y1 - y0), p.get('inset', ARCHED.get(p['source'], INSET))
        s = int(side * (1 - 2 * inset))
        a = int(x0 + (x1 - x0 - s) / 2)
        b = int(y0 + (y1 - y0 - s) * 0.8) if p['source'] in ARCHED else int(y0 + side * p.get('top', TOP))
        p['crop'] = [a, b, a + s, b + s]
        cut = image.crop(tuple(p['crop']))
        if p['source'] not in ARCHED:
            cut = mend(cut)
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
