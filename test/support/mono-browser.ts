/// <reference lib="dom" />
import { chromium, type Page } from 'playwright-core';
import { join, resolve } from 'node:path';
import { MonoDriver } from './mono-driver';

// Opens the built Mono client in a real browser for tests and recorders. Requires `bun run web:build` and a
// Playwright Chromium (KYRIE_CHROMIUM may name the executable).
export class MonoBrowser {
  static async launch() {
    return chromium.launch(process.env.KYRIE_CHROMIUM ? { executablePath: process.env.KYRIE_CHROMIUM } : {});
  }
  static async page(browser: Awaited<ReturnType<typeof MonoBrowser.launch>>, size: { width: number; height: number },
    options: { site?: string; pointer?: boolean; query: string }) {
    const page = await browser.newPage({ viewport: size, ...(options.pointer ? { hasTouch: true } : {}) });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`file://${join(options.site ?? resolve(import.meta.dir, '../../site'), 'mono.html')}${options.query}`);
    await page.evaluate(() => { try { localStorage.clear(); } catch { /* file:// may refuse storage */ } });
    await page.reload();
    return { page, errors, driver: new MonoDriver(page, options.pointer) };
  }
  static async metrics(page: Page) {
    return page.evaluate(() => {
      const doc = document.documentElement;
      const panes = Array.from(document.querySelectorAll('.pane')).map(p => p.getBoundingClientRect());
      const area = panes.reduce((sum, r) => sum + r.width * r.height, 0);
      return { scroll: doc.scrollHeight > innerHeight || doc.scrollWidth > innerWidth,
        paneCoverage: Math.round((area / (innerWidth * innerHeight)) * 100),
        visibleRows: document.querySelectorAll('.row').length, words: document.body.innerText.split(/\s+/).length };
    });
  }
}
