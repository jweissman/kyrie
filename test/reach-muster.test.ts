import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const arrive = async (place: string, events: string[] = [], advance = true) => {
  const j = await Journey.start('data/campaigns/muster.campaign.json', 'reach-muster');
  for (const event of events) { j.assert('befell', event); }
  Placed.at(j, `muster__${place}`);
  if (advance) { await j.play('=+1'); }
  return j;
};

describe('Muster, under the count', () => {
  it('finds the road coin, brings Hask with the war, and lets the reeve break his column', async () => {
    const quiet = await arrive('causeway2', [], false);
    await quiet.play('Lift the loose stone under the XLI milestone');
    expect(quiet.holds('muster__muCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await arrive('green', ['ash_count_begun']);
    expect(j.holds('at', 'mu_general', 'muster__green')).toBe(true);
    expect(j.holds('at', 'mu_column', 'muster__green')).toBe(true);
    Placed.at(j, 'muster__causeway2');
    await j.play("Search the unnumbered mile for the cohort's sealed order");
    Placed.at(j, 'muster__green');
    await j.play("Show Cattermole the Cohort's sealed road order");
    expect(j.holds('befell', 'general_broken')).toBe(true);
  }, 20000);
});
