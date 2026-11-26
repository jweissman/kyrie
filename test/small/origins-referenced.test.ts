import { describe, expect, it } from 'bun:test';
import { WorldDrawings } from '../../src/world/world-drawings';
import { Origins } from '../../src/world/origins';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { ReferenceSettlement } from '../../src/world/reference-settlement';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';

// Every new life begins in the reference game (OR-644), "Coming home" too (OR-682, the blind cold plays of 25
// November): on diziveje and tedewane the kin origin began at the drover's town, Fairham and Nochlëa, the country's
// second or third settlement, since a going-on is set only outside the reference town; two of four blind lives never
// saw the old woods. Creation now offers only the lives that begin in the reference settlement. The countries drawn
// only, no world built.
describe('the lives a country with the reference settlement offers', () => {
  it.each(['diziveje', 'tedewane'])('on %s all begin in it, and Coming home is not among them', async seed => {
    const base = NodeBundleSource.shared, { region, placements } = await WorldDrawings.of(seed, base);
    const loaded = await Origins.load(base), town = ReferenceSettlement.of(region)!;
    expect(Origins.begins('kin', region, placements)?.startsWith(`${town.id}_`)).toBe(false);
    const offered = Origins.choices(loaded, region, placements, CanonVocabulary.context());
    expect(offered.length).toBeGreaterThan(3);
    const binder = (id: string) => loaded.find(o => o.manifest.id === id)!.manifest.binder;
    expect(offered.map(o => [o.id, Origins.begins(binder(o.id), region, placements)?.split('_')[0]]))
      .toEqual(offered.map(o => [o.id, town.id]));
    expect(offered.map(o => o.id)).not.toContain('kin');
  });
});
