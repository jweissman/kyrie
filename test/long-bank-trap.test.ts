import { describe, expect, it } from 'bun:test';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('the bank rockfall', () => {
  it('credits a blocked path only after the work is finished', async () => {
    const j = await Journey.start(campaign, 'bank-block');
    j.assert('lcStarted', 'party');
    j.assert('lcBankBlocking', 'party');
    const due = j.watch() + 6;
    j.campaign.commitWorld(j.campaign.world.apply([
      { kind: 'set', call: ModuleWriter.call('tallow__lcBankBlockDue', 'party'), value: ModuleWriter.number(due) },
      { kind: 'set', call: ModuleWriter.call('tallow__lcRaidAt', 'party'), value: ModuleWriter.number(due + 30) },
    ]));
    Placed.at(j, 'tallow__bank');
    await j.play(`==${due - 1}`);
    expect(j.holds('lcPrepared', 'party')).toBe(false);
    expect(j.measure('lcRaidAt', 'party')).toBe(due + 30);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play('==+1');
    expect(resumed.holds('lcPrepared', 'party')).toBe(true);
    expect(resumed.measure('lcRaidAt', 'party')).toBe(due + 48);
  }, 10000);

  it('does not credit work abandoned before the hour is up', async () => {
    const j = await Journey.start(campaign, 'bank-block-interrupted');
    j.assert('lcStarted', 'party');
    j.assert('lcBankBlocking', 'party');
    const due = j.watch() + 6;
    j.campaign.commitWorld(j.campaign.world.apply([
      { kind: 'set', call: ModuleWriter.call('tallow__lcBankBlockDue', 'party'), value: ModuleWriter.number(due) },
      { kind: 'set', call: ModuleWriter.call('tallow__lcRaidAt', 'party'), value: ModuleWriter.number(due + 30) },
    ]));
    Placed.at(j, 'tallow__green');
    await j.play(`==${due}`);
    expect(j.holds('lcBankBlocking', 'party')).toBe(false);
    expect(j.holds('lcPrepared', 'party')).toBe(false);
    expect(j.measure('lcRaidAt', 'party')).toBe(due + 30);
  }, 10000);

  it('uses a rope and falls on a raider before the ensuing fight', async () => {
    const j = await Journey.start(campaign, 'bank-rockfall');
    j.assert('knows', 'party', 'lc_drawing_risk');
    Placed.at(j, 'tallow__green');
    await j.play('Sell the buyer a drawing of the entrances');
    Placed.at(j, 'tallow__bank');
    expect(j.holds('holding', 'party', 'rope')).toBe(true);
    const before = j.watch();
    await j.play('Rig a basket of stones above the river path');
    expect(j.watch()).toBe(before + 6);
    expect(j.holds('holding', 'party', 'rope')).toBe(false);
    expect(j.holds('lcBankTrapReady', 'party')).toBe(true);
    const resumed = Journey.of(PlaySession.resume(
      JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true }));
    await resumed.play(`==${resumed.measure('lcStart', 'party') + 72}`);
    expect(resumed.at('lc_raiders')).toBe('tallow__bank');
    await resumed.fight('Drop the stones on the raiders');
    const combat = resumed.taken.at(-1)!.event.combat;
    const trap = combat.findIndex(e => (e.type === 'save' || e.type === 'damage')
      && e.actor === 'tallow__lc_bank_rockfall');
    const initiative = combat.findIndex(e => e.type === 'initiative');
    expect(trap).toBeGreaterThanOrEqual(0);
    expect(initiative).toBeGreaterThan(trap);
    expect(resumed.holds('lcBankTrapSpent', 'party')).toBe(true);
    expect(resumed.offers('Drop the stones on the raiders')).toBe(false);
  }, 10000);
});
