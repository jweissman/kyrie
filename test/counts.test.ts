import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { World } from '../src/lang/world';
import type { Call, Change } from '../src/lang/module';

// One rule for counts, which apply and admits keep alike (the architecture review's A18, from its probe
// lang-runtime-semantics R2 and R3): a rule's Decrease stopped at nothing where an action's was refused, [-5, +5] gave
// 5 where [+5, -5] gave 3, a quantity set below nothing was kept by apply and refused by admits, and admits read a die
// as a count of nothing.
class Ledger {
  static gold: Call = { kind: 'call', name: 'gold', args: ['ann'] };
  static world(body = '') {
    const m = ModuleParser.parse(`Module p "P" { Kind group. Kind thing. Kind clock. Measure gold(group).
      Measure dice(entity). Measure watch(clock). Entity ann: group "Ann". Entity cup: thing "cup".
      Entity clock: clock "clock". Initially Set gold(ann) to 3. Initially Set dice(clock) to 40.
      Initially Set watch(clock) to 3. ${body} }`);
    new ModuleCompiler().validate(m);
    return new World(m).apply(m.initial);
  }
  static changes(...written: string[]): Change[] {
    return written.flatMap(s => ModuleParser.parse(`Module c "C" { Kind group. Kind thing. Measure gold(group).
      Measure dice(entity). Initially ${s}. }`).initial);
  }
  static after(world: World, ...written: string[]) { return world.apply(this.changes(...written)).number(this.gold); }
  static admitted(world: World, ...written: string[]) { return world.admits(this.changes(...written)); }
}

describe('a count', () => {
  it('comes to what a list of changes does to it in all, in any order, and stops at nothing', () => {
    const w = Ledger.world();
    expect(Ledger.after(w, 'Decrease gold(ann) by 5', 'Increase gold(ann) by 5')).toBe(3);
    expect(Ledger.after(w, 'Increase gold(ann) by 5', 'Decrease gold(ann) by 5')).toBe(3);
    expect(Ledger.admitted(w, 'Decrease gold(ann) by 5', 'Increase gold(ann) by 5')).toBe(true);
    expect([Ledger.after(w, 'Decrease gold(ann) by 5'), Ledger.admitted(w, 'Decrease gold(ann) by 5')]).toEqual([0, false]);
    expect([Ledger.after(w, 'Increase gold(ann) by 0 - 5'), Ledger.admitted(w, 'Increase gold(ann) by 0 - 5')])
      .toEqual([0, false]);
    expect(Ledger.admitted(w, 'Decrease gold(ann) by 2', 'Decrease gold(ann) by 2')).toBe(false);
  });
  it('set outright is what it is set to, below nothing too, and apply and admits agree', () => {
    const w = Ledger.world();
    expect([Ledger.after(w, 'Set gold(ann) to 0 - 5'), Ledger.admitted(w, 'Set gold(ann) to 0 - 5')]).toEqual([-5, true]);
    expect([Ledger.after(w, 'Set gold(ann) to 1 - 5 + 4'), Ledger.admitted(w, 'Set gold(ann) to 1 - 5 + 4')])
      .toEqual([0, true]);
    // Below nothing, a Decrease takes it no further, and an Increase counts from where it stood.
    const below = Ledger.world('Initially Set gold(ann) to 0 - 2.');
    expect([Ledger.after(below, 'Decrease gold(ann) by 1'), Ledger.admitted(below, 'Decrease gold(ann) by 1')])
      .toEqual([-2, false]);
    expect([Ledger.after(below, 'Increase gold(ann) by 1'), Ledger.admitted(below, 'Increase gold(ann) by 1')])
      .toEqual([-1, true]);
  });
  it('is spent by a die as the die falls, in admits as in apply', () => {
    const w = Ledger.world();
    const die = w.number({ kind: 'call', name: 'dice', args: ['cup'] });
    const spend = 'Decrease gold(ann) by dice(cup)', gain = 'Increase gold(ann) by dice(cup)';
    expect(die).toBeGreaterThan(3);
    expect([Ledger.after(w, gain), Ledger.admitted(w, spend), Ledger.after(w, spend)]).toEqual([3 + die, false, 0]);
    expect(Ledger.admitted(w, gain, spend)).toBe(true);
  });
});
