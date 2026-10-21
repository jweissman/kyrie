import { Canon } from '../canon/canon';
import { Advancement } from '../rules/advancement';
import creatureTables from '../../data/generation/tables/creatures.json';
import dragonTables from '../../data/generation/tables/dragons.json';
import { HandbookStatus, type Book, type Entry, type Problem, type Section } from './model';
import { HandbookText } from './text';
import { CompanyChapters } from './phb-company';
import type { OrsinoAppendix } from './orsino-appendix';
import { MonsterDescribers } from './mm-describers';

interface Kind { family: string; body?: string; raceId?: string; classIds?: string[]; _terrains?: Record<string, true>;
  _adaptations?: Record<string, true>; _roles?: Record<string, true> }

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
        + `${v}`).join(', ')}).`,
      'Every species acts once a turn. Orsino gives its monsters up to three attacks a turn; Kyr does not yet.'],
    sections: [this.species(), this.natural(), this.traits(), this.generated(), this.orsino()] };
  }
  species(): Section {
    const entries = Object.keys(Canon.species).map(id => this.creature(id));
    return { id: 'species', title: 'Creatures', intro: ['Each kind, with what it fights with. Temperament and habitat '
      + 'say what it is like and where it is met; neither yet decides what it does.'], entries };
  }
  creature(id: string): Entry {
    const s = Canon.creature(id), st = s.statistics;
    const weapon = st ? Canon.items[st.weapon] : undefined, armor = st?.armor ? Canon.items[st.armor] : undefined;
    const worth = Advancement.table.species[s.type ?? ''] ?? Advancement.table.species.monster!;
    if (s.temperament) {
      this.problems.push({ book: 'mm', entry: `species:${id}`, kind: 'descriptive',
        text: `Temperament "${s.temperament}" is read by nothing in play.` });
    }
    const facts: [string, string][] = [['Type', `${s.type ?? '—'} (${s.kind ?? 'monster'})`],
      ...st ? [['Hit die', `d${st.hitDie}${st.hitPoints ? `, ${st.hitPoints} hit points` : ''}`] as [string, string],
        ['Qualities', st.attributes === 'rolled' ? 'rolled (3d6 each)' : HandbookText.attributes(st.attributes)] as [string, string],
        ['Attack', `${weapon?.name ?? st.weapon}${weapon?.weapon ? `, ${weapon.weapon.damage} ${weapon.weapon.type}` : ''}`] as
          [string, string]] : [],
      ...armor?.armor ? [['Hide', `${armor.name}, armour ${armor.armor.ac}`] as [string, string]] : [],
      ...s.resistances && Object.keys(s.resistances).length ? [['Resists', MonsterManual.resistances(s.resistances)] as
        [string, string]] : [],
      ...s.temperament ? [['Temperament', s.temperament] as [string, string]] : [],
      ...s.habitats?.length ? [['Found in', s.habitats.map(h => h.replace(/_/g, ' ')).join(', ')] as [string, string]] : [],
      ['Worth', `${worth} experience a level`]];
    return { id: `species:${id}`, title: s.name, status: HandbookStatus.of(s),
      kind: s.variantOf ? `a ${Canon.creature(s.variantOf).name.toLowerCase()}, altered` : s.type, facts,
      rules: [...(s.abilities ?? []).map(a => `${HandbookText.ability(a)}: ${HandbookText.mechanics(a) ?? 'no mechanics'}`),
        ...(s.traits ?? []).flatMap(t => HandbookText.trait(t).map(line => `${Canon.traits[t]?.name ?? t}: ${line}`))],
      text: [s.description], notes: HandbookStatus.notes(s),
      refs: [...(s.abilities ?? []).map(a => `ability:${a}`), ...s.variantOf ? [`species:${s.variantOf}`] : []] };
  }
  static resistances(r: Record<string, number>): string {
    return Object.entries(r).map(([k, v]) => v >= 1 ? `immune to ${k}` : v > 0 ? `${k} ${Math.round(v * 100)}%`
      : `${k} takes ${Math.round(-v * 100)}% more`).join(', ');
  }
  traits(): Section {
    const entries = Object.entries(Canon.traits).filter(([, t]) => t.category === 'nature' || t.category === 'affinity')
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
  // The creature generator: each family's kinds, where they are met, and what can alter them.
  generated(): Section {
    const kinds = (creatureTables.creatureKinds.groups as unknown as Record<string, Kind[]>);
    const sections = Object.entries(kinds).map(([family, list]): Section => ({ id: `generated-${family}`,
      title: `${HandbookText.capital(family)} family`, table: { head: ['Kind', 'Met in', 'Can be', 'Roles'],
        rows: list.map(k => [Canon.isSpecies(k.raceId ?? '') ? Canon.creature(k.raceId!).name : k.body ?? k.raceId ?? family,
          Object.keys(k._terrains ?? {}).filter(t => t !== 'any').join(', '),
          Object.keys(k._adaptations ?? {}).filter(a => a !== 'none').map(a => `${a}-adapted`).join(', ') || '—',
          Object.keys(k._roles ?? {}).join(', ') || '—']) } }));
    const dragons = dragonTables as unknown as Record<string, { groups?: Record<string, unknown> }>;
    return { id: 'generated', title: 'Generated creatures', intro: [
      'A world\'s generator draws creatures for its places from these families, by terrain. A kind may come adapted to '
        + 'frost or marsh (a trait that carries its resistances), and a construct may be made of a material or set to a '
        + 'role. Every drawn creature is a species above, altered; nothing is invented that the catalog cannot play.',
      `Dragons are drawn by lineage (${Object.keys(dragons.dragonLineage?.groups ?? {}).join(', ')}) and maturity `
        + `(${Object.keys(dragons.dragonMaturity?.groups ?? {}).join(', ')}).`], sections };
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
