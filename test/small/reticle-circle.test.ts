import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// The reticle is a ring, one size (the owner, 15 November: "it switches between two sizes on click and release", and
// "it should never gain cross-bars, it should always just be a circle"): at rest, over anything that can be chosen,
// over what is held, and pressed, each of the page's cursors (web/reader/menu.css) draws the same circle; the cursor
// over what is held adds one short arc at the top, the start of the clockwise fill; the ring drawn by the page while
// a hold lasts (instrument.css) is that ring, its border filling clockwise (never a disc from the centre).
describe('the reticle', () => {
  const css = readFileSync('web/reader/menu.css', 'utf8');
  const cursors = [...css.matchAll(/--cursor-(rest|act|hold|press): url\("data:image\/svg\+xml,(.*?)"\)/g)]
    .map(m => ({ name: m[1]!, svg: decodeURIComponent(m[2]!) }));
  it('is a circle at rest, over a choice, over a hold and pressed, and nothing else but the hold\'s one arc', () => {
    expect(cursors.map(c => c.name)).toEqual(['rest', 'act', 'hold', 'press']);
    for (const { name, svg } of cursors) {
      const shapes = [...svg.matchAll(/<(\w+)[\s/>]/g)].map(m => m[1]).filter(t => t !== 'svg');
      expect([...new Set(shapes)].sort()).toEqual(name === 'hold' ? ['circle', 'path'] : ['circle']);
    }
  });
  it('is one size throughout, large enough to find, never a filled disc', () => {
    const radii = cursors.map(c => {
      expect(Number(/width='(\d+)'/.exec(c.svg)?.[1])).toBeGreaterThanOrEqual(40);
      expect(c.svg).not.toMatch(/fill='%23|fill='#/);
      return Number(/ r='([\d.]+)'/.exec(c.svg)?.[1]);
    });
    expect(new Set(radii).size).toBe(1);
    expect(radii[0]!).toBeGreaterThanOrEqual(14);
  });
  it('fills its border clockwise while a hold lasts, the page\'s ring the cursor\'s size', () => {
    const ix = readFileSync('web/reader/instrument.css', 'utf8'), ring = /\.ix-reticle \{[^}]*\}/.exec(ix)![0];
    expect(ring).toContain('conic-gradient');
    expect(ring).toContain('mask');
    expect(ring).not.toContain('radial-gradient(circle closest-side, #ECE6D9');
    const r = Number(/ r='([\d.]+)'/.exec(cursors[0]!.svg)?.[1]), box = Number(/width: (\d+)px/.exec(ring)![1]);
    expect(Math.abs(box / 2 - r)).toBeLessThanOrEqual(1.5);
  });
});
