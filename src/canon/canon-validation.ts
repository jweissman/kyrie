import animalPaintings from '../../data/paintings/animals.json';
import monsterPaintings from '../../data/paintings/monsters.json';
import plantPaintings from '../../data/paintings/plants.json';
import gemPaintings from '../../data/paintings/gems.json';
import gearPaintings from '../../data/paintings/gear.json';
import valuablePaintings from '../../data/paintings/valuables.json';
import armsPaintings from '../../data/paintings/arms.json';
import armourPaintings from '../../data/paintings/armour.json';
import consumablePaintings from '../../data/paintings/consumables.json';
import geology from '../../data/catalog/geology.json';
import { Canon } from './canon';
import { SrdSpells } from './srd-spells';
import type { Modifiers, Species } from './schema';
import { Amounts } from '../rules/amounts';
import { StatExpressions } from '../rules/stat-expressions';
import { CatalogFields } from './catalog-fields';
import { CanonRuntime } from './canon-runtime';
import { ModifierSet } from '../rules/modifiers';
import { LocalKinds } from './local-catalog';
import { CreatureVariants } from '../creature-variants';
import { PaintingConcepts } from '../paintings/painting-concepts';

// Category and reference checks over the canonical catalogs. A creature species cannot be a class, a natural attack
// cannot be a class technique, a specialization must belong to a real class and open a real school or domain, a
// variant must name a species, and so on. Run when content loads and by `kyrie lint`.
export class CanonValidation {
  static readonly creatureTypes = ['beast', 'humanoid', 'undead', 'construct', 'dragon', 'giant', 'demon', 'elemental',
    'aberration', 'celestial', 'fey', 'spirit'];
  static readonly deviceTypes = ['engine', 'ward', 'barrier', 'charge', 'vessel'];
  // A creature is painted by one of the collection's creature concepts.
  static readonly paintings = new Set([...PaintingConcepts.creatures,
    ...[...animalPaintings.portraits, ...monsterPaintings.portraits, ...plantPaintings.portraits,
      ...gemPaintings.portraits, ...gearPaintings.portraits, ...valuablePaintings.portraits, ...armsPaintings.portraits,
      ...armourPaintings.portraits, ...consumablePaintings.portraits]
      .map(p => p.file.replace(/^paintings\/|\.webp$/g, ''))]);
  // What a plant's grounds may name: a formation (granite), or a soil one makes (loam, sand).
  static readonly grounds = new Set([...Object.keys(geology.formations), ...Object.values(geology.formations)
    .flatMap(f => (f as { soils?: string[] }).soils ?? [])]);
  static readonly schools = ['abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion',
    'necromancy', 'transmutation'];
  static readonly traitCategories = ['lineage', 'nature', 'affinity', 'character', 'feat', 'party', 'specialization',
    'calling'];
  static readonly itemCategories = ['weapon', 'armor', 'tool', 'gear', 'consumable', 'equipment', 'treasure',
    'document'];
  private problems: string[] = [];
  static problems(): string[] {
    const v = new CanonValidation();
    v.identities(); v.ancestries(); v.species(); v.variations(); v.classes(); v.traits(); v.abilities();
    v.conditions(); v.items();
    v.backgrounds(); v.religion(); v.plants(); v.sources(); v.materials();
    return [...Canon.conflicts, ...CatalogFields.problems(), ...SrdSpells.problems(Canon.srdSpells, Canon.abilities),
      ...v.problems];
  }
  // What is not wrong but not yet finished: a plant written ahead of its plate (it is shown without one until the plate
  // is cut). Said by lint, never refused at load (the owner writes plants before their sheet is drawn).
  static warnings(): string[] {
    return Object.entries(Canon.plants).filter(([, o]) => o.portrait && !CanonValidation.paintings.has(o.portrait))
      .map(([id, o]) => `plant ${id}: no plate ${o.portrait} cut yet (data/paintings/plants.json)`);
  }
  static assert() {
    const problems = this.problems();
    if (problems.length) { throw new Error(`Canonical content is inconsistent:\n${problems.join('\n')}`); }
  }
  private fail(where: string, message: string) { this.problems.push(`${where}: ${message}`); }
  private identities() {
    const entityFamilies = { ability: Object.keys(Canon.abilities), item: Object.keys(Canon.items),
      skill: Object.keys(Canon.skills),
      deity: Object.keys(Canon.deities), plant: Object.keys(Canon.plants) };
    this.disjoint(entityFamilies);
    this.disjoint({ ancestry: Object.keys(Canon.ancestries), species: Object.keys(Canon.species),
      class: Object.keys(Canon.classes) });
    this.disjoint({ condition: Object.keys(Canon.conditions), trait: Object.keys(Canon.traits) });
    const families = { abilities: Canon.abilities, conditions: Canon.conditions, traits: Canon.traits,
      items: Canon.items, plants: Canon.plants, species: Canon.species } as const;
    for (const [family, entries] of Object.entries(families)) {
      for (const [alias, target] of Object.entries(Canon.aliases[family as keyof typeof families] ?? {})) {
        if (Object.hasOwn(entries, alias)) { this.fail(`alias ${alias}`, `shadows a canonical ${family} identifier`); }
        // A species' alias may name a kind composed of a base and its variations (fire_elemental is
        // elemental/fire_element).
        const known = family === 'species' ? Canon.isSpecies(target) : Object.hasOwn(entries, target);
        if (!known) { this.fail(`alias ${alias}`, `names unknown ${family} ${target}`); }
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
  // What is granted is played: an ability reference only, or with what it cannot run, is never given to a holder (the
  // SRD adaptation briefing, §14).
  private granted(where: string, ids: string[]) {
    for (const a of ids.filter(a => Canon.abilities[a] && !CanonRuntime.playable(a))) { this.fail(where, `grants ${a}, which cannot be played`); }
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
  // Every body the chassis makes (a creature's, a device's): its record whole, its painting a painting of the
  // collection, its material a material.
  private species() {
    for (const [id, own] of [...Object.entries(Canon.species), ...Object.entries(Canon.devices)]) {
      const where = `${Canon.isDevice(id) ? 'device' : 'species'} ${id}`;
      if (own.portrait && !CanonValidation.paintings.has(own.portrait)) { this.fail(where, `no painting ${own.portrait}`); }
      if (own.material && !Canon.materials[own.material]) { this.fail(where, `unknown material ${own.material}`); }
      if (own.variantOf && !Canon.isSpecies(own.variantOf)) { this.fail(where, `is a variant of unknown species ${own.variantOf}`); continue; }
      let s;
      try { s = Canon.creature(id); } catch (error) { this.fail(where, (error as Error).message); continue; }
      if (!s.statistics) { this.fail(where, 'has no statistics'); continue; }
      const types = Canon.isDevice(id) ? CanonValidation.deviceTypes : CanonValidation.creatureTypes;
      if (!s.type || !types.includes(s.type)) { this.fail(where, `has unknown type ${s.type}`); }
      if (!Canon.items[s.statistics.weapon]?.weapon) { this.fail(where, `natural weapon ${s.statistics.weapon} is not a weapon`); }
      if (s.statistics.armor && !Canon.items[s.statistics.armor]?.armor) { this.fail(where, `natural armour ${s.statistics.armor} is not armour`); }
      this.hitDice(where, s.statistics);
      this.expressions(where, s.statistics);
      this.riders(where, s.statistics.riders);
      (s.abilities ?? []).forEach(a => this.ability(where, a, ['natural', 'technique', 'spell']));
      for (const t of s.traits ?? []) {
        if (!['nature', 'affinity', 'character'].includes(Canon.traits[t]?.category ?? '')) {
          this.fail(where, `${t} is not a nature, affinity or character trait`);
        }
      }
      for (const h of (s.habitats ?? []).filter(h => !Canon.habitats[h])) { this.fail(where, `unknown habitat ${h}`); }
      this.defenses(where, s.defenses);
    }
  }
  // A variation's kinds and types are kinds and types, its weapon a weapon, its material a material, and what it adds
  // abilities and traits there are.
  private variations() {
    for (const [id, v] of Object.entries(CreatureVariants.variations)) {
      const where = `variation ${id}`;
      for (const t of (v.types ?? []).filter(t => !CanonValidation.creatureTypes.includes(t))) {
        this.fail(where, `unknown type ${t}`);
      }
      if (v.weapon && !Canon.items[v.weapon]?.weapon) { this.fail(where, `${v.weapon} is not a weapon`); }
      if (v.material && !Canon.materials[v.material]) { this.fail(where, `unknown material ${v.material}`); }
      for (const a of (v.abilities ?? []).filter(a => !Canon.abilities[a])) { this.fail(where, `unknown ability ${a}`); }
      for (const t of (v.traits ?? []).filter(t => !Canon.traits[t])) { this.fail(where, `unknown trait ${t}`); }
      this.stated(where, v);
    }
  }
  // What a material passes is an attack tag a guard can name (see Defenses).
  private materials() {
    for (const [id, m] of Object.entries(Canon.materials)) {
      if (m.passes && !Canon.rules.combat.defenses.attackTags.includes(m.passes)) {
        this.fail(`material ${id}`, `passes unknown attack tag ${m.passes}`);
      }
    }
  }
  // A variation that is a stat block (see Overlay.hitDice): its Hit Dice dice, its defenses well formed, its routine
  // natural weapons, its hide armour, and what it goes without its base's to go without.
  private stated(where: string, v: (typeof CreatureVariants.variations)[string]) {
    if (v.hitDice !== undefined) { this.hitDice(where, { hitDice: v.hitDice } as NonNullable<Species['statistics']>); }
    this.defenses(where, v.defenses);
    for (const a of (v.attacks ?? []).filter(a => !Canon.items[a]?.weapon?.natural)) { this.fail(where, `${a} is no natural weapon`); }
    if (v.armor && !Canon.items[v.armor]?.armor) { this.fail(where, `hide ${v.armor} is not armour`); }
    for (const a of (v.forgoes?.abilities ?? []).filter(a => !Canon.abilities[a])) { this.fail(where, `forgoes unknown ability ${a}`); }
    for (const t of (v.forgoes?.traits ?? []).filter(t => !Canon.traits[t])) { this.fail(where, `forgoes unknown trait ${t}`); }
    this.riders(where, v.riders);
    this.expressions(where, v);
  }
  // A stat block's expressions (see StatExpressions): its damage by a natural weapon, reading only what a blow binds;
  // its natural armour's bonus, reading only what its making binds, and no dice.
  private expressions(where: string, st: { damage?: Record<string, string>; armorBonus?: string; saves?: object }) {
    const saves = Object.entries(st.saves ?? {});
    if (st.saves && (saves.length !== 3 || saves.some(([k, n]) => !['fortitude', 'reflex', 'will'].includes(k)
      || !Number.isInteger(n)))) { this.fail(where, 'saves are Fortitude, Reflex and Will, each a whole number'); }
    for (const [weapon, text] of Object.entries(st.damage ?? {})) {
      if (!Canon.items[weapon]?.weapon?.natural) { this.fail(where, `damage for ${weapon}, which is no natural weapon`); }
      const refused = StatExpressions.refused(text, StatExpressions.blow);
      if (refused) { this.fail(where, `damage ${refused}`); }
    }
    if (st.armorBonus === undefined) { return; }
    const refused = StatExpressions.refused(st.armorBonus, StatExpressions.making, true);
    if (refused || Amounts.dice(st.armorBonus).length) {
      this.fail(where, `armour bonus ${refused ?? `${st.armorBonus} throws dice`}`);
    }
  }
  // What a blow carries (see Statistics.riders) is carried by a natural weapon, and lands on what it struck.
  private riders(where: string, riders: Record<string, { target: string }[]> | undefined) {
    for (const [weapon, effects] of Object.entries(riders ?? {})) {
      if (!Canon.items[weapon]?.weapon?.natural) { this.fail(where, `rides on ${weapon}, which is no natural weapon`); }
      for (const e of effects.filter(e => e.target !== 'enemy')) { this.fail(where, `a rider on ${weapon} lands on ${e.target}`); }
    }
  }
  // A calling's features come at distinct levels from 2 to 20, in order, with executable techniques and calling traits.
  private features(where: string, features: { level: number; abilities?: string[]; traits?: string[] }[]) {
    features.forEach((f, i) => {
      if (f.level < 2 || f.level > 20 || (i && f.level <= features[i - 1]!.level)) { this.fail(where, `feature at level ${f.level}`); }
      (f.abilities ?? []).forEach(a => this.ability(where, a, ['technique']));
      for (const a of (f.abilities ?? []).filter(a => Canon.abilities[a] && !CanonRuntime.playable(a))) {
        this.fail(where, `${a} cannot be played`);
      }
      for (const t of (f.traits ?? []).filter(t => Canon.traits[t]?.category !== 'calling')) {
        this.fail(where, `${t} is not a calling trait`);
      }
    });
  }
  private classes() {
    for (const [id, c] of Object.entries(Canon.classes)) {
      const where = `class ${id}`;
      c.abilities.forEach(a => this.ability(where, a, ['technique', 'spell']));
      this.features(where, c.features ?? []);
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
      this.granted(where, t.grants?.abilities ?? []);
      this.modifiers(where, t.modifiers);
    }
  }
  private abilities() {
    const spellDomains = new Set(Object.entries(Canon.domains).map(([id, d]) => d.spellDomain ?? id));
    for (const [id, a] of Object.entries(Canon.abilities)) {
      const where = `ability ${id}`;
      if (!['technique', 'spell', 'natural'].includes(a.kind)) { this.fail(where, `unknown kind ${a.kind}`); }
      if ((a.effect === undefined) === (a.effects === undefined)) { this.fail(where, 'needs exactly one of effect and effects'); }
      if (a.recharges && !['rest', 'night', 'day'].includes(a.recharges)) { this.fail(where, `recharges by ${a.recharges}`); }
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
      if (i.grants?.ability) { this.ability(where, i.grants.ability, ['technique', 'spell']); this.granted(where, [i.grants.ability]); }
      // A module's own kind may grant a capability of the module's own, checked as the module was read (GTR-09).
      if (i.grants?.skill && !Canon.skills[i.grants.skill] && !LocalKinds.local(id)) {
        this.fail(where, `grants unknown skill ${i.grants.skill}`);
      }
      for (const s of [...i.tool ?? [], ...i.aids ?? []].filter(s => !Canon.skills[s])) {
        this.fail(where, `is a tool of unknown skill ${s}`);
      }
      // A use Kyr cannot run yet is said (unsupported.use: a wand of wonder's random effect), never left out.
      if (i.category === 'consumable' && !i.use && !i.unsupported?.use) { this.fail(where, 'a consumable needs a use'); }
      if (i.fuel && !Canon.items[i.fuel]?.use) { this.fail(where, `burns ${i.fuel}, which gives no light`); }
      if (i.weapon && !i.unsupported && !Canon.rules.damageTypes.includes(i.weapon.type)) {
        this.fail(where, `unknown damage type ${i.weapon.type}`);
      }
      for (const t of (i.weapon?.tags ?? []).filter(t => !Canon.rules.combat.defenses.attackTags.includes(t))) {
        this.fail(where, `unknown attack tag ${t}`);
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
  // A plant grows in habitats there are, and what is gathered or cut from it is a thing of the catalog.
  private plants() {
    for (const [id, o] of Object.entries(Canon.plants)) {
      const where = `plant ${id}`;
      for (const it of [o.yields, o.cut?.yields].filter((x): x is string => !!x && !Canon.items[x])) {
        this.fail(where, `yields ${it}, which is no item`);
      }
      if (o.stand && (!o.yields || !o.gathered)) { this.fail(where, 'a stand gathers something it yields'); }
      for (const h of o.habitats.filter(h => !Canon.habitats[h])) { this.fail(where, `unknown habitat ${h}`); }
      for (const g of (o.grounds ?? []).filter(g => !CanonValidation.grounds.has(g))) { this.fail(where, `unknown ground ${g}`); }
    }
  }
  private sources() {
    const families = { ability: Canon.abilities, ancestry: Canon.ancestries, species: Canon.species,
      class: Canon.classes,
      trait: Canon.traits, background: Canon.backgrounds, skill: Canon.skills, item: Canon.items, deity: Canon.deities,
      plant: Canon.plants } as Record<string, Record<string, { source?: { orsino?: string; kyr?: true } }>>;
    for (const [family, entries] of Object.entries(families)) {
      for (const [id, e] of Object.entries(entries)) {
        if (!e.source || (!e.source.orsino && !e.source.kyr)) { this.fail(`${family} ${id}`, 'has no source'); }
        // An SRD adaptation says how it was converted and what it keeps and leaves out, never only that it is one.
        const srd = e.source as { srd35?: string; conversion?: string; notes?: string } | undefined;
        if (srd?.srd35 && (!srd.conversion || !srd.notes)) { this.fail(`${family} ${id}`, 'adapts the SRD without a conversion and notes'); }
      }
    }
  }
  // Hit Dice are dice the grammar reads with a mean, and a stat block that has them is not also grown or fixed another
  // way (the SRD adaptation briefing, §1: two conversions of one creature's hit points would disagree).
  private hitDice(where: string, st: NonNullable<Species['statistics']>) {
    if (st.hitDice === undefined) { return; }
    if (!Amounts.valid(st.hitDice) || !Amounts.dice(st.hitDice).length) {
      this.fail(where, `hit dice ${st.hitDice} are not dice`); return;
    }
    try { Amounts.mean(st.hitDice, { level: 1, company: 1 }); } catch (error) {
      this.fail(where, `hit dice ${st.hitDice}: ${(error as Error).message}`);
    }
    if (st.growth?.hitPoints || st.hitPoints !== undefined) { this.fail(where, 'has hit dice and hit points grown or fixed besides'); }
  }
  // A body's typed defenses (the SRD adaptation briefing, §3): each of a known kind, with only that kind's fields, its
  // harm named by damage types (or physical, all), its amounts numbers or dice, and what passes a reduction one of the
  // attack tags or a damage type. A defense nothing would read is refused, never kept inert.
  private defenses(where: string, defenses: Species['defenses']) {
    const fields: Record<string, string[]> = { immunity: ['kind', 'to'], resistance: ['kind', 'to', 'amount', 'mode'],
      reduction: ['kind', 'amount', 'unless', 'to'], regeneration: ['kind', 'amount', 'stoppedBy'] };
    const harms = ['all', ...Canon.rules.damageTypes], tags = [...Canon.rules.combat.defenses.attackTags, ...harms];
    for (const d of defenses ?? []) {
      const said = `${where}: defense ${JSON.stringify(d)}`;
      if (!fields[d.kind]) { this.problems.push(`${said}: unknown kind`); continue; }
      const extra = Object.keys(d).filter(k => !fields[d.kind]!.includes(k));
      if (extra.length) { this.problems.push(`${said}: unknown field ${extra.join(', ')}`); }
      const named = [...'to' in d ? d.to ?? [] : [], ...'stoppedBy' in d ? d.stoppedBy ?? [] : []];
      for (const h of named.filter(h => !harms.includes(h))) { this.problems.push(`${said}: unknown damage type ${h}`); }
      if ((d.kind === 'immunity' || d.kind === 'resistance') && !d.to?.length) { this.problems.push(`${said}: names no harm`); }
      if ('amount' in d && !Amounts.valid(d.amount)) { this.problems.push(`${said}: amount is not a number or dice`); }
      if (d.kind === 'resistance' && !['flat', 'fraction'].includes(d.mode)) { this.problems.push(`${said}: unknown mode`); }
      if (d.kind === 'resistance' && d.mode === 'fraction' && typeof d.amount !== 'number') {
        this.problems.push(`${said}: a fraction is a number`);
      }
      for (const t of (d.kind === 'reduction' ? d.unless ?? [] : []).filter(t => !tags.includes(t))) {
        this.problems.push(`${said}: unknown attack tag ${t}`);
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
