import { describe, expect, it } from 'bun:test';
import { CompanyLight } from '../../src/presentation/company-light';
import { Tiny } from '../support/tiny';

// A lantern sold with nothing to burn in it says so (CL-62, S3-0: one bought at Mabel's before the gate-well was never
// offered as a light, the provisions saying "1 torch, 2 candles to spare"): the sale, the pack and the provisions
// say it wants oil; with a flask of oil it is filled and lit in the dark, first.
const shop = `
  Place shop "the shop" is room at 0, 0.
  Place cellar "the cellar" is room at 1, 0 underground.
  Passage stair "the stair" is passage between shop and cellar.
  Initially Assert unlit(cellar).
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells lantern for 7 coin from 2. Sells lamp_oil for 1 coin from 6. }
  Company party "You" of 1 at shop.
  Goal false.`;
class Lantern {
  // Or by one in her own clothes, no kit: no torch or candle in her pack, as in Ilse's on the weir route.
  static async bought(mage = false): Promise<Tiny> {
    const t = await Tiny.start(shop, mage ? { party: [{ name: 'Ilse', raceId: 'elf', classId: 'mage', outfit: 'own' }] } : {});
    t.journey.coin(20);
    return t.look();
  }
  static note(t: Tiny): string | undefined { return t.screen.items.find(i => i.kind === 'lantern')?.kept; }
}

describe('a lantern bought', () => {
  it('without oil, says so at the sale, in the pack and in the provisions', async () => {
    const t = await Lantern.bought();
    await t.play('Buy › A lantern');
    expect(t.journey.latest).toContain('It burns oil, and none of you carries any.');
    expect(Lantern.note(t)).toBe('for light · burns lamp oil, and you have none');
    await t.perform('go(t__stair,t__cellar)');
    expect(t.screen.expedition.light).toContain('a lamp, and no oil for it');
    expect(t.journey.choices().some(c => /^Fill a lantern/.test(c.label))).toBe(false);
  });
  it('with a flask of oil, is told plainly, and is filled and lit in the dark', async () => {
    const t = await Lantern.bought();
    await t.play('Buy › A flask of lamp oil', 'Buy › A lantern');
    expect(t.journey.latest).not.toContain('none of you carries any');
    expect(Lantern.note(t)).toBeUndefined();
    await t.perform('go(t__stair,t__cellar)');
    expect(t.screen.expedition.light).not.toContain('no oil');
    expect(t.journey.choices().some(c => /^Fill a lantern/.test(c.label))).toBe(true);
  });
  // With the lantern and its oil in the pack, the company has a light to hand, as with a torch: the dark ahead sends
  // it to no one to buy one (the weir route: Ilse led up from the gate-well to the guest-hall for a light, and back).
  it('with its oil, is a light to hand: nothing sends the company to buy one', async () => {
    const t = await Lantern.bought(true);
    await t.play('Buy › A lantern');
    expect(CompanyLight.of(t.campaign, t.screen).unlit).toBeDefined();
    await t.play('Buy › A flask of lamp oil');
    expect(CompanyLight.of(t.campaign, t.screen)).toEqual({});
  });
});
