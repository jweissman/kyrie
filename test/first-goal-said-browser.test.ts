/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The first goal is said on screen once, whatever way the opening is left (the second blind playtest, BL-04: "Your
// first goal" was in the page's text but drawn on no screen in either run, found only in the book). Read through, the
// opening's last page says it and the first place does not again; gone straight past (Esc), the first place says it.
class Opening {
  static async play(page: Page, skip: boolean) {
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('.prologue-page', { timeout: 120000 });
    if (skip) { await page.keyboard.press('Escape'); }
    let onward = '';
    for (let i = 0; i < 40 && await page.locator('.prologue-page').count(); i++) {
      const meeting = page.locator('.page-meeting [data-act], .page-meeting button').first();
      if (await page.locator('.page-meeting').count() && await meeting.count()) { await meeting.click(); }
      else {
        onward ||= await page.locator('[data-id="onward"] .first-aim').innerText().catch(() => '');
        await page.keyboard.press('Enter');
      }
      await page.waitForTimeout(700);
    }
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    const here = await page.locator('[data-id="goal"]').isVisible().catch(() => false);
    return { onward: /first goal/i.test(onward), here };
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('the first goal', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-first-goal-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const skip of [false, true]) {
    it(`is said once on screen, the opening ${skip ? 'gone past' : 'read through'}`, async () => {
      const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, pointer: false,
        query: '?world=b2&opening' });
      const said = await Opening.play(page, skip);
      expect(said).toEqual(skip ? { onward: false, here: true } : { onward: true, here: false });
      expect(errors).toEqual([]);
    }, 300000);
  }
});
