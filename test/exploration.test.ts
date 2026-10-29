import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { DrawnWorld } from '../src/world/drawn-world';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Itineraries } from '../src/ui/itinerary';
import { Travel } from '../src/session/travel';

// Leaving a town simply to explore (the owner's correction of Mission 18: exploration as one of the game's central
// pleasures). b2's Ramavor stands in woods under the fells: out into the country about it, up onto the fells by the
// way each stretch lies, looking out from there and seeing what stands up from the land a long way off, and going to
// it across the country between, by what is now known; and what was learned is kept.
describe('exploring the open country', () => {
  it('leaves a town with no destination, looks out from the fells, sees a tower, and crosses the country to it', async () => {
    const j = Journey.of(await DrawnWorld.start('b2', { party: [{ name: 'Aud', raceId: 'human', classId: 'ranger' }],
      origin: 'wanderer' }, NodeBundleSource.shared));
    await j.step('^To the ');
    await j.step('country about');
    expect(j.choices().filter(c => /^(North|South|East|West)[a-z-]*: /.test(c.label)).length).toBeGreaterThan(2);
    for (let k = 0; k < 4 && !/fell|heath|heights/.test(j.screen().place.name); k++) {
      await j.step('^(North|South|East|West)[a-z-]*: .*(heath|fell|heights)');
    }
    const before = j.screen().region!.land!;
    await j.step('^Look out over the country from here');
    const after = j.screen().region!.land!, tower = after.marks.find(m => /tower/.test(m.name));
    expect(after.known.length).toBeGreaterThan(before.known.length + 20);
    expect(tower?.visited).toBe(false);
    // Set out toward it, across the country seen: it is reached, and the country stays known.
    expect(Itineraries.plan(j.campaign, tower!.id)).toBeDefined();
    const done = await Travel.go({ campaign: j.campaign, perform: (c: string) => j.session.perform(c) }, tower!.id);
    expect(done.arrived).toBe(true);
    const land = j.screen().region!.land!;
    expect(land.known).toEqual(expect.arrayContaining(after.known));
    expect(land.marks.find(m => m.id === tower!.id)?.visited).toBe(true);
  }, 300000);
});
