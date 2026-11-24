/// <reference lib="dom" />
import type { Page } from 'playwright-core';
import { MonoDriver } from './mono-driver';

// Where each page draws its primary action menu (OR-305, the owner's cold play of 24 November: "the global page
// template owns the primary action menu's placement, layout and behaviour; no screen decides it for itself"). The
// menu is the page's one [data-menu] in view that holds rows; its place is the box of its visible rows, named by the
// side of the screen it stands on and the band it ends in, so that two pages drawing it alike read as one placement.
export interface Placed {
  surface: string; side: 'left' | 'centre' | 'right'; band: 'top' | 'middle' | 'bottom';
  box: { x: number; y: number; width: number; height: number };
}
export class MenuPlacement {
  static name(p: Placed): string { return `${p.side}-${p.band}`; }
  // The distinct columns the menus stand in: two menus whose rows begin and end within a few pixels of each other's
  // stand in one; each column named by the surfaces in it.
  static columns(placed: Placed[], within = 4): string[][] {
    const columns: { x: number; right: number; surfaces: string[] }[] = [];
    for (const p of placed) {
      const right = p.box.x + p.box.width;
      const at = columns.find(c => Math.abs(c.x - p.box.x) <= within && Math.abs(c.right - right) <= within);
      if (at) { at.surfaces.push(p.surface); } else { columns.push({ x: p.box.x, right, surfaces: [p.surface] }); }
    }
    return columns.map(c => c.surfaces);
  }
  static of(page: Page, surface: string): Promise<Placed | undefined> {
    return page.evaluate(surface => {
      const W = innerWidth, H = innerHeight;
      const menus = Array.from(document.querySelectorAll('[data-menu]')).filter(m =>
        !m.parentElement?.closest('[data-menu]') && !m.closest('[aria-hidden="true"]'));
      const rows = menus.flatMap(m => Array.from(m.querySelectorAll('.choice-row, [data-act], button')))
        .map(e => e.getBoundingClientRect()).filter(r => r.width > 2 && r.height > 2 && r.bottom > 0 && r.top < H
          && r.right > 0 && r.left < W);
      if (!rows.length) { return undefined; }
      const x = Math.min(...rows.map(r => r.left)), y = Math.min(...rows.map(r => r.top));
      const right = Math.max(...rows.map(r => r.right)), bottom = Math.max(...rows.map(r => r.bottom));
      const mid = (x + right) / 2;
      // A menu across most of a narrow screen stands in its middle, whatever its edges.
      const side = right - x > W * 0.8 ? 'centre' : mid < W * 0.42 ? 'left' : mid > W * 0.58 ? 'right' : 'centre';
      const band = bottom > H * 0.7 ? 'bottom' : y < H * 0.3 && bottom < H * 0.6 ? 'top' : 'middle';
      return { surface, side, band, box: { x, y, width: right - x, height: bottom - y } } as const;
    }, surface);
  }
  // The pages a player meets, from the title to the Book: the title, how a life begins, a step of a life, the scene,
  // its lenses, someone talked to, the map, the Book and the game's Options; each page's menu where it stands.
  // shots: a folder each page is photographed into as it is measured, for whoever looks.
  static async walk(page: Page, site: string, shots?: string): Promise<Placed[]> {
    const found: Placed[] = [], d = new MonoDriver(page), at = async (s: string) => {
      await page.waitForTimeout(700);
      if (shots) { await page.screenshot({ path: `${shots}/${s.replace(':', '-')}-${page.viewportSize()?.width}.png` }); }
      const placed = await MenuPlacement.of(page, s);
      if (placed) { found.push(placed); }
    };
    await page.goto(`file://${site}/mono.html`); await page.waitForSelector('[data-action="begin"]'); await at('title');
    await MonoDriver.enter(page, '[data-action="begin"]'); await page.waitForSelector('[data-mode="begin"]');
    await at('begin');
    await page.goto(`file://${site}/mono.html?world=kite`); await page.waitForSelector('[data-mode="create"]');
    await at('creation');
    await page.goto(`file://${site}/mono.html?world=a1`); await page.waitForSelector('[data-mode="create"]');
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 }); await d.settle();
    await at('scene');
    for (const part of ['talk', 'go']) {
      const mark = page.locator(`.rail-mark.opens-${part}`);
      if (!await mark.count() || !await mark.isEnabled()) { continue; }
      await mark.click(); await d.settle(); await at(`lens:${part}`); await page.keyboard.press('Escape'); await d.settle();
    }
    const talk = page.locator('[data-act$="#talk"]').first();
    if (await talk.count()) { await talk.click(); await d.settle(); await at('talk'); await d.away(); }
    for (const [label, s] of [['The map', 'map'], ['Your book', 'book']] as const) {
      const mark = page.locator(`.rail-mark[aria-label="${label}"]`);
      if (!await mark.count()) { continue; }
      await mark.click(); await d.settle(); await page.waitForTimeout(1200); await at(s);
      if (s === 'book') {
        await page.click('[data-action="options"]'); await page.waitForSelector('[data-mode="options"]'); await at('options');
        await page.click('.options-page [data-action="back"]');
      } else { await page.keyboard.press('Escape'); }
      await d.settle();
    }
    return found;
  }
}
