import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

const sold = async (seed: string) => {
  const j = await Journey.start(campaign, seed);
  j.assert('knows', 'party', 'lc_drawing_risk');
  Placed.at(j, 'tallow__green');
  await j.play('Sell the buyer a drawing of the entrances');
  return j;
};

describe('the drawing changes hands', () => {
  it('physically reaches the Ferryman before it accelerates the raid', async () => {
    const j = await sold('map-delivery');
    const start = j.measure('lcStart', 'party');
    expect(j.holds('carries', 'lc_buyer', 'lc_entrances_drawing')).toBe(true);
    expect(j.measure('lcRaidAt', 'party')).toBe(start + 120);
    await j.play(`==${j.measure('lcBuyerDue', 'party')}`);
    expect(j.at('lc_buyer')).toBe('tallow__west_end');
    expect(j.at('lc_map_courier')).toBe('tallow__west_end');
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
    await j.play(`==${j.measure('lcMapExchangeDue', 'party')}`);
    expect(j.holds('carries', 'lc_map_courier', 'lc_entrances_drawing')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play(`==${resumed.measure('lcMapDue', 'party')}`);
    expect(resumed.at('lc_map_courier')).toBe('tallow__green');
    expect(resumed.holds('lcMapDelivered', 'party')).toBe(true);
    expect(resumed.holds('carries', 'lc_ferryman', 'lc_entrances_drawing')).toBe(true);
    expect(resumed.measure('lcRaidAt', 'party')).toBe(start + 72);
  }, 10000);

  it('lets the company catch the buyer and buy the same drawing back', async () => {
    const j = await sold('map-recovered');
    const start = j.measure('lcStart', 'party');
    await j.play('To Swallet lane', 'To the west road\'s end', `==${j.measure('lcBuyerDue', 'party')}`);
    expect(j.offers('Buy back the drawing for five coin')).toBe(true);
    const gold = j.measure('quantity', 'party', 'gold');
    const buyerGold = j.measure('quantity', 'lc_buyer', 'gold');
    await j.play('Buy back the drawing for five coin');
    expect(j.measure('quantity', 'party', 'gold')).toBe(gold - 5);
    expect(j.measure('quantity', 'lc_buyer', 'gold')).toBe(buyerGold + 5);
    expect(j.holds('carries', 'party', 'lc_entrances_drawing')).toBe(true);
    expect(j.holds('carries', 'lc_buyer', 'lc_entrances_drawing')).toBe(false);
    await j.play('==+36');
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
    expect(j.measure('lcRaidAt', 'party')).toBe(start + 120);
  }, 10000);

  it('lets the willow direct the company to the courier before she reaches the green', async () => {
    const j = await sold('map-willow');
    const start = j.measure('lcStart', 'party');
    await j.play('To Swallet lane', 'To the west road\'s end', 'Listen to the willow by the milestone');
    expect(j.offers('Ask the willow who took the drawing')).toBe(false);
    await j.play(`==${j.measure('lcBuyerDue', 'party')}`);
    await j.play(`==${j.measure('lcMapExchangeDue', 'party')}`);
    expect(j.holds('carries', 'lc_map_courier', 'lc_entrances_drawing')).toBe(true);
    await j.play('Ask the willow who took the drawing', 'To Swallet lane');
    expect(j.holds('knows', 'party', 'lc_willow_drawing')).toBe(true);
    expect(j.at('lc_map_courier')).toBe('tallow__lane');
    const gold = j.measure('quantity', 'party', 'gold');
    const courierGold = j.measure('quantity', 'lc_map_courier', 'gold');
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('Buy the drawing back from the courier for five coin');
    expect(resumed.measure('quantity', 'party', 'gold')).toBe(gold - 5);
    expect(resumed.measure('quantity', 'lc_map_courier', 'gold')).toBe(courierGold + 5);
    expect(resumed.holds('carries', 'party', 'lc_entrances_drawing')).toBe(true);
    await resumed.play('==+30');
    expect(resumed.holds('lcMapDelivered', 'party')).toBe(false);
    expect(resumed.measure('lcRaidAt', 'party')).toBe(start + 120);
  }, 10000);

  it('does not deliver the map if its courier is dead', async () => {
    const j = await sold('map-dead-courier');
    const start = j.measure('lcStart', 'party');
    j.assert('struckDead', 'lc_map_courier');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play(`==${start + 40}`);
    expect(j.at('lc_buyer')).not.toBe('tallow__west_end');
    expect(j.holds('carries', 'lc_buyer', 'lc_entrances_drawing')).toBe(true);
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
    expect(j.measure('lcRaidAt', 'party')).toBe(start + 120);
  }, 10000);

  it('leaves the drawing in the lane if the courier falls there', async () => {
    const j = await sold('map-courier-falls-in-lane');
    await j.play(`==${j.measure('lcBuyerDue', 'party')}`);
    await j.play(`==${j.measure('lcMapExchangeDue', 'party')}`);
    Placed.at(j, 'tallow__lane');
    await j.play(`==${j.measure('lcMapLaneDue', 'party')}`);
    j.assert('struckDead', 'lc_map_courier');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('Recover the drawing from the courier', '==+20');
    expect(j.holds('carries', 'party', 'lc_entrances_drawing')).toBe(true);
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
  }, 10000);

  it('lets the company recover the drawing from a dead buyer at the meeting', async () => {
    const j = await sold('map-dead-buyer');
    const start = j.measure('lcStart', 'party');
    await j.play('To Swallet lane', 'To the west road\'s end', `==${j.measure('lcBuyerDue', 'party')}`);
    j.assert('struckDead', 'lc_buyer');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('Recover the drawing from the buyer', '==+30');
    expect(j.holds('carries', 'party', 'lc_entrances_drawing')).toBe(true);
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
    expect(j.measure('lcRaidAt', 'party')).toBe(start + 120);
  }, 10000);

  it('keeps the courier waiting and preserves a defense when the Ferryman returns late', async () => {
    const j = await sold('map-late');
    const start = j.measure('lcStart', 'party');
    await j.play(`==${start + 19}`);
    j.put('lc_ferryman', 'taproom');
    Placed.at(j, 'tallow__bank');
    await j.play('Block the river path with loose stones', `==${start + 65}`);
    expect(j.holds('carries', 'lc_map_courier', 'lc_entrances_drawing')).toBe(true);
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
    expect(j.measure('lcRaidAt', 'party')).toBe(start + 138);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    resumed.put('lc_ferryman', 'green');
    await resumed.play('Wait a while');
    expect(resumed.holds('carries', 'lc_ferryman', 'lc_entrances_drawing')).toBe(true);
    expect(resumed.measure('lcRaidAt', 'party')).toBe(start + 96);
  }, 10000);

  it('does not reschedule a raid that has already arrived', async () => {
    const j = await sold('map-after-raid');
    const start = j.measure('lcStart', 'party');
    await j.play(`==${start + 19}`);
    j.put('lc_ferryman', 'taproom');
    await j.play(`==${start + 121}`);
    expect(j.holds('lcRaidArrived', 'party')).toBe(true);
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
    j.put('lc_ferryman', 'green');
    await j.play('Wait a while');
    expect(j.holds('carries', 'lc_ferryman', 'lc_entrances_drawing')).toBe(true);
    expect(j.measure('lcRaidAt', 'party')).toBe(start + 120);
  }, 10000);

  it('can recover the map from a fallen courier when the Ferryman cannot receive it', async () => {
    const j = await sold('map-dead-ferryman');
    const start = j.measure('lcStart', 'party');
    j.assert('struckDead', 'lc_ferryman');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play(`==${start + 40}`);
    expect(j.holds('carries', 'lc_map_courier', 'lc_entrances_drawing')).toBe(true);
    expect(j.holds('lcMapDelivered', 'party')).toBe(false);
    j.assert('struckDead', 'lc_map_courier');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('Recover the drawing from the courier');
    expect(j.holds('carries', 'party', 'lc_entrances_drawing')).toBe(true);
    expect(j.measure('lcRaidAt', 'party')).toBe(start + 120);
  }, 10000);
});
