import { describe, expect, it } from 'bun:test';
import { SheetContrast } from '../../scripts/contact-sheet-contrast';

// The contact sheets' contrast of a line of text against what is behind it (UI-19): WCAG 2's ratio, a line read by the
// worst tenth of the pixels behind it (not their median), and the text's own alpha laid over each.
describe('a line\'s contrast', () => {
  it('is WCAG\'s ratio: white on black 21, grey on grey 1', () => {
    expect(SheetContrast.ratio([255, 255, 255, 1], [[0, 0, 0]])).toBeCloseTo(21, 1);
    expect(SheetContrast.ratio([128, 128, 128, 1], [[128, 128, 128]])).toBeCloseTo(1, 5);
    expect(SheetContrast.ratio([118, 118, 118, 1], [[255, 255, 255]])).toBeGreaterThan(4.5);
  });
  it('is read by the worst tenth behind it, so a bright patch under light text counts', () => {
    const dark = Array.from({ length: 80 }, () => [10, 10, 10]);
    const bright = Array.from({ length: 20 }, () => [230, 230, 230]);
    const ratio = SheetContrast.ratio([240, 236, 224, 1], [...dark, ...bright]);
    expect(ratio).toBeLessThan(1.5);
    expect(SheetContrast.ratio([240, 236, 224, 1], dark)).toBeGreaterThan(15);
  });
  it('lays a translucent text over each pixel', () => {
    expect(SheetContrast.ratio([255, 255, 255, 0.5], [[0, 0, 0]]))
      .toBeLessThan(SheetContrast.ratio([255, 255, 255, 1], [[0, 0, 0]]));
  });
});
