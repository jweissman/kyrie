import type { DeemValue } from 'deem';
import { RoleRequirements, type RoleContract } from './role-requirements';
import { RandomStreams } from '../random-streams';
import { Content } from '../content';
import { ModuleWriter } from '../lang/module-writer';
import { ModuleParser } from '../lang/module-parser';
import { ModuleAssembly, type AdventureManifest } from './module-assembly';
import { ModuleNamespace, type ModuleDraft } from './module-namespace';
import type { InstalledModule } from './definition';
import type { BundleSource } from './bundle-source';

export interface BundleRequest {
  id: string; bundle: string; imports?: Record<string, string>; context?: Record<string, DeemValue>;
  randomIdentity?: string;
}
export interface CampaignManifest {
  version: 1; name: string; modules: BundleRequest[]; party?: import('../content').CreatureGenerationContext[];
}
// A module manifest: the Kyr source files it consists of, the rule modules it is written against, what it imports
// and exports, and optional DEEM generation. Every region, site, situation and institution is such a module.
interface BundleManifest {
  roles?: Record<string, RoleContract>;
  version: 1; source: string | string[]; rules: string | string[]; globals?: string[]; imports?: string[];
  exports?: Record<string, string>;
  generation?: { type: string; context?: Record<string, DeemValue>; tables?: string; templates?: string };
}
export class ModuleBundle {
  // Rule modules named in a manifest resolve to data/rules; "world" is the standard set every world uses.
  static readonly world = ['core', 'passages', 'people', 'needs', 'services', 'discovery', 'care', 'belongings'];
  static readonly ruleNames = [...ModuleBundle.world, 'elements'];
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
  static async campaign(path: string, source: BundleSource): Promise<CampaignManifest> {
    const manifest = JSON.parse(await source.read(path)) as CampaignManifest;
    if (manifest.version !== 1 || typeof manifest.name !== 'string' || !Array.isArray(manifest.modules)
      || !manifest.modules.length) { throw new Error('Invalid campaign manifest'); }
    return { ...manifest, modules: manifest.modules.map(m => ({ ...m, bundle: source.resolve(m.bundle, path) })) };
  }
  // What DEEM contributes to a bundle. A bundle that declares no generation is entirely authored.
  private static generated(manifest: BundleManifest, [tables, templates]: [string, string], seed: string,
    context: Record<string, DeemValue>): AdventureManifest {
    if (!manifest.generation) { return { name: '', creatures: [], actors: { order: [] }, initial: [], outcomes: [] }; }
    const setting = Content.settingWith(JSON.parse(tables), JSON.parse(templates));
    return new Content(`${seed}:situation`, setting).generate(manifest.generation.type,
      { ...manifest.generation.context, ...context }) as unknown as AdventureManifest;
  }
  static async load(request: BundleRequest, options: {
    seed: string; installed?: InstalledModule[]; elapsed?: number;
  }, source: BundleSource): Promise<ModuleDraft> {
    if (!/^[A-Za-z][A-Za-z0-9-]*$/.test(request.id)) { throw new Error('Invalid module installation ID'); }
    const path = source.resolve(request.bundle);
    const manifest = JSON.parse(await source.read(path)) as BundleManifest;
    ModuleBundle.check(manifest);
    const situationPaths = (typeof manifest.source === 'string' ? [manifest.source] : manifest.source)
      .map(p => source.resolve(p, path));
    const rulePaths = (typeof manifest.rules === 'string' ? [manifest.rules] : manifest.rules)
      .flatMap(r => ModuleBundle.ruleNames.includes(r) || r === 'world' ? (r === 'world' ? ModuleBundle.world : [r])
        .map(name => source.resolve(`data/rules/${name}.kyr`)) : [source.resolve(r, path)]);
    const files = await Promise.allSettled([...situationPaths, ...rulePaths,
      manifest.generation?.tables, manifest.generation?.templates].map((p, i) => !p ? Promise.resolve('{}')
      : source.read(i < situationPaths.length + rulePaths.length ? p : source.resolve(p, path))));
    const texts = files.map(result => {
      if (result.status === 'rejected') { throw result.reason; }
      return result.value;
    });
    const seed = RandomStreams.key(options.seed, 'module', ModuleParser.parse(texts[0]!).id, request.randomIdentity ?? '');
    const generated = { ...this.generated(manifest, texts.slice(-2) as [string, string], seed,
      { ...request.context, now: options.elapsed ?? 0 }), imports: manifest.imports ?? [] };
    const rules = rulePaths.map((_, i) => ModuleParser.parse(texts[situationPaths.length + i]!));
    const combined = { ...rules[0]!, kinds: rules.flatMap(r => r.kinds),
      relations: rules.flatMap(r => r.relations), measures: rules.flatMap(r => r.measures),
      queries: rules.flatMap(r => r.queries), entities: rules.flatMap(r => r.entities),
      pursuits: rules.flatMap(r => r.pursuits ?? []),
      rules: rules.flatMap(r => r.rules ?? []),
      observations: rules.flatMap(r => r.observations ?? []), objectives: rules.flatMap(r => r.objectives ?? []),
      initial: rules.flatMap(r => r.initial), actions: rules.flatMap(r => r.actions) };
    const situations = situationPaths.map((_, i) => ModuleParser.parse(texts[i]!));
    const composed = { ...situations[0]!,
      kinds: situations.flatMap(m => m.kinds), entities: situations.flatMap(m => m.entities),
      relations: situations.flatMap(m => m.relations), measures: situations.flatMap(m => m.measures),
      queries: situations.flatMap(m => m.queries), initial: situations.flatMap(m => m.initial),
      actions: situations.flatMap(m => m.actions), people: situations.flatMap(m => m.people ?? []),
      pursuits: situations.flatMap(m => m.pursuits ?? []), rules: situations.flatMap(m => m.rules ?? []),
      observations: situations.flatMap(m => m.observations ?? []),
      objectives: situations.flatMap(m => m.objectives ?? []) };
    const instance = ModuleAssembly.compose(ModuleWriter.write(composed),
      ModuleWriter.write(combined), generated, seed);
    const imports: Record<string, string> = {};
    if (Object.keys(request.imports ?? {}).some(key => !manifest.imports?.includes(key))) {
      throw new Error('Undeclared module import');
    }
    for (const name of manifest.imports ?? []) {
      const reference = request.imports?.[name];
      const [owner, exported, extra] = reference?.split('.') ?? [];
      const id = options.installed?.find(m => m.id === owner)?.exports[exported ?? ''];
      if (!id || extra || !instance.module.entities.some(e => e.id === name)) {
        throw new Error(`Unresolved module import ${name}: ${reference ?? 'missing'}`);
      }
      imports[name] = id;
    }
    for (const name of manifest.globals ?? []) {
      if ((imports[name] && imports[name] !== name) || !instance.module.entities.some(e => e.id === name)) {
        throw new Error(`Invalid global declaration ${name}`);
      }
      if (options.installed?.some(m => Object.values(m.exports).includes(name))) { imports[name] = name; }
    }
    const draft = new ModuleNamespace(instance, combined, { id: request.id, seed,
      imports, globals: manifest.globals ?? [], exports: manifest.exports ?? {} }).draft();
    draft.roles = RoleRequirements.bind(manifest.roles ?? {}, imports);
    return draft;
  }
}
