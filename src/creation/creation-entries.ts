import { Canon } from '../canon/canon';
import { FirstSpells } from './first-spells';
import { Words } from '../presentation/words';
import { PerkText } from '../presentation/perk-text';
import { MechanicsText } from '../presentation/mechanics-text';
import type { Catalog } from './protocol';
import type { CreationEntry } from './creation-flow';

type Calling = Catalog['callings'][number];
type Row = NonNullable<CreationEntry['groups']>[number]['rows'][number];

// What creation sets beside a choice as it is considered (OR-99, the owner, 18 November: "most of the instruments next
// to the menu in character creation seem impoverished"): what the choice is in play, read from the catalog the game
// plays from, never written for the page. Its line in play first (a people's qualities as a stat line, a calling's hit
// die and armour, a trade's qualities and coin), then a few facts, then what it brings by name and in a line (a
// people's gifts by birth, a calling's first abilities), then what comes later. The fuller words are the
// encyclopedia's. Each is written once: steps() is asked at every press, and a choice answers in milliseconds.
export class CreationEntries {
  private static made = new Map<string, CreationEntry | undefined>();
  private static once(key: string, make: () => CreationEntry | undefined): CreationEntry | undefined {
    if (!CreationEntries.made.has(key)) { CreationEntries.made.set(key, make()); }
    return CreationEntries.made.get(key);
  }
  // The six qualities as a stat line, in the reference's order (Str −1 · Dex +2 · …), those unchanged left out.
  static stats(q: Record<string, number>): string {
    const all = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    const line = all.filter(k => q[k]).map(k => `${Words.upper(k.slice(0, 3))} ${q[k]! > 0 ? '+' : '−'}${Math.abs(q[k]!)}`);
    if (line.length === all.length && new Set(all.map(k => q[k])).size === 1) {
      return `${q.strength! > 0 ? '+' : '−'}${Math.abs(q.strength!)} to every quality`;
    }
    return line.join(' · ');
  }
  // A people: its qualities, its build, ages, country and tongue, the callings open to it and the ways shut; and its
  // gifts by birth, each by name and what it does (the reference's own facts, the table of its names left to the name).
  static people(a: Catalog['ancestries'][number]): CreationEntry | undefined {
    return CreationEntries.once(`ancestry:${a.id}`, () => {
      const found = a.entry, traits = Canon.ancestries[a.id]?.traits ?? [];
      if (!found) { return undefined; }
      return { play: CreationEntries.stats(a.qualities), rules: [],
        facts: found.facts.filter(([k]) => k !== 'Names' && k !== 'Born with'),
        ...traits.length ? { groups: [{ heading: 'Born with', rows: traits.map(t => CreationEntries.trait(t)) }] } : {} };
    });
  }
  // A calling: its hit die, its armour where it is any or none (else among the facts), and how it casts; its
  // qualities, weapons, skills and gear; what it knows from the start, each by what it does (Defend, every calling's,
  // said once under them); and what it learns later. Not the reference's gold, which no life is given: a bard's "Gold
  // 25" was set out with as 13 coin, the life's own and the trade's (OR-257).
  static calling(c: Calling): CreationEntry | undefined {
    return CreationEntries.once(`class:${c.id}`, () => {
      const found = c.entry, k = Canon.classes[c.id];
      if (!found || !k) { return undefined; }
      const knows = k.abilities.map(a => Canon.resolve('abilities', a)).filter(a => a !== 'defend');
      const later = CreationEntries.fact(found, 'Later')[0]?.[1].split('; ').flatMap(part => {
        const [, level = '', names = ''] = /^(\d+): (.*)$/.exec(part) ?? [];
        return names.split(', ').map(name => `${name} (${level})`);
      }) ?? [];
      const plain = c.armour === 'clothing' ? 'no armour' : c.armour === 'any armour' ? c.armour : undefined;
      return { play: [`d${c.hitDie} hit die`, ...plain ? [plain] : [], ...c.casts ? [`casts by ${Words.upper(c.casts)}`] : []]
        .join(' · '),
        facts: [['Qualities', CreationEntries.stats(c.qualities)], ...plain ? [] : CreationEntries.fact(found, 'Armour'),
          ...CreationEntries.fact(found, 'Weapons').map(([x, v]): [string, string] => [x, v === 'all' ? 'any' : v.replaceAll('_', ' ')]),
          ...CreationEntries.fact(found, 'Skills'),
          ...CreationEntries.fact(found, 'Carries from the start').map(([, v]): [string, string] => ['Carries', v])],
        rules: [], ...knows.length ? { groups: [{ heading: 'Begins knowing', rows: knows.map(a => CreationEntries.ability(a)) }] }
          : {},
        after: [k.abilities.includes('defend') ? 'And Defend, as every calling.' : '', CreationEntries.given(k),
          later.length ? `Later, by level: ${Words.listed(later)}.` : ''].filter(Boolean).join(' ') };
    });
  }
  // Where a calling's first spells come from a way chosen next (a god's domain, a mage's art), so it is said: the
  // cleric's card listed no prayer under "Prayers of the god they are sworn to" (OR-256, the first cold play's P25).
  private static given(k: NonNullable<(typeof Canon.classes)[string]>): string {
    const way = (k.specializations ?? []).map(t => Canon.traits[t]?.spellAccess).find(Boolean);
    if (!way) { return ''; }
    return way.tradition === 'divine' ? 'Its first prayers are its god\'s, chosen next.'
      : 'More first spells come with its art, chosen next.';
  }
  // A trade: what it adds to the qualities and the coin it puts in the purse (a tenth of its gold pieces), as its line
  // in play; what it brings and carries, and the
  // calling it is kept for.
  static trade(b: Catalog['backgrounds'][number]): CreationEntry {
    return CreationEntries.once(`background:${b.id}`, () => {
      const skills = (Canon.backgrounds[b.id]?.skills ?? []).map(s => Canon.skills[s]?.name ?? s);
      const facts: [string, string][] = [...skills.length ? [['Brings', skills.join(', ')] as [string, string]] : [],
        ...b.gear.length ? [['Carries', Words.upper(b.gear.join(', '))] as [string, string]] : [],
        ...b.calling ? [['For', `${Canon.classes[b.calling]?.name ?? b.calling} only`] as [string, string]] : []];
      return { play: [CreationEntries.stats(b.qualities), ...b.coin ? [`${b.coin} coin`] : []].filter(Boolean).join(' · '),
        facts, rules: [] };
    })!;
  }
  private static fact(found: CreationEntry, name: string): [string, string][] {
    return found.facts.filter(([x]) => x === name);
  }
  // A gift by birth by its name and what it does: its rule, where the rules say it shortly, else its words.
  private static trait(id: string): Row {
    const t = Canon.traits[id], name = t?.name ?? id;
    const modifiers = MechanicsText.modifiers(t?.modifiers ?? {});
    const perks = (t?.perks ?? []).filter(p => p.environment || p.weapon || p.triggers || p.bonuses)
      .map(p => PerkText.of(p));
    const skills = (t?.skills ?? []).map(skill => skill.replaceAll('_', ' '));
    const rule = [...modifiers.length ? [`${modifiers.join(', ').replace(/^./, c => c.toUpperCase())}.`] : [], ...perks,
      ...skills.length ? [`Skilled in ${skills.join(' and ')}.`] : []].join(' ').replace(`${name}: `, '');
    const said = t?.description ?? '';
    return { id, name, line: (rule && (rule.length <= 90 || !said) ? rule : said).replace(/\.$/, '') };
  }
  // A first ability by its name and the first clause of its words; a spell with the emblem of what it is for.
  private static ability(id: string): Row {
    const a = Canon.abilities[id], words = a?.description ?? '';
    const line = /^[^:;.,]+/.exec(words)?.[0]?.trim() ?? words;
    const emblem = a?.spell ? FirstSpells.spell(id).kind : undefined;
    const name = a ? a.unsupported ? `${a.name} (not playable)` : a.name : id;
    return { id, name, line, ...emblem ? { emblem } : {} };
  }
}
