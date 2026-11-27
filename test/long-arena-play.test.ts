import { describe, expect, it } from 'bun:test';
import { Consequences } from '../src/campaign/consequences';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the drowned ring', () => {
  it('is discovered below the hill and starts an actual wagered fight', async () => {
    const j = await Journey.start(campaign, 'long-road');
    Placed.at(j, 'tallow__quiet_gallery');
    // Isolate the arena from the separately tested stalkers guarding the gallery.
    j.assert('struckDead', 'stalkers');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('Follow the marks behind the Quiet Gallery', 'To the drowned ring',
      'Ask the keeper what is beyond the ring');
    expect(j.holds('knows', 'party', 'lc_field_known')).toBe(true);
    const money = j.measure('quantity', 'party', 'gold');
    await j.fight('Wager two coin against the ring\'s fighters');
    expect(j.taken.at(-1)!.event.combat.some(e => e.type === 'initiative')).toBe(true);
    expect(j.measure('quantity', 'party', 'gold')).toBe(money - 2);
    expect(j.holds('lcArenaBet', 'party')).toBe(true);
    expect(j.holds('lcArenaStarted', 'party')).toBe(true);
  }, 10000);
});
