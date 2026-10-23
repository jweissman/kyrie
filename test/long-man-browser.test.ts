/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';
import type { MonoDriver } from './support/mono-driver';

// The Long Man as a player meets it, at a desk and on a phone: what the acceptance pass found wrong, kept from coming
// back. A campaign that is not there says so; a thing is bought by speaking to whoever sells it, and the buying is
// said in the conversation, with the leave-taking told back in the place; the keys show where they are and a tap
// lights nothing; what you carry opens in place of what is here; and a
// creature that warns, then comes, is told once each time, in its own words. Opt in with KYRIE_BROWSER=1.
class Merrow {
  static text(page: Page) { return page.evaluate(() => document.body.innerText); }
  static count(text: string, phrase: string) { return text.split(phrase).length - 1; }
  static async act(d: MonoDriver, ...labels: string[]) {
    for (const label of labels) {
      for (const part of label.split(' › ')) {
        const re = new RegExp(part, 'i');
        await d.pick(c => re.test(c.label), part);
      }
    }
  }
  static highlighted(page: Page) { return page.locator('.act.sel').count(); }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('The Long Man in the browser', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-merrow-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900, false], [390, 844, true]] as const)('at %ix%i', async (width, height, pointer) => {
    const missing = await MonoBrowser.page(browser, { width, height }, { site, pointer, query: '?campaign=nowhere' });
    expect(await missing.page.textContent('[data-id="error"]', { timeout: 20000 })).toContain('There is no campaign');
    await missing.page.close();

    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer, query: '?campaign=the-long-man' });
    await page.waitForSelector('[data-action="start"]');
    await d.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await Merrow.act(d, '^To Merrow green', '^Into the Drowned Ox', '^Talk to Martin', '^Buy › ^A torch');
    // A bought torch goes to whoever already carries one: Bran, the warrior, who set out with one; and it is bought
    // across the counter, in the conversation.
    expect((await d.inspect()).mode).toBe('talk');
    expect(await page.locator('.line.you').last().textContent()).toBe('Buy a torch for Bran');
    expect(await page.textContent('.lines')).toContain('takes a torch');
    // The keys show where they are; a finger leaves nothing lit.
    expect(await Merrow.highlighted(page)).toBe(pointer ? 0 : 1);
    await d.mode('i');
    expect(await page.locator('.sheet.view-pack:visible').count()).toBe(1);
    expect(await page.locator('.intentions [data-action="choice"]:visible').count()).toBeGreaterThan(3);
    await d.mode('i');
    await d.away();
    expect(await page.textContent('[data-id="response"]')).toBeTruthy();
    await Merrow.act(d, '^Out to Merrow green', '^To the Hall yard', '^Into the Hall cellar', '^Search here',
      'lift the oak bar', '^To the grey gallery', 'light a torch', '^To the wet gallery');
    expect(Merrow.count(await Merrow.text(page), 'the floor heaves')).toBe(1);
    expect((await d.inspect()).mode).toBe('explore');
    for (let i = 0; i < 4 && (await d.inspect()).mode !== 'combat'; i++) { await Merrow.act(d, '^Wait › ^A while'); }
    expect((await d.inspect()).mode).toBe('combat');
    const fight = await Merrow.text(page);
    expect([Merrow.count(fight, 'faster than mud should'), Merrow.count(fight, 'comes at you!')]).toEqual([1, 0]);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
