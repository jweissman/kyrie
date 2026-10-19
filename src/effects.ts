import { Content } from './content';
import { CanonRuntime } from './canon/canon-runtime';
import type { Condition } from './canon/schema';
import type { Effect } from './lang/parse';
import type { CombatEvent, Fighter } from './model';

interface StatusDefinition {
  armor: number; power: number; save?: number; saves?: Record<string, number>; immune?: string[];
  resistances?: Record<string, number>;
}
export interface EffectContext {
  source?: { id: string; kind: 'ability' | 'trap' | 'item' | 'shrine'; name?: string };
  damageBudget?: Map<string, { power: boolean; armor: number }>;
  actor?: Fighter; recipients?: Fighter[]; values?: Record<string, number>;
  fighters: Fighter[]; turn: number; events: CombatEvent[];
  content: Content; abilities: string[]; retreat: boolean; location: string | null;
}
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
  // Permanent modifiers from the creature's kind and the traits it chose, read by the same modifier, save and
  // resistance queries as applied conditions. They are never applied, expired or removed.
  private static attached(fighter: Fighter): StatusDefinition[] {
    const conditions = [...new Set(fighter.statuses.map(s => s.id))].map(id => Effects.status(id) as StatusDefinition);
    return [...conditions, ...CanonRuntime.passives(fighter.raceId, fighter.traits)
      .map(m => ({ ...m, armor: m.armor ?? 0, power: m.power ?? 0 }))];
  }
  static modifier(fighter: Fighter, key: 'armor' | 'power'): number {
    return (fighter.attachmentModifiers?.[key] ?? 0)
      + Effects.attached(fighter).reduce((sum, s) => sum + s[key], 0);
  }
  static saveModifier(fighter: Fighter, kind?: string): number {
    return (fighter.attachmentModifiers?.save ?? 0) + Effects.attached(fighter).reduce((sum, s) =>
      sum + (s.save ?? 0) + (kind ? s.saves?.[kind] ?? 0 : 0), 0);
  }
  static immune(fighter: Fighter, kind: string): boolean {
    return Effects.attached(fighter).some(s => s.immune?.includes(kind));
  }
  static resistance(fighter: Fighter, type: string): number {
    if (type === 'true') { return 0; }
    const physical = ['physical', 'piercing', 'slashing', 'bludgeoning'].includes(type);
    const granted = Effects.attached(fighter).map(s =>
      s.resistances?.[type] ?? (physical ? s.resistances?.physical : undefined) ?? -1);
    return Math.max(Content.resistance(fighter.raceId, type), ...granted);
  }
  static context(actor: Fighter): Record<string, number> {
    return { strength: actor.strength, dexterity: actor.dexterity, intelligence: actor.intelligence,
      wisdom: actor.wisdom, constitution: actor.constitution, charisma: actor.charisma,
      hp: actor.hp, maxHp: actor.maxHp, mana: actor.mana, level: actor.level };
  }
  static validate(effect: Effect, abilities: string[]) {
    if (!['damage', 'heal', 'drain', 'revive', 'defend', 'flee', 'apply', 'remove', 'kill', 'gain',
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
    if (effect.kind === 'damage' && !Content.rules.damageTypes.includes(effect.damageType)) {
      throw new Error(`Unknown damage type ${effect.damageType}`);
    }
    if (effect.save?.success && (!['negate', 'half'].includes(effect.save.success)
      || (effect.save.success === 'half' && effect.kind !== 'damage'))) {
      throw new Error('Half saves require a damage effect');
    }
    if (effect.save && (effect.save.stat === undefined) === (effect.save.kind === undefined)) {
      throw new Error('A save names either an attribute or a save category');
    }
    if (effect.save?.stat !== undefined && !['strength', 'dexterity', 'constitution', 'wisdom', 'intelligence',
      'charisma'].includes(effect.save.stat)) { throw new Error(`Unknown saving stat ${effect.save.stat}`); }
    if (effect.save?.kind !== undefined && !Object.hasOwn(Content.rules.saveKinds, effect.save.kind)) {
      throw new Error(`Unknown save category ${effect.save.kind}`);
    }
    if (effect.kind === 'apply' || effect.kind === 'remove') { Effects.status(effect.status); }
    if (effect.kind === 'apply' && effect.clock !== undefined
      && !['owner-turn', 'world-time', 'until-removed'].includes(effect.clock)) { throw new Error('Unknown condition clock'); }
    if (effect.kind === 'apply' && effect.clock && effect.clock !== 'owner-turn'
      && Effects.status(effect.status).lifetime !== 'persistent') {
      throw new Error('A world-time or until-removed condition needs persistent lifetime');
    }
    if (effect.kind === 'apply' && effect.clock && Effects.status(effect.status).damage
      && !(Effects.status(effect.status) as { damageType?: string }).damageType) {
      throw new Error(`Status ${effect.status} needs a damage type for its clock`);
    }
    if (effect.kind === 'apply' && (!Number.isSafeInteger(effect.duration) || effect.duration < 1)) {
      throw new Error('Status duration must be positive');
    }
    if (effect.kind === 'learn' && !abilities.includes(effect.ability)) { throw new Error('Unknown taught ability'); }
    if (effect.kind === 'summon' && !Object.hasOwn(Content.creatures, effect.creature)) {
      throw new Error('Unknown summoned creature');
    }
  }
  static hp(target: Fighter, amount: number, context: EffectContext, healing = false) {
    const applied = healing ? Math.min(amount, target.maxHp - target.hp) : Math.min(amount, target.hp);
    target.hp += healing ? applied : -applied;
    context.events.push({ type: healing ? 'heal' : 'damage', turn: context.turn,
      actor: Effects.sourceId(context), target: target.id, rolled: amount, amount: applied, hp: target.hp });
    if (!healing && target.hp === 0) {
      context.events.push({ type: 'death', turn: context.turn, actor: target.id });
    }
    return applied;
  }
  private static detail(context: EffectContext, target: Fighter, data: {
    type: 'status' | 'remove' | 'revive' | 'gain' | 'learn' | 'summon' | 'travel'; detail: string; amount?: number;
    clock?: 'owner-turn' | 'world-time' | 'until-removed';
  }) {
    context.events.push({ ...data, turn: context.turn, actor: Effects.sourceId(context), target: target.id });
  }
  static advance(target: Fighter, clock: 'world-time' | 'owner-turn', context: EffectContext) {
    for (const active of target.statuses) {
      if (active.clock !== clock) { continue; }
      const status = Effects.status(active.id) as { damage: number; damageType?: string };
      if (status.damage && !status.damageType) { throw new Error(`Status ${active.id} needs a damage type for its clock`); }
      if (status.damage && target.hp > 0) {
        const source = { id: active.source ?? active.id, kind: 'ability' as const };
        Effects.apply({ kind: 'damage', amount: { kind: 'literal', value: status.damage },
          damageType: status.damageType!, target: 'ally' }, target, status.damage,
        { ...context, actor: undefined, source,
          damageBudget: new Map([[target.id, { power: false, armor: Effects.modifier(target, 'armor') }]]) });
      }
      active.remaining--;
    }
    target.statuses = target.statuses.filter(s => {
      if (s.clock !== clock || s.remaining > 0) { return true; }
      context.events.push({ type: 'expire', turn: context.turn, actor: s.source ?? s.id,
        target: target.id, detail: s.id });
      return false;
    });
  }
  static apply(effect: Effect, target: Fighter, rolled: number, context: EffectContext) {
    const actor = context.actor;
    switch (effect.kind) {
      case 'defend':
        if (!actor) { throw new Error('Defending requires a creature actor'); }
        actor.guarding = true;
        context.events.push({ type: 'defend', turn: context.turn, actor: actor.id });
        break;
      case 'flee': context.retreat = true; break;
      case 'damage': case 'drain': {
        if (target.hp === 0) { break; }
        const type = effect.kind === 'damage' ? effect.damageType : 'necrotic';
        const physical = ['physical', 'piercing', 'slashing', 'bludgeoning'].includes(type);
        const budget = context.damageBudget?.get(target.id);
        const power = actor && (!budget || (physical && !budget.power))
          ? Effects.modifier(actor, 'power') : 0;
        const armor = type === 'true' ? 0
          : budget ? physical ? budget.armor : 0 : Effects.modifier(target, 'armor');
        const resistance = Math.min(1, Effects.resistance(target, type));
        if (budget && physical) { budget.power = true; budget.armor = 0; }
        const damage = Math.max(0, Math.floor(Math.max(0, rolled + power) * (1 - resistance)) - armor);
        const amount = Effects.hp(target, target.guarding ? Math.floor(damage / 2) : damage, context);
        const hit = context.events.findLast(e => e.type === 'damage');
        if (hit?.type === 'damage') {
          hit.rolled = rolled;
          hit.damageType = effect.kind === 'damage' ? effect.damageType : 'necrotic';
          hit.modifiers = { power, armor, resistance, guarding: target.guarding };
        }
        if (effect.kind === 'drain' && actor) { Effects.hp(actor, amount, context, true); }
        break;
      }
      case 'heal': if (target.hp > 0) { Effects.hp(target, rolled, context, true); } break;
      case 'revive':
        if (target.hp === 0 && rolled > 0) {
          target.hp = Math.min(rolled, target.maxHp);
          Effects.detail(context, target, { type: 'revive', detail: 'returned to life', amount: target.hp });
        }
        break;
      case 'kill': if (target.hp > 0) { Effects.hp(target, target.hp, context); } break;
      case 'apply':
        if (target.hp > 0) {
          target.statuses = target.statuses.filter(s => s.id !== effect.status
            || ((Effects.status(effect.status) as { stacking?: string }).stacking === 'source-refresh'
              && s.source !== context.source?.id));
          target.statuses.push({ id: effect.status, remaining: effect.duration,
            ...(effect.clock ? { clock: effect.clock } : {}),
            ...(context.source ? { source: context.source.id } : {}) });
          Effects.detail(context, target, { type: 'status', detail: effect.status, amount: effect.duration,
            ...(effect.clock ? { clock: effect.clock } : {}) });
        }
        break;
      case 'remove':
        target.statuses = target.statuses.filter(s => s.id !== effect.status);
        Effects.detail(context, target, { type: 'remove', detail: effect.status });
        break;
      case 'gain': {
        const amount = effect.resource === 'mana' ? Math.min(rolled, target.maxMana - target.mana) : rolled;
        target[effect.resource] += amount;
        Effects.detail(context, target, { type: 'gain', detail: effect.resource, amount });
        break;
      }
      case 'learn':
        if (!target.abilities.includes(effect.ability)) { target.abilities.push(effect.ability); }
        Effects.detail(context, target, { type: 'learn', detail: effect.ability });
        break;
      case 'summon': {
        if (!actor) { throw new Error('Summoning requires a creature actor'); }
        const id = `summon-${context.fighters.length}-${context.turn}`;
        const summoned = context.content.creature(effect.creature, id, actor.team);
        context.fighters.push(summoned);
        Effects.detail(context, target, { type: 'summon', detail: id });
        break;
      }
      case 'travel': context.location = effect.location; Effects.detail(context, target, { type: 'travel', detail: effect.location }); break;
    }
  }
}
