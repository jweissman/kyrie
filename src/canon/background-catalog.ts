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
export interface BackgroundTables {
  backgroundKind: Table<string[]>; backgroundKindMeaning: Table<KindMeaning>;
  backgroundOverlay: Table<BackgroundChange>;
}
export interface OrsinoBackground {
  attributes: Record<string, number>; gold: number; requiredClass?: string; gear?: string[]; source: { orsino: string };
}
export type CompiledBackground = Background & { kind: string; omits?: Omissions };

// Backgrounds and professions, compiled from two sources: Orsino's backgroundModifier rows (scores, gold, class,
// gear) and Kyr's Deem tables, which put each background in a kind and say what the kind means. Nothing is copied by
// hand: a background differs from its kind only where an overlay says so.
export class BackgroundCatalog {
  static compile(orsino: Record<string, OrsinoBackground>, tables: BackgroundTables,
    has: (item: string) => boolean): Record<string, CompiledBackground> {
    const kinds = this.kinds(orsino, tables);
    const overlays = tables.backgroundOverlay.groups;
    for (const id of Object.keys(overlays).filter(id => !kinds.has(id))) { throw new Error(`Overlay for unknown background ${id}`); }
    return Object.fromEntries(Object.entries(orsino).map(([id, row]) => {
      const { kind, index } = kinds.get(id)!, meaning = tables.backgroundKindMeaning.groups[kind]!;
      return [id, this.one(id, row, { kind, index, meaning, change: overlays[id] ?? {} }, has)];
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
    const skills = change.skills ?? meaning.skills ?? [];
    const channel = change.channel ?? meaning.channel, lines = meaning.contacts ?? [];
    const text = change.contact ?? lines[index % Math.max(1, lines.length)];
    const contact = use === 'background' && channel && text ? { channel, text } : undefined;
    const added = [skills.length ? skills.join(' and ') : '', gear.filter(g => !carried.includes(g)).join(', '),
      contact ? `an old acquaintance ${this.where[channel!]}` : '',
      change.offers ? 'what the profession offers' : ''].filter(Boolean);
    return { name: change.name ?? this.title(id), use, kind, attributes: row.attributes, gold: row.gold,
      ...row.requiredClass ? { requiredClass: row.requiredClass } : {}, ...skills.length ? { skills } : {},
      ...gear.length ? { gear } : {}, ...change.offers ? { offers: change.offers } : {},
      ...change.routine ? { routine: change.routine } : {}, ...contact ? { contact } : {},
      ...lacking.length ? { omits: Object.fromEntries(lacking.map(g => [`gear:${g}`, 'Kyr has no such item.'])) } : {},
      source: { orsino: row.source.orsino, fidelity: added.length ? 'adapted' : 'faithful',
        notes: added.length ? `Orsino gives scores and gold; Kyr adds ${added.join('; ')} (${meaning.name.toLowerCase()}).`
          : 'Orsino gives scores and gold.' } };
  }
  static readonly where: Record<Channel, string> = { road: 'on the road', tavern: 'at an inn', temple: 'at a shrine',
    market: 'at a market' };
  static title(id: string): string {
    const words = id.split('_').join(' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
  }
}
