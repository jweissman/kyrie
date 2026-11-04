import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ModuleParser } from '../lang/module-parser';
import type { Entity } from '../lang/module';
import type { Handbooks } from './handbooks';
import type { Book, Entry, Section, Status } from './model';

export interface Chapter { id: string; title: string; lede: string[]; sections: Section[] }
// A land an adventure lies in, as its own folk and its neighbours speak of it (countries.json): never what is found
// there.
export interface Where { chapter: string; title: string; kind?: string }
// A plane of the canon (data/imbar), as one who came to its threshold would see it.
export interface Plane { id: string; name: string; kind: string; seen?: string }
export interface Land { id: string; name: string; heard: string; terrain?: string; skyline?: string }

// The Encyclopedia of Imbar (Mission 19, Priority Eight): the reader's sourcebook, opened from the title, made from
// the same entries as the authors' handbooks so that what it says a spell or a creature does is what the game does
// with it. Only what the game plays is in it (a definition the game never offers is the handbooks' business, with how
// far each is played and where it came from); no company formations (a protagonist begins alone); and of the lands
// the adventures lie in, only what is said of them, not what is found. The character's journal is the other book:
// what one protagonist knows and has undertaken.
export class Encyclopedia {
  static readonly played = new Set<Status>(['faithful', 'adapted', 'represented', 'kyr']);
  // Words that belong to the making of the game, not to Imbar: an intro saying them is the handbooks', not this.
  static readonly making =
    /\b(Orsino|Kyr|catalog|definitions?|module|engine|status|this book|Handbook|Guide|Manual)\b/i;
  readonly chapters: Chapter[];
  constructor(handbooks: Handbooks, lands: Land[], planes: Plane[] = []) {
    const phb = handbooks.books.find(b => b.id === 'phb')!, mm = handbooks.books.find(b => b.id === 'mm')!;
    this.chapters = [
      { id: 'peoples', title: 'Peoples', sections: Encyclopedia.take(phb, ['ancestries']), lede: [
        'Who lives in Imbar, and what each people is like to be born among: what they are good at, what they are slow '
        + 'to, and which lives they most often take up.'] },
      { id: 'lives', title: 'Callings and lives', sections: Encyclopedia.take(phb, ['callings', 'backgrounds', 'skills', 'traits', 'feats',
        'advancement']), lede: ['What a person does with a life: the calling they are trained to, what they did before '
          + 'they set out, what they know how to do, and what comes to them as they go on.'] },
      { id: 'magic', title: 'Magic and prayer', sections: Encyclopedia.take(phb, ['magic', 'techniques']), lede: [
        'The spells learnt by study and the prayers granted by the gods, level by level, and the techniques of those '
        + 'who fight without them. Each says what it does when it is used.'] },
      { id: 'arms', title: 'Arms, gear and treasure', sections: Encyclopedia.take(phb, ['equipment']), lede: [
        'What can be carried, bought and sold: weapons and armour, the gear an expedition lives by, and the things '
        + 'worth bringing back.'] },
      { id: 'creatures', title: 'Creatures', sections: mm.sections, lede: [
        'The beasts, monsters and strange folk of Imbar: what each is, how it fights, and what it is born with.'] },
      { id: 'conditions', title: 'Conditions', sections: Encyclopedia.take(phb, ['conditions']), lede: [
        'What can come over a body in a fight or after it: wounds, poisons, curses, blessings, and how long each lasts.'] },
      { id: 'planes', title: 'Imbar and the planes', sections: [Encyclopedia.planes(planes)], lede: [
        'Imbar is the world under the sky; beyond it lie the planes, inner and outer, each with a threshold where doors '
        + 'from elsewhere open. What is seen there is all that most travellers ever tell of them.'] },
      { id: 'lands', title: 'Lands of rumour', sections: [Encyclopedia.lands(lands)], lede: [
        'Countries spoken of in the inns of Imbar, as the people who live near them tell it. What is true of them is '
        + 'for whoever goes.'] },
    ].map(c => ({ ...c, sections: c.sections.flatMap(s => Encyclopedia.kept(s) ?? []) }))
      .filter(c => c.sections.length);
  }
  private static take(book: Book, ids: string[]): Section[] {
    return ids.flatMap(id => this.find(book.sections, id) ?? []);
  }
  private static find(sections: Section[], id: string): Section | undefined {
    for (const s of sections) {
      if (s.id === id) { return s; }
      const found = this.find(s.sections ?? [], id);
      if (found) { return found; }
    }
    return undefined;
  }
  // A section as the reader sees it: only what is played, nothing of how it was made; none, when nothing is left.
  static kept(s: Section): Section | undefined {
    if (this.making.test(s.title)) { return undefined; }
    const entries = (s.entries ?? []).filter(e => this.played.has(e.status)).map(e => this.entry(e));
    const t = s.table, rows = t ? t.rows.map((r, i) => [r, t.statuses?.[i], t.ids?.[i]] as const)
      .filter(([, st]) => !st || this.played.has(st)) : [];
    // Nor a column of how far each is played, or where it came from.
    const cols = t ? t.head.map((h, i) => [h, i] as const).filter(([h]) => !/status|source|fidelity/i.test(h)
      && !this.making.test(h)).map(([, i]) => i) : [];
    const table = t && rows.length ? { head: cols.map(i => t.head[i]!), rows: rows.map(([r]) => cols.map(i => r[i] ?? '')),
      ...t.ids ? { ids: rows.map(([, , id]) => id!) } : {} } : undefined;
    const sections = (s.sections ?? []).flatMap(x => this.kept(x) ?? []);
    const intro = (s.intro ?? []).filter(p => !this.making.test(p));
    if (!entries.length && !table && !sections.length) { return undefined; }
    return { id: s.id, title: s.title, ...intro.length ? { intro } : {}, ...entries.length ? { entries } : {},
      ...table ? { table } : {}, ...sections.length ? { sections } : {} };
  }
  // An entry without the making of it: its notes (why it was adapted) are the handbooks'.
  private static entry(e: Entry): Entry {
    return { id: e.id, title: e.title, status: e.status, ...e.kind ? { kind: e.kind } : {},
      ...e.facts?.length ? { facts: e.facts } : {}, ...e.rules?.length ? { rules: e.rules } : {},
      ...e.text?.length ? { text: e.text.filter(p => !this.making.test(p)) } : {}, ...e.refs ? { refs: e.refs } : {} };
  }
  private static planes(planes: Plane[]): Section {
    return { id: 'planes-all', title: 'The planes', entries: planes.map(p => ({ id: `plane:${p.id}`, title: p.name
      .replace(/^the /, m => m.toUpperCase().slice(0, 1) + m.slice(1)), status: 'kyr' as const, kind: p.kind,
      ...p.seen ? { text: [p.seen] } : {} })) };
  }
  private static lands(lands: Land[]): Section {
    return { id: 'lands-heard', title: 'What is said of them', entries: lands.map(l => ({ id: `land:${l.id}`,
      title: l.name, status: 'kyr' as const, ...l.terrain ? { kind: `${l.terrain} country` } : {},
      text: [l.heard], ...l.skyline ? { facts: [['Seen from afar', l.skyline]] as [string, string][] } : {} })) };
  }
  // The planes of Imbar's canon, read by the Kyr parser (never by matching its text): each plane, whether it is the
  // world, an inner plane or an outer one (by the file it is written in), and what is seen at its threshold.
  static canon(root: string): Plane[] {
    return [['planes.kyr', 'an inner plane'], ['outer.kyr', 'an outer plane']].flatMap(([file, kind]) => {
      const m = ModuleParser.parse(readFileSync(join(root, 'data/imbar', file!), 'utf8'));
      const byId = new Map(m.entities.map(e => [e.id, e]));
      const seen = new Map((m.observations ?? []).flatMap(o => {
        const p = Encyclopedia.planeOf(byId, o.place);
        return p ? [[p, o.text] as const] : [];
      }));
      return m.entities.filter(e => e.space?.kind === 'plane').map(e => ({ id: e.id, name: e.name,
        kind: e.id === 'imbar' ? 'the material world' : kind!, ...seen.has(e.id) ? { seen: seen.get(e.id)! } : {} }));
    });
  }
  private static planeOf(byId: Map<string, Entity>, id: string): string | undefined {
    for (let e = byId.get(id); e; e = e.space?.parent ? byId.get(e.space.parent) : undefined) {
      if (e.space?.kind === 'plane') { return e.id; }
    }
    return undefined;
  }
  // Every entry, for the search across the whole book and for cross-references: the chapter it is in.
  where(): Map<string, Where> {
    const out = new Map<string, Where>();
    for (const c of this.chapters) { Encyclopedia.walk(c.id, c.sections, out); }
    return out;
  }
  private static walk(chapter: string, sections: Section[], out: Map<string, Where>) {
    for (const s of sections) {
      for (const e of s.entries ?? []) {
        if (!out.has(e.id)) { out.set(e.id, { chapter, title: e.title, ...e.kind ? { kind: e.kind } : {} }); }
      }
      (s.table?.ids ?? []).forEach((id, i) => {
        if (!out.has(id)) { out.set(id, { chapter, title: s.table!.rows[i]![0]! }); }
      });
      this.walk(chapter, s.sections ?? [], out);
    }
  }
}
