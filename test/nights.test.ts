import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { FictionalTime } from '../src/campaign/fictional-time';
import { ClockShift } from '../src/campaign/clock-shift';
import type { Change, Instance, Module, Predicate } from '../src/lang/module';
import { ModuleWriter } from '../src/lang/module-writer';

// The Liberty of the Ice's 6 (ICE-06): the day turns at midnight, and the small hours belong to the night before, so
// "the second night" written as the third day's small hours was the third. nightCount(clock) counts the night that
// falls on a day, from noon that day until noon the next. And a country placed in a world under way counts its days
// and nights from its first morning, as it counts its watches (Parliament of Books' Court sat on the world's fourth
// day, not its own).
describe('the nights', () => {
  it('are counted from noon to noon, so a night keeps its small hours', () => {
    const at = (day: number, hour: number) => Journey.watchAt(0, [String(day), String(hour), '00']);
    expect([at(1, 8), at(1, 21), at(2, 2), at(2, 21), at(3, 2), at(3, 11)].map(w => FictionalTime.nightOf(w)))
      .toEqual([0, 1, 1, 2, 2, 2]);
  });
  it('are a measure a module reads: the second night\'s small hours come on the third day', async () => {
    const j = await Journey.start('test/fixtures/probes/nights/probe.campaign.json');
    expect(await j.play('=day 3 01:00', '=until heard(party)')).toContain('Something scratches at the bothy door.');
    expect(j.watch()).toBe(Journey.watchAt(0, ['3', '2', '00']));
  }, 30000);
  it('are a placed country\'s own, from its first morning, as its days and watches are', () => {
    const day = (op: '==' | '>=', n: number): Predicate => ({ kind: 'compare', operator: op,
      left: ModuleWriter.call('day', 'clock'), right: { kind: 'number', value: n } });
    const kept: Change = { kind: 'set', call: ModuleWriter.call('p__keptOn', 'p__crew'),
      value: ModuleWriter.call('nightCount', 'clock') };
    const module = { entities: [], relations: [], measures: [], queries: [], kinds: [], actions: [], initial: [],
      rules: [{ id: 'p__court', when: day('==', 4), effects: [kept] }] } as unknown as Module;
    // Reached at watch 200, on the second day: its first morning is the third.
    ClockShift.apply(module, { schemas: [], actors: [], outcomes: [] } as unknown as NonNullable<Instance['campaign']>, 'p', 200);
    expect(module.rules![0]!.when).toEqual(day('==', 6));
    expect((module.rules![0]!.effects[0] as Extract<Change, { kind: 'set' }>).value).toEqual({ kind: 'arith', op: '-',
      left: ModuleWriter.call('nightCount', 'clock'), right: { kind: 'number', value: 2 } });
  });
});
