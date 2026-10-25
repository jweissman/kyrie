import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { Planner } from '../src/campaign/planner';
import { Operators } from '../src/campaign/operators';
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
  // An action is offered only if what it does keeps every count at or above nothing (a fare the company cannot pay);
  // a write that takes a count past nothing (a rule's, unchecked) stops it there (The Patient Star's P5).
  it('admits the changes that keep every count at or above nothing, sequential ones too, all of which apply accepts', () => {
    const coin = (kind: 'decrease' | 'increase', who: string, n: number): Change =>
      ({ kind, call: call('quantity', who, 'coin'), value: ModuleWriter.number(n) });
    const cases: [Change[], boolean][] = [
      [[coin('decrease', 'a', 2)], true],
      [[coin('decrease', 'a', 3)], false],
      [[coin('decrease', 'a', 2), coin('decrease', 'a', 1)], false],
      [[coin('increase', 'b', 1), { kind: 'set', call: call('quantity', 'a', 'coin'), value: call('quantity', 'b', 'coin') }], true],
      [[{ kind: 'assert', call: call('nonsense', 'a') }], false],
    ];
    for (const [changes, admitted] of cases) {
      expect(start.admits(changes)).toBe(admitted);
      if (admitted) { expect(() => start.apply(changes)).not.toThrow(); }
    }
    expect(start.apply([coin('decrease', 'a', 3)]).number(call('quantity', 'a', 'coin'))).toBe(0);
    expect(() => start.apply([{ kind: 'assert', call: call('nonsense', 'a') }])).toThrow();
  });
  it('stamps a name only when it is written', () => {
    const next = start.apply([{ kind: 'assert', call: call('open', 'y') }]);
    expect(next.stamp('open')).not.toBe(start.stamp('open'));
    expect(next.stamp('at')).toBe(start.stamp('at'));
    expect(start.apply([{ kind: 'assert', call: call('open', 'y') }]).stamp('open')).not.toBe(next.stamp('open'));
  });
});

describe('demand grounding', () => {
  it('finds the same actions as eager grounding and testing every one, in the same order, as the world changes', () => {
    const actions = ActionSchemas.ground(module);
    let world = start;
    const states = [start];
    for (const id of ['unlock(a)', 'travel(a,x,y)', 'pay(a)', 'travel(a,y,z)', 'pay(a)']) {
      const action = actions.find(a => a.id === id)!;
      world = world.apply(action.success);
      states.push(world);
    }
    const operators = new Operators(module);
    for (const state of states) {
      expect(operators.applicable(state).map(a => a.id))
        .toEqual(actions.filter(a => Planner.applicable(state, a)).map(a => a.id));
      expect(operators.applicable(state, 'a').map(a => a.id))
        .toEqual(actions.filter(a => a.actor === 'a' && Planner.applicable(state, a)).map(a => a.id));
    }
    expect(operators.applicable(world).map(a => a.id)).not.toContain('pay(a)');
    expect(operators.get('travel(a,y,z)')).toEqual(actions.find(a => a.id === 'travel(a,y,z)'));
    expect(operators.get('travel(a,y,nonsense)')).toBeUndefined();
  });
});
