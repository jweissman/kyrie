import { Spellcasting } from '../rules/spellcasting';
import { Content } from '../content';
import { Deem } from 'deem';
import { Canon } from '../canon/canon';
import { FantasyRules } from '../fantasy-rules';
import type { Amount, ArenaAbility, Effect, Save, Target } from '../lang/parse';
import type { Modifiers } from '../rules/modifiers';

type Expression = Parameters<Deem['explain']>[0] & object;
type Interval = { min: number; max: number };
export interface AbilityText { summary: string; details: string[] }

// Player-facing text derived from typed mechanics, so what an ability is said to do is what it does. With an actor's
// statistics, formulas are specialized to that actor (statMod(#strength) + 1d6 becomes 1d6 + 2).
export class MechanicsText {
  private static readonly preview = new Deem({ seed: 0, stdlib: FantasyRules.functions,
    pure: Object.keys(FantasyRules.functions) });
  private static readonly targets: Record<Target, string> = {
    enemy: 'one enemy', enemies: 'every enemy', ally: 'one ally', allies: 'every ally', party: 'the whole company',
    self: 'yourself', all: 'everyone', 'dead ally': 'a fallen ally', 'random enemy': 'a random enemy',
    'random enemies': 'random enemies',
  };
  // What an ability does, in words a player would use (Mission 16 found "You gain defending for 1 turn", "a will
  // save against 19" and costs in brackets mid-sentence): what it does, then what each condition it gives does, then
  // what kind of spell it is, what it takes and when it can be used again.
  static ability(ability: ArenaAbility, actor?: Record<string, number>): AbilityText {
    // Enemies drawn at random are drawn once: a later effect falls on the same ones; one enemy or ally, named once, is
    // "it" after.
    const parts = ability.effects.map((e, i) => {
      const before = ability.effects.slice(0, i).some(p => p.target === e.target);
      return this.effect(e, actor, e.target === 'random enemies' ? before
        : before && e.target === 'enemy' ? 'it' : before && e.target === 'ally' ? 'that ally' : false);
    });
    const level = ability.spell?.level ?? 0;
    const costs = [level ? `Takes ${level === 8 ? 'an' : 'a'} ${Spellcasting.ordinal(level)}-level slot.`
      : ability.spell ? `${/^[aeiou]/.test(ability.spell.tradition) ? 'An' : 'A'} ${ability.spell.tradition} cantrip, cast at will.`
        : ability.cost ? `Costs ${ability.cost} mana.` : '',
    ability.cooldown ? `Again after ${ability.cooldown === 1 ? 'a turn' : `${ability.cooldown} turns`}.` : '']
      .filter(Boolean);
    const details = [...new Set(ability.effects.flatMap(e => e.kind === 'apply' ? [e.status]
      : this.triggered(e).map(([id]) => id)))].map(id => this.condition(id, actor)).filter((d): d is string => !!d);
    const kind = ability.spell?.tradition ?? '', an = /^[aeiou]/.test(kind) ? 'An' : 'A';
    const spell = !ability.spell ? [] : ability.spell.level ? [`${an} ${kind} spell of the ${Spellcasting.ordinal(level)} level.`]
      : [];
    return { summary: `${this.capitalize(parts.join('; '))}.`, details: [...details, ...spell, ...costs] };
  }
  // What using an ability spends, in a few words: "1st-level slot", "cantrip", "2 mana", or nothing.
  static price(ability: ArenaAbility): string {
    const level = ability.spell?.level ?? 0;
    return level ? `${['1st', '2nd', '3rd'][level - 1] ?? `${level}th`}-level slot` : ability.spell ? 'cantrip'
      : ability.cost ? `${ability.cost} mana` : '';
  }
  // The summary followed by what each condition it applies does.
  static full(ability: ArenaAbility, actor?: Record<string, number>): string {
    const t = this.ability(ability, actor);
    return [t.summary, ...t.details].join(' ');
  }
  static effect(e: Effect, actor?: Record<string, number>, again: boolean | string = false): string {
    const to = typeof again === 'string' ? again : again ? 'each of them' : e.target === 'random enemies' && e.count
      ? e.count.kind === 'literal' && e.count.value === 1 ? 'a random enemy'
        : `${this.amount(e.count, actor)} different enemies, drawn at random` : this.targets[e.target];
    const amount = 'amount' in e && e.kind !== 'summon' ? this.amount(e.amount, actor) : '';
    const text = (() => {
      switch (e.kind) {
        case 'attack': return `weapon attack against ${to}${e.spillover ? ', carrying a killing blow on to another' : ''}`;
        case 'damage': return `${amount} ${e.damageType} damage to ${to}`;
        case 'heal': return `heal ${to} for ${amount}`;
        case 'revive': return `raise ${to} with ${e.percent ? `${e.percent}% of their health` : `${amount} health`}`
          + `${e.traits?.length ? `, ${e.traits.map(t => Canon.traits[t]?.name.toLowerCase() ?? t).join(' and ')} now` : ''}`;
        case 'random': return `on ${to}, one of these, drawn at random: ${MechanicsText.inner(e.effects, actor)}`;
        case 'cycle': return `on ${to}, each the next of these in turn: ${MechanicsText.inner(e.effects, actor)}`;
        case 'cast': return `${Canon.abilities[e.ability]?.name ?? e.ability}, at no cost`;
        case 'drain': return `drain ${amount} health from ${to}`;
        case 'defend': return 'guard until your next turn';
        case 'flee': return 'try to escape the fight (an even chance)';
        case 'apply': return `${this.holds(e.target === 'self' ? 'you' : to, e.status)} `
          + `${this.conditionName(e.status)} ${this.duration(e.duration, e.clock).replace(/^(\d)/, 'for $1')
            .replace(/^a /, 'for a ')}`;
        case 'remove': return `end ${e.status ? this.conditionName(e.status)
          : (e.pattern ?? 'what holds them').toLowerCase().split('|').join(', ').replace(/, ([^,]*)$/, ' or $1')} on ${to}`;
        case 'kill': return `slay ${to}`;
        case 'gain': return `give ${to} ${amount} ${e.resource}`;
        case 'learn': return `teach ${to} ${Canon.abilities[e.ability]?.name ?? e.ability}`;
        case 'summon': return MechanicsText.summon(e, actor);
        case 'travel': return 'leave the fight';
      }
    })();
    const qualifiers = [e.when ? 'when its condition holds' : '', e.targetTrait ? `only ${e.targetTrait} creatures` : '',
      e.save ? this.save(e.save, actor) : '', e.onResist ? `${e.onResist === 'half' ? 'halved' : 'none'} if resisted` : '',
      ...this.triggered(e).map(([id, c]) => `may cause ${this.conditionName(id)}: ${this.an(this.quality(c.saveKind ?? 'magic'))} `
        + 'save against 15 avoids it')]
      .filter(Boolean);
    return qualifiers.length ? `${text} (${qualifiers.join('; ')})` : text;
  }
  // Conditions a damage type sets off on whoever it hurts (Orsino's status triggers): fire may set a creature burning.
  static triggered(e: Effect): [string, (typeof Content.statuses)[string]][] {
    const type = e.kind === 'damage' || e.kind === 'drain' ? e.damageType : undefined;
    return type ? Object.entries(Content.statuses)
      .filter(([id, c]) => c.trigger === type && Canon.resolve('conditions', id) === id) : [];
  }
  // What each kind of save holds out against, in words; the categories (fortitude, will) are said by their harms.
  static readonly harms: Record<string, string> = { poison: 'poison', disease: 'disease', death: 'death', stun: 'stunning',
    breath: 'breath', bleed: 'bleeding', magic: 'magic', charm: 'charms', fear: 'fear', sleep: 'sleep',
    insanity: 'madness', paralyze: 'paralysis', reflex: 'what can be dodged' };
  // A save by the quality it rests on, as the character sheet says it: "a Wisdom save against 19 avoids it".
  static save(save: Save, actor?: Record<string, number>): string {
    const outcome = save.success === 'half' ? 'halves it' : 'avoids it';
    const quality = this.quality(save.stat ?? save.kind ?? 'magic');
    return `${this.an(quality)} save against ${this.amount(save.difficulty, actor)} ${outcome}`;
  }
  private static an(word: string): string { return `${/^[aeiouAEIOU]/.test(word) ? 'an' : 'a'} ${word}`; }
  static quality(kind: string): string {
    const q = (Content.rules.saveKinds as Record<string, string>)[kind] ?? kind;
    return /^(strength|dexterity|constitution|intelligence|wisdom|charisma)$/.test(q) ? this.capitalize(q) : q;
  }
  // Someone who is in a condition said as one (charmed, asleep, marked as prey), or who gains it when it is a thing
  // to have (bull's strength, ghost touch).
  private static holds(who: string, status: string): string {
    const many = who === 'you' || /^(random enemies|\S+ different enemies)/.test(who);
    const said = new RegExp(`(${['ed', 'en', 'ing', 'lit', 'proof', 'ous', 'ful', 'less', 'ble', 'ive', 'ant', 'ent', 'ane',
      'ic', 'al', 'asleep', 'awake', 'afraid', 'alight', 'ready', 'prone', 'blind', 'deaf'].join('|')})$`);
    const being = this.conditionName(status).split(/\s+/).some(w => said.test(w));
    return being ? `${who} ${many ? 'are' : 'is'}` : `${who} ${many ? 'gain' : 'gains'}`;
  }
  static duration(n: number, clock?: string): string {
    if (clock === 'until-removed') { return 'until it is undone'; }
    if (clock === 'world-time') { return this.time(n * 10); }
    return n === 1 ? 'a turn' : `${n} turns`;
  }
  private static time(minutes: number): string {
    if (minutes % 60 === 0) { return `${minutes / 60} hour${minutes === 60 ? '' : 's'}`; }
    return minutes > 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes} minutes`;
  }
  static conditionName(id: string): string { return (Canon.conditions[id]?.name ?? id).toLowerCase(); }
  // What a condition does, from its modifiers: "Blessed: +1 to hit, +1 damage."
  static condition(id: string, actor?: Record<string, number>): string | undefined {
    const c = Canon.conditions[id];
    if (!c) { return undefined; }
    // What it binds its holder to, said with what it gives (Preparing to Charge: the next turn is the charge).
    const gives = this.modifiers(c.modifiers ?? {}, actor).join(', ');
    const binds = [c.compel ? `the next turn can only be ${Canon.abilities[c.compel]?.name ?? c.compel}, nothing else` : '',
      c.forceTarget ? 'whoever has it can strike at nobody but whoever gave it' : ''].filter(Boolean).join('; ');
    const said = [gives, binds, ...this.hooks(id, actor)].filter(Boolean).join('; and ');
    // What it does that no figure says (someone takes the blows meant for them), in its own words.
    const own = c.description && c.description !== c.name
      ? c.description.replace(/\.$/, '').replace(/^[A-Z](?=[a-z])/, x => x.toLowerCase()) : '';
    return said ? `${c.name}: ${said}.` : own ? `${c.name}: ${own}.` : undefined;
  }
  // What a condition does at its holder's moments, and in answer to what the other side does.
  static readonly moments: Record<string, string> = { onAttackHit: 'on landing a blow', onAttack: 'on attacking',
    onAttacked: 'when attacked', onMissReceived: 'when a blow misses them', onExpire: 'when it ends',
    onOffensiveCasting: 'on casting against an enemy', onHeal: 'when healed', onCombatStart: 'as a fight begins',
    onEnemyMelee: 'against an enemy who strikes in reach', onEnemyAttack: 'against an enemy who attacks',
    onEnemyCharge: 'against an enemy who charges', onEnemyCasting: 'against an enemy who casts',
    onEnemyOffensiveCasting: 'against an enemy who casts against them' };
  // Who "the enemy" of a moment is: the one struck, the attacker, the enemy that charged.
  static readonly others: Record<string, string> = { onAttackHit: 'the one struck', onAttack: 'the one attacked',
    onAttacked: 'the attacker', onMissReceived: 'the attacker', onOffensiveCasting: 'the enemy' };
  private static hooks(id: string, actor?: Record<string, number>): string[] {
    const c = Canon.conditions[id]!, { reactions, ...own } = c.hooks ?? {};
    return Object.entries({ ...own, ...reactions }).flatMap(([when, effects]) => this.moments[when] && effects?.length
      ? [`${this.moments[when]}, ${effects.map(e => e.kind === 'remove' && !e.status ? 'it ends'
        : this.effect(e, actor, e.target === 'self' ? 'whoever has it' : this.others[when] ?? 'that enemy'))
        .join(', and ')}`] : []);
  }
  static modifiers(m: Modifiers, actor?: Record<string, number>): string[] {
    const signed = MechanicsText.signed, out: string[] = [];
    if (m.toHit) { out.push(`${signed(m.toHit)} to hit`); }
    // Armour class descends: a lower number is harder to hit.
    if (m.ac) { out.push(m.ac < 0 ? `${-m.ac} harder to hit` : `${m.ac} easier to hit`); }
    if (m.bonusDamage) { out.push(`${typeof m.bonusDamage === 'number' ? signed(m.bonusDamage) : `+${m.bonusDamage}`} damage`); }
    if (m.bonusMeleeDamage) { out.push(`+${m.bonusMeleeDamage} melee damage`); }
    if (m.bonusHealing) { out.push(`+${m.bonusHealing} healing`); }
    if (m.damageReduction) { out.push(`takes ${m.damageReduction} less damage per hit`); }
    if (m.evasion) { out.push(`${signed(m.evasion)} evasion`); }
    if (m.initiative) { out.push(`${signed(m.initiative)} initiative`); }
    if (m.allRolls) { out.push(`${signed(m.allRolls)} to every roll`); }
    if (m.saveVersusAll) { out.push(`${signed(m.saveVersusAll)} to every save`); }
    // A save bonus helps against its own harm only, said as the character sheet says it ("Against charms and fear").
    for (const [kind, n] of Object.entries(m.saves ?? {})) {
      out.push(this.harms[kind] ? `${signed(n)} against ${this.harms[kind]}` : `${signed(n)} to ${kind} saves`);
    }
    for (const [a, n] of Object.entries(m.attributes ?? {})) { out.push(`${this.capitalize(a)} ${signed(n)}`); }
    if (m.tempHp) {
      const hp = /^\d+$/.test(String(m.tempHp)) ? String(m.tempHp)
        : this.amount({ kind: 'deem', expression: String(m.tempHp) }, actor);
      out.push(`${hp} more hit points (spent first)`);
    }
    if (m.extraAttacksPerTurn) { out.push(`${m.extraAttacksPerTurn} more ${m.extraAttacksPerTurn === 1 ? 'blow' : 'blows'} a turn`); }
    if (m.criticalRangeIncrease) { out.push(`a telling blow on ${20 - m.criticalRangeIncrease} or more`); }
    if (m.bonusSpellDC) { out.push(`spells ${m.bonusSpellDC} harder to resist`); }
    for (const [type, r] of Object.entries(m.resistances ?? {})) {
      out.push(r >= 1 ? `immune to ${type}` : r > 0 ? `resists ${Math.round(r * 100)}% of ${type}`
        : `takes ${Math.round(-r * 100)}% more ${type}`);
    }
    for (const type of m.immune ?? []) { out.push(`immune to ${type}`); }
    if (m.noActions) { out.push('cannot act'); }
    if (m.noSpellcasting) { out.push('cannot cast spells'); }
    if (m.changeAllegiance) { out.push('fights for the other side'); }
    if (m.randomActions) { out.push('acts at random'); }
    if (m.controlledActions) { out.push('does as whoever gave it bids'); }
    if (m.flee) { out.push('tries only to get away'); }
    for (const p of m.onTurnEnd ?? []) {
      const amount = this.amount(/^\d+$/.test(String(p.amount)) ? { kind: 'literal', value: Number(p.amount) }
        : { kind: 'deem', expression: String(p.amount) }, actor);
      out.push(p.kind === 'damage' ? `takes ${amount} ${p.damageType ? `${p.damageType} ` : ''}damage each turn`
        : `${p.kind} ${amount} each turn`);
    }
    return out;
  }
  // A formula specialized to an actor where possible, with its range: "1d6 + 2 (3–8)".
  // "call 1d4 + 2 (3–6) of: rat, spider, centipede, of level 5, to fight for you until the fight ends".
  static summon(e: Extract<Effect, { kind: 'summon' }>, actor?: Record<string, number>): string {
    const what = e.byAncestry ? 'the beast your people keep company with'
      : e.from && e.from.length > 1 ? `one of: ${MechanicsText.species(e.from).join(', ')}`
        : MechanicsText.species([e.from?.[0] ?? e.creature]).map(n => `${/^[aeiou]/.test(n) ? 'an' : 'a'} ${n}`)[0];
    const many = e.amount && !(e.amount.kind === 'literal' && e.amount.value === 1);
    return `call ${many ? `${this.amount(e.amount!, actor)} creatures, each ${what}` : `${what}`}`
      + `${e.level && e.level > 1 ? `, of level ${e.level}` : ''}, to fight for you until the fight ends`;
  }
  // Effects inside another that chose their target already: "4d6 fire damage to it / 3d12 cold damage to it".
  static inner(effects: Effect[], actor?: Record<string, number>): string {
    return effects.map(x => this.effect(x, actor, x.target === 'self' ? 'yourself' : 'it')).join(' / ');
  }
  static species(ids: string[]): string[] { return ids.map(id => Canon.species[id]?.name.toLowerCase() ?? id); }
  static amount(amount: Amount, actor?: Record<string, number>): string {
    if (amount.kind === 'literal') { return String(amount.value); }
    const result = this.preview.partialEvaluate(amount.expression, actor ?? {});
    if (result.status === 'error' || !result.expression) { return amount.expression; }
    const expression = this.unclamp(result.expression);
    const range = this.interval(expression), text = this.format(expression);
    if (!range) { return text.replaceAll('#', ''); }
    return range.min === range.max ? String(range.min) : `${text} (${range.min}–${range.max})`;
  }
  // max(0, x) only stops a total going negative; show x.
  private static unclamp(e: Expression): Expression {
    if (e.kind === 'operation' && e.operator === 'call:max' && e.args.length === 2
      && e.args[0]!.kind === 'value' && e.args[0]!.value === 0) { return e.args[1]!; }
    return e;
  }
  private static format(e: Expression): string {
    switch (e.kind) {
      case 'value': return String(e.value);
      case 'dice': return `${e.count}d${e.sides}`;
      case 'reference': return e.name;
      case 'operation': {
        const args = e.args.map(a => this.format(a));
        if (e.operator === '+') {
          const [dice, rest] = [args.filter((_, i) => e.args[i]!.kind === 'dice'), args.filter((_, i) => e.args[i]!.kind !== 'dice')];
          return [...dice, ...rest].join(' + ').replace(/\+ -/g, '− ');
        }
        if (['-', '*', '/'].includes(e.operator)) { return args.join(` ${e.operator === '*' ? '×' : e.operator} `); }
        return this.preview.explain(e).text;
      }
      default: return this.preview.explain(e).text;
    }
  }
  private static interval(e: Expression): Interval | undefined {
    if (e.kind === 'value') { return typeof e.value === 'number' ? { min: e.value, max: e.value } : undefined; }
    if (e.kind === 'dice') { return { min: e.count, max: e.count * e.sides }; }
    if (e.kind !== 'operation') { return undefined; }
    const args = e.args.map(a => this.interval(a));
    if (args.some(a => !a) || args.length !== 2) { return undefined; }
    const [a, b] = args as [Interval, Interval];
    if (e.operator === '+') { return { min: a.min + b.min, max: a.max + b.max }; }
    if (e.operator === '-') { return { min: a.min - b.max, max: a.max - b.min }; }
    if (e.operator === '*') {
      const p = [a.min * b.min, a.min * b.max, a.max * b.min, a.max * b.max];
      return { min: Math.min(...p), max: Math.max(...p) };
    }
    if (e.operator === 'call:max') { return { min: Math.max(a.min, b.min), max: Math.max(a.max, b.max) }; }
    return undefined;
  }
  private static signed(n: number): string { return `${n > 0 ? '+' : '−'}${Math.abs(n)}`; }
  private static capitalize(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
}
