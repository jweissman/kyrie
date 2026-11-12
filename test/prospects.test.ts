import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Prospects } from '../src/presentation/prospects';
import { ModuleWriter } from '../src/lang/module-writer';

// What could come of an act a few decisions on (the forward-design record's third prototype): a good turn to a thrown
// knight opens his gate, and his hall holds the family plate. Found through hypothetical worlds, nothing committed;
// said only to a company that knows of the plate; and the chain found is the one the rules then play.
describe('a prospect three decisions off', () => {
  it('is found by its chain, told only to one who knows of it, and comes true when played', async () => {
    const s = await PlaySession.start('test/fixtures/probes/knight/probe.campaign.json', 'p', NodeBundleSource.shared);
    const c = s.campaign, key = c.world.key();
    const [found, ...more] = Prospects.of(c, 4);
    expect(more).toEqual([]);
    expect(found!.chain.map(a => a.replace(/\(.*$/, ''))).toEqual(['p__help_knight', 'go', 'go', 'take_item']);
    expect([found!.item, found!.known, Prospects.told(c, 4)]).toEqual(['p__plate', false, []]);
    // Nothing was done: the world is as it was.
    expect(c.world.key()).toBe(key);
    // Told of the plate by the pedlar, the company may be told where the good turn leads.
    await s.leg(c.offered().find(a => /plate_ask/.test(a.id))!.id);
    expect(Prospects.told(c, 4).map(p => p.first)).toEqual([found!.first]);
    // And the chain, played by the rules, comes to the plate in hand.
    for (const step of found!.chain) { await s.leg(step); }
    expect(c.world.test(ModuleWriter.call('at', 'p__plate', 'p__hall'))).toBe(false);
    expect(c.readout.creatures.flatMap(x => x.state.inventory ?? []).some(i => i.definition === 'chapel_plate')).toBe(true);
  }, 120000);
});
