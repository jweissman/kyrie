import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ModuleWriter } from '../src/lang/module-writer';
import { World } from '../src/lang/world';
import { Modules } from '../src/campaign/modules';
import { Planner } from '../src/campaign/planner';

const laboratory = `Module laboratory "Orbital supply station" {
  Kind place. Kind robot. Kind resource.
  Relation at(entity, place) exclusive.
  Measure stock(robot, resource).
  Query has(unit: robot, material: resource) means stock(unit, material) > 0.
  Entity drone: robot "Courier". Entity dock: place "Dock". Entity lab: place "Lab".
  Entity battery: resource "Battery".
  Initially Assert at(drone, dock).
  Initially Set stock(drone, battery) to (1d3).
  Goal at(drone, lab) and not has(drone, battery).
  Budget 4.
  Action travel "Deliver battery" {
    Requires at(drone, dock) and has(drone, battery).
    Cost 1. Time 1.
    On success { Assert at(drone, lab). Set stock(drone, battery) to 0. }
  }
}`;
describe('genre-independent Kyr modules', () => {
  it('parses and executes an unrelated genre with declared types and derived queries', () => {
    const instance = new ModuleCompiler().instantiate(ModuleParser.parse(laboratory), 'lab');
    const world = new World(instance.module, instance.world);
    expect(world.test(ModuleWriter.call('has', 'drone', 'battery'))).toBe(true);
    const plan = Planner.search(world, instance.module.goal, instance.module.actions)!;
    expect(plan.actions).toEqual(['travel']);
    const next = Planner.apply(world, instance.module.actions[0]!);
    expect(next.test(instance.module.goal)).toBe(true);
    expect(next.test(ModuleWriter.call('at', 'drone', 'dock'))).toBe(false);
    expect(world.test(ModuleWriter.call('at', 'drone', 'dock'))).toBe(true);
  });
  it('round-trips authored and generated modules through the same Kyr format', () => {
    const module = ModuleParser.parse(Modules.source);
    expect(ModuleParser.parse(ModuleWriter.write(module))).toEqual(module);
    const generated = Modules.generate('round-trip');
    const parsed = ModuleParser.parse(generated.source);
    new ModuleCompiler(Modules.capabilities).validate(parsed);
    expect(parsed).toEqual(generated.instance.module);
  });
  it('rejects undeclared references, wrong arities, wrong types, and writes to derived queries', () => {
    for (const source of [
      laboratory.replace('at(drone, dock)', 'at(missing, dock)'),
      laboratory.replace('at(drone, dock)', 'at(dock, drone)'),
      laboratory.replace('at(drone, dock)', 'at(drone)'),
      laboratory.replace('Set stock(drone, battery) to 0', 'Assert has(drone, battery)'),
      laboratory.replace('Kind robot.', 'Kind robot. Kind robot.'),
      laboratory.replace('Budget 4.', 'Budget 4. Budget 5.'),
    ]) {
      expect(() => new ModuleCompiler().instantiate(ModuleParser.parse(source), 'bad')).toThrow();
    }
  });
  it('rejects recursive queries and unsupported external capabilities', () => {
    const recursive = laboratory.replace('stock(unit, material) > 0', 'has(unit, material)');
    expect(() => new ModuleCompiler().instantiate(ModuleParser.parse(recursive), 'recursive')).toThrow('Recursive');
    expect(() => new ModuleCompiler().instantiate(ModuleParser.parse(Modules.source), 'unregistered')).toThrow('combat');
  });
  it('enforces quantities atomically and keeps possession consistent', () => {
    const instance = Modules.authored();
    const world = new World(instance.module, instance.world);
    const before = world.snapshot;
    expect(() => world.apply([{ kind: 'decrease', call: ModuleWriter.call('quantity', 'party', 'rations'),
      value: ModuleWriter.number(5) }])).toThrow();
    expect(world.snapshot).toEqual(before);
    const copy = world.snapshot;
    copy.relations.length = 0;
    expect(world.snapshot).toEqual(before);
  });
  it('checks generated variants for reachable goals within their actual budgets', () => {
    const towns = new Set<string>(), actions = new Set<string>();
    for (let i = 0; i < 30; i++) {
      const result = Modules.generate(`research-${i}`);
      const { module, world, budget } = result.instance;
      towns.add(module.entities.find(e => e.id === 'village')!.name);
      actions.add(module.actions.map(a => a.id).sort().join(','));
      expect(Planner.search(new World(module, world), module.goal, module.actions,
        { maxNodes: 2000, timeRemaining: budget })).not.toBeNull();
    }
    expect(towns.size).toBeGreaterThan(1);
    expect(actions.size).toBeGreaterThan(1);
  }, 20000);
});
