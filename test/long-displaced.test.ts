import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { campaign, prepared } from './support/long-road';

const withCarter = async () => {
  const j = await prepared();
  await j.play(`==${j.measure('lcRaidAt', 'party') + 48}`);
  await j.play('Out to Swallet green', 'Into Usk\'s store', 'Buy › A ration',
    'Out to Swallet green', 'Into the Chandler\'s Arms');
  return j;
};

const sentToWork = async () => {
  const j = await withCarter();
  await j.play('Ask Mab what happened at the bank', 'Give Mab a ration for the road',
    'Ask the road crew what they can repair', 'Send Merren\'s crew to clear the western portal',
    'Send Mab to help the road crew');
  await j.play(`==${j.measure('lcCarterWorkArrival', 'party')}`);
  return j;
};

describe('Mab after the bank is occupied', () => {
  it('travels to the inn and can bring real help to the road crew', async () => {
    const j = await withCarter();
    expect(j.holds('lcOccupied', 'party')).toBe(true);
    expect(j.at('lc_carter')).toBe('tallow__taproom');
    await j.play('Ask Mab what happened at the bank');
    const food = j.measure('quantity', 'party', 'rations');
    await j.play('Give Mab a ration for the road');
    expect(j.measure('quantity', 'party', 'rations')).toBe(food - 1);
    expect(j.measure('quantity', 'lc_carter', 'rations')).toBe(1);
    await j.play('Ask the road crew what they can repair', 'Send Merren\'s crew to clear the western portal',
      'Send Mab to help the road crew');
    expect(j.at('lc_carter')).not.toBe('tallow__calx_portal');
    await j.play(`==${j.measure('lcCarterWorkArrival', 'party')}`);
    expect(j.at('lc_carter')).toBe('tallow__calx_portal');
    expect(j.measure('quantity', 'lc_carter', 'rations')).toBe(0);
    expect(j.holds('lcCarterWorking', 'party')).toBe(true);
    const originalDue = j.measure('lcWorkDue', 'party');
    const saved = JSON.parse(JSON.stringify(j.session.checkpoint()));
    const resumed = Journey.of(PlaySession.resume(saved, { trusted: true }));
    await resumed.play(`==${resumed.measure('lcCarterWorkDue', 'party')}`);
    expect(resumed.holds('lcCarterHelped', 'party')).toBe(true);
    expect(resumed.measure('lcWorkDue', 'party')).toBe(originalDue - 6);
    await resumed.play(`==${resumed.measure('lcWorkDue', 'party')}`);
    expect(resumed.holds('lcClearedByCrew', 'party')).toBe(true);
    await resumed.play(`==${resumed.measure('lcCarterReturnDue', 'party')}`);
    expect(resumed.at('lc_carter')).toBe('tallow__taproom');
  }, 10000);

  it('leaves after twelve hours if no food is offered', async () => {
    const j = await withCarter();
    await j.play('Ask Mab what happened at the bank');
    await j.play(`==${j.measure('lcCarterHunger', 'party') - 1}`);
    expect(j.offers('Give Mab a ration for the road')).toBe(true);
    await j.play('==+1');
    expect(j.at('lc_carter')).not.toBe('tallow__taproom');
    expect(j.holds('lcCarterLeft', 'party')).toBe(true);
    expect(j.offers('Give Mab a ration for the road')).toBe(false);
  }, 10000);

  it('does not count interrupted work and starts another hour after the guard leaves', async () => {
    const j = await sentToWork();
    expect(j.holds('lcCarterWorking', 'party')).toBe(true);
    j.put('lc_vanguard', 'calx_portal');
    await j.play('==+6');
    expect(j.holds('lcCarterWorking', 'party')).toBe(false);
    expect(j.holds('lcCarterHelped', 'party')).toBe(false);
    expect(j.holds('lcWorkPaused', 'party')).toBe(true);
    j.put('lc_vanguard', 'west_end');
    await j.play('==+1');
    expect(j.holds('lcCarterWorking', 'party')).toBe(true);
    const due = j.measure('lcCarterWorkDue', 'party');
    expect(due - j.watch()).toBe(6);
    await j.play(`==${due}`);
    expect(j.holds('lcCarterHelped', 'party')).toBe(true);
  }, 10000);

  it('does not summon a carter killed before the bank is occupied', async () => {
    const j = await Journey.start(campaign, 'long-road');
    j.put('lc_raiders', 'bank');
    j.assert('struckDead', 'lc_carter');
    Consequences.slay(j.campaign as unknown as TickHost);
    j.assert('lcOccupied', 'party');
    await j.play('==+12');
    expect(j.holds('able', 'lc_carter')).toBe(false);
    expect(j.holds('lcCarterFled', 'party')).toBe(false);
    expect(j.holds('lcCarterArrived', 'party')).toBe(false);
  }, 10000);
});
