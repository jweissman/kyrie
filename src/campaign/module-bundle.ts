import type { DeemValue } from 'deem';
import { RoleRequirements, type RoleContract } from './role-requirements';
import { Content } from '../content';
import { ModuleWriter } from '../lang/module-writer';
import { ModuleParser } from '../lang/module-parser';
import { ModuleAssembly, type AdventureManifest } from './module-assembly';
import { ModuleNamespace, type ModuleDraft } from './module-namespace';
import type { InstalledModule } from './definition';
import type { BundleSource } from './bundle-source';

export interface BundleRequest {
  id: string; bundle: string; imports?: Record<string, string>; context?: Record<string, DeemValue>;
}
export interface CampaignManifest {
  version: 1; name: string; modules: BundleRequest[]; party?: import('../content').CreatureGenerationContext[];
}
interface BundleManifest {
  roles?: Record<string, RoleContract>;
  version: 1; situation: string | string[]; rules: string | string[]; globals?: string[]; imports?: string[];
  exports: Record<string, string>;
  generation?: { type: string; context?: Record<string, DeemValue>; tables?: string; templates?: string };
}
export class ModuleBundle {
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
    if (manifest.version !== 1 || !(typeof manifest.rules === 'string' || (Array.isArray(manifest.rules)
      && manifest.rules.length && manifest.rules.every(r => typeof r === 'string'))) || !(typeof manifest.situation === 'string' || (Array.isArray(manifest.situation) && manifest.situation.length && manifest.situation.every(p => typeof p === 'string')))
      || (manifest.generation && typeof manifest.generation.type !== 'string')
      || !manifest.exports || typeof manifest.exports !== 'object' || Array.isArray(manifest.exports)
      || [manifest.imports, manifest.globals].some(list => list !== undefined && (!Array.isArray(list)
        || list.some(name => typeof name !== 'string')))
      || Object.entries(manifest.exports).some(([key, value]) => !/^[A-Za-z][A-Za-z0-9_-]*$/.test(key)
        || typeof value !== 'string')) {
      throw new Error('Invalid module bundle');
    }
    const situationPaths = typeof manifest.situation === 'string' ? [manifest.situation] : manifest.situation;
    const rulePaths = typeof manifest.rules === 'string' ? [manifest.rules] : manifest.rules;
    const files = await Promise.allSettled([...situationPaths, ...rulePaths,
      manifest.generation?.tables, manifest.generation?.templates].map(p => p ? source.read(source.resolve(p, path)) : '{}'));
    const texts = files.map(result => {
      if (result.status === 'rejected') { throw result.reason; }
      return result.value;
    });
    const seed = `${options.seed}:module:${request.id}`;
    const generated = this.generated(manifest, texts.slice(-2) as [string, string], seed,
      { ...request.context, now: options.elapsed ?? 0 });
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
      imports, globals: manifest.globals ?? [], exports: manifest.exports }).draft();
    draft.roles = RoleRequirements.bind(manifest.roles ?? {}, imports);
    return draft;
  }
}
