import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { Content } from '../content';
import { WorldAssembler } from '../world/world-assembler';
import { RegionUndertown } from '../world/region-undertown';
import { RegionPeoples } from '../world/region-peoples';
import { RegionKey } from '../world/region-key';
import { KyrTemplates } from '../world/kyr-template';
import type { Region, Settlement } from '../world/region-writer';

// What the Deem workbench draws from (bin/kyrie deem, see DeemWorkbench): the project's Deem templates and tables
// (data/generation/templates, data/generation/tables), its Kyr templates (data/generation/**/*.kyrt), and the world's
// settlements as a player meets them, drawn by Deem, laid, named and peopled (WorldAssembler.region), their home
// town's troubles as the undertown's template draws them. A sample is one generated object, keyed by the seed it was
// drawn under so that it can be drawn again (replay); its fields are what it says, its context what it was drawn in.
export interface Sample { n: number; key: string; group?: string; fields: Record<string, string>;
  context?: Record<string, string> }
type Entry = string | { _key?: string; __weight?: number; [k: string]: unknown };
interface TableDef { discriminator?: string; groups: Record<string, Entry | Entry[]> }
export interface Source { file: string; expression?: string; tables: { table: string; group: string; file?: string;
  entries: string[]; drawn: string[] }[]; after?: string; options?: { option: string; weight: number; line: number;
  drawn: boolean }[] }

export class WorkbenchSources {
  static readonly root = 'data/generation';
  // What the world does to a settlement's fields after Deem draws them (see PlaceNames, RegionPeoples).
  static readonly after: Record<string, string> = {
    name: 'said in the folk\'s tongue, apart from the country\'s other names (src/world/place-names.ts, PlaceNames.render);'
      + ' in the human heartland, in plain Common for what it lies by (src/world/common-names.ts)',
    innkeeper: 'given a people of the town\'s mix and a name of theirs (src/world/region-peoples.ts, RegionPeoples.settle)',
    came: 'peopleCame by the town\'s folk, {majority} the country\'s folkWord (src/world/region-peoples.ts, came)',
    folk: 'the town\'s folk from the country\'s regionPeoples mix (src/world/region-peoples.ts)',
  };
  // The tables the world draws a settlement's own fields from, as Deem's lookups are written.
  static readonly drawn: Record<string, string> = {
    came: 'lookup(peopleCame, #folk) lookup(folkWord, #ancestry)', folk: 'lookup(regionPeoples, #terrain)',
  };
  static files(dir: string, ext: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? this.files(join(dir, e.name), ext)
      : e.name.endsWith(ext) ? [join(dir, e.name)] : []).sort();
  }
  static tables(): Map<string, { file: string; def: TableDef }> {
    return new Map(this.files(join(this.root, 'tables'), '.json').flatMap(file => Object.entries(
      JSON.parse(readFileSync(file, 'utf8')) as Record<string, TableDef>).map(([name, def]) => [name, { file, def }])));
  }
  static templates(): Map<string, { file: string; fields: Record<string, string> }> {
    return new Map(this.files(join(this.root, 'templates'), '.json').flatMap(file => Object.entries(
      JSON.parse(readFileSync(file, 'utf8')) as Record<string, Record<string, string>>)
      .map(([name, fields]) => [name, { file, fields }])));
  }
  static kyrts(): string[] { return this.files(this.root, '.kyrt'); }
  // Each generator the workbench can sample, by name: the world's settlements, every Deem template (deem:<name>) and
  // every Kyr template (kyrt:<path>).
  static generators(): string[] {
    return ['settlement', ...[...this.templates().keys()].map(t => `deem:${t}`),
      ...this.kyrts().map(f => `kyrt:${relative(this.root, f)}`)];
  }
  static sample(generator: string, seed: string, n: number, given: Record<string, string> = {}): Sample[] {
    if (generator === 'settlement') { return this.settlements(seed, n); }
    const [kind, name] = [generator.slice(0, generator.indexOf(':')), generator.slice(generator.indexOf(':') + 1)];
    if (kind === 'deem') { return this.deem(name, seed, n, given); }
    if (kind === 'kyrt') { return this.kyrt(join(this.root, name), seed, n, given); }
    throw new Error(`No generator ${generator}: bin/kyrie deem browse lists them`);
  }
  // The settlements of the first country of a world each, as many worlds as it takes (five or so a country).
  static settlements(seed: string, n: number): Sample[] {
    const out: Sample[] = [];
    for (let i = 0; out.length < n && i < n; i++) {
      const world = `${seed}-${i}`, r = WorldAssembler.region(world, [0, 0]);
      r.settlements.forEach((s, at) => {
        if (out.length >= n) { return; }
        out.push({ n: out.length + 1, key: `${world}/${s.id}`, group: `${world} ${r.name}`,
          fields: this.settlement(r, s, at === 0), context: { terrain: r.terrain, ancestry: r.ancestry,
            folk: s.folk ?? r.ancestry, ...s.feature ? { feature: s.feature } : {},
            ...s.affix ? { affix: s.affix } : {} } });
      });
    }
    return out;
  }
  // What a settlement says: its name and meaning, its trade, its folk, its people, its inn; its home town's troubles.
  static settlement(r: Region, s: Settlement, home: boolean): Record<string, string> {
    const troubles = home ? KyrTemplates.choose(RegionUndertown.template, `${RegionKey.of(r)}:${s.id}:undertown`,
      RegionUndertown.lives(r)).filter(x => x.option !== x.group) : [];
    return { country: `${r.name} (${r.terrain}, ${r.ancestry})`, name: s.name, ...s.gloss ? { meaning: s.gloss } : {},
      size: s.size, trade: s.trade, merchantType: s.merchantType ?? '', folk: s.folk ?? r.ancestry,
      ...s.came ? { came: s.came } : {}, told: RegionPeoples.told(s), inn: s.inn, innkeeper: this.person(r, s, 'innkeeper'),
      priest: this.person(r, s, 'priest'), merchant: this.person(r, s, 'merchant'),
      traveller: this.person(r, s, 'traveller'), calling: s.calling,
      ...Object.fromEntries(troubles.map(x => [`undertown.${x.group}`, x.option])) };
  }
  static person(r: Region, s: Settlement, role: 'innkeeper' | 'priest' | 'merchant' | 'traveller'): string {
    return `${s[role]} (${s.people?.[role] ?? s.folk ?? r.ancestry}, ${s.pronouns?.[role] ?? '?'})`;
  }
  static deem(template: string, seed: string, n: number, given: Record<string, string>): Sample[] {
    return Array.from({ length: n }, (_, i) => {
      const key = `${seed}-${i}`, made = new Content(key).generate(template, given) as Record<string, unknown>;
      return { n: i + 1, key, fields: this.flat(made), context: given };
    });
  }
  static kyrt(file: string, seed: string, n: number, given: Record<string, string>): Sample[] {
    const template = KyrTemplates.parse(readFileSync(file, 'utf8'));
    return Array.from({ length: n }, (_, i) => {
      const key = `${seed}-${i}`, drawn = KyrTemplates.choose(template, key, given).filter(x => x.option !== x.group);
      return { n: i + 1, key, fields: Object.fromEntries(drawn.map(x => [x.group, x.option])), context: given };
    });
  }
  // A generated object's fields as words: a value as it is, a thing by its name, a list by its names.
  static flat(made: Record<string, unknown>): Record<string, string> {
    return Object.fromEntries(Object.entries(made).filter(([k]) => !k.startsWith('_')).map(([k, v]) => [k, this.word(v)]));
  }
  static word(v: unknown): string {
    return v === null || v === undefined ? '' : typeof v !== 'object' ? String(v)
      : Array.isArray(v) ? v.map(x => this.word(x)).join('; ') : String((v as { name?: unknown }).name ?? JSON.stringify(v));
  }
  static quiet(): void { /* Deem's own word of a failed expression, said again by the workbench */ }
  // Whether a Deem template runs alone, and if not, what it wants given (a value its parent gives, or a table).
  static blind(template: string): string {
    // Deem warns of each expression that fails before it throws; the workbench says it once, in its own words.
    const { warn, error } = console;
    console.warn = console.error = this.quiet;
    try { new Content('browse').generate(template, {}); return 'runs alone'; } catch (e) {
      const said = e instanceof Error ? e.message : String(e);
      const wants = /Undefined variable: (\w+)/.exec(said)?.[1], table = /Table not found: (\w+)/.exec(said)?.[1];
      return wants ? `wants #${wants} given (--given ${wants}=…)` : table ? `names a table there is none of: ${table}`
        : `fails: ${said.split('\n')[0]}`;
    } finally { console.warn = warn; console.error = error; }
  }
  // Where a sample's field came from: the template's expression, each table it looks up (the group the sample was
  // drawn in, its entries, which of them the field shows), what the world did to it after; for a Kyr template's
  // group, its options with their weights and lines, the one drawn marked.
  static source(generator: string, sample: Sample, field: string): Source {
    if (generator.startsWith('kyrt:') || field.startsWith('undertown.')) {
      const file = generator.startsWith('kyrt:') ? join(this.root, generator.slice(5))
        : join(this.root, 'town', 'undertown.kyrt');
      return { file, tables: [], options: this.options(file, field.replace(/^undertown\./, ''), sample.fields[field]) };
    }
    const template = this.templates().get(generator.startsWith('deem:') ? generator.slice(5) : 'settlement');
    const base = field === 'priest' || field === 'merchant' || field === 'traveller' ? 'innkeeper' : field;
    // One of the town's people is named as their own people name theirs (the people the field says, in brackets).
    const people = base === 'innkeeper' ? /\((\w+),/.exec(sample.fields[field] ?? '')?.[1] : undefined;
    const expression = template?.fields[base], tables = this.tables(), value = (sample.fields[field] ?? '').toLowerCase();
    // What it looks up, and what the fields it is made of look up (a name is its feature and its affix); or, for what
    // the world adds, the tables it draws from (see drawn).
    const made = [expression ?? '', ...[...(expression ?? '').matchAll(/#(\w+)/g)]
      .map(m => template?.fields[m[1]!] ?? '')].join(' ') || this.drawn[base] || '';
    const looked = [...made.matchAll(/lookup\((\w+),\s*([^)]*)\)/g)].map(m => {
      const group = this.group(m[2]!.trim(), { ...sample.context, ...people ? { ancestry: people } : {} });
      const def = tables.get(m[1]!);
      const entries = def ? [def.def.groups[group] ?? []].flat().map(e => typeof e === 'string' ? e : e._key ?? '') : [];
      return { table: m[1]!, group, file: def?.file, entries,
        drawn: entries.filter(e => e && value.includes(e.toLowerCase())) };
    });
    return { file: template?.file ?? '', expression, tables: looked,
      ...this.after[base] ? { after: this.after[base] } : {} };
  }
  private static group(expr: string, context: Record<string, string>): string {
    if (expr.startsWith('#')) { return context[expr.slice(1)] ?? expr; }
    return /^'(.*)'$/.exec(expr)?.[1] ?? (/#_index == 0/.test(expr) ? 'first or other' : expr);
  }
  private static options(file: string, group: string, chosen?: string): NonNullable<Source['options']> {
    return readFileSync(file, 'utf8').split('\n').flatMap((line, i) => {
      const m = /^---\s+(\w+)\s+(\w+)(?:\s+(\d+))?/.exec(line);
      return m && m[1] === group ? [{ option: m[2]!, weight: Number(m[3] ?? 1), line: i + 1, drawn: m[2] === chosen }]
        : [];
    });
  }
}
