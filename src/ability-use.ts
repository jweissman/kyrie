import { Reactions } from './reactions';
import { CompoundEffects } from './compound-effects';
import { Spellcasting } from './rules/spellcasting';
import { Effects, type EffectContext } from './effects';
import { Targeting } from './targeting';
import type { Expressions } from './expressions';
import type { ArenaAbility, Effect, Save } from './lang/parse';
import type { Fighter } from './model';
import { Fighting } from './rules/fighting';
import type { HookKey } from './canon/schema';
import { Canon } from './canon/canon';
import { Perks } from './rules/perks';
import { PerkTriggers } from './rules/perk-triggers';

export class AbilityUse {
  // Category saves follow Orsino's handleSave: d20 (with allRolls) + the category's attribute modifier + level +
  // saveVersus<Category> + saveVersusAll ≥ DC; immunity succeeds; a fourth success in one category fails. Attribute
  // saves (a Kyr hazard's "dexterity save") add the attribute modifier and saveVersusAll.
  static save(roll: { save: Save; target: Fighter; difficulty: number }, expressions: Expressions,
    context: EffectContext) {
    const { save, target, difficulty } = roll;
    if (save.kind) { return Effects.save(target, save.kind, difficulty, { ...context, expressions }); }
    const actor = context.actor?.id ?? Effects.sourceId(context), turn = context.turn;
    const stat = Effects.scores(target)[save.stat as keyof ReturnType<typeof Effects.scores>];
    if (stat === undefined) { throw new Error(`Unknown saving stat ${save.stat}`); }
    const die = Fighting.d20(() => expressions.number('1d20'), Effects.modifiers(target));
    const modifier = Fighting.statMod(stat) + Effects.saveModifier(target);
    const total = die + modifier, success = total >= difficulty;
    context.events.push({ type: 'save', turn, actor, target: target.id, rolled: total, die, modifier, stat: save.stat,
      difficulty, success });
    return success;
  }
  private static validate(ability: ArenaAbility, context: EffectContext) {
    const actor = context.actor;
    if (![ability.cost ?? 0, ability.cooldown ?? 0].every(n => Number.isSafeInteger(n) && n >= 0)) {
      throw new Error('Invalid ability cost or cooldown');
    }
    ability.effects.forEach(e => Effects.validate(e, context.abilities));
    if (!actor && (!context.source || !context.recipients)) { throw new Error('A non-creature source needs bound recipients'); }
    if (!actor && (ability.cost || ability.effects.some(e => ['defend', 'flee', 'drain', 'summon', 'travel', 'attack']
      .includes(e.kind) || e.target === 'self'))) { throw new Error('This ability requires a creature actor'); }
    if (!context.free && (actor ? !Spellcasting.affordable(actor, ability) : (ability.cost ?? 0) > 0)) {
      throw new Error(Spellcasting.needsSlot(ability) ? `No ready slot holds ${ability.id}` : 'Insufficient mana');
    }
  }
  private static targets(effect: Effect, targetId: string, expressions: Expressions,
    context: EffectContext): Fighter[] {
    const actor = context.actor;
    const candidates = actor ? Targeting.candidates(effect.target, actor, context.recipients ?? context.fighters)
      : context.recipients!.filter(f => effect.target === 'dead ally' ? f.hp === 0 : f.hp > 0);
    const chosen = effect.target === 'random enemy' || effect.target === 'random enemies'
      ? context.drawn ??= AbilityUse.draw(effect, candidates, expressions, context)
      : Targeting.selected(effect.target) ? candidates.filter(f => f.id === targetId) : candidates;
    return effect.targetTrait ? chosen.filter(f => f.traits?.includes(effect.targetTrait!)) : chosen;
  }
  // Orsino's randomEnemies: distinct living enemies, as many as the count (one for a random enemy), from the seed.
  private static draw(effect: Effect, candidates: Fighter[], expressions: Expressions,
    context: EffectContext): Fighter[] {
    const values = context.actor ? Effects.context(context.actor) : context.values ?? {};
    const n = effect.target === 'random enemy' ? 1 : Math.max(0, expressions.amount(effect.count ?? { kind: 'literal', value: 1 }, values));
    const pool = [...candidates], picked: Fighter[] = [];
    while (picked.length < Math.min(n, candidates.length)) {
      picked.push(...pool.splice(expressions.number(`1d${pool.length}`) - 1, 1));
    }
    return picked;
  }
  // Ability.perform: pay, give each target of an offensive spell its resist save, then resolve the effects in order;
  // the first effect that succeeds on no target ends the ability (a missed attack, a saved debuff).
  static perform(ability: ArenaAbility, chosenId: string, expressions: Expressions, context: EffectContext) {
    AbilityUse.validate(ability, context);
    const actor = context.actor, outer = context.drawn;
    context.drawn = undefined;
    const targetId = AbilityUse.guarded(ability, chosenId, context);
    context.expressions = expressions;
    context.hook ??= AbilityUse.hooks.bind(AbilityUse);
    const effects = ability.effects.filter(effect => !effect.when
      || expressions.condition(effect.when, actor ? Effects.context(actor) : context.values ?? {}));
    // An ability with no effects (Orsino's wait), or whose conditions all fail, resolves without touching anyone.
    if (effects.length && effects.every(e => !AbilityUse.targets(e, targetId, expressions, context).length
      && !['defend', 'flee', 'travel'].includes(e.kind))) { throw new Error('No eligible ability target'); }
    if (actor && !context.free) {
      Spellcasting.spend(actor, ability);
      actor.cooldowns[ability.id] = (ability.cooldown ?? 0) + 1;
    }
    context.events.push({ type: 'action', turn: context.turn,
      command: { actor: actor?.id ?? Effects.sourceId(context), ability: ability.id, target: chosenId },
      source: context.source ?? { id: actor!.id, kind: 'ability' } });
    if (targetId !== chosenId) {
      context.events.push({ type: 'intercept', turn: context.turn, actor: targetId, target: chosenId });
    }
    const resisted = new Set<string>();
    if (ability.resist && actor) {
      const dc = expressions.amount(ability.resist.difficulty, Effects.context(actor));
      const touched = new Set(effects.flatMap(e => AbilityUse.targets(e, targetId, expressions, context)));
      for (const t of [...touched].filter(t => t.team !== actor.team)) {
        if (Effects.save(t, ability.resist.kind, dc, context)) { resisted.add(t.id); }
      }
    }
    let applied = 0, failed = 0;
    const touched = new Set<string>(), alive = new Set(context.fighters.filter(f => f.hp > 0).map(f => f.id));
    for (const effect of effects) {
      const targets = AbilityUse.targets(effect, targetId, expressions, context);
      let success = ['defend', 'flee', 'travel'].includes(effect.kind) && !targets.length;
      if (success) { Effects.apply(effect, actor!, 0, context); }
      for (const target of targets) {
        touched.add(target.id);
        const took = AbilityUse.effectOn(effect, target, { expressions, context, resisted: resisted.has(target.id),
          ability: ability.id });
        if (took) { success = true; applied++; }
        if (took !== 'full') { failed++; }
      }
      if (!success) { break; }
    }
    if (applied) { PerkTriggers.after(ability, actor, alive, context); }
    Reactions.cast(ability, actor, context);
    context.drawn = outer;
    return { outcome: applied ? failed ? 'partial' as const : 'success' as const : 'failure' as const,
      actor: actor?.id, source: context.source?.id ?? actor!.id, targets: [...touched], mana: ability.cost ?? 0 };
  }
  // A blow aimed at one enemy who is guarded strikes the guard instead, while the guard stands and can act.
  private static guarded(ability: ArenaAbility, targetId: string, context: EffectContext): string {
    const actor = context.actor;
    if (!actor || !ability.effects.some(e => e.target === 'enemy')) { return targetId; }
    const target = context.fighters.find(f => f.id === targetId);
    if (!target || target.team === actor.team) { return targetId; }
    const guard = target.statuses.filter(s => Canon.conditions[Canon.resolve('conditions', s.id)]?.guard && s.by)
      .map(s => context.fighters.find(f => f.id === s.by))
      .find(g => g && g.id !== target.id && g.hp > 0 && g.team === target.team
        && !g.statuses.some(s => Effects.skips(s.id)));
    return guard?.id ?? targetId;
  }
  // One effect on one target (Ability.handleSingleEffect): whether it took hold fully, partly (halved by a save or a
  // resisted spell), or not at all.
  static effectOn(effect: Effect, target: Fighter, options: {
    expressions: Expressions; context: EffectContext; resisted?: boolean; ability?: string;
  }): 'full' | 'partial' | false {
    const { expressions, context } = options, actor = context.actor;
    if (target.hp === 0 && effect.kind !== 'revive') { return false; }
    if (actor && !context.hooking && target.team !== actor.team) {
      Reactions.provoke(actor, Reactions.keys(options.ability, effect), context);
      if (actor.hp === 0) { return false; }
    }
    if (effect.kind === 'attack') { return AbilityUse.attack(actor!, target, context, effect.spillover === true) && 'full'; }
    if (effect.kind === 'random' || effect.kind === 'cycle') { return CompoundEffects.one(effect, target, options); }
    if (effect.kind === 'cast') { return CompoundEffects.cast(effect, target, options); }
    if (effect.kind === 'apply' && effect.save && options.resisted) { return false; }
    let took: 'full' | 'partial' = 'full';
    const values = actor ? Effects.context(actor) : context.values ?? {};
    // A perk can make one ability hit harder (a thieves' guild's backstab).
    const harder = actor && options.ability && (effect.kind === 'damage' || effect.kind === 'drain')
      ? Perks.abilityDamage(actor.traits, options.ability) : 1;
    let amount = 'amount' in effect && effect.kind !== 'summon' ? Math.floor(expressions.amount(effect.amount, values) * harder) : 0;
    const rolled = amount;
    if (options.resisted && effect.onResist) {
      if (effect.onResist === 'negate') { return false; }
      amount = Math.floor(amount / 2); took = 'partial';
    }
    if (effect.save) {
      const difficulty = expressions.amount(effect.save.difficulty, values);
      if (AbilityUse.save({ save: effect.save, target, difficulty }, expressions, context)) {
        if (effect.save.success !== 'half') { return false; }
        amount = Math.floor(amount / 2); took = 'partial';
      }
    }
    const sourceBound = effect.kind === 'apply'
      && Effects.status(effect.status).stacking === 'source-refresh';
    const effectContext = sourceBound && actor && !context.source ? { ...context,
      source: { id: `${actor.id}:${options.ability ?? 'hook'}`, kind: 'ability' as const } } : context;
    const start = context.events.length;
    Effects.apply(effect, target, amount, effectContext);
    // Orsino's onHeal: the healer's own statuses answer its healing (a healer marked for judgment burns).
    if (effect.kind === 'heal' && actor) { AbilityUse.hooks(actor, 'onHeal', target, context); }
    if (took === 'partial' && effect.kind === 'damage') {
      const hit = context.events.slice(start).find(e => e.type === 'damage');
      if (hit?.type === 'damage' && hit.modifiers) { hit.modifiers.halfSave = true; hit.rolled = rolled; }
    }
    return took;
  }
  // Fighting.attack and Commands.handleAttack: the attack roll with the actor's weapon, its damage, and the hooks of
  // attacking (onAttack), hitting (onAttackHit) and being missed (onMissReceived). A spillover attack that kills
  // carries its excess on to another living enemy, chosen from the seeded stream (Orsino uses Math.random).
  static attack(actor: Fighter, target: Fighter, context: EffectContext, spillover: boolean): boolean {
    const expressions = context.expressions!;
    AbilityUse.hooks(actor, 'onAttack', actor, context);
    if (actor.hp === 0 || target.hp === 0) { return false; }
    const attacker = Effects.combatant(actor);
    const roll = Fighting.attack(attacker, Effects.combatant(target), () => expressions.number('1d20'));
    context.events.push({ type: 'attack', turn: context.turn, actor: actor.id, target: target.id, die: roll.die,
      need: roll.need, toHit: roll.toHit, armorClass: roll.armorClass, weapon: attacker.weapon.id,
      success: roll.success, critical: roll.critical, ...roll.evasion?.evaded ? { evaded: true } : {} });
    if (!roll.success) {
      AbilityUse.hooks(target, 'onMissReceived', actor, context);
      return false;
    }
    const rolled = expressions.number(attacker.weapon.damage, Effects.context(actor));
    const melee = Effects.dice(attacker.modifiers.bonusMeleeDamage, context, actor);
    const damage = Fighting.weaponDamage(attacker, rolled, roll.critical, melee);
    const before = target.hp;
    Effects.damage(target, { amount: damage.amount, type: attacker.weapon.type, critical: damage.critical },
      { ...context, actor });
    AbilityUse.hooks(actor, 'onAttackHit', target, context);
    if (spillover && target.hp === 0 && damage.amount > before) {
      AbilityUse.spill(actor, damage.amount - before, attacker.weapon.type, context);
    }
    return true;
  }
  private static spill(actor: Fighter, excess: number, type: string, context: EffectContext) {
    let remaining = excess;
    let others = context.fighters.filter(f => f.team !== actor.team && f.hp > 0);
    while (others.length && remaining > 0) {
      const next = others[context.expressions!.number(`1d${others.length}`) - 1]!;
      const hp = next.hp;
      Effects.damage(next, { amount: remaining, type }, { ...context, actor });
      if (next.hp > 0 || remaining <= hp) { break; }
      remaining -= hp; others = others.filter(f => f !== next);
    }
  }
  // A lapsing condition's effects (Orsino's onExpire): its holder acts them out, on itself or as they aim.
  static lapse(holder: Fighter, effects: Effect[], context: EffectContext) {
    const inner: EffectContext = { ...context, actor: holder, hooking: true, drawn: undefined };
    for (const effect of effects) {
      if (holder.hp === 0) { break; }
      if (!AbilityUse.effectOn(effect, holder, { expressions: context.expressions!, context: inner })) { break; }
    }
  }
  // A status or item hook: each effect touches the holder (target self) or the hook's subject (the creature hit, the
  // attacker who missed, or the holder itself for onAttack). Hooks do not trigger further hooks.
  static hooks(holder: Fighter, key: HookKey, subject: Fighter, context: EffectContext) {
    const effects = Effects.hooks(holder, key);
    if (!effects.length || context.hooking) { return; }
    const inner: EffectContext = { ...context, actor: holder, hooking: true };
    for (const effect of effects) {
      const target = effect.target === 'self' ? holder : subject;
      if (target.hp === 0 || holder.hp === 0) { continue; }
      if (!AbilityUse.effectOn(effect, target, { expressions: context.expressions!, context: inner })) { break; }
    }
  }
}
