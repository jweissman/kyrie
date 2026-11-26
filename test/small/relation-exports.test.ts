import { describe, expect, it } from 'bun:test';
import { ModuleBundle, type BundleRequest } from '../../src/campaign/module-bundle';
import { ModuleExports } from '../../src/campaign/module-exports';
import { ModuleNamespace } from '../../src/campaign/module-namespace';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import type { InstalledModule } from '../../src/campaign/definition';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';

// Relations and measures as typed exports (KX-03, in place of kx-1's `shared`): a module exports a relation or a
// measure it declares, by its name, its role inferred (relation, measure) or declared and held to it; a consumer
// declares it as the definer does and imports it in its manifest, and the campaign binds the consumer's name to the
// definer's installed one, as an entity is bound. Not imported, the consumer's is its own.
class Vocabulary {
  static context = CanonVocabulary.context();
  static source(exports: Record<string, unknown>, consumer = ['tuned', 'tug']) {
    return new OverlayBundleSource(NodeBundleSource.shared, {
      'v/kind.json': JSON.stringify({ version: 1, source: 'kind.kyr', rules: ['world'], exports }),
      'v/kind.kyr': 'Module kind "Kind" { Relation tuned(item, fact). Measure tug(item). Goal false. }',
      'v/user.json': JSON.stringify({ version: 1, source: 'user.kyr', rules: ['world'], imports: consumer }),
      'v/user.kyr': 'Module user "User" { Relation tuned(item, fact). Measure tug(item). '
        + 'Entity chip: item "a chip". Entity home: fact "Home.". '
        + 'Initially Assert tuned(chip, home). Initially Set tug(chip) to 2. Goal false. }' });
  }
  static async kind(source: OverlayBundleSource): Promise<InstalledModule> {
    const draft = await ModuleBundle.load({ id: 'kind', bundle: source.resolve('v/kind.json') },
      { seed: 's', vocabulary: this.context }, source);
    return ModuleNamespace.record(draft, 0);
  }
  static user(source: OverlayBundleSource, installed: InstalledModule[], imports?: Record<string, string>) {
    const request: BundleRequest = { id: 'user', bundle: source.resolve('v/user.json'), ...imports ? { imports } : {} };
    return ModuleBundle.load(request, { seed: 's', installed, vocabulary: this.context }, source);
  }
}

describe('relations and measures as typed exports', () => {
  const both = { tuned: { entity: 'tuned', role: 'relation' }, tug: 'tug' };
  it('exports a relation and a measure by their installed names, their roles inferred or declared', async () => {
    const kind = await Vocabulary.kind(Vocabulary.source(both));
    expect(kind.exports).toEqual({ tuned: 'kind__tuned', tug: 'kind__tug' });
    expect(kind.exported).toEqual({ tuned: 'relation' });
    const module = { relations: [{ name: 'tuned', types: [], exclusive: false }], measures: [] };
    expect([ModuleExports.vocabulary('tuned', module), ModuleExports.vocabulary('tug', module)])
      .toEqual(['relation', undefined]);
  });
  it('binds a consumer\'s declaration to the definer\'s, in its every use', async () => {
    const source = Vocabulary.source(both), kind = await Vocabulary.kind(source);
    const user = await Vocabulary.user(source, [kind], { tuned: 'kind.tuned', tug: 'kind.tug' });
    const m = user.instance.module, ours = (names: string[]) => names.filter(n => /tuned|tug/.test(n));
    expect([ours(m.relations.map(r => r.name)), ours(m.measures.map(r => r.name))])
      .toEqual([['kind__tuned'], ['kind__tug']]);
    expect(ours(m.initial.map(c => c.call.name))).toEqual(['kind__tuned', 'kind__tug']);
    expect(user.imports).toEqual(expect.arrayContaining(['kind__tuned', 'kind__tug']));
  });
  it('keeps the consumer\'s own where it imports nothing', async () => {
    const source = Vocabulary.source(both, []), kind = await Vocabulary.kind(source);
    const m = (await Vocabulary.user(source, [kind])).instance.module;
    expect(m.relations.map(r => r.name).filter(n => /tuned/.test(n))).toEqual(['user__tuned']);
    expect(m.relations.map(r => r.name)).not.toContain('kind__tuned');
  });
  it('refuses a role declared that the export cannot play, and an import of nothing exported', async () => {
    await expect(Vocabulary.kind(Vocabulary.source({ tuned: { entity: 'tuned', role: 'measure' } })))
      .rejects.toThrow(/exports tuned as measure, but tuned is a relation/);
    const source = Vocabulary.source({ tuned: 'tuned' }), kind = await Vocabulary.kind(source);
    await expect(Vocabulary.user(source, [kind], { tuned: 'kind.tuned', tug: 'kind.tug' }))
      .rejects.toThrow(/Unresolved module import tug/);
  });
});
