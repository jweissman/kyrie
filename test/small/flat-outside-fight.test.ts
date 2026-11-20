import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ChoiceList, type Choice } from '../../src/ui/choice-list';

// Only a fight unfolds (PB-02; the owner's ruling of 20 November): outside a fight, a store and creation's long pages,
// the scene's acts are flat rows, each in whole words. "Wait" had been an opener whose rows said fragments ("A while",
// "An hour", "Until dark", "And watch, until something changes"), and "Give" one of "one coin" and "one ration"; the
// store's Buy stays a list of its wares.
const shop = `
  Place shop "the shop" is room at 0, 0.
  Company party "You" of 1 at shop.
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells torch for 1 coin from 6. Sells candle for 1 coin from 6. }
  Initially Set quantity(party, rations) to 4.
  Goal false.`;
class Flat {
  // Every opener the scene offers, with the commands it holds.
  static openers(t: Tiny): { label: string; commands: string[] }[] {
    const all = (cs: Choice[]): Choice[] => cs.flatMap(c => [c, ...all(c.children ?? [])]);
    return ChoiceList.explore(t.screen).flatMap(s => all(s.choices)).filter(c => c.children?.length)
      .map(c => ({ label: c.label, commands: all(c.children!).flatMap(k => k.command ? [k.command] : []) }));
  }
  static readonly store = /^(buy_item|buy_goods|buy)\(/;
}

describe('outside a fight', () => {
  it('opens no list but a store\'s, and offers each wait as a flat row in whole words', async () => {
    const t = await Tiny.start(shop);
    t.journey.coin(10);
    t.look();
    expect(Flat.openers(t).filter(o => !o.commands.every(c => Flat.store.test(c)))).toEqual([]);
    const top = ChoiceList.explore(t.screen).flatMap(s => s.choices).map(c => c.label);
    expect(top).toEqual(expect.arrayContaining(['Wait a while', 'Wait an hour', 'Wait until dark',
      'Wait and watch, until something changes']));
    expect(top.filter(l => /^(A while|An hour|Until dark|And watch)/.test(l))).toEqual([]);
  });
  it('plays a wait by its whole words, and by the old opener\'s steps still', async () => {
    const t = await Tiny.start(shop);
    const at = t.journey.watch();
    await t.play('Wait a while');
    await t.play('Wait › An hour');
    expect(t.journey.watch()).toBeGreaterThan(at + 6);
  });
});
