/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// Play is held to the screen (Mission 17's commission, IV): the whole page never scrolls, at a desktop's size or a
// phone's, and what is long scrolls within its own leaf. In a town of many people each is one control, with what they
// are doing beside them (a town square had named each of its people twice: the play-structure investigation's PT-09);
// a conversation keeps its leave-taking in view however long it runs (an instrumented session spent four of its ten
// scrolls reaching it: PT-42); who is here comes before the rest of the telling (M17-05). Opt in with KYRIE_BROWSER=1.
class Frame {
  // Each person turned to by their own choice, and how many controls on the page offer it.
  static async people(page: Page): Promise<Record<string, number>> {
    return page.evaluate(() => {
      const ids = Array.from(document.querySelectorAll('.cast .act.plate'), b => b.getAttribute('data-choice') ?? '');
      const all = Array.from(document.querySelectorAll('[data-choice]'), b => b.getAttribute('data-choice'));
      return Object.fromEntries(ids.map(id => [id, all.filter(x => x === id).length]));
    });
  }
  // Whether one thing is set above another on the page (on a phone's one column, before it).
  static above(page: Page, first: string, second: string): Promise<boolean> {
    return page.evaluate(([a, b]) => document.querySelector(a!)!.getBoundingClientRect().top
      < document.querySelector(b!)!.getBoundingClientRect().top, [first, second]);
  }
  static inView(page: Page, selector: string): Promise<boolean> {
    return page.locator(selector).evaluate(e => {
      const r = e.getBoundingClientRect();
      return r.top >= 0 && r.bottom <= innerHeight && r.width > 0;
    });
  }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('play held to the screen', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-frame-'));
    await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1440, 900], [390, 844]])('at %i by %i: never scrolls the page, names each person once, keeps leave in view',
    async (width, height) => {
      const { page, errors, driver } = await MonoBrowser.page(browser, { width, height },
        { site, pointer: width < 500, query: '?world=kite' });
      await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
      await page.click('[data-action="start"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
      expect((await MonoBrowser.metrics(page)).scroll).toBe(false);
      await driver.pick(c => /^To the bridge-foot/.test(c.label), 'the bridge-foot');
      expect((await MonoBrowser.metrics(page)).scroll).toBe(false);
      const people = await Frame.people(page);
      expect(Object.keys(people).length).toBeGreaterThan(2);
      expect(Object.values(people).every(n => n === 1)).toBe(true);
      // Who is here comes after the place's first paragraph, a phone's too, not under the whole telling (M17-05).
      expect(await Frame.above(page, '.cast .plates > li', '.telling .establish > p:nth-child(2)')).toBe(true);
      // Turned to someone: the conversation's leave-taking is on the screen, and still is after a question.
      await driver.pick(c => /#talk$/.test(c.id) && /brother|drover__son/i.test(c.label + c.id), 'your brother');
      expect((await driver.inspect()).mode).toBe('talk');
      expect(await Frame.inView(page, '.dialogue .leave .act')).toBe(true);
      await driver.pick(c => /^Ask what he means/.test(c.label), 'what he means to do');
      expect([(await MonoBrowser.metrics(page)).scroll, await Frame.inView(page, '.dialogue .leave .act')])
        .toEqual([false, true]);
      // A book is a page of its own under the head, scrolled within itself.
      await driver.back();
      await driver.mode('c');
      expect([(await driver.inspect()).mode, (await MonoBrowser.metrics(page)).scroll]).toEqual(['party', false]);
      expect(errors).toEqual([]);
      await page.close();
    }, 240000);
  // On an upright tablet a person's painting takes what the conversation leaves, and the conversation stands at the
  // foot of the page: neither the lower half left empty (M17-44) nor the words said squeezed out by eleven replies.
  it('at 820 by 1180: sits a conversation at the foot of the page, its words and its leave in view', async () => {
    const { page, errors, driver } = await MonoBrowser.page(browser, { width: 820, height: 1180 },
      { site, pointer: true, query: '?world=kite' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.pick(c => /^To the bridge-foot/.test(c.label), 'the bridge-foot');
    await driver.pick(c => /^Into the Merry Sun/.test(c.label), 'the inn');
    await driver.pick(c => /#talk$/.test(c.id) && /Aspen/.test(c.label), 'the innkeeper');
    const talk = await page.evaluate(() => {
      const d = document.querySelector('.dialogue')!.getBoundingClientRect(), l = document.querySelector('.dialogue .lines')!;
      return { foot: innerHeight - d.bottom < 40, said: l.scrollHeight - l.clientHeight <= 1,
        replies: document.querySelectorAll('.dialogue .replies li').length > 8 };
    });
    expect([talk, await Frame.inView(page, '.dialogue .leave .act')])
      .toEqual([{ foot: true, said: true, replies: true }, true]);
    expect(errors).toEqual([]);
    await page.close();
  }, 240000);
});
