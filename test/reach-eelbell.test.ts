import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('Eelbell, under the count', () => {
  it('finds the Warden coin and uses Wickens’s smoke to evade the collectors', async () => {
    const quiet = await Journey.start('data/campaigns/eelbell.campaign.json', 'reach-eelbell-coin');
    Placed.at(quiet, 'eelbell__gate_foot');
    await quiet.play('=+1');
    await quiet.play('Probe the old tide-mark under the tower wall');
    expect(quiet.holds('eelbell__elCoinFound', 'party')).toBe(true);
    expect(quiet.holds('holding', 'party', 'count_coin')).toBe(true);

    const j = await Journey.start('data/campaigns/eelbell.campaign.json', 'reach-eelbell-ash');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'eelbell__clearing');
    await j.play('=+1');
    expect(j.holds('at', 'eelbell__el_factor', 'eelbell__clearing')).toBe(true);
    await j.play("Mind the clamp's vents for Wickens while he walks his legs");
    expect(j.holds('eelbell__helpedWickens', 'party')).toBe(true);
    await j.play('Turn Wickens’s vents and lose the tally in the smoke');
    expect(j.holds('eelbell__elSmokeTurn', 'party')).toBe(true);
    expect(j.holds('at', 'eelbell__el_factor', 'eelbell__clearing')).toBe(false);
  }, 20000);
});
