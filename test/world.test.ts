import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { Planner } from '../src/campaign/planner';
import { World } from '../src/lang/world';
import type { Change } from '../src/lang/module';

const module = new ModuleCompiler().instantiate(ModuleParser.parse(`Module roads "Roads" {
  Kind group. Kind place. Kind good. Relation at(group, place) exclusive. Relation route(place, place).
  Relation open(place). Measure quantity(group, good).
  Entity a: group "A". Entity b: group "B". Entity x: place "X". Entity y: place "Y". Entity z: place "Z".
  Entity coin: good "Coin".
  Initially Assert route(x, y). Initially Assert route(y, z). Initially Assert at(a, x). Initially Assert at(b, y).
  Initially Set quantity(a, coin) to 2.
  Action travel(actor: group, origin: place, destination: place) "Travel to {destination}" {
    Requires at(actor, origin) and route(origin, destination).
    On success { Assert at(actor, destination). }
  }
  Action pay(actor: group) "Pay a toll" {
    Requires open(y).
    On success { Decrease quantity(actor, coin) by 1. }
  }
  Action unlock(actor: group) "Unlock Y" {
    Requires not open(y).
    On success { Assert open(y). }
  }
  Goal at(a, z).
}`), 'roads').module;
const start = new World(module).apply(module.initial);
const call = ModuleWriter.call;

describe('world state', () => {
  it('forks on apply: the parent world and its snapshots never change', () => {
    const before = start.key(), snapshot = start.snapshot;
    const next = start.apply([{ kind: 'assert', call: call('at', 'a', 'y') }, { kind: 'assert', call: call('open', 'y') }]);
    expect(start.key()).toBe(before);
    expect(start.test(call('at', 'a', 'x'))).toBe(true);
    expect(next.test(call('at', 'a', 'x'))).toBe(false);
    snapshot.relations[0]!.args[0] = 'mutated';
    expect(start.key()).toBe(before);
  });
  it('replaces the previous value of an exclusive relation, and only for the same subject', () => {
    const next = start.apply([{ kind: 'assert', call: call('at', 'a', 'z') }]);
    expect([...next.solve(call('at', '?who', '?where'), {})]).toEqual([{ '?who': 'b', '?where': 'y' }, { '?who': 'a', '?where': 'z' }]);
  });
  it('keys are independent of the order facts were written', () => {
    const one = start.apply([{ kind: 'assert', call: call('open', 'y') }, { kind: 'assert', call: call('open', 'x') }]);
    const two = start.apply([{ kind: 'assert', call: call('open', 'x') }, { kind: 'assert', call: call('open', 'y') }]);
    expect(one.key()).toBe(two.key());
    expect(new World(module, one.snapshot).key()).toBe(one.key());
  });
  it('admits exactly the changes apply accepts, including sequential measure changes', () => {
    const cases: Change[][] = [
      [{ kind: 'decrease', call: call('quantity', 'a', 'coin'), value: ModuleWriter.number(2) }],
      [{ kind: 'decrease', call: call('quantity', 'a', 'coin'), value: ModuleWriter.number(3) }],
      [{ kind: 'decrease', call: call('quantity', 'a', 'coin'), value: ModuleWriter.number(2) },
        { kind: 'decrease', call: call('quantity', 'a', 'coin'), value: ModuleWriter.number(1) }],
      [{ kind: 'increase', call: call('quantity', 'b', 'coin'), value: ModuleWriter.number(1) },
        { kind: 'set', call: call('quantity', 'a', 'coin'), value: call('quantity', 'b', 'coin') }],
      [{ kind: 'assert', call: call('nonsense', 'a') }],
    ];
    for (const changes of cases) {
      let applies = true;
      try { start.apply(changes); } catch { applies = false; }
      expect(start.admits(changes)).toBe(applies);
    }
  });
  it('stamps a name only when it is written', () => {
    const next = start.apply([{ kind: 'assert', call: call('open', 'y') }]);
    expect(next.stamp('open')).not.toBe(start.stamp('open'));
    expect(next.stamp('at')).toBe(start.stamp('at'));
    expect(start.apply([{ kind: 'assert', call: call('open', 'y') }]).stamp('open')).not.toBe(next.stamp('open'));
  });
});

describe('applicability index', () => {
  it('finds the same actions as testing every one, in module order, as the world changes', () => {
    const actions = ActionSchemas.ground(module);
    let world = start;
    const states = [start];
    for (const id of ['unlock(a)', 'travel(a,x,y)', 'pay(a)', 'travel(a,y,z)', 'pay(a)']) {
      const action = actions.find(a => a.id === id)!;
      world = world.apply(action.success);
      states.push(world);
    }
    for (const state of states) {
      expect(Planner.applicableAmong(state, actions).map(a => a.id))
        .toEqual(actions.filter(a => Planner.applicable(state, a)).map(a => a.id));
    }
    expect(Planner.applicableAmong(world, actions).map(a => a.id)).not.toContain('pay(a)');
  });
});
