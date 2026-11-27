import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const arrive = async (place: string, events: string[] = [], advance = true) => {
  const j = await Journey.start('data/campaigns/weatherdrove.campaign.json', 'reach-weatherdrove');
  for (const event of events) { j.assert('befell', event); }
  Placed.at(j, `weatherdrove__${place}`);
  if (advance) { await j.play('=+1'); }
  return j;
};

describe('Weatherdrove, under the count', () => {
  it('finds the pen coin, brings the Tallymen with the war, and lets Ysolde break their account', async () => {
    const quiet = await arrive('pen', [], false);
    await quiet.play('Cut the turf at the rim of the empty pen');
    expect(quiet.holds('weatherdrove__wdCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await arrive('heaps', ['ash_count_begun']);
    expect(j.holds('at', 'wd_tallymen', 'weatherdrove__heaps')).toBe(true);
    expect(j.holds('at', 'wd_coffle', 'weatherdrove__heaps')).toBe(true);
    Placed.at(j, 'weatherdrove__pan_house');
    await j.play("Search the pan-house for the first salt-hands' roster");
    Placed.at(j, 'weatherdrove__heaps');
    await j.play("Show Ysolde the erased salt-hands' roster");
    expect(j.holds('befell', 'tallymen_broken')).toBe(true);
  }, 20000);
});
