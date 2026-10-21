import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { OrsinoRegistry, type Ledger } from '../registry/orsino-registry';
import { CatalogLedger } from '../registry/catalog-ledger';
import type { RegistrySnapshot } from '../registry/orsino-extract';
import { Statuses, type Book, type Entry, type Problem, type Section, type Status } from './model';
import { OrsinoAppendix } from './orsino-appendix';
import { PlayersHandbook } from './phb';
import { MonsterManual } from './mm';
import { DungeonMastersGuide } from './dmg';

export interface Placed { id: string; title: string; status: Status; book: Book['id']; section: string }
export interface Coverage {
  orsino: { revision: string; families: ReturnType<OrsinoRegistry['coverage']> };
  books: Record<Book['id'], { title: string; counts: Record<Status, number>;
    sections: { id: string; title: string; counts: Record<Status, number> }[] }>;
  entries: Placed[]; problems: Problem[];
}

// The three books, built together from the catalogs, the rules and Orsino's registry, with what building them found
// wrong and a machine-readable account of every entry's status.
export class Handbooks {
  static readonly linked = new Set(['ability', 'species', 'class', 'ancestry', 'trait', 'item', 'condition', 'skill']);
  readonly books: Book[];
  readonly problems: Problem[] = [];
  readonly registry: OrsinoRegistry;
  constructor(readonly root: string) {
    this.registry = new OrsinoRegistry(Handbooks.read(root, 'data/sources/orsino/registry.json') as RegistrySnapshot,
      CatalogLedger.combined(Handbooks.read(root, 'data/sources/orsino/adaptations.json') as Ledger));
    const appendix = new OrsinoAppendix(this.registry), mm = new MonsterManual(appendix);
    this.books = [new PlayersHandbook(appendix).book(), new DungeonMastersGuide(appendix, root).book(), mm.book()];
    this.problems.push(...mm.problems, ...this.audit());
  }
  static read(root: string, path: string): unknown { return JSON.parse(readFileSync(join(root, path), 'utf8')); }
  static entries(sections: Section[], book: Book['id'], path = ''): Placed[] {
    return sections.flatMap(s => {
      const here = path ? `${path}/${s.id}` : s.id;
      return [...this.own(s).map(e => ({ id: e.id, title: e.title, status: e.status, book, section: here })),
        ...this.entries(s.sections ?? [], book, here)];
    });
  }
  // A section's entries, and the rows of its table when they stand for entries.
  static own(s: Section): Entry[] {
    const t = s.table;
    const rows = t?.ids && t.statuses
      ? t.ids.map((id, i) => ({ id, title: t.rows[i]![0]!, status: t.statuses![i]! })) : [];
    return [...s.entries ?? [], ...rows];
  }
  placed(): Placed[] { return this.books.flatMap(b => Handbooks.entries(b.sections, b.id)); }
  // Where each entry is, for cross-references: the first book that has it.
  index(): Map<string, Placed> {
    const index = new Map<string, Placed>();
    for (const p of this.placed()) { if (!index.has(p.id)) { index.set(p.id, p); } }
    return index;
  }
  audit(): Problem[] {
    const index = this.index(), problems: Problem[] = [];
    for (const book of this.books) {
      for (const e of Handbooks.all(book.sections)) {
        if (e.status === 'unreachable') { problems.push({ book: book.id, entry: e.id, kind: 'unreachable', text: e.notes?.at(-1) ?? '' }); }
        for (const ref of (e.refs ?? []).filter(r => Handbooks.linked.has(r.split(':')[0]!) && !index.has(r))) {
          problems.push({ book: book.id, entry: e.id, kind: 'missing reference', text: `${ref} is in no book.` });
        }
      }
    }
    return problems;
  }
  static all(sections: Section[]): Entry[] {
    return sections.flatMap(s => [...this.own(s), ...this.all(s.sections ?? [])]);
  }
  static counts(entries: { status: Status }[]): Record<Status, number> {
    const counts = Object.fromEntries(Statuses.map(s => [s, 0])) as Record<Status, number>;
    for (const e of entries) { counts[e.status]++; }
    return counts;
  }
  coverage(): Coverage {
    const books = Object.fromEntries(this.books.map(b => [b.id, { title: b.title,
      counts: Handbooks.counts(Handbooks.all(b.sections)),
      sections: b.sections.map(s => ({ id: s.id, title: s.title, counts: Handbooks.counts(Handbooks.all([s])) })) }]));
    return { orsino: { revision: this.registry.snapshot.source.revision, families: this.registry.coverage() },
      books: books as Coverage['books'], entries: this.placed(), problems: this.problems };
  }
}
