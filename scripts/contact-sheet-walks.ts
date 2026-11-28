/// <reference lib="dom" />
import { join } from 'node:path';
import type { Browser, Page } from 'playwright-core';
import { MonoBrowser } from '../test/support/mono-browser';
import { MonoDriver } from '../test/support/mono-driver';
import { SheetCamera, type SheetMiss, type SheetShot } from './contact-sheet-camera';

// reduced: the pages opened as for a player who asks for less motion (prefers-reduced-motion; S3-R2, TO-03).
export interface SheetRun { browser: Browser; site: string; out: string; size: { width: number; height: number };
  shots: SheetShot[]; misses: SheetMiss[]; reduced?: boolean }

// The walks before play (see scripts/contact-sheets.ts): the title and its ways in, how a new game begins, the
// options (the handbooks are no longer theirs, OR-143: the books walk pictures them, OR-509); the encyclopedia; and a
// life built step by step in a1, a mage so that the first spells' page is among them, every page of the making
// pictured before it is chosen.
export class SheetWalks {
  static label(run: SheetRun): string { return `${run.size.width}x${run.size.height}${run.reduced ? '-reduced' : ''}`; }
  static camera(run: SheetRun, page: Page, walk: string, driver?: MonoDriver): SheetCamera {
    return new SheetCamera(page, driver, { out: run.out, size: SheetWalks.label(run), walk, shots: run.shots,
      misses: run.misses });
  }
  static async title(run: SheetRun): Promise<void> {
    const { page } = await MonoBrowser.page(run.browser, run.size, { site: run.site, query: '', reduced: run.reduced });
    page.setDefaultTimeout(30000);
    const cam = SheetWalks.camera(run, page, 'title');
    await cam.step('title', 'The title and its ways in', () => page.waitForSelector('.beat-ready'));
    await cam.step('begin', 'New game: how the game begins', async () => {
      await page.focus('[data-action="begin"]');
      await page.keyboard.down('Enter'); await page.waitForTimeout(900); await page.keyboard.up('Enter');
      await page.waitForSelector('[data-mode="begin"]');
    });
    await cam.step('options', 'Options, on the folio', async () => {
      await page.keyboard.press('Escape');
      await page.click('[data-action="options"]');
      await page.waitForSelector('[data-mode="options"]');
    });
    await cam.step('quit', 'Quit: the game put away', async () => {
      await page.click('.options-page [data-action="back"]');
      await page.click('[data-action="quit"]');
      await page.waitForSelector('[data-mode="closed"]');
    });
    await page.close();
  }
  // The backstage with a life kept (OR-1073): a life set out on at once in a1, the Book's pages on the folio, the game
  // paused for its Options there, then Return to title, where Continue now leads, and New Game with its World row.
  static async kept(run: SheetRun): Promise<void> {
    const { page, driver } = await MonoBrowser.page(run.browser, run.size, { site: run.site, query: '?world=a1', reduced: run.reduced });
    page.setDefaultTimeout(30000);
    const cam = SheetWalks.camera(run, page, 'kept', driver);
    await page.waitForSelector('[data-mode="create"]', { timeout: 120000 });
    await page.click('[data-action="start"]');
    await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    // The notes last: the game is paused from their foot (Sheet's Options).
    for (const [key, name, said] of [['c', 'character', 'The Book: character'], ['i', 'pack', 'The Book: pack'],
      ['h', 'story', 'The Book: story'], ['j', 'notes', 'The Book: notes']] as const) {
      await cam.step(name, said, () => driver.mode(key));
    }
    await cam.step('paused', 'Options, the game paused', async () => {
      await page.click('[data-action="options"]');
      await page.waitForSelector('[data-mode="options"]');
    });
    await cam.step('title-kept', 'The title, a life kept', async () => {
      await page.click('.options-page [data-action="title"]');
      await page.waitForSelector('[data-action="continue"]');
    });
    await cam.step('new-game-kept', 'New Game, a game kept', async () => {
      await page.click('[data-action="begin"]');
      await page.waitForSelector('[data-mode="begin"] [data-action="build"]');
    });
    await page.close();
  }
  // The pages beside the game: the encyclopedia and the three handbooks, as they open.
  static async books(run: SheetRun): Promise<void> {
    const page = await run.browser.newPage({ viewport: run.size, ...run.reduced ? { reducedMotion: 'reduce' } : {} });
    page.setDefaultTimeout(30000);
    const cam = SheetWalks.camera(run, page, 'books');
    await cam.step('encyclopedia', 'The encyclopedia', () =>
      page.goto(`file://${join(run.site, 'encyclopedia/index.html')}`));
    // A chapter, its entries and their plates, as the Book's pages are laid (OR-1830).
    cam.broken = false;
    await cam.step('encyclopedia-chapter', 'The encyclopedia: a chapter, its entries', () =>
      page.goto(`file://${join(run.site, 'encyclopedia/creatures.html')}`));
    for (const [book, said] of [['phb', "The player's handbook"], ['dmg', 'The referee\'s guide'],
      ['mm', 'The bestiary']] as const) {
      cam.broken = false;
      await cam.step(`handbook-${book}`, said, () => page.goto(`file://${join(run.site, `handbook/${book}.html`)}`));
    }
    await page.close();
  }
  // Each page of the making, as it first stands, then chosen by a hold as a player chooses: the calling a mage's (the
  // first spells' page then comes), the spells the page offers taken as they are, the rest the first card shown.
  static async creation(run: SheetRun): Promise<void> {
    const { page, driver } = await MonoBrowser.page(run.browser, run.size, { site: run.site, query: '?world=a1', reduced: run.reduced });
    page.setDefaultTimeout(30000);
    const cam = SheetWalks.camera(run, page, 'make', driver);
    if (!await cam.step('first', 'Creation: its first page', () =>
      page.waitForSelector('[data-mode="create"]', { timeout: 120000 }))) { await page.close(); return; }
    const seen = new Set<string>();
    for (let presses = 0; presses < 14 && !cam.broken; presses++) {
      const where = await page.getAttribute('.creation', 'data-page') ?? 'go';
      if (where === 'go') { break; }
      if (seen.has(where)) { cam.broken = true; run.misses.push(SheetWalks.stuck(run, where)); break; }
      seen.add(where);
      if (presses > 0) { await cam.shot(where, `Creation: ${where}`); }
      await SheetWalks.choose(page, where).catch((e: unknown) => {
        cam.broken = true; run.misses.push({ ...SheetWalks.stuck(run, where), why: String(e).slice(0, 240) });
      });
    }
    await cam.step('ready', 'Creation: the life made, ready to set out', () => page.waitForSelector('[data-option="set-out"]'));
    await cam.step('opening', 'The first place, as the life just made', async () => {
      await MonoDriver.enter(page, '[data-option="set-out"]');
      await page.waitForSelector('[data-mode="explore"]', { timeout: 120000 });
    });
    await page.close();
  }
  private static stuck(run: SheetRun, where: string): SheetMiss {
    return { size: SheetWalks.label(run), walk: 'make', step: where, why: 'the page did not go on when chosen' };
  }
  private static async choose(page: Page, where: string): Promise<void> {
    let pick = '[data-option]:not([data-option="more"]):not(:disabled) >> nth=0';
    if (await page.locator('[data-option="learned"]').count()) { pick = '[data-option="learned"]'; }
    if (where === 'calling') {
      for (let n = 0; n < 4 && !await page.locator('[data-option="mage"]').count()
        && await page.locator('[data-option="more"]').count(); n++) { await page.click('[data-option="more"]'); }
      if (await page.locator('[data-option="mage"]').count()) { pick = '[data-option="mage"]'; }
    }
    await MonoDriver.enter(page, pick);
    await page.waitForFunction(p => document.querySelector('.creation')?.getAttribute('data-page') !== p, where,
      { timeout: 8000 });
  }
}
