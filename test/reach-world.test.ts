import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

// The long campaign's reach into every adventure: a counting-coin behind an out-of-the-way search, the place's mood
// once the Ash begins to count, what it makes of a company's oath, and (in twelve of them) one of the Ash's
// lieutenants, broken or served. Each case plays one adventure's campaign with the world events asserted as the
// long campaign would assert them.
const arrive = async (adventure: string, place: string, events: string[] = [], seed = 'reach') => {
  const j = await Journey.start(`data/campaigns/${adventure}.campaign.json`, seed);
  for (const e of events) { j.assert('befell', e); }
  Placed.at(j, `${adventure}__${place}`);
  await j.play('=+1');
  return j;
};

describe('Hexworth, under the count', () => {
  it('hides a coin under the drowned, and lets Father Culver read the Hierophant out of the chapel', async () => {
    const quiet = await arrive('hexworth', 'nave');
    expect(quiet.holds('at', 'hx_hierophant', 'hexworth__nave')).toBe(false);
    await quiet.play('Pick out the patch of new mortar under the lowest tablet');
    expect(quiet.holds('hexworth__hxCoinFound', 'party')).toBe(true);
    const j = await arrive('hexworth', 'nave', ['ash_count_begun']);
    expect(j.holds('at', 'hx_hierophant', 'hexworth__nave')).toBe(true);
    expect(j.holds('at', 'hexworth__hx_blank_bearers', 'hexworth__nave')).toBe(true);
    expect(j.offers('Promise the Hierophant')).toBe(false);
    await j.play('Lift the seat of the Hierophant\'s pew', 'Show Father Culver the Hierophant\'s register');
    expect(j.holds('befell', 'hierophant_broken')).toBe(true);
    expect(j.holds('at', 'hx_hierophant', 'hexworth__nave')).toBe(false);
  }, 20000);
});
