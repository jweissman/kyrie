import type { Battle } from './battle';
import type { Fighter } from './model';
import { Peril } from './peril';
import { Telegraph } from './telegraph';
import type { ItemCatalog } from './item-catalog';

type ArenaAbility = Battle['repertoire'][number];

// What the other side means to do before the company's turn comes round again, in words, for every client: who is
// going for whom, with what, and whether that could bring them down. Each foe declares as the round begins
// (Battle.declare), and the page's cards had shown it only as a label ("Bite → Wenna") while the terminal and the
// runner showed nothing, so that a player answered the hit points and not the blow coming (the cold play of 25
// November: the one fight rated best was the she-bear's, which said it was rearing up to strike). How each looks is
// its kind's and its blow's (Telegraph): a wolf slinks round, an archer draws, a mage's hands kindle.
export class FoeIntents {
  // called: what the company calls each in the fight (BandNames), where a client knows it.
  static lines(battle: Battle, called?: ReadonlyMap<string, string>): string[] {
    const state = battle.view, pending = new Set(state.order ?? []);
    const name = FoeIntents.name.bind(undefined, called), out: string[] = [];
    const plain = new Map<string, Readonly<Fighter>[]>();
    for (const foe of state.combatants.filter(f => f.team !== 'fighters' && f.hp > 0)) {
      const meant = foe.windup ?? (pending.has(foe.id) ? state.intents?.[foe.id] : undefined);
      const ability = meant && battle.repertoire.find(a => a.id === meant.ability);
      const target = meant && state.combatants.find(f => f.id === meant.target);
      if (!meant || !ability || !target) { continue; }
      const whom = name(target), mine = target.team !== 'fighters';
      // Said only where it is a chance worth weighing (Peril), not wherever the dice at their worst would reach.
      const felled = !mine && Peril.material(battle, target, [foe]);
      // Plain blows at one of the company, none of them a killing blow, are said together.
      if (!foe.windup && !felled && !mine && ['melee', 'ranged'].includes(ability.id)) {
        plain.set(target.id, [...plain.get(target.id) ?? [], foe]); continue;
      }
      const line = foe.windup ? Telegraph.gathered(foe, ability, target, name)
        : FoeIntents.one(foe, ability, target, { catalog: battle.catalog, name });
      out.push(felled ? `${line} That could bring ${whom} down.` : line);
    }
    for (const [id, foes] of plain) {
      const target = state.combatants.find(f => f.id === id)!, whom = name(target), [one] = foes;
      const ability = battle.repertoire.find(a => a.id === state.intents?.[one!.id]?.ability)!;
      const line = foes.length === 1 ? FoeIntents.one(one!, ability, target, { catalog: battle.catalog, name })
        : Telegraph.together(foes, target, { who: FoeIntents.joined(foes.map(name)), whom });
      const together = foes.length > 1 && Peril.material(battle, target, foes);
      out.push(together ? `${line} Together they could bring ${whom} down.` : line);
    }
    return out;
  }
  private static one(foe: Readonly<Fighter>, ability: ArenaAbility, target: Readonly<Fighter>,
    at: { catalog: ItemCatalog; name: (f: { id: string; name: string }) => string }): string {
    return Telegraph.of(at.catalog, foe, ability, { target, called: at.name }).line;
  }
  private static joined(names: string[]): string {
    return names.length < 2 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} and ${names.at(-1)!}`;
  }
  private static name(called: ReadonlyMap<string, string> | undefined, f: { id: string; name: string }): string {
    return called?.get(f.id) ?? f.name;
  }
}
