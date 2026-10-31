import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { ModuleWriter } from '../lang/module-writer';
import { Items } from './items';
import { Effects } from '../effects';
import { ObservationText } from '../lang/observation-text';
import type { Call, Change } from '../lang/module';
import type { Creature } from '../creature';
import type { CombatEvent } from '../model';
import type { TickHost } from './campaign-tick';

// What the world does to bodies. A fact that a hazard strikes a company (a trap sprung, a stone that falls) is
// turned on one of its members, chosen by the seeded stream, and then forgotten.
export class Consequences {
  static strike(host: TickHost, combat: CombatEvent[]): boolean {
    const struck = host.world.related('strikes');
    if (!struck.length) { return false; }
    const { definition, creatures, current } = host.tickState;
    const standing = new Set(creatures.live.filter(c => c.state.hp > 0).map(c => c.id));
    for (const [hazard, group] of struck.map(r => r.args as [string, string])) {
      const members = definition.actors.find(a => a.id === group)?.members
        .filter(id => standing.has(id)) ?? [];
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
  // A thing handed to a company ("Give coat to party.") goes to the first of it who is up, out of whoever's hands
  // held it or from wherever it lay; one of a kind a company spends ("Spend weight_stone from actor.") is given up by
  // the first of it who carries one, and is gone. Tessary's Nan had to set Davy's coat down to be taken, and Low
  // Water's pan took a weight-stone only by a container and a rule on what was put in it.
  static hand(host: TickHost, combat: CombatEvent[]): boolean {
    const world = host.world, handed = world.related('handed'), spent = world.related('usesUp');
    if (!handed.length && !spent.length) { return false; }
    const { definition, creatures } = host.tickState, changes = [...handed, ...spent].map(r => this.retract(r));
    for (const [item, group] of handed.map(r => r.args as [string, string])) {
      const members = definition.actors.find(a => a.id === group)?.members ?? [];
      const kind = world.one('itemKind', item), taker = members.find(id => this.up(creatures.get(id)));
      const owner = creatures.snapshot.find(c => c.state.inventory?.some(i => i.id === item))?.id;
      if (!kind || !taker || (owner && members.includes(owner))) { continue; }
      const label = ObservationText.label(world, item);
      combat.push(...owner ? Items.transfer(creatures, { id: item, label }, owner, taker)
        : Items.take(creatures, taker, { id: item, definition: kind, label }));
      changes.push(...[...world.related('at', item), ...world.related('inside', item)].map(r => this.retract(r)));
    }
    for (const [group, what] of spent.map(r => r.args as [string, string])) {
      const carriers = (definition.actors.find(a => a.id === group)?.members ?? []).map(id => creatures.get(id));
      const [carrier, thing] = this.spendable(carriers, what, 'id') ?? this.spendable(carriers, what, 'definition') ?? [];
      if (carrier && thing) { Items.drop(creatures, carrier.id, thing.id); }
    }
    host.commitWorld(world.apply(changes));
    host.refreshProjection();
    return true;
  }
  // The thing a company gives up: the one of that name (a particular ribbon, not any of its kind: LUL-04), or one of
  // a kind, unworn before worn, from the first of it who carries one.
  private static spendable(carriers: Creature[], what: string, by: 'id' | 'definition'): [Creature, { id: string }] | undefined {
    for (const c of carriers) {
      const kept = c.state.inventory?.filter(i => i[by] === what) ?? [], thing = kept.find(i => !i.equipped) ?? kept[0];
      if (thing) { return [c, thing]; }
    }
    return undefined;
  }
  private static up(c: Creature): boolean {
    return c.state.hp > 0 && !c.state.conditions.some(s => Effects.skips(s.id));
  }
  private static retract(r: Call): Change { return { kind: 'retract', call: ModuleWriter.call(r.name, ...r.args) }; }
}
