/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The portraits as drawn, measured (the owner's fresh session of 7 November: the top of their character's head cut on
// the map; in the place at rest one of the company sat higher than the rest). On the map your face is the portrait's
// square whole on its plate, never drawn in closer; at rest the company stands first and apart, and every likeness of
// a size has its face on one line with the others; on the company's page the members' names stand level. Low Water
// at a desk and on a tablet: Isaura joins at the head of the Stair. Opt in with KYRIE_BROWSER=1.
class Measure {
  static async act(d: MonoDriver, ...labels: string[]) {
    for (const label of labels) { await d.pick(c => new RegExp(label, 'i').test(c.label), label); }
  }
  // Your plate on the map: the face drawn the plate's size within its ring, untransformed, from the top of the square.
  static plate(page: Page) {
    return page.evaluate(() => {
      const plate = document.querySelector('.board-you .you-plate.faced'), img = plate?.querySelector('img');
      if (!plate || !img) { return undefined; }
      const p = plate.getBoundingClientRect(), i = img.getBoundingClientRect(), s = getComputedStyle(img);
      const ring = parseFloat(getComputedStyle(plate).borderTopWidth);
      return { fits: Math.abs(i.width - (p.width - 2 * ring)) <= 1 && Math.abs(i.top - (p.top + ring)) <= 1,
        transform: s.transform, top: s.objectPosition.split(' ')[1] };
    });
  }
  // The likenesses over the place at rest: each one's kind, and where its face stands.
  static row(page: Page) {
    return page.evaluate(() => Array.from(document.querySelectorAll('.surface .portraits > li')).map(li => {
      const face = li.querySelector('.face, .more')!.getBoundingClientRect(), s = getComputedStyle(li);
      const bare = s.paddingTop === '0px' && s.paddingBottom === '0px' && s.borderTopWidth === '0px';
      return { kind: li.className.split(' ')[0] ?? '', top: Math.round(face.top), bottom: Math.round(face.bottom),
        size: Math.round(face.height), bare };
    }));
  }
  static members(page: Page) {
    return page.evaluate(() => Array.from(document.querySelectorAll('.character .members > .act'))
      .map(m => {
        const r = m.getBoundingClientRect();
        return [Math.round(r.top), Math.round(r.height)] as [number, number];
      }));
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the portraits as drawn', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-portraits-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800], [1024, 1366]] as const)('at %ix%i', async (width, height) => {
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, query: '?campaign=low-water' });
    await page.waitForSelector('[data-action="start"]');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    // Play begins on the place (Mission 20's amendment 1): M raises the map, where the company's likeness stands.
    await page.keyboard.press('m');
    await page.waitForSelector('.board-you .you-plate.faced img', { timeout: 30000 });
    expect(await Measure.plate(page)).toEqual({ fits: true, transform: 'none', top: '0px' });
    await d.enter();
    await Measure.act(d, '^To the head of the Stair', '^Talk to Isaura', 'waiting for you', 'join the company');
    await d.away();
    const row = await Measure.row(page);
    // The company first; every likeness bare of any box of its own; faces of a size on one line.
    expect(row[0]?.kind).toBe('companion');
    expect(row.every(x => x.bare)).toBe(true);
    for (const size of new Set(row.map(x => x.size))) {
      const of = row.filter(x => x.size === size);
      expect([size, new Set(of.map(x => x.top)).size, new Set(of.map(x => x.bottom)).size]).toEqual([size, 1, 1]);
    }
    await d.mode('c');
    await page.waitForSelector('.character .members > .act');
    const members = await Measure.members(page);
    expect(members.length).toBeGreaterThan(1);
    // Each the same height, and those on one line at one top (on a tablet they run to a second line).
    expect(new Set(members.map(([, h]) => h)).size).toBe(1);
    const tops = [...new Set(members.map(([top]) => top))].sort((a, b) => a - b);
    expect(tops.every((t, i) => i === 0 || t - tops[i - 1]! >= members[0]![1])).toBe(true);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
