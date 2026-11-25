import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { CompanyPortraits } from '../src/paintings/company-portraits';

// Each of the company's portraits cut within the sheet it was cut from (scripts/pc-portraits.py,
// data/paintings/pcs.json; test/portrait-crops holds the rest of the cut). It reads the sheets in assets/pcs, so it is
// the images lane's (test/lanes.json): CI's images job, on a full checkout, with KYRIE_IMAGES=1; a builder's worktree
// has no assets/.
class Sheet {
  // A PNG's width and height, from its header.
  static size(path: string): [number, number] {
    const b = readFileSync(path);
    return [b.readUInt32BE(16), b.readUInt32BE(20)];
  }
}

describe.skipIf(!process.env.KYRIE_IMAGES)('the company\'s portraits, on their sheets', () => {
  it('cuts each a square within its sheet', () => {
    const sheets = new Map<string, [number, number]>();
    for (const p of CompanyPortraits.all) {
      const [w, h] = sheets.get(p.source) ?? Sheet.size(`assets/pcs/${p.source}`);
      sheets.set(p.source, [w, h]);
      const [x0, y0, x1, y1] = p.crop as [number, number, number, number];
      expect([p.id, x1 - x0 === y1 - y0, x0 >= 0 && y0 >= 0 && x1 <= w && y1 <= h]).toEqual([p.id, true, true]);
    }
  });
});
