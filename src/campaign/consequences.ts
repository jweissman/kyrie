import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { ModuleWriter } from '../lang/module-writer';
import { Items } from './items';
import type { CombatEvent } from '../model';
import type { TickHost } from './campaign-tick';

// What the world does to bodies. A fact that a hazard strikes a company (a trap sprung, a stone that falls) is
// turned on one of its members, chosen by the seeded stream, and then forgotten.
export class Consequences {
  static strike(host: TickHost, combat: CombatEvent[]): boolean {
    const struck = host.world.snapshot.relations.filter(r => r.name === 'strikes');
    if (!struck.length) { return false; }
    const { definition, creatures, current } = host.tickState;
    for (const [hazard, group] of struck.map(r => r.args as [string, string])) {
      const members = definition.actors.find(a => a.id === group)?.members
        .filter(id => creatures.snapshot.some(c => c.id === id && c.state.hp > 0)) ?? [];
      if (!members.length) { continue; }
      const roll = new Expressions(RandomStreams.key(current.seed, 'strike', hazard, String(current.elapsed)));
      const target = members[roll.number(`1d${members.length}`) - 1]!;
      combat.push(...Items.expose(creatures, { target, ability: hazard, source: hazard, entities: host.module.entities,
        seed: RandomStreams.key(current.seed, 'strike', hazard, target, String(current.elapsed)) }));
    }
    host.commitWorld(host.world.apply(struck.map(r => ({ kind: 'retract' as const, call: ModuleWriter.call(r.name, ...r.args) }))));
    host.refreshProjection();
    return true;
  }
}
