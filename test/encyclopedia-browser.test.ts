/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The Encyclopedia in parchment and ink (the owner, 14 November, CN-11: "a coherent parchment-and-ink design,
// harmonize its illustrations with that surface, and check readability on tablet"), at an iPad's size either way up:
// it opens, its title page and a chapter read (their body text in ink on the paper at a contrast to read by, at a
// size and a measure to read at), nothing is wider than the screen, and an illustration is a plate printed onto the
// page (multiplied into it, in sepia, framed). Screenshots to KYRIE_ENCYCLOPEDIA_SHOTS where it is given
// (aesthetic/encyclopedia/).
class Book {
  static async shot(page: Page, name: string) {
    const dir = process.env.KYRIE_ENCYCLOPEDIA_SHOTS;
    if (!dir) { return; }
    await mkdir(dir, { recursive: true });
    await page.screenshot({ path: join(dir, `${name}.png`) });
  }
  // The body's reading: its ink against the paper (WCAG's contrast), its size, its measure in characters, and whether
  // anything is wider than the screen.
  static read(page: Page, selector: string) {
    return page.evaluate(sel => {
      const lum = (c: string) => {
        const [r, g, b] = (c.match(/\d+(\.\d+)?/g) ?? []).slice(0, 3).map(Number).map(v => v / 255)
          .map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4);
        return .2126 * r! + .7152 * g! + .0722 * b!;
      };
      const p = document.querySelector<HTMLElement>(sel)!, style = getComputedStyle(p);
      const paper = getComputedStyle(document.documentElement).getPropertyValue('--paper').trim();
      const hex = paper.replace('#', ''), rgb = `rgb(${[0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)).join(',')})`;
      const [a, b] = [lum(style.color), lum(rgb)];
      const ch = p.getBoundingClientRect().width / (parseFloat(style.fontSize) * .5);
      return { contrast: Math.round(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)) * 10) / 10,
        size: parseFloat(style.fontSize), measure: Math.round(ch),
        wide: document.documentElement.scrollWidth > innerWidth + 1 };
    }, selector);
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the Encyclopedia in parchment and ink', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-encyclopedia-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[820, 1180], [1180, 820]] as const)('at %ix%i reads, and holds to the screen', async (width, height) => {
    const page = await browser.newPage({ viewport: { width, height } }), errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`file://${join(site, 'encyclopedia', 'index.html')}`);
    // The title page: its lede in ink on the paper.
    const title = await Book.read(page, '.landing .lede');
    expect(title.contrast).toBeGreaterThanOrEqual(7);
    expect(title.wide).toBe(false);
    await Book.shot(page, `${width}x${height}-title`);
    // A chapter with pictures: the creatures.
    const chapters = await page.locator('.cards a.card').evaluateAll(as => as.map(a => (a as HTMLAnchorElement).href));
    expect(chapters.length).toBeGreaterThan(2);
    let pictured = '';
    for (const href of chapters) {
      await page.goto(href);
      if (await page.locator('.entry .painting').count()) { pictured = href; break; }
    }
    expect(pictured).not.toBe('');
    const entry = await Book.read(page, '.entry .text');
    // Body ink at AA and better, at a reading size, within a reading measure, and nothing past the screen.
    expect(entry.contrast).toBeGreaterThanOrEqual(7);
    expect(entry.size).toBeGreaterThanOrEqual(16);
    expect(entry.measure).toBeLessThanOrEqual(90);
    expect(entry.wide).toBe(false);
    // The plate: multiplied into the paper, in sepia, framed.
    const plate = await page.locator('.entry .painting').first().evaluate(e => {
      const s = getComputedStyle(e);
      return { blend: s.mixBlendMode, sepia: /sepia/.test(s.filter), framed: s.borderTopStyle !== 'none' };
    });
    expect(plate).toEqual({ blend: 'multiply', sepia: true, framed: true });
    await page.locator('.entry .painting').first().scrollIntoViewIfNeeded();
    await Book.shot(page, `${width}x${height}-chapter`);
    // Dark mode asked for: the book stays light by design, and as legible.
    await page.emulateMedia({ colorScheme: 'dark' });
    expect((await Book.read(page, '.entry .text')).contrast).toBeGreaterThanOrEqual(7);
    expect(errors).toEqual([]);
    await page.close();
  }, 200000);
});
