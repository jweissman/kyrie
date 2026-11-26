/// <reference lib="dom" />
// The way into the first scene is one painting and one fade, nothing seen and then taken away (OR-1123, the owner's,
// reported more than once: "clearly I saw it and then it disappeared and did a slow fade-in, some kind of race
// condition"; OR-77 had fixed the passage once). Recorded frame by frame in the page, at a desk's size and a phone's,
// as a player meets it (?opening: automation is otherwise spared the opening): a life set out on at once, the opening
// read through, and the first scene; and a kept life taken up by Continue. Every animation frame from the press, the
// painting behind (the ambient's plate and its opacity) and the page drawn over it. Held:
//   - from the opening's first page to the first scene, one painting behind it, which once up never goes down;
//   - the first scene comes up on its own painting at once, which then stays: no way in under it first, no dissolve;
//   - nothing of the first scene is shown, then hidden, then shown again.
// It failed on main as it stood (a40864ed5 and after): Set out now's rise read the page's state before React had taken
// up what it set, so the opening's words stood on the dark and their painting rose under them; the opening then put
// that painting away for another; and the first scene came up over the way in and dissolved to its own over four
// seconds. Opt in with KYRIE_BROWSER=1.
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

interface Sample { t: number; plate: string; up: number; was: boolean; page: string; scene: number }
class Passage {
  // Every animation frame for so long: the plate behind, how far up it is, whether another dissolves over it, which
  // page is drawn (prologue, world or another) and how visible the scene's own page is.
  static record(page: Page): Promise<void> {
    return page.evaluate(() => {
      const w = window as unknown as { passage: Sample[] }, t0 = performance.now();
      w.passage = [];
      const tick = () => {
        const amb = document.querySelector<HTMLElement>('.ambient:not(.ambient-was)');
        const id = document.getElementById('page'), world = document.querySelector<HTMLElement>('.world-page');
        const style = amb ? getComputedStyle(amb) : undefined;
        w.passage.push({ t: performance.now() - t0, plate: style?.getPropertyValue('--plate').trim() || 'none',
          up: amb && !amb.classList.contains('unpainted') ? Number(style!.opacity) : 0,
          was: !!document.querySelector('.ambient-was'),
          page: id?.classList.contains('prologue-page') ? 'prologue' : world ? 'world' : id ? 'other' : 'none',
          scene: world ? Number(getComputedStyle(world).opacity) * (getComputedStyle(world).visibility === 'hidden' ? 0 : 1)
            : 0 });
        if (performance.now() - t0 < 60000) { requestAnimationFrame(tick); }
      };
      requestAnimationFrame(tick);
    });
  }
  static async samples(page: Page): Promise<Sample[]> {
    return page.evaluate(() => (window as unknown as { passage: Sample[] }).passage);
  }
  // From the first frame a page is drawn to the end: the plates seen in order, each once.
  static plates(s: Sample[]): string[] {
    return s.map(x => x.plate).filter((p, i, all) => p !== 'none' && p !== all[i - 1]);
  }
  // Whether a value once at its height falls again (a painting put down, a scene hidden).
  static fell(values: number[]): boolean {
    let high = 0;
    for (const v of values) { if (high > 0.95 && v < 0.5) { return true; } high = Math.max(high, v); }
    return false;
  }
  // The opening read on: a meeting on the road answered by its first answer, any other page gone on from.
  static async on(page: Page): Promise<void> {
    await page.keyboard.press(await page.locator('[data-action="answer"]').count() ? '1' : 'Enter');
  }
  // The first scene as it came up: its samples, from its first frame.
  static scene(s: Sample[]): Sample[] { return s.slice(s.findIndex(x => x.page === 'world')); }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the way into the first scene', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-first-scene-')); await SiteBuild.site(site, {});
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  for (const size of [{ width: 1280, height: 800 }, { width: 390, height: 844 }]) {
    it(`is one painting and one fade from a life set out on at once, at ${size.width}×${size.height}`, async () => {
      const { page, errors } = await MonoBrowser.page(browser, size, { site, query: '?opening' });
      await page.waitForSelector('[data-action="begin"]', { timeout: 120000 });
      await page.click('[data-action="begin"]');
      await page.waitForSelector('[data-action="set-out-now"]');
      await Passage.record(page);
      await page.click('[data-action="set-out-now"]');
      await page.waitForSelector('[data-mode="prologue"]', { timeout: 120000 });
      for (let i = 0; i < 12 && !await page.locator('[data-mode="explore"]').count(); i++) {
        await page.waitForTimeout(2600); await Passage.on(page);
      }
      await page.waitForSelector('[data-mode="explore"]', { timeout: 30000 });
      await page.waitForTimeout(2500);
      const s = await Passage.samples(page), opening = s.filter(x => x.page === 'prologue');
      // The opening: one painting behind it, from its first page to its last, never put down once up.
      expect(new Set(opening.map(x => x.plate)).size).toBe(1);
      expect(opening.some(x => x.was)).toBe(false);
      expect(Passage.fell(s.slice(0, s.findIndex(x => x.page === 'world')).map(x => x.up))).toBe(false);
      // The first scene: on its own painting from its first frame, which stays, with no dissolve over it.
      const scene = Passage.scene(s);
      expect(new Set(scene.map(x => x.plate)).size).toBe(1);
      expect(scene.some(x => x.was)).toBe(false);
      expect(Passage.fell(scene.map(x => x.scene))).toBe(false);
      expect(errors).toEqual([]);
      await page.close();
    }, 300000);
  }
  it('is one fade from a kept life taken up by Continue', async () => {
    const { page, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 }, { site, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    await page.waitForTimeout(3000);
    await page.goto(`${page.url().split('?')[0]!}?opening`);
    await page.waitForSelector('[data-action="continue"]', { timeout: 60000 });
    await Passage.record(page);
    await page.click('[data-action="continue"]');
    // A life kept before anything was done in it takes up its opening again (ReaderOpening.resume): read through.
    for (let i = 0; i < 12 && !await page.locator('.world-page').count(); i++) {
      await page.waitForTimeout(2600);
      if (await page.locator('[data-mode="prologue"]').count()) { await Passage.on(page); }
    }
    await page.waitForSelector('.world-page', { timeout: 30000 });
    await page.waitForTimeout(2500);
    const scene = Passage.scene(await Passage.samples(page));
    expect(Passage.plates(scene).length).toBeLessThanOrEqual(1);
    expect(scene.some(x => x.was)).toBe(false);
    expect(Passage.fell(scene.map(x => x.scene))).toBe(false);
    expect(Passage.fell(scene.map(x => x.up))).toBe(false);
    expect(errors).toEqual([]);
    await page.close();
  }, 300000);
});
