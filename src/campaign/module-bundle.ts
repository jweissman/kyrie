import type { DeemValue } from 'deem';
import { RoleRequirements, type RoleContract } from './role-requirements';
import { LocalKinds } from '../canon/local-catalog';
import { RandomStreams } from '../random-streams';
import { Content } from '../content';
import { ModuleParser } from '../lang/module-parser';
import { Diagnostics, type SourceFile } from '../lang/diagnostics';
import { ModuleAssembly, type AdventureManifest } from './module-assembly';
import { ModuleNamespace, type ModuleDraft } from './module-namespace';
import type { InstalledModule } from './definition';
import type { BundleSource } from './bundle-source';
import type { Module } from '../lang/module';
import { ModuleShadow } from './module-shadow';
import { Composition, type Composed, type ManifestEntry } from '../world/compose/composition';

export interface BundleRequest {
  id: string; bundle: string; imports?: Record<string, string>; context?: Record<string, DeemValue>;
  randomIdentity?: string;
  // Installed into a world already under way, which goes on after it (a country beyond a march): reaching one of its
  // endings closes its chapter, and the world goes on.
  chapter?: boolean;
}
export interface CampaignManifest {
  version: 1; name: string; modules: BundleRequest[]; party?: import('../content').CreatureGenerationContext[];
  // What the company is being asked to do, shown when it is formed.
  pitch?: { heading: string; text: string };
  // The date it begins on: a day of a month of a year of the Sun and Moon.
  calendar?: import('./calendar').CalendarStart;
  // How the campaign's kits were composed into it, when it asks for any.
  composition?: Composed;
}
// A module manifest: the Kyr source files it consists of, the rule modules it is written against, what it imports
// and exports, and optional DEEM generation. Every region, site, situation and institution is such a module.
export interface BundleManifest {
  roles?: Record<string, RoleContract>;
  version: 1; source: string | string[]; rules: string | string[]; globals?: string[]; imports?: string[];
  // Imports a module goes on without, keeping its own: what the country below says of it, in a world kept from before
  // it said so.
  optional?: string[];
  exports?: Record<string, string>;
  generation?: { type: string; context?: Record<string, DeemValue>; tables?: string; templates?: string };
  // Experience for each companion when the module's goal first holds.
  experience?: number;
  // A region's land, for its map (see LandChart): its own ids, which installing it prefixes.
  chart?: import('../lang/module').LandChart;
}
export class ModuleBundle {
  // Rule modules named in a manifest resolve to data/rules; "world" is the standard set every world uses.
  static readonly world = ['core', 'passages', 'people', 'needs', 'services', 'discovery', 'care', 'belongings',
    'dominion', 'probing', 'inhabitants', 'growing', 'belief', 'ambitions'];
  static readonly ruleNames = [...ModuleBundle.world, 'elements', 'devotion'];
  private static strings(v: unknown, min = 0): boolean {
    return typeof v === 'string' || (Array.isArray(v) && v.length >= min && v.every(x => typeof x === 'string'));
  }
  private static check(m: BundleManifest) {
    const strings = ModuleBundle.strings.bind(ModuleBundle);
    const valid = m.version === 1 && strings(m.source, 1) && strings(m.rules, 1)
      && (!m.generation || typeof m.generation.type === 'string')
      && [m.imports, m.globals].every(list => list === undefined || Array.isArray(list) && strings(list))
      && (m.exports === undefined || (typeof m.exports === 'object' && !Array.isArray(m.exports)
        && Object.entries(m.exports).every(([k, v]) => /^[A-Za-z][A-Za-z0-9_-]*$/.test(k) && typeof v === 'string')));
    if (!valid) { throw new Error('Invalid module manifest'); }
  }
  // A campaign's modules, in order; entries that ask for a kit are composed into modules with the campaign's seed.
  static async campaign(path: string, source: BundleSource, seed = ''): Promise<CampaignManifest> {
    const manifest = JSON.parse(await source.read(path)) as Omit<CampaignManifest, 'modules'> & { modules: ManifestEntry[] };
    if (manifest.version !== 1 || typeof manifest.name !== 'string' || !Array.isArray(manifest.modules)
      || !manifest.modules.length) { throw new Error('Invalid campaign manifest'); }
    const entries = manifest.modules.map(m => Composition.isKit(m) ? { ...m, kit: source.resolve(m.kit, path) }
      : { ...m, bundle: source.resolve(m.bundle, path) });
    if (!entries.some(e => Composition.isKit(e))) { return { ...manifest, modules: entries as BundleRequest[] }; }
    const composed = await Composition.expand(entries, { seed, source });
    return { ...manifest, modules: composed.modules, composition: composed };
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
  private static readonly parses = new Map<string, Module>();
  // A text read before is kept, and declares its own kinds as it did when it was read, for the files read after it:
  // two of wren's works leave one chalice, declared in one file of the region and placed in another.
  // A module's own file is kept by the kinds it was read among as well as its text (see `own`); the shared rules,
  // which place nothing of a module's kinds, by their text.
  private static parsed(file: SourceFile, among = false): Module {
    const key = this.key(file.text, among);
    let module = this.parses.get(key);
    if (!module) {
      try { module = ModuleParser.parse(file.text); } catch (error) { throw Diagnostics.parse(error, file.path); }
      if (this.parses.size > 400) { this.parses.clear(); }
      this.parses.set(key, module);
    } else { LocalKinds.install(module.catalog); }
    return structuredClone(module);
  }
  private static key(text: string, among: boolean): string {
    return among ? `${LocalKinds.fingerprint()}\u0000${text}` : text;
  }
  // A module's own files, each read among every kind its files declare, as one file's are read among its own wherever
  // in it they are written: a felter in one file selling a cloak declared in another sold a trade good of that name,
  // which was no good at all (found with the architecture review's A7, its law read as the module's own).
  // Each is read again only if a file after it declared kinds (a file knows its own wherever in it they are written).
  private static own(files: SourceFile[]): Module[] {
    const read = files.map(f => {
      const module = this.parsed(f, true);
      return { module, kinds: LocalKinds.fingerprint() };
    });
    const all = LocalKinds.fingerprint();
    return read.map((r, i) => r.kinds === all ? r.module : this.parsed(files[i]!, true));
  }
  // Several files of one module, joined: the first's identity, everything each declares. What each file declares
  // for itself as it is read (a way's kind, a thing's state) is declared once; anything else declared twice is still
  // an error.
  private static merge(modules: Module[]): Module {
    const seen = new Set<string>(), entities = modules.flatMap(m => m.entities)
      .filter(e => seen.size < seen.add(`${e.id}\u0000${JSON.stringify(e)}`).size);
    const company = modules.find(m => m.company)?.company;
    // The goal is whichever file declares one (The Long Man's is in its second file, and was lost as false).
    const goals = modules.map(m => m.goal).filter(g => !(g.kind === 'boolean' && g.value === false));
    if (goals.length > 1) { throw new Error('A module declares its Goal once, in one of its files'); }
    return { ...modules[0]!, ...goals[0] ? { goal: goals[0] } : {}, ...company ? { company } : {}, entities,
      kinds: [...new Set(modules.flatMap(m => m.kinds))],
      relations: ModuleBundle.once(modules.flatMap(m => m.relations)), measures: modules.flatMap(m => m.measures),
      queries: modules.flatMap(m => m.queries), initial: modules.flatMap(m => m.initial),
      actions: modules.flatMap(m => m.actions), people: modules.flatMap(m => m.people ?? []),
      pursuits: modules.flatMap(m => m.pursuits ?? []), rules: modules.flatMap(m => m.rules ?? []),
      observations: modules.flatMap(m => m.observations ?? []), objectives: modules.flatMap(m => m.objectives ?? []),
      ...LocalKinds.merge(...modules.map(m => m.catalog)) };
  }
  // A relation declared alike in two files is one relation: what an Ending declares for itself in each file it is in
  // (concluded) was declared twice, and a module with endings in two files would not load (the review's A16).
  private static once<T>(declared: T[]): T[] {
    const seen = new Set<string>();
    return declared.filter(d => seen.size < seen.add(JSON.stringify(d)).size);
  }
  // Each declared import bound to an entity another installation exports; globals keep their own names.
  private static imports(manifest: BundleManifest, request: BundleRequest, installed: InstalledModule[] | undefined,
    module: Module): Record<string, string> {
    const imports: Record<string, string> = {};
    if (Object.keys(request.imports ?? {}).some(key => !manifest.imports?.includes(key))) {
      throw new Error('Undeclared module import');
    }
    for (const name of manifest.imports ?? []) {
      const reference = request.imports?.[name];
      const [owner, exported, extra] = reference?.split('.') ?? [];
      const id = installed?.find(m => m.id === owner)?.exports[exported ?? ''];
      if (!id || extra || !module.entities.some(e => e.id === name)) {
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
      places: this.scoped(chart.places, id), ...chart.glosses ? { glosses: this.scoped(chart.glosses, id) } : {} };
  }
  private static scoped<T>(o: Record<string, T>, id: string): Record<string, T> {
    return Object.fromEntries(Object.entries(o).map(([k, v]) => [`${id}__${k}`, v]));
  }
  // Reads and parses a module's files ahead of its loading (a country while its protagonist is chosen), one file at a
  // time with a pause between, so that whatever else is asked meanwhile is answered; its loading then finds them.
  static async warm(path: string, source: BundleSource): Promise<void> {
    const manifest = JSON.parse(await source.read(path)) as BundleManifest;
    const { situations, rules } = this.paths(manifest, path, source);
    await this.read([...situations, ...rules], source, situations.length);
  }
  // The same for a module not yet in the game in play (the country beyond a march, while the player reads the choice
  // that leads to it): what each file declares of its own kinds is taken out of the catalogs again once it is parsed,
  // the kinds of the files before it put in for it alone, so a country never gone to leaves none behind.
  static async prepare(path: string, source: BundleSource): Promise<void> {
    const manifest = JSON.parse(await source.read(path)) as BundleManifest, catalogs: Module['catalog'][] = [];
    const { situations, rules } = this.paths(manifest, path, source), read: { text: string; kinds: string }[] = [];
    for (const [i, file] of [...situations, ...rules].entries()) {
      const text = await source.read(file), own = i < situations.length;
      const module = LocalKinds.aside(() => {
        for (const catalog of catalogs) { LocalKinds.install(catalog); }
        const parsed = this.ahead(text, own);
        LocalKinds.install(parsed?.catalog);
        if (own) { read.push({ text, kinds: LocalKinds.fingerprint() }); }
        return parsed;
      });
      await new Promise(resolve => setTimeout(resolve, 0));
      catalogs.push(module?.catalog);
    }
    // Those of its own read before all its kinds were known, read again among them, as its loading will (see `own`).
    LocalKinds.aside(() => {
      for (const catalog of catalogs) { LocalKinds.install(catalog); }
      const all = LocalKinds.fingerprint();
      for (const r of read.filter(x => x.kinds !== all)) { this.ahead(r.text, true); }
    });
  }
  // One file read ahead, kept as its loading will look for it (see `key`).
  private static ahead(text: string, own: boolean): Module | undefined {
    const key = this.key(text, own), known = this.parses.get(key);
    if (known) { return known; }
    try {
      const parsed = ModuleParser.parse(text);
      if (this.parses.size < 400) { this.parses.set(key, parsed); }
      return parsed;
    } catch { return undefined; }
  }
  // The rules every game is played by, read before any game is asked for (while the title is up).
  static async warmRules(source: BundleSource): Promise<void> {
    await this.read(this.ruleNames.map(name => source.resolve(`data/rules/${name}.kyr`)), source);
  }
  // The first `own` of them a module's own files (see `key`).
  private static async read(files: string[], source: BundleSource, own = 0): Promise<void> {
    const read: { text: string; kinds: string }[] = [];
    for (const [i, file] of files.entries()) {
      const text = await source.read(file), key = this.key(text, i < own);
      if (!this.parses.has(key)) {
        try { this.parses.set(key, ModuleParser.parse(text)); } catch { /* said when it is loaded */ }
        await new Promise(resolve => setTimeout(resolve, 0));
      }
      LocalKinds.install(this.parses.get(key)?.catalog);
      if (i < own) { read.push({ text, kinds: LocalKinds.fingerprint() }); }
    }
    // Its own read before all its kinds were known, read again among them, as its loading will (see `own`).
    const all = LocalKinds.fingerprint();
    for (const r of read.filter(x => x.kinds !== all)) { this.ahead(r.text, true); }
  }
  // Only the named rules are shared (world, elements, devotion): any other file a manifest names among its rules is
  // its own, read as its sources are and named for it (a rules file of its own had declared another module's private
  // relation and written it, and a rule of the same id as another's was dropped unsaid: the architecture review's A7).
  private static paths(manifest: BundleManifest, path: string, source: BundleSource) {
    const rules = typeof manifest.rules === 'string' ? [manifest.rules] : manifest.rules;
    const shared = rules.filter(r => ModuleBundle.ruleNames.includes(r) || r === 'world');
    if (!shared.length) { throw new Error(`${path} names none of the rules a module is played by (world, ...)`); }
    return { situations: [...typeof manifest.source === 'string' ? [manifest.source] : manifest.source,
      ...rules.filter(r => !shared.includes(r))].map(p => source.resolve(p, path)),
    rules: shared.flatMap(r => r === 'world' ? ModuleBundle.world : [r])
      .map(name => source.resolve(`data/rules/${name}.kyr`)) };
  }
  static async load(request: BundleRequest, options: {
    seed: string; installed?: InstalledModule[]; elapsed?: number;
  }, source: BundleSource): Promise<ModuleDraft> {
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(request.id)) { throw new Error('Invalid module installation ID'); }
    const path = source.resolve(request.bundle);
    const manifest = JSON.parse(await source.read(path)) as BundleManifest;
    ModuleBundle.check(manifest);
    const { situations: situationPaths, rules: rulePaths } = this.paths(manifest, path, source);
    const settled = await Promise.allSettled([...situationPaths, ...rulePaths,
      manifest.generation?.tables, manifest.generation?.templates].map((p, i) => !p ? Promise.resolve('{}')
      : source.read(i < situationPaths.length + rulePaths.length ? p : source.resolve(p, path))));
    const texts = settled.map(result => {
      if (result.status === 'rejected') { throw result.reason; }
      return result.value;
    });
    const files = [...situationPaths, ...rulePaths].map((p, i) => ({ path: p, text: texts[i]! }));
    // Its own files first, each read among every kind they declare (see `own`), and then the shared rules.
    const own = files.slice(0, situationPaths.length), mine = this.own(own);
    const seed = RandomStreams.key(options.seed, 'module', mine[0]!.id, request.randomIdentity ?? '');
    const generated = { ...this.generated(manifest, texts.slice(-2) as [string, string], seed,
      { ...request.context, now: options.elapsed ?? 0 }), imports: manifest.imports ?? [] };
    const combined = this.merge(files.slice(situationPaths.length).map(f => this.parsed(f)));
    // What the module names that the shared rules name too is its own, within it (see ModuleShadow).
    const parsed = this.merge(mine);
    const shadowed = ModuleShadow.shared(parsed, combined), told = ModuleShadow.told(shadowed);
    const composed = ModuleShadow.apart(shadowed.functions.length
      ? this.merge(own.map(f => this.parsed({ ...f, text: ModuleShadow.text(f.text, shadowed) }, true))) : parsed,
    shadowed);
    // A module read before (and kept parsed) puts its own kinds back for the campaign being assembled.
    LocalKinds.install(combined.catalog); LocalKinds.install(composed.catalog);
    let draft: ModuleDraft, imports: Record<string, string>;
    try {
      const instance = ModuleAssembly.compose(composed, structuredClone(combined), generated, seed);
      if (told.length) { instance.campaign = { ...instance.campaign!, shadows: told }; }
      imports = this.imports(manifest, request, options.installed, instance.module);
      draft = new ModuleNamespace(instance, combined, { id: request.id, seed,
        imports, globals: manifest.globals ?? [], exports: manifest.exports ?? {} }).draft();
    } catch (error) {
      throw Diagnostics.explain(error, files.slice(0, situationPaths.length), files.slice(situationPaths.length));
    }
    draft.roles = RoleRequirements.bind(manifest.roles ?? {}, imports);
    if (manifest.chart) { draft.instance.module.charts = { [`${request.id}__region`]: this.chart(manifest.chart, request.id) }; }
    if (manifest.experience) { draft.experience = manifest.experience; }
    if (request.chapter) { draft.chapter = true; }
    return draft;
  }
}
