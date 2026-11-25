import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// The contact sheets' contrast as a ratchet (OR-506, the coordinator's call of 24 November): the lines below WCAG AA
// over every page of a whole run may only fall. Kept by the run's sizes (each set of sizes pictures other lines), and
// held only where the run is whole (every walk, full motion): a run of some walks for a page change's own sheet says
// its count and holds nothing. A run that finds more than the kept count fails; one that finds fewer says so, and
// --update writes the lower count.
//   doc/architecture/mission-22/contrast-ratchet.json: { "<sizes>": <lines below AA> }
export class SheetRatchet {
  static readonly file = join(import.meta.dir, '..', 'doc/architecture/mission-22/contrast-ratchet.json');
  static kept(): Record<string, number> {
    return existsSync(this.file) ? JSON.parse(readFileSync(this.file, 'utf8')) as Record<string, number> : {};
  }
  // Whether the run holds: its count against the kept one for its sizes, said; a new size set kept as it is found.
  static hold(sizes: string, failing: number, at: { whole: boolean; update: boolean }): boolean {
    if (!at.whole) { console.log(`contrast: ${failing} lines below AA (some walks only: no ratchet)`); return true; }
    const kept = this.kept(), was = kept[sizes];
    if (was !== undefined && failing > was) {
      console.log(`contrast: ${failing} lines below AA at ${sizes}, more than the ${was} kept (OR-506: it may only fall)`);
      return false;
    }
    if (was === undefined || (failing < was && at.update)) {
      writeFileSync(this.file, `${JSON.stringify({ ...kept, [sizes]: failing }, null, 1)}\n`);
    }
    console.log(`contrast: ${failing} lines below AA at ${sizes}${was === undefined ? ', kept' : `, ${was} kept`}`
      + `${was !== undefined && failing < was && !at.update ? ' (--update keeps the lower)' : ''}`);
    return true;
  }
}
