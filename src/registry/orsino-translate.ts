import type { Amount, Effect, Target } from '../lang/parse';
import type { Ability, Bonuses, Condition, HookKey, Hooks, ItemKind, Omissions, Perk, Trait, Triggers } from '../canon/schema';
import { ModifierSet, type Modifiers } from '../rules/modifiers';
import type { RegistryEntry } from './orsino-extract';
import { OrsinoGoods } from './orsino-goods';
import { OrsinoEffects, type Vocabulary } from './orsino-effects';

type Raw = Record<string, unknown>;
export interface Blessing {
  modifiers: Modifiers; omits?: Omissions; unsupported?: Omissions; source: { orsino: string };
}
export interface Generated {
  conditions: Record<string, Condition>; abilities: Record<string, Ability>; items: Record<string, ItemKind>;
  traits: Record<string, Trait>; blessings: Record<string, Blessing>; backgrounds: Record<string, OrsinoBackground>;
}
// A row of Orsino's backgroundModifier: what a background adds to the scores, the gold it starts with, the class it
// is for, and the gear it carries (Orsino's item ids). What it means in a Kyr world is composed in data/catalog.
export interface OrsinoBackground {
  attributes: Record<string, number>; gold: number; requiredClass?: string; gear?: string[]; source: { orsino: string };
}
// Orsino effect keys Kyr leaves out on purpose, with the reason. Every other unknown key is unsupported.
const OMITTED: Record<string, string> = {
  displayClass: 'Presentation only.', searchBonus: 'Kyr skill checks are deterministic.',
  examineBonus: 'Kyr skill checks are deterministic.', pickLockBonus: 'Kyr skill checks are deterministic.',
  disarmTrapBonus: 'Kyr skill checks are deterministic.', gatherInformationBonus: 'Kyr skill checks are deterministic.',
};
const NUMERIC = ['toHit', 'ac', 'evasion', 'damageReduction', 'criticalRangeIncrease', 'initiative', 'allRolls',
  'saveVersusAll', 'bonusSpellDC', 'extraAttacksPerTurn'] as const;
const HOOKS = ['onAttack', 'onAttackHit', 'onAttacked', 'onMissReceived', 'onCombatStart', 'onExpire', 'onOffensiveCasting',
  'onHeal'];
const FLAGS = ['noActions', 'noSpellcasting', 'randomActions', 'changeAllegiance', 'controlledActions', 'flee'] as const;
const DICE = ['bonusDamage', 'bonusMeleeDamage', 'bonusHealing'] as const;
const ATTRIBUTES: Record<string, string> = { str: 'strength', dex: 'dexterity', con: 'constitution',
  int: 'intelligence', wis: 'wisdom', cha: 'charisma' };

// Translates the Orsino registry snapshot into Kyr catalog entries. Nothing is simplified silently: a key Kyr does not
// execute is recorded under `unsupported` (the entry is then represented but not executable) or under `omits` with a
// reason (the entry stays executable).
export class OrsinoTranslate {
  private effects: OrsinoEffects;
  private inline: Record<string, Condition> = {};
  constructor(private entries: RegistryEntry[], private vocabulary: Vocabulary) {
    this.effects = new OrsinoEffects(vocabulary, (status, from) => this.statusId(status, from),
      id => this.inline[id]?.saveKind ?? (this.family('status').find(s => s.key === id)?.definition as Raw | undefined)?.saveKind as string);
  }
  static slug(name: string): string { return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); }
  // Names said as a player would say them, where Orsino's are a programmer's or read backwards; Orsino's own stay in
  // the registry, and ids are still made from them (Mission 16's sheet read "Sets Spear", "Vigor Up", and an enemy
  // "hunting prey" when it was the prey).
  static readonly plainly: Record<string, string> = { 'Sets Spear': 'Set Spear', 'Vigor Up': 'Steel Yourself',
    'Hunting Prey': 'Marked as Prey' };
  static said(name: unknown): string { return OrsinoTranslate.plainly[String(name)] ?? String(name); }
  private family(...families: string[]) { return this.entries.filter(e => families.includes(e.family)); }
  // A status reference is a key, a display name, or an inline definition (which becomes its own condition).
  statusId(status: unknown, from: string): string | undefined {
    if (typeof status === 'object' && status) {
      const s = status as Raw, id = OrsinoTranslate.slug(String(s.name));
      this.inline[id] ??= this.condition(s, from, true);
      return id;
    }
    const name = String(status).toLowerCase();
    const found = this.family('status').find(e => e.key === name || String((e.definition as Raw).name).toLowerCase() === name);
    if (found) { return found.key; }
    return Object.keys(this.inline).find(id => id === OrsinoTranslate.slug(name));
  }
  modifiers(effect: Raw, from: string): { modifiers: Modifiers; hooks: Hooks; unsupported: Omissions; omits: Omissions;
    compel?: string; forceTarget?: true } {
    const m: Modifiers = {}, hooks: Hooks = {}, unsupported: Omissions = {}, omits: Omissions = {};
    let compel: string | undefined, forceTarget: true | undefined;
    for (const [key, value] of Object.entries(effect)) {
      const suffix = key.replace(/^(saveVersus|immune|resist)/, '');
      const kind = suffix.charAt(0).toLowerCase() + suffix.slice(1);
      if ((NUMERIC as readonly string[]).includes(key) && typeof value === 'number') {
        m[key as typeof NUMERIC[number]] = value;
      } else if ((DICE as readonly string[]).includes(key) && (typeof value === 'number' || typeof value === 'string')) {
        m[key as typeof DICE[number]] = typeof value === 'number' ? value : OrsinoEffects.expression(value);
      } else if (key in ATTRIBUTES && typeof value === 'number') {
        (m.attributes ??= {})[ATTRIBUTES[key] as keyof NonNullable<Modifiers['attributes']>] = value;
      } else if (key.startsWith('saveVersus') && this.vocabulary.saveKinds.includes(kind) && typeof value === 'number') {
        (m.saves ??= {})[kind] = value;
      } else if (key.startsWith('immune') && this.vocabulary.saveKinds.includes(kind) && value === true) {
        (m.immune ??= []).push(kind);
      } else if (key.startsWith('resist') && (kind === 'all' || this.vocabulary.damageTypes.includes(kind))
        && typeof value === 'number') {
        (m.resistances ??= {})[kind] = value;
      } else if ((FLAGS as readonly string[]).includes(key) && value === true) {
        m[key as typeof FLAGS[number]] = true;
      } else if (key === 'tempHp' && (typeof value === 'number' || typeof value === 'string')) {
        m.tempHp = OrsinoEffects.expression(value);
      } else if (key === 'onTurnEnd' && Array.isArray(value)) {
        const periodic = this.effects.periodic(value as Raw[]);
        if (typeof periodic === 'string') { unsupported[key] = periodic; } else { m.onTurnEnd = periodic; }
      } else if (HOOKS.includes(key) && Array.isArray(value)) {
        const translated = (value as Raw[]).map(e => this.effects.effect(e, 'enemy', `${from}.${key}`));
        const failure = translated.find((t): t is string => typeof t === 'string');
        if (failure) { unsupported[key] = failure; } else { hooks[key as HookKey] = translated.flat() as Effect[]; }
      } else if (/^onEnemy[A-Z]/.test(key) && Array.isArray(value)) {
        const translated = (value as Raw[]).map(e => this.effects.effect(e, 'enemy', `${from}.${key}`));
        const failure = this.reaction(key) ?? translated.find((t): t is string => typeof t === 'string');
        if (failure) { unsupported[key] = failure; }
        else { (hooks.reactions ??= {})[key] = translated.flat() as Effect[]; }
      } else if (key === 'compelNextMove' && typeof value === 'string') { compel = value; }
      else if (key === 'forceTarget' && value === 'you') { forceTarget = true; }
      else if (OMITTED[key]) { omits[key] = OMITTED[key]; }
      else { unsupported[key] = 'Kyr does not execute this Orsino effect yet.'; }
    }
    return { modifiers: m, hooks, unsupported, omits, ...compel ? { compel } : {},
      ...forceTarget ? { forceTarget } : {} };
  }
  condition(def: Raw, from: string, inline = false): Condition {
    const t = this.modifiers((def.effect ?? {}) as Raw, from);
    if (def.consumeOn !== undefined) { t.omits.consumeOn = 'Orsino declares consumeOn but never executes it; the status lasts its duration.'; }
    const trigger = (def.trigger as Raw | undefined)?.damage;
    const out: Condition = { name: OrsinoTranslate.said(def.name), description: String(def.description ?? def.name),
      lifetime: 'encounter', modifiers: t.modifiers,
      ...Object.keys(t.hooks).length ? { hooks: t.hooks } : {},
      ...typeof trigger === 'string' && this.vocabulary.damageTypes.includes(trigger) ? { trigger } : {},
      ...typeof def.duration === 'number' ? { duration: def.duration } : {},
      ...typeof def.saveKind === 'string' ? { saveKind: def.saveKind } : {},
      ...t.compel ? { compel: t.compel } : {}, ...t.forceTarget ? { forceTarget: true } : {},
      ...Object.keys(t.omits).length ? { omits: t.omits } : {},
      ...Object.keys(t.unsupported).length ? { unsupported: t.unsupported } : {},
      source: { orsino: from, fidelity: Object.keys(t.omits).length || inline ? 'adapted' : 'faithful',
        ...inline ? { notes: 'Defined inline by an Orsino ability; Kyr names it after its display name.' } : {} } };
    return out;
  }
  // A reaction Kyr can provoke: to an Orsino ability by name, an effect by type, or a casting; not to entering.
  reaction(key: string): string | undefined {
    const what = key.replace(/^onEnemy/, '');
    // Melee and Ranged are every combatant's weapon attacks (Orsino's pcTurn), named as abilities.
    if (['Casting', 'OffensiveCasting', 'Melee', 'Ranged'].includes(what)) { return undefined; }
    const types = ['Attack', 'Damage', 'Heal', 'Drain', 'Summon', 'Kill', 'Cast', 'Resurrect', 'RemoveStatus', 'Buff', 'Debuff'];
    const named = this.family('ability', 'arcaneSpell', 'divineSpell')
      .some(e => String((e.definition as Raw).name).replace(/\s+/g, '').toLowerCase() === what.toLowerCase());
    return types.includes(what) || named ? undefined : `Kyr cannot tell when an enemy does "${what}".`;
  }
  conditions(): Record<string, Condition> {
    const out = Object.fromEntries(this.family('status').map(e => [e.key, this.condition(e.definition as Raw, e.id)]));
    return { ...out, ...this.inline };
  }
  private target(target: unknown): { target: Target; count?: Amount } | { error: string } {
    const t = Array.isArray(target) ? target.map(String) : [];
    if (t[0] === 'randomEnemies' && t.length <= 2) {
      const raw = t[1] ?? '1', text = OrsinoEffects.expression(raw);
      return { target: 'random enemies', count: /^\d+$/.test(text) ? { kind: 'literal', value: Number(text) } : { kind: 'deem', expression: text } };
    }
    const map: Record<string, Target> = { enemy: 'enemy', enemies: 'enemies', self: 'self', ally: 'ally',
      'self,ally': 'ally', allies: 'allies', party: 'party', deadAlly: 'dead ally' };
    const found = map[t.join(',')];
    return found ? { target: found } : { error: `Target ${t.join(', ')} is not a Kyr target.` };
  }
  ability(e: RegistryEntry): Ability {
    const d = e.definition as Raw, unsupported: Omissions = {};
    const spell = d.type === 'spell' && typeof d.level === 'number';
    const target = this.target(d.target);
    const effects: Effect[] = [];
    if ('target' in target) {
      for (const raw of (d.effects ?? []) as Raw[]) {
        const translated = this.effects.effect(raw, target.target, e.id);
        if (typeof translated === 'string') { unsupported[`effect:${String(raw.type)}`] = translated; }
        else { effects.push(...translated.map(x => x.target === 'random enemies' ? { ...x, count: target.count! } : x)); }
      }
    } else { unsupported.target = target.error; }
    const counted = 'count' in target && target.count?.kind === 'deem' ? OrsinoTranslate.counted(d.target) : undefined;
    for (const id of effects.flatMap(x => x.kind === 'apply' ? [x.status] : [])) {
      const c = this.inline[id] ?? this.family('status').find(s => s.key === id);
      const condition = c && 'modifiers' in c ? c : c ? this.condition((c as RegistryEntry).definition as Raw, c.id) : undefined;
      if (condition?.unsupported) { unsupported[`status:${id}`] = `Applies ${id}, which Kyr cannot execute.`; }
    }
    if (!effects.length && ((d.effects ?? []) as Raw[]).length) { unsupported.effects = 'No effect Kyr can execute.'; }
    const requires = this.requires(d.condition, unsupported);
    const offensive = spell && effects.some(x => x.onResist);
    const domain = d.domain as string | undefined, school = d.school as string | undefined;
    return { name: OrsinoTranslate.said(d.name), kind: spell ? 'spell' : 'technique', description: String(d.description ?? d.name),
      effects, ...spell ? { cost: 1, spell: { tradition: e.family === 'arcaneSpell' ? 'arcane' : 'divine', level: d.level as number,
        ...school ? { school } : {}, ...domain ? { domain } : {} } } : {},
      ...!spell && typeof d.level === 'number' ? { level: d.level } : {},
      ...typeof d.cooldown === 'number' ? { recharge: d.cooldown } : {},
      ...offensive ? { resist: { kind: 'magic', difficulty: '15 + #bonusSpellDC' } } : {},
      ...requires ? { requires } : {}, ...Object.keys(unsupported).length ? { unsupported } : {},
      source: { orsino: e.id, fidelity: counted ? 'adapted' : 'faithful', ...counted ? { notes: counted } : {} } };
  }
  // Orsino reads a random target count with parseInt: "2 + round(#level/2)" is 2, and a count written as an
  // expression ("=1d6 + floor(#level / 2)") is no number, so the spell touches no one. Kyr evaluates the count.
  static counted(target: unknown): string {
    const raw = String((target as unknown[])[1]), read = parseInt(raw, 10);
    return `Orsino reads the count "${raw}" with parseInt, ${Number.isNaN(read) ? 'finds no number and touches no one'
      : `and always draws ${read}`}; Kyr evaluates it as written.`;
  }
  private requires(condition: unknown, unsupported: Omissions): Ability['requires'] {
    if (!condition || typeof condition !== 'object') { return undefined; }
    const c = condition as Raw, out: NonNullable<Ability['requires']> = {};
    for (const [key, value] of Object.entries(c)) {
      const id = key === 'status' || key === 'notStatus' ? this.statusId(value, 'condition') : undefined;
      if ((key === 'status' || key === 'notStatus') && id) { out[key] = id; }
      else if (key === 'status' || key === 'notStatus') {
        unsupported[`condition:${key}`] = `Names ${String(value)}, which Kyr has no condition for.`;
      }
      else if (key === 'hasInterceptWeapon' && value === true) { out.interceptWeapon = true; }
      else { unsupported[`condition:${key}`] = 'Kyr does not check this ability condition.'; }
    }
    return Object.keys(out).length ? out : undefined;
  }
  // Every status an ability defines inline (Prepare Charge's "Preparing to Charge") is registered before any ability is
  // translated, so an ability that requires or removes one (Charge) finds it whatever order they come in.
  private prescan() {
    for (const e of this.family('ability', 'arcaneSpell', 'divineSpell').filter(x => !x.shadowedBy)) {
      for (const raw of ((e.definition as Raw).effects ?? []) as Raw[]) {
        if ((raw.type === 'buff' || raw.type === 'debuff') && raw.status && typeof raw.status === 'object') {
          this.statusId(raw.status, e.id);
        }
      }
    }
  }
  abilities(): Record<string, Ability> {
    this.prescan();
    return Object.fromEntries(this.family('ability', 'arcaneSpell', 'divineSpell').filter(e => !e.shadowedBy)
      .map(e => [e.key, this.ability(e)]));
  }
  items(): Record<string, ItemKind> {
    const out: Record<string, ItemKind> = {};
    for (const e of this.family('weapon')) {
      const d = e.definition as Raw;
      out[e.key] = { name: String(d.name ?? e.key.replace(/_/g, ' ')), category: 'weapon',
        description: String(d.description ?? `A ${e.key.replace(/_/g, ' ')}.`), ...d.natural ? {} : { slot: 'weapon' },
        ...typeof d.value === 'number' ? { value: d.value } : {},
        weapon: { damage: String(d.damage), type: String(d.type ?? 'true'), ...d.kind ? { kind: String(d.kind) } : {},
          ...d.weight ? { weight: String(d.weight) } : {}, ...d.missile ? { missile: true } : {},
          ...d.intercept ? { intercept: true } : {}, ...d.natural ? { natural: true } : {} },
        source: { orsino: e.id, fidelity: 'faithful' } };
    }
    for (const e of this.family('armor')) {
      const d = e.definition as Raw;
      out[e.key] = { name: String(d.name), category: 'armor', description: String(d.description), slot: 'body',
        ...typeof d.value === 'number' ? { value: d.value } : {},
        armor: { ac: Number(d.ac), weight: String(d.weight), type: String(d.type) },
        source: { orsino: e.id, fidelity: 'faithful' } };
    }
    return { ...out, ...new OrsinoGoods(this.entries, { modifiers: this.modifiers.bind(this),
      effect: this.itemEffect.bind(this), status: this.statusId.bind(this), weapons: out }).items() };
  }
  // What using an item does to the one it is used on.
  private itemEffect(raw: Raw, from: string) { return this.effects.effect(raw, 'ally', from); }
  // One trait status as a perk: the keys Kyr executes as triggers or bonuses, then the rest as modifiers, and where or
  // with what it holds.
  private perk(status: Raw, from: string): { perk: Perk; omits: Omissions; unsupported: Omissions; hooked: boolean } {
    const effect = { ...(status.effect ?? {}) as Raw }, triggers: Triggers = {}, bonuses: Bonuses = {};
    const unsupported: Omissions = {};
    for (const [key, value] of Object.entries(effect)) {
      const handled = Array.isArray(value) ? this.trigger(key, value as Raw[], triggers)
        : typeof value === 'number' ? this.bonus(key, value, bonuses) : undefined;
      if (handled === undefined) { continue; }
      if (!handled) { unsupported[key] = `Kyr does not execute this ${key} effect.`; }
      delete effect[key];
    }
    const t = this.modifiers(effect, from), weapon = ((status.condition ?? {}) as Raw).weapon as Raw | undefined;
    const perk: Perk = { name: String(status.name), description: String(status.description ?? status.name),
      modifiers: t.modifiers, ...Object.keys(triggers).length ? { triggers } : {},
      ...Object.keys(bonuses).length ? { bonuses } : {},
      ...typeof status.whileEnvironment === 'string' ? { environment: status.whileEnvironment } : {},
      ...weapon ? { weapon: { ...weapon.type ? { type: String(weapon.type) } : {},
        ...weapon.weight ? { weight: String(weapon.weight) } : {} } } : {} };
    return { perk, omits: t.omits, unsupported: { ...t.unsupported, ...unsupported },
      hooked: !!(Object.keys(t.hooks).length || t.compel || t.forceTarget) };
  }
  // A list of trigger effects: true if Kyr executes every one, false if not, undefined if the key is no trigger.
  private trigger(key: string, list: Raw[], triggers: Triggers): boolean | undefined {
    switch (key) {
      case 'onKill': return list.every(raw => this.onKill(raw, triggers));
      case 'onLevelUp': return list.every(raw => this.onLevelUp(raw, triggers));
      case 'onOffensiveCasting': return list.every(raw => this.onCasting(raw, triggers));
      default: return undefined;
    }
  }
  private bonus(key: string, value: number, bonuses: Bonuses): true | undefined {
    switch (key) {
      case 'spellDurationBonus': bonuses.spellDuration = value; return true;
      case 'goldMultiplier': bonuses.goldMultiplier = value; return true;
      case 'lootBonus': bonuses.loot = value; return true;
      case 'searchBonus': bonuses.search = value; return true;
      case 'backstabMultiplier': bonuses.abilityDamage = { ...bonuses.abilityDamage, backstab: value }; return true;
      default: return undefined;
    }
  }
  private onKill(raw: Raw, triggers: Triggers): boolean {
    const list = triggers.onKill ??= [];
    if (raw.type === 'gold') { list.push({ gold: OrsinoEffects.expression(raw.amount) }); return true; }
    if (raw.type === 'xp') { list.push({ experience: OrsinoEffects.expression(raw.amount) }); return true; }
    const status = raw.type === 'buff' ? this.statusId(raw.status, 'onKill') : undefined;
    if (status) { list.push({ status }); return true; }
    return false;
  }
  private onLevelUp(raw: Raw, triggers: Triggers): boolean {
    if (raw.type !== 'upgrade' || raw.stat !== 'maxHp') { return false; }
    (triggers.onLevelUp ??= []).push({ maxHp: Number(raw.amount) });
    return true;
  }
  private onCasting(raw: Raw, triggers: Triggers): boolean {
    const type = String(raw.damageType ?? raw.kind ?? 'true');
    if (raw.type !== 'damage' || !this.vocabulary.damageTypes.includes(type)) { return false; }
    (triggers.onOffensiveCasting ??= []).push({ amount: OrsinoEffects.expression(raw.amount), damageType: type });
    return true;
  }
  traits(): Record<string, Trait> {
    const category: Record<string, Trait['category']> = { racial: 'lineage', character: 'character', school: 'specialization',
      domain: 'specialization', feat: 'feat', party: 'party', template: 'nature', elemental: 'affinity', divine: 'affinity' };
    const out: Record<string, Trait> = {};
    for (const e of this.family('trait')) {
      const d = e.definition as Raw, statuses = (d.statuses ?? []) as Raw[], party = d.type === 'party';
      const parts = statuses.map(s => this.perk(s, e.id));
      const unsupported = Object.assign({}, ...parts.map(p => p.unsupported)) as Omissions;
      const omits = Object.assign({}, ...parts.map(p => p.omits)) as Omissions;
      if (parts.some(p => p.hooked)) { unsupported.statuses = 'Trait statuses with hooks or compulsion are not executed.'; }
      const perks = parts.map(p => p.perk), always = perks.filter(p => !p.environment && !p.weapon);
      const listed = party || perks.some(p => p.environment || p.weapon || p.triggers || p.bonuses);
      const tradition = (d.spellbooks as string[] | undefined)?.[0];
      out[e.key] = { name: party ? String(d.description) : String(statuses[0]?.name ?? d.name ?? e.key),
        category: category[String(d.type)] ?? 'feat',
        description: party ? perks.map(p => `${p.name}: ${p.description}`).join(' ')
          : String(statuses[0]?.description ?? d.description ?? ''),
        modifiers: ModifierSet.sum(always.map(p => p.modifiers)), ...listed ? { perks } : {},
        ...this.traitRequires((d.requirements ?? {}) as Raw),
        ...tradition ? { spellAccess: { tradition: tradition as 'arcane' | 'divine',
          ...d.school ? { school: String(d.school) } : {}, ...d.domain ? { domain: String(d.domain) } : {} } } : {},
        ...d.abilities ? { grants: { abilities: d.abilities as string[] } } : {},
        ...Array.isArray(d.incompatibleWith) ? { excludes: (d.incompatibleWith as string[]).map(String) } : {},
        ...Object.keys(omits).length ? { omits } : {}, ...Object.keys(unsupported).length ? { unsupported } : {},
        source: { orsino: e.id,
          fidelity: Object.keys(omits).length || perks.some(p => p.environment || p.bonuses?.search) ? 'adapted' : 'faithful' } };
    }
    return out;
  }
  // A trait's requirements: a character's ancestry, classes and level, or a party's formation of classes or ancestries.
  private traitRequires(r: Raw): Pick<Trait, 'requires'> {
    const requires: NonNullable<Trait['requires']> = { ...r.race ? { ancestry: String(r.race) } : {},
      ...r.class ? { class: String(r.class) } : {},
      ...r.classes ? { classes: r.classes as string[] } : {}, ...r.level ? { level: Number(r.level) } : {},
      ...r.formation ? { company: { classes: (r.formation as string[]).map(String) } } : {},
      ...r.races ? { company: { ancestries: (r.races as string[]).map(String) } } : {} };
    return Object.keys(requires).length ? { requires } : {};
  }
  // A domain's shrine blessing (Orsino's deityBlessings table), keyed by domain.
  blessings(): Record<string, Blessing> {
    return Object.fromEntries(this.family('deity').flatMap(e => {
      const b = (e.definition as Raw).deityBlessings as Raw | undefined;
      if (!b) { return []; }
      const t = this.modifiers(b, e.id);
      return [[e.key, { modifiers: t.modifiers, ...Object.keys(t.omits).length ? { omits: t.omits } : {},
        ...Object.keys(t.unsupported).length || t.compel || t.forceTarget || Object.keys(t.hooks).length
          ? { unsupported: { ...t.unsupported } } : {}, source: { orsino: e.id } }]];
    }));
  }
  backgrounds(): Record<string, OrsinoBackground> {
    const scores: Record<string, string> = { str: 'strength', dex: 'dexterity', con: 'constitution', int: 'intelligence',
      wis: 'wisdom', cha: 'charisma' };
    return Object.fromEntries(this.family('background').map(e => {
      const row = e.definition as Raw;
      const attributes = Object.fromEntries(Object.entries(row).filter(([k, v]) => scores[k] && typeof v === 'number')
        .map(([k, v]) => [scores[k]!, v as number]));
      return [e.key, { attributes, gold: Number(row.gp ?? 0),
        ...typeof row.requiredClass === 'string' ? { requiredClass: row.requiredClass } : {},
        ...Array.isArray(row.startingGear) ? { gear: row.startingGear as string[] } : {}, source: { orsino: e.id } }];
    }));
  }
  // Abilities and item kinds share one canonical entity namespace in Kyr modules, and conditions and traits must stay
  // distinguishable; an Orsino item or trait whose key is taken (hide, cursed) takes a suffix and keeps its source.
  generate(): Generated {
    const abilities = this.abilities();
    const items = Object.fromEntries(Object.entries(this.items()).map(([id, item]) =>
      [abilities[id] ? `${id}_${item.category}` : id, item]));
    const conditions = this.conditions();
    const traits = Object.fromEntries(Object.entries(this.traits()).map(([id, trait]) =>
      [conditions[id] ? `${id}_trait` : id, trait]));
    for (const item of Object.values(items)) {
      if (item.weapon && !this.vocabulary.damageTypes.includes(item.weapon.type)) {
        item.unsupported = { type: `Damage kind ${item.weapon.type} is not an Orsino damage kind.` };
      }
    }
    OrsinoTranslate.casts(abilities);
    return { abilities, conditions, items, traits, blessings: this.blessings(), backgrounds: this.backgrounds() };
  }
  static named(effects: Effect[]): string[] {
    return effects.flatMap(e => e.kind === 'cast' ? [e.ability]
      : e.kind === 'random' || e.kind === 'cycle' ? OrsinoTranslate.named(e.effects) : []);
  }
  // An ability that casts another plays only if the other does.
  static casts(abilities: Record<string, Ability>) {
    for (const a of Object.values(abilities)) {
      const missing = OrsinoTranslate.named(a.effects ?? []).filter(id => !abilities[id] || abilities[id]!.unsupported);
      for (const id of missing) {
        const name = abilities[id]?.name;
        (a.unsupported ??= {})[`cast:${id}`] = name ? `Casts ${name}, which Kyr cannot execute.`
          : `Casts ${id}, which Kyr does not have.`;
      }
    }
  }
}
