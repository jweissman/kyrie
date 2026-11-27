import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Offered } from '../../src/cli/runner';

// Who takes what is bought is said, and what goes together goes to one pack (OR-687, cold plays 1 and 3 of 25
// November): a lantern bought went to Hugh and its oil to Orryn, the row "Buy from Soveliss — 7 coin" saying no one,
// though the page says beside it who takes it (Choice.note), which the runner had dropped. Now the oil goes to
// whoever carries the lamp, and every client says the taker where the row's words leave it out.
const shop = `
  Place shop "the shop" is room at 0, 0.
  Person mabel "Mabel" at shop { Role "a chandler". Ancestry human. Peaceable. Pronouns she.
    Sells lantern for 7 coin from 2. Sells lamp_oil for 1 coin from 6. }
  Company party "You" of 2 at shop.
  Goal false.`;
const two = [{ name: 'Ama', raceId: 'human' as const, classId: 'warrior' as const },
  { name: 'Bek', raceId: 'dwarf' as const, classId: 'cleric' as const }];
const flat = (os: Offered[]): Offered[] => os.flatMap(o => [o, ...flat(o.opens ?? [])]);

describe('what is bought', () => {
  it('goes with what it is for, and every row that buys says who takes it', async () => {
    const t = await Tiny.start(shop, { party: two });
    t.journey.coin(20); t.look();
    const owner = (kind: string) => t.world.related('ownedItem')
      .find(r => t.world.one('itemKind', r.args[0]!) === kind)?.args[1];
    await t.play('Buy › A lantern');
    // Handed to Bek: the oil had gone to Ama, the one who plays, carrying no more than he does.
    const lantern = t.world.related('ownedItem').find(r => t.world.one('itemKind', r.args[0]!) === 'lantern')!;
    if (lantern.args[1] !== 't__member_party_2') { await t.perform(`transfer_item(${lantern.args[0]},t__member_party_2)`); }
    const lamp = owner('lantern');
    expect(lamp).toBe('t__member_party_2');
    const oil = t.journey.choices().find(c => /^buy_item\(t__mabel_lamp_oil_\d+,/.test(c.command))!;
    expect(oil.command.endsWith(`,${lamp})`)).toBe(true);
    // Bought within Mabel's talk, under her trade (the owner's playtest, 25 November: not rows of the place).
    const runner = new Runner(t.session);
    await runner.ask(JSON.stringify({ act: 't__mabel#talk' }));
    const said = await runner.ask(JSON.stringify({ act: 'focus:trade:on' }));
    if ('error' in said) { throw new Error(said.error); }
    const buys = flat([...said.offer.primary, ...said.offer.rest]).filter(o => /^buy_item\(/.test(o.does ?? ''));
    expect(buys.length).toBeGreaterThan(0);
    expect(buys.filter(o => !/\b(Ama|Bek)\b/.test(`${o.label} ${o.note ?? ''}`)).map(o => o.label)).toEqual([]);
  });
});
