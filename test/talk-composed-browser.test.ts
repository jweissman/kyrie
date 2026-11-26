/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The conversation page composes with a painting and without one (OR-1092, OR-1088, the owner, 26 November: its
// composition had been borrowed from the portraits, the name set large over them, and broke without one). Nothing is
// set over the painting but its credit; the speaker's name heads the exchange in its own column at the frame's one
// heading scale (--type-heading); without a painting the likeness's column holds a plate, centred in it, on a wide
// screen, and on a narrow one the page is the conversation alone, the emblem beside the name.
class Composed {
  static async read(page: Page) {
    return page.evaluate(() => {
      const box = (s: string) => { const e = document.querySelector(s); const r = e?.getBoundingClientRect();
        return r && r.width > 0 && r.height > 0 ? { x: r.x, y: r.y, w: r.width, h: r.height } : undefined; };
      const probe = document.createElement('span'); probe.style.font = 'var(--type-heading)'; document.body.append(probe);
      const heading = getComputedStyle(probe).fontSize; probe.remove();
      const name = document.querySelector('.talk .speaker .n');
      return { heading, name: name && getComputedStyle(name).fontSize, inDialogue: !!name?.closest('.dialogue'),
        overPainting: document.querySelectorAll('.sitter :is(h1, .n, .r, .when)').length,
        sitter: box('.talk .sitter'), plate: box('.talk .sitter .plate'), seal: box('.talk .speaker .seal'),
        speaker: box('.talk .speaker'), first: box('.talk .lines .line') };
    });
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('the conversation page, composed', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-talk-composed-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const [width, height] of [[1280, 800], [820, 1180], [390, 844]] as const) {
    it(`with no painting and with one at ${width}`, async () => {
      const { page, driver, errors } = await MonoBrowser.page(browser, { width, height }, { site, query: '?world=a1' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]'); await driver.settle();
      // The wagoner on the causeway, whom no painting fits.
      await page.locator('ol.led [data-choice$="#talk"]').first().click(); await driver.settle();
      const plain = await Composed.read(page);
      expect([plain.inDialogue, plain.name, plain.overPainting]).toEqual([true, plain.heading, 0]);
      expect(plain.speaker!.y).toBeLessThan(plain.first!.y);
      if (width >= 1024) {
        // The plate in the middle of the likeness's column, not a hole beside the talk.
        const mid = plain.plate!.x + plain.plate!.w / 2, col = plain.sitter!.x + plain.sitter!.w / 2;
        expect(Math.abs(mid - col)).toBeLessThan(4);
        expect(plain.seal).toBeUndefined();
      } else {
        expect([plain.sitter, !!plain.seal]).toEqual([undefined, true]);
      }
      // Your brother at the camp, who has a painting: the painting holds no words.
      await page.keyboard.press('Escape'); await driver.settle();
      await page.locator('ol.led [data-choice]').filter({ hasText: 'camp at Millholm' }).first().click(); await driver.settle();
      await page.locator('ol.led [data-choice]').filter({ hasText: /Jankin/ }).first().click(); await driver.settle();
      const painted = await Composed.read(page);
      expect(await page.locator('.talk .sitter img').count()).toBe(1);
      expect([painted.inDialogue, painted.name, painted.overPainting, painted.seal]).toEqual([true, painted.heading, 0,
        undefined]);
      expect(errors).toEqual([]);
      await page.close();
    }, 180000);
  }
});
