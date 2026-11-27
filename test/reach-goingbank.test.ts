import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const arrive = async (place: string, events: string[] = [], advance = true) => {
  const j = await Journey.start('data/campaigns/goingbank.campaign.json', 'reach-goingbank');
  for (const event of events) { j.assert('befell', event); }
  Placed.at(j, `goingbank__${place}`);
  if (advance) { await j.play('=+1'); }
  return j;
};

describe('Goingbank, under the count', () => {
  it('finds the knot-board coin, brings Redhand with the war, and lets Osbel turn his riders away', async () => {
    const quiet = await arrive('loft', [], false);
    await quiet.play('Pull the loose peg from the newest knot-board');
    expect(quiet.holds('goingbank__gbCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await arrive('plait_west', ['ash_count_begun']);
    expect(j.holds('at', 'gb_redhand', 'goingbank__plait_west')).toBe(true);
    expect(j.holds('at', 'gb_riders', 'goingbank__plait_west')).toBe(true);
    Placed.at(j, 'goingbank__loft');
    await j.play("Search the plaiters' loft for Sabra's oldest gap-cord");
    Placed.at(j, 'goingbank__plait_west');
    await j.play('Show Osbel the old cord\'s account of the moving bank');
    expect(j.holds('befell', 'redhand_broken')).toBe(true);
  }, 20000);
});
