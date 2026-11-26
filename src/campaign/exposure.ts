import { Content } from '../content';
import { ModuleWriter } from '../lang/module-writer';
import { EffectShadows } from '../ports/effects';
import type { World } from '../lang/world';
import type { Change, Module, Operator } from '../lang/module';
import type { ArenaAbility } from '../lang';
import type { CombatEvent } from '../model';

// An element let loose lets it loose in the place where it happens: a fire breath fills the room with fire, not just
// the people in it, and a fire bolt at one goblin is fire in the room all the same. The coordinator records
// `exposedTo(place, element)` after the command, whatever let it loose (an ability used in a fight, a spell cast at a
// thing between fights; a thing thrown, a firebomb, not yet: OR-1220), and puts every thing there that suits the
// element's try to it (`tried(thing, burning)`: OR-1100), so that an author answers a kind of effect, never a spell.
// What burns, freezes or spoils is authored as ordinary world events. Which element a kind of harm is, is the rules
// domain's (EffectShadows); physical harm is none.
export class Exposure {
  static record(before: World, after: World, action: Operator, events: CombatEvent[]): World {
    if (!after.module.relations.some(r => r.name === 'exposedTo') || !action.actor) { return after; }
    const used = this.used(action, events);
    if (!used.length) { return after; }
    const place = before.one('at', action.actor);
    if (!place) { return after; }
    const changes = this.changes(after, { actor: action.actor, place, abilities: used });
    return changes.length ? after.apply(changes) : after;
  }
  // What was used: each ability acted with in a fight, or the spell a field act invokes.
  private static used(action: Operator, events: CombatEvent[]): ArenaAbility[] {
    const name = action.resolve?.name;
    const ids = name === 'combat' ? events.flatMap(e => e.type === 'action' ? [e.command.ability] : [])
      : name === 'invoke' ? [action.resolve!.args[0]!] : [];
    return [...new Set(ids)].flatMap(id => {
      const found = Content.abilities.find(a => a.id === id);
      return found ? [found] : [];
    });
  }
  // The elements an ability's harms let loose, of those the world knows.
  static elements(ability: ArenaAbility, module: Module): string[] {
    const known = new Set(module.entities.filter(x => x.type === 'element').map(x => x.id));
    return [...new Set(ability.effects.flatMap(e => {
      const element = e.kind === 'damage' ? EffectShadows.element(e.damageType) : undefined;
      return element && known.has(element) ? [element] : [];
    }))];
  }
  private static changes(world: World, at: { actor: string; place: string; abilities: ArenaAbility[] }): Change[] {
    const elements = [...new Set(at.abilities.flatMap(a => this.elements(a, world.module)))];
    const call = ModuleWriter.call.bind(ModuleWriter), changes: Change[] = [];
    for (const element of elements) {
      if (!world.test(call('exposedTo', at.place, element))) {
        changes.push({ kind: 'assert', call: call('exposedTo', at.place, element) });
      }
      for (const verb of this.verbs(world, element)) {
        const things = world.relates('suits') ? world.related('suits').filter(r => r.args[1] === verb) : [];
        for (const thing of things.map(r => r.args[0]!)) {
          if (world.test(call('reaches', at.actor, thing)) && !world.test(call('tried', thing, verb))) {
            changes.push({ kind: 'assert', call: call('tried', thing, verb) });
          }
        }
      }
    }
    return changes;
  }
  private static verbs(world: World, element: string): string[] {
    return world.relates('elementVerb') ? world.related('elementVerb').filter(r => r.args[0] === element)
      .map(r => r.args[1]!) : [];
  }
  // Each spell with a harm that lets loose an element a try answers, and the try (`looses(ability, verb)`): what may be
  // cast at a thing between fights (data/rules/elements.kyr's loose_at).
  static looses(module: Module): Change[] {
    const verbs = new Map<string, string[]>();
    for (const c of module.initial) {
      if (c.kind === 'assert' && c.call.name === 'elementVerb') {
        verbs.set(c.call.args[0]!, [...verbs.get(c.call.args[0]!) ?? [], c.call.args[1]!]);
      }
    }
    if (!verbs.size) { return []; }
    return Content.abilities.filter(a => !!a.spell).flatMap(a => [...new Set(this.elements(a, module)
      .flatMap(e => verbs.get(e) ?? []))].map(verb => ({ kind: 'assert' as const,
      call: ModuleWriter.call('looses', a.id, verb) })));
  }
}
