import { describe, expect, it } from 'bun:test';
import { DrawnWorld } from '../../../src/client/drawn-world';
import { NodeBundleSource } from '../../../src/campaign/node-bundle-source';
import { Journey } from '../../../src/session/journey';

// Who is on the first town's green, drawn by how the life began (data/generation/town/undertown.kyrt's hand; the
// difference census's first proposal): the drover's first town has a drover's lad, the debtor's a bailiff's man owed
// by the same creditor; each asked, would come along, as the green's others would.
const start = async (seed: string, origin: string) => Journey.of(await DrawnWorld.start(seed, { origin,
  party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] }, NodeBundleSource.shared));
describe('the first town\'s green, by the life begun', () => {
  it('has a drover\'s lad for the drover, and a bailiff\'s man for the debtor, each willing to come', async () => {
    const drove = await start('iscoed', 'drove');
    await drove.play('>s1_green', 'Ask the drover.s lad where his drove went');
    expect(drove.latest).toContain('Sold at the march, and me with nothing to drive');
    expect(drove.holds('willing', 'region__s1_u_hand', 'party')).toBe(true);
    const debt = await start('a1', 'debt');
    await debt.play('>s1_green', 'Ask the bailiff.s man what he is waiting for');
    expect(debt.latest.replace(/[‘’]/g, "'")).toContain('Same as you\'re waiting to pay');
    expect(debt.holds('willing', 'region__s1_u_hand', 'party')).toBe(true);
  }, 300000);
});
