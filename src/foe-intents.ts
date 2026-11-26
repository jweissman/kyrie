import type { Battle } from './battle';
import type { Fighter } from './model';
import { PressOn } from './press-on';

type ArenaAbility = Battle['repertoire'][number];

// What the other side means to do before the company's turn comes round again, in words, for every client: who is
// going for whom, with what, and whether that could bring them down. Each foe declares as the round begins
// (Battle.declare), and the page's cards had shown it only as a label ("Bite → Wenna") while the terminal and the
// runner showed nothing, so that a player answered the hit points and not the blow coming (the cold play of 25
// November: the one fight rated best was the she-bear's, which said it was rearing up to strike).
export class FoeIntents {
  // called: what the company calls each in the fight (BandNames), where a client knows it.
  static lines(battle: Battle, called?: ReadonlyMap<string, string>): string[] {
    const state = battle.view, pending = new Set(state.order ?? []), threat = PressOn.threat(battle);
    const name = FoeIntents.name.bind(undefined, called), out: string[] = [];
    const plain = new Map<string, { who: string; foe: Readonly<Fighter>; ability: ArenaAbility }[]>();
    for (const foe of state.combatants.filter(f => f.team !== 'fighters' && f.hp > 0)) {
      const meant = foe.windup ?? (pending.has(foe.id) ? state.intents?.[foe.id] : undefined);
      const ability = meant && battle.repertoire.find(a => a.id === meant.ability);
      const target = meant && state.combatants.find(f => f.id === meant.target);
      if (!meant || !ability || !target) { continue; }
      const who = FoeIntents.upper(name(foe)), whom = name(target), mine = target.team !== 'fighters';
      const felled = !mine && PressOn.worst(foe, ability) >= target.hp;
      // Plain blows at one of the company, none of them a killing blow, are said together.
      if (!foe.windup && !felled && !mine && ['melee', 'ranged'].includes(ability.id)) {
        plain.set(target.id, [...plain.get(target.id) ?? [], { who: name(foe), foe, ability }]); continue;
      }
      const line = foe.windup ? `${who} has gathered itself to strike ${whom}.`
        : FoeIntents.harms(ability) && !mine ? FoeIntents.blow(who, whom, ability, foe)
          : `${who} means to use ${ability.name.toLowerCase()}${target.id === foe.id ? '' : ` on ${whom}`}.`;
      out.push(felled ? `${line} That could bring ${whom} down.` : line);
    }
    for (const [id, blows] of plain) {
      const target = state.combatants.find(f => f.id === id)!, whom = name(target), [one] = blows;
      const line = blows.length === 1 ? FoeIntents.blow(FoeIntents.upper(one!.who), whom, one!.ability, one!.foe)
        : `${FoeIntents.upper(FoeIntents.joined(blows.map(b => b.who)))} are going for ${whom}.`;
      const together = blows.length > 1 && (threat.get(id)?.harm ?? 0) >= target.hp;
      out.push(together ? `${line} Together they could bring ${whom} down.` : line);
    }
    return out;
  }
  private static joined(names: string[]): string {
    return names.length < 2 ? names[0] ?? '' : `${names.slice(0, -1).join(', ')} and ${names.at(-1)!}`;
  }
  private static blow(who: string, whom: string, ability: ArenaAbility, foe: Readonly<Fighter>): string {
    const held = foe.equipment?.weapon, weapon = held?.name?.toLowerCase();
    if (['melee', 'ranged'].includes(ability.id)) {
      const a = held?.natural ? 'its' : /^[aeiou]/.test(weapon ?? '') ? 'an' : 'a';
      return `${who} is going for ${whom}${weapon && weapon !== 'fist' ? ` with ${a} ${weapon}` : ''}.`;
    }
    return `${who} means to use ${ability.name.toLowerCase()} on ${whom}.`;
  }
  private static harms(ability: ArenaAbility): boolean {
    return ability.effects.some(e => ['attack', 'damage', 'drain', 'apply'].includes(e.kind));
  }
  private static name(called: ReadonlyMap<string, string> | undefined, f: { id: string; name: string }): string {
    return called?.get(f.id) ?? f.name;
  }
  private static upper(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
