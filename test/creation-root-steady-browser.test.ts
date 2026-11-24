/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// FM-01 (the owner's cold play, 17 November: during ancestry selection "the entire page appeared to fade out and then
// flash back into view"). From one step of creation to the next the page is the same page: its root (#page) is the
// node it was, and neither it nor anything over it is ever drawn below full opacity. Sampled at every frame the page
// draws from the press until the next step has stood a moment, at a desk and on a phone.
class Root {
  // Watch every frame from now: whether #page is the node it was when the watch began, and the least opacity it was
  // drawn at (its own, times every element's over it).
  static watch(page: Page) {
    return page.evaluate(() => {
      const w = window as unknown as { rootWatch: { frames: number; lost: number; least: number; stop: boolean } };
      const root = document.getElementById('page');
      w.rootWatch = { frames: 0, lost: 0, least: 1, stop: false };
      const frame = () => {
        const now = document.getElementById('page'), seen = w.rootWatch;
        seen.frames++;
        if (!now || now !== root || !root.isConnected) { seen.lost++; } else {
          let o = 1;
          for (let e: Element | null = now; e; e = e.parentElement) { o *= Number(getComputedStyle(e).opacity); }
          seen.least = Math.min(seen.least, o);
        }
        if (!seen.stop) { requestAnimationFrame(frame); }
      };
      requestAnimationFrame(frame);
    });
  }
  static stop(page: Page) {
    return page.evaluate(() => {
      const w = window as unknown as { rootWatch: { frames: number; lost: number; least: number; stop: boolean } };
      w.rootWatch.stop = true;
      return { frames: w.rootWatch.frames, lost: w.rootWatch.lost, least: Math.round(w.rootWatch.least * 1000) / 1000 };
    });
  }
  static at(page: Page) { return page.getAttribute('.creation', 'data-page'); }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('creation keeps its page from step to step (FM-01)', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-creation-root-'));
    await SiteBuild.site(site);
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });

  it.each([[1280, 800, 'mouse'], [390, 844, 'touch']] as const)('at %ix%i by %s', async (width, height, by) => {
    const touch = by === 'touch';
    const { page, errors, driver: d } = await MonoBrowser.page(browser, { width, height },
      { site, pointer: touch, query: '' });
    await page.waitForSelector('[data-action="begin"]', { state: 'visible', timeout: 60000 });
    await d.click('[data-action="begin"]');
    await page.waitForSelector('[data-mode="begin"]', { timeout: 30000 });
    await d.click('[data-action="build"]');
    await page.waitForSelector('.creation[data-page="you"]', { timeout: 120000 });
    await page.waitForTimeout(800);
    // Each step's first option pressed, the page watched until the next has stood a moment; from the ancestry on to
    // setting out, or as far as a press goes on (a step of many holds the page).
    const passed: string[] = [], faults: string[] = [];
    for (let k = 0; k < 12; k++) {
      const was = await Root.at(page);
      if (!was || was === 'go') { break; }
      const first = page.locator('.composed-rows [data-option]:not([data-option="more"]):not(:disabled)').first();
      await Root.watch(page);
      await (touch ? first.tap() : first.click());
      const on = await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p,
        was, { timeout: 4000 }).then(() => true, () => false);
      await page.waitForTimeout(700);
      const seen = await Root.stop(page);
      if (!on) { break; }
      passed.push(was);
      if (seen.lost || seen.least < 1) { faults.push(`${was}: root replaced in ${seen.lost} of ${seen.frames} frames, least opacity ${seen.least}`); }
    }
    expect(passed.slice(0, 4)).toEqual(['you', 'presenting', 'sign', 'calling']);
    console.log(`  ${by}: ${passed.join(' → ')} → ${await Root.at(page)}`);
    expect(faults).toEqual([]);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
