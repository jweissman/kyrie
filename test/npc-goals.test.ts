import { describe, expect, it } from 'bun:test';
import source from '../data/experiments/npc-goals.kyr' with { type: 'text' };
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { World } from '../src/lang/world';
import { Planner } from '../src/campaign/planner';
import type { Module, Predicate } from '../src/lang/module';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';

// Goal selection is authored here; the existing single-goal planner supplies the means.
class CourierFixture {
  static create() {
    const instance = new ModuleCompiler().instantiate(ModuleParser.parse(source), 'courier');
    const npc = new Content('courier').createCreature('courier', { raceId: 'human', classId: 'commoner' });
    return { module: instance.module, world: new World(instance.module, instance.world),
      store: new CreatureStore([npc]) };
  }
  static choose(world: World, module: Module, store: CreatureStore) {
    if (store.get('courier').state.hp === 0) { return null; }
    const medicine: Predicate = { kind: 'compare', operator: '>=',
      left: ModuleWriter.call('stock', 'clinic', 'medicine'), right: ModuleWriter.number(1) };
    const goals = [
      { id: 'paid_work', priority: 10, predicate: module.goal },
      { id: 'provision_clinic', priority: world.test(ModuleWriter.call('critical', 'clinic')) ? 20 : 5,
        predicate: medicine },
    ].sort((a, b) => b.priority - a.priority);
    for (const goal of goals) {
      if (world.test(goal.predicate)) { continue; }
      const plan = Planner.search(world, goal.predicate, module.actions, { maxNodes: 2000, timeRemaining: 4 });
      if (plan) { return { goal: goal.id, ...plan }; }
    }
    return null;
  }
  static step(world: World, module: Module, actionId: string) {
    const action = module.actions.find(a => a.id === actionId)!;
    if (!Planner.applicable(world, action)) { throw new Error('Stale plan'); }
    return world.apply(action.success);
  }
}

describe('separate bounded planner experiment', () => {
  it('chooses paid work initially and replans to an urgent goal after loading the parcel', () => {
    const { module, store, world: initial } = CourierFixture.create();
    const actions = structuredClone(module.actions);
    const first = CourierFixture.choose(initial, module, store)!;
    expect(first.goal).toBe('paid_work');
    expect(first.actions).toEqual(['load_parcel', 'to_market', 'deliver_parcel']);
    let world = CourierFixture.step(initial, module, first.actions[0]!);
    world = world.apply([{ kind: 'assert', call: ModuleWriter.call('critical', 'clinic') }]);
    const revised = CourierFixture.choose(world, module, store)!;
    expect(revised.goal).toBe('provision_clinic');
    expect(revised.actions).toEqual(['unload_parcel', 'load_medicine', 'to_clinic', 'deliver_medicine']);
    for (let i = 0; i < 4; i++) {
      const next = CourierFixture.choose(world, module, store)!;
      expect(next.goal).toBe('provision_clinic');
      world = CourierFixture.step(world, module, next.actions[0]!);
    }
    expect(world.number(ModuleWriter.call('stock', 'clinic', 'medicine'))).toBe(1);
    expect(world.number(ModuleWriter.call('stock', 'depot', 'parcel'))).toBe(1);
    expect(world.number(ModuleWriter.call('stock', 'courier', 'coin'))).toBe(0);
    expect(module.actions).toEqual(actions);
    expect(CourierFixture.choose(world, module, store)!.goal).toBe('paid_work');
  });
  it('continues its original plan without the disturbance and respects canonical death', () => {
    const { module, store, world: initial } = CourierFixture.create();
    let world = initial;
    for (let i = 0; i < 3; i++) {
      const next = CourierFixture.choose(world, module, store)!;
      expect(next.goal).toBe('paid_work');
      world = CourierFixture.step(world, module, next.actions[0]!);
    }
    expect(world.number(ModuleWriter.call('stock', 'courier', 'coin'))).toBe(2);
    expect(world.number(ModuleWriter.call('stock', 'clinic', 'medicine'))).toBe(0);
    const lease = store.acquire(['courier']);
    lease.creatures[0]!.state.hp = 0;
    lease.commit(lease.creatures); lease.release();
    expect(CourierFixture.choose(world, module, store)).toBeNull();
  });
});
