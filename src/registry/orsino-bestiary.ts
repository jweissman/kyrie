import { Canon } from '../canon/canon';
import { Creation } from '../rules/creation';
import type { Attribute, Omissions, Species } from '../canon/schema';
import type { RegistryEntry } from './orsino-extract';
import { OrsinoMonsters } from './orsino-monsters';
import { OrsinoTranslate } from './orsino-translate';
import type { Bestiary } from './orsino-effects';
import handSpecies from '../../data/catalog/species.json';
import orsinoSpecies from '../../data/catalog/orsino/species.json';

type Raw = Record<string, unknown>;
const SCORES: [string, Attribute][] = [['str', 'strength'], ['dex', 'dexterity'], ['con', 'constitution'],
  ['int', 'intelligence'], ['wis', 'wisdom'], ['cha', 'charisma']];

// Orsino's bestiary as Kyr species: each monster type composed by its class (OrsinoMonsters, at the template's
// neutral choices: the wildtype aspect, any terrain, first level), each elemental by its element, each animal by
// its kind. A species grows with level as Orsino's templates do. What Kyr cannot play is left out and said so; a
// kind a hand-written species already stands for is not generated again.
export class OrsinoBestiary {
  private readonly byId: Map<string, RegistryEntry>;
  constructor(private entries: RegistryEntry[], private hand: Record<string, Species>) {
    this.byId = new Map(entries.map(e => [e.id, e]));
  }
  entry(id: string): RegistryEntry {
    const e = this.byId.get(id);
    if (!e) { throw new Error(`Unknown Orsino entry ${id}`); }
    return e;
  }
  generate(): Record<string, Species> {
    const out: Record<string, Species> = {};
    for (const e of this.entries.filter(x => x.family === 'monsterType').sort((a, b) => a.key.localeCompare(b.key))) {
      const klass = String((e.definition as Raw).monsterTypeClass);
      if (e.key === 'Elemental') {
        for (const el of this.entries.filter(x => x.family === 'elemental')) {
          this.place(out, `${el.key}_elemental`, this.monster(e, klass, el.key));
        }
      } else { this.place(out, OrsinoTranslate.slug(e.key), this.monster(e, klass)); }
    }
    for (const e of this.entries.filter(x => x.family === 'animal')) {
      const id = OrsinoTranslate.slug(e.key);
      this.place(out, out[id] || this.hand[id] ? `${id}_animal` : id, this.animal(e));
    }
    return out;
  }
  // A generated species, unless a hand-written one already stands for its Orsino source or takes its id.
  private place(out: Record<string, Species>, id: string, s: Species | undefined) {
    const claimed = Object.values(this.hand).some(h => h.source.orsino === s?.source.orsino);
    if (s && !claimed && !this.hand[id] && !out[id]) { out[id] = s; }
  }
  monster(type: RegistryEntry, klass: string, element?: string): Species | undefined {
    const d = OrsinoMonsters.compose(id => this.entry(id), { monsterClass: klass, monsterType: type.key,
      aspect: 'wildtype', terrain: 'any', rank: 'minor', level: 1, ...element ? { element } : {} });
    const weapon = this.item('weapon', d.weapon), armor = this.item('armor', d.naturalArmor);
    if (!weapon) { return undefined; }
    const omits: Omissions = {};
    const abilities = this.abilities(d.abilities, omits), traits = this.traits(d.traits, omits);
    if (!armor) { omits[`armor:${d.naturalArmor}`] = `No Kyr armour stands for Orsino's ${d.naturalArmor}.`; }
    omits['field:monsterGold'] = `Orsino's ${d.gold} gold for the kill is not carried.`;
    const name = element ? `${OrsinoBestiary.capital(element)} elemental` : type.key;
    const line = this.entry(`monsterClass:${klass}`).definition as Raw;
    return { name, type: klass, kind: 'monster',
      description: OrsinoBestiary.describe(klass, [weapon, armor].map(i => i ? Canon.items[i]!.name : undefined),
        abilities.map(a => Canon.abilities[a]!.name)),
      statistics: { attributes: OrsinoBestiary.scores(d.scores), weapon, ...armor ? { armor } : {}, primary: 'strength',
        actions: d.attacksPerTurn,
        growth: { hitPoints: { base: (line.monsterStat as Record<string, number>).hp!, perLevel: 3 } } },
      abilities, traits, worth: { base: Number(line.monsterXp), perLevel: 50 }, omits,
      source: { orsino: type.key === 'Elemental' ? `elemental:${element}` : type.id, fidelity: 'adapted',
        notes: `Composed by OrsinoMonsters (${klass} class, ${type.key} type${element ? `, ${element}` : ''}, wildtype aspect, `
          + 'any terrain, level 1); attributes rise by round(level / 8) and hit points by three a level, as the template.' } };
  }
  animal(e: RegistryEntry): Species | undefined {
    const d = e.definition as Raw;
    const weapon = this.item('weapon', String(d.weapon)), armor = this.item('armor', String(d.body));
    if (!weapon) { return undefined; }
    const omits: Omissions = {};
    if (!armor) { omits[`armor:${String(d.body)}`] = `No Kyr armour stands for Orsino's ${String(d.body)}.`; }
    const scores = Object.fromEntries(SCORES.map(([k]) => [k, 3 + (typeof d[k] === 'number' ? d[k] : 0)]));
    return { name: OrsinoBestiary.capital(e.key), type: 'beast', kind: 'animal',
      description: typeof d.description === 'string' ? d.description : `A ${e.key}.`,
      statistics: { attributes: OrsinoBestiary.scores(scores), hitPoints: Math.max(1, Number(d.hp ?? 1)), weapon,
        ...armor ? { armor } : {}, primary: 'strength', growth: {} },
      abilities: ['defend', 'flee'], traits: [], worth: { base: 0, perLevel: 10 }, ...Object.keys(omits).length ? { omits } : {},
      source: { orsino: e.id, fidelity: Object.keys(omits).length ? 'adapted' : 'faithful',
        notes: 'Orsino\'s animal template: every attribute 3 plus the kind\'s, its hit points, natural weapon and hide, '
          + 'defend and flee.' } };
  }
  // The Kyr item that stands for an Orsino weapon or armour.
  item(family: 'weapon' | 'armor', key: string): string | undefined {
    const byOrsino = Object.entries(Canon.items).find(([, i]) => i.source?.orsino === `${family}:${key}`)?.[0];
    return byOrsino ?? (Canon.items[key]?.[family] ? key : undefined);
  }
  abilities(ids: string[], omits: Omissions): string[] {
    const kept: string[] = [];
    for (const raw of ids.filter(a => a !== 'melee' && a !== 'ranged')) {
      const id = Canon.abilities[raw] ? raw : Object.keys(Canon.abilities).find(k => Canon.abilities[k]!.source?.orsino?.endsWith(`:${raw}`));
      if (id && Creation.executable(id)) { kept.push(id); }
      else { omits[`ability:${raw}`] = id ? `${Canon.abilities[id]!.name} cannot be played yet.` : `Kyr has no ${raw}.`; }
    }
    return [...new Set(kept)];
  }
  traits(ids: string[], omits: Omissions): string[] {
    return ids.filter(t => {
      const ok = ['nature', 'affinity', 'character'].includes(Canon.traits[t]?.category ?? '') && !Canon.traits[t]?.unsupported;
      if (!ok) { omits[`trait:${t}`] = Canon.traits[t] ? `${Canon.traits[t]!.name} is not a nature Kyr plays.` : `Kyr has no ${t}.`; }
      return ok;
    });
  }
  // What a summon can call, from the species catalogs as they stand (hand-written first): run the bestiary before the
  // catalog, so the summons see every species.
  static vocabulary(entries: RegistryEntry[]): Bestiary {
    const all: Record<string, Species> = { ...orsinoSpecies.species as unknown as Record<string, Species>,
      ...handSpecies.species as unknown as Record<string, Species> };
    const ids = Object.keys(all).sort();
    const byOrsino = Object.fromEntries(ids.filter(id => all[id]!.source.orsino)
      .map(id => [all[id]!.source.orsino!, id]));
    // What a summoning calls is a creature, of the beasts, the magical kinds or another plane; a fighting object (a
    // bomb, a turret, a barrier, a phylactery) is set where it stands by an ability of its own, and is not called by a
    // summoning of its type (COR-20: regenerated, a summoning of constructs would have called up bombs and turrets).
    const byType: Record<string, string[]> = {};
    for (const id of ids.filter(id => all[id]!.kind === 'monster' && !all[id]!.variantOf
      && !all[id]!.source.orsino?.startsWith('combatEntity:'))) {
      (byType[all[id]!.type ?? 'monster'] ??= []).push(id);
    }
    const companions = Object.fromEntries(entries.filter(e => e.family === 'companion').map(e =>
      [e.key, (e.definition as string[]).map(k => byOrsino[`animal:${k}`]).filter((x): x is string => !!x)]));
    return { byOrsino, byType, companions };
  }
  static scores(s: Record<string, number>): Record<Attribute, number> {
    return Object.fromEntries(SCORES.map(([k, name]) => [name, s[k]!])) as Record<Attribute, number>;
  }
  static capital(s: string): string { return s.charAt(0).toUpperCase() + s.slice(1); }
  // A line said from the definition itself: what it is, what it fights with and what it can do.
  static describe(klass: string, [weapon, armor]: (string | undefined)[], abilities: string[]): string {
    const known = abilities.filter(a => !/^Prepare/.test(a));
    const list = known.length > 1 ? `${known.slice(0, -1).join(', ')} and ${known.at(-1)!}` : known[0];
    return `${OrsinoBestiary.article(klass)} ${klass} of Orsino's bestiary. It fights with ${weapon!.toLowerCase()}`
      + `${armor ? `, armoured in ${armor.toLowerCase()}` : ''}${list ? `, and knows ${list}` : ''}.`;
  }
  static article(word: string): string { return /^[aeiou]/i.test(word) ? 'An' : 'A'; }
}
