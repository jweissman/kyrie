# Compose contact sheets from the probe's PNGs: python3 compose.py <sheet dir> <out dir>
from PIL import Image, ImageDraw, ImageFont
import glob, os, sys
root, out = sys.argv[1], sys.argv[2]
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
except OSError: font = ImageFont.load_default()
for size in sorted(os.listdir(root)):
    files = sorted(glob.glob(f'{root}/{size}/*.png'))
    w, h = map(int, size.split('x')); scale = 360 / w if w > h else 300 / h
    tw, th = int(w * scale), int(h * scale); cols = 5 if w > h else 7; rows = (len(files) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (tw + 12) + 12, rows * (th + 40) + 50), (18, 19, 24)); d = ImageDraw.Draw(sheet)
    d.text((12, 12), f'Kyrie, a1, {size}', fill=(236, 230, 217), font=font)
    for i, f in enumerate(files):
        im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
        x = 12 + (i % cols) * (tw + 12); y = 50 + (i // cols) * (th + 40)
        sheet.paste(im, (x, y)); d.text((x, y + th + 6), os.path.basename(f)[:-4], fill=(165, 159, 148), font=font)
    sheet.save(f'{out}/sheet-{size}.jpg', quality=82)
