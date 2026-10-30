#!/usr/bin/env python3
"""Cuts the portraits of player characters out of the matrices in assets/pcs (see data/paintings/pcs.json).

  python3 scripts/pc-portraits.py

Each sheet is three by three paintings in gold frames. A cell's opening is found by its frame, not by thirds: the bars
between the cells are the columns and rows of the sheet that are gold nearly all the way along. Within the opening the
frame's arches reach into the corners, so the square cut about the face (where the manifest says the face sits) is
kept clear of every gold pixel joined to the frame there. Each square is written small, for a fighter's card, and
medium, for the company's page, as WebP under web/reader/paintings/pcs; its box is written back to the manifest. Needs
Pillow. A development aid only: the game reads the copies and the manifest, never the sheets.
"""
import json, os
from collections import deque
from PIL import Image

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
MANIFEST = os.path.join(ROOT, 'data/paintings/pcs.json')
OUT = os.path.join(ROOT, 'web/reader')
# The square's side as a part of the opening's shorter side, how far down it the face sits, the least clearance from
# the opening's edge, how far into each corner the arches reach, and how wide a strip along each edge is frame.
SIDE, AT, MARGIN, CORNER, EDGE = 0.62, 0.42, 8, 110, 6
SIZES = {'file': 160, 'medium': 320}


def gold(p):
    r, g, b = p
    return r > 110 and r - b > 55 and g > b and g > 0.4 * r


def runs(profile, least=0.5):
    out, start = [], None
    for i, v in enumerate(profile + [0]):
        if v >= least and start is None:
            start = i
        if v < least and start is not None:
            out.append((start, i - 1))
            start = None
    return out


def bars(profile, n):
    """Each boundary of the sheet's thirds: where the cell before it ends and the cell after it begins."""
    found, out = runs(profile), []
    for k in range(4):
        near = [r for r in found if abs((r[0] + r[1]) / 2 - k * n / 3) < 50]
        out.append((min(r[0] for r in near) - 1 if near else min(n - 1, k * n // 3),
                    max(r[1] for r in near) + 1 if near else max(0, k * n // 3)))
    return out


def openings(px, w, h):
    mask = [[gold(px[x, y]) for x in range(w)] for y in range(h)]
    cols = bars([sum(mask[y][x] for y in range(h)) / h for x in range(w)], w)
    rows = bars([sum(mask[y][x] for x in range(w)) / w for y in range(h)], h)
    return {(r, c): (cols[c][1], rows[r][1], cols[c + 1][0], rows[r + 1][0]) for r in range(3) for c in range(3)}


def frame(px, size, box):
    """The gold joined to the frame about an opening: its bars, the strip along its edges, and its arched corners."""
    (w, h), (x0, y0, x1, y1) = size, box

    def inside(x, y):
        if not (x0 - 4 <= x <= x1 + 4 and y0 - 4 <= y <= y1 + 4 and 0 <= x < w and 0 <= y < h):
            return False
        if x < x0 + EDGE or x > x1 - EDGE or y < y0 + EDGE or y > y1 - EDGE:
            return True
        return (x < x0 + CORNER or x > x1 - CORNER) and (y < y0 + CORNER or y > y1 - CORNER)
    seen, queue = set(), deque()
    for x in range(max(0, x0 - 4), min(w, x1 + 5)):
        for y in range(max(0, y0 - 4), min(h, y1 + 5)):
            outside = x < x0 or x > x1 or y < y0 or y > y1 or (y0 == 0 and y < 3)
            if outside and gold(px[x, y]):
                seen.add((x, y))
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if (nx, ny) not in seen and inside(nx, ny) and gold(px[nx, ny]):
                seen.add((nx, ny))
                queue.append((nx, ny))
    return seen


def square(box, face, gilt):
    """The square about the face, moved down or aside, or made smaller, until no gold of the frame is in it."""
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    fx, fy = x0 + face[0] * w, y0 + face[1] * h
    for shrink in (1, .96, .92, .88, .84, .8):
        s = int(SIDE * min(w, h) * shrink)
        for dy in range(0, 44, 4):
            for dx in (0, 4, -4, 8, -8, 12, -12, 16, -16, 20, -20):
                a = int(min(max(fx - s / 2 + dx, x0 + MARGIN), x1 - MARGIN - s))
                b = int(min(max(fy - AT * s + dy, y0 + MARGIN + (6 if y0 == 0 else 0)), y1 - MARGIN - s))
                if not any(a <= x < a + s and b <= y < b + s for x, y in gilt):
                    return [a, b, a + s, b + s]
    raise ValueError(f'No square clear of the frame in {box}')


def main():
    manifest = json.load(open(MANIFEST))
    sheets = {}
    for p in manifest['portraits']:
        if p['source'] not in sheets:
            image = Image.open(os.path.join(ROOT, 'assets/pcs', p['source'])).convert('RGB')
            sheets[p['source']] = (image, openings(image.load(), *image.size))
        image, cells = sheets[p['source']]
        box = cells[tuple(p['cell'])]
        p['crop'] = square(box, p['face'], frame(image.load(), image.size, box))
        cut = image.crop(tuple(p['crop']))
        for key, size in SIZES.items():
            path = os.path.join(OUT, p[key])
            os.makedirs(os.path.dirname(path), exist_ok=True)
            cut.resize((size, size), Image.LANCZOS).save(path, 'WEBP', quality=80, method=6)
    lines = ',\n'.join(' ' + json.dumps(p) for p in manifest['portraits'])
    with open(MANIFEST, 'w') as f:
        f.write(f'{{\n "about": {json.dumps(manifest["about"])},\n "portraits": [\n{lines}\n ]\n}}\n')
    print(f'Cut {len(manifest["portraits"])} portraits')


if __name__ == '__main__':
    main()
