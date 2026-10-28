import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import type { Change } from '../src/lang/module';
import { ModuleWriter } from '../src/lang/module-writer';
import { PlayerView } from '../src/presentation/player-view';

// ADV-05: The Patient Star placed in a world had told the company that came in of its own protagonist's threads: "your
// own knife" on the Shift Market's cobbles, Garret "your uncle", and a debt to the Mutual it had never run up. Those
// are the cutter's (company.kyr); a company come in from a world is told of Garret as one of the Mutual's cutters, and
// Dagny pays to have him brought up.
describe('the Patient Star, placed in a world', () => {
  it('tells the company come in of Garret as a cutter of the Mutual, and pays for him', async () => {
    const j = await Journey.start('test/fixtures/patient/placed.campaign.json');
    const c = j.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'home__lane') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'season__square') }]));
    const square = PlayerView.observe(j.campaign).observations.map(o => o.text).join(' ');
    expect(square).not.toMatch(/your own knife/i);
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'party', 'season__square') },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', 'season__mutual_hall') }]));
    expect(await j.play('Ask Dagny about Garret')).toContain('One of mine');
    expect(j.page).not.toMatch(/your uncle/i);
    expect(await j.play('Ask Dagny what she would have you do')).toContain('The hall pays fourteen crowns');
    const objectives = (PlayerView.observe(j.campaign).objectives ?? []).map(o => o.text).join(' ');
    expect(objectives).toContain('a cutter of the Mutual');
    expect(objectives).not.toMatch(/your uncle|your debt/i);
    const gold = j.measure('quantity', 'party', 'gold');
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('travelsWith', 'season__garret', 'party') },
      { kind: 'assert', call: ModuleWriter.call('at', 'season__garret', 'season__mutual_hall') }]));
    expect(await j.play('Wait › A while')).toContain('I keep my word');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 14);
  }, 60000);
});
