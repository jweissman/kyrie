import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('The Lull, under the count', () => {
  it('finds the wheel coin before the war and lets the old stones correct Aeleth', async () => {
    const quiet = await Journey.start('data/campaigns/the-lull.campaign.json', 'reach-lull');
    Placed.at(quiet, 'lull__wheel_pit');
    await quiet.play('Pry up the pale mortar under the wheel’s lowest spoke');
    expect(quiet.holds('lull__lulCoinFound', 'party')).toBe(true);

    const j = await Journey.start('data/campaigns/the-lull.campaign.json', 'reach-lull-war');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'lull__strike_post');
    await j.play('=+1');
    expect(j.holds('at', 'lul_aeleth', 'lull__strike_post')).toBe(true);
    expect(j.holds('at', 'lul_stone_guard', 'lull__strike_post')).toBe(true);
    await j.play('Trace the old turn-marks on the striker stone');
    await j.play('Show Aeleth the old count of the strikers’ turns');
    expect(j.holds('befell', 'stone_elf_broken')).toBe(true);
  }, 20000);
});
