import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { ModuleParser } from '../../src/lang/module-parser';
import type { Pursuit } from '../../src/lang/module';

// A Route (the maturity track's step 5): someone who keeps a round on the clock, lowered into the pursuits an author
// had written by hand, one for each leg, each repeating its window and the condition. The two modules that had
// written them (Sallowfield's riders, Quittance's Fettiplace at the wake) now say a Route, and compile to the very
// pursuits they had: their lines as they stood on 19 November are kept here, and the Route's must be them, key for
// key, so nothing a journey or a save reads can move.
class Hand {
  static readonly riders = [
    'Pursuit riders_scar for riders "riding the Scar road" priority 5 when watch(clock) >= 12 and watch(clock) < 48'
      + ' and not riders_gone(party) seeks at(riders, lookout).',
    'Pursuit riders_stone for riders "riding down to the standing stone" priority 5 when watch(clock) >= 48 and'
      + ' watch(clock) < 66 and not riders_gone(party) seeks at(riders, parley_stone).',
    'Pursuit riders_road for riders "riding the east road" priority 5 when watch(clock) >= 66 and watch(clock) < 80'
      + ' and not riders_gone(party) seeks at(riders, east_road).',
    'Pursuit riders_ford for riders "riding down to the ford" priority 5 when watch(clock) >= 80 and'
      + ' not riders_gone(party) seeks at(riders, ford_stones).'];
  static readonly wake = [
    'Pursuit wk_to_wake for wk_fettiplace "going up to the wake for the widows\' statements" priority 10 when'
      + ' watch(clock) >= 162 and watch(clock) < 336 seeks at(wk_fettiplace, teague_front).',
    'Pursuit wk_to_row for wk_fettiplace "going home to write it up" priority 10 when watch(clock) >= 336'
      + ' seeks at(wk_fettiplace, provid_counter).'];
  static pursuits(text: string): Pursuit[] { return ModuleParser.parse(text).pursuits ?? []; }
  static written(lines: string[]): Pursuit[] { return this.pursuits(`Module t "t" {\n${lines.join('\n')}\n}`); }
  // The module's Route as its file has it, read on its own (a module of Quittance's needs its setting to be read).
  static data(file: string, route: string): Pursuit[] {
    const block = new RegExp(`^ {2}Route ${route} [\\s\\S]*?^ {2}\\}`, 'm').exec(readFileSync(file, 'utf8'));
    return this.written([block![0]]);
  }
}

describe('a Route', () => {
  it('compiles Sallowfield\'s riders to the four pursuits written for them by hand, key for key', () => {
    const hand = Hand.written(Hand.riders);
    expect(JSON.stringify(Hand.data('data/adventures/sallowfield/clock.kyr', 'riders')))
      .toBe(JSON.stringify(hand));
  });
  it('compiles Quittance\'s Fettiplace to the two pursuits written for him by hand, key for key', () => {
    const hand = Hand.written(Hand.wake);
    expect(JSON.stringify(Hand.data('data/adventures/quittance/q_wake.kyr', 'wk_to')))
      .toBe(JSON.stringify(hand));
  });
  it('keeps its legs in order on the clock, and says so where one goes back', () => {
    expect(() => Hand.pursuits('Module t "t" {\n  Route r for keeper priority 5 {\n    up at hill from watch 20.\n'
      + '    down at yard from watch 10.\n  }\n}')).toThrow(/^Line 2, col 3: Route r's leg down begins at watch 10,/);
    const one = Hand.pursuits('Module t "t" { Route r for keeper priority 5 { up at hill from watch 20. } }');
    expect(one).toEqual([{ id: 'r_up', actor: 'keeper', priority: 5,
      when: { kind: 'compare', left: { kind: 'call', name: 'watch', args: ['clock'] }, right: { kind: 'number', value: 20 },
        operator: '>=' }, target: { kind: 'call', name: 'at', args: ['keeper', 'hill'] } }]);
  });
});
