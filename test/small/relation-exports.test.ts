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
    expect(user.symbols?.bindings.tuned).toMatchObject({
      id: 'kind:relation:tuned', name: 'tuned', namespace: 'relation', scope: 'own',
    });
    expect(user.symbols?.bindings.tuned?.file).toEndWith('v/kind.kyr');
    expect(user.symbols?.bindings.tuned?.file).toBe('v/kind.kyr');
    expect(JSON.stringify(user.symbols)).not.toContain(process.cwd());
  });

  it('rejects same-spelled local kinds from different installed modules', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'v/kind.json': JSON.stringify({ version: 1, source: 'kind.kyr', rules: ['world'], exports: { tuned: 'tuned' } }),
      'v/kind.kyr': 'Module kind "Kind" { Kind mark. Relation tuned(mark). Goal false. }',
      'v/user.json': JSON.stringify({ version: 1, source: 'user.kyr', rules: ['world'], imports: ['tuned'] }),
      'v/user.kyr': 'Module user "User" { Kind mark. Relation tuned(mark). Goal false. }',
    });
    const kind = await Vocabulary.kind(source);
    await expect(Vocabulary.user(source, [kind], { tuned: 'kind.tuned' })).rejects.toThrow('Incompatible import');
  });
  it('reports both signatures when an imported relation or measure differs', async () => {
    const source = Vocabulary.source(both), kind = await Vocabulary.kind(source);
    const mismatched = new OverlayBundleSource(source, {
      'v/user.kyr': 'Module user "User" { Relation tuned(item, place). Measure tug(item). Goal false. }',
    });
    await expect(Vocabulary.user(mismatched, [kind], { tuned: 'kind.tuned', tug: 'kind.tug' }))
      .rejects.toThrow('kind__tuned is imported as (item, place) but declared (item, fact)');
    const measure = new OverlayBundleSource(source, {
      'v/user.kyr': 'Module user "User" { Relation tuned(item, fact). Measure tug(item, fact). Goal false. }',
    });
    await expect(Vocabulary.user(measure, [kind], { tuned: 'kind.tuned', tug: 'kind.tug' }))
      .rejects.toThrow('kind__tug is imported as (item, fact) but declared (item)');
  });
  it('keeps external source identities stable across host roots', async () => {
    const read = async (root: string) => {
      const source = new OverlayBundleSource(NodeBundleSource.shared, {
        [`${root}/kind.json`]: JSON.stringify({ version: 1, source: 'kind.kyr', rules: ['world'],
          exports: { tuned: 'tuned' } }),
        [`${root}/kind.kyr`]: 'Module kind "Kind" { Relation tuned(item, fact). Goal false. }',
      });
      return (await ModuleBundle.load({ id: 'kind', bundle: `${root}/kind.json` },
        { seed: 's', vocabulary: CanonVocabulary.context() }, source)).symbols;
    };
    const first = await read('/tmp/first-host'), second = await read('/tmp/another-host');
    expect(first?.unit.files[0]?.file).toBe('kind/source/0');
    expect(JSON.stringify(first)).not.toContain('/tmp/first-host');
    expect(first).toEqual(second);
  });
  it('carries the original declaration through an installed re-export', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'v/kind.json': JSON.stringify({ version: 1, source: 'kind.kyr', rules: ['world'], exports: { tuned: 'tuned' } }),
      'v/kind.kyr': 'Module kind "Kind" { Relation tuned(item, fact). Goal false. }',
      'v/relay.json': JSON.stringify({ version: 1, source: 'relay.kyr', rules: ['world'],
        imports: ['news'], exports: { news: 'news' } }),
      'v/relay.kyr': 'Module relay "Relay" { Relation news(item, fact). Goal false. }',
      'v/user.json': JSON.stringify({ version: 1, source: 'user.kyr', rules: ['world'], imports: ['tidings'] }),
      'v/user.kyr': 'Module user "User" { Relation tidings(item, fact). Goal false. }',
    });
    const kind = await Vocabulary.kind(source);
    const relay = await ModuleBundle.load({ id: 'relay', bundle: source.resolve('v/relay.json'),
      imports: { news: 'kind.tuned' } }, { seed: 's', installed: [kind], vocabulary: Vocabulary.context }, source);
    const user = await ModuleBundle.load({ id: 'user', bundle: source.resolve('v/user.json'),
      imports: { tidings: 'relay.news' } }, { seed: 's', installed: [kind, ModuleNamespace.record(relay, 0)],
      vocabulary: Vocabulary.context }, source);
    expect(user.symbols?.bindings.tidings).toMatchObject({ id: 'kind:relation:tuned', name: 'tuned' });
    expect(user.instance.module.relations.map(r => r.name)).toContain('kind__tuned');
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

it('does not reuse a compiled hazard across verb vocabulary editions', async () => {
  const source = new OverlayBundleSource(NodeBundleSource.shared, {
    'v/hazard.json': JSON.stringify({ version: 1, source: 'hazard.kyr', rules: ['world'] }),
    'v/hazard.kyr': 'Module hazard "Hazard" { Hazard hazard_lesson "Lesson" means "Instruct fire_ward to ally.". Goal false. }',
  });
  const request = { id: 'hazard', bundle: source.resolve('v/hazard.json') };
  const accepts = CanonVocabulary.context().withVerbs(
    () => ({ kind: 'learn', ability: 'fire_ward', target: 'ally' }), 'accepts');
  const refuses = CanonVocabulary.context().withVerbs(() => { throw new Error('No such verb'); }, 'refuses');
  await ModuleBundle.load(request, { seed: 's', vocabulary: accepts }, source);
  await expect(ModuleBundle.load(request, { seed: 's', vocabulary: refuses }, source)).rejects.toThrow('No such verb');
});
