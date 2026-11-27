import { describe, expect, it } from 'bun:test';
import { Consequences } from '../src/campaign/consequences';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the field of the returning', () => {
  it('restores its fallen fighters only after a delay and while the company is away', async () => {
    const j = await Journey.start(campaign, 'long-road');
    for (let cycle = 0; cycle < 2; cycle++) {
      Placed.at(j, 'tallow__lc_battlefield');
      j.assert('struckDead', 'lc_shades');
      Consequences.slay(j.campaign as unknown as TickHost);
      await j.play('Wait a while');
      expect(j.holds('lcShadesWaiting', 'lc_shades')).toBe(true);
      const due = j.measure('lcShadesDue', 'lc_shades');
      await j.play(`==${due}`);
      expect(j.holds('able', 'lc_shades')).toBe(false);
      Placed.at(j, 'tallow__lc_war_door');
      await j.play('Wait a while');
      expect(j.holds('able', 'lc_shades')).toBe(true);
      expect(j.at('lc_shades')).toBe('tallow__lc_battlefield');
      expect(j.holds('lcShadesWaiting', 'lc_shades')).toBe(false);
    }
  }, 10000);
});
