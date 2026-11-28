import type { BundleManifest } from './module-bundle';
import type { BundleSource } from './bundle-source';
import { ModuleCanon } from './module-canon';
import { RulePackages } from './rule-packages';

// The shared rules a manifest is played by: the standard set every world uses ("world"), the rest a module may name,
// and the files a manifest's rules resolve to, each installed with what it reads (RulePackages, BX-02).
export class StandardRules {
  static readonly world = ['core', 'passages', 'people', 'needs', 'services', 'discovery', 'care', 'belongings',
    'dominion', 'probing', 'inhabitants', 'growing', 'making', 'belief', 'ambitions', 'canon', 'fantasy'];
  static readonly names = [...StandardRules.world, 'elements', 'devotion', 'venturing'];
  // Its own sources and the shared rules it names, with what they read: "world" as it is listed.
  static async paths(manifest: BundleManifest, path: string, source: BundleSource, canonless = false) {
    const rules = typeof manifest.rules === 'string' ? [manifest.rules] : manifest.rules;
    const world = canonless ? this.world.filter(r => r !== ModuleCanon.id) : this.world;
    const shared = rules.filter(r => this.names.includes(r) || r === 'world');
    if (!shared.length) { throw new Error(`${path} names none of the rules a module is played by (world, ...)`); }
    const named = shared.flatMap(r => r === 'world' ? world : [r]);
    const installed = await RulePackages.installed(named, shared.includes('world'), source);
    return { situations: [...typeof manifest.source === 'string' ? [manifest.source] : manifest.source,
      ...rules.filter(r => !shared.includes(r))].map(p => source.resolve(p, path)),
    rules: installed.map(name => source.resolve(`data/rules/${name}.kyr`)) };
  }
}
