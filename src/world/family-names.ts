import folk from '../../data/generation/scenes/folk.json';
import naming from '../../data/generation/scenes/naming.json';

type As = 'she' | 'he' | 'they';
// What a people's family is known by, as the setting says (data/generation/scenes/naming.json): a family name its
// people hand down (line: family), or the given name of each one's father (line: father); and how one of it is called,
// for how they present ({given}, {family} and {father} filled).
interface Tradition { line: 'family' | 'father'; said: Partial<Record<As | 'any', string>> }
// One of a family a story casts: their part in it, how they present, and whether they are of the elder generation
// (a mother, a father) or the younger (a son, a sister, the protagonist come home).
interface Kinsman { part: string; as: As; elder: boolean }

// One family's names, from one model: the dwarf Morgran had come home to a brother Morgran Torunn and a mother Brannoc
// Holderhek (the owner, 17 November), each named by a generator of their own, apart from the country's people but
// not from each other, and no family at all. A family is drawn together: what it is known by (its family name, or its
// father) first, by who it is alone (`key`: the town and the story) and the protagonist's own name, never by who else
// lives in the country, so that the world and the story it places the protagonist in agree on it; then each member's
// given name, of their people and as they present, none another member's, and none the country's people have while
// their people have names nobody here has. Different people may share a name; a family's members do not.
export class FamilyNames {
  private static readonly traditions = naming.traditions as Record<string, Tradition>;
  private static readonly more = naming.more as Record<string, Partial<Record<As, string[]>>>;
  private static readonly given = folk.given as Record<string, Partial<Record<As, string[]>>>;
  private static readonly families = folk.family as Record<string, string[]>;
  // The family's parts, as a story's casting writes them: "she:wife:elder he:son".
  static roster(text: string): Kinsman[] {
    return text.split(/\s+/).filter(Boolean).map(w => {
      const [as = 'they', part = '', age] = w.split(':');
      return { part, as: (['she', 'he'].includes(as) ? as : 'they') as As, elder: age === 'elder' };
    });
  }
  // Every member's name, by their part; the protagonist's ("you") too, where one is of the family (`own`: the name
  // the player gave them, its first word their given name, and the rest, if any, the family's name).
  static household(at: { key: string; people: string; roster: string; taken?: string[]; own?: string;
    as?: As }): Record<string, string> {
    const people = this.traditions[at.people] ? at.people : 'human', tradition = this.traditions[people]!;
    const [ownGiven, ...ownLine] = (at.own ?? '').trim().split(/\s+/).filter(Boolean);
    const used = new Set<string>(ownGiven ? [ownGiven] : []);
    const held = new Set((at.taken ?? []).map(n => n.split(', ')[0]!.split(' ')[0]!));
    // The line is the family's, drawn by its key alone (and the father apart from the protagonist).
    const father = this.pick(this.names(people, 'he'), `${at.key}|father`, used, new Set());
    const family = ownLine.length ? ownLine.join(' ')
      : this.pick(this.families[people] ?? this.families.human!, `${at.key}|family`, new Set(), new Set());
    used.add(father);
    const out: Record<string, string> = {};
    if (ownGiven) {
      out.you = ownLine.length ? at.own!.trim()
        : this.said(tradition, at.as ?? 'they', { given: ownGiven, family, father });
    }
    for (const k of this.roster(at.roster)) {
      const given = this.pick(this.names(people, k.as), `${at.key}|${k.part}`, used, held);
      used.add(given);
      // One of the elder generation is a child of another father; the younger are this father's.
      const own = k.elder && tradition.line !== 'family'
        ? this.pick(this.names(people, 'he'), `${at.key}|${k.part}|father`, new Set([given, father]), new Set())
        : father;
      out[k.part] = this.said(tradition, k.as, { given, family, father: own });
    }
    return out;
  }
  // A people's given names as they present, those its settled folk have first; one who is neither, anyone's first.
  static names(people: string, as: As): string[] {
    const own = this.given[people] ?? this.given.human!, more = this.more[people] ?? this.more.human!;
    const lists = as === 'they' ? (['they', 'she', 'he'] as As[]) : [as];
    return [...new Set(lists.flatMap(a => [...own[a] ?? [], ...more[a] ?? []]))];
  }
  private static said(t: Tradition, as: As, words: Record<string, string>): string {
    const form = t.said[as] ?? t.said.any ?? '{given}';
    return form.replace(/\{(\w+)\}/g, (whole, w: string) => words[w] ?? whole);
  }
  // One of the names, by the key: none used in the family, and none held in the country while any is not.
  private static pick(names: string[], key: string, used: Set<string>, held: Set<string>): string {
    const free = names.filter(n => !used.has(n)), fresh = free.filter(n => !held.has(n));
    const from = fresh.length ? fresh : free.length ? free : names;
    let h = 2166136261;
    for (const ch of key) { h = Math.imul(h ^ ch.charCodeAt(0), 16777619); }
    return from[(h >>> 0) % from.length]!;
  }
}
