#!/usr/bin/env python3
"""Cuts the portraits of animals and monsters, and the plates of plants, out of the matrices in assets/animals,
assets/monsters and assets/plants (see data/paintings/animals.json, monsters.json and plants.json).

  python3 scripts/animal-portraits.py [animals|monsters|plants]

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


# Sheets of plates with no frames (the botanical sheets): each a third of the sheet each way.
PLATES = {'plants'}


def gutters(image, axis):
    """The edges of the three plates along one axis: the sheet's ends, and the blankest line near each third."""
    grey = image.convert('L')
    px, n, m = grey.load(), image.size[axis], image.size[1 - axis]
    def ink(i):
        return sum(1 for j in range(0, m, 2) if (px[i, j] if axis == 0 else px[j, i]) < 170)
    cuts = [min(range(int(n * t - n * 0.08), int(n * t + n * 0.08)), key=lambda i: (ink(i), abs(i - n * t)))
            for t in (1 / 3, 2 / 3)]
    return [0, *cuts, n]


def square(cut):
    """A plate made square, centred on the parchment its corners show."""
    w, h = cut.size
    corners = [cut.getpixel(xy) for xy in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3))]
    paper = tuple(sum(c[k] for c in corners) // 4 for k in range(3))
    side = max(w, h)
    out = Image.new('RGB', (side, side), paper)
    out.paste(cut, ((side - w) // 2, (side - h) // 2))
    return out


def write(p, cut):
    for key, size in SIZES.items():
        path = os.path.join(OUT, p[key])
        os.makedirs(os.path.dirname(path), exist_ok=True)
        cut.resize((size, size), Image.LANCZOS).save(path, 'WEBP', quality=82, method=6)


def main():
    manifest = json.load(open(MANIFEST))
    sheets = {}
    for p in manifest['portraits']:
        if p['source'] not in sheets:
            image = Image.open(os.path.join(ROOT, 'assets', SET, p['source'])).convert('RGB')
            sheets[p['source']] = (image, None if SET in PLATES else pc.openings(image.load(), *image.size))
        image, cells = sheets[p['source']]
        if SET in PLATES:
            # A plate on parchment, no frame: between the blank gutters either side of it, whole, made square with the
            # parchment's own colour (a plant is tall, and its root and flower are both of it).
            cols, rows = gutters(image, 0), gutters(image, 1)
            r, c = p['cell']
            x0, x1, y0, y1 = cols[c], cols[c + 1], rows[r], rows[r + 1]
            p['crop'] = [x0, y0, x1, y1]
            write(p, square(image.crop((x0, y0, x1, y1))))
            continue
        x0, y0, x1, y1 = cells[tuple(p['cell'])]
        # A cell whose frame comes further in (the discerner's gilt corner) says how far in its own square sits.
        side, inset = min(x1 - x0, y1 - y0), p.get('inset', ARCHED.get(p['source'], INSET))
        s = int(side * (1 - 2 * inset))
        a = int(x0 + (x1 - x0 - s) / 2)
        b = int(y0 + (y1 - y0 - s) * 0.8) if p['source'] in ARCHED else int(y0 + side * p.get('top', TOP))
        p['crop'] = [a, b, a + s, b + s]
        cut = image.crop(tuple(p['crop']))
        write(p, cut if p['source'] in ARCHED else mend(cut))
    lines = ',\n'.join(' ' + json.dumps(p) for p in manifest['portraits'])
    with open(MANIFEST, 'w') as f:
        f.write(f'{{\n "about": {json.dumps(manifest["about"])},\n "portraits": [\n{lines}\n ]\n}}\n')
    print(f'Cut {len(manifest["portraits"])} portraits')


if __name__ == '__main__':
    main()
