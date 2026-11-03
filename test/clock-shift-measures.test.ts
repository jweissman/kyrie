import { describe, expect, it } from 'bun:test';
import { ClockShift } from '../src/campaign/clock-shift';

// A module installed after the game began reads the clock by its own watch; what it writes into a measure of the
// world it joins is in the world's time, which the world's rules read (GTR-01: a toll's day written as the module's),
// and what it writes into its own measures, prefixed by it, or of its own things (a matter's since), in its own (Half
// the Hive's scent, left in the world's time, wore off before it was put on).
describe('a placed module\'s writes to measures', () => {
  it('keeps the world\'s measures in the world\'s time, and its own in its own', () => {
    const watch = { kind: 'call', name: 'watch', args: ['clock'] };
    const set = (name: string, of = 'party') => ({ kind: 'set', call: { kind: 'call', name, args: [of] }, value: watch });
    const rule = { id: 'p__r', when: { kind: 'boolean', value: true }, effects: [set('tollDay'), set('p__scentUntil'),
      set('matterSince', 'p__call')] };
    const module = { rules: [rule], observations: [], objectives: [], actions: [], entities: [], queries: [],
      initial: [] } as never;
    ClockShift.apply(module, { schemas: [], actors: [], outcomes: [] } as never, 'p', 200);
    const [toll, scent, matter] = (module as { rules: { effects: { value: unknown }[] }[] }).rules[0]!.effects;
    expect(toll!.value).toEqual(watch);
    const own = { kind: 'arith', op: '-', left: watch, right: { kind: 'number', value: 288 } };
    expect([scent!.value, matter!.value]).toEqual([own, own]);
  });
});
