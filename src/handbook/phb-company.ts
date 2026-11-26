import type { Skill } from '../rules/catalog-schema';
import { Canon } from '../canon/canon';
import { PerkText } from '../presentation/perk-text';
import { MechanicsText } from '../presentation/mechanics-text';
import { Formations } from '../rules/formations';
import { Checks } from '../rules/checks';
import { HandbookStatus, type Entry, type Section } from './model';
import { HandbookText } from './text';
import { PeopleFacts } from './phb-peoples';
import { CanonValidation } from '../canon/canon-validation';
import type { ItemKind } from '../rules/catalog-schema';
import type { CanonItemReader } from './catalog';
import sky from '../../data/imbar/sky.json';

// The Player's Handbook, first part: who can be in a company and what they bring. Every line is read from the
// catalog the game plays from.
export class CompanyChapters {
  static ancestries(): Section {
    const entries = Object.entries(Canon.ancestries).map(([id, a]): Entry => ({
      id: `ancestry:${id}`, title: a.name, status: HandbookStatus.of(a), kind: a.playable ? 'playable ancestry' : 'not chosen by players',
      abilities: a.attributes, facts: [...PeopleFacts.of(id),
        // A people a player may be is said by the callings a player may take (OR-256: the commoner, no one's to
        // choose, had stood among the birdfolk's callings in creation).
        ['Callings', a.classes.filter(c => !a.playable || Canon.classes[c]?.playable).map(c => Canon.classes[c]?.name ?? c)
          .join(', ')],
        ...a.traits.length ? [['Born with', a.traits.map(t => Canon.traits[t]?.name ?? t).join(', ')] as [string, string]] : [],
        ...a.forbiddenTraits?.length ? [['May not take', a.forbiddenTraits.map(t => Canon.traits[t]?.name ?? t).join(', ')] as [string, string]] : []],
      rules: a.traits.flatMap(t => HandbookText.trait(t)),
      text: [a.description, ...[a.appearance, a.society].filter((t): t is string => !!t)],
      notes: HandbookStatus.notes(a),
      refs: [...a.classes.filter(c => Canon.classes[c]?.playable).map(c => `class:${c}`), ...a.traits.map(t => `trait:${t}`)] }));
    return { id: 'ancestries', title: 'Ancestries', intro: ['A companion\'s ancestry adds to their qualities, decides which '
      + 'callings are open to them, and gives the traits they are born with.'], entries };
  }
  // A calling's facts say no gold: Orsino's is paid to no one, and a life's coin is its origin's and its trade's
  // (OR-257, OR-270: the bard's "Gold 25" had stood here against a purse of 13 coin).
  static callings(items: CanonItemReader): Section {
    const entries = Object.entries(Canon.classes).filter(([, c]) => c.playable).map(([id, c]): Entry => ({
      id: `class:${id}`, title: c.name, status: HandbookStatus.of(c), kind: c.spellcasting ? `calling; casts with ${c.spellcasting.attribute}` : 'calling',
      facts: [['Hit die', `d${c.hitDie}`], ['Qualities', HandbookText.attributes(c.attributes)],
        ['Weapons', HandbookText.proficiency(c.proficiencies.weapons)], ['Armour', HandbookText.proficiency(c.proficiencies.armor)],
        ...c.startingGear?.length ? [['Carries from the start', c.startingGear.map(g => items.definition(g)?.name ?? g).join(', ')] as [string, string]] : [],
        ...c.skills?.length ? [['Skills', c.skills.map(s => Canon.skills[s]?.name ?? s).join(', ')] as [string, string]] : [],
        ...c.specializations?.length ? [['Specializations', c.specializations.map(s => Canon.traits[s]?.name ?? s).join(', ')] as [string, string]] : [],
        ...c.features?.length ? [['Later', c.features.map(f => `${f.level}: ${[...(f.abilities ?? []).map(a => HandbookText.ability(a)),
          ...(f.traits ?? []).map(t => Canon.traits[t]?.name ?? t)].join(', ')}`).join('; ')] as [string, string]] : []],
      rules: [...c.practice ? [c.practice] : [], ...c.abilities.map(a => `Begins knowing ${HandbookText.ability(a)}.`)],
      text: [c.description, ...c.life ? [c.life] : []], notes: HandbookStatus.notes(c),
      refs: [...c.abilities.map(a => `ability:${a}`), ...(c.specializations ?? []).map(s => `trait:${s}`),
        ...(c.features ?? []).flatMap(f => [...(f.abilities ?? []).map(a => `ability:${a}`), ...(f.traits ?? []).map(t => `trait:${t}`)])] }));
    const specializations = Object.entries(Canon.traits).filter(([, t]) => t.category === 'specialization')
      .map(([id, t]) => this.trait(id, t.name, 'specialization'));
    return { id: 'callings', title: 'Callings', intro: ['A calling is what a companion does in a fight and on the road: '
      + 'their hit die, the qualities it shapes, the arms they may bear and what they know from the start.'],
    entries, sections: [{ id: 'specializations', title: 'Specializations', intro: ['Some callings take one '
      + 'specialization at creation: a mage\'s school, a cleric\'s domain, a warrior\'s bent. Chosen, or drawn at random.'],
    entries: specializations }] };
  }
  static trait(id: string, title: string, kind: string): Entry {
    const t = Canon.traits[id]!;
    const requires = t.requires ?? {};
    const facts: [string, string][] = [
      ...requires.class ? [['Calling', Canon.classes[requires.class]?.name ?? requires.class] as [string, string]] : [],
      ...requires.ancestry ? [['Ancestry', Canon.ancestries[requires.ancestry]?.name ?? requires.ancestry] as [string, string]] : [],
      ...requires.level ? [['From level', String(requires.level)] as [string, string]] : [],
      ...t.excludes?.length ? [['Rules out', t.excludes.map(x => Canon.traits[x]?.name ?? x).join(', ')] as [string, string]] : [],
      ...t.spellAccess ? [['Opens', `${t.spellAccess.tradition} spells${t.spellAccess.school ? ` of ${t.spellAccess.school}` : ''}`
        + `${t.spellAccess.domain ? ` of the ${t.spellAccess.domain} domain` : ''}`] as [string, string]] : [],
      ...t.grants?.abilities?.length ? [['Brings', t.grants.abilities.map(a => HandbookText.ability(a)).join(', ')] as [string, string]] : []];
    return { id: `trait:${id}`, title, status: HandbookStatus.of(t), kind, facts, rules: HandbookText.trait(id),
      ...t.description ? { text: [t.description] } : {}, notes: HandbookStatus.notes(t),
      refs: (t.grants?.abilities ?? []).map(a => `ability:${a}`) };
  }
  // A kind of life as the reference says it, beside its choice at creation as in its own section (OR-88): what it
  // brings and carries, who its people know, and its trades; the rules of what it brings.
  static kind(kind: string, items: CanonItemReader): { facts: [string, string][]; rules: string[] } {
    const m = Canon.backgroundKinds[kind]!, skills = m.skills ?? [];
    const trades = Object.values(Canon.backgrounds).filter(b => b.kind === kind && !b.requiredClass).map(b => b.name);
    return { facts: [
      ...skills.length ? [['Brings', skills.map(s => Canon.skills[s]?.name ?? s).join(', ')] as [string, string]] : [],
      ...m.gear?.length ? [['Carries', m.gear.map(g => items.definition(g)?.name ?? g).join(', ')] as [string, string]] : [],
      ...m.channel ? [['Knows', `someone who hears news ${CompanyChapters.heard[m.channel]}`] as [string, string]] : [],
      ...trades.length ? [['Trades', `${trades.slice(0, 5).join(', ')}${trades.length > 5 ? ', …' : ''}`] as [string, string]] : []],
    rules: skills.map(s => `${Canon.skills[s]?.name ?? s}: ${Canon.skills[s]?.description ?? ''}`.trim()) };
  }
  static readonly heard: Record<string, string> = { road: 'on the road', tavern: 'at an inn', temple: 'at a shrine',
    market: 'at a market' };
  static backgrounds(items: CanonItemReader): Section {
    const sections = Object.entries(Canon.backgroundKinds).map(([kind, meaning]): Section => {
      const ids = Object.keys(Canon.backgrounds).filter(id => Canon.backgrounds[id]!.kind === kind).sort();
      return { id: `backgrounds-${kind}`, title: meaning.name,
        intro: [...meaning.life ? [meaning.life] : [], `Brings ${meaning.skills?.length ? meaning.skills.map(s => Canon.skills[s]?.name ?? s).join(' and ').toLowerCase() : 'no skill'}`
          + `${meaning.gear?.length ? `, carries ${meaning.gear.map(g =>
            items.definition(g)?.name ?? g).join(', ').toLowerCase()}` : ''}`
          + `${meaning.channel ? `, and knows someone who hears news ${CompanyChapters.heard[meaning.channel]}` : ''}.`],
        // Its coin as the purse is paid it, a coin for every ten of Orsino's gold (Canon.coins, as Overlays.coins).
        table: { head: ['Background', 'Qualities', 'Coin', 'For', 'Brings', 'Status'],
          rows: ids.map(id => { const b = Canon.backgrounds[id]!; return [b.name, HandbookText.attributes(b.attributes),
            String(Canon.coins(b.gold)),
            b.requiredClass ? Canon.classes[b.requiredClass]?.name ?? b.requiredClass : 'anyone',
            [...(b.skills ?? []).map(s => Canon.skills[s]?.name ?? s),
              ...(b.gear ?? []).map(g => items.definition(g)?.name ?? g)].join(', ') || '—',
            HandbookStatus.label(HandbookStatus.of(b))]; }),
          ids: ids.map(id => `background:${id}`), statuses: ids.map(id => HandbookStatus.of(Canon.backgrounds[id]!)) } };
    });
    return { id: 'backgrounds', title: 'Backgrounds', intro: ['Where a companion comes from: Orsino\'s scores for each, the coin '
      + 'it puts in the purse (a tenth of Orsino\'s gold), and what the kind of background means in Kyr. A background marked "for" one calling is open only to it.'], sections };
  }
  // The twelve signs of Imbar's sky, each with its month, what is said of those born under it, and the gifts everyone
  // born under it has (OR-89, OR-117): creation sets this entry beside the sign considered.
  static signs(): Section {
    const entries = sky.signs.map((s): Entry => ({ id: `sign:${s.id}`, title: s.name.replace(/^the /, 'The '),
      status: 'kyr', kind: `sign of ${s.month}`, text: [s.line],
      facts: [['Month', s.month], ['Gifts', s.gifts.map(g => Canon.traits[g]?.name ?? g).join(' and ')]],
      rules: s.gifts.map(g => CompanyChapters.gift(g)), refs: s.gifts.map(g => `trait:${g}`) }));
    return { id: 'signs', title: 'Signs of the sky', intro: ['A companion is born under one of the twelve signs of '
      + 'Imbar\'s sky, one rising in each month, and has both of its gifts.'], entries };
  }
  // A gift of the sky in a line: its name, then its rule ("Unturned: +2 against fear, +1 against charms.").
  static gift(id: string): string {
    const name = Canon.traits[id]?.name ?? id, said = HandbookText.trait(id).join(' ');
    return `${name}: ${said.startsWith(`${name}: `) ? said.slice(name.length + 2) : said}`;
  }
  static formations(): Section {
    const entries = Formations.all().map(([id, t]): Entry => {
      const company = t.requires!.company!, named = company.classes ?? company.ancestries ?? [];
      const of = company.classes ? 'callings' : 'ancestries';
      return { id: `trait:${id}`, title: t.name, status: Formations.possible(t) ? HandbookStatus.of(t) : 'unreachable',
        kind: 'company formation', facts: [['Formed by', `${named.map(n => Canon.classes[n]?.name ?? Canon.ancestries[n]?.name ?? n).join(', ')} (${of})`]],
        rules: (t.perks ?? []).map(p => PerkText.of(p)),
        notes: [...HandbookStatus.notes(t), ...Formations.possible(t) ? [] : [`Not every one of its ${of} can be chosen by players.`]] };
    });
    return { id: 'formations', title: 'Company formations', intro: ['A company whose three members are of the named callings, '
      + 'or the named ancestries, is recognised as a formation when it sets out. Every member holds it for good. Each named '
      + 'calling or ancestry is needed as many times as it is named.'], entries };
  }
  // The skills, and apart from them the means a company holds (a light, an oath given it), which open ways as a skill
  // does but are not learned.
  static skills(items: CanonItemReader): Section {
    const entries = Object.entries(Canon.skills).filter(([, s]) => !s.means)
      .map(([id, s]): Entry => this.skill(id, s, items));
    const means = Object.entries(Canon.skills).filter(([, s]) => s.means)
      .map(([id, s]): Entry => this.skill(id, s, items));
    return { id: 'skills', title: 'Skills', intro: ['Kyr does not roll for a skill. A company either has someone who '
      + 'brings it, and can do what needs it, or does not. The way that needs it says so. Searching is the exception: the '
      + 'company\'s best searcher takes 10 on Orsino\'s check (Wisdom modifier and search bonuses, against 15).'], entries,
    sections: [{ id: 'means', title: 'Means held', intro: ['What a company has to hand, or has been given to say, opens a '
      + 'way as a skill does, but is not learned: carried, lit, or spoken while it is held.'], entries: means }] };
  }
  private static skill(id: string, s: Skill, catalog: CanonItemReader): Entry {
    const allItems = catalog.ids.map(kind => catalog.definition(kind)!);
    const from = [...Object.entries(Canon.classes).filter(([, c]) => c.skills?.includes(id)).map(([, c]) => c.name),
      ...Object.entries(Canon.backgroundKinds).filter(([, k]) => k.skills?.includes(id)).map(([, k]) => `${k.name} backgrounds`),
      ...allItems.filter(i => i.grants?.skill === id || i.aids?.includes(id)).map(i => i.name)];
    const tools = allItems.filter(i => i.tool?.includes(id)).map(i => i.name);
    return { id: `skill:${id}`, title: s.name, status: HandbookStatus.of(s), rules: [s.description],
      facts: [...from.length ? [['Brought by', from.join(', ')] as [string, string]] : [],
        ...tools.length ? [['Tools of the trade', tools.join(', ')] as [string, string]] : []] };
  }
  static equipment(catalog: CanonItemReader): Section {
    const items = catalog.ids.map(id => [id, catalog.definition(id)!] as const);
    const weapons = items.filter(([, i]) => i.weapon && !i.weapon.natural)
      .sort(([, a], [, b]) => a.name.localeCompare(b.name));
    const armor = items.filter(([, i]) => i.armor);
    const other = items.filter(([, i]) => !i.weapon && !i.armor && !i.rank), stones = items.filter(([, i]) => i.rank);
    return { id: 'equipment', title: 'Equipment', intro: ['Each thing is carried by one companion. A weapon or armour '
      + 'works only for a calling proficient with its kind and weight.'], sections: [
      { id: 'weapons', title: 'Weapons', table: { head: ['Weapon', 'Damage', 'Type', 'Kind', 'Weight', 'Notes', 'Status'],
        rows: weapons.map(([, i]) => [i.name, i.weapon!.damage, i.weapon!.type, i.weapon!.kind ?? '', i.weapon!.weight ?? '',
          [i.weapon!.missile ? 'missile' : '', i.weapon!.intercept ? 'sets against a charge' : ''].filter(Boolean).join(', '),
          HandbookStatus.label(HandbookStatus.of(i))]),
        ids: weapons.map(([id]) => `item:${id}`), statuses: weapons.map(([, i]) => HandbookStatus.of(i)) } },
      { id: 'armour', title: 'Armour', table: { head: ['Armour', 'AC', 'Weight', 'Type', 'Status'],
        rows: armor.map(([, i]) => [i.name, String(i.armor!.ac), i.armor!.weight, i.armor!.type,
          HandbookStatus.label(HandbookStatus.of(i))]),
        ids: armor.map(([id]) => `item:${id}`), statuses: armor.map(([, i]) => HandbookStatus.of(i)) } },
      { id: 'gear', title: 'Gear, tools, consumables and treasure', entries: other.map(([id, i]): Entry => ({
        id: `item:${id}`, title: i.name, status: HandbookStatus.of(i), kind: i.category,
        facts: [...i.value ? [['Worth', `${i.value}`] as [string, string]] : [], ...i.slot ? [['Worn', i.slot] as [string, string]] : []],
        rules: [...i.grants?.skill ? [`Brings ${Canon.skills[i.grants.skill]?.name ?? i.grants.skill} to whoever carries it equipped.`] : [],
          ...i.tool ? [`A tool of ${CompanyChapters.named(i.tool)}: one trained in it does better at its checks (+${Checks.toolBonus}); it lends one who is not nothing.`] : [],
          ...i.aids ? [`Used for ${CompanyChapters.named(i.aids)}: whoever carries it can do what needs it, and does a little better at its checks (+${Checks.toolBonus}), trained or not.`] : [],
          ...i.grants?.ability ? [`Lets its bearer use ${HandbookText.ability(i.grants.ability)}.`] : [],
          ...i.use ? [`Used: ${HandbookText.use(i.use)}.`] : [], ...MechanicsText.modifiers(i.modifiers ?? {}).map(m => `${m}.`)],
        ...CompanyChapters.plate(i), text: [i.description], notes: HandbookStatus.notes(i) })) },
      CompanyChapters.stones(stones)] };
  }
  private static named(skills: string[]): string {
    return skills.map(k => Canon.skills[k]?.name.toLowerCase() ?? k).join(' and ');
  }
  // The stones, each by its plate: what one of its rank is worth, which a stone found is by its cut, size and clarity.
  private static stones(stones: readonly (readonly [string, ItemKind])[]): Section {
    return { id: 'stones', title: 'Stones', intro: ['A stone found is cut or rough, of a size, and clear or clouded: '
      + 'a huge flawless one is worth three times one of middling size and good water, a tiny clouded one a quarter.'],
    entries: stones.map(([id, i]): Entry => ({ id: `item:${id}`, title: i.name, status: HandbookStatus.of(i),
      kind: 'stone', facts: [['Rank', i.rank!.replace('_', ' ')], ['Worth', `${i.value}`]],
      ...CompanyChapters.plate(i), text: [i.description], notes: HandbookStatus.notes(i) })) };
  }
  // A thing's plate, where one is cut.
  private static plate(i: ItemKind): Pick<Entry, 'painting'> {
    return i.portrait && CanonValidation.paintings.has(i.portrait) ? { painting: i.portrait } : {};
  }
}
