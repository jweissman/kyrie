import { describe, expect, it } from 'bun:test';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { Travel } from '../src/session/travel';
import { Itineraries } from '../src/ui/itinerary';

// A journey goes by ways: the roads, tracks and paths the company has walked or been told of, and across the open
// country where that is the quicker. Toward a place in wild country whose way in it does not know, it had gone as far
// as the wild country's edge and stopped there (the play-structure investigation's PT-16: journeys "struck
// cross-country unasked"). Since OR-35 the way is laid across the country to where the place is said to stand, and
// drawn on the map before setting out, so that going across the country is asked, by the way shown (the owner, 16
// November: "for country you don't know it should offer the shortest visible path regardless of obstructions").
// Kite's Paliduslac, known by its name only, lies in Birchwood.
describe('a journey toward a place in wild country', () => {
  it('goes across the country to it, by the way laid before it set out', async () => {
    const w = await WorldAssembler.assemble('kite', NodeBundleSource.shared, { origin: 'debt',
      party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'kite', w.source), c = s.campaign;
    const held = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(x: unknown): void };
    held.commit(held.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'region__w3_named') }]));
    const traveller = { campaign: c, perform: (command: string) => s.leg(command) }, commands: string[] = [];
    let arrived = false;
    for (let tries = 0; tries < 6 && !arrived; tries++) {
      const laid = Itineraries.plan(c, 'region__w3')!.legs.map(l => l.passage);
      const done = await Travel.go(traveller, 'region__w3');
      expect(done.legs.map(l => /^go\(([^,]+),/.exec(l.command)?.[1])).toEqual(laid.slice(0, done.legs.length));
      expect(done.stopped ?? '').not.toMatch(/^You know no way/);
      commands.push(...done.legs.map(l => l.command));
      arrived = done.arrived;
      if (!arrived) { await s.leg('wait_hour'); }
    }
    expect(arrived).toBe(true);
    expect(commands.some(x => x.includes('__tw'))).toBe(true);
  }, 120000);
});
