import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// The reticle is a circle and only a circle (the owner, 15 November: "the ret cursor should never actually gain horizon
// cross-bars, it should always just be a circle"): at rest, over anything that can be chosen, and pressed, each of the
// page's cursors (web/reader/menu.css) draws circles and nothing else.
describe('the reticle', () => {
  it('is a circle at rest, over a choice and pressed', () => {
    const css = readFileSync('web/reader/menu.css', 'utf8');
    const cursors = [...css.matchAll(/--cursor-(rest|act|press): url\("data:image\/svg\+xml,(.*?)"\)/g)];
    expect(cursors.map(c => c[1])).toEqual(['rest', 'act', 'press']);
    for (const [, , svg] of cursors) {
      const shapes = [...decodeURIComponent(svg!).matchAll(/<(\w+)[\s/>]/g)].map(m => m[1]).filter(t => t !== 'svg');
      expect([...new Set(shapes)]).toEqual(['circle']);
    }
  });
  // Large enough to find (the owner, 15 November: "way too small") and never a filled disc: pressing tightens the
  // ring; it is a long press that fills the reticle, from its centre out, drawn by the page (instrument.css).
  it('is large enough to find, and pressed is a tightened ring, not a filled disc', () => {
    const css = readFileSync('web/reader/menu.css', 'utf8');
    const radii: Record<string, number> = {};
    for (const [, name, svg] of css.matchAll(/--cursor-(rest|act|press): url\("data:image\/svg\+xml,(.*?)"\)/g)) {
      const drawn = decodeURIComponent(svg!);
      expect(Number(/width='(\d+)'/.exec(drawn)?.[1])).toBeGreaterThanOrEqual(40);
      expect(drawn).not.toMatch(/fill='%23|fill='#/);
      radii[name!] = Number(/ r='([\d.]+)'/.exec(drawn)?.[1]);
    }
    expect(radii.rest!).toBeGreaterThanOrEqual(9);
    expect(radii.act!).toBeGreaterThan(radii.rest!);
    expect(radii.press!).toBeLessThan(radii.rest!);
  });
});
