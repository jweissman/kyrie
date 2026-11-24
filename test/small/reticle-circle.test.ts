import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';

// The reticle is a ring, one size (the owner, 15 November: "it switches between two sizes on click and release", and
// "it should never gain cross-bars, it should always just be a circle"): at rest, over anything that can be chosen and
// pressed, each of the page's cursors (web/reader/menu.css) draws the same circle. Nothing is held (OR-185), so there
// is no cursor over a hold and no ring the page fills while one lasts.
describe('the reticle', () => {
  const css = readFileSync('web/reader/menu.css', 'utf8');
  const pattern = /--cursor-(\w+): image-set\(url\("data:image\/svg\+xml,(.*?)"\) 1x,/g;
  const cursors = [...css.matchAll(pattern)]
    .map(m => ({ name: m[1]!, svg: decodeURIComponent(m[2]!) }));
  it('is a circle at rest, over a choice and pressed, and nothing else', () => {
    expect(cursors.map(c => c.name)).toEqual(['rest', 'act', 'press']);
    for (const { svg } of cursors) {
      const shapes = [...svg.matchAll(/<(\w+)[\s/>]/g)].map(m => m[1]).filter(t => t !== 'svg');
      expect([...new Set(shapes)]).toEqual(['circle']);
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
  // Sharp at every pixel density (the owner, 17 November): each cursor has a second image for a 2x screen.
  it('is drawn sharp: a 2x cursor beside each', () => {
    const twice = /--cursor-(?:rest|act|press): image-set\(url\("[^"]+"\) 1x, url\("[^"]*width='88'/g;
    expect([...css.matchAll(twice)].length).toBe(3);
  });
});
