import type { OrsinoRegistry } from '../registry/orsino-registry';
import type { RegistryEntry } from '../registry/orsino-extract';
import type { Entry, Section, Status } from './model';
import { HandbookText } from './text';

export type Definition = Record<string, unknown>;
export type Facts = (d: Definition) => [string, string][];

// Orsino's own definitions, for the families Kyr has not taken in whole. Each entry says how far Kyr holds it: in
// Orsino's data only, represented by a Kyr definition that does not carry all of it, or executed.
export class OrsinoAppendix {
  constructor(readonly registry: OrsinoRegistry) {}
  status(id: string): Status {
    const records = this.registry.adaptations(id);
    const support = this.registry.status(id);
    if (support === 'catalogued') { return 'data-only'; }
    if (support === 'represented') { return 'represented'; }
    return records.some(r => r.fidelity === 'adapted') ? 'adapted' : 'faithful';
  }
  entries(family: string): RegistryEntry[] {
    return this.registry.snapshot.entries.filter(e => e.family === family).sort((a, b) => a.key.localeCompare(b.key));
  }
  entry(e: RegistryEntry, facts: Facts): Entry {
    const records = this.registry.adaptations(e.id), d = e.definition as Definition;
    return { id: `orsino:${e.id}`, title: OrsinoAppendix.title(e), status: this.status(e.id), kind: e.family,
      facts: facts(d), text: OrsinoAppendix.text(d),
      notes: records.flatMap(r => [r.note, ...Object.values(r.omits ?? {}).map(o => `Left out: ${o}`)])
        .filter((n, i, all) => n && all.indexOf(n) === i),
      refs: records.flatMap(r => r.kyr) };
  }
  family(family: string, title: string, facts: Facts): Section {
    const entries = this.entries(family).map(e => this.entry(e, facts));
    const held = entries.filter(e => e.status !== 'data-only').length;
    return { id: `orsino-${family}`, title, intro: [`${entries.length} in Orsino; ${held} held by Kyr.`], entries };
  }
  // A whole family as one table, for families too many and too alike to read as entries.
  table(family: string, title: string, columns: [string, (d: Definition) => string][]): Section {
    const entries = this.entries(family);
    const held = entries.filter(e => this.status(e.id) !== 'data-only').length;
    return { id: `orsino-${family}`, title, intro: [`${entries.length} in Orsino; ${held} held by Kyr.`],
      table: { head: ['Name', ...columns.map(([h]) => h), 'In Kyr'], rows: entries.map(e => [OrsinoAppendix.title(e),
        ...columns.map(([, f]) => f(e.definition as Definition)), OrsinoAppendix.label(this.status(e.id))]),
      ids: entries.map(e => `orsino:${e.id}`), statuses: entries.map(e => this.status(e.id)) } };
  }
  static title(e: RegistryEntry): string {
    const name = (e.definition as Definition).name;
    return typeof name === 'string' ? name : HandbookText.capital(e.key.replace(/_/g, ' '));
  }
  // Orsino keeps a definition's description under a few names.
  static text(d: Definition): string[] {
    const t = d.description ?? d.planeDescriptions ?? d.raceDescriptions;
    return typeof t === 'string' ? [HandbookText.capital(t)] : [];
  }
  static label(s: Status): string { return s === 'data-only' ? '—' : s; }
  // Orsino definitions keep a few shapes: stat lines, lists of ids, nested effects. Said plainly, briefly.
  static scores(d: Definition): string {
    return ['hp', 'str', 'dex', 'con', 'int', 'wis', 'cha'].filter(k => typeof d[k] === 'number')
      .map(k => `${k} ${(d[k] as number) > 0 && k !== 'hp' ? '+' : ''}${d[k] as number}`).join(', ');
  }
  static list(v: unknown): string {
    const flat = (Array.isArray(v) ? v.flat(2) : v === undefined ? [] : [v]) as unknown[];
    return flat.map(x => typeof x === 'string' ? x.replace(/_/g, ' ') : JSON.stringify(x)).join(', ');
  }
  static effects(v: unknown): string {
    if (v === undefined) { return ''; }
    return (Array.isArray(v) ? v.flat(2) : [v]).map(x => this.effect(x as Definition)).join('; ');
  }
  static effect(e: Definition): string {
    if (typeof e !== 'object' || !e) { return String(e); }
    return Object.entries(e).map(([k, v]) => `${k} ${typeof v === 'object' ? JSON.stringify(v) : String(v)}`).join(' ');
  }
}
