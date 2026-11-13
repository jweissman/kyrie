import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { InspectTool } from '../../src/cli/inspect-tool';
import { ModuleWriter } from '../../src/lang/module-writer';

// An act does what it says, and says what it did: a torch bought is the company's and carried, its price gone from the
// purse into the seller's, one fewer on his shelf; every change is in the event, to be read back; and an act refused
// says, in Kyr, which of its conditions fails (bin/kyrie inspect). The Mission 21 brief's "an action produces
// inspectable, correct state changes", on a yard with a seller in it.
const yard = (gold: number) => `
  Place yard "the yard" is room.
  Company party "You" of 1 at yard.
  Person halm "Teodor Halm" at yard { Role "a scholar". Peaceable. Pronouns he. Sells torch for 2 coin from 3. }
  Initially Set quantity(party, gold) to ${gold}.
  Observe yard_scene at yard when true "A yard.".
  Goal false.`;

describe('an act and what it changed', () => {
  it('moves the coin and the torch, each change told in the event and held in the world', async () => {
    const t = await Tiny.start(yard(20));
    const gold = (who: string) => t.world.number(ModuleWriter.call('quantity', who, 'gold'));
    const member = t.campaign.playerActor === 'party' ? undefined : t.campaign.playerActor;
    await t.play('Buy a torch');
    const { event, command } = t.journey.taken.at(-1)!;
    const torch = /^buy_item\(([^,]+),/.exec(command)![1]!;
    expect(event.result).toBe('success');
    expect([gold('party'), gold('t__halm')]).toEqual([18, 2]);
    expect(t.world.number(ModuleWriter.call('shelf', 't__halm', 'torch'))).toBe(2);
    expect(t.world.test(ModuleWriter.call('forSale', torch))).toBe(false);
    expect(t.world.one('at', torch)).toBeUndefined();
    expect(event.changes).toEqual(expect.arrayContaining(['- quantity(party, gold) = 20', '+ quantity(party, gold) = 18',
      '+ quantity(t__halm, gold) = 2', '- shelf(t__halm, torch) = 3', '+ shelf(t__halm, torch) = 2',
      `- at(${torch}, t__yard)`, `- forSale(${torch})`, ...member ? [`+ ownedItem(${torch}, ${member})`] : []]));
  });
  it('with too little coin, is not offered, and inspect says which condition fails', async () => {
    const t = await Tiny.start(yard(1));
    expect(t.journey.choices().map(c => c.label)).not.toContain('Buy a torch');
    const why = InspectTool.report(t.campaign, 'buy').join('\n');
    expect(why).toMatch(/not offered/);
    expect(why).toMatch(/quantity\(party, gold\)/);
  });
});
