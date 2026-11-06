import { Canon } from '../canon/canon';
import { Advancement } from '../rules/advancement';
import { HandbookStatus, type Book, type Entry, type Problem, type Section } from './model';
import { HandbookText } from './text';
import { CompanyChapters } from './phb-company';
import type { OrsinoAppendix } from './orsino-appendix';
import { MonsterDescribers } from './mm-describers';
import { CreatureVariants } from '../creature-variants';
import { CreaturePortraits } from '../paintings/creature-portraits';


// The Monster Manual: every creature Kyr can put in front of a company, from the species catalog and the creature
// generator's tables, and Orsino's bestiary with how much of it Kyr holds.
export class MonsterManual {
  readonly problems: Problem[] = [];
  constructor(readonly appendix: OrsinoAppendix) {}
  book(): Book {
    return { id: 'mm', title: 'Monster Manual', intro: [
      'The creatures of Kyr. A species is a kind of creature statted by its own nature: a natural weapon and hide, a hit '
        + 'die, rolled or fixed qualities, the abilities it fights with and the traits it is born with. People are '
        + 'statted by ancestry and calling instead, and are in the Player\'s Handbook.',
      'Defeating a creature is worth its kind\'s experience for each of its levels: '
        + `${Object.entries(Advancement.table.species).map(([k, v]) => `${k} ${v}`).join(', ')}; a person `
        + `${Advancement.table.person}, or by ancestry (${Object.entries(Advancement.table.ancestry).map(([k, v]) => `${k} `
        + `${v}`).join(', ')}). A fight won is worth what its foes were, ten for the square of their number and 25 `
        + 'more, shared among the company members still standing at its end.',
      'A species acts as many times a turn as its kind does: most once, an owlbear or an angel twice, a dragon three '
        + 'times. Most of the bestiary is composed from Orsino\'s monster template and grows with level as the template '
        + 'does: every quality rises by one at levels 4, 12 and 20, and hit points by three a level.'],
    sections: [this.species(), this.devices(), this.variations(), this.natural(), this.traits(), this.orsino()] };
  }
  species(): Section {
    const types = [...new Set(Canon.catalogued.map(id => Canon.creature(id).type ?? 'monster'))].sort();
    const sections = types.map((type): Section => ({ id: `species-${type}`, title: `${HandbookText.capital(type)}s`,
      entries: Canon.catalogued.filter(id => (Canon.creature(id).type ?? 'monster') === type)
        .sort((a, b) => Canon.creature(a).name.localeCompare(Canon.creature(b).name)).map(id => this.creature(id)) }));
    return { id: 'species', title: 'Creatures', intro: ['Each kind, with what it fights with, by type. Habitat says where '
      + 'it is met. Temperament says how it meets a company that comes where it lives (the inhabitants rules in the '
      + 'Dungeon Master\'s Guide): it warns, bargains, keeps its post, strikes from hiding, falls on you at once, or '
      + 'slinks away, in the words the place gives it.'], sections };
  }
  // What fights without being a creature (data/catalog/devices.json).
  devices(): Section {
    return { id: 'devices', title: 'Devices', intro: ['Engines, wards, barriers, charges and vessels: things that take part '
      + 'in a fight without being creatures. Each is set where it stands (Device turret.) and does what it was made to do '
      + 'whenever it can; nothing summons one, and none is met in a den.'],
    entries: Object.keys(Canon.devices).sort().map(id => this.creature(id)) };
  }
  static hitPoints(st: NonNullable<ReturnType<typeof Canon.creature>['statistics']>): string {
    if (st.hitPoints) { return `${st.hitPoints}`; }
    const g = st.growth?.hitPoints;
    return g ? `${g.base} + Constitution modifier + ${g.perLevel} a level` : `d${st.hitDie ?? 0} a level`;
  }
  creature(id: string): Entry {
    const s = Canon.creature(id), st = s.statistics;
    const armor = st?.armor ? Canon.items[st.armor] : undefined;
    const worth = s.worth ? `${s.worth.base ? `${s.worth.base} + ` : ''}${s.worth.perLevel} experience a level`
      : `${Advancement.table.species[s.type ?? ''] ?? Advancement.table.species.monster!} experience a level`;
    const facts: [string, string][] = [['Type', `${s.type ?? '—'} (${s.kind ?? 'monster'})`],
      ...st ? [['Hit points', MonsterManual.hitPoints(st)] as [string, string],
        ...st.actions && st.actions > 1 ? [['Actions a turn', String(st.actions)] as [string, string]] : [],
        ['Qualities', st.attributes === 'rolled' ? 'rolled (3d6 each)' : HandbookText.attributes(st.attributes)] as [string, string],
        ['Attack', MonsterManual.attacks(st.attacks?.length ? st.attacks : [st.weapon])] as [string, string]] : [],
      ...armor?.armor ? [['Hide', `${armor.name}, armour ${armor.armor.ac}`] as [string, string]] : [],
      ...s.resistances && Object.keys(s.resistances).length ? [['Resists', MonsterManual.resistances(s.resistances)] as
        [string, string]] : [],
      ...s.temperament ? [['Temperament', s.temperament] as [string, string]] : [],
      ...s.habitats?.length ? [['Found in', s.habitats.map(h => h.replace(/_/g, ' ')).join(', ')] as [string, string]] : [],
      ['Worth', worth]];
    return { id: `species:${id}`, title: s.name, status: HandbookStatus.of(s),
      kind: s.variantOf ? `a ${Canon.creature(s.variantOf).name.toLowerCase()}, altered` : s.type, facts,
      rules: [...(s.abilities ?? []).map(a => `${HandbookText.ability(a)}: ${HandbookText.mechanics(a) ?? 'no mechanics'}`),
        ...(s.traits ?? []).flatMap(t => HandbookText.trait(t).map(line => `${Canon.traits[t]?.name ?? t}: ${line}`))],
      rulesOf: [...(s.abilities ?? []).map(a => `ability:${a}`),
        ...(s.traits ?? []).flatMap(t => HandbookText.trait(t).map(() => `trait:${t}`))],
      text: [s.description], notes: HandbookStatus.notes(s as Parameters<typeof HandbookStatus.notes>[0]),
      refs: [...(s.abilities ?? []).map(a => `ability:${a}`), ...(s.traits ?? []).filter(t => MonsterManual.natured(t))
        .map(t => `trait:${t}`), ...s.variantOf ? [`species:${Canon.resolve('species', s.variantOf).split('/')[0]}`] : []],
      ...this.painted(id) };
  }
  // Its blow, or each of the blows of its round, one roll each (a dragon's claws, claws and bite: see AttackRoutine).
  static attacks(weapons: string[]): string {
    const said = weapons.map(id => {
      const w = Canon.items[id];
      return `${w?.name ?? id}${w?.weapon ? `, ${w.weapon.damage} ${w.weapon.type}` : ''}`;
    });
    return said.length > 1 ? `${said.join('; ')}, in one round` : said[0]!;
  }
  // A kind's painting, as play shows it (see CreaturePortraits); a device has none.
  private painted(id: string): Pick<Entry, 'painting'> {
    const painting = Canon.isBody(id) ? CreaturePortraits.painting(id) : undefined;
    return painting ? { painting } : {};
  }
  // What can make a creature other than its kind, one of each axis (data/catalog/variations.json).
  variations(): Section {
    return { id: 'variations', title: 'Variations', intro: ['A creature is its kind with any of these laid over it, one '
      + 'of each axis: an old great rat, a frost wolf, a great brood-mother of the cave spiders. An author gives them in a '
      + 'Person (Variant elder.); a generated country lays them on what dens where the hint holds.'],
    table: { head: ['Variation', 'Axis', 'Called', 'What is seen', 'Adds', 'Laid on where'],
      rows: Object.entries(CreatureVariants.variations).map(([id, v]) => [id, v.axis, v.word, v.says,
        MonsterManual.adds(v) || '—', v.hint ?? 'only by an author']) } };
  }
  static adds(v: (typeof CreatureVariants.variations)[string]): string {
    return [...Object.entries(v.attributes ?? {}).map(([k, n]) => `${HandbookText.capital(k)} ${MonsterManual.signed(n)}`),
      ...v.health ? [`health ${MonsterManual.signed(v.health)} a level`] : [], ...(v.traits ?? []).map(t => Canon.traits[t]?.name ?? t),
      ...(v.abilities ?? []).map(a => HandbookText.ability(a))].join(', ');
  }
  static signed(n: number): string { return `${n > 0 ? '+' : ''}${n}`; }
  static resistances(r: Record<string, number>): string {
    return Object.entries(r).map(([k, v]) => v >= 1 ? `immune to ${k}` : v > 0 ? `${k} ${Math.round(v * 100)}%`
      : `${k} takes ${Math.round(-v * 100)}% more`).join(', ');
  }
  // A trait of a creature's nature or affinity, which this book has an entry for.
  static natured(id: string): boolean { return ['nature', 'affinity'].includes(Canon.traits[id]?.category ?? ''); }
  traits(): Section {
    const entries = Object.entries(Canon.traits).filter(([id]) => MonsterManual.natured(id))
      .map(([id, t]) => CompanyChapters.trait(id, t.name, `${t.category} trait`));
    return { id: 'creature-traits', title: 'Creature traits', intro: ['What a creature\'s nature gives it: flight, size, an '
      + 'element it draws on or fears.'], entries };
  }
  natural(): Section {
    const entries = Object.entries(Canon.abilities).filter(([, a]) => a.kind === 'natural')
      .sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id, a]): Entry => {
        const rules = HandbookText.mechanics(id);
        return { id: `ability:${id}`, title: a.name, status: HandbookStatus.of(a), kind: 'natural ability',
          ...rules ? { rules: [rules] } : {}, ...a.windup ? { facts: [['Wound up', a.windup]] } : {},
          ...a.description ? { text: [a.description] } : {}, notes: HandbookStatus.notes(a) };
      });
    return { id: 'natural-abilities', title: 'Natural abilities', intro: ['What creatures do with their bodies: bites, '
      + 'breath, howls. A blow that must be wound up shows the turn before it falls.'], entries };
  }
  orsino(): Section {
    const a = this.appendix, d = MonsterDescribers;
    return { id: 'orsino-bestiary', title: 'Appendix: Orsino\'s bestiary', intro: [
      'Orsino composes a monster from a class (its stat line, weapon, hide, attacks a turn and worth), a type, an aspect, '
        + 'a terrain and a rank, with a colour for dragons and a substance for golems. Animals and elementals are their own '
        + 'tables. Each is listed with how much of it Kyr holds: most are still Orsino\'s data only.'],
    sections: [a.family('monsterClass', 'Monster classes', d.monsterClass),
      a.family('monsterType', 'Monster types', d.monsterType), a.family('animal', 'Animals', d.animal),
      a.family('elemental', 'Elementals', d.elemental),
      a.table('aspect', 'Aspects', [['Changes', MonsterDescribers.overlay], ['Abilities', MonsterDescribers.aspectAbilities]]),
      a.table('monsterRank', 'Ranks', [['Changes', MonsterDescribers.rank]]),
      a.table('dragonColor', 'Dragon colours', [['Breath', MonsterDescribers.weapon], ['Description', MonsterDescribers.description]]),
      a.table('golemSubstance', 'Golem substances', [['Changes', MonsterDescribers.scores]]),
      a.table('npcType', 'People by trade', [['Changes', MonsterDescribers.scores], ['Abilities', MonsterDescribers.abilities],
        ['Role', MonsterDescribers.role]])] };
  }
}
