/// <reference lib="dom" />
// Contact sheets of the app, for reviews of its composition and design alone (the owner, 20 November): every page a
// player reaches in the first hour, pictured in the built site at a phone's size (390×844) and an upright iPad's
// (820×1180), one PNG a page a size, then a captioned grid of each size (sheet-<size>.png) and index.html. The world
// is a1, the walk test/safe-zone-browser's, the animations run to their end: two runs' sheets can be compared. What
// could not be reached is said in index.html and shots.json, with a picture of where the page stood; it fails no
// one. CI keeps it as the contact-sheets workflow's artifact (doc/architecture/verification.md).
//   bun scripts/contact-sheets.ts [--out dir] [--sizes 390x844,820x1180] [--motion full|reduce|both]
//     [--walks title,make,kept,hour,books] (some of the walks only, for a page change's own sheet: OR-508) [--update]
//     [--core] (the core pages alone, full size, at 1280×800, 820×1180 and 390×844: OR-1091)
// A whole run holds the lines below AA to a ratchet that may only fall (OR-506: SheetRatchet).
// Needs a Playwright Chromium (KYRIE_CHROMIUM may name it) and, on this machine, LD_LIBRARY_PATH for NSS.
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { SiteBuild } from '../src/cli/site-build';
import { MonoBrowser } from '../test/support/mono-browser';
import type { SheetMiss, SheetShot } from './contact-sheet-camera';
import { SheetCompose } from './contact-sheet-compose';
import { SheetHour } from './contact-sheet-hour';
import { SheetRatchet } from './contact-sheet-ratchet';
import { SheetCore } from './contact-sheet-core';
import { SheetWalks, type SheetRun } from './contact-sheet-walks';
import { SheetRail } from './contact-sheet-rail';

export class ContactSheets {
  static option(args: string[], name: string, fallback: string): string {
    const at = args.indexOf(`--${name}`);
    return at >= 0 && args[at + 1] ? args[at + 1]! : fallback;
  }
  static readonly walks: [string, (run: SheetRun) => Promise<void>][] = [
    ['title', SheetWalks.title], ['make', SheetWalks.creation], ['kept', SheetWalks.kept], ['hour', SheetHour.walk],
    ['books', SheetWalks.books]];
  // Walked only when asked for by name, held to no ratchet: the rail's own pages (OR-1880).
  static readonly asked: [string, (run: SheetRun) => Promise<void>][] = [['rail', SheetRail.walk]];
  // --core: the core pages alone, each at its full resolution, at a desk's, an upright tablet's and a phone's size, for
  // a design review (OR-1091: SheetCore); held to no ratchet, the whole run's to hold.
  static readonly core = '1280x800,820x1180,390x844';
  static async main(args: string[]): Promise<number> {
    const core = args.includes('--core');
    const out = resolve(ContactSheets.option(args, 'out', core ? 'contact-sheets-core' : 'contact-sheets'));
    // --motion full (the default), reduce, or both: each size walked again as for one who asks for less motion.
    const motion = ContactSheets.option(args, 'motion', 'full'), passes = motion === 'both' ? [false, true]
      : [motion === 'reduce'];
    const asked = ContactSheets.option(args, 'walks', ContactSheets.walks.map(([w]) => w).join(',')).split(',');
    const walks: typeof ContactSheets.walks = core ? [['core', SheetCore.walk]]
      : [...ContactSheets.walks, ...ContactSheets.asked].filter(([w]) => asked.includes(w));
    const sizes = ContactSheets.option(args, 'sizes', core ? ContactSheets.core : '390x844,820x1180').split(',')
      .flatMap(s => passes.map(r => (r ? `${s}-reduced` : s)));
    await rm(out, { recursive: true, force: true });
    await mkdir(out, { recursive: true });
    const site = await mkdtemp(join(tmpdir(), 'kyrie-sheets-site-'));
    await SiteBuild.site(site, {});
    const browser = await MonoBrowser.launch();
    const shots: SheetShot[] = [], misses: SheetMiss[] = [];
    try {
      for (const size of sizes) {
        const [width, height] = size.split('x').map(n => parseInt(n, 10)) as [number, number];
        const run: SheetRun = { browser, site, out, size: { width, height }, shots, misses,
          ...size.endsWith('-reduced') ? { reduced: true } : {} };
        for (const [walk, go] of walks) {
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
    const failing = shots.reduce((n, s) => n + (s.contrast?.failing ?? 0), 0);
    const held = SheetRatchet.hold(sizes.join(','), failing, { whole: walks.length === ContactSheets.walks.length
      && motion === 'full' && !misses.length, update: args.includes('--update') });
    return shots.length && held ? 0 : 1;
  }
  static commit(): string {
    const git = Bun.spawnSync(['git', 'rev-parse', '--short', 'HEAD']);
    return git.success ? git.stdout.toString().trim() : 'unknown commit';
  }
}

if (import.meta.main) { process.exit(await ContactSheets.main(process.argv.slice(2))); }
