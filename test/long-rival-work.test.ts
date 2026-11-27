import { describe, expect, it } from 'bun:test';
import type { TickHost } from '../src/campaign/campaign-tick';
import { Consequences } from '../src/campaign/consequences';
import { ModuleWriter } from '../src/lang/module-writer';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { campaign } from './support/long-road';

describe('Linnet prepares the bank', () => {
  it('only credits the work after an uninterrupted hour', async () => {
    const j = await Journey.start(campaign, 'rival-work');
    j.assert('lcStarted', 'party');
    j.assert('lcRivalWorking', 'party');
    const due = j.watch() + 6;
    const work = ModuleWriter.call('tallow__lcRivalWorkDue', 'party');
    const raid = ModuleWriter.call('tallow__lcRaidAt', 'party');
    j.campaign.commitWorld(j.campaign.world.apply([
      { kind: 'set', call: work, value: ModuleWriter.number(due) },
      { kind: 'set', call: raid, value: ModuleWriter.number(due + 30) },
    ]));
    Placed.at(j, 'tallow__garden');
    await j.play(`==${due - 1}`);
    expect(j.holds('lcPrepared', 'party')).toBe(false);
    expect(j.holds('lcRivalHelp', 'party')).toBe(false);
    const food = j.measure('quantity', 'lc_rival', 'rations');
    await j.play('==+1');
    expect(j.holds('lcPrepared', 'party')).toBe(true);
    expect(j.holds('lcRivalHelp', 'party')).toBe(true);
    expect(j.measure('quantity', 'lc_rival', 'rations')).toBe(food - 1);
    expect(j.measure('lcRaidAt', 'party')).toBe(due + 48);
  }, 10000);

  it('does not finish work after Linnet is killed', async () => {
    const j = await Journey.start(campaign, 'rival-work-death');
    j.assert('lcStarted', 'party');
    j.assert('lcRivalWorking', 'party');
    j.assert('struckDead', 'lc_rival');
    Consequences.slay(j.campaign as unknown as TickHost);
    await j.play('==+8');
    expect(j.holds('lcRivalWorking', 'party')).toBe(false);
    expect(j.holds('lcPrepared', 'party')).toBe(false);
    expect(j.holds('lcRivalHelp', 'party')).toBe(false);
  }, 10000);
});
