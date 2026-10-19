import { FantasyRules } from './fantasy-rules';
import { Effects, type EffectContext } from './effects';
import { Targeting } from './targeting';
import type { Expressions } from './expressions';
import { Content } from './content';
import type { ArenaAbility, Save } from './lang/parse';
import type { Fighter } from './model';

export class AbilityUse {
  // Attribute saves: d20 + statMod + save modifiers. Category saves follow Orsino's handleSave: the category's
  // attribute, plus level, plus saveVersus<Category> and saveVersusAll; immunity succeeds; a fourth success in one
  // category within an encounter fails. The score modifier is Kyr's statMod, not Orsino's.
  private static save(roll: { save: Save; target: Fighter; difficulty: number }, expressions: Expressions,
    context: EffectContext) {
    const { save, target, difficulty } = roll;
    const actor = context.actor?.id ?? Effects.sourceId(context), turn = context.turn;
    if (save.kind) {
      const attribute = Content.rules.saveKinds[save.kind as keyof typeof Content.rules.saveKinds];
      if (Effects.immune(target, save.kind)) {
        context.events.push({ type: 'save', turn, actor, target: target.id, rolled: 0, difficulty, success: true,
          kind: save.kind, immune: true });
        return true;
      }
      const die = expressions.number('1d20'), bonus = Effects.saveModifier(target, save.kind);
      const modifier = FantasyRules.statMod(Effects.context(target)[attribute!]);
      const total = die + modifier + target.level + bonus;
      const limit = (target.saved?.[save.kind] ?? 0) >= Content.rules.saveLimit;
      const success = !limit && total >= difficulty;
      if (success) { (target.saved ??= {})[save.kind] = (target.saved[save.kind] ?? 0) + 1; }
      context.events.push({ type: 'save', turn, actor, target: target.id, rolled: total, die, modifier, stat: attribute,
        level: target.level, bonus, difficulty, success, kind: save.kind, ...limit ? { limit: true } : {} });
      return success;
    }
    const stat = Effects.context(target)[save.stat!];
    if (stat === undefined) { throw new Error(`Unknown saving stat ${save.stat}`); }
    const die = expressions.number('1d20'), modifier = FantasyRules.statMod(stat) + Effects.saveModifier(target);
    const total = die + modifier, success = total >= difficulty;
    context.events.push({ type: 'save', turn, actor, target: target.id, rolled: total, die, modifier, stat: save.stat,
      difficulty, success });
    return success;
  }
  static perform(ability: ArenaAbility, targetId: string, expressions: Expressions, context: EffectContext) {
    const actor = context.actor;
    if (![ability.cost ?? 0, ability.cooldown ?? 0].every(n => Number.isSafeInteger(n) && n >= 0)) {
      throw new Error('Invalid ability cost or cooldown');
    }
    if (ability.damagePolicy !== undefined && ability.damagePolicy !== 'typed-v1') {
      throw new Error('Unknown damage policy');
    }
    ability.effects.forEach(e => Effects.validate(e, context.abilities));
    if (ability.attack && (!actor || !['strength', 'dexterity'].includes(ability.attack.stat)
      || !Number.isSafeInteger(ability.attack.defense) || ability.attack.defense < 1
      || !Number.isSafeInteger(ability.attack.critical) || ability.attack.critical < 1)) {
      throw new Error('Invalid attack rule');
    }
    if (!actor && (!context.source || !context.recipients)) { throw new Error('A non-creature source needs bound recipients'); }
    if (!actor && (ability.cost || ability.effects.some(e => ['defend', 'flee', 'drain', 'summon', 'travel'].includes(e.kind)
      || e.target === 'self'))) { throw new Error('This ability requires a creature actor'); }
    if ((ability.cost ?? 0) > (actor?.mana ?? 0)) { throw new Error('Insufficient mana'); }
    const values = actor ? Effects.context(actor) : context.values ?? {};
    const prepared = ability.effects.filter(effect => !effect.when
      || expressions.condition(effect.when, values)).map(effect => {
      const candidates = actor ? Targeting.candidates(effect.target, actor, context.recipients ?? context.fighters)
        : context.recipients!.filter(f => effect.target === 'dead ally' ? f.hp === 0 : f.hp > 0);
      if (!candidates.length) { throw new Error('No eligible ability target'); }
      const targets = effect.target === 'random enemy' ?
        [candidates[expressions.number(`1d${candidates.length}`) - 1]!] :
        Targeting.selected(effect.target) ? candidates.filter(f => f.id === targetId) : candidates;
      if (!targets.length) { throw new Error('No eligible ability target'); }
      return { effect, targets, rolled: 'amount' in effect ? expressions.amount(effect.amount, values) : 0,
        difficulty: effect.save ? expressions.amount(effect.save.difficulty, values) : null };
    });
    if (actor) {
      actor.mana -= ability.cost ?? 0;
      actor.cooldowns[ability.id] = (ability.cooldown ?? 0) + 1;
    }
    context.events.push({ type: 'action', turn: context.turn,
      command: { actor: actor?.id ?? Effects.sourceId(context), ability: ability.id, target: targetId },
      source: context.source ?? { id: actor!.id, kind: 'ability' } });
    if (ability.damagePolicy === 'typed-v1') {
      context.damageBudget = new Map(prepared.flatMap(p => p.targets).map(t =>
        [t.id, { power: false, armor: Effects.modifier(t, 'armor') }]));
    }
    else { delete context.damageBudget; }
    const attacks = new Map<string, { success: boolean; critical: boolean }>();
    if (ability.attack && actor) {
      for (const target of new Set(prepared.flatMap(p => p.targets))) {
        const die = expressions.number('1d20'), modifier = FantasyRules.statMod(actor[ability.attack.stat]);
        const success = die !== 1 && (die === 20 || die + modifier >= ability.attack.defense);
        const critical = success && die === 20;
        attacks.set(target.id, { success, critical });
        context.events.push({ type: 'attack', turn: context.turn, actor: actor.id, target: target.id,
          die, modifier, defense: ability.attack.defense, success, critical });
      }
    }
    let applied = 0, resisted = 0;
    for (const { effect, targets, rolled, difficulty } of prepared) {
      for (const target of targets) {
        const attack = attacks.get(target.id);
        if (attack && !attack.success) { resisted++; continue; }
        let halfSave = false;
        let amount = attack?.critical && effect.kind === 'damage' ? rolled * ability.attack!.critical : rolled;
        if (effect.save && difficulty !== null) {
          const success = AbilityUse.save({ save: effect.save, target, difficulty }, expressions, context);
          if (success) {
            resisted++;
            if (effect.save.success !== 'half') { continue; }
            halfSave = true; amount = Math.floor(amount / 2);
          }
        }
        const sourceBound = effect.kind === 'apply'
          && (Effects.status(effect.status) as { stacking?: string }).stacking === 'source-refresh';
        const effectContext = sourceBound && actor && !context.source ? { ...context,
          source: { id: `${actor.id}:${ability.id}`, kind: 'ability' as const } } : context;
        applied++;
        const start = context.events.length;
        Effects.apply(effect, target, amount, effectContext);
        if ((attack?.critical || halfSave) && effect.kind === 'damage') {
          const damage = context.events.slice(start).find(e => e.type === 'damage');
          if (damage?.type === 'damage' && damage.modifiers) {
            damage.rolled = rolled;
            if (attack?.critical) { damage.modifiers.critical = ability.attack!.critical; }
            if (halfSave) { damage.modifiers.halfSave = true; }
          }
        }
      }
    }
    return { outcome: applied ? resisted ? 'partial' as const : 'success' as const : 'failure' as const,
      actor: actor?.id, source: context.source?.id ?? actor!.id,
      targets: [...new Set(prepared.flatMap(p => p.targets.map(t => t.id)))], mana: ability.cost ?? 0 };
  }
}
