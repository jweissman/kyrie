import { Canon } from '../canon/canon';
import { Content } from '../content';
import { Fighting } from '../rules/fighting';
import { Advancement } from '../rules/advancement';
import { MechanicsText } from '../presentation/mechanics-text';
import { HandbookStatus, type Entry, type Section, type Status } from './model';
import { HandbookText } from './text';
import { CompanyChapters } from './phb-company';
import { Progression } from './progression';

// The Player's Handbook, second part: how a fight goes, magic, advancement, feats and conditions. Numbers come from
// the rule code; ability and condition text comes from their typed mechanics.
export class PlayChapters {
  static combat(): Section {
    const levels = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
    return { id: 'combat', title: 'Combat', intro: [
      'A fight begins when someone sets on someone else: the company, or anything it meets. Each round every creature still '
        + 'standing rolls initiative (d20, plus its Dexterity modifier and any initiative bonus), and acts in that order. '
        + 'Conditions without a clock tick down as each round begins.',
      'To hit, roll d20 at or above THAC0, less the defender\'s armour class, less your to-hit (Strength modifier, or '
        + 'Dexterity with a missile weapon, plus to-hit bonuses). A natural 1 always misses; a 20, less any critical range '
        + 'bonus, is a critical. A defender with evasion then rolls d20 against 20 less its evasion to turn the hit aside. '
        + 'Armour class descends: 10, less the armour\'s value, less Dexterity modifier, plus armour class effects.',
      'Each creature has one action a turn. Haste adds one; slow takes one away, but never the last. A confused creature '
        + 'falls on something it could do, at random. A charmed creature takes its own side for the enemy; a dominated one '
        + 'answers to the other side.',
      'Some abilities must be prepared: Charge needs a turn of preparation, after which it is the only thing the warrior '
        + 'may do; Backstab needs the thief hidden. Some creatures wind up a great blow a turn ahead, and the company sees it '
        + 'coming; a stun loses the blow.',
      'Brought to nothing, a creature saves against death (DC 25). It stays at 1 hit point if it succeeds, and falls if it '
        + 'does not. A companion who falls may not get up. Fleeing is the whole company\'s: an even chance, and the fight ends.'],
    table: { head: ['Level', ...levels.map(String)], rows: [['THAC0', ...levels.map(l => String(Fighting.thac0(l)))],
      ['Highest spell level', ...levels.map(l => String(Fighting.maxSpellLevel(l)))]] } };
  }
  // The highest spell level any calling can cast, given the slot tables Kyr has.
  static reach(): number {
    return Math.max(0, ...Object.values(Canon.classes)
      .flatMap(c => c.spellcasting?.slots.map(row => row.length) ?? []));
  }
  static magic(): Section {
    const casters = Object.entries(Canon.classes).filter(([, c]) => c.playable && c.spellcasting);
    const tables = casters.map(([id, c]): Section => ({ id: `slots-${id}`, title: `${c.name}: spell slots`,
      table: { head: ['Level', ...Array.from({ length: Math.max(...c.spellcasting!.slots.map(r => r.length)) }, (_, i) => `${i + 1}`)],
        rows: c.spellcasting!.slots.map((row, i) => [String(i + 1), ...row.map(String)]) } }));
    const reach = this.reach(), spells = Object.entries(Canon.abilities).filter(([, a]) => a.spell);
    const traditions = ['arcane', 'divine'].map((tradition): Section => ({ id: `spells-${tradition}`,
      title: `${HandbookText.capital(tradition)} spells`, sections: Array.from({ length: 10 }, (_, level) => level)
        .map((level): Section => ({ id: `spells-${tradition}-${level}`, title: level ? `Level ${level}` : 'Cantrips',
          entries: spells.filter(([, a]) => a.spell!.tradition === tradition && a.spell!.level === level)
            .sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id]) => this.spell(id, reach)) }))
        .filter(s => s.entries!.length) }));
    return { id: 'magic', title: 'Magic', intro: [
      'Arcane spells are a mage\'s or a bard\'s; divine spells a cleric\'s. A caster knows the spells of their specialization '
        + '(a school, or a domain) and prepares some of them in slots by spell level. Casting a spell of first level or more '
        + 'spends a slot; cantrips cost nothing. A night\'s rest under a roof readies every slot. Preparing a different spell '
        + 'takes an hour, and is ready at once if its slot has not been spent.',
      `Kyr's slot tables run to character level ${Math.max(...casters.map(([, c]) => c.spellcasting!.slots.length))}, and `
        + `reach spells of level ${reach}: Orsino's reach, half the caster's level rounded up. A spell of a level no `
        + 'calling has a slot for would be marked unreachable.'],
    sections: [...tables, ...traditions] };
  }
  static spell(id: string, reach: number): Entry {
    const a = Canon.abilities[id]!, level = a.spell!.level;
    const playable = HandbookStatus.of(a);
    const status: Status = playable !== 'unsupported' && level > reach ? 'unreachable' : playable;
    const mechanics = HandbookText.mechanics(id);
    return { id: `ability:${id}`, title: a.name, status,
      kind: `${level ? `level ${level}` : 'cantrip'} ${a.spell!.tradition} spell${a.spell!.school ? `, ${a.spell!.school}` : ''}`
        + `${a.spell!.domain ? `, ${a.spell!.domain} domain` : ''}`,
      ...mechanics ? { rules: [mechanics] } : {}, ...a.description ? { text: [a.description] } : {},
      notes: [...HandbookStatus.notes(a), ...status === 'unreachable' ? [`No calling has a slot of level ${level} yet.`] : []] };
  }
  static techniques(): Section {
    const entries = Object.entries(Canon.abilities).filter(([, a]) => !a.spell && a.kind === 'technique')
      .sort(([, a], [, b]) => a.name.localeCompare(b.name)).map(([id, a]): Entry => {
        const mechanics = HandbookText.mechanics(id);
        const requires = a.requires ?? {};
        return { id: `ability:${id}`, title: a.name, status: HandbookStatus.of(a), kind: 'technique',
          facts: [...a.cost ? [['Cost', `${a.cost} mana`] as [string, string]] : [],
            ...a.recharge ? [['Again after', `${a.recharge} turns`] as [string, string]] : [],
            ...requires.status ? [['Needs', `the holder ${MechanicsText.conditionName(requires.status)}`] as [string, string]] : [],
            ...requires.notStatus ? [['Not while', MechanicsText.conditionName(requires.notStatus)] as [string, string]] : [],
            ...requires.interceptWeapon ? [['Needs', 'a weapon that sets against a charge'] as [string, string]] : [],
            ...a.windup ? [['Wound up', a.windup] as [string, string]] : []],
          ...mechanics ? { rules: [mechanics] } : {}, ...a.description ? { text: [a.description] } : {},
          notes: HandbookStatus.notes(a) };
      });
    return { id: 'techniques', title: 'Techniques', intro: ['Abilities that are not spells: a calling\'s, a feat\'s or an '
      + 'item\'s. They cost nothing but time, unless they say so.'], entries };
  }
  static advancement(): Section {
    const rows = Advancement.table.thresholds.map((xp, i) => [String(i + 2), String(xp), (i + 2) % 5 === 0 ? 'a feat' : '']);
    return { id: 'advancement', title: 'Advancement', intro: [
      'Experience comes from what the company defeats (its kind\'s worth for each of its levels) and from what it '
        + 'resolves. A level is taken the next time the company rests under a roof.',
      'Each level rolls the calling\'s hit die and adds Constitution modifier (at least 1), gives a point to raise any '
        + 'quality, and a specialist caster a new spell of their tradition that they can cast. At levels 5, 10 and 15 a '
        + 'companion may take up one of their calling\'s feats.',
      'Each calling also brings something new in kind at some levels: a technique learned, a calling trait taken, a '
        + 'new level of spells. These are Kyr\'s own progression, made from Orsino\'s techniques and modifiers; the '
        + 'tables below give each calling\'s, level by level.',
      `Kyr's experience table runs to level ${Advancement.table.thresholds.length + 1}, as Orsino's does for feats.`],
    table: { head: ['Level', 'Experience', 'Also'], rows },
    sections: Object.entries(Canon.classes).filter(([, c]) => c.playable).map(([id]) => Progression.section(id)) };
  }
  static feats(): Section {
    const entries = Object.entries(Canon.traits).filter(([, t]) => t.category === 'feat')
      .map(([id, t]) => CompanyChapters.trait(id, t.name, `${Canon.classes[t.requires?.class ?? '']?.name ?? ''} feat`));
    return { id: 'feats', title: 'Feats', intro: ['Offered at levels 5, 10 and 15: a calling\'s feats of that level or '
      + 'below, not already held, and not ruled out by one held.'], entries };
  }
  static conditions(): Section {
    const sorted = Object.entries(Canon.conditions).sort(([, a], [, b]) => a.name.localeCompare(b.name));
    const entries = sorted.map(([id, c]): Entry => {
      const effects = MechanicsText.modifiers(c.modifiers ?? {});
      return { id: `condition:${id}`, title: c.name, status: HandbookStatus.of(c),
        kind: c.lifetime === 'persistent' ? 'lasts beyond a fight' : 'lasts the fight at most',
        facts: [...c.saveKind ? [['Resisted by', `a ${c.saveKind} save`] as [string, string]] : [],
          ...c.compel ? [['Compels', HandbookText.ability(c.compel)] as [string, string]] : []],
        rules: [...effects.length ? [`${HandbookText.capital(effects.join(', '))}.`] : []],
        ...c.description ? { text: [c.description] } : {}, notes: HandbookStatus.notes(c) };
    });
    return { id: 'conditions', title: 'Conditions', entries, intro: ['What a creature can be under, from a spell, a blow, '
      + 'a trap or a lit torch. Kept by the creature until it lapses or is removed.'] };
  }
  static count(): number { return Content.abilities.length; }
}
