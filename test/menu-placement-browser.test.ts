/// <reference lib="dom" />
// One page frame owns the primary action menu (OR-305, the owner's cold play of 24 November): its column is the
// frame's (frame.css: --menu-r, --menu-w, --menu-inset), hard right on a wide screen and the safe zone's width at the
// foot of a narrow one, and no page decides its own. Measured on every page a player meets from the title to the Book,
// at a desk's size and a phone's: the columns the menus stand in, counted and held by a ratchet (five at each size
// before the frame owned the column, 24 November); and the pages on the frame (the scene, its lenses, a conversation)
// standing in its one column. Opt in with KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { MenuPlacement } from './support/menu-placement';

// The columns allowed at each size: lowered as each page comes onto the frame (OR-380), never raised.
const held = 4;
const framed = ['scene', 'lens:talk', 'lens:go', 'talk'];
describe.skipIf(!process.env.KYRIE_BROWSER)('the primary action menu, placed by the frame', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-place-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`stands in the frame's column on its pages, in no more columns than held, at ${size.width}×${size.height}`,
      async () => {
        const { page, errors } = await MonoBrowser.page(browser, size, { site, pointer: false, query: '' });
        // KYRIE_SHOTS: a folder each page is photographed into as it is measured.
        const placed = await MenuPlacement.walk(page, site, process.env.KYRIE_SHOTS);
        const columns = MenuPlacement.columns(placed);
        console.log(JSON.stringify(placed.map(p => [p.surface, MenuPlacement.name(p),
          Object.values(p.box).map(Math.round)])));
        // Every page the walk reaches has its menu measured, and the frame's pages share one column.
        expect(placed.map(p => p.surface)).toEqual(expect.arrayContaining(['title', 'begin', 'creation', ...framed, 'map',
          'book']));
        const shown = framed.filter(s => placed.some(p => p.surface === s));
        expect(columns.filter(c => shown.some(s => c.includes(s)))).toEqual([expect.arrayContaining(shown)]);
        // That column is the frame's: hard right on a wide screen, the safe zone's width on a phone.
        const scene = placed.find(p => p.surface === 'scene')!, frame = await page.evaluate(() => {
          const shell = getComputedStyle(document.querySelector('.shell')!), px = (v: string) => {
            const probe = document.createElement('div'); probe.style.width = v; document.body.append(probe);
            const w = probe.getBoundingClientRect().width; probe.remove(); return w;
          };
          return { r: px(shell.getPropertyValue('--menu-r')), w: px(shell.getPropertyValue('--menu-w')),
            inset: px(shell.getPropertyValue('--menu-inset')), l: px(shell.getPropertyValue('--safe-l')) };
        });
        const right = scene.box.x + scene.box.width;
        if (size.width > 900) {
          expect(Math.abs(right - (size.width - frame.r - frame.inset))).toBeLessThan(2);
          expect(Math.abs(scene.box.x - (size.width - frame.r - frame.w + frame.inset))).toBeLessThan(2);
        } else {
          expect(Math.abs(scene.box.x - frame.l)).toBeLessThan(2);
        }
        expect(columns.length).toBeLessThanOrEqual(held);
        expect(errors).toEqual([]);
      }, 600000);
  }
});
