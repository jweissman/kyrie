/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import { Rail } from './support/rail';

// Talk is reached from the resting scene by pointer and by key, at a desk and on a phone, with the lenses folded behind
// their diamond (OR-1084), which refuses presses until it is taken up. A builder's walk had timed out on a talk row
// after Rail.open (26 November); the walk below found every way through, and Rail.open now leaves a lens already open
// as it is, a second press on its mark having put it away. Who is shown on the painting stands clear of the place's
// name, its hour and the purse (at 390 the likeness had been drawn over the purse: nothing floats over text).
describe.skipIf(!process.env.KYRIE_BROWSER)('talk, from the resting scene', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-talk-reached-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  const talkRow = '[data-choice$="#talk"]';
  const begun = async (width: number, height: number, touch: boolean) => {
    const opened = await MonoBrowser.page(browser, { width, height }, { site, pointer: touch, query: '?world=a1' });
    await opened.page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await opened.page.click('[data-action="start"]'); await opened.driver.settle();
    return opened;
  };
  for (const [width, height, touch] of [[1280, 800, false], [390, 844, true]] as const) {
    it(`by the rail's talk lens and a likeness at ${width}`, async () => {
      const { page, driver, errors } = await begun(width, height, touch);
      expect(await page.locator(Rail.folded).count()).toBe(1);
      // Folded, the talk mark is not to be pressed unseen.
      expect(await page.locator('.rail-mark.opens-talk').evaluate(e => getComputedStyle(e).visibility)).toBe('hidden');
      await Rail.open(page, 'talk'); await driver.settle();
      await Rail.open(page, 'talk'); await driver.settle();
      expect(await page.locator('.rail-mark.opens-talk').getAttribute('aria-pressed')).toBe('true');
      const likeness = page.locator(`.surface .portraits ${talkRow}`).first();
      // Clear of the heading's words above it.
      const [face, head] = await Promise.all([likeness.boundingBox(),
        page.locator('.world-bar .title-block').boundingBox()]);
      expect(face!.y).toBeGreaterThanOrEqual(head!.y + head!.height - 1);
      if (touch) { await likeness.tap(); } else { await likeness.click(); }
      await driver.settle();
      expect((await driver.inspect()).mode).toBe('talk');
      expect(errors).toEqual([]);
    }, 120000);
    it(`by the menu's row, by its number, and by the arrows at ${width}`, async () => {
      for (const how of ['row', 'number', 'arrows'] as const) {
        const { page, driver } = await begun(width, height, touch);
        const row = page.locator(`ol.led > li:has(${talkRow})`).first();
        if (how === 'row') { await page.locator(`ol.led ${talkRow}`).first().click(); }
        if (how === 'number') { await page.keyboard.press((await row.getAttribute('data-promoted'))!); }
        if (how === 'arrows') {
          for (let i = 0; i < 6 && !await page.locator(`ol.led ${talkRow}[aria-current="true"]`).count(); i++) {
            await page.keyboard.press('ArrowDown'); await driver.settle();
          }
          await page.keyboard.press('Enter');
        }
        await driver.settle();
        expect(`${how}: ${(await driver.inspect()).mode}`).toBe(`${how}: talk`);
        await page.close();
      }
    }, 180000);
    it(`F takes the lenses up from the keys at ${width}`, async () => {
      const { page, driver } = await begun(width, height, touch);
      await page.keyboard.press('f'); await driver.settle();
      expect(await page.locator('.scene-rail.unfolded .opens-talk').evaluate(e => getComputedStyle(e).visibility))
        .toBe('visible');
      await page.close();
    }, 120000);
  }
});
