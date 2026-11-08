#!/usr/bin/env python3
"""Cuts the portraits of animals and monsters, and the plates of plants, out of the matrices in assets/animals,
assets/monsters, assets/plants, assets/gems, assets/gear, assets/junk, assets/weapons, assets/armor and
assets/consumables (see the manifests of the same names in data/paintings).

  python3 scripts/animal-portraits.py [animals|monsters|plants|gems|gear]

Each sheet is three by three paintings in gold frames, a kind to a cell in the order the manifest gives. A cell's
opening is found by its frame as the portraits of player characters are (scripts/pc-portraits.py); the whole opening
is kept, a square inset from it clear of the frame's corners, for an animal is its shape (a bat's wings, a centipede's
length), not a face. Each is written small, for a card, and large, for a page, as WebP under web/reader/paintings;
its box is written back to the manifest. Needs Pillow. A development aid only: the game reads the copies and the
manifest, never the sheets.
"""
import importlib.util, json, os, sys
from collections import deque
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageStat

ROOT = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
SET = sys.argv[1] if len(sys.argv) > 1 else 'animals'
# Where a set's sheets are, where it is not the set's own name (the valuables' relic sheets, in assets/junk).
SHEETS = {'valuables': 'junk', 'arms': 'weapons', 'armour': 'armor'}
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


# Sheets of plates with no frames (the botanical, gemstone and gear sheets): each a third of the sheet each way.
PLATES = {'plants', 'gems', 'gear', 'valuables', 'arms', 'armour', 'consumables'}


def gutters(image, axis):
    """The edges of the three plates along one axis: the sheet's ends, and the blankest line near each third."""
    grey = image.convert('L')
    px, n, m = grey.load(), image.size[axis], image.size[1 - axis]
    def ink(i):
        return sum(1 for j in range(0, m, 2) if (px[i, j] if axis == 0 else px[j, i]) < 170)
    cuts = [min(range(int(n * t - n * 0.08), int(n * t + n * 0.08)), key=lambda i: (ink(i), abs(i - n * t)))
            for t in (1 / 3, 2 / 3)]
    return [0, *cuts, n]


def whole(cut):
    """A painting kept whole in a square (the owner, 7 November: a square cut of a wide cell had taken off heads,
    horns and tails): the cell entire in the middle, on its own parchment, the colour its border mostly is, and
    feathered into it where they meet (a blurred copy behind it had ghosted above the heads, and its edge drawn out had
    streaked where a beast reached the edge of its cell)."""
    cut = trimmed(cut)
    w, h = cut.size
    # A little room about it, so that what fills its cell (a long neck, a tail) does not touch the plate's edge.
    side = int(max(w, h) * 1.06)
    border = [cut.getpixel((x, y)) for x in range(0, w, 4) for y in (2, h - 3)] + \
        [cut.getpixel((x, y)) for y in range(0, h, 4) for x in (2, w - 3)]
    paper = tuple(sorted(c[k] for c in border)[len(border) // 2] for k in range(3))
    out = Image.new('RGB', (side, side), paper)
    feather = max(4, side // 40)
    mask = Image.new('L', (w, h), 255)
    edges = ImageDraw.Draw(mask)
    for n in range(feather):
        shade = int(255 * (n + 1) / (feather + 1))
        edges.line([(0, n), (w, n)], fill=shade); edges.line([(0, h - 1 - n), (w, h - 1 - n)], fill=shade)
        edges.line([(n, 0), (n, h)], fill=shade); edges.line([(w - 1 - n, 0), (w - 1 - n, h)], fill=shade)
    out.paste(cut, ((side - w) // 2, (side - h) // 2), mask)
    return out


def trimmed(cut):
    """A cell without the sheet's margin about it: a painting set on the sheet as a panel of its own, on a paper
    darker than the sheet's (the anthology's beasts, the great beasts of 7 November), had been padded out in the
    sheet's colour, a box about it (the owner, 7 November: some cuts still rough). Rows and columns from each side
    that are nearly all the margin's colour are taken off; what is left is padded in its own paper's colour."""
    w, h = cut.size
    px = cut.load()
    edge = [px[x, y] for x in range(0, w, 3) for y in (1, h - 2)] + [px[x, y] for y in range(0, h, 3) for x in (1, w - 2)]
    margin = tuple(sorted(c[k] for c in edge)[len(edge) // 2] for k in range(3))
    near = lambda c: sum(abs(c[k] - margin[k]) for k in range(3)) < 30
    def plain_row(y): return sum(near(px[x, y]) for x in range(0, w, 3)) / len(range(0, w, 3)) > 0.97
    def plain_col(x): return sum(near(px[x, y]) for y in range(0, h, 3)) / len(range(0, h, 3)) > 0.97
    top, bottom, left, right = 0, h - 1, 0, w - 1
    while top < bottom and plain_row(top): top += 1
    while bottom > top and plain_row(bottom): bottom -= 1
    while left < right and plain_col(left): left += 1
    while right > left and plain_col(right): right -= 1
    # Only a margin is taken off, never the painting: a cell trimmed to less than half is left as it was.
    if (right - left) < w / 2 or (bottom - top) < h / 2:
        return cut
    return cut.crop((left, top, right + 1, bottom + 1))


def square(cut):
    """A plate made square, centred on the parchment its corners show."""
    w, h = cut.size
    corners = [cut.getpixel(xy) for xy in ((2, 2), (w - 3, 2), (2, h - 3), (w - 3, h - 3))]
    paper = tuple(sum(c[k] for c in corners) // 4 for k in range(3))
    side = max(w, h)
    out = Image.new('RGB', (side, side), paper)
    out.paste(cut, ((side - w) // 2, (side - h) // 2))
    return out


# Sheets whose things are cut out of their cells, not cut whole (the gear sheets: a crowbar's tip or a cloak's hem
# crosses into the next cell, and some sheets are ruled): the thing alone, on a square of its own parchment.
# Sheets ruled into equal thirds, painted to the edge, without frames, and how far in from a rule a cell is cut.
GRID, GRID_INSET = {'animals', 'monsters'}, 0.03
ISOLATED = {'gear', 'valuables', 'arms', 'armour', 'consumables'}
# How far a pixel's colour is from the parchment's to be of the thing, and the scale its pieces are found at.
INK, SCALE = 34, 4


def isolate(cell):
    """The thing a cell shows: where the cell differs from its parchment, thin rules and specks opened away, the pieces
    near together joined, and of those the one with most of the thing near the middle kept (not a neighbour's sliver at
    the edge); laid with a soft edge on a square of the parchment's own colour, centred, with a margin."""
    w, h = cell.size
    # The parchment is what the cell's edges mostly are (a thing filling its cell is most of the cell).
    band = Image.new('L', cell.size, 0)
    band.paste(255, (0, 0, w, 14)); band.paste(255, (0, h - 14, w, h))
    band.paste(255, (0, 0, 14, h)); band.paste(255, (w - 14, 0, w, h))
    paper = tuple(int(v) for v in ImageStat.Stat(cell, band).median)
    diff = ImageChops.difference(cell, Image.new('RGB', cell.size, paper)).convert('L')
    ink = diff.point(lambda v: 255 if v > INK else 0).filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    small = ink.resize((w // SCALE, h // SCALE), Image.BOX).point(lambda v: 255 if v > 40 else 0)
    joined = small.filter(ImageFilter.MaxFilter(5))
    sw, sh = small.size
    px, seen, best = joined.load(), set(), None
    for y in range(sh):
        for x in range(sw):
            if px[x, y] and (x, y) not in seen:
                piece, todo = [], deque([(x, y)])
                seen.add((x, y))
                while todo:
                    a, b = todo.popleft()
                    piece.append((a, b))
                    for c, d in ((a + 1, b), (a - 1, b), (a, b + 1), (a, b - 1)):
                        if 0 <= c < sw and 0 <= d < sh and px[c, d] and (c, d) not in seen:
                            seen.add((c, d))
                            todo.append((c, d))
                # Its weight: how much of it there is, less the further its middle is from the cell's.
                mx, my = sum(p[0] for p in piece) / len(piece), sum(p[1] for p in piece) / len(piece)
                off = ((mx - sw / 2) ** 2 + (my - sh / 2) ** 2) ** 0.5 / (min(sw, sh) / 2)
                weight = len(piece) * max(0.05, 1 - off)
                if not best or weight > best[0]:
                    best = (weight, piece)
    keep = Image.new('L', small.size, 0)
    kp = keep.load()
    for a, b in best[1] if best else []:
        kp[a, b] = 255
    keep = ImageChops.multiply(keep.resize(cell.size, Image.NEAREST).filter(ImageFilter.MaxFilter(9)),
                               ink.filter(ImageFilter.MaxFilter(15)))
    box = keep.getbbox() or (0, 0, w, h)
    soft = keep.filter(ImageFilter.GaussianBlur(6))
    side = int(max(box[2] - box[0], box[3] - box[1]) * 1.12)
    out = Image.new('RGB', (side, side), paper)
    at = ((side - (box[2] - box[0])) // 2, (side - (box[3] - box[1])) // 2)
    out.paste(cell.crop(box), at, soft.crop(box))
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
            image = Image.open(os.path.join(ROOT, 'assets', SHEETS.get(SET, SET), p['source'])).convert('RGB')
            sheets[p['source']] = (image, None if SET in PLATES else pc.openings(image.load(), *image.size))
        image, cells = sheets[p['source']]
        if SET in GRID:
            # A sheet ruled into equal thirds and painted to its edges (the owner's natural-history animals of 7
            # November): each cell between its rules, where the sheet's rules are, a little in from them, kept whole.
            cols, rows = gutters(image, 0), gutters(image, 1)
            r, c = p['cell']
            x0, x1, y0, y1 = cols[c], cols[c + 1], rows[r], rows[r + 1]
            m = int(min(x1 - x0, y1 - y0) * GRID_INSET)
            x0, x1, y0, y1 = x0 + m, x1 - m, y0 + m, y1 - m
            p['crop'] = [x0, y0, x1, y1]
            write(p, whole(image.crop((x0, y0, x1, y1))))
            continue
        if SET in PLATES:
            # A plate on parchment, no frame: between the blank gutters either side of it, whole, made square with the
            # parchment's own colour (a plant is tall, and its root and flower are both of it).
            cols, rows = gutters(image, 0), gutters(image, 1)
            r, c = p['cell']
            x0, x1, y0, y1 = cols[c], cols[c + 1], rows[r], rows[r + 1]
            # A plate whose neighbour reaches over the gutter says how much of its cell to leave off (trim: of the
            # cell's height, from the bottom: the chain's, by the hem of the cloak below it).
            y1 -= int((y1 - y0) * p.get('trim', 0))
            p['crop'] = [x0, y0, x1, y1]
            cut = image.crop((x0, y0, x1, y1))
            write(p, isolate(cut) if SET in ISOLATED else square(cut))
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
