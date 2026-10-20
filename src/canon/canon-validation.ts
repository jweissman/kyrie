import { Canon } from './canon';
import type { Modifiers } from './schema';
import { ModifierSet } from '../rules/modifiers';

// Category and reference checks over the canonical catalogs. A creature species cannot be a class, a natural attack
// cannot be a class technique, a specialization must belong to a real class and open a real school or domain, a
// variant must name a species, and so on. Run when content loads and by `kyrie lint`.
export class CanonValidation {
  static readonly creatureTypes = ['beast', 'humanoid', 'undead', 'construct', 'dragon', 'giant', 'demon', 'elemental',
    'aberration', 'celestial', 'fey', 'spirit'];
  static readonly schools = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion',
    'necromancy', 'transmutation'];
  static readonly traitCategories = ['lineage', 'nature', 'affinity', 'character', 'feat', 'party', 'specialization'];
  static readonly itemCategories = ['weapon', 'armor', 'tool', 'gear', 'consumable', 'equipment', 'treasure'];
  private problems: string[] = [];
  static problems(): string[] {
    const v = new CanonValidation();
    v.identities(); v.ancestries(); v.species(); v.classes(); v.traits(); v.abilities(); v.conditions(); v.items();
    v.backgrounds(); v.religion(); v.organisms(); v.sources();
    return [...Canon.conflicts, ...v.problems];
  }
  static assert() {
    const problems = this.problems();
    if (problems.length) { throw new Error(`Canonical content is inconsistent:\n${problems.join('\n')}`); }
  }
  private fail(where: string, message: string) { this.problems.push(`${where}: ${message}`); }
  private identities() {
    const entityFamilies = { ability: Object.keys(Canon.abilities), item: Object.keys(Canon.items),
      skill: Object.keys(Canon.skills),
      deity: Object.keys(Canon.deities), organism: Object.keys(Canon.organisms) };
    this.disjoint(entityFamilies);
    this.disjoint({ ancestry: Object.keys(Canon.ancestries), species: Object.keys(Canon.species),
      class: Object.keys(Canon.classes) });
    this.disjoint({ condition: Object.keys(Canon.conditions), trait: Object.keys(Canon.traits) });
    const families = { abilities: Canon.abilities, conditions: Canon.conditions, traits: Canon.traits,
      items: Canon.items, organisms: Canon.organisms } as const;
    for (const [family, entries] of Object.entries(families)) {
      for (const [alias, target] of Object.entries(Canon.aliases[family as keyof typeof families] ?? {})) {
        if (Object.hasOwn(entries, alias)) { this.fail(`alias ${alias}`, `shadows a canonical ${family} identifier`); }
        if (!Object.hasOwn(entries, target)) { this.fail(`alias ${alias}`, `names unknown ${family} ${target}`); }
      }
    }
  }
  private disjoint(families: Record<string, string[]>) {
    const seen = new Map<string, string>();
    for (const [family, ids] of Object.entries(families)) {
      for (const id of ids) {
        const other = seen.get(id);
        if (other) { this.fail(id, `is both a ${other} and a ${family}`); } else { seen.set(id, family); }
      }
    }
  }
  private ability(where: string, id: string, allowed: string[]) {
    const a = Canon.abilities[id];
    if (!a) { this.fail(where, `unknown ability ${id}`); return; }
    if (!allowed.includes(a.kind)) { this.fail(where, `${id} is a ${a.kind}, not ${allowed.join(' or ')}`); }
  }
  private ancestries() {
    for (const [id, a] of Object.entries(Canon.ancestries)) {
      const where = `ancestry ${id}`;
      for (const c of a.classes.filter(c => !Canon.classes[c])) { this.fail(where, `takes unknown class ${c}`); }
      for (const t of a.traits.filter(t => !Canon.traits[t])) { this.fail(where, `is born with unknown trait ${t}`); }
      for (const t of (a.forbiddenTraits ?? []).filter(t => !Canon.traits[t])) { this.fail(where, `forbids unknown trait ${t}`); }
      for (const k of Object.keys(a.attributes).filter(k => !Canon.rules.attributes.includes(k))) {
        this.fail(where, `modifies unknown attribute ${k}`);
      }
    }
  }
  private species() {
    for (const [id, own] of Object.entries(Canon.species)) {
      const where = `species ${id}`;
      if (own.variantOf && !Canon.isSpecies(own.variantOf)) { this.fail(where, `is a variant of unknown species ${own.variantOf}`); continue; }
      let s;
      try { s = Canon.creature(id); } catch (error) { this.fail(where, (error as Error).message); continue; }
      if (!s.statistics) { this.fail(where, 'has no statistics'); continue; }
      if (!s.type || !CanonValidation.creatureTypes.includes(s.type)) { this.fail(where, `has unknown creature type ${s.type}`); }
      if (!Canon.items[s.statistics.weapon]?.weapon) { this.fail(where, `natural weapon ${s.statistics.weapon} is not a weapon`); }
      if (s.statistics.armor && !Canon.items[s.statistics.armor]?.armor) { this.fail(where, `natural armour ${s.statistics.armor} is not armour`); }
      (s.abilities ?? []).forEach(a => this.ability(where, a, ['natural', 'technique', 'spell']));
      for (const t of s.traits ?? []) {
        if (!['nature', 'affinity', 'character'].includes(Canon.traits[t]?.category ?? '')) {
          this.fail(where, `${t} is not a nature, affinity or character trait`);
        }
      }
      for (const h of (s.habitats ?? []).filter(h => !Canon.habitats[h])) { this.fail(where, `unknown habitat ${h}`); }
      this.resistances(where, s.resistances);
    }
  }
  private classes() {
    for (const [id, c] of Object.entries(Canon.classes)) {
      const where = `class ${id}`;
      c.abilities.forEach(a => this.ability(where, a, ['technique', 'spell']));
      for (const s of (c.skills ?? []).filter(s => !Canon.skills[s])) { this.fail(where, `grants unknown skill ${s}`); }
      for (const s of c.specializations ?? []) {
        const t = Canon.traits[s];
        if (!['specialization', 'character'].includes(t?.category ?? '')
          || (t?.requires?.classes && !t.requires.classes.includes(id))) {
          this.fail(where, `${s} is not a specialization of this class`);
        }
      }
      for (const w of c.weapons.filter(w => !Canon.items[w]?.weapon)) { this.fail(where, `starts with ${w}, not a weapon`); }
      for (const a of c.armor.filter(a => !Canon.items[a]?.armor)) { this.fail(where, `starts in ${a}, not armour`); }
      if (!Number.isInteger(c.hitDie) || c.hitDie < 1) { this.fail(where, 'needs a hit die'); }
    }
  }
  private traits() {
    const spellDomains = new Set(Object.entries(Canon.domains).map(([id, d]) => d.spellDomain ?? id));
    for (const [id, t] of Object.entries(Canon.traits)) {
      const where = `trait ${id}`;
      if (!CanonValidation.traitCategories.includes(t.category)) { this.fail(where, `unknown category ${t.category}`); }
      for (const c of [t.requires?.class, ...t.requires?.classes ?? []].filter(c => c && !Canon.classes[c])) {
        this.fail(where, `requires unknown class ${c}`);
      }
      // An Orsino trait may require an ancestry Kyr has not catalogued (a gnome's); it simply cannot be taken.
      if (t.requires?.ancestry && !Canon.isAncestry(t.requires.ancestry) && !t.source.orsino) {
        this.fail(where, `requires unknown ancestry ${t.requires.ancestry}`);
      }
      if (t.category === 'specialization') {
        const s = t.spellAccess;
        if (!s) { this.fail(where, 'a specialization must grant spell access'); }
        else if (s.tradition === 'arcane' ? s.school !== 'all' && !CanonValidation.schools.includes(s.school ?? '')
          : !spellDomains.has(s.domain ?? '')) {
          this.fail(where, `opens an unknown ${s.tradition === 'arcane' ? 'school' : 'domain'}`);
        }
      }
      (t.grants?.abilities ?? []).forEach(a => this.ability(where, a, ['technique', 'spell', 'natural']));
      this.modifiers(where, t.modifiers);
    }
  }
  private abilities() {
    const spellDomains = new Set(Object.entries(Canon.domains).map(([id, d]) => d.spellDomain ?? id));
    for (const [id, a] of Object.entries(Canon.abilities)) {
      const where = `ability ${id}`;
      if (!['technique', 'spell', 'natural'].includes(a.kind)) { this.fail(where, `unknown kind ${a.kind}`); }
      if ((a.effect === undefined) === (a.effects === undefined)) { this.fail(where, 'needs exactly one of effect and effects'); }
      if (a.kind === 'spell') {
        const s = a.spell;
        if (!s || !['arcane', 'divine'].includes(s.tradition) || !Number.isInteger(s.level) || s.level < 0 || s.level > 9) {
          this.fail(where, 'a spell needs a tradition and a level from 0 to 9');
        } else if (s.domain && !spellDomains.has(s.domain)) { this.fail(where, `unknown domain ${s.domain}`); }
        else if (s.school && !CanonValidation.schools.includes(s.school)) { this.fail(where, `unknown school ${s.school}`); }
      } else if (a.spell) { this.fail(where, `a ${a.kind} is not a spell`); }
    }
  }
  private conditions() {
    for (const [id, c] of Object.entries(Canon.conditions)) {
      if (!['persistent', 'encounter'].includes(c.lifetime)) { this.fail(`condition ${id}`, `unknown lifetime ${c.lifetime}`); }
      if (c.trigger && !Canon.rules.damageTypes.includes(c.trigger)) { this.fail(`condition ${id}`, `unknown trigger ${c.trigger}`); }
      if (c.compel && !Canon.abilities[c.compel]) { this.fail(`condition ${id}`, `compels unknown ability ${c.compel}`); }
      this.modifiers(`condition ${id}`, c.modifiers);
    }
  }
  private items() {
    for (const [id, i] of Object.entries(Canon.items)) {
      const where = `item ${id}`;
      if (!CanonValidation.itemCategories.includes(i.category)) { this.fail(where, `unknown category ${i.category}`); }
      if (i.grants?.ability) { this.ability(where, i.grants.ability, ['technique', 'spell']); }
      if (i.grants?.skill && !Canon.skills[i.grants.skill]) { this.fail(where, `grants unknown skill ${i.grants.skill}`); }
      if (i.category === 'consumable' && !i.use) { this.fail(where, 'a consumable needs a use'); }
      if (i.weapon && !i.unsupported && !Canon.rules.damageTypes.includes(i.weapon.type)) {
        this.fail(where, `unknown damage type ${i.weapon.type}`);
      }
      if (i.weapon && !/^\d+d\d+([+-]\d+)?$/.test(i.weapon.damage.replace(/\s/g, ''))) { this.fail(where, `damage ${i.weapon.damage} is not a die`); }
      if (i.armor && !Number.isInteger(i.armor.ac)) { this.fail(where, 'armour needs an integer ac'); }
      this.modifiers(where, i.modifiers);
    }
  }
  private backgrounds() {
    for (const [id, b] of Object.entries(Canon.backgrounds)) {
      const where = `background ${id}`;
      if (!['background', 'profession'].includes(b.use)) { this.fail(where, `unknown use ${b.use}`); }
      if (b.requiredClass && !Canon.classes[b.requiredClass]) { this.fail(where, `requires unknown class ${b.requiredClass}`); }
      for (const s of (b.skills ?? []).filter(s => !Canon.skills[s])) { this.fail(where, `grants unknown skill ${s}`); }
      for (const g of (b.gear ?? []).filter(g => !Canon.items[g])) { this.fail(where, `gives unknown item ${g}`); }
    }
  }
  private religion() {
    for (const [id, d] of Object.entries(Canon.deities)) {
      for (const domain of d.domains.filter(x => !Canon.domains[x])) {
        this.fail(`deity ${id}`, `belongs to unknown domain ${domain}`);
      }
    }
    for (const [id, d] of Object.entries(Canon.domains)) { this.modifiers(`domain ${id}`, d.blessing?.modifiers); }
  }
  private organisms() {
    for (const [id, o] of Object.entries(Canon.organisms)) {
      const where = `organism ${id}`;
      if (o.species && !Canon.isSpecies(o.species)) { this.fail(where, `represented by unknown species ${o.species}`); }
      if (o.kind === 'plant' && o.species) { this.fail(where, 'a plant is not a creature species'); }
      if (o.yields && Canon.items[o.yields]?.category !== 'consumable') { this.fail(where, `yields ${o.yields}, not a consumable`); }
      for (const h of o.habitats.filter(h => !Canon.habitats[h])) { this.fail(where, `unknown habitat ${h}`); }
    }
  }
  private sources() {
    const families = { ability: Canon.abilities, ancestry: Canon.ancestries, species: Canon.species,
      class: Canon.classes,
      trait: Canon.traits, background: Canon.backgrounds, skill: Canon.skills, item: Canon.items, deity: Canon.deities,
      organism: Canon.organisms } as Record<string, Record<string, { source?: { orsino?: string; kyr?: true } }>>;
    for (const [family, entries] of Object.entries(families)) {
      for (const [id, e] of Object.entries(entries)) {
        if (!e.source || (!e.source.orsino && !e.source.kyr)) { this.fail(`${family} ${id}`, 'has no source'); }
      }
    }
  }
  private resistances(where: string, r: Record<string, number> | undefined) {
    for (const [type, amount] of Object.entries(r ?? {})) {
      if ((type !== 'all' && !Canon.rules.damageTypes.includes(type)) || !Number.isFinite(amount)) {
        this.fail(where, `invalid resistance ${type}`);
      }
    }
  }
  private modifiers(where: string, m: Modifiers | undefined) {
    if (!m) { return; }
    try {
      ModifierSet.validate(m, where, { saveKinds: Object.keys(Canon.rules.saveKinds),
        damageTypes: Canon.rules.damageTypes });
    } catch (error) { this.problems.push((error as Error).message); }
  }
}
