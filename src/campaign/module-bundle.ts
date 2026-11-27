import type { DeemValue } from 'deem';
import { Costs } from '../costs';
import { RoleRequirements, type RoleContract } from './role-requirements';
import { WorldConstructs } from '../lang/world-constructs';
import { LocalKinds } from '../canon/local-catalog';
import { RandomStreams } from '../random-streams';
import { Content } from '../content';
import { ModuleParser } from '../lang/module-parser';
import { KeptParses } from '../lang/kept-parses';
import type { VocabularyContext, ReadAmong, KindReads } from '../lang';
import { Diagnostics, type SourceFile } from '../lang/diagnostics';
import { ModuleAssembly, type AdventureManifest } from './module-assembly';
import { ModuleNamespace, type ModuleDraft } from './module-namespace';
import type { InstalledModule } from './definition';
import type { BundleSource } from './bundle-source';
import type { Entity, Module } from '../lang/module';
import { Superseded } from '../lang/superseded';
import { Bringing } from '../lang/bringing';
import { ModuleShadow } from './module-shadow';
import { CompiledModules, type Compiled } from './compiled-modules';
import { ModuleSource, type FileSource } from '../lang/module-source';
import { SemanticRecords } from '../lang/semantic-record';
import { ModuleCanon } from './module-canon';
import { FictionalTime } from './fictional-time';
import { Composition, type Composed, type ManifestEntry } from '../world/compose/composition';
import { Routes } from '../lang/routes';
import { ModuleExports, type ExportEntry } from './module-exports';
import { ModuleFiles } from './module-files';
import { ModuleSymbols } from './module-symbols';
// A file read ahead: its text, the kinds it was read among, and what was declared for it as values.
interface Ahead { text: string; kinds: string; declared: FileSource['declared'] }

export interface BundleRequest {
  id: string; bundle: string; imports?: Record<string, string>; context?: Record<string, DeemValue>;
  randomIdentity?: string;
  // Installed into a world already under way, which goes on after it (a country beyond a march): reaching one of its
  // endings closes its chapter, and the world goes on.
  chapter?: boolean;
  // A place the module's own top-level regions are set inside: an adventure installed as a province of the country
  // it is placed in, not as a country of its own (Mission 18's Gate B). Its places then lie in that country, and the
  // map, the sky and the news are that country's.
  within?: string;
}
export interface CampaignManifest {
  version: 1; name: string; modules: BundleRequest[]; party?: import('../content').CreatureGenerationContext[];
  // What the company is being asked to do, shown when it is formed.
  pitch?: { heading: string; text: string };
  // The date it begins on: a day of a month of a year of the Sun and Moon; and the hours of its night, when they are
  // not nine in the evening and six in the morning ("night": { "falls": 17, "lifts": 7 }).
  calendar?: import('./calendar').CalendarStart; night?: import('./fictional-time').Night | 'none';
  // A campaign of a setting of its own, without the canon (data/imbar): see CanonInstall (BX-01); and the word for its
  // money, where it is not coin.
  canon?: false; currency?: string;
  // How the campaign's kits were composed into it, when it asks for any.
  composition?: Composed;
}
// A module manifest: the Kyr source files it consists of, the rule modules it is written against, what it imports
// and exports, and optional DEEM generation. Every region, site, situation and institution is such a module.
export interface BundleManifest {
  roles?: Record<string, RoleContract>;
  version: 1; source: string | string[]; rules: string | string[]; globals?: string[]; imports?: string[];
  // Beside a source file, what a generator declared for it as values (ModuleSource), by the file's name: lowered into
  // its module where it stands, never parsed (AX-04, generated-ir.md).
  ir?: Record<string, string>;
  // Imports a module goes on without, keeping its own: what the country below says of it, in a world kept from before
  // it said so.
  optional?: string[];
  // The ids of the canon (data/imbar) it names: given their declarations from there, and bound to the world's own
  // (see ModuleCanon). A plane named brings its region and threshold; a place, the places it lies within.
  canon?: string[];
  // Each export's entity, or the entity and the part it plays ({ "entity": "held", "role": "fact" }: ModuleExports).
  exports?: Record<string, ExportEntry>;
  generation?: { type: string; context?: Record<string, DeemValue>; tables?: string; templates?: string };
  // Experience for each companion when the module's goal first holds.
  experience?: number;
  // Why a going-on keeps no clock, when it keeps none: it waits on the company, and grows no worse for it (PT-29).
  unclocked?: string;
  // A region's land, for its map (see LandChart): its own ids, which installing it prefixes.
  chart?: import('../lang/module').LandChart;
}
export class ModuleBundle {
  // Rule modules named in a manifest resolve to data/rules; "world" is the standard set every world uses.
  static readonly world = ['core', 'passages', 'people', 'needs', 'services', 'discovery', 'care', 'belongings',
    'dominion', 'probing', 'inhabitants', 'growing', 'making', 'belief', 'ambitions', 'canon'];
  static readonly ruleNames = [...ModuleBundle.world, 'elements', 'devotion'];
  private static strings(v: unknown, min = 0): boolean {
    return typeof v === 'string' || (Array.isArray(v) && v.length >= min && v.every(x => typeof x === 'string'));
  }
  private static check(m: BundleManifest) {
    const strings = ModuleBundle.strings.bind(ModuleBundle);
    const valid = m.version === 1 && strings(m.source, 1) && strings(m.rules, 1)
      && (!m.generation || typeof m.generation.type === 'string')
      && [m.imports, m.globals, m.canon].every(list => list === undefined || Array.isArray(list) && strings(list))
      && ModuleExports.valid(m.exports);
    if (!valid) { throw new Error('Invalid module manifest'); }
  }
  // A campaign's modules, in order; entries that ask for a kit are composed into modules with the campaign's seed.
  static async campaign(path: string, source: BundleSource, vocabulary: VocabularyContext, seed = ''):
    Promise<CampaignManifest> {
    const manifest = JSON.parse(await source.read(path)) as Omit<CampaignManifest, 'modules'> & { modules: ManifestEntry[] };
    if (manifest.version !== 1 || typeof manifest.name !== 'string' || !Array.isArray(manifest.modules)
      || !manifest.modules.length || (manifest.night && !FictionalTime.keeps(manifest.night))) {
      throw new Error('Invalid campaign manifest');
    }
    const entries = manifest.modules.map(m => Composition.isKit(m) ? { ...m, kit: source.resolve(m.kit, path) }
      : { ...m, bundle: source.resolve(m.bundle, path) });
    if (!entries.some(e => Composition.isKit(e))) { return { ...manifest, modules: entries as BundleRequest[] }; }
    const composed = Composition.take(source, path, seed)
      ?? await Costs.timed('kits', () => Composition.expand(entries, { seed, source, vocabulary }));
    return { ...manifest, modules: composed.modules, composition: composed };
  }
  // A story's context with the names of everyone already in the world among those its people are drawn apart from,
  // where it draws them apart at all: by the context it is installed with, or its own (the hobs' captive, named for
  // the world, had been Odo in ash, where a man of the country is: OR-304's draw).
  private static apart(context: BundleRequest['context'], people?: readonly Entity[]): BundleRequest['context'] {
    if (!context || !Array.isArray(context.taken) || !people?.length) { return context; }
    const named = people.filter(e => e.type === 'group').map(e => (e.name ?? '').split(', ')[0]!).filter(Boolean);
    return { ...context, taken: [...new Set([...context.taken as string[], ...named])] };
  }
  // What DEEM contributes to a bundle. A bundle that declares no generation is entirely authored.
  private static generated(manifest: BundleManifest, [tables, templates]: [string, string], seed: string,
    context: Record<string, DeemValue>): AdventureManifest {
    if (!manifest.generation) { return { name: '', creatures: [], actors: { order: [] }, initial: [], outcomes: [] }; }
    const setting = Content.settingWith(JSON.parse(tables), JSON.parse(templates));
    return new Content(`${seed}:situation`, setting).generate(manifest.generation.type,
      { ...manifest.generation.context, ...context }) as unknown as AdventureManifest;
  }
  // One file, parsed, or the parser's complaint with the file's path and line.
  // Parsing is the dearest part of loading, and the same text (the world rules every module is written against, a
  // situation installed twice) is parsed again and again; each text is parsed once, and each caller gets its own copy.
  private static readonly parses = new Map<string, ReadAmong<Module>[]>();
  // A text read before is kept, and declares its own kinds as it did when it was read, for the files read after it:
  // two of wren's works leave one chalice, declared in one file of the region and placed in another.
  // Kept by its text, and each reading of it by what it read of the kinds it was read among (Vocabularies.reading):
  // a module's own file read before another declared a kind it places is read again after (see `own`).
  // declared: what a generator declared for the file as values (ModuleSource), declared where their lines were.
  private static parsed(context: VocabularyContext, file: SourceFile, declared: FileSource['declared'] = []): Module {
    try { return structuredClone(this.kept(context, file.text, declared)); }
    catch (error) { throw Diagnostics.parse(error, file.path); }
  }
  // The parse kept, uncopied (each caller copies what it changes: KeptParses), its own kinds declared again.
  private static kept(context: VocabularyContext, text: string, declared: FileSource['declared'] = []): Module {
    const key = `${context.verbKey}\u0000${this.key(text, declared)}`;
    const variants = this.parses.get(key), known = context.kept(variants);
    if (known) { context.install(known.value.catalog); return known.value; }
    const reading = context.reading(() => KeptParses.of(context, text, declared,
      (t, d) => ModuleParser.parseWithin(context, t, d)));
    if (this.parses.size > 400) { this.parses.clear(); }
    this.parses.set(key, context.keep(variants, reading));
    return reading.value;
  }
  // The shared rules a module is read with, joined once for each set of them and kept: every module of a world is read
  // with the same few, and joining them again for each (each file copied out of the parse cache, then joined) had
  // been most of what reading a generated world cost (M19-49). Kept, never changed: compose writes nothing of it.
  private static readonly rulesets = new Map<string, ReadAmong<Module>[]>();
  private static shared(context: VocabularyContext, files: SourceFile[]): ReadAmong<Module> {
    const key = `${context.verbKey}\u0000${files.map(f => f.text).join('\u0001')}`;
    const variants = this.rulesets.get(key);
    const known = context.kept(variants);
    if (known) { context.install(known.value.catalog); return known; }
    const read = context.reading(() => this.merge(context, files.map(f => this.parsed(context, f))));
    const merged = { value: read.value, reads: context.apart(read.reads, read.value.catalog) };
    if (this.rulesets.size > 8) { this.rulesets.clear(); }
    this.rulesets.set(key, context.keep(variants, merged));
    return merged;
  }
  // And what a generator declared for it as values, where it did (the same text with other values is another module).
  private static key(text: string, declared: FileSource['declared'] = []): string {
    return `${text}${declared.length ? `\u0000${JSON.stringify(declared)}` : ''}`;
  }
  // A module's own files, each read among every kind its files declare, as one file's are read among its own wherever
  // in it they are written: a felter in one file selling a cloak declared in another sold a trade good of that name,
  // which was no good at all (found with the architecture review's A7, its law read as the module's own).
  // Each is read again only if a file after it declared kinds (a file knows its own wherever in it they are written);
  // one that could not be read for a kind not yet declared is read again too, once every file has declared its own
  // (Half the Hive's 8: kinds had to come in a file before the one that used them).
  private static own(context: VocabularyContext, files: SourceFile[],
    sources: (FileSource | undefined)[] = []): Module[] {
    const local = context.fork();
    const read = files.map((f, i) => {
      try {
        const reader = local.fork(), module = this.parsed(reader, f, sources[i]?.declared);
        local.install(module.catalog);
        return { module, kinds: local.fingerprint() };
      }
      catch { return undefined; }
    });
    const all = local.fingerprint();
    return read.map((r, i) => {
      if (r?.kinds === all) { return r.module; }
      const reader = local.fork(), module = this.parsed(reader, files[i]!, sources[i]?.declared);
      local.install(module.catalog); return module;
    });
  }
  // Several files of one module, joined: the first's identity, everything each declares. What each file declares
  // for itself as it is read (a way's kind, a thing's state) is declared once; anything else declared twice is still
  // an error.
  private static merge(context: VocabularyContext, modules: Module[]): Module {
    const merged = this.joined(modules);
    WorldConstructs.given(context, merged); Routes.company(merged);
    return merged;
  }
  // Where each file's names were declared is each file's, and the module joined has none (DeclarationSites).
  private static joined(modules: Module[]): Module {
    const first = { ...modules[0]! }, seen = new Set<string>(), entities = modules.flatMap(m => m.entities)
      .filter(e => seen.size < seen.add(`${e.id}\u0000${JSON.stringify(e)}`).size);
    delete first.sites;
    const company = modules.find(m => m.company)?.company;
    // The goal is whichever file declares one (The Long Man's is in its second file, and was lost as false).
    const goals = modules.map(m => m.goal).filter(g => !(g.kind === 'boolean' && g.value === false));
    if (goals.length > 1) { throw new Error('A module declares its Goal once, in one of its files'); }
    return Superseded.lower({ ...first, ...goals[0] ? { goal: goals[0] } : {}, ...company ? { company } : {},
      entities,
      kinds: [...new Set(modules.flatMap(m => m.kinds))],
      relations: ModuleBundle.once(modules.flatMap(m => m.relations)), measures: modules.flatMap(m => m.measures),
      queries: modules.flatMap(m => m.queries), initial: modules.flatMap(m => m.initial),
      ...modules.some(m => m.verbs) ? { verbs: modules.flatMap(m => m.verbs ?? []) } : {},
      actions: modules.flatMap(m => m.actions), people: modules.flatMap(m => m.people ?? []),
      pursuits: modules.flatMap(m => m.pursuits ?? []), rules: Bringing.once(modules.flatMap(m => m.rules ?? [])),
      observations: modules.flatMap(m => m.observations ?? []), objectives: modules.flatMap(m => m.objectives ?? []),
      ...modules.some(m => m.semantic) ? { semantic: modules.flatMap(m => m.semantic ?? []) } : {},
      ...LocalKinds.merge(...modules.map(m => m.catalog)) });
  }
  // A relation declared alike in two files is one relation: what an Ending declares for itself in each file it is in
  // (concluded) was declared twice, and a module with endings in two files would not load (the review's A16).
  private static once<T>(declared: T[]): T[] {
    const seen = new Set<string>();
    return declared.filter(d => seen.size < seen.add(JSON.stringify(d)).size);
  }
  // Each declared import bound to an entity, a relation or a measure another installation exports; globals keep their
  // own names.
  private static imports(manifest: BundleManifest, request: BundleRequest, installed: InstalledModule[] | undefined,
    module: Module): Record<string, string> {
    const imports: Record<string, string> = {};
    if (Object.keys(request.imports ?? {}).some(key => !manifest.imports?.includes(key))) {
      throw new Error('Undeclared module import');
    }
    ModuleExports.bound(request.id, manifest.roles, request.imports, installed);
    for (const name of manifest.imports ?? []) {
      const reference = request.imports?.[name];
      const [owner, exported, extra] = reference?.split('.') ?? [];
      const id = installed?.find(m => m.id === owner)?.exports[exported ?? ''];
      // An entity of its own, or a relation or measure it declares (KX-03), bound to the one another exports.
      const own = module.entities.some(e => e.id === name) || ModuleExports.vocabulary(name, module) !== undefined;
      if (!id || extra || !own) {
        if (manifest.optional?.includes(name)) { continue; }
        throw new Error(`Unresolved module import ${name}: ${reference ?? 'missing'}`);
      }
      imports[name] = id;
    }
    for (const name of manifest.globals ?? []) {
      if ((imports[name] && imports[name] !== name) || !module.entities.some(e => e.id === name)) {
        throw new Error(`Invalid global declaration ${name}`);
      }
      if (installed?.some(m => Object.values(m.exports).includes(name))) { imports[name] = name; }
    }
    return imports;
  }
  // A chart's places, roads and parts named as the installed module names them.
  private static chart(chart: import('../lang/module').LandChart, id: string): import('../lang/module').LandChart {
    return { ...chart, roads: this.scoped(chart.roads, id), parts: this.scoped(chart.parts, id),
      places: this.scoped(chart.places, id), ...chart.glosses ? { glosses: this.scoped(chart.glosses, id) } : {},
      ...chart.kinds ? { kinds: this.scoped(chart.kinds, id) } : {},
      ...chart.rooms ? { rooms: this.scoped(chart.rooms, id) } : {} };
  }
  // A chart's own ids, scoped to its module; one of another module's already (a province's region, drawn on the land
  // of the country it is a part of) is kept as it is.
  private static scoped<T>(o: Record<string, T>, id: string): Record<string, T> {
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [k.includes('__') ? k : `${id}__${k}`, v]));
  }
  // Reads and parses a module's files ahead of its loading (a country while its protagonist is chosen), one file at a
  // time with a pause between, so that whatever else is asked meanwhile is answered; its loading then finds them.
  static async warm(context: VocabularyContext, path: string, source: BundleSource): Promise<void> {
    const manifest = JSON.parse(await source.read(path)) as BundleManifest;
    const { situations, rules } = this.paths(manifest, path, source);
    await this.read(context, [...situations, ...rules], source, { own: situations.length,
      values: await this.sources(manifest, path, source) });
  }
  // The same for a module not yet in the game in play (the country beyond a march, while the player reads the choice
  // that leads to it): what each file declares of its own kinds is taken out of the catalogs again once it is parsed,
  // the kinds of the files before it put in for it alone, so a country never gone to leaves none behind.
  static async prepare(context: VocabularyContext, path: string, source: BundleSource): Promise<void> {
    const local = context.fork();
    const manifest = JSON.parse(await source.read(path)) as BundleManifest;
    const { situations, rules } = this.paths(manifest, path, source), read: Ahead[] = [];
    const values = await this.sources(manifest, path, source);
    for (const [i, file] of [...situations, ...rules].entries()) {
      const text = await source.read(file), own = i < situations.length, declared = values[i]?.declared ?? [];
      this.ahead(local, text, declared);
      if (own) { read.push({ text, kinds: local.fingerprint(), declared }); }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    // Those of its own read before all its kinds were known, read again among them, as its loading will (see `own`).
    const all = local.fingerprint();
    for (const r of read.filter(x => x.kinds !== all)) { this.ahead(local, r.text, r.declared); }
  }
  // One file read ahead, kept as its loading will look for it (see `key`).
  private static ahead(context: VocabularyContext, text: string, declared: FileSource['declared'] = []): Module | undefined {
    const local = context.fork();
    try {
      const module = this.kept(local, text, declared);
      context.install(module.catalog);
      return module;
    } catch { return undefined; }
  }
  // The rules every game is played by, read before any game is asked for (while the title is up).
  static async warmRules(context: VocabularyContext, source: BundleSource): Promise<void> {
    await this.read(context, this.ruleNames.map(name => source.resolve(`data/rules/${name}.kyr`)), source);
  }
  // The first `own` of them a module's own files (see `key`), each with what was declared for it as values.
  private static async read(context: VocabularyContext, files: string[], source: BundleSource,
    at: { own: number; values: (FileSource | undefined)[] } = { own: 0, values: [] }): Promise<void> {
    const local = context.fork();
    const read: Ahead[] = [];
    for (const [i, file] of files.entries()) {
      const text = await source.read(file), own = i < at.own, declared = own ? at.values[i]?.declared ?? [] : [];
      const fresh = !local.kept(this.parses.get(`${local.verbKey}\u0000${this.key(text, declared)}`));
      // The parse kept, uncopied: these are copied as they are handed out (see parsed); a failure said when it is
      // loaded.
      this.ahead(local, text, declared);
      if (fresh) { await new Promise(resolve => setTimeout(resolve, 0)); }
      if (own) { read.push({ text, kinds: local.fingerprint(), declared }); }
    }
    // Its own read before all its kinds were known, read again among them, as its loading will (see `own`).
    const all = local.fingerprint();
    for (const r of read.filter(x => x.kinds !== all)) { this.ahead(local, r.text, r.declared); }
  }
  // Only the named rules are shared (world, elements, devotion): any other file a manifest names among its rules is
  // its own, read as its sources are and named for it (a rules file of its own had declared another module's private
  // relation and written it, and a rule of the same id as another's was dropped unsaid: the architecture review's A7).
  // A world of a setting of its own (canonless: BX-01's L6) is played by the world's rules without the canon's.
  // A module's own files compiled before, or each read (among the kinds they declare) with what was declared for it
  // as values put in its place (ModuleSource), by the key of both and the shared rules.
  private static async reading(context: VocabularyContext, own: SourceFile[], rules: SourceFile[],
    at: { manifest: BundleManifest; path: string; source: BundleSource }) {
    const sources = await this.sources(at.manifest, at.path, at.source);
    const key = CompiledModules.key(context, CompiledModules.edition(rules.map(f => f.text)),
      [...own.map(f => f.text), ...sources.some(Boolean) ? sources.map(x => x ? JSON.stringify(x) : '') : []]);
    const kept = CompiledModules.get(context, key, true);
    // What reading them asked of the kinds, kept with what they compile to (see CompiledModules).
    const mine = kept ? { value: [], reads: [] } : context.reading(() => this.own(context, own, sources));
    return { key, kept, sources, read: mine.reads,
      mine: mine.value.map((m, i) => SemanticRecords.filed(m, own[i]!.path)) };
  }
  // What was declared for each of a module's own files as values, in their order (none where nothing was).
  private static sources(manifest: BundleManifest, path: string, source: BundleSource):
    Promise<(FileSource | undefined)[]> {
    return ModuleSource.sources(manifest, path, source);
  }
  private static paths(manifest: BundleManifest, path: string, source: BundleSource, canonless = false) {
    const rules = typeof manifest.rules === 'string' ? [manifest.rules] : manifest.rules;
    const world = canonless ? ModuleBundle.world.filter(r => r !== ModuleCanon.id) : ModuleBundle.world;
    const shared = rules.filter(r => ModuleBundle.ruleNames.includes(r) || r === 'world');
    if (!shared.length) { throw new Error(`${path} names none of the rules a module is played by (world, ...)`); }
    return { situations: [...typeof manifest.source === 'string' ? [manifest.source] : manifest.source,
      ...rules.filter(r => !shared.includes(r))].map(p => source.resolve(p, path)),
    rules: shared.flatMap(r => r === 'world' ? world : [r])
      .map(name => source.resolve(`data/rules/${name}.kyr`)) };
  }
  // people: who is in the world already, whose names a story's generated people are drawn apart from as the country's
  // folk's are (two stories in b2 each gave one of their people Rurik). kinds: the campaign's own, any of which the
  // module gives to something else being, in it, its installation's own (see ModuleNamespace.renamed).
  static load(...a: Parameters<typeof ModuleBundle.loading>): Promise<ModuleDraft> {
    return Costs.timed('install', () => ModuleBundle.loading(...a), { id: a[0].id });
  }
  private static async loading(request: BundleRequest, options: {
    seed: string; installed?: InstalledModule[]; elapsed?: number; people?: readonly Entity[]; party?: number;
    canonless?: boolean; kinds?: Module['catalog'];
    vocabulary: VocabularyContext;
    // Read on its own, its imports unbound (what its exports are: ExportRoles), never to be played.
    unbound?: boolean;
  }, source: BundleSource): Promise<ModuleDraft> {
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(request.id)) { throw new Error('Invalid module installation ID'); }
    const path = source.resolve(request.bundle), manifest = JSON.parse(await source.read(path)) as BundleManifest;
    ModuleBundle.check(manifest);
    const canon = ModuleCanon.is(path, source) ? undefined : await ModuleCanon.declarations(source, options.vocabulary);
    const { situations: situationPaths, rules: rulePaths } = this.paths(manifest, path, source, options.canonless);
    const texts = await ModuleFiles.read({ manifest, path, source, situations: situationPaths, rules: rulePaths });
    const files = [...situationPaths, ...rulePaths].map((p, i) => ({ path: p, text: texts[i]! }));
    // Its own files first, each read among every kind they declare (see `own`), and then the shared rules; or its own
    // as they were compiled before beside the same rules (see CompiledModules).
    const own = files.slice(0, situationPaths.length), rules = files.slice(situationPaths.length);
    const { key, kept, mine, sources, read } = await this.reading(options.vocabulary, own, rules,
      { manifest, path, source });
    const seed = RandomStreams.key(options.seed, 'module', kept?.id ?? mine[0]!.id, request.randomIdentity ?? '');
    const generated = { ...this.generated(manifest, texts.slice(-2) as [string, string], seed,
      { ...ModuleBundle.apart({ ...manifest.generation?.context, ...request.context }, options.people),
        now: options.elapsed ?? 0 }),
    imports: manifest.imports ?? [] };
    const ruled = this.shared(options.vocabulary, rules), combined = ruled.value, reads = [...read, ...ruled.reads];
    // The one kept is shared: of it, only what is changed here is copied (its company, sized; its entities, given the
    // canon's), and the shared rules too go to compose uncopied, which writes into neither (ModuleCompiler.instantiate
    // lowers into a module of its own: AX-04, test/small/frozen-modules).
    const made = kept ?? this.compiled({ context: options.vocabulary, key, own, mine, combined,
      valued: sources.some(Boolean), reads });
    const composed = kept ? ModuleBundle.owned(made.module) : made.module, told = made.told;
    ModuleBundle.sized(composed, options.party);
    // What it names of the canon is given it, and bound as the world's own (see ModuleCanon).
    const given = ModuleCanon.give(composed, manifest.canon ?? [], canon, path);
    const bound = given.length ? { ...manifest, globals: [...manifest.globals ?? [], ...given] } : manifest;
    // A module read before (and kept parsed) puts its own kinds back for the campaign being assembled.
    options.vocabulary.install(combined.catalog); options.vocabulary.install(composed.catalog);
    let draft: ModuleDraft, imports: Record<string, string>;
    try {
      const instance = ModuleAssembly.compose(composed, combined, generated,
        { seed, kinds: options.kinds, vocabulary: options.vocabulary });
      ModuleCanon.settle(instance.module, given);
      if (told.length) { instance.campaign = { ...instance.campaign!, shadows: told }; }
      imports = this.imports(options.unbound ? { ...bound, optional: bound.imports } : bound, request,
        options.installed, instance.module);
      draft = new ModuleNamespace(instance, combined, { id: request.id, seed,
        imports, globals: bound.globals ?? [], exports: ModuleExports.locals(manifest.exports), kinds: options.kinds })
        .draft();
      ModuleSymbols.prepare(draft, { id: request.id, context: options.vocabulary, imports, module: instance.module,
        requested: request.imports, exports: manifest.exports, installed: options.installed, unbound: options.unbound,
        mine, files: own, rules, declared: sources, parse: this.parsed.bind(this), parseOwn: this.own.bind(this) });
    } catch (error) {
      throw Diagnostics.explain(error, files.slice(0, situationPaths.length), files.slice(situationPaths.length));
    }
    draft.roles = options.unbound ? [] : RoleRequirements.bind(manifest.roles ?? {}, imports);
    if (manifest.chart) { draft.instance.module.charts = { [`${request.id}__region`]: this.chart(manifest.chart, request.id) }; }
    if (request.within) { ModuleBundle.nest(draft, request.within); }
    if (manifest.experience) { draft.experience = manifest.experience; }
    if (request.chapter) { draft.chapter = true; }
    return draft;
  }
  // A module's own files joined, and what it names that the shared rules name too made its own, within it (see
  // ModuleShadow); kept by its texts and the rules' edition.
  // A module of a generator's values naming a shared rule's own (none does) is refused: renamed in the text, the
  // values would be read where their lines are no more.
  // reads: what reading its files and the shared rules asked of the kinds (see CompiledModules).
  private static compiled(at: { context: VocabularyContext; key: string; own: SourceFile[];
    mine: Module[]; combined: Module; valued: boolean; reads: KindReads }): Compiled {
    const { context, key, own, mine, combined } = at;
    const made = context.reading(() => {
      const local = context.fork();
      local.install(LocalKinds.merge(...mine.map(m => m.catalog)).catalog);
      const parsed = this.merge(local, mine), shadowed = ModuleShadow.shared(parsed, combined);
      if (at.valued && shadowed.functions.length) {
        throw new Error(`A module declared in part as values names the shared rules' ${shadowed.functions.join(', ')}`);
      }
      let module = parsed;
      if (shadowed.functions.length) {
        module = this.merge(local, own.map(f => SemanticRecords.filed(
          this.parsed(local, { ...f, text: ModuleShadow.text(f.text, shadowed) }), f.path)));
      }
      module = ModuleShadow.apart(module, shadowed);
      return { module, id: mine[0]!.id, told: ModuleShadow.told(shadowed) };
    });
    const dependencies = context.apart([...at.reads, ...made.reads], made.value.module.catalog);
    const reads = [...new Map([...dependencies].reverse())];
    CompiledModules.set(context, key, made.value, reads);
    return made.value;
  }
  // A company of one to three is of as many as are chosen for it, within those: a campaign of three had been refused
  // a module written for one ("Choose 1 companions"), and the Lull kept a copy of its company for its tests (its F12,
  // LUL-09). Chosen by no one, it is of the fewest.
  private static owned(m: Module): Module {
    return { ...m, entities: [...m.entities], ...m.company ? { company: { ...m.company } } : {} };
  }
  private static sized(module: Module, chosen?: number) {
    const c = module.company;
    if (!c?.most || chosen === undefined) { return; }
    if (chosen < c.size || chosen > c.most) { throw new Error(`Choose ${c.size} to ${c.most} companions`); }
    c.size = chosen;
  }
  // Sets a province's own country inside a host place: the region its manifest exports as its region, or, if it
  // names none, each region it sets in Imbar or in no plane. Never a region elsewhere (Parliament's Commonplace, which
  // every city that writes has), nor one in another plane (its Cthelll, in Cthelll), nor, where it names its own
  // country, any other (Thrume's Between, under every sleeping thing): those are where they are, whatever country the
  // province is part of.
  private static nest(draft: ModuleDraft, host: string) {
    const own = draft.exports.region;
    for (const e of draft.instance.module.entities) {
      const material = e.space?.kind === 'region' && e.space.shelter !== 'elsewhere'
        && (!e.space.parent || e.space.parent === ModuleCanon.imbar);
      if (material && (!own || e.id === own)) { e.space = { ...e.space!, parent: host }; }
    }
  }
}
