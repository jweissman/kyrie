import { describe, expect, it } from 'bun:test';
import { Folio } from '../../src/handbook/folio';

// The backstage's one paper, toned down (the owner, 26 November: the Encyclopedia's parchment "way too sharp"), its
// inks still read on it: every ink at least WCAG AA's 4.5:1 on the paper and on its deeper ground, the body ink well
// above it, and the paper no brighter than it was made (relative luminance .69, from .80).
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map(c => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].toSorted((p, q) => q - p) as [number, number];
  return (x + 0.05) / (y + 0.05);
};
describe('the folio\'s paper and inks', () => {
  it('is toned down, and every ink reads on it', () => {
    const { paper, deep, ink, dim, faint, link, sepia } = Folio.ink;
    expect(luminance(paper)).toBeLessThan(0.72);
    for (const ground of [paper, deep]) {
      for (const [name, colour] of Object.entries({ ink, dim, faint, link, sepia })) {
        expect([name, ground, ratio(colour, ground) >= 4.5]).toEqual([name, ground, true]);
      }
    }
    expect(ratio(ink, paper)).toBeGreaterThan(9);
  });
});
