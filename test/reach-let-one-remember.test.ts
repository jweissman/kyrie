import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const arrive = async (place: string, events: string[] = [], advance = true) => {
  const j = await Journey.start('data/campaigns/let-one-remember.campaign.json', 'reach-corrow');
  for (const event of events) { j.assert('befell', event); }
  Placed.at(j, `corrow__${place}`);
  if (advance) { await j.play('=+1'); }
  return j;
};

describe('Corrow, under the count', () => {
  it('finds the Chain coin, brings Brann with the war, and lets the charge-holders refuse her hooks', async () => {
    const quiet = await arrive('hoist_house', [], false);
    await quiet.play('Ease the old bolt out of the hoist-house beam');
    expect(quiet.holds('corrow__lrCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await arrive('chain', ['ash_count_begun']);
    expect(j.holds('at', 'lr_engineer', 'corrow__chain')).toBe(true);
    expect(j.holds('at', 'lr_riggers', 'corrow__chain')).toBe(true);
    Placed.at(j, 'corrow__hoist_house');
    await j.play("Search the hoist-house for the Chain's first survey");
    Placed.at(j, 'corrow__chain');
    await j.play("Show the charge-holders the Chain's first survey");
    expect(j.holds('befell', 'engineer_broken')).toBe(true);
  }, 20000);
});
