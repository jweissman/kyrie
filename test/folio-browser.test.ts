/// <reference lib="dom" />
// The character's sheet as a folio (OR-307, the owner's playtests of 23-24 November: "simplified, as a folio … the
// character, their abilities, values, condition and equipment plainly, without the little squares, unexplained signs
// and repeated modifiers; the attributes as values; calculations on demand"): on the encyclopedia's parchment, the
// qualities by their names and scores alone; no emblem beside the line, no modifier beside a skill. What a value adds,
// on demand, is OR-386. At a desk's size and a phone's. Opt in with KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

describe.skipIf(!process.env.KYRIE_BROWSER)('the character as a folio', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-folio-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); }, 60000);
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`is a plain sheet on parchment at ${size.width}×${size.height}`, async () => {
      const { page, driver: d, errors } = await MonoBrowser.page(browser, size, { site, query: '?campaign=low-water' });
      await page.waitForSelector('[data-action="start"]');
      await d.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      await d.mode('c');
      await page.waitForSelector('.character .values');
      const sheet = await page.evaluate(() => {
        const ground = getComputedStyle(document.querySelector('.book-page')!).backgroundColor;
        const [r, g, b] = (ground.match(/\d+/g) ?? []).map(Number);
        const ink = getComputedStyle(document.querySelector('.character .who')!).color.match(/\d+/g)!.map(Number);
        const values = [...document.querySelectorAll('.character .values > div')].map(v => ({
          name: v.querySelector('dt')!.textContent!, score: v.querySelector('dd')!.textContent! }));
        // A light paper still, though toned to an aged vellum (OR-1090: its mean channel 191, from 220).
        return { light: (r! + g! + b!) / 3 > 180, dark: ink.slice(0, 3).reduce((a, x) => a + x, 0) / 3 < 80, values,
          boxes: document.querySelectorAll('.character .stat-row, .character .mod').length,
          signs: document.querySelectorAll('.character .line-of svg, .character .spell-glyph').length,
          skillSigns: [...document.querySelectorAll('.character .skill-line')].some(l => /[+−-]\d/.test(l.textContent ?? '')) };
      });
      expect([sheet.light, sheet.dark, sheet.boxes, sheet.signs, sheet.skillSigns]).toEqual([true, true, 0, 0, false]);
      expect(sheet.values.length).toBe(6);
      const plain = (v: { name: string; score: string }) => v.name.length > 3 && /^\d+$/.test(v.score);
      expect(sheet.values.every(plain)).toBe(true);
      if (process.env.KYRIE_SHOTS) { await page.screenshot({ path: `${process.env.KYRIE_SHOTS}/folio-${size.width}.png` }); }
      expect(errors).toEqual([]);
      await page.close();
    }, 300000);
  }
});
