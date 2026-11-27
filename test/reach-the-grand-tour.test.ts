import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

describe('The Grand Tour, under the count', () => {
  it('finds the harbour coin before the war and exposes the Blue Cords’ false tide', async () => {
    const quiet = await Journey.start('data/campaigns/the-grand-tour.campaign.json', 'reach-tour');
    Placed.at(quiet, 'sennet__pumphrey_office');
    await quiet.play('Lift the new nail from the Harbourmaster’s ledger shelf');
    expect(quiet.holds('sennet__tourCoinFound', 'party')).toBe(true);

    const j = await Journey.start('data/campaigns/the-grand-tour.campaign.json', 'reach-tour-war');
    j.assert('befell', 'ash_count_begun');
    Placed.at(j, 'sennet__pumphrey_office');
    await j.play('=+1');
    expect(j.holds('at', 'tour_spymaster', 'sennet__pumphrey_office')).toBe(true);
    expect(j.holds('at', 'tour_couriers', 'sennet__pumphrey_office')).toBe(true);
    await j.play('Compare the two tide marks in Pumphrey’s ledger');
    await j.play('Show Pumphrey the false tide mark');
    expect(j.holds('befell', 'spymaster_broken')).toBe(true);
  }, 20000);
});
