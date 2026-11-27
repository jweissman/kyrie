import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const arrive = async (place: string, events: string[] = [], advance = true) => {
  const j = await Journey.start('data/campaigns/parliament-of-books.campaign.json', 'reach-parliament');
  for (const event of events) { j.assert('befell', event); }
  Placed.at(j, `calamy__${place}`);
  if (advance) { await j.play('=+1'); }
  return j;
};

describe('Calamy, under the count', () => {
  it('finds the binder coin, brings Fell with the war, and lets Mott overturn his table', async () => {
    const quiet = await arrive('gutter_lane', [], false);
    await quiet.play('Lift the printer\'s type at the end of Gutter Lane');
    expect(quiet.holds('calamy__pbCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await arrive('chamber', ['ash_count_begun']);
    expect(j.holds('at', 'pb_fell', 'calamy__chamber')).toBe(true);
    expect(j.holds('at', 'pb_readers', 'calamy__chamber')).toBe(true);
    Placed.at(j, 'calamy__hall_floor');
    await j.play("for the suppressed first table");
    Placed.at(j, 'calamy__chamber');
    await j.play('Show Warden Mott the suppressed first table');
    expect(j.holds('befell', 'heretic_broken')).toBe(true);
  }, 20000);
});
