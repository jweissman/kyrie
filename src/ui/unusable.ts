import type { Battle } from '../battle';
import type { Fighter } from '../model';
import type { ArenaAbility } from '../lang/parse';
import { Effects } from '../effects';
import { Fighting } from '../rules/fighting';
import { Spellcasting } from '../rules/spellcasting';
import { DailyUses } from '../rules/daily-uses';
import { ConditionSense } from '../canon/condition-sense';

// What the one acting knows and cannot use now, and why (the completion plan's combat function, §2.4: an act that is
// not there says nothing; a technique on cooldown, a spell with no slot left, a thing used up had simply vanished from
// the hand). The reasons are the battle's own rule (Battle.usable), read in its order, first failing first.
export class Unusable {
  static of(battle: Battle, actor: Fighter): { id: string; why: string }[] {
    const usable = new Set(battle.usable(actor).map(a => a.id));
    const known = new Set(actor.abilities);
    return battle.repertoire.filter(a => known.has(a.id) && !usable.has(a.id) && !['wait', 'flee'].includes(a.id))
      .flatMap(a => { const why = this.why(actor, a); return why ? [{ id: a.id, why }] : []; });
  }
  private static why(actor: Fighter, a: ArenaAbility): string | undefined {
    const m = Effects.modifiers(actor), turns = actor.cooldowns?.[a.id] ?? 0;
    if (!DailyUses.ready(actor, a)) { return 'used up until a rest'; }
    // Beyond the caster's level first: a third-level spell known at the first had said "no spell of its level left".
    if ((a.spell?.level ?? a.level ?? 0) > Fighting.maxSpellLevel(actor.level)) { return 'beyond your level yet'; }
    if (!Spellcasting.affordable(actor, a)) { return a.spell ? 'no spell of its level left to cast' : 'not enough mana'; }
    if (turns) { return `again in ${turns} ${turns === 1 ? 'turn' : 'turns'}`; }
    if (a.spell && m.noSpellcasting) { return 'no spell can be cast now'; }
    if (a.requires?.status && !actor.statuses.some(s => s.id === a.requires!.status)) {
      return `only while ${ConditionSense.name(a.requires.status)}`;
    }
    if (a.requires?.notStatus && actor.statuses.some(s => s.id === a.requires!.notStatus)) {
      return `not while ${ConditionSense.name(a.requires.notStatus)}`;
    }
    if (a.requires?.interceptWeapon) { return 'needs a weapon that can turn a blow'; }
    if (actor.stock?.[a.id] && !actor.stock[a.id]!.length) { return 'none left'; }
    return undefined;
  }
}
