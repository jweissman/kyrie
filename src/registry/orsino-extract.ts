import { OrsinoFamilies, type FamilySpec } from './orsino-families';
import { OrsinoIndex, type RawEntry } from './orsino-index';
import { OrsinoReferences, type Reference } from './orsino-references';
import { OrsinoRules } from './orsino-rules';

export interface OrsinoCorpusFiles {
  revision: string; dirty: boolean;
  json: Record<string, Record<string, unknown>>;
  code: Record<string, string>;
}
export interface RegistryEntry {
  id: string; family: string; key: string; concept: FamilySpec['concept'] | 'rule'; kind?: string;
  source: { file: string; tables?: string[] };
  name?: string; description?: string;
  definition: unknown;
  references: Reference[]; features: string[];
  shadowedBy?: string;
}
export interface RegistrySnapshot {
  format: 1; source: { repository: 'orsino'; revision: string; files: string[] };
  families: Record<string, { concept: string; count: number; files: string[] }>;
  entries: RegistryEntry[];
}

// Builds the catalogued layer: one entry per Orsino source definition, keyed `family:key`, with its raw definition,
// provenance, references and mechanical features. Deterministic for a given corpus.
export class OrsinoExtract {
  private static readonly unanalysed = new Set(['template', 'language', 'surname', 'personalName', 'npcName',
    'companionName', 'eventBark', 'personalityBark', 'npcBark', 'roomDecoration', 'roomNarrative', 'trapRoll',
    'wonderRoll', 'legendaryWonderRoll', 'terrainRoll', 'deityGender', 'deityDraftGender', 'riddleAnswer', 'riddle']);
  // Orsino loads abilities.json, then abilities/*.json in directory order, with Object.assign: later keys win.
  private static readonly loadOrder = ['ability', 'arcaneSpell', 'divineSpell'];
  static snapshot(corpus: OrsinoCorpusFiles): RegistrySnapshot {
    if (corpus.dirty) { throw new Error('The Orsino checkout has uncommitted changes to settings or src'); }
    this.coverage(corpus);
    const raw: RawEntry[] = OrsinoFamilies.specs.flatMap(spec => this.entries(spec, corpus));
    raw.push(...OrsinoRules.extract(corpus.code).map(r => ({ family: `rule.${r.family}`, key: r.key,
      concept: 'rule', source: { file: r.file }, definition: r.definition })));
    const index = new OrsinoIndex(raw);
    const entries = raw.map(e => this.analysed(e, index)).sort((a, b) => a.id.localeCompare(b.id));
    if (new Set(entries.map(e => e.id)).size !== entries.length) { throw new Error('Duplicate registry identifier'); }
    for (const e of entries) {
      const later = this.loadOrder.slice(this.loadOrder.indexOf(e.family) + 1)
        .find(f => this.loadOrder.includes(e.family) && index.has(f, e.key));
      if (later) { e.shadowedBy = `${later}:${e.key}`; }
    }
    const families: RegistrySnapshot['families'] = {};
    for (const e of entries) {
      const f = families[e.family] ??= { concept: e.concept, count: 0, files: [] };
      f.count++;
      if (!f.files.includes(e.source.file)) { f.files.push(e.source.file); }
    }
    return { format: 1, source: { repository: 'orsino', revision: corpus.revision,
      files: [...Object.keys(corpus.json), ...Object.keys(corpus.code)] }, families, entries };
  }
  private static analysed(e: RawEntry, index: OrsinoIndex): RegistryEntry {
    const analysed = this.unanalysed.has(e.family) || e.concept === 'rule' ? { references: [], features: [] }
      : OrsinoReferences.analyse(e.definition, index, e.source.tables && e.source.tables.length > 1
        ? e.source.tables : undefined);
    const fields = ['character', 'creature'].includes(e.concept) && e.family !== 'trait'
      || ['weapon', 'armor', 'gear', 'consumable', 'equipment'].includes(e.family)
      ? OrsinoReferences.fieldFeatures(e.definition, e.source.tables, e.family) : [];
    const weapon = e.family === 'weapon' ? e.definition as Record<string, unknown> : undefined;
    const features = [...new Set([...analysed.features, ...fields,
      ...weapon ? OrsinoReferences.weaponFeatures(weapon) : []])].sort();
    const references = weapon ? [...analysed.references, OrsinoReferences.weaponReference(weapon, index)]
      : analysed.references;
    return { id: `${e.family}:${e.key}`, ...e, concept: e.concept as RegistryEntry['concept'],
      ...this.label(e.definition), references, features };
  }
  private static entries(spec: FamilySpec, corpus: OrsinoCorpusFiles): RawEntry[] {
    const file = corpus.json[spec.file];
    if (!file) { throw new Error(`Missing Orsino file ${spec.file}`); }
    if (spec.root) {
      return Object.entries(file).map(([key, definition]) => ({ family: spec.family, key, concept: spec.concept,
        ...(spec.subtype && (definition as Record<string, unknown>)[spec.subtype]
          ? { kind: String((definition as Record<string, unknown>)[spec.subtype]) } : {}),
        source: { file: spec.file }, definition }));
    }
    const tables = spec.tables!.map(t => {
      const table = file[t] as { groups?: Record<string, unknown> } | undefined;
      if (!table?.groups) { throw new Error(`Missing Orsino table ${spec.file}:${t}`); }
      return [t, table.groups] as const;
    });
    const keys = [...new Set(tables.flatMap(([, groups]) => Object.keys(groups)))];
    return keys.map(key => {
      const present = tables.filter(([, groups]) => Object.hasOwn(groups, key));
      const definition = tables.length === 1 ? tables[0]![1][key]
        : Object.fromEntries(present.map(([t, groups]) => [t, groups[key]]));
      return { family: spec.family, key, concept: spec.concept,
        source: { file: spec.file, tables: present.map(([t]) => t) }, definition };
    });
  }
  private static label(definition: unknown): { name?: string; description?: string } {
    if (typeof definition === 'string') { return { description: definition }; }
    if (!definition || typeof definition !== 'object' || Array.isArray(definition)) { return {}; }
    const d = definition as Record<string, unknown>;
    const nested = Object.values(d).find(v => typeof v === 'string' && v.length > 40);
    return { ...(typeof d.name === 'string' ? { name: d.name } : {}),
      ...(typeof d.description === 'string' ? { description: d.description }
        : typeof nested === 'string' ? { description: nested } : {}) };
  }
  static coverage(corpus: OrsinoCorpusFiles) {
    for (const [path, file] of Object.entries(corpus.json)) {
      const specs = OrsinoFamilies.specs.filter(s => s.file === path);
      if (specs.some(s => s.root)) { continue; }
      const covered = new Set(specs.flatMap(s => s.tables ?? []));
      const missing = Object.keys(file).filter(t => !covered.has(t));
      if (missing.length) { throw new Error(`Orsino tables without a registry family: ${path}: ${missing.join(', ')}`); }
    }
  }
}
