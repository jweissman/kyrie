import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Canon } from '../../src/canon/canon';
import { Content } from '../../src/content';
import { Tended } from '../../src/rules/tended';

// A healing cantrip mends each member once between rests, out of a fight (R10-12, R11-05, the lead's ruling of 13
// November; doc/architecture/mission-21/rules/recovery.md): Tend offers a cleric's Kindle on whoever is hurt; once it
// has mended them they are tended, and it is not offered on them again until the company rests. A spell of a slot is
// not touched by it, nor anything in a fight.
const ledge = `
  Place scarp "the scarp" is wilderness.
  Place foot "the foot of the climb" is room within scarp at 0, 0 outdoors.
  Place ledge "the high ledge" is room within scarp at 1, 0 outdoors.
  Passage climb "the wet climb" is path between foot and ledge.
  Company party "Your company" of 2 at foot.
  Hazard ice_fall "the ice" means "Deal (8) bludgeoning damage to party.".
  Thing ice "ice on the links" on climb {
    State icy dangerous "Ice glazes the links of the climb.".
    State broken "The ice on the links is broken where you went up.".
    Hurts with ice_fall when icy then broken.
  }
  Goal false.`;
const party = [{ name: 'Hild', raceId: 'human', classId: 'warrior' },
  { name: 'Aud', raceId: 'human', classId: 'cleric', traits: ['cherubist'] }];
const kindles = (t: Tiny) => [...new Set(t.journey.choices().map(c => c.command)
  .filter(c => /^field_spell\(.*kindle/.test(c)))];

describe('a healing cantrip between fights', () => {
  it('mends each hurt member once, and again only after a rest', async () => {
    const t = await Tiny.start(ledge, { party: party as never });
    // The ice, risked, hurts whoever risks it (eight).
    await t.perform('risk(t__ice,t__member_party_1)');
    const first = kindles(t);
    expect(first).toEqual([expect.stringMatching(/kindle,t__member_party_1/)]);
    await t.perform(first[0]!);
    // Still hurt (Kindle is 1d3 and Wisdom), and tended: not again until a rest.
    const hild = t.campaign.readout.creatures.find(c => c.id === 't__party_1')!;
    expect(hild.state.hp).toBeLessThan(hild.base.maxHp);
    expect(hild.state.conditions.map(s => s.id)).toContain('tended');
    expect(kindles(t)).toEqual([]);
    // A night's rest lifts it (here a night in the open: a rest under a roof, or a healer, the same).
    await t.perform(t.journey.choices().find(c => /^camp\(/.test(c.command))!.command);
    const members = t.campaign.readout.creatures.filter(c => t.campaign.readout.partyIds.includes(c.id));
    expect(members.flatMap(c => c.state.conditions.map(s => s.id))).not.toContain('tended');
  });
  it('touches only a cantrip that heals: a spell of a slot, and a fight, are as they were', () => {
    const of = (id: string) => Content.abilities.find(a => a.id === id)!;
    expect([of('kindle'), of('cure_minor')].map(a => Tended.cantripHeal(a))).toEqual([true, true]);
    expect(['cure', 'cure_moderate', 'smite'].map(id => Tended.cantripHeal(of(id)))).toEqual([false, false, false]);
    expect(Object.keys(Canon.conditions.tended!.modifiers)).toEqual([]);
  });
});
