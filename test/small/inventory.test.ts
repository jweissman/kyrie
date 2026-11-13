import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ModuleWriter } from '../../src/lang/module-writer';

// What one of the company carries goes to another and back (data/rules/belongings.kyr: transfer_item), and
// out of the company to one who wants it (give): each change is the carrier's and the recipient's, and nothing else
// moves. A company of two on a yard, and a lamplighter who wants a candle.
const yard = `
  Place yard "the yard" is room.
  Company party "You" of 2 at yard.
  Person hob "Hob" at yard { Role "a lamplighter". Ancestry human. Peaceable. Pronouns he. }
  Initially Assert wants(hob, candle).
  Goal false.`;
const two = [{ name: 'Ama', raceId: 'human', classId: 'warrior' }, { name: 'Bek', raceId: 'dwarf', classId: 'cleric' }];
const owner = (t: Tiny, item: string) => t.world.related('ownedItem').find(r => r.args[0] === item)?.args[1];
const command = (t: Tiny, re: RegExp) => t.journey.choices().find(c => re.test(c.command))?.command;

describe('a thing carried, passed about', () => {
  it('goes from one of the company to the other and back, and to one who wants it', async () => {
    const t = await Tiny.start(yard, { party: two });
    const [ama, bek] = ['t__member_party_1', 't__member_party_2'], torch = 't__party_1__torch';
    const others = () => JSON.stringify(t.world.related('ownedItem').filter(r => r.args[0] !== torch));
    const before = others();
    expect(owner(t, torch)).toBe(ama);
    await t.perform(command(t, new RegExp(`^transfer_item\\(${torch},${bek}\\)`))!);
    expect(owner(t, torch)).toBe(bek);
    expect(others()).toBe(before);
    await t.perform(command(t, new RegExp(`^transfer_item\\(${torch},${ama}\\)`))!);
    expect(owner(t, torch)).toBe(ama);
    await t.perform(command(t, /^give\(t__party_1__candle,t__hob\)/)!);
    expect(owner(t, 't__party_1__candle')).toBeUndefined();
    expect(t.world.test(ModuleWriter.call('keeps', 't__hob', 't__party_1__candle'))).toBe(true);
  });
});
