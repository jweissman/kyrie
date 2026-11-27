import { describe, expect, it } from 'bun:test';
import { Consequences } from '../src/campaign/consequences';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the way through the ring', () => {
  it('opens after the fighters fall and leads to the field and back', async () => {
    const j = await Journey.start(campaign, 'long-road');
    Placed.at(j, 'tallow__lc_ring');
    // Isolate passage and victory mechanics from the independently exercised fights.
    j.assert('lcArenaStarted', 'party');
    j.assert('lcArenaBet', 'party');
    for (const foe of ['lc_fencers', 'lc_young_dragon', 'lc_shades']) {
      j.assert('struckDead', foe);
    }
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('Wait a while');
    expect(j.holds('lcArenaWon', 'party')).toBe(true);
    expect(j.measure('lcReturnsOvercome', 'party')).toBe(0);
    const gold = j.measure('quantity', 'party', 'gold');
    const purse = j.measure('quantity', 'lc_ring_keeper', 'gold');
    await j.play('Collect five coin from the ring keeper');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold + 5);
    expect(j.measure('quantity', 'lc_ring_keeper', 'gold')).toBe(purse - 5);
    expect(j.offers('Collect five coin from the ring keeper')).toBe(false);
    await j.play('To the scorched walk', 'To the door of spears', 'To the field of the returning');
    expect(j.at('party')).toBe('tallow__lc_battlefield');
    await j.play('To the door of spears');
    expect(j.at('party')).toBe('tallow__lc_war_door');
  }, 10000);
});
