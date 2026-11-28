import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner } from '../../src/cli/runner';

// What an act takes from the purse is said on it before it is taken (OR-694, cold play 2 of 25 November): "Take a bed
// and supper from Warryn" took three coin, and nothing on the row had said so, where a purchase says its price. Said
// by what the act does (it decreases the company's gold), for every client, and nothing said of one that is free.
const inn = (fee: number) => `
  Place inn "the inn" is room at 0, 0 indoors.
  Company party "You" of 1 at inn. Initially Set quantity(party, gold) to 5.
  Person keeper "Warryn" at inn { Profession innkeeper. Peaceable.
    Offers lodging "a bed and supper" for ${fee} coin. }
  Goal false.`;
const rows = async (t: Tiny): Promise<string[]> => {
  // What is had of them for coin is under Trade (the engine's question, OR-1451).
  const r = new Runner(t.session);
  await r.ask(JSON.stringify({ act: 't__keeper#talk' }));
  const s = await r.ask(JSON.stringify({ act: 'focus:trade:on' }));
  if ('error' in s) { throw new Error(s.error); }
  return [...s.offer?.primary ?? [], ...s.offer?.rest ?? []].map(r => r.label);
};
describe('a bed that is paid for', () => {
  it('says its fee on its row, and a free one says none', async () => {
    const paid = await rows(await Tiny.start(inn(3), { horizon: ['services'] }));
    expect(paid.filter(l => /^Take a bed and supper from Warryn/.test(l)), paid.join(' | '))
      .toEqual(['Take a bed and supper from Warryn · 3 coin']);
    const free = await rows(await Tiny.start(inn(0), { horizon: ['services'] }));
    expect(free.filter(l => /^Take a bed and supper/.test(l))).toEqual(['Take a bed and supper from Warryn']);
  });
});
