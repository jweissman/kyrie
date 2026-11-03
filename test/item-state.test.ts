import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { ModuleParser } from '../src/lang/module-parser';

// Quittance's ll 13 (QTC-A23): a carried item could have no state, so the Salamander lantern whose little door the
// player opens when the spark asks was a topic and prose that said "open the door if it asks", which nothing could do.
// An item may have states and changes as a thing has, seen near it and made by whoever reaches it, carried or not.
describe('an item with a state', () => {
  it('is changed where it lies and where it is carried', async () => {
    const j = await Journey.start('test/fixtures/probes/item-state/probe.campaign.json');
    expect(j.offers("Salamander lantern: Open the lantern's little door")).toBe(true);
    await j.play('Salamander lantern: Take', 'To the lane');
    expect(await j.play("Open the lantern's little door")).toContain('a spark sits in it');
    expect(j.holds('state', 'p__salamander', 'p__open')).toBe(true);
  }, 60000);
  it('is read with its parts, or without', () => {
    const m = ModuleParser.parse('Module m "M" { Place a "A" is room. Item l "L" is lantern at a { State shut "S.". '
      + 'State open "O.". Change ope "Open it" from shut to open. } Item k "K" is lantern at a. Goal false. }');
    expect(m.observations?.some(o => o.id === 'l__open')).toBe(true);
    expect(m.entities.some(e => e.id === 'l_ope' && e.type === 'change')).toBe(true);
  });
});
