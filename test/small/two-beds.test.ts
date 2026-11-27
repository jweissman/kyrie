import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner } from '../../src/cli/runner';

// A host who gives a bed for nothing beside the one they let (cold play 1 and 4, 25 November: the order's errand
// gives the reference shrine's keeper a free bed in the back for the letter, and the keeper already lets a pallet by
// the fire for a coin). Working for one's keep and singing for one's supper are the host's, not a bed's: they had been
// offered once for each bed, the same words twice, and the engine refused to show either ("Ambiguous public command"),
// so the runner died on the first act and the page could not draw the shrine. Working for a bed that is given anyway
// is no bargain: they are offered for the bed that is let.
const shrine = (free: boolean) => `
  Place shrine "the shrine" is room at 0, 0 indoors.
  Company party "You" of 1 at shrine. Initially Set quantity(party, gold) to 5.
  Person keeper "Branwen" at shrine { Profession priest. Peaceable.
    Offers lodging "a pallet by the fire" for 1 coin. }
  ${free ? 'Entity bed: service "the bed in the back". Initially Assert serviceOf(bed, lodging). Initially Set fee(bed) to 0. Initially Assert offers(keeper, bed).' : ''}
  Goal false.`;
// The rows as the runner offers them to a blind player once turned to the keeper (a host's services are offered in
// talk), as the page draws them.
const rows = async (t: Tiny): Promise<string[]> => {
  // What is had of them for coin or work is under Trade (the engine's question, OR-1451).
  const r = new Runner(t.session);
  await r.ask(JSON.stringify({ act: 't__keeper#talk' }));
  const s = await r.ask(JSON.stringify({ act: 'focus:trade:on' }));
  if ('error' in s) { throw new Error(s.error); }
  return [...s.offer?.primary ?? [], ...s.offer?.rest ?? []].map(r => r.label);
};
describe('a host with a free bed beside a let one', () => {
  it('is drawn, with each bed to take and the work for the keep offered once', async () => {
    const offered = await rows(await Tiny.start(shrine(true), { horizon: ['services'] }));
    expect(offered.filter(l => /^Take .* from Branwen/.test(l)).length, offered.join(" | ")).toBe(2);
    expect(offered.filter(l => l === 'Work for Branwen for your keep').length).toBe(1);
  });
  it('offers the work for the keep where the bed is only let', async () => {
    const offered = await rows(await Tiny.start(shrine(false), { horizon: ['services'] }));
    expect(offered.filter(l => l === 'Work for Branwen for your keep').length, offered.join(' | ')).toBe(1);
  });
});
