import type { Omissions, Source } from '../canon/schema';

// The three references are views of the game's own definitions. Every entry carries a status that says how far the
// game can actually play it:
//   faithful     Orsino's rule, executed as Orsino has it
//   adapted      Orsino's rule, executed with a deliberate, stated difference
//   represented  Orsino's definition stands behind a Kyr one that does not carry all of it
//   kyr          Kyr's own rule
//   unsupported  defined, but some part of it cannot be executed; the game never offers it
//   unreachable  executable, but nothing in the game can ever use it (a spell no caster reaches)
//   data-only    in Orsino's data, not in Kyr's catalog
export type Status = 'faithful' | 'adapted' | 'represented' | 'kyr' | 'unsupported' | 'unreachable' | 'data-only';
export const Statuses: Status[] = ['faithful', 'adapted', 'represented', 'kyr', 'unsupported', 'unreachable', 'data-only'];

export interface Entry {
  // Stable across builds: family and key ("ability:charge", "species:wolf").
  id: string; title: string; status: Status;
  // A line under the title: what it is, in a few words.
  kind?: string;
  // Labelled facts, shown as a small table: "Hit die: d8".
  facts?: [string, string][];
  // What it does in play, from its mechanics. Never Orsino's prose when that prose describes rules Kyr does not run.
  rules?: string[];
  // Its description: what it is like, not what it does.
  text?: string[];
  // Why it is adapted, unsupported or unreachable.
  notes?: string[];
  // Ids of other entries this one names, for cross-references.
  refs?: string[];
}
// A table may stand for entries too many and too alike to read one by one: ids and statuses then run with its rows.
export interface Table { head: string[]; rows: string[][]; ids?: string[]; statuses?: Status[] }
export interface Section {
  id: string; title: string; intro?: string[]; table?: Table; entries?: Entry[]; sections?: Section[];
}
export interface Book { id: 'phb' | 'dmg' | 'mm'; title: string; intro: string[]; sections: Section[] }
// Something a book found wrong while it was being made: a definition it could not read, a rule it cannot explain.
export interface Problem { book: Book['id']; entry: string; kind: string; text: string }

export class HandbookStatus {
  // A catalog entry's status from what the catalog records about it.
  static of(e: { unsupported?: Omissions; source?: Source }): Status {
    if (e.unsupported && Object.keys(e.unsupported).length) { return 'unsupported'; }
    if (e.source?.kyr || !e.source?.orsino) { return 'kyr'; }
    return e.source.fidelity === 'adapted' ? 'adapted' : 'faithful';
  }
  static notes(e: { unsupported?: Omissions; omits?: Omissions; source?: Source }): string[] {
    return [...Object.entries(e.unsupported ?? {}).map(([k, v]) => `Not playable — ${k}: ${v}`),
      ...Object.entries(e.omits ?? {}).map(([k, v]) => `Left out — ${k}: ${v}`),
      ...e.source?.fidelity === 'adapted' && e.source.notes ? [`Adapted: ${e.source.notes}`] : []];
  }
  static label(s: Status): string {
    return { faithful: 'Faithful', adapted: 'Adapted', represented: 'Represented', kyr: 'Kyr', unsupported: 'Not playable',
      unreachable: 'Unreachable',
      'data-only': 'Orsino data only' }[s];
  }
}
