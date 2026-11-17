/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// What someone answers is read from its first words, whatever it brings with it (M22's second review, OR-40: Fox's
// reply to the letter had been pushed off the top of the conversation, "You know now" and "A new aim" whole beneath
// it). On a phone, Bask asked about the rats in the corn-store: her answer begins in view, its new aim under it.
describe.skipIf(!process.env.KYRIE_BROWSER)('an answer that brings an aim', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-reply-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it('is read from its first words on a phone', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 390, height: 844 },
      { site, pointer: false, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await driver.go('s2_green'); await driver.talk();
    await page.click('.surface .portraits [data-subject="region__s2_merchant"] .portrait'); await driver.settle();
    await driver.pick(c => /^Ask about the rats in the corn-store/.test(c.label), 'the rats');
    await page.waitForTimeout(400);
    const seen = await page.evaluate(() => {
      const box = document.querySelector('.dialogue .lines')!, lines = [...box.querySelectorAll('.line')];
      const you = lines.map(l => l.classList.contains('you')).lastIndexOf(true);
      const answer = lines.slice(you + 1).find(l => /\b(speech|telling|event)\b/.test(l.className));
      const top = box.getBoundingClientRect().top;
      // And the four in view whole beneath it: the record gives way, never the menu (a row had been cut in half).
      const choosing = document.querySelector('.dialogue .answer > .choosing')!;
      return { aim: lines.some(l => l.classList.contains('aim')), answered: !!answer,
        // below the fade over what was said before, where there is any above it (talk.css: 48 px)
        begins: !!answer && answer.getBoundingClientRect().top >= top + (box.scrollTop > 4 ? 47 : -1),
        whole: choosing.scrollHeight - choosing.clientHeight <= 1 };
    });
    expect(seen).toEqual({ aim: true, answered: true, begins: true, whole: true });
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
