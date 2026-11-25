/// <reference lib="dom" />
// One step of a recorded journey shown by the page itself (the journey reader's scene view): the checkpoint
// `kyrie read scene` made (the game just before the step) opened in the built page as a save file is opened, the
// step's act done by its id as a player's choice is, and the page as it then stands: its text, what it inspects to,
// and a picture. Nothing before the step is played in the browser.
//   bun run web:build          (or --site <dir> of a site already built)
//   bin/kyrie read scene <run dir> <step>
//   LD_LIBRARY_PATH=… bun scripts/journey-scene.ts <checkpoint.json> [--shot out.png] [--width 1440] [--height 900]
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Page } from 'playwright-core';
import { MonoBrowser } from '../test/support/mono-browser';
import type { MonoInspection } from '../test/support/mono-driver';

interface Mono { resume(text: string): Promise<void>; act(command: string, said: string): void;
  inspect(): MonoInspection }
export interface Scene { before: string; after: string; inspection: MonoInspection }

export class JourneyScene {
  // The checkpoint opened, and its step taken, in a page already loaded.
  static async show(page: Page, text: string): Promise<Scene> {
    const { step } = JSON.parse(text) as { step: { act: string; label: string } };
    await page.waitForFunction(() => 'kyrieMono' in window);
    await this.mono(page, `m => m.resume(${JSON.stringify(text)})`);
    await page.waitForFunction(() => (window as unknown as { kyrieMono: Mono }).kyrieMono.inspect().mode !== 'title'
      && !(window as unknown as { kyrieMono: Mono }).kyrieMono.inspect().pending, null, { timeout: 120000 });
    const before = await page.evaluate(() => document.body.innerText);
    const error = (await this.inspect(page)).error;
    if (error) { throw new Error(`the page would not open the checkpoint: ${error}`); }
    await this.mono(page, `m => m.act(${JSON.stringify(step.act)}, ${JSON.stringify(step.label)})`);
    await page.waitForTimeout(100);
    await page.waitForFunction(() => !(window as unknown as { kyrieMono: Mono }).kyrieMono.inspect().pending, null,
      { timeout: 120000 });
    return { before, after: await page.evaluate(() => document.body.innerText), inspection: await this.inspect(page) };
  }
  private static inspect(page: Page): Promise<MonoInspection> {
    return page.evaluate(() => (window as unknown as { kyrieMono: Mono }).kyrieMono.inspect());
  }
  private static mono(page: Page, body: string): Promise<unknown> {
    return page.evaluate(`(${body})(window.kyrieMono)`);
  }
  private static flag(args: string[], f: string, d: string): string {
    return args.includes(f) ? args[args.indexOf(f) + 1]! : d;
  }
  static async main(args: string[]): Promise<number> {
    const file = args[0], flag = this.flag.bind(this, args);
    if (!file) { console.error('usage: bun scripts/journey-scene.ts <checkpoint.json> [--site dir] [--shot png]'); return 2; }
    const browser = await MonoBrowser.launch();
    try {
      const { page, errors } = await MonoBrowser.page(browser, { width: Number(flag('--width', '1440')),
        height: Number(flag('--height', '900')) }, { site: resolve(flag('--site', 'out/site')), query: '' });
      const scene = await this.show(page, readFileSync(file, 'utf8')), shot = flag('--shot', '');
      if (shot) { await page.screenshot({ path: shot }); console.log(`picture: ${shot}`); }
      writeFileSync(file.replace(/\.json$/, '.shown.txt'), scene.after);
      console.log(scene.after);
      if (errors.length) { console.error(errors.join('\n')); }
      return errors.length ? 1 : 0;
    } finally { await browser.close(); }
  }
}
if (import.meta.main) { process.exit(await JourneyScene.main(process.argv.slice(2))); }
