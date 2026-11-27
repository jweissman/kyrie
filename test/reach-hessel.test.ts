import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('Hessel, under the count', () => {
  it('finds a lovers’ coin and uses Mr Pyne’s banns to turn aside the Ash press', async () => {
    const quiet = await Journey.start('data/campaigns/hessel.campaign.json', 'reach-hessel-coin');
    Placed.at(quiet, 'hessel__sham_castle');
    await quiet.play('=+1');
    await quiet.play('Ease the loose stone behind the Sham Castle');
    expect(quiet.holds('hessel__hsCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await Journey.start('data/campaigns/hessel.campaign.json', 'reach-hessel-ash');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'hessel__vestry');
    await j.play('=+1');
    expect(j.holds('at', 'hessel__hs_reader', 'hessel__vestry')).toBe(true);
    await j.play("Ask Mr Pyne to read the banns through the Ash's count");
    expect(j.holds('hessel__hsPyneHolds', 'party')).toBe(true);
    expect(j.holds('at', 'hessel__hs_reader', 'hessel__vestry')).toBe(false);
  }, 20000);
});
