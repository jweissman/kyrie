import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';

const campaign = 'data/adventures/tallow/long-campaign.campaign.json';

describe('The road under the hill: a breathing-space', () => {
  it('lets the company buy a withdrawal with food, without killing or respawning the raiders', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
      'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green',
      'Sell the buyer a drawing of the entrances', '=+18', 'Hear the Ferryman\'s offer', '==+95',
      'Ask what it would take to withdraw his men');
    expect(j.holds('lcOccupied', 'party')).toBe(true);
    expect(j.offers('Give the Ferryman four rations to withdraw his men')).toBe(false);
    await j.play('Into Usk\'s store', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration',
      'Out to Swallet green');
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Give the Ferryman four rations to withdraw his men');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 4);
    expect(j.measure('lcFoeFood', 'party')).toBe(4);
    expect(j.holds('lcOccupied', 'party')).toBe(false);
    expect(j.at('lc_raiders')).not.toBe('tallow__bank');
    expect(j.holds('able', 'lc_raiders')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('==+42');
    expect(resumed.holds('lcTruce', 'party')).toBe(true);
    expect(resumed.holds('lcOccupied', 'party')).toBe(false);
    expect(resumed.at('lc_raiders')).not.toBe('tallow__bank');
  }, 120000);

  it('withdraws the road guard and lets interrupted work resume', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
      'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren why the road matters', 'Ask Merren what she needs from Swallet',
      'Out to Swallet green', 'Sell the buyer a drawing of the entrances',
      'Into the Chandler\'s Arms', 'Tell Merren what happened to the drawing',
      'Give two days of rations to Merren\'s repair crew',
      '==+60', 'Out to Swallet green', 'Hear the Ferryman\'s offer');
    Placed.at(j, 'tallow__calx_way');
    await j.play('Wait a while');
    Placed.at(j, 'tallow__green');
    await j.play('Tell the Ferryman the road runs through the hill', 'Into the Chandler\'s Arms',
      'Ask the road crew what they can repair', '==+15',
      'Send Merren\'s crew to clear the western portal', '==+30');
    expect(j.holds('lcWorkPaused', 'party')).toBe(true);
    expect(j.at('lc_vanguard')).toBe('tallow__calx_portal');
    expect(j.holds('lcConvoyOrdered', 'party')).toBe(true);
    expect(j.holds('lcConvoyArrived', 'party')).toBe(false);
    await j.play('Out to Swallet green', 'Ask what it would take to withdraw his men',
      'Into Usk\'s store', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration',
      'Out to Swallet green', 'Give the Ferryman four rations to withdraw his men', '==+24');
    expect(j.at('lc_vanguard')).not.toBe('tallow__calx_portal');
    expect(j.holds('lcWorkPaused', 'party')).toBe(false);
    expect(j.holds('lcClearedByCrew', 'party')).toBe(true);
    expect(j.holds('lcFoeDug', 'party')).toBe(false);
    expect(j.holds('lcConvoyArrived', 'party')).toBe(false);
  }, 120000);

  it('cancels a road guard ordered before the withdrawal but not yet arrived', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
      'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren what she needs from Swallet', 'Out to Swallet green',
      'Sell the buyer a drawing of the entrances', '=+18', 'Hear the Ferryman\'s offer', '==+30');
    Placed.at(j, 'tallow__calx_way');
    await j.play('Wait a while');
    Placed.at(j, 'tallow__green');
    await j.play('Tell the Ferryman the road runs through the hill', '==+23',
      'Ask what it would take to withdraw his men', 'Into Usk\'s store',
      'Buy › A ration', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration',
      'Out to Swallet green', 'Give the Ferryman four rations to withdraw his men', '==+45');
    expect(j.holds('lcVanguardArrived', 'party')).toBe(false);
    expect(j.at('lc_vanguard')).not.toBe('tallow__calx_portal');
  }, 120000);

  it('lets Merren bargain over her old acquaintance without changing his allegiance', async () => {
    const j = await Journey.start(campaign, 'long-road');
    await j.play('To Swallet lane', 'To Swallet green', 'To the Brasiers\' garden',
      'To the Day-Level portal', 'To the adit', 'To the Day-Level portal',
      'To the Brasiers\' garden', 'To Swallet green', 'Into the Chandler\'s Arms',
      'Ask Merren who else wants the road', 'Ask Merren what she needs from Swallet',
      'Out to Swallet green', 'Sell the buyer a drawing of the entrances', '=+18',
      'Hear the Ferryman\'s offer', 'Into the Chandler\'s Arms',
      'Ask Merren about the Ferryman\'s paper boats', '==+75',
      'Out to Swallet green', 'Ask what it would take to withdraw his men',
      'Into the Chandler\'s Arms');
    const before = j.watch();
    await j.play('Ask Merren to bargain with the Ferryman');
    expect(j.watch() - before).toBe(6);
    expect(j.at('lc_raiders')).toBe('tallow__bank');
    await j.play('Out to Swallet green', 'Into Usk\'s store',
      'Buy › A ration', 'Buy › A ration', 'Buy › A ration', 'Out to Swallet green');
    expect(j.offers('Give the Ferryman four rations to withdraw his men')).toBe(false);
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Give the Ferryman three rations to withdraw his men');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 3);
    expect(j.measure('lcFoeFood', 'party')).toBe(3);
    expect(j.holds('lcTruce', 'party')).toBe(true);
    expect(j.at('lc_raiders')).not.toBe('tallow__bank');
  }, 120000);
});
