import { describe, expect, it } from 'bun:test';
import { Consequences } from '../src/campaign/consequences';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign, convoyOnPortal } from './support/long-road';

describe('The Ferryman provisions the road', () => {
  it('lets the company recover convoy food and leave the guard unfed once the other lines are stopped', async () => {
    const j = await convoyOnPortal();
    Placed.at(j, 'tallow__calx_portal');
    expect(j.offers('Take the supply party\'s remaining rations')).toBe(false);
    // Isolate the material consequences of defeating the party; combat is exercised separately.
    j.assert('struckDead', 'lc_convoy');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.campaign.refreshProjection();
    const before = j.measure('quantity', 'party', 'rations');
    await j.play('Take the supply party\'s remaining rations');
    expect(j.measure('quantity', 'party', 'rations')).toBe(before + 4);
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(0);
    expect(j.offers('Take the supply party\'s remaining rations')).toBe(false);
    Placed.at(j, 'tallow__green');
    await j.play(`==${j.measure('lcGuardDue', 'party')}`);
    expect(j.holds('lcGuardLeft', 'party')).toBe(true);
    expect(j.holds('lcCadorExclusive', 'party')).toBe(true);
    expect(j.holds('lcGuardSupplied', 'party')).toBe(false);
  }, 10000);

  it('does not send a supply party killed before its departure', async () => {
    const j = await Journey.start(campaign, 'convoy-dead-before-departure');
    j.put('lc_vanguard', 'calx_portal');
    j.assert('lcVanguardArrived', 'party');
    await j.play('Wait a while');
    expect(j.holds('lcConvoyOrdered', 'party')).toBe(true);
    const due = j.measure('lcConvoyDue', 'party');
    const food = j.measure('quantity', 'lc_convoy', 'rations');
    j.assert('struckDead', 'lc_convoy');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play(`==${due + 1}`);
    expect(j.holds('lcConvoyArrived', 'party')).toBe(false);
    expect(j.at('lc_convoy')).not.toBe('tallow__calx_portal');
    expect(j.measure('quantity', 'lc_convoy', 'rations')).toBe(food);
  }, 10000);
});
