/// <reference lib="dom" />
// Contact sheets of the app, for reviews of its composition and design alone (the owner, 20 November): every page a
// player reaches in the first hour, pictured in the built site at a phone's size (390×844) and an upright iPad's
// (820×1180), one PNG a page a size, then a captioned grid of each size (sheet-<size>.png) and index.html. The world
// is a1, the walk test/safe-zone-browser's, the animations run to their end: two runs' sheets can be compared. What
// could not be reached is said in index.html and shots.json, with a picture of where the page stood; it fails no
// one. CI keeps it as the contact-sheets workflow's artifact (doc/architecture/verification.md).
//   bun scripts/contact-sheets.ts [--out dir] [--sizes 390x844,820x1180]
// Needs a Playwright Chromium (KYRIE_CHROMIUM may name it) and, on this machine, LD_LIBRARY_PATH for NSS.
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from '../test/support/mono-browser';
import type { SheetMiss, SheetShot } from './contact-sheet-camera';
import { SheetCompose } from './contact-sheet-compose';
import { SheetHour } from './contact-sheet-hour';
import { SheetWalks, type SheetRun } from './contact-sheet-walks';

export class ContactSheets {
  static option(args: string[], name: string, fallback: string): string {
    const at = args.indexOf(`--${name}`);
    return at >= 0 && args[at + 1] ? args[at + 1]! : fallback;
  }
  static readonly walks: [string, (run: SheetRun) => Promise<void>][] = [
    ['title', SheetWalks.title], ['make', SheetWalks.creation], ['hour', SheetHour.walk], ['books', SheetWalks.books]];
  static async main(args: string[]): Promise<number> {
    const out = resolve(ContactSheets.option(args, 'out', 'contact-sheets'));
    const sizes = ContactSheets.option(args, 'sizes', '390x844,820x1180').split(',');
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    const site = await mkdtemp(join(tmpdir(), 'kyrie-sheets-site-'));
    await SiteBuild.site(site, {});
    const browser = await MonoBrowser.launch();
    const shots: SheetShot[] = [], misses: SheetMiss[] = [];
    try {
      for (const size of sizes) {
        const [width, height] = size.split('x').map(Number) as [number, number];
        const run: SheetRun = { browser, site, out, size: { width, height }, shots, misses };
        for (const [walk, go] of ContactSheets.walks) {
          await go(run).catch((e: unknown) => {
            misses.push({ size, walk, step: '(the walk)', why: String(e).split('\n')[0]!.slice(0, 240) });
          });
        }
      }
      const meta = `${ContactSheets.commit()} · built ${new Date().toISOString()} · world a1 · ${shots.length} pictures`
        + `, ${misses.length} not reached`;
      await SheetCompose.write(browser, out, { sizes, shots, misses, meta });
    } finally {
      await browser.close();
      await rm(site, { recursive: true, force: true });
    }
    console.log(`${shots.length} pictures, ${misses.length} not reached: ${join(out, 'index.html')}`);
    for (const m of misses) { console.log(`  not reached ${m.size} ${m.walk}/${m.step}: ${m.why}`); }
    return shots.length ? 0 : 1;
  }
  static commit(): string {
    const git = Bun.spawnSync(['git', 'rev-parse', '--short', 'HEAD']);
    return git.success ? git.stdout.toString().trim() : 'unknown commit';
  }
}

if (import.meta.main) { process.exit(await ContactSheets.main(process.argv.slice(2))); }
