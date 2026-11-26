import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { ModuleParser } from '../lang/module-parser';
import { CanonVocabulary } from '../canon/canon-vocabulary';
import { EngineOwned } from '../lang/engine-owned';

// The names an adventure must not give its own relations, measures and queries, and the names its rules and endings
// must not share (AU-35, The Warm Wall's friction: `yields`, `trusts` and `arrivedAt` refused only at lint, a rule
// and an ending both `step_again`): said by `kyrie names` and by verify's names, before lint is run. Canonical: what
// the shared rules (data/rules) declare, and what the engine keeps (EngineOwned). A rule and an ending of one name
// are one rule to the engine (an Ending is lowered to a rule of its id).
export interface Own { kind: string; name: string; file: string }
export class CanonicalNames {
  static readonly rules = resolve(import.meta.dir, '../../data/rules');
  private static cached?: Map<string, string>;
  // Each canonical name, with what declares it ("the shared rules' Relation", "the engine's clock").
  static all(dir = CanonicalNames.rules): Map<string, string> {
    if (dir === CanonicalNames.rules && this.cached) { return this.cached; }
    const names = new Map<string, string>();
    for (const [kind, list] of Object.entries({ clock: EngineOwned.clock, record: EngineOwned.records,
      projection: EngineOwned.projected, holding: EngineOwned.held, knowledge: EngineOwned.knowledge })) {
      for (const n of list) { names.set(n, `the engine's ${kind}`); }
    }
    for (const file of readdirSync(dir).filter(f => f.endsWith('.kyr')).sort()) {
      const m = ModuleParser.parseWithin(CanonVocabulary.context(), readFileSync(join(dir, file), 'utf8'));
      for (const [kind, sigs] of [['Relation', m.relations], ['Measure', m.measures], ['Query', m.queries]] as const) {
        for (const s of sigs) { if (!names.has(s.name)) { names.set(s.name, `the shared rules' ${kind} (${file})`); } }
      }
    }
    if (dir === CanonicalNames.rules) { this.cached = names; }
    return names;
  }
  // What an adventure's own files declare: its relations, measures and queries, and its rules and endings, by file;
  // an origin's, a kit's, and a generation template's (.kyrt) as well, which are bound into the world beside the
  // shared rules as an adventure is (the World agent's origin `claimed`, bound silently to care.kyr's). Each
  // declaration wherever it stands on its line ("Relation a(x). Relation b(y)." had been read for its first alone).
  static own(dir: string): Own[] {
    const out: Own[] = [];
    for (const file of readdirSync(dir).filter(f => /\.kyrt?$/.test(f)).sort()) {
      const text = readFileSync(join(dir, file), 'utf8');
      const declared = /(?:^|[.{])\s*(Relation|Measure|Query)\s+(\w+)\s*\(|^\s*(Rule|Ending)\s+(\w+)\b/gm;
      for (const m of text.matchAll(declared)) {
        out.push({ kind: m[1] ?? m[3]!, name: m[2] ?? m[4]!, file });
      }
    }
    return out;
  }
  // Every shipped directory of Kyr bound into a world beside the shared rules: each adventure, origin and kit, and
  // each folder of generation templates, by its path under data.
  static readonly shipped = ['adventures', 'origins', 'kits', 'generation'];
  static dirs(root = resolve(CanonicalNames.rules, '..')): string[] {
    return CanonicalNames.shipped.flatMap(p => CanonicalNames.walk(join(root, p)));
  }
  private static walk(d: string): string[] {
    return [...readdirSync(d).some(f => /\.kyrt?$/.test(f)) ? [d] : [], ...readdirSync(d, { withFileTypes: true })
      .filter(e => e.isDirectory()).flatMap(e => CanonicalNames.walk(join(d, e.name)))];
  }
  // "Relation yields (q.kyr) is the shared rules' Relation (dominion.kyr): name its own otherwise".
  static shadows(adventure: string, canon = CanonicalNames.all()): string[] {
    return this.own(adventure).filter(o => ['Relation', 'Measure', 'Query'].includes(o.kind) && canon.has(o.name))
      .map(o => `${o.kind} ${o.name} (${o.file}) is ${canon.get(o.name)}: name its own otherwise`);
  }
  // "step_again: a Rule (endings.kyr) and an Ending (endings.kyr), one rule to the engine".
  static doubled(adventure: string): string[] {
    const by = new Map<string, Own[]>();
    for (const o of this.own(adventure).filter(x => x.kind === 'Rule' || x.kind === 'Ending')) {
      by.set(o.name, [...by.get(o.name) ?? [], o]);
    }
    return [...by].filter(([, os]) => os.length > 1)
      .map(([n, os]) => `${n}: ${os.map(o => `a${o.kind === 'Ending' ? 'n' : ''} ${o.kind} (${o.file})`).join(' and ')}, `
        + 'one rule to the engine');
  }
  // What `kyrie names <word>` says of a word besides people and places: a canonical name, or none.
  static said(word: string, canon = CanonicalNames.all()): string | undefined {
    const by = canon.get(word);
    return by ? `${word}: ${by}; not for an adventure's own relation, measure or query` : undefined;
  }
}
