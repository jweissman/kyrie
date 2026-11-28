import { ModuleWriter } from '../lang/module-writer';
import { Exposure } from './exposure';
import { Witnesses } from './witnesses';
import type { World } from '../lang/world';
import type { Operator } from '../lang/module';
import type { CombatEvent } from '../model';

// What a committed command leaves behind in the world: who saw an attack, which elements it let loose where, and
// whether an opponent fled the fight.
export class Aftermath {
  static record(before: World, after: World, action: Operator, events: CombatEvent[]): World {
    return this.felled(this.rout(Exposure.record(before, Witnesses.record(before, after, action, events), action,
      events), action, events), action, events);
  }
  // Who brought a band down, kept where a module asks for it (Relation felled(group, group)): the world's record of a
  // fight the company won to the last of its foes, and never of a band that died by anything else (a Slay, a trap,
  // another's fight), so that a deed is claimed by the fight that did it, not by a trophy picked up (CR-01, the
  // hunter's career: "the world's record of what actually happened").
  static felled(world: World, action: Operator, events: CombatEvent[]): World {
    const opponent = action.resolve?.name === 'combat' ? action.resolve.args[0] : undefined;
    const end = events.find(e => e.type === 'end'), company = action.actor;
    if (!opponent || !company || end?.type !== 'end' || end.outcome !== 'fighters' || end.reason !== 'elimination') {
      return world;
    }
    // Of two: who, and whom (Sallowfield's own felled, of one, is the fallen villager's, and not this).
    const kept = world.module.relations.filter(r => (r.name === 'felled' || r.name.endsWith('__felled'))
      && r.types.length === 2);
    return kept.length ? world.apply(kept.map(r => ({ kind: 'assert' as const, call: ModuleWriter.call(r.name, company,
      opponent) }))) : world;
  }
  // An opponent that flees is routed: it gives up any blocking stance, so it no longer holds a passage, and what was
  // conditioned on that stance (its description, its growl) ends with it. So is one beaten in a bout, or broken (see
  // Morale); a company beaten in a bout has yielded to it.
  static rout(world: World, action: Operator, events: CombatEvent[]): World {
    const opponent = action.resolve?.name === 'combat' ? action.resolve.args[0] : undefined;
    const end = events.find(e => e.type === 'end');
    if (!opponent || end?.type !== 'end') { return world; }
    if (end.reason === 'yielded' && end.outcome === 'goblins') { return this.yielded(world, action.actor, opponent); }
    const beaten = end.fled?.team === 'goblins' || (['yielded', 'routed'].includes(end.reason) && end.outcome === 'fighters');
    if (!beaten || !world.module.relations.some(r => r.name === 'routed')) { return world; }
    const stances = world.module.relations.some(r => r.name === 'blocksWhen')
      ? [...world.solve(ModuleWriter.call('state', opponent, '?s'), {})].map(b => b['?s']!)
        .filter(s => world.test(ModuleWriter.call('blocksWhen', opponent, s))) : [];
    return world.apply([{ kind: 'assert', call: ModuleWriter.call('routed', opponent) },
      ...stances.map(s => ({ kind: 'retract' as const, call: ModuleWriter.call('state', opponent, s) })),
      ...this.scattered(world, opponent, end.reason !== 'yielded' && Aftermath.disheartened(events))]);
  }
  // A band put to flight with nowhere further to fall back to (no refuge, or its refuge where the fight was) and
  // nothing to plead goes off, to its holes: it is no longer where the fight was. Two rats that got away had stood on
  // in their den, a hard fight still, after the fight was won (OR-1855: beasts lose heart at the first of them to
  // fall). One with a refuge elsewhere falls back to it, and may rally there (inhabitants.kyr). Not a bout's loser,
  // nor one that slipped off by a flight of its own.
  // Whether some of the band lost heart in the fight (Morale): broken, not slipped off by a flight of its own (a
  // hound that runs from a blow stands routed where it ran, the way it held given up).
  private static disheartened(events: CombatEvent[]): boolean {
    return events.some(e => e.type === 'save' && e.kind === 'morale' && !e.success);
  }
  private static scattered(world: World, opponent: string, fled: boolean) {
    const at = fled ? world.one('at', opponent) : undefined;
    const refuge = world.relates('refuge') ? world.one('refuge', opponent) : undefined;
    const pleads = world.relates('plea') && world.related('plea').some(x => x.args[0] === opponent);
    return at && !pleads && (!refuge || refuge === at)
      ? [{ kind: 'retract' as const, call: ModuleWriter.call('at', opponent, at) }] : [];
  }
  private static yielded(world: World, company: string | undefined, opponent: string): World {
    if (!company || !world.relates('yielded')) { return world; }
    return world.apply([{ kind: 'assert', call: ModuleWriter.call('yielded', company, opponent) },
      ...world.relates('assails') ? [{ kind: 'retract' as const, call: ModuleWriter.call('assails', opponent, company) }] : []]);
  }
}
