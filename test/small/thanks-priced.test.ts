import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';

// A favour remembered in trade (CO-16, from the remembered-favour pin): one grateful to the company asks a coin less
// for each of their wares, once, and never below one; one who owes it nothing asks the full price.
const yard = (thanks: boolean) => `
  Place yard "the yard" is room at 0, 0 outdoors.
  Company party "You" of 1 at yard.
  Person mik "Mik" at yard { Role "who keeps the corn-store". Ancestry human. Peaceable. Pronouns he.
    Sells torch for 3 coin from 4. }
  ${thanks ? 'Initially Assert grateful(mik, party).' : ''}`;
describe('a favour remembered in trade', () => {
  it("asks a grateful seller's price less a coin, and the full price of one who owes nothing", async () => {
    const paid = async (thanks: boolean) => {
      const t = await Tiny.start(yard(thanks));
      t.journey.coin(10);
      await t.play('Wait › A while', 'Buy a torch');
      return 10 - t.journey.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    };
    expect(await paid(false)).toBe(3);
    expect(await paid(true)).toBe(2);
  });
});
