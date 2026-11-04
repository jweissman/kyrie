import { Expressions } from '../expressions';
import { RandomStreams } from '../random-streams';
import { ModuleWriter } from '../lang/module-writer';
import { Items } from './items';
import { Effects } from '../effects';
import { ObservationText } from '../lang/observation-text';
import type { Call, Change } from '../lang/module';
import type { World } from '../lang/world';
import type { Creature } from '../creature';
import type { CombatEvent } from '../model';
import type { TickHost } from './campaign-tick';

// What the world does to bodies. A fact that a hazard strikes a company (a trap sprung, a stone that falls) is
// turned on one of its members, chosen by the seeded stream, and then forgotten; one that strikes a member of it
// strikes that one (the Book of Faces' BOF-37: a lesson taught by a hazard had gone to whichever member the stream
// chose, the warrior as soon as the mage).
export class Consequences {
  static strike(host: TickHost, combat: CombatEvent[]): boolean {
    const struck = host.world.related('strikes');
    if (!struck.length) { return false; }
    const { definition, creatures, current } = host.tickState;
    const standing = new Set(creatures.live.filter(c => c.state.hp > 0).map(c => c.id));
    for (const [hazard, group] of struck.map(r => r.args as [string, string])) {
      const one = host.module.entities.find(e => e.id === group)?.creatureId;
      const members = (one ? [one] : definition.actors.find(a => a.id === group)?.members ?? [])
        .filter(id => standing.has(id));
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
  // Whoever a rule or an act makes whole ("Restore ?g." in what it does) is whole again: every hit point, no
  // condition, risen if they had fallen or died; and the fact is forgotten. The Lull's law that hired harm heals at
  // sunset could not be written, nor a raising or a regeneration of a module's own (its F1, LUL-01).
  static restore(host: TickHost): boolean {
    const whole = host.world.related('madeWhole');
    if (!whole.length) { return false; }
    const { definition, creatures } = host.tickState;
    const ids = [...new Set(whole.flatMap(r => definition.actors.find(a => a.id === r.args[0])?.members ?? []))];
    const lease = creatures.acquire(ids);
    try {
      for (const c of lease.creatures) { c.state.hp = c.base.maxHp; c.state.conditions = []; }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    host.commitWorld(host.world.apply(whole.map(r => this.retract(r))));
    host.refreshProjection();
    return true;
  }
  // A thing handed to a company ("Give coat to party.") goes to the first of it who is up, out of whoever's hands
  // held it or from wherever it lay; one of a kind a company spends ("Spend weight_stone from actor.") is given up by
  // the first of it who carries one, and is gone. Tessary's Nan had to set Davy's coat down to be taken, and Low
  // Water's pan took a weight-stone only by a container and a rule on what was put in it.
  static hand(host: TickHost, combat: CombatEvent[]): boolean {
    const world = host.world, handed = world.related('handed'), spent = world.related('usesUp');
    const counted = world.module.measures.some(m => m.name === 'gifts')
      ? world.measured('gifts').filter(m => m.value > 0) : [];
    if (!handed.length && !spent.length && !counted.length) { return false; }
    const { definition, creatures } = host.tickState, changes = [...handed, ...spent].map(r => this.retract(r));
    changes.push(...counted.map(m => ({ kind: 'set' as const, call: m.call, value: ModuleWriter.number(0) })));
    const gifts = [...handed.map(r => r.args as [string, string]),
      ...counted.flatMap(m => Array.from({ length: m.value }, () => m.call.args as [string, string]))];
    const from = combat.length;
    for (const [given, group] of gifts) {
      const members = definition.actors.find(a => a.id === group)?.members ?? [];
      // A kind given is a new one of it (Give wonders_list_kind to actor: the circus's friction 13, Half the Hive's 5,
      // the Third Night's 16), with nothing to park in a room first.
      const made = this.made(world, given, creatures, changes), item = made?.id ?? given;
      const kind = made?.kind ?? world.one('itemKind', item), taker = members.find(id => this.up(creatures.get(id)));
      const owner = creatures.snapshot.find(c => c.state.inventory?.some(i => i.id === item))?.id;
      if (!kind || !taker || (owner && members.includes(owner))) { continue; }
      const label = made ? world.module.entities.find(e => e.id === given)?.name ?? given
        : ObservationText.label(world, item);
      combat.push(...owner ? Items.transfer(creatures, { id: item, label }, owner, taker)
        : Items.take(creatures, taker, { id: item, definition: kind, label }));
      // A thing made as it is given is a thing of the world as a kit's is, of its kind: held, it opens what needs its
      // kind (a key given with a job had opened nothing: the owner's town quests, 3 November).
      if (made) { this.make(world, made.id, label); changes.push(this.fact('itemKind', made.id, kind)); }
      changes.push(...[...world.related('at', item), ...world.related('inside', item)].map(r => this.retract(r)));
    }
    this.together(combat, from);
    for (const [group, what] of spent.map(r => r.args as [string, string])) {
      const carriers = (definition.actors.find(a => a.id === group)?.members ?? []).map(id => creatures.get(id));
      const [carrier, thing] = this.spendable(carriers, what, 'id') ?? this.spendable(carriers, what, 'definition') ?? [];
      if (carrier && thing) { Items.drop(creatures, carrier.id, thing.id); }
    }
    host.commitWorld(world.apply(changes));
    host.refreshProjection();
    return true;
  }
  // Two of a kind given at once are said as two ("Aud gains 2 Flask of lamp oil"), not one said twice and told once.
  private static together(events: CombatEvent[], from: number) {
    const given = events.splice(from), said: CombatEvent[] = [];
    for (const e of given) {
      const same = e.type === 'gain' && e.amount !== undefined ? said.find(o => o.type === 'gain' && o.target === e.target
        && o.detail === e.detail && o.amount !== undefined) : undefined;
      if (same?.type === 'gain' && e.type === 'gain') { same.amount = same.amount! + e.amount!; } else { said.push(e); }
    }
    events.push(...said);
  }
  private static make(world: World, id: string, name: string) {
    if (!world.module.entities.some(e => e.id === id)) { world.module.entities.push({ id, type: 'item', name }); }
  }
  private static fact(name: string, ...args: string[]): Change {
    return { kind: 'assert', call: ModuleWriter.call(name, ...args) };
  }
  // A new one of a kind given, named for its kind, with an id of its own.
  // Two of a kind given at once are two (a priest's two draughts had been one): the ids made already in this giving,
  // whose kinds are among its changes, are taken too.
  private static made(world: World, given: string, creatures: { snapshot: Creature[] }, changes: Change[]) {
    if (world.module.entities.find(e => e.id === given)?.type !== 'itemkind') { return undefined; }
    const ids = new Set([...creatures.snapshot.flatMap(c => (c.state.inventory ?? []).map(i => i.id)),
      ...changes.filter(c => c.kind === 'assert' && c.call.name === 'itemKind').map(c => c.call.args[0]!)]);
    let n = 1;
    while (ids.has(`${given}_given${n}`)) { n++; }
    return { id: `${given}_given${n}`, kind: given };
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
