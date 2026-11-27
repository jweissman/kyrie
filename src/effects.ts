import { Flight } from './rules/flight'; import { Conditions } from './ports/conditions'; import { Traits } from './ports/traits';
import { FixedStatBlock } from './rules/fixed-stat-block';
import { ActorValues } from './rules/actor-values';
import { Spellcasting } from './rules/spellcasting';
import { DailyUses } from './rules/daily-uses';
import { Lesson } from './lang';
import { LevelDrain } from './rules/level-drain'; import { Flames } from './rules/flames';
import { Summoning } from './summoning';
import { Content } from './content';
import { Canon } from './canon/canon';
import { Perks } from './rules/perks';
import type { Condition, HookKey } from './rules/catalog-schema';
import type { Effect } from './lang/parse';
import type { Fighter } from './model';
import type { EffectContext } from './effect-context';
export type { EffectContext } from './effect-context';
import { Fighting, type Combatant } from './rules/fighting';
import type { Dice, Modifiers } from './rules/modifiers';
import { KindDefenses, type Hit } from './kind-defenses';
import { PlaceLaws } from './rules/place-laws';
import { GatheredModifiers } from './gathered-modifiers';
import { SaveOutcome } from './rules/save-outcome';
import { Lasting } from './rules/lasting';
import { Images } from './rules/images';
import { ConditionAmount } from './rules/condition-amount';
import type { Attribute } from './creature';

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
  // Whether a condition outlasts a fight: one that lasts until it is lifted (a curse, a disease), or one that runs on
  // the world's clock or until removed, however it would last in a fight (asleep for an hour).
  static lasting(s: { id: string; clock?: string }): boolean {
    return s.clock === 'world-time' || s.clock === 'until-removed' || Effects.status(s.id).lifetime === 'persistent';
  }
  static skips(id: string): boolean { return Effects.status(id).modifiers.noActions === true; }
  // Orsino's gatherEffects (see GatheredModifiers).
  static modifiers(fighter: Fighter): Modifiers { return GatheredModifiers.of(fighter); }
  static hooks(fighter: Fighter, key: HookKey): Effect[] {
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
    const scores = Effects.scores(fighter), fixedToHit = FixedStatBlock.toHit(fighter);
    return { level: fighter.level, strength: scores.strength, dexterity: scores.dexterity,
      armorAc: fighter.equipment?.armorAc ?? 0, weapon: fighter.equipment?.weapon ?? { ...Canon.rules.combat.fist },
      modifiers: Effects.modifiers(fighter), ...fixedToHit !== undefined ? { fixedToHit } : {} };
  }
  static saveModifier(fighter: Fighter, kind?: string): number {
    const m = Effects.modifiers(fighter), block = kind ? FixedStatBlock.save(fighter, kind, this.scores(fighter)) : 0;
    return (m.saveVersusAll ?? 0) + (kind ? m.saves?.[kind] ?? 0 : 0) + block;
  }
  static immune(f: Fighter, kind: string): boolean { return Effects.modifiers(f).immune?.includes(kind) ?? false; }
  static hitDice(fighter: Fighter): number { return ActorValues.hitDice(fighter); }
  // Deem values for an actor's expressions (ActorValues): its scores, #level, #castingLevel and #bonusSpellDC.
  static context(actor: Fighter, castingLevel?: number): Record<string, number> {
    const values = ActorValues.of(actor, Effects.modifiers(actor).bonusSpellDC ?? 0);
    return castingLevel === undefined ? values : { ...values, castingLevel };
  }
  static dice(value: Dice | undefined, context: EffectContext, actor?: Fighter): number {
    if (value === undefined || typeof value === 'number') { return value ?? 0; }
    if (!context.expressions) { throw new Error('Dice bonuses need a seeded expression stream'); }
    return context.expressions.integer(value, actor ? Effects.context(actor, context.castingLevel) : {});
  }
  static validate(effect: Effect, abilities: string[]) {
    if (!['attack', 'damage', 'heal', 'drain', 'enervate', 'revive', 'defend', 'flee', 'apply', 'remove', 'kill', 'gain',
      'learn', 'summon', 'travel', 'random', 'cycle', 'cast', 'try'].includes(effect.kind)) { throw new Error('Unknown typed effect'); }
    if (effect.kind === 'random' || effect.kind === 'cycle') { effect.effects.forEach(e => Effects.validate(e, abilities)); }
    if (!['enemy', 'ally', 'self', 'dead ally', 'enemies', 'allies', 'party', 'all', 'random enemy', 'random enemies', 'it',
      'here'].includes(effect.target)) { throw new Error('Unknown effect target'); }
    if (effect.kind === 'cast' && effect.castingLevel !== undefined
      && (!Number.isSafeInteger(effect.castingLevel) || effect.castingLevel < 1)) {
      throw new Error('A cast has a positive whole-number caster level');
    }
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
    SaveOutcome.validate(effect);
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
    if (effect.kind === 'remove' && !effect.pattern && !Conditions.of(effect.status)) {
      throw new Error(`Unknown status ${effect.status}`);
    }
    if (effect.kind === 'apply' && effect.clock !== undefined
      && !['owner-turn', 'world-time', 'until-removed'].includes(effect.clock)) { throw new Error('Unknown condition clock'); }
    const lasting = effect.kind === 'apply' ? Lasting.problem(effect.duration) : undefined;
    if (lasting) { throw new Error(lasting); }
    if (effect.kind === 'learn' && !abilities.includes(effect.ability)) { throw new Error('Unknown taught ability'); }
    // A raising gives back at most the whole of a body's health (150% set 22 of 15, which no store would keep).
    if (effect.kind === 'revive' && effect.percent !== undefined && !(effect.percent > 0 && effect.percent <= 100)) {
      throw new Error('A raising restores between 1 and 100 percent of health');
    }
    if (effect.kind === 'summon' && [effect.creature, ...effect.from ?? [], ...Object.values(effect.byAncestry ?? {}).flat()]
      .some(s => !Canon.isSpecies(s))) { throw new Error('Unknown summoned creature'); }
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
    type: 'status' | 'remove' | 'revive' | 'gain' | 'learn' | 'summon' | 'dismiss' | 'travel'; detail: string; amount?: number;
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
  static damage(target: Fighter, hit: Hit, context: EffectContext) {
    if (target.hp === 0) { return 0; }
    const { amount: rolled, type } = hit, actor = context.actor;
    const bonus = actor && actor.id !== target.id ? Effects.dice(Effects.modifiers(actor).bonusDamage, context, actor)
      + (context.spell ? Effects.modifiers(actor).bonusSpellDamage ?? 0 : 0) : 0;
    const mitigated = KindDefenses.mitigate(target, { ...hit, amount: rolled, bonus }, context);
    // Orsino's reflect: a share of the blow goes back on whoever dealt it, through its own defences, and the holder
    // takes the rest; never true damage, nor a blow itself reflected.
    const share = actor && actor.id !== target.id && type !== 'true' && !context.reflected
      ? Effects.modifiers(target).reflectDamagePercent ?? 0 : 0;
    const back = Math.floor(mitigated.amount * share);
    const kept = share ? Math.floor(mitigated.amount * (1 - share)) : mitigated.amount;
    const { applied, absorbed } = Effects.hp(target, kept, context);
    const event = context.events.findLast(e => e.type === 'damage');
    if (event?.type === 'damage') {
      event.rolled = rolled; event.damageType = type;
      event.modifiers = { bonus: mitigated.bonus, resistance: mitigated.resistance, reduction: mitigated.reduction,
        ...absorbed ? { absorbed } : {}, ...hit.critical ? { critical: hit.critical } : {},
        ...KindDefenses.account(mitigated) };
    }
    Effects.aftermath(target, type, context, applied > 0 && hit.triggers !== false);
    if (back > 0) { Effects.damage(actor!, { amount: back, type }, { ...context, actor: target, reflected: true }); }
    return applied;
  }
  // The rest of handleHit. A creature brought to 0 saves vs death at DC 25 and stays at 1 hit point if it succeeds.
  // A survivor of damage of a triggering kind saves (DC 15) against each condition that kind triggers (piercing:
  // bleed, slashing: shred, fire: burning…), and its onAttacked hooks answer damage from another creature.
  private static aftermath(target: Fighter, type: string, context: EffectContext, wounded: boolean) {
    if (!context.expressions) { return; }
    if (target.hp === 0) {
      const death = context.events.findLastIndex(e => e.type === 'death' && e.actor === target.id);
      // The company keeps Orsino's save; a foe brought to 0 is dead unless its kind rises again (CO-05: "falls",
      // told, had been followed by "returns with 1 HP").
      const rises = !!target.traits?.includes('rises_again');
      if ((target.team === 'fighters' || rises) && Effects.save(target, 'death', Canon.rules.combat.deathSave, context)) {
        target.hp = 1;
        if (death >= 0) { context.events.splice(death, 1); }
        context.events.push({ type: 'revive', turn: context.turn, actor: target.id, target: target.id,
          detail: rises && target.team !== 'fighters' ? 'rises again' : 'saved against death', amount: 1 });
      }
      return;
    }
    // Aliases ("stunned" for stun) name the same condition; each triggered condition is saved against once. Outside a
    // fight none that lasts a fight begins: a night's cold chills, and does not encase a kneeling penitent in ice
    // until the next fight ends (A Winter in Carth's friction 4: a bard who knelt a night on the Steps froze, died).
    for (const [id, status] of Object.entries(Content.statuses)
      // Only a blow that wounds (Orsino's damage of the kind): a bite for nothing had left its target bleeding (R9-06).
      .filter(([id, c]) => wounded && c.trigger === type && Canon.resolve('conditions', id) === id && !context.applies?.has(id)
        && !(context.field && c.lifetime === 'encounter'))) {
      if (target.hp === 0) { continue; }
      const saved = Effects.save(target, status.saveKind ?? 'magic', Canon.rules.combat.triggerSave, context);
      const roll = context.events.at(-1);
      if (roll?.type === 'save') { roll.against = id; }
      if (!saved) {
        Effects.condition({ kind: 'apply', status: id, duration: status.duration ?? Canon.rules.combat.triggerTurns,
          target: 'enemy' }, target, context);
      }
    }
    const actor = context.actor;
    if (actor && actor.id !== target.id && target.hp > 0) { context.hook?.(target, 'onAttacked', actor, context); }
  }
  // World-time conditions tick with the clock: their turn-end effects happen and their remaining time runs down,
  // all but those held for now (a lantern that is not wanted).
  static advance(target: Fighter, clock: 'world-time' | 'owner-turn', context: EffectContext,
    held?: (id: string) => boolean) {
    for (const active of target.statuses.filter(s => s.clock === clock && !held?.(s.id))) {
      Effects.periodic(target, active.id, active.source, context);
      active.remaining--;
    }
    Effects.expire(target, s => s.clock === clock, context);
  }
  // A condition is said to end when none of it is left: one burn of two (from two fires) running out is not the
  // holder no longer burning (the follow-up review read "is not burning" beside Burning).
  static expire(target: Fighter, ticking: (s: Fighter['statuses'][number]) => boolean, context: EffectContext) {
    const ended = target.statuses.filter(s => ticking(s) && s.remaining <= 0);
    target.statuses = target.statuses.filter(s => !ended.includes(s));
    for (const s of ended) {
      if (!target.statuses.some(x => x.id === s.id) && ended.find(x => x.id === s.id) === s) {
        context.events.push({ type: 'expire', turn: context.turn, actor: s.source ?? s.id, target: target.id, detail: s.id });
      }
      Effects.lapse(target, s.id, context);
    }
  }
  // Orsino's onExpire: what a condition does as it lapses (a countdown's blast), to its holder or whoever is named.
  static lapse(holder: Fighter, id: string, context: EffectContext) {
    const effects = Effects.status(id).hooks?.onExpire ?? [];
    if (effects.length && holder.hp > 0) { context.lapse?.(holder, effects, context); }
  }
  // What tells on a creature at the end of its turn: the conditions it holds, and what it is by nature (a troll's
  // regeneration, Orsino's trait onTurnEnd: it had been kept and never run; the owner, 6 November, OSR mechanics).
  static turnEnd(actor: Fighter, context: EffectContext) {
    for (const s of actor.statuses.filter(c => !c.clock)) { Effects.periodic(actor, s.id, s.source, context); }
    for (const t of actor.traits ?? []) {
      Effects.periodicOf(actor, Traits.of(t)?.modifiers?.onTurnEnd ?? [], t, context);
    }
    // And of what it wears: a ring of regeneration's mending (the item audit's G5: summed, and never run).
    Effects.periodicOf(actor, actor.equipment?.modifiers?.onTurnEnd ?? [], 'equipment', context);
    // And the laws of the place the fight is fought in (GT-01).
    KindDefenses.regenerate(actor, context); PlaceLaws.tick(actor, context);
  }
  // Orsino's onTurnEnd hooks of one condition: periodic damage or healing, rolled from the seeded stream.
  static periodic(target: Fighter, id: string, source: string | undefined, context: EffectContext) {
    Effects.periodicOf(target, Effects.status(id).modifiers.onTurnEnd ?? [], source ?? id, context);
  }
  static periodicOf(target: Fighter, ticks: NonNullable<Modifiers['onTurnEnd']>, source: string, context: EffectContext) {
    for (const p of ticks) {
      if (target.hp === 0) { return; }
      const amount = /^\d+$/.test(p.amount) ? Number(p.amount)
        : context.expressions!.number(p.amount, Effects.context(target));
      const tick = { ...context, actor: undefined, source: { id: source, kind: 'ability' as const } };
      if (p.kind === 'damage') { Effects.damage(target, { amount, type: p.damageType!, triggers: p.triggers }, tick); }
      else { Effects.hp(target, amount, tick, true); }
    }
  }
  // What a condition is known by, for a cure that names it: its id, the id it stands for, its kind of harm, its name.
  static names(id: string): string[] {
    const status = Effects.status(id);
    return [id, Canon.resolve('conditions', id), ...status.saveKind ? [status.saveKind] : [], status.name];
  }
  // Whether a remove effect lifts this condition: the one it names, or any its pattern names.
  static removes(effect: Extract<Effect, { kind: 'remove' }>, id: string): boolean {
    if (!effect.pattern) { return id === effect.status; }
    const pattern = new RegExp(`^(${effect.pattern})$`, 'i');
    return Effects.names(id).some(n => pattern.test(n));
  }
  // What is left of a body's conditions once it is raised: not its death. A raising in a fight and one at a shrine are
  // the same raising (FieldUse.raise).
  static raised<T extends { id: string }>(conditions: T[]): T[] {
    return conditions.filter(c => c.id !== Canon.rules.combat.ids.slain);
  }
  static apply(effect: Effect, target: Fighter, rolled: number, context: EffectContext) {
    const actor = context.actor;
    switch (effect.kind) {
      case 'defend': case 'attack': throw new Error(`${effect.kind} is resolved by AbilityUse`);
      // Orsino's Flee: an even chance to get away; a failed attempt costs the turn. Kyr's company gives ground with
      // each try that fails (three in four the second time, sure the third), and gets away for certain in the moment
      // before a fight that came at it closes: flight failed again and again (PT-24), and a fragile company was killed
      // by what it had no turn to back away from (PT-10).
      case 'flee': {
        const odds = Flight.roll(context.tries ?? 0);
        const dice = !context.sure && odds ? context.expressions : undefined;
        const away = !dice || dice.number(odds!.die) <= odds!.atMost;
        context.retreat = away;
        context.events.push({ type: 'flee', turn: context.turn, actor: Effects.sourceId(context), success: away });
        break;
      }
      case 'damage': Effects.damage(target, KindDefenses.blow(effect, rolled), context); break;
      case 'drain': {
        const dealt = Effects.damage(target, KindDefenses.blow(effect, rolled, 'necrotic'), context);
        // What was drawn heals a drainer who is still alive (a shield that answered the blow could have killed it,
        // and the draining raised it: the review's A5).
        if (actor && actor.hp > 0) { Effects.hp(actor, dealt, context, true); }
        break;
      }
      case 'heal':
        if (target.hp > 0 && target.hp < target.maxHp) {
          const bonus = actor ? Effects.dice(Effects.modifiers(actor).bonusHealing, context, actor) : 0;
          Effects.hp(target, Math.max(1, rolled + bonus), context, true);
        }
        break;
      case 'revive':
        if (target.hp === 0 && (rolled > 0 || effect.percent)) {
          target.hp = effect.percent ? Math.max(1, Math.floor((Math.min(effect.percent, 100) / 100) * target.maxHp))
            : Math.min(rolled, target.maxHp);
          // Raised is raised: whoever had died is no longer dead (a companion raised in a fight was "slain" for good,
          // and lost every turn after: the architecture review's A4).
          target.statuses = Effects.raised(target.statuses);
          target.traits = [...new Set([...target.traits ?? [], ...effect.traits ?? []])];
          Effects.detail(context, target, { type: 'revive', detail: 'returned to life', amount: target.hp });
        }
        break;
      case 'kill': if (target.hp > 0) { Effects.hp(target, target.hp, context); } break;
      case 'enervate': context.events.push(...LevelDrain.take(target, rolled, context, Effects.immune(target, 'drain'))); break;
      case 'apply': Effects.condition(effect, target, context); break;
      case 'remove': {
        // Removing what a creature does not have is not news. A pattern removes every condition it names: by its id,
        // its kind of harm (poison, disease, fear) or its name. By name alone, "cure disease" lifted nothing from the
        // Diseased, nor the restorations Kyr's lasting Poisoned (the review's A5).
        const removed = target.statuses.filter(s => Effects.removes(effect, s.id));
        LevelDrain.without(target, removed);
        for (const s of removed) { Effects.detail(context, target, { type: 'remove', detail: s.id }); }
        break;
      }
      case 'gain': Effects.gain(effect, target, rolled, context); break;
      case 'learn': Effects.learn(effect, target, context); break;
      case 'summon': {
        if (!actor) { throw new Error('Summoning requires a creature actor'); }
        Summoning.call(effect, actor, context);
        break;
      }
      case 'travel': context.location = effect.location; Effects.detail(context, target, { type: 'travel', detail: effect.location }); break;
    }
  }
  private static learn(effect: Extract<Effect, { kind: 'learn' }>, target: Fighter, context: EffectContext) {
    const ability = Lesson.change(effect, target.id).call.args[1]!;
    if (!target.abilities.includes(ability)) { target.abilities.push(ability); }
    if (!(target.taught ??= []).includes(ability)) { target.taught.push(ability); }
    Effects.detail(context, target, { type: 'learn', detail: ability });
  }
  // Spell slots made ready again, mana up to its maximum, or coin and experience.
  private static gain(effect: Extract<Effect, { kind: 'gain' }>, target: Fighter, rolled: number,
    context: EffectContext) {
    if (effect.resource === 'uses') {
      const back = DailyUses.restore(target, rolled, context.recovery);
      if (back) { Effects.detail(context, target, { type: 'gain', detail: back === 1 ? 'use' : 'uses', amount: back }); }
      return;
    }
    if (effect.resource === 'slots') {
      const restored = Spellcasting.restore(target, rolled);
      if (restored) {
        Effects.detail(context, target, { type: 'gain', detail: restored === 1 ? 'spell slot' : 'spell slots', amount: restored });
      }
      return;
    }
    const amount = effect.resource === 'mana' ? Math.min(rolled, target.maxMana - target.mana) : rolled;
    target[effect.resource] += amount;
    if (amount) { Effects.detail(context, target, { type: 'gain', detail: effect.resource, amount }); }
  }
  // Commands.handleStatusEffect: a reapplied status replaces the old one; temporary hit points are rolled now, by
  // whoever gave it, or by its holder when nobody did (a ward from a lantern lifted off its hook: "14 + 2 * #level" had
  // no level to read, and the page showed the engine's error).
  static condition(effect: Extract<Effect, { kind: 'apply' }>, target: Fighter, context: EffectContext) {
    if (target.hp === 0) { return; }
    // A hold already on is not lengthened: a creature that loses its turns to it is not held a whole fight by the
    // same spell cast again each round (a red dragon frozen throughout by a first-level mage's frostbite).
    if (Effects.skips(effect.status) && target.statuses.some(s => s.id === effect.status)) { return; }
    // How long it lasts, by its caster's values as it is laid (see Lasting): one that comes to no turns lays nothing.
    const rounds = Lasting.laid(effect.duration, context.expressions,
      Effects.context(context.actor ?? target, context.castingLevel));
    if (rounds < 1) { return; }
    const status = Effects.status(effect.status);
    const prior = ConditionAmount.prior(status.stacking, target.statuses, effect.status);
    // A flame in hand is one: a lantern lit puts out the candle that burned (see Flames).
    const out = Flames.out(target.statuses, effect.status);
    target.statuses = target.statuses.filter(s => !out.includes(s) && (s.id !== effect.status
      || (status.stacking === 'source-refresh' && s.source !== context.source?.id)));
    const pool = status.modifiers.tempHp && context.expressions
      ? context.expressions.number(status.modifiers.tempHp,
        Effects.context(context.actor ?? target, context.castingLevel)) : 0;
    const images = Images.laid(status.modifiers.images, context, target);
    const amount = ConditionAmount.laid(effect.amount, context.expressions,
      Effects.context(context.actor ?? target, context.castingLevel));
    // A perk can make every status its holder applies last longer (a troupe's resonant harmony), and a flame they
    // light burn longer, by hours of six watches (the Lantern's gift: OR-118).
    const at = context.actor?.environment ? { environment: context.actor.environment } : {};
    const longer = context.actor ? Perks.bonus(context.actor.traits, 'spellDuration', at) + (status.grants?.includes('flame')
      ? Perks.bonus(context.actor.traits, 'light', at) * (effect.clock === 'world-time' ? 6 : 1) : 0) : 0;
    target.statuses.push({ id: effect.status, remaining: rounds + longer, ...effect.clock ? { clock: effect.clock }: {},
      ...!effect.clock && context.actor && context.actor.id !== target.id ? { waits: true } : {},
      ...context.source ? { source: context.source.id } : {}, ...context.actor ? { by: context.actor.id } : {},
      ...pool ? { tempHp: pool } : {}, ...images ? { images } : {}, ...ConditionAmount.held(amount, prior) });
    Effects.detail(context, target, { type: 'status', detail: effect.status, amount: rounds,
      ...effect.clock ? { clock: effect.clock } : {} });
  }
}
