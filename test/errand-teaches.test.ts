import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { RegionWorks } from '../src/world/region-works';
import { Origins } from '../src/world/origins';

// Every country's brothers' errand is sent to a work that teaches what the errand waits on: who its makers were, or
// how they ended (M21's playability list, PL-24). Kahitude's errand had been sent to Lapisrecs, a deep work, which
// told only of the kingdom after the makers, so the errand could not be done where it pointed; a deep work now has its
// makers' marks at the way in, as every other of their works has. Over the countries the specs walk, and more; the
// region's Kyr only, as RegionWorks writes it (no world is started).
class Errand {
  static readonly seeds = ['kahitude', 'a1', 'pine', 'wren', 'thorn', 'kite', 'b2', 'mere', 'c3', 'd4'];
  static bound(seed: string) {
    const region = WorldAssembler.region(seed, [0, 0]);
    const origins = Origins as unknown as {
      bind(b: string, r: unknown, p: unknown[]): { imports: Record<string, [string, string]> } | undefined };
    return { region, bound: origins.bind('order', region, []) };
  }
  // The facts its delving's own lines teach, in any of its places (its outside, and its rooms, by its id).
  static taught(seed: string): { delving: string; waits: string[]; teaches: string[] } | undefined {
    const { region, bound } = this.bound(seed);
    if (!bound) { return undefined; }
    const delving = bound.imports.delving![0].replace(/^region\./, '');
    const waits = [bound.imports.history![0], bound.imports.fate![0]].map(x => x.replace(/^region\./, ''));
    const teaches = RegionWorks.lines(region).flatMap(l => {
      const m = new RegExp(`^\\s*Observe \\S+ at (${delving}\\S*) .* teaches (\\S+)\\.$`).exec(l);
      return m ? [m[2]!] : [];
    });
    return { delving, waits, teaches };
  }
}
describe("the brothers' errand", () => {
  it('is sent, in every country, to a work that teaches what it waits on', () => {
    const errands = Errand.seeds.flatMap(seed => [Errand.taught(seed)].flatMap(e => e ? [{ seed, ...e }] : []));
    expect(errands.length).toBeGreaterThanOrEqual(5);
    const unteaching = errands.filter(e => !e.waits.some(w => e.teaches.includes(w)));
    expect(unteaching.map(e => `${e.seed}: ${e.delving}`)).toEqual([]);
  }, 60000);
});
