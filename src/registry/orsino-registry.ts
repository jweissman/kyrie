import support from '../../data/sources/orsino/kyr-support.json';
import type { RegistryEntry, RegistrySnapshot } from './orsino-extract';

export type Judgement = 'faithful' | 'adapted' | 'cosmetic' | 'unsupported';
export type Support = 'catalogued' | 'represented' | 'executable' | 'play-validated';
export interface AdaptationRecord {
  orsino: string; kyr: string[]; support: Exclude<Support, 'catalogued'>; fidelity: 'faithful' | 'adapted';
  note: string; omits?: Record<string, string>; adapts?: Record<string, string>; adds?: string[]; evidence?: string[];
  // Derived from the generated catalog rather than written (see CatalogLedger).
  generated?: true;
}
export interface Ledger { about?: string; records: AdaptationRecord[] }

// The canonical Orsino registry: every catalogued source definition, Kyr's judgement of the rule features each one
// relies on, and the adaptation records that say which Kyr definitions represent it and how far.
export class OrsinoRegistry {
  static readonly levels: Support[] = ['catalogued', 'represented', 'executable', 'play-validated'];
  static readonly mechanical = new Set(['character', 'magic', 'condition', 'equipment', 'creature']);
  private readonly byId: Map<string, RegistryEntry>;
  private readonly records = new Map<string, AdaptationRecord[]>();
  constructor(readonly snapshot: RegistrySnapshot, readonly ledger: Ledger) {
    this.byId = new Map(snapshot.entries.map(e => [e.id, e]));
    for (const r of ledger.records) {
      (this.records.get(r.orsino) ?? this.records.set(r.orsino, []).get(r.orsino)!).push(r);
    }
  }
  entry(id: string): RegistryEntry {
    const e = this.byId.get(id);
    if (!e) { throw new Error(`Unknown Orsino registry entry ${id}`); }
    return e;
  }
  has(id: string): boolean { return this.byId.has(id); }
  adaptations(id: string): AdaptationRecord[] { return this.records.get(id) ?? []; }
  static judge(feature: string): { judgement: Judgement; note: string } {
    const table = support.features as unknown as Record<string, [string, string]>;
    const exact = table[feature];
    if (exact) { return { judgement: exact[0] as Judgement, note: exact[1] }; }
    const prefix = Object.keys(table).filter(k => k.endsWith('*') && feature.startsWith(k.slice(0, -1)))
      .sort((a, b) => b.length - a.length)[0];
    return prefix ? { judgement: table[prefix]![0] as Judgement, note: table[prefix]![1] }
      : { judgement: 'unsupported', note: '' };
  }
  blockers(entry: RegistryEntry): string[] {
    return entry.features.filter(f => OrsinoRegistry.judge(f).judgement === 'unsupported');
  }
  status(id: string): Support {
    const best = Math.max(0, ...this.adaptations(id).map(r => OrsinoRegistry.levels.indexOf(r.support)));
    return OrsinoRegistry.levels[best]!;
  }
  coverage() {
    const rows = new Map<string, { concept: string; total: number; feasible: number } & Record<Support, number>>();
    for (const e of this.snapshot.entries) {
      const row = rows.get(e.family) ?? rows.set(e.family, { concept: e.concept, total: 0, feasible: 0,
        catalogued: 0, represented: 0, executable: 0, 'play-validated': 0 }).get(e.family)!;
      row.total++;
      row[this.status(e.id)]++;
      if (!this.blockers(e).length) { row.feasible++; }
    }
    return [...rows].map(([family, row]) => ({ family, ...row }));
  }
  gaps() {
    const gaps = new Map<string, { entries: number; sole: number; families: Set<string> }>();
    for (const e of this.snapshot.entries.filter(x => OrsinoRegistry.mechanical.has(x.concept))) {
      const blockers = [...new Set(this.blockers(e).map(f => f.replace(/\.(str|dex|con|int|wis|cha)$/, '.attributes')))];
      for (const f of blockers) {
        const g = gaps.get(f) ?? gaps.set(f, { entries: 0, sole: 0, families: new Set() }).get(f)!;
        g.entries++;
        if (blockers.length === 1) { g.sole++; }
        g.families.add(e.family);
      }
    }
    return [...gaps].map(([feature, g]) =>
      ({ feature, entries: g.entries, sole: g.sole, families: [...g.families].sort() }))
      .sort((a, b) => b.entries - a.entries || a.feature.localeCompare(b.feature));
  }
  // Ledger rules that can be checked without loading Kyr catalogs.
  problems(): string[] {
    const problems: string[] = [];
    for (const r of this.ledger.records) {
      const where = `${r.orsino} -> ${r.kyr.join(', ')}`;
      if (!this.has(r.orsino)) { problems.push(`${where}: unknown registry entry`); continue; }
      // The translator and the feature judgements must agree: an entry translated as executable relies on no
      // feature judged unsupported.
      if (r.generated) {
        const omitted = Object.keys(r.omits ?? {});
        for (const f of r.support === 'executable' ? this.blockers(this.entry(r.orsino)).filter(b => !omitted.includes(b)) : []) {
          problems.push(`${where}: translated as executable, but ${f} is judged unsupported`);
        }
        continue;
      }
      if (!OrsinoRegistry.levels.slice(1).includes(r.support)) { problems.push(`${where}: unknown support ${r.support}`); }
      const entry = this.entry(r.orsino);
      const declared = { ...r.omits, ...r.adapts };
      for (const f of Object.keys(declared)) {
        if (!entry.features.includes(f)) { problems.push(`${where}: ${f} is not a feature of the source`); }
      }
      for (const f of this.blockers(entry).filter(b => !(b in declared))) {
        problems.push(`${where}: unsupported feature ${f} is neither adapted nor declared omitted`);
      }
      if (r.support !== 'represented' && Object.keys(r.omits ?? {}).length) {
        problems.push(`${where}: an executable adaptation cannot omit source mechanics; it is only represented`);
      }
      if (r.fidelity === 'faithful' && Object.keys(r.omits ?? {}).length) {
        problems.push(`${where}: a faithful adaptation cannot omit source features`);
      }
      if (r.support === 'play-validated' && !r.evidence?.length) { problems.push(`${where}: play validation needs evidence`); }
    }
    return problems;
  }
}
