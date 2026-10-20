import { Content } from './content';
import { Canon } from './canon/canon';
import { CanonRuntime } from './canon/canon-runtime';
import type { Condition, Hooks } from './canon/schema';
import type { Effect } from './lang/parse';
import type { Expressions } from './expressions';
import type { CombatEvent, Fighter } from './model';
import { Fighting, type Combatant } from './rules/fighting';
import { ModifierSet, type Dice, type Modifiers } from './rules/modifiers';
import type { Attribute } from './creature';

export interface EffectContext {
  source?: { id: string; kind: 'ability' | 'trap' | 'item' | 'shrine'; name?: string };
  actor?: Fighter; recipients?: Fighter[]; values?: Record<string, number>;
  fighters: Fighter[]; turn: number; events: CombatEvent[];
  content: Content; abilities: string[]; retreat: boolean; location: string | null;
  // The seeded stream dice bonuses (bonusDamage "1d4") and temporary hit points are rolled from.
  expressions?: Expressions;
  // Runs a creature's status or item hooks (set by AbilityUse); hooking marks effects already inside a hook.
  hook?: (holder: Fighter, key: keyof Hooks, subject: Fighter, context: EffectContext) => void;
  hooking?: boolean;
}
const ATTRIBUTES: Attribute[] = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
export class Effects {
  static sourceId(context: EffectContext): string {
    const id = context.actor?.id ?? context.source?.id;
    if (!id) { throw new Error('Effects require a source identity'); }
    return id;
  }
  static status(id: string): Condition {
    const condition = Content.statuses[id];
    if (!condition || !Object.hasOwn(Content.statuses, id)) { throw new Error(`Unknown status ${id}`); }
    return condition;
  }
  // Orsino's noActions: the holder loses its turn.
  static skips(id: string): boolean { return Effects.status(id).modifiers.noActions === true; }
  // Orsino's gatherEffects: conditions held, the traits the creature has, its equipment and its kind's resistances.
  static modifiers(fighter: Fighter): Modifiers {
    const conditions = [...new Set(fighter.statuses.map(s => s.id))].map(id => Effects.status(id).modifiers);
    const kind = Canon.isSpecies(fighter.raceId) ? Canon.creature(fighter.raceId).resistances : undefined;
    return ModifierSet.sum([...conditions, ...CanonRuntime.passives(fighter.traits).modifiers,
      fighter.equipment?.modifiers ?? {}, ...kind ? [{ resistances: kind }] : []]);
  }
  static hooks(fighter: Fighter, key: keyof Hooks): Effect[] {
    return [...[...new Set(fighter.statuses.map(s => s.id))].flatMap(id => Effects.status(id).hooks?.[key] ?? []),
      ...fighter.equipment?.hooks?.[key] ?? []];
  }
  // Orsino's effectiveStats: scores with attribute modifiers added.
  static scores(fighter: Fighter): Record<Attribute, number> {
    const m = Effects.modifiers(fighter).attributes ?? {};
    return Object.fromEntries(ATTRIBUTES.map(a => [a, Math.max(1, fighter[a] + (m[a] ?? 0))])) as
      Record<Attribute, number>;
  }
  static combatant(fighter: Fighter): Combatant {
    const scores = Effects.scores(fighter);
    return { level: fighter.level, strength: scores.strength, dexterity: scores.dexterity,
      armorAc: fighter.equipment?.armorAc ?? 0, weapon: fighter.equipment?.weapon ?? { id: 'fist', name: 'Fist',
        damage: '1d2', type: 'bludgeoning', natural: true }, modifiers: Effects.modifiers(fighter) };
  }
  static saveModifier(fighter: Fighter, kind?: string): number {
    const m = Effects.modifiers(fighter);
    return (m.saveVersusAll ?? 0) + (kind ? m.saves?.[kind] ?? 0 : 0);
  }
  static immune(fighter: Fighter, kind: string): boolean {
    return Effects.modifiers(fighter).immune?.includes(kind) ?? false;
  }
  // Deem values for an actor's expressions: Orsino's #str, #wis are the record's scores; #level and #bonusSpellDC too.
  static context(actor: Fighter): Record<string, number> {
    return { strength: actor.strength, dexterity: actor.dexterity, intelligence: actor.intelligence,
      wisdom: actor.wisdom, constitution: actor.constitution, charisma: actor.charisma,
      hp: actor.hp, maxHp: actor.maxHp, mana: actor.mana, level: actor.level,
      bonusSpellDC: Effects.modifiers(actor).bonusSpellDC ?? 0 };
  }
  static dice(value: Dice | undefined, context: EffectContext, actor?: Fighter): number {
    if (value === undefined) { return 0; }
    if (typeof value === 'number') { return value; }
    if (!context.expressions) { throw new Error('Dice bonuses need a seeded expression stream'); }
    return context.expressions.integer(value, actor ? Effects.context(actor) : {});
  }
  static validate(effect: Effect, abilities: string[]) {
    if (!['attack', 'damage', 'heal', 'drain', 'revive', 'defend', 'flee', 'apply', 'remove', 'kill', 'gain',
      'learn', 'summon', 'travel'].includes(effect.kind)) { throw new Error('Unknown typed effect'); }
    if (!['enemy', 'ally', 'self', 'dead ally', 'enemies', 'allies', 'party', 'all', 'random enemy']
      .includes(effect.target)) { throw new Error('Unknown effect target'); }
    for (const amount of [...('amount' in effect ? [effect.amount] : []), ...(effect.save ? [effect.save.difficulty] : [])]) {
      if (!amount || (amount.kind !== 'literal' && amount.kind !== 'deem')
        || (amount.kind === 'literal' && (!Number.isSafeInteger(amount.value) || amount.value < 0))
        || (amount.kind === 'deem' && (typeof amount.expression !== 'string' || !amount.expression.trim()))) {
        throw new Error('Invalid typed effect amount');
      }
    }
    if (effect.kind === 'gain' && !Content.rules.resources.includes(effect.resource)) {
      throw new Error(`Unknown resource ${effect.resource}`);
    }
    if ((effect.kind === 'damage' || (effect.kind === 'drain' && effect.damageType))
      && !Content.rules.damageTypes.includes(effect.damageType!)) {
      throw new Error(`Unknown damage type ${effect.damageType}`);
    }
    if (effect.onResist && !['damage', 'drain'].includes(effect.kind)) { throw new Error('Only damage halves on a resisted spell'); }
    if (effect.save?.success && (!['negate', 'half'].includes(effect.save.success)
      || (effect.save.success === 'half' && effect.kind !== 'damage'))) {
      throw new Error('Half saves require a damage effect');
    }
    if (effect.save && (effect.save.stat === undefined) === (effect.save.kind === undefined)) {
      throw new Error('A save names either an attribute or a save category');
    }
    if (effect.save?.stat !== undefined && !ATTRIBUTES.includes(effect.save.stat as Attribute)) {
      throw new Error(`Unknown saving stat ${effect.save.stat}`);
    }
    if (effect.save?.kind !== undefined && !Object.hasOwn(Content.rules.saveKinds, effect.save.kind)) {
      throw new Error(`Unknown save category ${effect.save.kind}`);
    }
    if (effect.kind === 'apply') { Effects.status(effect.status); }
    // Removing a status Kyr cannot execute is harmless: nothing can hold it.
    if (effect.kind === 'remove' && !Canon.conditions[Canon.resolve('conditions', effect.status)]) {
      throw new Error(`Unknown status ${effect.status}`);
    }
    if (effect.kind === 'apply' && effect.clock !== undefined
      && !['owner-turn', 'world-time', 'until-removed'].includes(effect.clock)) { throw new Error('Unknown condition clock'); }
    if (effect.kind === 'apply' && effect.clock && effect.clock !== 'owner-turn'
      && Effects.status(effect.status).lifetime !== 'persistent') {
      throw new Error('A world-time or until-removed condition needs persistent lifetime');
    }
    if (effect.kind === 'apply' && (!Number.isSafeInteger(effect.duration) || effect.duration < 1)) {
      throw new Error('Status duration must be positive');
    }
    if (effect.kind === 'learn' && !abilities.includes(effect.ability)) { throw new Error('Unknown taught ability'); }
    if (effect.kind === 'summon' && !Canon.isSpecies(effect.creature)) { throw new Error('Unknown summoned creature'); }
  }
  // Damage that reaches a creature is soaked by its conditions' temporary hit points first (Commands.handleHit).
  static hp(target: Fighter, amount: number, context: EffectContext, healing = false) {
    let absorbed = 0;
    if (!healing) {
      for (const s of target.statuses.filter(c => (c.tempHp ?? 0) > 0)) {
        const soak = Math.min(s.tempHp!, amount - absorbed);
        s.tempHp! -= soak; absorbed += soak;
      }
    }
    const remaining = amount - absorbed;
    const applied = healing ? Math.min(remaining, target.maxHp - target.hp) : Math.min(remaining, target.hp);
    target.hp += healing ? applied : -applied;
    context.events.push({ type: healing ? 'heal' : 'damage', turn: context.turn,
      actor: Effects.sourceId(context), target: target.id, rolled: amount, amount: applied, hp: target.hp });
    if (!healing && target.hp === 0) { context.events.push({ type: 'death', turn: context.turn, actor: target.id }); }
    return { applied, absorbed };
  }
  private static detail(context: EffectContext, target: Fighter, data: {
    type: 'status' | 'remove' | 'revive' | 'gain' | 'learn' | 'summon' | 'travel'; detail: string; amount?: number;
    clock?: 'owner-turn' | 'world-time' | 'until-removed';
  }) {
    context.events.push({ ...data, turn: context.turn, actor: Effects.sourceId(context), target: target.id });
  }
  // Commands.handleSave for a save category: d20 (with allRolls) ≥ DC − (attribute modifier + level + saveVersus<Kind>
  // + saveVersusAll); immunity succeeds; after three successes in one category within an encounter, saves fail.
  static save(target: Fighter, kind: string, difficulty: number, context: EffectContext): boolean {
    const actor = context.actor?.id ?? Effects.sourceId(context), turn = context.turn;
    if (Effects.immune(target, kind)) {
      context.events.push({ type: 'save', turn, actor, target: target.id, rolled: 0, difficulty, success: true,
        kind, immune: true });
      return true;
    }
    const attribute = Content.rules.saveKinds[kind as keyof typeof Content.rules.saveKinds] as Attribute;
    const die = Fighting.d20(() => context.expressions!.number('1d20'), Effects.modifiers(target));
    const modifier = Fighting.statMod(Effects.scores(target)[attribute]), bonus = Effects.saveModifier(target, kind);
    const total = die + modifier + target.level + bonus;
    const limit = (target.saved?.[kind] ?? 0) >= Content.rules.saveLimit;
    const success = !limit && total >= difficulty;
    if (success) { (target.saved ??= {})[kind] = (target.saved[kind] ?? 0) + 1; }
    context.events.push({ type: 'save', turn, actor, target: target.id, rolled: total, die, modifier, stat: attribute,
      level: target.level, bonus, difficulty, success, kind, ...limit ? { limit: true } : {} });
    return success;
  }
  // Orsino's handleHit after the roll: the attacker's bonusDamage, resistance, damageReduction, temporary hit points.
  static damage(target: Fighter, hit: { amount: number; type: string; critical?: number }, context: EffectContext) {
    if (target.hp === 0) { return 0; }
    const { amount: rolled, type } = hit, actor = context.actor;
    const bonus = actor && actor.id !== target.id
      ? Effects.dice(Effects.modifiers(actor).bonusDamage, context, actor) : 0;
    const mitigated = Fighting.mitigate(rolled, type, { bonus, defender: Effects.modifiers(target),
      physical: Content.rules.physicalDamage });
    const { applied, absorbed } = Effects.hp(target, mitigated.amount, context);
    const event = context.events.findLast(e => e.type === 'damage');
    if (event?.type === 'damage') {
      event.rolled = rolled; event.damageType = type;
      event.modifiers = { bonus: mitigated.bonus, resistance: mitigated.resistance, reduction: mitigated.reduction,
        ...absorbed ? { absorbed } : {}, ...hit.critical ? { critical: hit.critical } : {} };
    }
    Effects.aftermath(target, type, context);
    return applied;
  }
  // The rest of handleHit. A creature brought to 0 saves vs death at DC 25 and stays at 1 hit point if it succeeds.
  // A survivor of damage of a triggering kind saves (DC 15) against each condition that kind triggers (piercing:
  // bleed, slashing: shred, fire: burning…), and its onAttacked hooks answer damage from another creature.
  private static aftermath(target: Fighter, type: string, context: EffectContext) {
    if (!context.expressions) { return; }
    if (target.hp === 0) {
      const death = context.events.findLastIndex(e => e.type === 'death' && e.actor === target.id);
      if (Effects.save(target, 'death', 25, context)) {
        target.hp = 1;
        if (death >= 0) { context.events.splice(death, 1); }
        context.events.push({ type: 'revive', turn: context.turn, actor: target.id, target: target.id,
          detail: 'saved against death', amount: 1 });
      }
      return;
    }
    for (const [id, status] of Object.entries(Content.statuses).filter(([, c]) => c.trigger === type)) {
      if (target.hp === 0) { continue; }
      if (!Effects.save(target, status.saveKind ?? 'magic', 15, context)) {
        Effects.condition({ kind: 'apply', status: id, duration: status.duration ?? 3, target: 'enemy' }, target, context);
      }
    }
    const actor = context.actor;
    if (actor && actor.id !== target.id && target.hp > 0) { context.hook?.(target, 'onAttacked', actor, context); }
  }
  // World-time conditions tick with the clock: their turn-end effects happen and their remaining time runs down.
  static advance(target: Fighter, clock: 'world-time' | 'owner-turn', context: EffectContext) {
    for (const active of target.statuses.filter(s => s.clock === clock)) {
      Effects.periodic(target, active.id, active.source, context);
      active.remaining--;
    }
    Effects.expire(target, s => s.clock === clock, context);
  }
  static expire(target: Fighter, ticking: (s: Fighter['statuses'][number]) => boolean, context: EffectContext) {
    target.statuses = target.statuses.filter(s => {
      if (!ticking(s) || s.remaining > 0) { return true; }
      context.events.push({ type: 'expire', turn: context.turn, actor: s.source ?? s.id, target: target.id, detail: s.id });
      return false;
    });
  }
  // Orsino's onTurnEnd hooks of one condition: periodic damage or healing, rolled from the seeded stream.
  static periodic(target: Fighter, id: string, source: string | undefined, context: EffectContext) {
    for (const p of Effects.status(id).modifiers.onTurnEnd ?? []) {
      if (target.hp === 0) { return; }
      const amount = /^\d+$/.test(p.amount) ? Number(p.amount)
        : context.expressions!.number(p.amount, Effects.context(target));
      const tick = { ...context, actor: undefined, source: { id: source ?? id, kind: 'ability' as const } };
      if (p.kind === 'damage') { Effects.damage(target, { amount, type: p.damageType! }, tick); }
      else { Effects.hp(target, amount, tick, true); }
    }
  }
  static apply(effect: Effect, target: Fighter, rolled: number, context: EffectContext) {
    const actor = context.actor;
    switch (effect.kind) {
      case 'defend': case 'attack': throw new Error(`${effect.kind} is resolved by AbilityUse`);
      // Orsino's Flee: an even chance to get away; a failed attempt costs the turn.
      case 'flee': {
        const away = !context.expressions || context.expressions.number('1d2') === 1;
        context.retreat = away;
        context.events.push({ type: 'flee', turn: context.turn, actor: Effects.sourceId(context), success: away });
        break;
      }
      case 'damage': Effects.damage(target, { amount: rolled, type: effect.damageType }, context); break;
      case 'drain': {
        const dealt = Effects.damage(target, { amount: rolled, type: effect.damageType ?? 'necrotic' }, context);
        if (actor) { Effects.hp(actor, dealt, context, true); }
        break;
      }
      case 'heal':
        if (target.hp > 0 && target.hp < target.maxHp) {
          const bonus = actor ? Effects.dice(Effects.modifiers(actor).bonusHealing, context, actor) : 0;
          Effects.hp(target, Math.max(1, rolled + bonus), context, true);
        }
        break;
      case 'revive':
        if (target.hp === 0 && rolled > 0) {
          target.hp = Math.min(rolled, target.maxHp);
          Effects.detail(context, target, { type: 'revive', detail: 'returned to life', amount: target.hp });
        }
        break;
      case 'kill': if (target.hp > 0) { Effects.hp(target, target.hp, context); } break;
      case 'apply': Effects.condition(effect, target, context); break;
      case 'remove':
        // Removing what a creature does not have is not news.
        if (target.statuses.some(s => s.id === effect.status)) {
          target.statuses = target.statuses.filter(s => s.id !== effect.status);
          Effects.detail(context, target, { type: 'remove', detail: effect.status });
        }
        break;
      case 'gain': {
        const amount = effect.resource === 'mana' ? Math.min(rolled, target.maxMana - target.mana) : rolled;
        target[effect.resource] += amount;
        if (amount) { Effects.detail(context, target, { type: 'gain', detail: effect.resource, amount }); }
        break;
      }
      case 'learn':
        if (!target.abilities.includes(effect.ability)) { target.abilities.push(effect.ability); }
        Effects.detail(context, target, { type: 'learn', detail: effect.ability });
        break;
      case 'summon': {
        if (!actor) { throw new Error('Summoning requires a creature actor'); }
        const id = `summon-${context.fighters.length}-${context.turn}`;
        context.fighters.push(context.content.creature(effect.creature, id, actor.team));
        Effects.detail(context, target, { type: 'summon', detail: id });
        break;
      }
      case 'travel': context.location = effect.location; Effects.detail(context, target, { type: 'travel', detail: effect.location }); break;
    }
  }
  // Commands.handleStatusEffect: a reapplied status replaces the old one; temporary hit points are rolled now.
  static condition(effect: Extract<Effect, { kind: 'apply' }>, target: Fighter, context: EffectContext) {
    if (target.hp === 0) { return; }
    const status = Effects.status(effect.status);
    target.statuses = target.statuses.filter(s => s.id !== effect.status
      || (status.stacking === 'source-refresh' && s.source !== context.source?.id));
    const pool = status.modifiers.tempHp && context.expressions
      ? context.expressions.number(status.modifiers.tempHp, context.actor ? Effects.context(context.actor) : {}) : 0;
    target.statuses.push({ id: effect.status, remaining: effect.duration,
      ...effect.clock ? { clock: effect.clock } : {},
      ...context.source ? { source: context.source.id } : {}, ...context.actor ? { by: context.actor.id } : {},
      ...pool ? { tempHp: pool } : {} });
    Effects.detail(context, target, { type: 'status', detail: effect.status, amount: effect.duration,
      ...effect.clock ? { clock: effect.clock } : {} });
  }
}
