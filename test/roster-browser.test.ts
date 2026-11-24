/// <reference lib="dom" />
// The company chosen by their faces (OR-308, the owner's playtests of 23-24 November: the roster took some 40% of the
// backstage to choose among four): on the character's page, a small row of portraits floating at the foot of its
// right side, inside the safe zone, taking a small part of the page; each the choice of whose page it is, the one shown
// ringed. At a desk's size and a phone's. Opt in with KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

const roster = (page: Page) => page.evaluate(() => {
  const nav = document.querySelector('.character .members.roster')!.getBoundingClientRect();
  const shell = getComputedStyle(document.querySelector('.shell')!), px = (v: string) => {
    const probe = document.createElement('div'); probe.style.width = v; document.body.append(probe);
    const w = probe.getBoundingClientRect().width; probe.remove(); return w;
  };
  return { share: (nav.width * nav.height) / (innerWidth * innerHeight),
    inside: nav.right <= innerWidth - px(shell.getPropertyValue('--safe-r')) + 1
      && nav.bottom <= innerHeight - px(shell.getPropertyValue('--safe-b')) + 1,
    right: nav.left > innerWidth / 2, here: document.querySelector('.character .members > .act.here')?.getAttribute('data-choice'),
    who: document.querySelector('.character h2.who')?.textContent };
});
describe.skipIf(!process.env.KYRIE_BROWSER)('the company chosen by their faces', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-roster-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); }, 60000);
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`is a small row of portraits at the foot of the right side at ${size.width}×${size.height}`, async () => {
      const { page, driver: d, errors } = await MonoBrowser.page(browser, size, { site, query: '?campaign=low-water' });
      await page.waitForSelector('[data-action="start"]');
      await d.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      await d.mode('c');
      await page.waitForSelector('.character .members.roster > .act');
      const faces = page.locator('.character .members.roster > .act');
      expect(await faces.count()).toBeGreaterThan(1);
      const first = await roster(page);
      expect([first.share < 0.05, first.inside, first.right]).toEqual([true, true, true]);
      // Another chosen: the page is theirs, and they are ringed.
      const other = await faces.nth(1).getAttribute('data-choice');
      await faces.nth(1).click(); await d.settle();
      const then = await roster(page);
      expect([then.here, then.who !== first.who]).toEqual([other, true]);
      if (process.env.KYRIE_SHOTS) { await page.screenshot({ path: `${process.env.KYRIE_SHOTS}/roster-${size.width}.png` }); }
      expect(errors).toEqual([]);
      await page.close();
    }, 300000);
  }
});
