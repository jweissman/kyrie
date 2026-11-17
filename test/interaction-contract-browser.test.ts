/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// One action system (the owner, 15 November): every control that changes the game references an action identity in
// the observation now (kyrieMono.inspect().observed), and no executable control stands outside it. Controls that only
// move attention or open a page are presentation (PRESENTATION below); anything else, without an observed identity, is
// a bypass, and fails here. KNOWN is the ratchet: controls still independently implemented, named so that no new one
// joins them, and to be emptied (it may only shrink).
interface Control { act: string | null; action: string | null; text: string }
class Census {
  static readonly presentation = new Set(['lens', 'lens-page', 'back', 'back-to-place', 'back-to-map', 'book', 'mode',
    'close', 'more-told', 'journey', 'map-nearer', 'map-further', 'map-here', 'map-place', 'map-unchoose', 'dismiss',
    'help', 'sheet', 'tab', 'details', 'unfold', 'explore', 'export', 'title', 'put-away-map', 'consider-aim']);
  // Independently implemented controls still standing, named so that no new one joins them; it may only shrink.
  static readonly known: string[] = [];
  static async controls(page: Page): Promise<{ controls: Control[]; observed: string[] }> {
    return page.evaluate(() => {
      const seen = (e: Element) => (e as HTMLElement).offsetParent !== null && !(e as HTMLButtonElement).disabled;
      const controls = [...document.querySelectorAll('button, a[href], [role="button"]')].filter(seen).map(e => ({
        act: e.getAttribute('data-act'), action: e.getAttribute('data-action'),
        text: (e as HTMLElement).innerText.replace(/\s+/g, ' ').trim().slice(0, 40) }));
      const mono = (window as unknown as { kyrieMono: { inspect(): { observed?: string[] } } }).kyrieMono;
      return { controls, observed: mono.inspect().observed ?? [] };
    });
  }
  // The controls that bypass: an act not in the observation, or a gameplay control (not presentation) with no act.
  static async bypassing(page: Page): Promise<string[]> {
    const { controls, observed } = await this.controls(page), have = new Set(observed);
    return controls.flatMap(c => {
      if (c.act) { return have.has(c.act) ? [] : [`act ${c.act} not observed (${c.text})`]; }
      return c.action && this.presentation.has(c.action) ? [] : [`${c.action ?? 'control'} has no action (${c.text})`];
    });
  }
}
describe.skipIf(!process.env.KYRIE_BROWSER)('every control references the observation', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>;
  beforeAll(async () => { site = await mkdtemp(join(tmpdir(), 'kyrie-contract-')); await SiteBuild.site(site, {}); browser = await MonoBrowser.launch(); }, 300000);
  afterAll(async () => { await browser?.close(); await rm(site, { recursive: true, force: true }); });
  it('holds in the scene, a talk, the map and the notes', async () => {
    const { page, driver, errors } = await MonoBrowser.page(browser, { width: 1280, height: 800 },
      { site, pointer: true, query: '?world=a1' });
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 60000 });
    await driver.settle();
    const found: Record<string, string[]> = { scene: await Census.bypassing(page) };
    await driver.mode('m'); await driver.settle();
    found.map = await Census.bypassing(page);
    await driver.mode('j'); await driver.settle();
    found.notes = await Census.bypassing(page);
    const all = Object.values(found).flat();
    expect(all.filter(x => !Census.known.some(k => x.includes(k)))).toEqual([]);
    expect(errors).toEqual([]);
    // And it sees a bypass when there is one: a control made for a screen's need, and a stale act.
    await driver.mode('m'); await driver.settle();
    await page.evaluate(() => {
      const mk = (attrs: Record<string, string>) => {
        const b = document.createElement('button'); b.textContent = 'x';
        for (const [k, v] of Object.entries(attrs)) { b.setAttribute(k, v); }
        document.body.append(b);
      };
      mk({ 'data-action': 'go-there-now' }); mk({ 'data-act': 'follow:no-such-aim' });
    });
    const caught = await Census.bypassing(page);
    expect(caught.some(c => c.startsWith('go-there-now has no action'))).toBe(true);
    expect(caught.some(c => c.includes('follow:no-such-aim not observed'))).toBe(true);
  }, 300000);
});
