import type { Effect, Target } from '../lang/parse';
import type { Ability, Condition, Hooks, ItemKind, Omissions, Trait } from '../canon/schema';
import { ModifierSet, type Modifiers } from '../rules/modifiers';
import type { RegistryEntry } from './orsino-extract';
import { OrsinoEffects, type Vocabulary } from './orsino-effects';

type Raw = Record<string, unknown>;
export interface Blessing {
  modifiers: Modifiers; omits?: Omissions; unsupported?: Omissions; source: { orsino: string };
}
export interface Generated {
  conditions: Record<string, Condition>; abilities: Record<string, Ability>; items: Record<string, ItemKind>;
  traits: Record<string, Trait>; blessings: Record<string, Blessing>;
}
// Orsino effect keys Kyr leaves out on purpose, with the reason. Every other unknown key is unsupported.
const OMITTED: Record<string, string> = {
  displayClass: 'Presentation only.', searchBonus: 'Kyr skill checks are deterministic.',
  examineBonus: 'Kyr skill checks are deterministic.', pickLockBonus: 'Kyr skill checks are deterministic.',
  disarmTrapBonus: 'Kyr skill checks are deterministic.', gatherInformationBonus: 'Kyr skill checks are deterministic.',
};
const NUMERIC = ['toHit', 'ac', 'evasion', 'damageReduction', 'criticalRangeIncrease', 'initiative', 'allRolls',
  'saveVersusAll', 'bonusSpellDC'] as const;
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
      } else if ((key === 'noActions' || key === 'noSpellcasting') && value === true) {
        m[key] = true;
      } else if (key === 'tempHp' && (typeof value === 'number' || typeof value === 'string')) {
        m.tempHp = OrsinoEffects.expression(value);
      } else if (key === 'onTurnEnd' && Array.isArray(value)) {
        const periodic = this.effects.periodic(value as Raw[]);
        if (typeof periodic === 'string') { unsupported[key] = periodic; } else { m.onTurnEnd = periodic; }
      } else if (['onAttack', 'onAttackHit', 'onAttacked', 'onMissReceived'].includes(key) && Array.isArray(value)) {
        const translated = (value as Raw[]).map(e => this.effects.effect(e, 'enemy', `${from}.${key}`));
        const failure = translated.find((t): t is string => typeof t === 'string');
        if (failure) { unsupported[key] = failure; } else { hooks[key as keyof Hooks] = translated.flat() as Effect[]; }
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
    const out: Condition = { name: String(def.name), description: String(def.description ?? def.name),
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
  conditions(): Record<string, Condition> {
    const out = Object.fromEntries(this.family('status').map(e => [e.key, this.condition(e.definition as Raw, e.id)]));
    return { ...out, ...this.inline };
  }
  private target(target: unknown): { target: Target } | { error: string } {
    const t = Array.isArray(target) ? target.map(String) : [];
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
        else { effects.push(...translated); }
      }
    } else { unsupported.target = target.error; }
    for (const id of effects.flatMap(x => x.kind === 'apply' ? [x.status] : [])) {
      const c = this.inline[id] ?? this.family('status').find(s => s.key === id);
      const condition = c && 'modifiers' in c ? c : c ? this.condition((c as RegistryEntry).definition as Raw, c.id) : undefined;
      if (condition?.unsupported) { unsupported[`status:${id}`] = `Applies ${id}, which Kyr cannot execute.`; }
    }
    if (!effects.length && ((d.effects ?? []) as Raw[]).length) { unsupported.effects = 'No effect Kyr can execute.'; }
    const requires = this.requires(d.condition, unsupported);
    const offensive = spell && effects.some(x => x.onResist);
    const domain = d.domain as string | undefined, school = d.school as string | undefined;
    return { name: String(d.name), kind: spell ? 'spell' : 'technique', description: String(d.description ?? d.name),
      effects, ...spell ? { cost: 1, spell: { tradition: e.family === 'arcaneSpell' ? 'arcane' : 'divine', level: d.level as number,
        ...school ? { school } : {}, ...domain ? { domain } : {} } } : {},
      ...!spell && typeof d.level === 'number' ? { level: d.level } : {},
      ...typeof d.cooldown === 'number' ? { recharge: d.cooldown } : {},
      ...offensive ? { resist: { kind: 'magic', difficulty: '15 + #bonusSpellDC' } } : {},
      ...requires ? { requires } : {}, ...Object.keys(unsupported).length ? { unsupported } : {},
      source: { orsino: e.id, fidelity: 'faithful' } };
  }
  private requires(condition: unknown, unsupported: Omissions): Ability['requires'] {
    if (!condition || typeof condition !== 'object') { return undefined; }
    const c = condition as Raw, out: NonNullable<Ability['requires']> = {};
    for (const [key, value] of Object.entries(c)) {
      if (key === 'status') { const id = this.statusId(value, 'condition'); if (id) { out.status = id; } }
      else if (key === 'hasInterceptWeapon' && value === true) { out.interceptWeapon = true; }
      else { unsupported[`condition:${key}`] = 'Kyr does not check this ability condition.'; }
    }
    return Object.keys(out).length ? out : undefined;
  }
  abilities(): Record<string, Ability> {
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
    return out;
  }
  traits(): Record<string, Trait> {
    const category: Record<string, Trait['category']> = { racial: 'lineage', character: 'character', school: 'specialization',
      domain: 'specialization', feat: 'feat', party: 'party', template: 'nature', elemental: 'affinity', divine: 'affinity' };
    const out: Record<string, Trait> = {};
    for (const e of this.family('trait')) {
      const d = e.definition as Raw, statuses = (d.statuses ?? []) as Raw[];
      const parts = statuses.map(s => this.modifiers((s.effect ?? {}) as Raw, e.id));
      const unsupported = Object.assign({}, ...parts.map(p => p.unsupported)) as Omissions;
      const omits = Object.assign({}, ...parts.map(p => p.omits)) as Omissions;
      if (parts.some(p => Object.keys(p.hooks).length || p.compel || p.forceTarget)) {
        unsupported.statuses = 'Trait statuses with hooks or compulsion are not executed.';
      }
      const r = (d.requirements ?? {}) as Raw;
      const tradition = (d.spellbooks as string[] | undefined)?.[0];
      out[e.key] = { name: String(statuses[0]?.name ?? d.name ?? e.key), category: category[String(d.type)] ?? 'feat',
        description: String(statuses[0]?.description ?? d.description ?? ''),
        modifiers: ModifierSet.sum(parts.map(p => p.modifiers)),
        ...Object.keys(r).length ? { requires: { ...r.race ? { ancestry: String(r.race) } : {},
          ...r.classes ? { classes: r.classes as string[] } : {}, ...r.level ? { level: Number(r.level) } : {} } } : {},
        ...tradition ? { spellAccess: { tradition: tradition as 'arcane' | 'divine',
          ...d.school ? { school: String(d.school) } : {}, ...d.domain ? { domain: String(d.domain) } : {} } } : {},
        ...d.abilities ? { grants: { abilities: d.abilities as string[] } } : {},
        ...Object.keys(omits).length ? { omits } : {}, ...Object.keys(unsupported).length ? { unsupported } : {},
        source: { orsino: e.id, fidelity: Object.keys(omits).length ? 'adapted' : 'faithful' } };
    }
    return out;
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
    return { abilities, conditions, items, traits, blessings: this.blessings() };
  }
}
