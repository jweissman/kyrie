/// <reference lib="dom" />
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { Page } from 'playwright-core';
import type { MonoDriver } from '../test/support/mono-driver';
import { SheetContrast, type PageContrast } from './contact-sheet-contrast';

// contrast: each line of the page's text against what is drawn behind it (UI-19: SheetContrast), where it was measured.
export interface SheetShot { size: string; n: number; name: string; file: string; caption: string; walk: string;
  contrast?: PageContrast }
export interface SheetMiss { size: string; walk: string; step: string; why: string }

// One walk's pictures at one size (see scripts/contact-sheets.ts): each page as it stands once the engine has
// settled, its animations run to their end (so that two runs' sheets can be laid side by side), saved as
// <size>/<NN>-<name>.png. A step that fails is told as a miss, with a picture of where the page stood instead, and
// the rest of that walk is passed by: what follows a missed step is no longer the page it names.
export class SheetCamera {
  broken = false;
  constructor(readonly page: Page, readonly driver: MonoDriver | undefined,
    readonly at: { out: string; size: string; walk: string; shots: SheetShot[]; misses: SheetMiss[] }) {}
  async shot(name: string, caption: string): Promise<void> {
    if (this.driver) { await this.driver.settle().catch(SheetCamera.none); }
    await this.page.waitForTimeout(600);
    const { out, size, walk, shots } = this.at, n = shots.filter(s => s.size === size).length + 1;
    const file = join(size, `${String(n).padStart(2, '0')}-${walk}-${name}.png`);
    await mkdir(join(out, size), { recursive: true });
    await this.page.screenshot({ path: join(out, file), animations: 'disabled' });
    const contrast = await SheetContrast.measure(this.page).catch((e: unknown) => {
      console.log(`  contrast not measured: ${String(e).split('\n')[0]}`);
      return undefined;
    });
    shots.push({ size, n, name, file, caption, walk, ...contrast ? { contrast } : {} });
    console.log(`shot ${file}: ${caption}`);
  }
  // A step of the walk, and its picture: false (and nothing more done in this walk) where it could not be taken.
  async step(name: string, caption: string, act: () => Promise<unknown>): Promise<boolean> {
    if (this.broken) { return false; }
    try {
      await act();
      await this.shot(name, caption);
      return true;
    } catch (error) {
      this.broken = true;
      const why = String(error).split('\n')[0]!.slice(0, 240);
      this.at.misses.push({ size: this.at.size, walk: this.at.walk, step: name, why });
      console.log(`missed ${this.at.size} ${this.at.walk}/${name}: ${why}`);
      await this.shot(`missed-${name}`, `Where the page stood when "${caption}" could not be reached`)
        .catch(SheetCamera.none);
      return false;
    }
  }
  private static none(): void { /* the page gone or never settled: the miss is already told */ }
}
