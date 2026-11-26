import { describe, expect, it } from 'bun:test';
import { RegionZones } from '../src/world/region-zones';
import { RegionGeography } from '../src/world/region-geography';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Composition } from '../src/world/compose/composition';
import { WorldAssembler } from '../src/world/world-assembler';
import type { CreatureStore } from '../src/creature-store';
import { GeneratedWorld } from './support/generated';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';
import { LocalKinds } from '../src/canon/local-catalog';
import { Ledger } from '../src/world/compose/ledger';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleCanon } from '../src/campaign/module-canon';
import type { Vocabulary } from '../src/lang/vocabulary';
import { KeptParses } from '../src/lang/kept-parses';

// The assembler as a partner to Deem: kits (data/kits/raider-hold, data/kits/bounty) placed into an authored region
// (test/fixtures/fells), with slots fixed by an author or bound by requirement and preference, dimensions proposed by
// Deem and checked against what is committed.
class Compose {
  static readonly fells = 'test/fixtures/fells/campaign.json';
  static readonly outlaws = 'test/fixtures/fells/outlaws.campaign.json';
  static readonly kit = '../../../data/kits/raider-hold/kit.json';
  // The fells' manifest with its kit entry replaced, as an in-memory campaign.
  static async variant(kit: Record<string, unknown>) {
    const source = NodeBundleSource.shared, path = source.resolve(this.fells);
    const manifest = JSON.parse(await source.read(path)) as { modules: Record<string, unknown>[] };
    manifest.modules = [...manifest.modules.filter(m => !('kit' in m)), { kit: this.kit, ...kit }];
    const at = source.resolve('test/fixtures/fells/variant.campaign.json');
    return { path: at, source: new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }) };
  }
  static legal(s: PlaySession) { return PlayerView.choices(s.campaign).map(c => c.choice.id); }
  static put(s: PlaySession, place: string) {
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', place) }]));
  }
}

describe('multi-file context', () => {
  it('keeps the source path of identical compiled modules in their own campaign', async () => {
    const text = 'Module routes "Routes" { Place hill "hill" is room. '
      + 'Person keeper "keeper" at hill { Ancestry human. Calling warrior. } '
      + 'Route round for keeper priority 5 { up at hill from watch 20. } }';
    const manifest = JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'context-path-a/module.json': manifest, 'context-path-a/site.kyr': text,
      'context-path-b/module.json': manifest, 'context-path-b/site.kyr': text });
    for (const dir of ['context-path-a', 'context-path-b', 'context-path-a']) {
      const draft = await ModuleBundle.load({ id: 'routes', bundle: `${dir}/module.json` },
        { seed: 'source-path', vocabulary: CanonVocabulary.scoped() }, source);
      expect(draft.instance.module.semantic?.find(r => r.kind === 'route')?.span?.file)
        .toBe(source.resolve(`${dir}/site.kyr`));
    }
  });
  it('updates a kind inheriting from another kind later in the same file', () => {
    const base = LocalKinds.item('old', { id: 'base_c', name: 'old', base: { category: 'gear' }, worth: 1 });
    for (const inheritance of ['like base_c', 'like // inherited\n base_c']) {
      const vocabulary = CanonVocabulary.scoped({ items: { base_c: base } });
      const files = [`Module a "A" { Kind derived "derived" ${inheritance}. Kind base_c "base" is gear worth 9. }`];
      const modules = KeptParses.together(files, vocabulary, text => text,
        text => ModuleParser.parse(text, [], vocabulary));
      expect(modules[0]!.catalog?.items?.derived).toMatchObject({ value: 9 });
    }
  });
  it('updates inherited kinds when a later file changes their parent', () => {
    const base = LocalKinds.item('old', { id: 'base_c', name: 'old', base: { category: 'gear' }, worth: 1 });
    const vocabulary = CanonVocabulary.scoped({ items: { base_c: base } });
    const files = ['Module a "A" { Kind a "a" like base_b. }',
      'Module b "B" { Kind base_b "b" like base_c. }',
      'Module c "C" { Kind base_c "c" is gear worth 9. }'];
    const modules = KeptParses.together(files, vocabulary, text => text,
      text => ModuleParser.parse(text, [], vocabulary));
    expect(modules.map(m => Object.values(m.catalog!.items!)[0]))
      .toMatchObject([{ value: 9 }, { value: 9 }, { value: 9 }]);
  });
  it('continues past partial failures without an optional fingerprint', () => {
    const scoped = CanonVocabulary.scoped();
    const vocabulary: Vocabulary = { id: scoped.id, kind: scoped.kind.bind(scoped), item: scoped.item.bind(scoped),
      species: scoped.species.bind(scoped), install: scoped.install.bind(scoped), seen: scoped.seen.bind(scoped),
      ability: scoped.ability.bind(scoped) };
    const files = ['Module a "A" { Kind aaa "a" like bbb. }',
      'Module b "B" { Kind bbb "b" like ccc. Item bi is aaa nowhere. }',
      'Module c "C" { Kind ccc "c" is gear. Item ci is aaa nowhere. }'];
    const modules = KeptParses.together(files, vocabulary, text => text,
      text => ModuleParser.parse(text, [], vocabulary));
    expect(modules.map(m => m.id)).toEqual(['a', 'b', 'c']);
  });
  it('does not replace a species when its provider cannot report species presence', () => {
    const own = CanonVocabulary.scoped();
    own.install({ species: { local_hound: own.species('own', { id: 'local_hound', name: 'wolf', like: 'wolf' }) } });
    const vocabulary: Vocabulary = { id: own.id, kind: own.kind.bind(own), item: own.item.bind(own),
      species: own.species.bind(own), install: own.install.bind(own), seen: own.seen.bind(own),
      ability: own.ability.bind(own), fork: own.fork.bind(own), isSpecies: () => undefined };
    const source = 'Module canon "Canon" { Species local_hound "bear" like bear. }';
    const catalog = ModuleParser.parse(source, [], CanonVocabulary.scoped()).catalog!;
    expect(() => ModuleCanon.supply({ ids: new Set(), entities: new Map(), catalog }, vocabulary))
      .toThrow('species-aware vocabulary');
    expect(own.creature('local_hound').name).toBe('wolf');
  });
  it('refuses conflicting ancestry when a provider cannot resolve species aliases', () => {
    const own = CanonVocabulary.scoped();
    own.install({ species: { local_hound: own.species('own', { id: 'local_hound', name: 'wolf', like: 'wolf' }) } });
    const vocabulary: Vocabulary = { id: own.id, kind: own.kind.bind(own), item: own.item.bind(own),
      species: own.species.bind(own), install: own.install.bind(own), seen: own.seen.bind(own),
      ability: own.ability.bind(own), isSpecies: own.isSpecies.bind(own),
      speciesDefinition: own.speciesDefinition.bind(own) };
    const canon = { ids: new Set<string>(), entities: new Map(), catalog: { species: {
      local_hound: { name: 'bear', variantOf: 'bear' }, canon_child: { name: 'child', variantOf: 'alias_hound' } } } };
    expect(() => ModuleCanon.supply(canon, vocabulary)).toThrow('without species alias resolution');
    expect(own.isSpecies('canon_child')).toBe(false);
    vocabulary.resolveSpecies = id => id === 'alias_hound' ? 'local_hound' : id;
    expect(() => ModuleCanon.supply(canon, vocabulary)).toThrow('depends on a different species');
    expect(own.isSpecies('canon_child')).toBe(false);
  });
  it('does not read conflicting canon species in a canonless bundle', async () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ species: { local_hound: vocabulary.species('own',
      { id: 'local_hound', name: 'wolf', like: 'wolf' }) } });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: 'context.kyr', globals: [] }),
      'data/imbar/context.kyr': 'Module canon "Canon" { Species local_hound "bear" like bear. }',
      'context/site.kyr': 'Module child "Child" { Place yard "yard" is room. '
        + 'Person hound "hound" at yard { Species local_hound. } }',
      'context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    const draft = await ModuleBundle.load({ id: 'child', bundle: 'context/module.json' },
      { seed: 'canonless-species', canonless: true, vocabulary }, source);
    expect(draft.instance.campaign!.creatures.some(c => c.context.raceId === 'local_hound')).toBe(true);
    expect(vocabulary.creature('local_hound').name).toBe('wolf');
  });
  it('reads conflicting canon species without replacing the caller species', async () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ species: { local_hound: vocabulary.species('own',
      { id: 'local_hound', name: 'wolf', like: 'wolf' }) } });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: 'context.kyr', globals: [] }),
      'data/imbar/context.kyr': 'Module canon "Canon" { Species local_hound "bear" like bear. }',
      'context/site.kyr': 'Module child "Child" { Place yard "yard" is room. '
        + 'Person hound "hound" at yard { Species local_hound. } }',
      'context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    const draft = await ModuleBundle.load({ id: 'child', bundle: 'context/module.json' },
      { seed: 'canon-species', vocabulary }, source);
    expect(draft.instance.campaign!.creatures.some(c => c.context.raceId === 'local_hound')).toBe(true);
    expect(vocabulary.creature('local_hound').name).toBe('wolf');
  });
  it('refuses a canon child whose existing parent has a different meaning', async () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ species: { local_hound: vocabulary.species('own',
      { id: 'local_hound', name: 'wolf', like: 'wolf' }) } });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: 'context.kyr', globals: [] }),
      'data/imbar/context.kyr': 'Module canon "Canon" { Species local_hound "bear" like bear. '
        + 'Species canon_child "cub" like local_hound. }',
      'context/site.kyr': 'Module child "Child" { Place yard "yard" is room. }',
      'context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    await expect(ModuleBundle.load({ id: 'child', bundle: 'context/module.json' }, { seed: 'canon', vocabulary }, source))
      .rejects.toThrow('Canon species canon_child depends on a different species local_hound');
    expect(vocabulary.creature('local_hound').name).toBe('wolf');
    expect(vocabulary.isSpecies('canon_child')).toBe(false);
  });
  it('refuses a canon child whose caller-owned ancestor depends on a conflicting species', async () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ species: { local_hound: vocabulary.species('own',
      { id: 'local_hound', name: 'wolf', like: 'wolf' }) } });
    vocabulary.install({ species: { middle: vocabulary.species('own',
      { id: 'middle', name: 'middle', like: 'local_hound' }) } });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: 'context.kyr', globals: [] }),
      'data/imbar/context.kyr': 'Module canon "Canon" { Species local_hound "bear" like bear. '
        + 'Species canon_child "cub" like middle. }',
      'context/site.kyr': 'Module child "Child" { Place yard "yard" is room. }',
      'context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    await expect(ModuleBundle.load({ id: 'child', bundle: 'context/module.json' }, { seed: 'canon', vocabulary }, source))
      .rejects.toThrow('Canon species canon_child depends on a different species local_hound');
    expect(vocabulary.isSpecies('canon_child')).toBe(false);
  });
  it('accepts unrelated canon children of aliased species', async () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ species: { local_hound: vocabulary.species('own',
      { id: 'local_hound', name: 'wolf', like: 'wolf' }) } });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: 'context.kyr', globals: [] }),
      'data/imbar/context.kyr': 'Module canon "Canon" { Species local_hound "bear" like bear. '
        + 'Species canon_child "child" like cave_hound. }',
      'context/site.kyr': 'Module child "Child" { Place yard "yard" is room. }',
      'context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    await ModuleBundle.load({ id: 'child', bundle: 'context/module.json' }, { seed: 'canon', vocabulary }, source);
    expect(vocabulary.isSpecies('canon_child')).toBe(true);
  });
  it('reads canon files with kinds declared in a later file', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: ['first.kyr', 'second.kyr'], globals: [] }),
      'data/imbar/first.kyr': 'Module first "First" { Kind heir "heir" like later_kind. }',
      'data/imbar/second.kyr': 'Module second "Second" { Kind later_kind "later kind" is gear worth 9. }' });
    const canon = await ModuleCanon.declarations(source, CanonVocabulary.scoped());
    expect(canon?.catalog.items?.heir).toMatchObject({ value: 9 });
  });
});

describe('composing kits', () => {
  it('does not let reading canon replace a campaign kind when a module inherits it', async () => {
    const vocabulary = CanonVocabulary.scoped({ items: { pharos_lens: LocalKinds.item('own',
      { id: 'pharos_lens', name: 'my lens', base: { category: 'gear' }, worth: 1 }) } });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'canon-context/site.kyr': 'Module child "Child" { Kind heir "Heir" like pharos_lens. }',
      'canon-context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    const result = await ModuleBundle.load({ id: 'child', bundle: 'canon-context/module.json' },
      { seed: 'canon-context', canonless: true, vocabulary }, source);
    expect(result.instance.module.catalog?.items?.heir).toMatchObject({ value: 1 });
    expect(vocabulary.itemDefinition('pharos_lens')?.value).toBe(1);
  });
  it('supplies missing canon kinds to a standalone bundle without replacing its own kinds', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: 'context.kyr', globals: [] }),
      'data/imbar/context.kyr': 'Module canon "Canon" { Kind canonical_token "canon token" is gear worth 40. }',
      'canon-context/site.kyr': 'Module child "Child" { Kind heir "Heir" like canonical_token. }',
      'canon-context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    const load = (vocabulary: CanonVocabulary) => ModuleBundle.load({ id: 'child', bundle: 'canon-context/module.json' },
      { seed: 'canon-context', vocabulary }, source);
    const own = CanonVocabulary.scoped({ items: { canonical_token: LocalKinds.item('own',
      { id: 'canonical_token', name: 'own token', base: { category: 'gear' }, worth: 1 }) } });
    expect((await load(CanonVocabulary.scoped())).instance.module.catalog?.items?.heir).toMatchObject({ value: 40 });
    expect((await load(own)).instance.module.catalog?.items?.heir).toMatchObject({ value: 1 });
    expect(own.itemDefinition('canonical_token')?.value).toBe(1);
  });
  it('refuses to mutate an unforkable vocabulary when reading canon', async () => {
    const scoped = CanonVocabulary.scoped();
    const vocabulary: Vocabulary = { id: scoped.id, kind: scoped.kind.bind(scoped), item: scoped.item.bind(scoped),
      species: scoped.species.bind(scoped), install: scoped.install.bind(scoped), seen: scoped.seen.bind(scoped),
      ability: scoped.ability.bind(scoped) };
    const before = scoped.fingerprint();
    await expect(ModuleCanon.declarations(NodeBundleSource.shared, vocabulary))
      .rejects.toThrow('Reading canon requires a forkable vocabulary');
    expect(scoped.fingerprint()).toBe(before);
  });
  it('reads a region whose later file declares a kind used in an earlier file', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'context/first.kyr': 'Module first "First" { Place yard "Yard" is room at 0, 0 outdoors. '
        + 'Item token "token" is later_kind at yard. }',
      'context/second.kyr': 'Module second "Second" { Kind later_kind "later kind" like base_kind. }',
      'context/third.kyr': 'Module third "Third" { Kind base_kind "base kind" is gear. }',
      'context/region.json': JSON.stringify({ version: 1, source: ['first.kyr', 'second.kyr', 'third.kyr'], rules: ['world'],
        assembly: {}, exports: { yard: 'yard' } }) });
    const vocabulary = CanonVocabulary.scoped(), request = { id: 'region', bundle: source.resolve('context/region.json') };
    const ledger = new Ledger(await Composition.vocabulary(source, vocabulary));
    await expect(Composition.region(ledger, request, source, vocabulary)).resolves.toBeUndefined();
    expect(vocabulary.itemDefinition('later_kind')?.name).toBe('later kind');
    const draft = await ModuleBundle.load(request, { seed: 'context', vocabulary: CanonVocabulary.scoped() }, source);
    expect(draft.instance.module.entities.some(e => e.id === 'region__token')).toBe(true);
  });
  it('reports an unresolved cycle between region kinds', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'context/a.kyr': 'Module a "A" { Kind alpha "alpha" like beta. }',
      'context/b.kyr': 'Module b "B" { Kind beta "beta" like alpha. }',
      'context/region.json': JSON.stringify({ source: ['a.kyr', 'b.kyr'], assembly: {} }) });
    const vocabulary = CanonVocabulary.scoped();
    const ledger = new Ledger(await Composition.vocabulary(source, vocabulary));
    await expect(Composition.region(ledger, { id: 'region', bundle: source.resolve('context/region.json') },
      source, vocabulary)).rejects.toThrow('beta');
  });
  it('reads the assembly vocabulary and region against the requested compilation context', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/assembly/vocabulary.kyr': 'Module vocab "Vocab" { Kind child "child" like context_parent. }',
      'context/region.kyr': 'Module region "Region" { Kind heir "heir" like context_parent. }',
      'context/region.json': JSON.stringify({ source: 'region.kyr', assembly: {} }) });
    const make = (name: string, value: number) => CanonVocabulary.scoped({ items: {
      context_parent: LocalKinds.item(name, { id: 'context_parent', name, base: { category: 'gear' }, worth: value }),
    } });
    const a = make('alpha', 1), b = make('beta', 9);
    const parsed = await Promise.all([Composition.vocabulary(source, a), Composition.vocabulary(source, b)]);
    expect(parsed.map(m => m.catalog?.items?.child?.name)).toEqual(['child', 'child']);
    expect([a.itemDefinition('child')?.value, b.itemDefinition('child')?.value]).toEqual([1, 9]);
    const ledger = new Ledger(ModuleParser.parse('Module empty "Empty" {}', [], CanonVocabulary.scoped()));
    const request = { id: 'region', bundle: source.resolve('context/region.json') };
    await Composition.region(ledger, request, source, a);
    await Composition.region(ledger, request, source, b);
    expect([a.itemDefinition('heir')?.value, b.itemDefinition('heir')?.value]).toEqual([1, 9]);
  });
  it('only reuses a prepared composition for an equivalent vocabulary', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared,
      { 'data/assembly/vocabulary.kyr': 'Module vocab "Vocab" { Kind child "child" like context_parent. }' });
    const make = (value: number) => CanonVocabulary.scoped({ items: {
      context_parent: LocalKinds.item('context', { id: 'context_parent', name: 'parent',
        base: { category: 'gear' }, worth: value }),
    } });
    const a = make(1), b = make(9);
    const composed = await Composition.expand([], { seed: 'context', source, vocabulary: a });
    expect(a.kind('child')).toBeUndefined();
    Composition.keep(source, 'context', composed, { seed: 'context', vocabulary: a });
    expect(Composition.take(source, 'context', 'context', b)).toBeUndefined();
    expect(Composition.take(source, 'context', 'context', make(1))).toBe(composed);
    expect(a.kind('child')).toBeUndefined();
    expect(Composition.take(source, 'context', 'context', a)).toBeUndefined();
    LocalKinds.activate({ items: { context_parent: a.itemDefinition('context_parent')! } });
    try {
      Composition.keep(source, 'ambient', composed, { seed: 'context', vocabulary: a });
      expect(Composition.take(source, 'ambient', 'context')).toBe(composed);
    } finally { LocalKinds.reset(); }
  });
  it('builds the fells\' Hob-Knot from the raider-hold kit with every slot and dimension fixed by its author', async () => {
    const m = await ModuleBundle.campaign(Compose.fells, NodeBundleSource.shared, 'fells');
    const text = m.composition!.trace.text().join('\n');
    expect(text).toContain('approach = fells__knot_foot (fixed)');
    expect(text).toContain('folk: fixed hobs, accepted');
    expect(m.modules.map(x => x.id)).toEqual(expect.arrayContaining(['knotHold', 'knotFolk']));
    expect(m.composition!.ledger.holds('ambushes', 'knot__band', 'fells__barrows')).toBe(true);
  }, 60000);
  it('binds what a proposal implies even when the author fixed the proposal: the settlement the hobs robbed of its bell', async () => {
    const m = await ModuleBundle.campaign(Compose.fells, NodeBundleSource.shared, 'fells');
    const placement = m.composition!.placements[0]!;
    expect(placement.bindings.chapel).toBe('fells__market');
    expect(m.composition!.trace.text().join('\n')).toMatch(/chapel = fells__market \(score \d+, of \d+ considered\)/);
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    expect(PlayerView.observe(s.campaign).observations.map(o => o.text).join(' ')).toContain('The bell is gone from its frame');
  }, 60000);
  it('refuses a fixing that breaks a hard requirement, and names it', async () => {
    const { path, source } = await Compose.variant({ id: 'bad', fix: { approach: 'fells.market' } });
    await expect(ModuleBundle.campaign(path, source, 'fells')).rejects.toThrow(/approach.*fells__market.*does not meet/);
  }, 60000);
  it('binds open slots by requirement and preference, and Deem fills the dimensions, the same way for the same seed', async () => {
    const { path, source } = await Compose.variant({ id: 'open' });
    const a = await ModuleBundle.campaign(path, source, 'one'), b = await ModuleBundle.campaign(path, source, 'one');
    const placed = a.composition!.placements[0]!;
    expect(b.composition!.placements[0]).toEqual(placed);
    // Whatever was chosen meets the kit's requirements: a free waypoint, a road within six hours, prey within eight.
    const ledger = a.composition!.ledger;
    expect(ledger.holds('waypoint', placed.bindings.approach!)).toBe(true);
    expect(ledger.number('hours', placed.bindings.road!, placed.bindings.approach!)).toBeLessThanOrEqual(6);
    expect(ledger.number('hours', placed.bindings.prey!, placed.bindings.approach!)).toBeLessThanOrEqual(8);
    expect(['hobs', 'outlaws']).toContain(placed.choices.folk!);
    // In mountains Deem proposes a cave three times in four; the trace says what it proposed and why it fits.
    expect(a.composition!.trace.text().join('\n')).toMatch(/hold: Deem proposes (cave|ringfort), accepted/);
  }, 60000);
  it('places a kit into a campaign already under way, taking nothing already taken', async () => {
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    await s.leg('wait_hour');
    const before = s.campaign.world.describe().filter(f => f.startsWith('at('));
    const later = await Composition.introduce(NodeBundleSource.shared.resolve(Compose.fells),
      { kit: Compose.kit, id: 'later' }, { seed: 'fells', source: NodeBundleSource.shared });
    expect(later.placement).toBeDefined();
    expect(later.placement!.bindings.approach).not.toBe('fells__knot_foot');
    for (const request of later.placement!.modules) { await s.campaign.install(request, NodeBundleSource.shared); }
    const after = s.campaign.world.describe().filter(f => f.startsWith('at('));
    expect(after).toEqual(expect.arrayContaining(before));
    expect(s.campaign.world.test(ModuleWriter.call('able', 'laterFolk__raiders'))
      || s.campaign.world.test(ModuleWriter.call('able', 'laterFolk__band'))).toBe(true);
  }, 120000);
});

describe('a kit that builds on another', () => {
  it('puts a price on the band an earlier placement put in the world, bound through the ledger', async () => {
    const m = await ModuleBundle.campaign(Compose.fells, NodeBundleSource.shared, 'fells');
    const price = m.composition!.placements.find(p => p.kit === 'bounty')!;
    expect(price.bindings).toEqual({ victim: 'fells__ford_green', power: 'knot__band', chief: 'knotFolk__chief',
      band: 'knotFolk__raiders', lair: 'fells__knot_foot' });
    expect(m.modules.find(x => x.id === 'pricePatron')!.imports).toMatchObject({ chief: 'knotFolk.chief', band: 'knotFolk.raiders' });
  }, 60000);
  it('pays when the band is broken, whichever patron Deem proposed', async () => {
    for (const patron of ['widow', 'elders']) {
      const source = NodeBundleSource.shared, path = source.resolve(Compose.fells);
      const manifest = JSON.parse(await source.read(path)) as { modules: Record<string, unknown>[] };
      manifest.modules = manifest.modules.map(x => x.id === 'price' ? { ...x, fix: { patron } } : x);
      const at = source.resolve(`test/fixtures/fells/fells-${patron}.campaign.json`);
      const s = await PlaySession.start(at, 'fells', new OverlayBundleSource(source, { [at]: JSON.stringify(manifest) }));
      Compose.put(s, 'fells__ford_green');
      await s.leg(Compose.legal(s).find(c => c.startsWith('pricePatron__offer'))!);
      // The offer says where the raiders hold out, and puts it on the company's map: somewhere to set out for.
      expect(s.campaign.world.test(ModuleWriter.call('leadsTo', 'pricePatron__price', 'fells__knot_foot'))).toBe(true);
      const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
      c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('routed', 'knotFolk__raiders') },
        { kind: 'assert', call: ModuleWriter.call('routed', 'knotFolk__gaffer') }]));
      await s.leg('wait');
      const gold = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
      await s.leg(Compose.legal(s).find(c => c.startsWith('pricePatron__claim'))!);
      expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold')) - gold).toBe(patron === 'widow' ? 15 : 25);
    }
  }, 120000);
});

describe('the raider-hold kit in play', () => {
  it('lets the hobs\' own stolen bell drive them off their gate', async () => {
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    Compose.put(s, 'knotHold__pit');
    await s.leg('field_spell(fells__member_party_3,conjure_light,fells__member_party_3)');
    await s.leg(Compose.legal(s).find(c => c.startsWith('take_out(knotFolk__handbell'))!);
    Compose.put(s, 'knotHold__ditch');
    const event = await s.leg(Compose.legal(s).find(c => c.startsWith('knotFolk__ring_bell'))!);
    expect([event.response, ...(event.perceptions ?? []).map(p => p.text)].join(' ')).toContain('run, howling');
    expect(Compose.legal(s)).toContain('go(knotHold__stake_gate,knotHold__yard)');
  }, 60000);
  // The hobs' plunder is theirs, as far as they are concerned: taken under the Gaffer's eyes it is not let go (PT-33:
  // "Don't touch nothing," and nothing came of touching).
  it('has the Gaffer object to his plunder taken under his eyes', async () => {
    const s = await PlaySession.start(Compose.fells, 'fells', NodeBundleSource.shared);
    Compose.put(s, 'knotHold__pit');
    const c = s.campaign as unknown as { world: { apply(c: unknown[]): unknown; one(r: string, a: string): string };
      commit(w: unknown): void };
    c.commit(c.world.apply([{ kind: 'retract', call: ModuleWriter.call('at', 'knotFolk__gaffer',
      c.world.one('at', 'knotFolk__gaffer')) }, { kind: 'assert', call: ModuleWriter.call('at', 'knotFolk__gaffer',
      'knotHold__pit') }]));
    await s.leg('field_spell(fells__member_party_3,conjure_light,fells__member_party_3)');
    const event = await s.leg(Compose.legal(s).find(x => x.startsWith('take_out(knotFolk__rings'))!);
    expect([event.response, ...(event.perceptions ?? []).map(p => p.text)].join(' ')).toContain('Said don\'t touch nothing');
    expect(s.campaign.world.test(ModuleWriter.call('hostile', 'knotFolk__gaffer', 'party'))).toBe(true);
  }, 60000);
  it('has outlaws who stop a company on their road by day, and let it go for road-money', async () => {
    const s = await PlaySession.start(Compose.outlaws, 'a', NodeBundleSource.shared);
    Compose.put(s, 'fells__alders');
    let stopped;
    for (let h = 0; h < 10 && !stopped; h++) {
      const e = await s.leg('wait_hour');
      if ([e.response, ...(e.perceptions ?? []).map(p => p.text)].join(' ').includes('Road-money')) { stopped = e; }
    }
    expect(stopped).toBeDefined();
    const pay = Compose.legal(s).find(c => c.startsWith('fellFolk__pay_road_money'))!;
    const paid = await s.leg(pay);
    expect(paid.combat).toHaveLength(0);
    expect(s.campaign.world.test(ModuleWriter.call('tolerates', 'fellFolk__band', 'party'))).toBe(true);
  }, 60000);
  it('lets a demand die with the men who made it', async () => {
    const s = await PlaySession.start(Compose.outlaws, 'a', NodeBundleSource.shared);
    Compose.put(s, 'fells__alders');
    const demanding = () => s.campaign.world.test(ModuleWriter.call('fellFolk__demanding', 'fellFolk__band'));
    for (let h = 0; h < 10 && !demanding(); h++) { await s.leg('wait_hour'); }
    expect(demanding()).toBe(true);
    const c = s.campaign as unknown as { creatures: CreatureStore;
      tickState: { definition: { actors: { id: string; members: string[] }[] } } };
    const band = c.tickState.definition.actors.find(a => a.id === 'fellFolk__band')!, lease = c.creatures.acquire(band.members);
    try {
      for (const m of lease.creatures) { m.state.hp = 0; }
      lease.commit(lease.creatures);
    } finally { lease.release(); }
    const told: string[] = [];
    for (let w = 0; w < 3; w++) { told.push(...((await s.leg('wait')).perceptions ?? []).map(p => p.text)); }
    expect(told.join(' ')).not.toContain('Have it your way');
    expect(demanding()).toBe(false);
    expect(Compose.legal(s).some(id => id.startsWith('fellFolk__pay_road_money'))).toBe(false);
  }, 60000);
});

describe('kits in generated regions', () => {
  async function generated(seed: string, terrain: string) {
    const world = await WorldAssembler.assemble(seed, NodeBundleSource.shared, { region: { terrain } });
    const manifest = await ModuleBundle.campaign(world.path, world.source, seed);
    return { world, placement: manifest.composition!.placements[0]! };
  }
  it('holds the raiders off the roads, at a site or in the depths of wild country', async () => {
    const { world, placement } = await generated('fen', 'marsh'), region = world.report.region;
    const approach = placement.bindings.approach!.replace('region__', '');
    const off = [...region.sites.map(w => w.id), ...region.atlas!.zones.flatMap(z => z.parts.slice(1)
      .map((_, i) => RegionZones.room(z, i + 1)))];
    expect(off).toContain(approach);
    expect(RegionGeography.roads(region).map(r => r.way)).not.toContain(approach);
    const s = await PlaySession.start(world.path, 'fen', world.source);
    expect(s.campaign.module.entities.some(e => e.id.startsWith('raidersFolk__'))).toBe(true);
  }, 120000);
  it('realizes the kit differently in different regions, in who the raiders are and what their hold is', async () => {
    const marsh = await generated('fen', 'marsh'), mountain = await generated('tor', 'mountain');
    expect([marsh.placement.choices, mountain.placement.choices]).toEqual([
      { hold: 'ringfort', folk: 'hobs' }, { hold: 'cave', folk: 'outlaws' }]);
    // Different folk, different ways to deal with them: a bell for hobs, a challenge for outlaws.
    const s = await PlaySession.start(mountain.world.path, 'tor', mountain.world.source);
    expect(s.campaign.module.entities.some(e => e.id === 'raidersFolk__challenge')
      || s.campaign.module.actions.some(a => a.id === 'raidersFolk__challenge')).toBe(true);
  }, 180000);
  // In ember Sir Hamo's men keep their cave beside Fyrsteport, a toll-house whose door speaks. What was shut on their
  // doorstep, opened under their eyes, draws their grudge in their own words: a company they had let by is let by no
  // more, nor heard hailed, until it pays for what it let out. A grudge, not a fight (PT-33: they had done nothing).
  it('has Sir Hamo\'s men resent the speaking door opened on their doorstep, until it is paid for', async () => {
    const world = await WorldAssembler.assemble('ember', NodeBundleSource.shared, { origin: 'herbs',
      party: [{ name: 'Aud', raceId: 'elf', classId: 'ranger' }] });
    const s = await PlaySession.start(world.path, 'ember', world.source), c = s.campaign;
    const holds = (name: string, ...args: string[]) => c.world.test(ModuleWriter.call(name, ...args));
    const gold = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    GeneratedWorld.put(s, 'w6');
    await s.leg(Compose.legal(s).find(id => id.startsWith('raidersFolk__hail'))!);
    expect(holds('tolerates', 'raidersFolk__band', 'party')).toBe(true);
    const right = c.module.actions.find(a => a.id.startsWith('region__w6_riddle_word')
      && a.success.some(x => x.kind === 'retract'))!;
    const opened = await s.leg(Compose.legal(s).find(id => id.startsWith(`${right.id}(`))!);
    expect([opened.response, ...(opened.perceptions ?? []).map(p => p.text)].join(' '))
      .toContain('Whatever was in it is out now, and it\'s us that live next door');
    expect(opened.combat).toHaveLength(0);
    expect(holds('tolerates', 'raidersFolk__band', 'party')).toBe(false);
    for (let w = 0; w < 3; w++) { await s.leg('wait'); }
    expect(holds('alarmed', 'raidersFolk__hamo') || holds('hostile', 'raidersFolk__hamo', 'party')).toBe(false);
    expect(Compose.legal(s).some(id => id.startsWith('raidersFolk__hail'))).toBe(false);
    const purse = gold();
    await s.leg(Compose.legal(s).find(id => id.startsWith('raidersFolk__make_amends'))!);
    expect([gold(), holds('tolerates', 'raidersFolk__band', 'party')]).toEqual([purse - 5, true]);
  }, 120000);
});

