import type { Background, Omissions } from './schema';

type Channel = NonNullable<Background['contact']>['channel'];
interface Table<T> { discriminator: string; groups: Record<string, T> }
// What a kind of background means in a Kyr world: its skills, its gear, and the channel an old acquaintance from it
// hears news through, with the lines that introduce them.
export interface KindMeaning {
  name: string; skills?: string[]; gear?: string[]; channel?: Channel; contacts?: string[];
}
// Where one background differs from its kind. A list given here replaces the kind's.
export interface BackgroundChange {
  name?: string; use?: Background['use']; skills?: string[]; gear?: string[]; channel?: Channel; contact?: string;
  offers?: Background['offers']; routine?: string;
}
// What one of the trade is called, by who they are: an abbot or an abbess, a priest or a priestess, one word or the
// other for one who is neither (the owner's play of 10 November: a man could be made an abbess).
export interface Forms { man?: string; woman?: string; neither?: string }
export interface BackgroundTables {
  backgroundKind: Table<string[]>; backgroundKindMeaning: Table<KindMeaning>;
  backgroundOverlay: Table<BackgroundChange>;
}
export interface OrsinoBackground {
  attributes: Record<string, number>; gold: number; requiredClass?: string; gear?: string[]; source: { orsino: string };
}
export type CompiledBackground = Background & { kind: string; omits?: Omissions; painting?: string; forms?: Forms };
// A profession the portraits show that Orsino's backgrounds do not (data/catalog/professions.json, written by
// scripts/professions.ts): of a kind, with scores and purse derived from its kind's Orsino rows.
export interface KyrProfession {
  name: string; kind: string; attributes: Record<string, number>; gold: number; painting: string;
  source: { kyr: true; notes: string };
}

// Backgrounds and professions, compiled from two sources: Orsino's backgroundModifier rows (scores, gold, class,
// gear) and Kyr's Deem tables, which put each background in a kind and say what the kind means. Nothing is copied by
// hand: a background differs from its kind only where an overlay says so.
export class BackgroundCatalog {
  // What one of a trade is called by the pronouns they go by: she a woman's word, he a man's, they the word for one
  // who is neither; the trade's own name where it has no other.
  static called(b: { name: string; forms?: Forms }, pronouns?: string): string {
    const who = ({ she: 'woman', he: 'man', they: 'neither' } as const)[pronouns as 'she' | 'he' | 'they'];
    return (who && b.forms?.[who]) ?? b.name;
  }
  static compile(orsino: Record<string, OrsinoBackground>, tables: BackgroundTables,
    has: (item: string) => boolean, more: { kyr?: Record<string, KyrProfession>; forms?: Record<string, Forms> } = {}):
    Record<string, CompiledBackground> {
    const { kyr = {}, forms = {} } = more;
    const kinds = this.kinds(orsino, tables);
    const overlays = tables.backgroundOverlay.groups;
    for (const id of Object.keys(overlays).filter(id => !kinds.has(id))) { throw new Error(`Overlay for unknown background ${id}`); }
    const compiled = Object.fromEntries(Object.entries(orsino).map(([id, row]) => {
      const { kind, index } = kinds.get(id)!, meaning = tables.backgroundKindMeaning.groups[kind]!;
      return [id, this.one(id, row, { kind, index, meaning, change: overlays[id] ?? {} }, has)];
    }));
    const all = { ...compiled, ...this.professions(kyr, tables, compiled, has) };
    for (const id of Object.keys(forms).filter(id => !all[id])) { throw new Error(`Forms for unknown background ${id}`); }
    return Object.fromEntries(Object.entries(all).map(([id, b]) => [id, forms[id] ? { ...b, forms: forms[id] } : b]));
  }
  // The portraits' professions, each after its kind's Orsino rows: what its kind means, as an Orsino row of the kind
  // would have it, and the likeness it was drawn from.
  private static professions(kyr: Record<string, KyrProfession>, tables: BackgroundTables,
    orsino: Record<string, CompiledBackground>, has: (item: string) => boolean): Record<string, CompiledBackground> {
    const at = new Map<string, number>();
    return Object.fromEntries(Object.entries(kyr).map(([id, p]) => {
      if (orsino[id]) { throw new Error(`Profession ${id} is already Orsino's`); }
      const meaning = tables.backgroundKindMeaning.groups[p.kind];
      if (!meaning) { throw new Error(`Profession ${id} is of no kind: ${p.kind}`); }
      const index = (tables.backgroundKind.groups[p.kind]?.length ?? 0) + (at.get(p.kind) ?? 0);
      at.set(p.kind, (at.get(p.kind) ?? 0) + 1);
      const one = this.one(id, { attributes: p.attributes, gold: p.gold, source: { orsino: '' } },
        { kind: p.kind, index, meaning, change: { name: p.name } }, has);
      return [id, { ...one, painting: p.painting, source: { kyr: true as const, notes: p.source.notes } }];
    }));
  }
  // Every Orsino background in exactly one kind, with its place in the kind's list.
  private static kinds(orsino: Record<string, OrsinoBackground>, tables: BackgroundTables) {
    const kinds = new Map<string, { kind: string; index: number }>();
    for (const [kind, ids] of Object.entries(tables.backgroundKind.groups)) {
      if (!tables.backgroundKindMeaning.groups[kind]) { throw new Error(`Background kind ${kind} has no meaning`); }
      ids.forEach((id, index) => {
        if (kinds.has(id)) { throw new Error(`Background ${id} is of two kinds`); }
        if (!orsino[id]) { throw new Error(`Background ${id} is not one of Orsino's`); }
        kinds.set(id, { kind, index });
      });
    }
    const loose = Object.keys(orsino).filter(id => !kinds.has(id));
    if (loose.length) { throw new Error(`Backgrounds of no kind: ${loose.join(', ')}`); }
    return kinds;
  }
  private static one(id: string, row: OrsinoBackground,
    at: { kind: string; index: number; meaning: KindMeaning; change: BackgroundChange },
    has: (item: string) => boolean): CompiledBackground {
    const { kind, index, meaning, change } = at, use = change.use ?? 'background';
    const carried = (row.gear ?? []).filter(has), lacking = (row.gear ?? []).filter(g => !has(g));
    // A profession is what someone does for a living where they are: it brings no kit and no old friend.
    const gear = change.gear ?? (use === 'profession' ? [] : [...new Set([...meaning.gear ?? [], ...carried])]);
    const own = change.skills ?? meaning.skills ?? [], toned = this.toned(row.attributes);
    const skills = [...new Set([...own, ...toned.skilled])];
    const channel = change.channel ?? meaning.channel, lines = meaning.contacts ?? [];
    const text = change.contact ?? lines[index % Math.max(1, lines.length)];
    const contact = use === 'background' && channel && text ? { channel, text } : undefined;
    const added = [own.length ? own.join(' and ') : '', gear.filter(g => !carried.includes(g)).join(', '),
      contact ? `an old acquaintance ${this.where[channel!]}` : '',
      change.offers ? 'what the profession offers' : ''].filter(Boolean);
    const halved = Object.keys(row.attributes).some(k => toned.attributes[k] !== row.attributes[k]);
    const scores = halved ? `, at most ${this.most} to a score in Kyr, with ${toned.skilled.join(' and ')} for the rest` : '';
    return { name: change.name ?? this.title(id), use, kind, attributes: toned.attributes, gold: row.gold,
      ...row.requiredClass ? { requiredClass: row.requiredClass } : {}, ...skills.length ? { skills } : {},
      ...gear.length ? { gear } : {}, ...change.offers ? { offers: change.offers } : {},
      ...change.routine ? { routine: change.routine } : {}, ...contact ? { contact } : {},
      ...lacking.length ? { omits: Object.fromEntries(lacking.map(g => [`gear:${g}`, 'Kyr has no such item.'])) } : {},
      source: { orsino: row.source.orsino, fidelity: added.length || halved ? 'adapted' : 'faithful',
        notes: `Orsino gives scores and gold${scores}`
          + `${added.length ? `; Kyr adds ${added.join('; ')} (${meaning.name.toLowerCase()})` : ''}.` } };
  }
  // Orsino's scores, the largest toned down: no background adds more than three to a score, and one that would brings
  // that score's skill instead (M17-54: a trader's +4 charisma beside a bard's own made a first-level bard +6 to talk
  // anyone round; the owner would have no cap on a quality, but a skill where the number was).
  static readonly most = 3;
  static readonly skilled: Record<string, string> = { strength: 'brawn', constitution: 'brawn', dexterity: 'stealth',
    intelligence: 'lore', wisdom: 'insight', charisma: 'persuasion' };
  static toned(scores: Record<string, number>): { attributes: Record<string, number>; skilled: string[] } {
    const attributes = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.min(v, this.most)]));
    const skilled = Object.entries(scores).filter(([, v]) => v > this.most).map(([k]) => this.skilled[k])
      .filter((x): x is string => !!x);
    return { attributes, skilled: [...new Set(skilled)] };
  }
  static readonly where: Record<Channel, string> = { road: 'on the road', tavern: 'at an inn', temple: 'at a shrine',
    market: 'at a market' };
  static title(id: string): string {
    const words = id.split('_').join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}
