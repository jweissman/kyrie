import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

const arrive = async (place: string, events: string[] = [], advance = true) => {
  const j = await Journey.start('data/campaigns/quittance.campaign.json', 'reach-quittance');
  for (const event of events) { j.assert('befell', event); }
  Placed.at(j, `quittance__${place}`);
  if (advance) { await j.play('=+1'); }
  return j;
};

describe('Quittance, under the count', () => {
  it('finds the queue coin, brings Quorn with the war, and lets Tench read her out', async () => {
    const quiet = await arrive('cellar_arcade', [], false);
    await quiet.play('Turn the loose queue-stone in the Old Exchange');
    expect(quiet.holds('quittance__quCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await arrive('cellar_arcade', ['ash_count_begun']);
    expect(j.holds('at', 'qu_mother', 'quittance__cellar_arcade')).toBe(true);
    expect(j.holds('at', 'qu_fence', 'quittance__cellar_arcade')).toBe(true);
    await j.play("Search the coal ledger for the Exchange's first roll");
    await j.play("Show Tench the Exchange's first roll");
    expect(j.holds('befell', 'quorn_broken')).toBe(true);
  }, 20000);
});
