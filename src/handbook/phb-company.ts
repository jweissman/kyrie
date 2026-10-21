import { Canon } from '../canon/canon';
import { PerkText } from '../presentation/perk-text';
import { MechanicsText } from '../presentation/mechanics-text';
import { Formations } from '../rules/formations';
import { HandbookStatus, type Entry, type Section } from './model';
import { HandbookText } from './text';

// The Player's Handbook, first part: who can be in a company and what they bring. Every line is read from the
// catalog the game plays from.
export class CompanyChapters {
  static ancestries(): Section {
    const entries = Object.entries(Canon.ancestries).map(([id, a]): Entry => ({
      id: `ancestry:${id}`, title: a.name, status: HandbookStatus.of(a), kind: a.playable ? 'playable ancestry' : 'not chosen by players',
      facts: [['Qualities', HandbookText.attributes(a.attributes)], ['Callings', a.classes.map(c => Canon.classes[c]?.name ?? c).join(', ')],
        ...a.traits.length ? [['Born with', a.traits.map(t => Canon.traits[t]?.name ?? t).join(', ')] as [string, string]] : [],
        ...a.forbiddenTraits?.length ? [['May not take', a.forbiddenTraits.map(t => Canon.traits[t]?.name ?? t).join(', ')] as [string, string]] : []],
      rules: a.traits.flatMap(t => HandbookText.trait(t)), text: [a.description], notes: HandbookStatus.notes(a),
      refs: [...a.classes.filter(c => Canon.classes[c]?.playable).map(c => `class:${c}`), ...a.traits.map(t => `trait:${t}`)] }));
    return { id: 'ancestries', title: 'Ancestries', intro: ['A companion\'s ancestry adds to their qualities, decides which '
      + 'callings are open to them, and gives the traits they are born with.'], entries };
  }
  static callings(): Section {
    const entries = Object.entries(Canon.classes).filter(([, c]) => c.playable).map(([id, c]): Entry => ({
      id: `class:${id}`, title: c.name, status: HandbookStatus.of(c), kind: c.spellcasting ? `calling; casts with ${c.spellcasting.attribute}` : 'calling',
      facts: [['Hit die', `d${c.hitDie}`], ['Qualities', HandbookText.attributes(c.attributes)], ['Gold', `${c.gold}`],
        ['Weapons', HandbookText.proficiency(c.proficiencies.weapons)], ['Armour', HandbookText.proficiency(c.proficiencies.armor)],
        ...c.skills?.length ? [['Skills', c.skills.map(s => Canon.skills[s]?.name ?? s).join(', ')] as [string, string]] : [],
        ...c.specializations?.length ? [['Specializations', c.specializations.map(s => Canon.traits[s]?.name ?? s).join(', ')] as [string, string]] : [],
        ...c.features?.length ? [['Later', c.features.map(f => `${f.level}: ${[...(f.abilities ?? []).map(a => HandbookText.ability(a)),
          ...(f.traits ?? []).map(t => Canon.traits[t]?.name ?? t)].join(', ')}`).join('; ')] as [string, string]] : []],
      rules: [...c.practice ? [c.practice] : [], ...c.abilities.map(a => `Begins knowing ${HandbookText.ability(a)}.`)],
      text: [c.description], notes: HandbookStatus.notes(c),
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
  static backgrounds(): Section {
    const sections = Object.entries(Canon.backgroundKinds).map(([kind, meaning]): Section => {
      const ids = Object.keys(Canon.backgrounds).filter(id => Canon.backgrounds[id]!.kind === kind).sort();
      return { id: `backgrounds-${kind}`, title: meaning.name,
        intro: [`Brings ${meaning.skills?.length ? meaning.skills.map(s => Canon.skills[s]?.name ?? s).join(' and ').toLowerCase() : 'no skill'}`
          + `${meaning.gear?.length ? `, carries ${meaning.gear.map(g => Canon.items[g]?.name ?? g).join(', ').toLowerCase()}` : ''}`
          + `${meaning.channel ? `, and knows someone who hears news ${({ road: 'on the road', tavern: 'at an inn', temple: 'at a shrine', market: 'at a market' })[meaning.channel]}` : ''}.`],
        table: { head: ['Background', 'Qualities', 'Gold', 'For', 'Brings', 'Status'],
          rows: ids.map(id => { const b = Canon.backgrounds[id]!; return [b.name, HandbookText.attributes(b.attributes),
            String(b.gold),
            b.requiredClass ? Canon.classes[b.requiredClass]?.name ?? b.requiredClass : 'anyone',
            [...(b.skills ?? []).map(s => Canon.skills[s]?.name ?? s), ...(b.gear ?? []).map(g => Canon.items[g]?.name ?? g)].join(', ') || '—',
            HandbookStatus.label(HandbookStatus.of(b))]; }),
          ids: ids.map(id => `background:${id}`), statuses: ids.map(id => HandbookStatus.of(Canon.backgrounds[id]!)) } };
    });
    return { id: 'backgrounds', title: 'Backgrounds', intro: ['Where a companion comes from: Orsino\'s scores and gold for '
      + 'each, and what the kind of background means in Kyr. A background marked "for" one calling is open only to it.'], sections };
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
  static skills(): Section {
    const entries = Object.entries(Canon.skills).map(([id, s]): Entry => {
      const from = [...Object.entries(Canon.classes).filter(([, c]) => c.skills?.includes(id)).map(([, c]) => c.name),
        ...Object.entries(Canon.backgroundKinds).filter(([, k]) => k.skills?.includes(id)).map(([, k]) => `${k.name} backgrounds`),
        ...Object.values(Canon.items).filter(i => i.grants?.skill === id).map(i => i.name)];
      return { id: `skill:${id}`, title: s.name, status: HandbookStatus.of(s), rules: [s.description],
        facts: from.length ? [['Brought by', from.join(', ')]] : [] };
    });
    return { id: 'skills', title: 'Skills', intro: ['Kyr does not roll for a skill. A company either has someone who '
      + 'brings it, and can do what needs it, or does not. The way that needs it says so. Searching is the exception: the '
      + 'company\'s best searcher takes 10 on Orsino\'s check (Wisdom modifier and search bonuses, against 15).'], entries };
  }
  static equipment(): Section {
    const items = Object.entries(Canon.items);
    const weapons = items.filter(([, i]) => i.weapon && !i.weapon.natural)
      .sort(([, a], [, b]) => a.name.localeCompare(b.name));
    const armor = items.filter(([, i]) => i.armor);
    const other = items.filter(([, i]) => !i.weapon && !i.armor);
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
          ...i.grants?.ability ? [`Lets its bearer use ${HandbookText.ability(i.grants.ability)}.`] : [],
          ...i.use ? [`Used: ${HandbookText.use(i.use)}.`] : [], ...MechanicsText.modifiers(i.modifiers ?? {}).map(m => `${m}.`)],
        text: [i.description], notes: HandbookStatus.notes(i) })) }] };
  }
}
