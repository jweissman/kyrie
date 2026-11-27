import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../src/client/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Runner, type Said } from '../src/cli/runner';
import { Twins } from './support/twins';

// What is kept from one world to the next agrees with working it out afresh, in a drawn country (OR-91): the heavier
// rung of test/projection-equals-full, whose small world holds the same in a fraction of a second. Two countries
// are begun for each case, one of them reading everything afresh, so these run in the suite and by test:changed, not
// in test:small (the owner, 24 November: tests made cheaper, the inner loop faster).
describe('what is kept agrees with working it out afresh, in a drawn country', () => {
  it('agrees act by act in a drawn country: a quest seen through, then talk, which writes what it knows', async () => {
    const drawn = { origin: 'order', party: [{ name: 'Hamo', raceId: 'human', classId: 'cleric',
      backgroundId: 'doctor' }] };
    const start = () => DrawnWorld.start('a1', drawn, NodeBundleSource.shared);
    const kept = await start(), fresh = await Twins.afresh(start);
    expect(Twins.everywhere(kept)).toEqual([]);
    expect(await Twins.play(kept, fresh, 5, /^Give Eogan/)).toBe(5);
  }, 120000);
  // The journeys led with go by the aim followed first, which the world does not hold (KeptParts' from).
  it('agrees in a drawn country as one aim and then another is followed, then none', async () => {
    const drawn = { origin: 'order', party: [{ name: 'Hamo', raceId: 'human', classId: 'cleric',
      backgroundId: 'doctor' }] };
    const start = () => DrawnWorld.start('a1', drawn, NodeBundleSource.shared);
    const kept = await start(), fresh = await Twins.afresh(start);
    const twins = { kept, fresh, k: new Runner(kept), f: await Twins.afresh(() => new Runner(fresh)) };
    const first = twins.k.said(), letter = [...first.offer.primary, ...first.offer.rest]
      .find(o => /^(Give Eogan|Talk to Eogan — give)/.test(o.label))!;
    expect(await Twins.afresh(() => twins.f.said())).toEqual(first);
    let said = await Twins.step(twins, JSON.stringify({ act: letter.id })) as Said, followed = 0;
    // Between words with Eogan (each telling of somewhere), every aim held followed in turn, then none.
    for (let round = 0; round < 3; round++) {
      for (const a of said.aims ?? []) { await Twins.step(twins, JSON.stringify({ follow: a.id })); followed++; }
      await Twins.step(twins, JSON.stringify({ follow: null }));
      const led = said.offer.primary[0]!;
      said = await Twins.step(twins, JSON.stringify({ act: led.id })) as Said;
      // One led with across the country opens the map at where it goes (Row.chart): set out from there.
      if (led.does?.startsWith('view:map:')) {
        said = await Twins.step(twins, JSON.stringify({ act: said.offer.primary[0]!.id })) as Said;
      }
    }
    expect(followed).toBeGreaterThan(2);
  }, 120000);
});
