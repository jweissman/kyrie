# Comparison sheets from the capture harness's PNGs: for one size, the chosen states down and the compositions across.
# python3 -I compare.py <run dir> <out dir> <size> <state,state,...> [look,look,...]
from PIL import Image, ImageDraw, ImageFont
import os, sys
run, out, size, states = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
looks = (sys.argv[5] if len(sys.argv) > 5 else 'base,veil,attend,plate').split(',')
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 16)
except OSError: font = ImageFont.load_default()
w, h = map(int, size.split('x'))
cw = 360 if w > h else (220 if w > 500 else 170)
ch = int(h * cw / w)
names = {s: next((f for f in sorted(os.listdir(f'{run}/base/{size}')) if f[3:-4] == s), None) for s in states}
sheet = Image.new('RGB', (110 + len(looks) * (cw + 10), 36 + len(states) * (ch + 10)), (18, 19, 24))
d = ImageDraw.Draw(sheet)
for j, look in enumerate(looks):
    d.text((110 + j * (cw + 10), 10), look, fill=(236, 230, 217), font=font)
for i, s in enumerate(states):
    y = 36 + i * (ch + 10)
    d.text((8, y + 4), s, fill=(165, 159, 148), font=font)
    for j, look in enumerate(looks):
        f = names[s] and f'{run}/{look}/{size}/{names[s]}'
        if f and os.path.exists(f):
            sheet.paste(Image.open(f).convert('RGB').resize((cw, ch), Image.LANCZOS), (110 + j * (cw + 10), y))
sheet.save(f'{out}/compare-{size}.jpg', quality=80, optimize=True)
