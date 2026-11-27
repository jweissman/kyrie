import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('The House That Grows, under the count', () => {
  it('finds the well coin before the war and sends Sabine away with Haddo’s evidence', async () => {
    const quiet = await Journey.start('data/campaigns/the-house-that-grows.campaign.json', 'reach-hhg');
    Placed.at(quiet, 'hhg__haddo_well');
    await quiet.play('Lift the reset stone beside Haddo’s well');
    expect(quiet.holds('hhg__htgCoinFound', 'party')).toBe(true);

    const j = await Journey.start('data/campaigns/the-house-that-grows.campaign.json', 'reach-hhg-war');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'hhg__barley');
    await j.play('=+1');
    expect(j.holds('at', 'htg_sabine', 'hhg__barley')).toBe(true);
    expect(j.holds('at', 'htg_panes', 'hhg__barley')).toBe(true);
    Placed.at(j, 'hhg__root_cellar');
    await j.play('Read the backward tally scratched inside the glass room');
    Placed.at(j, 'hhg__barley');
    await j.play('Show Haddo Sabine’s backward tally');
    expect(j.holds('befell', 'glass_mage_broken')).toBe(true);
  }, 20000);
});
