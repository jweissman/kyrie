/// <reference lib="dom" />
import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from './support/mono-browser';

// The studio's mark plays whole unless it is skipped on purpose (the owner, 17 November: the title had cut it short).
// Served as Pages serves it, its stylesheets slow to come (the mark first painted late, while the script is already
// in), it is never put away before it has played to its end; a stray click does not skip it; held at its Skip, it
// gives way at once to a title ready to use, and nothing on the title is pressed by that hold.
class Mark {
  // How far the early mark had played when it was put away, by its own animations.
  static readonly watch = () => {
    const w = window as unknown as { __cut?: number };
    new MutationObserver(() => {
      const el = document.getElementById('pre-ident') as (HTMLElement & { __watched?: true }) | null;
      if (!el || el.__watched) { return; }
      el.__watched = true;
      const remove = el.remove.bind(el);
      el.remove = () => {
        w.__cut = Math.max(0, ...el.getAnimations({ subtree: true }).map(a => Number(a.currentTime ?? 0)));
        remove();
      };
    }).observe(document, { childList: true, subtree: true });
  };
  static async open(browser: Awaited<ReturnType<typeof MonoBrowser.launch>>, url: string) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    await page.route('**/*.css', async route => { await new Promise(r => setTimeout(r, 900)); await route.continue(); });
    await page.addInitScript(`(${Mark.watch.toString()})()`);
    await page.goto(`${url}?ident`);
    return { context, page };
  }
  static cut(page: Page) { return page.evaluate(() => (window as unknown as { __cut?: number }).__cut); }
}

describe.skipIf(!process.env.KYRIE_BROWSER)('the studio\'s mark', () => {
  let site = '', browser: Awaited<ReturnType<typeof MonoBrowser.launch>>, server: ReturnType<typeof Bun.serve>;
  beforeAll(async () => {
    site = await mkdtemp(join(tmpdir(), 'kyrie-stab-'));
    await SiteBuild.site(site, {});
    server = Bun.serve({ port: 0, fetch: r => SiteBuild.serve(site, r) });
    browser = await MonoBrowser.launch();
  }, 300000);
  afterAll(async () => {
    await browser?.close(); server?.stop(true); await rm(site, { recursive: true, force: true });
  });

  it('plays to its end before the title, though it was painted late', async () => {
    const { context, page } = await Mark.open(browser, `http://localhost:${server.port}/mono.html`);
    await page.waitForSelector('[data-action="begin"]', { timeout: 60000 });
    expect(await Mark.cut(page)).toBeGreaterThanOrEqual(2750);
    await context.close();
  }, 120000);

  it('is not skipped by a stray click, and held at Skip gives way to a title ready to use', async () => {
    const { context, page } = await Mark.open(browser, `http://localhost:${server.port}/mono.html`);
    await page.waitForSelector('.skip-mark', { timeout: 30000 });
    // A click where New game will stand: the mark plays on.
    await page.mouse.click(640, 446); await page.waitForTimeout(150);
    expect(await page.locator('.skip-mark').count()).toBe(1);
    const b = (await page.locator('.skip-mark').boundingBox())!;
    await page.mouse.move(b.x + b.width / 2, b.y + b.height / 2); await page.mouse.down();
    await page.waitForTimeout(700); await page.mouse.up();
    await page.waitForSelector('[data-action="begin"]', { timeout: 2000 });
    expect(await page.locator('.skip-mark').count()).toBe(0);
    await page.waitForTimeout(500);
    expect(await page.locator('[data-mode="create"]').count()).toBe(0);
    await context.close();
  }, 120000);
});
