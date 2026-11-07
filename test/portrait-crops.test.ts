import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { CompanyPortraits } from '../src/paintings/company-portraits';

// The company's portraits as cut from their sheets (scripts/pc-portraits.py, data/paintings/pcs.json): each a square
// within its sheet, the copies the page shows squares of the sizes it asks for, and the face where the page can keep
// it whole, with room over it for the crown and under it for the chin. The owner's fresh session of 7 November found
// the top of a head cut on the map: the cut had set the face high and moved the square down off the crowns of elves
// and birdfolk where the frame's arches were in the way, and the map drew it in half as close again.
class Sizes {
  // A PNG's width and height, from its header.
  static png(path: string): [number, number] {
    const b = readFileSync(path);
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  }
  // A WebP's width and height, lossy, lossless or extended.
  static webp(path: string): [number, number] {
    const b = readFileSync(path), kind = b.toString('ascii', 12, 16);
    if (kind === 'VP8 ') { return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]; }
    if (kind === 'VP8L') {
      const bits = b.readUInt32LE(21);
      return [(bits & 0x3fff) + 1, ((bits >> 14) & 0x3fff) + 1];
    }
    return [b.readUIntLE(24, 3) + 1, b.readUIntLE(27, 3) + 1];
  }
}

describe('the cut of the company\'s portraits', () => {
  const all = CompanyPortraits.all;
  it('cuts each a square within its sheet, and writes its copies at the sizes the page shows', () => {
    const sheets = new Map<string, [number, number]>();
    for (const p of all) {
      const [w, h] = sheets.get(p.source) ?? Sizes.png(`assets/pcs/${p.source}`);
      sheets.set(p.source, [w, h]);
      const [x0, y0, x1, y1] = p.crop as [number, number, number, number];
      expect([p.id, x1 - x0 === y1 - y0, x0 >= 0 && y0 >= 0 && x1 <= w && y1 <= h]).toEqual([p.id, true, true]);
      expect([p.id, Sizes.webp(`web/reader/${p.file}`), Sizes.webp(`web/reader/${p.medium}`)])
        .toEqual([p.id, [160, 160], [320, 320]]);
    }
  });
  it('keeps the face near the middle across, a quarter of the square or more over it, under half beneath', () => {
    for (const p of all) {
      const [across, down] = p.at as [number, number];
      expect([p.id, across >= 0.35 && across <= 0.65, down >= 0.25 && down <= 0.55]).toEqual([p.id, true, true]);
    }
  });
  it('gives the page where the face sits with the portrait it chooses', () => {
    const face = CompanyPortraits.of({ classId: 'ranger', raceId: 'elf', presentation: 'man', key: 'Elen' });
    expect(face?.at).toEqual(all.find(p => p.id === 'ranger-elf-man')!.at as [number, number]);
  });
});
