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
});
