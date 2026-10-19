import { RuntimeCapabilities } from './runtime-capabilities';
import livingCrossing from '../../data/modules/living-crossing.kyr' with { type: 'text' };
import adventureRules from '../../data/rulesets/adventure.kyr' with { type: 'text' };
import { ModuleAssembly, type AdventureManifest } from './module-assembly';
import crossing from '../../data/modules/crossing.kyr' with { type: 'text' };
import { Content } from '../content';
import { ModuleParser } from '../lang/module-parser';
import { ModuleCompiler } from '../lang/module-compiler';
import { ModuleWriter } from '../lang/module-writer';
import type { Change, Instance, Module, Signature } from '../lang/module';
import { World } from '../lang/world';
import { Planner } from './planner';

export interface GeneratedModule { instance: Instance; source: string; attempts: number; approaches: string[] }
export class Modules {
  static adventure(seed = 'living-crossing', context: { deadline?: number; mercyAt?: number; urgentAt?: number } = {}) {
    const manifest = new Content(`${seed}:situation`).generate('adventure', context) as unknown as AdventureManifest;
    return ModuleAssembly.compose(livingCrossing, adventureRules, manifest, seed);
  }
  static readonly source = crossing;
  static readonly capabilities: Signature[] = RuntimeCapabilities.signatures;
  static authored(seed = 'crossing'): Instance {
    return new ModuleCompiler(Modules.capabilities).instantiate(ModuleParser.parse(crossing), seed);
  }
  static generate(seed: string): GeneratedModule {
    for (let attempt = 0; attempt < 32; attempt++) {
      const content = new Content(`${seed}:module-candidate:${attempt}`);
      const manifest = content.generate('module');
      const approaches = manifest.approaches;
      if (!Array.isArray(approaches) || approaches.some(a => typeof a !== 'string')) {
        throw new Error('Deem module approaches must be a list of identifiers');
      }
      const selected = approaches as string[];
      const definition = ModuleParser.parse(crossing);
      Modules.configure(definition, manifest);
      definition.actions = definition.actions.filter(action => {
        if (action.id === 'deliver') { return true; }
        if (action.id === 'scout') { return selected.includes('ford'); }
        if (action.id === 'recover') { return selected.some(id => id !== 'ford'); }
        return selected.includes(action.id);
      });
      const source = ModuleWriter.write(definition);
      const instance = new ModuleCompiler(Modules.capabilities).instantiate(ModuleParser.parse(source), seed);
      const plan = Planner.search(new World(instance.module, instance.world), instance.module.goal,
        instance.module.actions, { maxNodes: 2000, timeRemaining: instance.budget });
      if (plan) { return { instance, source, attempts: attempt + 1, approaches: selected }; }
    }
    throw new Error(`No solvable module generated within 32 candidates for ${seed}`);
  }
  static batch(count = 30, seed = 'modules') {
    if (!Number.isSafeInteger(count) || count < 1) { throw new Error('Count must be a positive integer'); }
    const topologies: Record<string, number> = {}, firstSteps: Record<string, number> = {};
    let attempts = 0, planTime = 0;
    for (let i = 0; i < count; i++) {
      const result = Modules.generate(`${seed}:${i}`);
      const { module, world, budget } = result.instance;
      const plan = Planner.search(new World(module, world), module.goal, module.actions,
        { maxNodes: 2000, timeRemaining: budget })!;
      const topology = module.actions.map(action => action.id).sort().join(',');
      topologies[topology] = (topologies[topology] ?? 0) + 1;
      const first = plan.actions[0] ?? 'already-complete';
      firstSteps[first] = (firstSteps[first] ?? 0) + 1;
      attempts += result.attempts;
      planTime += plan.actions.reduce((sum, id) => sum + module.actions.find(a => a.id === id)!.time, 0);
    }
    return { count, seed, meanCandidates: attempts / count, meanPlanTime: planTime / count,
      topologies, firstSteps, validation: 'symbolic reachability; encounters assumed successful' };
  }
  private static configure(module: Module, manifest: Record<string, unknown>) {
    for (const [id, value] of [['village', manifest.townName], ['cargo', manifest.cargoName]]) {
      const entity = module.entities.find(e => e.id === id)!;
      if (typeof value !== 'string') { throw new Error('Generated names must be strings'); }
      entity.name = value;
    }
    const deadline = manifest.deadline;
    if (typeof deadline !== 'number') { throw new Error('Generated deadline must be numeric'); }
    module.budget = ModuleWriter.number(deadline);
    module.description = `${module.entities.find(e => e.id === 'village')!.name} needs its stranded cargo before dusk.`;
    module.initial = module.initial.filter(change => manifest.hungry || change.call.name !== 'hungry');
    Modules.quantity(module.initial, 'rations', manifest.rations);
    Modules.quantity(module.initial, 'gold', manifest.gold);
  }
  private static quantity(changes: Change[], item: string, value: unknown) {
    if (typeof value !== 'number') { throw new Error(`Generated ${item} must be numeric`); }
    const initial = changes.find(change => change.kind === 'set' && change.call.name === 'quantity'
      && change.call.args[1] === item);
    if (!initial || initial.kind !== 'set') { throw new Error(`Missing initial ${item}`); }
    initial.value = ModuleWriter.number(value);
  }
}
