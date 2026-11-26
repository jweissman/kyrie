import { describe, expect, it } from 'bun:test';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { WorldAssembler } from '../src/world/world-assembler';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

// What an inn's count of the old places round its town says of a place a kit's band has made its own (FH-24). a1's
// inn had named the raiders' hold (Seolforfyrd then, Shadowrest now) as one more old place nobody with sense goes to:
// the count was written with the country, before the frontier's kits were placed in it, so it could not know who
// was there. The kits are placed now as the campaign places them when it loads (the same seed, the same country as
// written: WorldAssembler.held), and the count written after, with the words the kit gives the place it claims
// (data/kits/raider-hold/kit.json, told). That composition is the one the campaign loads with (Composition.keep), and
// one made afresh at load places every kit where it did, so what the inn says agrees with what the country holds;
// the country written again is the country written once, but for the count (its paintings hung afresh:
// CommunityWriter.afresh).
class Count {
  // Each town's count, as its region's files say it: the old places it names, said whole.
  static said(w: { source: unknown }): string[] {
    const files = (w.source as { files: Map<string, string> }).files;
    return [...files].filter(([k]) => /\/region\/[^/]*\.kyr$/.test(k))
      .flatMap(([, text]) => [...text.matchAll(/counts them off on a hand\. '([^']*)'/g)].map(m => m[1]!));
  }
}
describe('an inn\'s count of the old places round its town', () => {
  it('says whose hold a place is, where a kit\'s band has made it theirs, and of no other', async () => {
    const seen: string[] = [];
    for (const seed of ['a1', 'kite']) {
      const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { origin: 'debt',
        party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
      // The composition the assembler made to write the count, taken by the first campaign to load; a second composes
      // its own, against the country as written with the count, and places every kit where the first did.
      const composed = (await ModuleBundle.campaign(w.path, w.source as never,
        CanonVocabulary.context(), seed)).composition!;
      const again = (await ModuleBundle.campaign(w.path, w.source as never,
        CanonVocabulary.context(), seed)).composition!;
      expect(again).not.toBe(composed);
      expect(JSON.stringify(again.placements)).toBe(JSON.stringify(composed.placements));
      const sites = new Map(w.report.region.sites.map(s => [s.id, s.name]));
      const counts = Count.said(w), held = composed.placements.flatMap(p => p.told ? [p.told] : []);
      expect(held.length).toBeGreaterThan(0);
      for (const t of held) {
        const name = sites.get(t.place.replace(/^.*__/, ''))!;
        const naming = counts.filter(c => c.includes(`${name}: `));
        expect(naming.length).toBeGreaterThan(0);
        for (const c of naming) { expect(c).toMatch(new RegExp(`${name}: [^.]*, ${t.says}\\.`)); }
        seen.push(t.says);
      }
      const holds = held.map(t => sites.get(t.place.replace(/^.*__/, ''))!);
      for (const c of counts) {
        const told = c.split('. ').filter(x => / their hold$/.test(x)).map(x => x.split(':')[0]!);
        expect(told.filter(n => !holds.includes(n))).toEqual([]);
      }
    }
    expect(seen.some(s => s.includes('hobs'))).toBe(true);
    expect(seen.some(s => s.includes('outlaws'))).toBe(true);
  }, 120000);
});
