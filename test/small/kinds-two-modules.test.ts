import { describe, expect, it, spyOn } from 'bun:test';
import { Tiny } from '../support/tiny';
import { NodeBundleSource } from '../../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../../src/campaign/overlay-bundle-source';
import { Canon } from '../../src/canon/canon';
import { ModuleBundle } from '../../src/campaign/module-bundle';
import { ModuleCanon } from '../../src/campaign/module-canon';
import { ModuleAssembly } from '../../src/campaign/module-assembly';
import { Cast } from '../../src/campaign/cast';
import { ItemTraits } from '../../src/campaign/item-traits';
import { EngineDeclarations } from '../../src/campaign/engine-declarations';
import { CampaignAssembly } from '../../src/campaign/campaign-assembly';
import { SingleModule } from '../../src/campaign/single-module';
import { LocalKinds } from '../../src/canon/local-catalog';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { ModuleParser } from '../../src/lang/module-parser';
import type { BundleSource } from '../../src/campaign/bundle-source';
import { Vocabularies, type KindMade, type Vocabulary } from '../../src/lang/vocabulary';

// Two modules of one campaign each giving a kind of their own the same name, two meanings (OR-540: the debt's
// generated purse_kind, a purse for the creditor, and the Lull's, Haskett's wages, met when the Lull was drawn as the
// next country of kite, and its install was refused). A module's own kind is its installation's, as its places are:
// the first keeps the name, and one another module has given to something else is the later installation's own,
// under its installation's name; each module's acts read its own.
const first = `Place yard "the yard" is room at 0, 0 outdoors. Company party "You" of 1 at yard.
  Kind purse_kind "a purse for the creditor" is gear worth 0 weighing 1 described "Heavy, and sewn shut.".
  Item purse "a purse" is purse_kind at yard.`;
const second = `Module wages "Wages" { Place mill "the mill" is room at 1, 0 outdoors.
  Kind purse_kind "a purse of wages" is gear worth 30 weighing 0 described "Thirty coin, for the wages.".
  Item wages_purse "a purse of wages" is purse_kind at mill. }`;
const source = new OverlayBundleSource(NodeBundleSource.shared, {
  'kinds-two/wages.kyr': second,
  'kinds-two/module.json': JSON.stringify({ version: 1, source: 'wages.kyr', rules: ['world'] }) });
const kind = (t: Tiny, item: string) => t.world.one('itemKind', item);
const worth = (t: Tiny, id: string) => t.world.number({ kind: 'call', name: 'worth', args: [id] });

class PausedSource implements BundleSource {
  private reached!: () => void;
  private resume!: () => void;
  readonly waiting = new Promise<void>(resolve => { this.reached = resolve; });
  private readonly continued = new Promise<void>(resolve => { this.resume = resolve; });
  constructor(private readonly source: BundleSource, private readonly paused: string) {}
  resolve(relative: string, from?: string): string { return this.source.resolve(relative, from); }
  async read(path: string): Promise<string> {
    if (path === this.paused) { this.reached(); await this.continued; }
    return this.source.read(path);
  }
  release(): void { this.resume(); }
}

describe('two modules of one campaign, one kind\'s name', () => {
  it('installs the later beside the first, each item of its own module\'s kind', async () => {
    const t = await Tiny.start(first, { seed: 'kinds-two' });
    await t.campaign.install({ id: 'wages', bundle: 'kinds-two/module.json' }, source);
    const [a, b] = [kind(t, 't__purse'), kind(t, 'wages__wages_purse')];
    expect([a, b]).toEqual(['purse_kind', 'wages__purse_kind']);
    expect([t.campaign.vocabulary?.itemDefinition(a!)?.name, t.campaign.vocabulary?.itemDefinition(b!)?.name])
      .toEqual(['a purse for the creditor', 'a purse of wages']);
    expect([worth(t, a!), worth(t, b!)]).toEqual([0, 30]);
  });
  it('reads the later ahead and puts it aside, the campaign\'s own kind its own again', async () => {
    const t = await Tiny.start(first, { seed: 'kinds-two-ahead' });
    await ModuleBundle.prepare(source.resolve('kinds-two/module.json'), source);
    expect(t.campaign.vocabulary?.itemDefinition('purse_kind')?.name).toBe('a purse for the creditor');
  });
});

describe('two campaigns of one process, one kind\'s name', () => {
  it('keeps a scoped canon vocabulary apart from the process catalogs', () => {
    const make = (name: string, value: number) => LocalKinds.item(name,
      { id: 'token', name, base: { category: 'gear' }, worth: value });
    const a = make('alpha', 1), b = make('beta', 9);
    const va = CanonVocabulary.scoped({ items: { token: a } }), vb = CanonVocabulary.scoped({ items: { token: b } });
    LocalKinds.activate({ items: { token: b } });
    const text = 'Module heir "Heir" { Kind made "made" like token. }';
    const read = (vocabulary: Vocabulary) => {
      return LocalKinds.merge(ModuleParser.parse(text, [], vocabulary).catalog).catalog?.items?.made?.value;
    };
    expect([read(va), read(vb), read(va), read(vb)]).toEqual([1, 9, 1, 9]);
    expect([va.kind('token')?.name, vb.kind('token')?.name, Canon.items.token?.name]).toEqual(['alpha', 'beta', 'beta']);
    expect(Canon.items.made).toBeUndefined();
  });
  it('resolves scoped species variants and rejects cycles', () => {
    const vocabulary = CanonVocabulary.scoped();
    const spec = { id: 'loop', name: 'loop', like: 'wolf' };
    vocabulary.install({ species: { loop: vocabulary.species('variants', spec) } });
    vocabulary.install({ species: { loop: vocabulary.species('variants', { ...spec, like: 'loop' }) } });
    expect(() => vocabulary.species('variants', { id: 'child', name: 'child', like: 'loop' }))
      .toThrow('Species variant cycle');
  });
  it('does not expose cached catalogs through a scoped vocabulary', () => {
    const text = 'Module isolated "Isolated" { Kind cache_token "token" is gear. }';
    const first = CanonVocabulary.scoped(), second = CanonVocabulary.scoped();
    ModuleParser.parse(text, [], first);
    ModuleParser.parse(text, [], second);
    const exposed = second.kind('cache_token')!;
    exposed.name = 'changed';
    expect(second.kind('cache_token')?.name).toBe('token');
    expect(ModuleParser.parse(text, [], CanonVocabulary.scoped()).catalog?.items?.cache_token?.name).toBe('token');
  });
  it('keeps scoped cache keys compact and sensitive to catalog changes', () => {
    const vocabulary = CanonVocabulary.scoped();
    const before = vocabulary.seen('like token');
    vocabulary.install({ items: { token: LocalKinds.item('keys', { id: 'token', name: 'token',
      base: { category: 'gear' } }) } });
    expect(vocabulary.seen('like token')).not.toBe(before);
    expect(vocabulary.seen('text').length).toBeLessThan(100);
  });
  it('does not add unrelated species to an item inheritance cache key', () => {
    const species = LocalKinds.species('cache', { id: 'hound', name: 'hound', like: 'wolf' });
    const vocabulary = CanonVocabulary.scoped({ species: Object.fromEntries(
      Array.from({ length: 513 }, (_, i) => [`unrelated_species_${i}`, species])) });
    expect(vocabulary.seen('Kind marker "marker" like dagger.').length).toBeLessThan(100);
  });
  it('leaves a scoped vocabulary unchanged when installing a conflicting catalog fails', () => {
    const make = (name: string) => LocalKinds.item('failure',
      { id: 'token', name, base: { category: 'gear' } });
    const vocabulary = CanonVocabulary.scoped({ items: { token: make('alpha') } });
    const before = vocabulary.seen('token');
    const wolf = vocabulary.species('failure', { id: 'wolf', name: 'wolf', like: 'wolf' });
    expect(() => vocabulary.install({ items: { token: make('beta') }, species: { wolf } })).toThrow();
    expect(vocabulary.kind('token')?.name).toBe('alpha');
    expect(vocabulary.seen('token')).toBe(before);
  });
  it('reads with the supplied vocabulary instead of the active one', () => {
    const make = (mass: number): Vocabulary => {
      const kinds: Record<string, KindMade> = { material: { name: `material ${mass}`, mass } };
      return {
        id: 'test-context',
        kind: id => kinds[id],
        item: (_module, spec) => {
          const parent = kinds[spec.base.like ?? ''];
          if (!parent) { throw new Error(`Unknown parent ${spec.base.like}`); }
          return { name: spec.name, mass: parent.mass };
        },
        species: () => { throw new Error('No species in this vocabulary'); },
        install: catalog => { Object.assign(kinds, catalog?.items); },
        seen: () => JSON.stringify(kinds),
        fingerprint: () => JSON.stringify(kinds),
        ability: () => undefined,
      };
    };
    const text = 'Module context "Context" { Kind made "made" like material. }';
    const a = make(1), b = make(9);
    const parse = (vocabulary: Vocabulary) => ModuleParser.parse(text, [], vocabulary).catalog?.items?.made?.mass;
    expect([parse(a), parse(b), parse(a), parse(b)]).toEqual([1, 9, 1, 9]);
    expect(ModuleParser.whole(text, [], make(3)).catalog?.items?.made?.mass).toBe(3);
  });
});
describe('scoped composition', () => {
  it('reads canonical declarations against the requesting vocabulary even for a shared source', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'data/imbar/module.json': JSON.stringify({ source: 'context.kyr', globals: ['context_kind'] }),
      'data/imbar/context.kyr': 'Module canon "Canon" { Place room "Room" is room at 0, 0 outdoors. '
        + 'Item token "token" is context_kind at room. }' });
    const make = (name: string) => CanonVocabulary.scoped({ items: {
      context_kind: LocalKinds.item(name, { id: 'context_kind', name, base: { category: 'gear' } }) } });
    const a = await ModuleCanon.declarations(source, make('alpha'));
    const b = await ModuleCanon.declarations(source, make('beta'));
    expect([a?.entities.get('context_kind')?.name, b?.entities.get('context_kind')?.name]).toEqual(['alpha', 'beta']);
  });
  it('does not make a scoped local species a talker', async () => {
    LocalKinds.reset();
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/den.kyr': 'Module den "Den" { Species local_wolf "local wolf" like wolf. '
        + 'Place cave "Cave" is room. Person beast "Beast" at cave { Species local_wolf. } }',
      'kinds-two/den.json': JSON.stringify({ version: 1, source: 'den.kyr', rules: ['world'] }) });
    const vocabulary = CanonVocabulary.scoped();
    const result = await ModuleBundle.load({ id: 'den', bundle: 'kinds-two/den.json' },
      { seed: 'scoped-den', vocabulary }, source);
    expect(result.instance.module.initial.some(c => c.call.name === 'talks' && c.call.args[0] === 'den__beast'))
      .toBe(false);
    const creature = result.instance.campaign!.creatures.find(c => c.id.includes('beast'))!;
    EngineDeclarations.declare(result, vocabulary);
    expect(result.instance.module.entities.some(e => e.id.startsWith(`${creature.id}__`))).toBe(false);
  });
  it('composes a generated item whose kind belongs to the supplied vocabulary', () => {
    const vocabulary = CanonVocabulary.scoped();
    const situation = ModuleParser.parse('Module s "S" { Kind generated_token "scoped token" is gear. }', [], vocabulary);
    situation.entities.push({ id: 'prize', type: 'item', name: 'prize' });
    const rules = ModuleParser.parse('Module rules "Rules" { Kind item. Kind itemkind. '
      + 'Relation itemKind(item, itemkind). }', [], vocabulary);
    const instance = ModuleAssembly.compose(situation, rules, {
      name: '', creatures: [], actors: { order: [] }, initial: [], outcomes: [], items: { prize: 'generated_token' },
    }, { seed: 'scoped-item', vocabulary });
    expect(instance.module.entities.find(e => e.id === 'prize')?.name).toBe('scoped token');
  });
  it('keeps the fuel traits of a scoped kind inherited from a lantern', async () => {
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/light.kyr': 'Module light "Light" { Kind my_lantern "my lantern" like lantern. '
        + 'Place room "room" is room. Item lamp "lamp" is my_lantern at room. '
        + 'Item oil "oil" is lamp_oil at room. }',
      'kinds-two/light.json': JSON.stringify({ version: 1, source: 'light.kyr', rules: ['world'] }) });
    const draft = await ModuleBundle.load({ id: 'light', bundle: 'kinds-two/light.json' },
      { seed: 'scoped-light', vocabulary: CanonVocabulary.scoped() }, source);
    const facts = draft.instance.module.initial;
    expect(facts.some(c => c.call.name === 'burns' && c.call.args.join(',') === 'my_lantern,lamp_oil')).toBe(true);
    expect(facts.some(c => c.call.name === 'fuel' && c.call.args[0] === 'lamp_oil')).toBe(true);
  });
  it('declares scoped worth without reading a conflicting active catalog', async () => {
    const make = (name: string, value: number) => LocalKinds.item(name,
      { id: 'value_token', name, base: { category: 'treasure' }, worth: value });
    const vocabulary = CanonVocabulary.scoped({ items: { value_token: make('alpha', 1) } });
    LocalKinds.activate({ items: { value_token: make('beta', 9) } });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/value.kyr': 'Module value "Value" { Place room "Room" is room. '
        + 'Item token "token" is value_token at room. }',
      'kinds-two/value.json': JSON.stringify({ version: 1, source: 'value.kyr', rules: ['world'] }) });
    const draft = await ModuleBundle.load({ id: 'value', bundle: 'kinds-two/value.json' },
      { seed: 'scoped-worth', vocabulary }, source);
    EngineDeclarations.declare(draft, vocabulary);
    const worth = draft.instance.module.initial.find(c => c.kind === 'set'
      && c.call.name === 'worth' && c.call.args[0] === 'value_token');
    expect(worth && 'value' in worth && worth.value).toEqual({ kind: 'number', value: 1 });
    expect(Canon.items.value_token?.value).toBe(9);
  });
  it('uses the scoped species when casting and naming a group', () => {
    const vocabulary = CanonVocabulary.scoped();
    const module = ModuleParser.parse('Module den "Den" { Species local_wolf "ash hound" like wolf. '
      + 'Place cave "Cave" is room. Person beast "Beast" at cave { Creature body wolf. } '
      + 'Person pack "Pack" at cave { Species local_wolf. Numbers 2. } }', [], vocabulary);
    const beast = module.people!.find(p => p.id === 'beast')!, pack = module.people!.find(p => p.id === 'pack')!;
    expect(Cast.person(beast, { raceId: 'local_wolf' }, [], vocabulary).context.raceId).toBe('local_wolf');
    expect(Cast.group(pack, {}, [], vocabulary).map(member => member.context.name)).toEqual(['Ash hound 1', 'Ash hound 2']);
  });
  it('preserves catalog item traits with a legacy vocabulary provider', () => {
    const module = ModuleParser.parse('Module t "T" { Kind itemkind. Relation wearable(itemkind). }');
    module.entities.push({ id: 'dagger', type: 'itemkind', name: 'dagger' });
    const canon = new CanonVocabulary();
    const legacy: Vocabulary = { id: 'legacy', kind: id => {
      const known = canon.kind(id);
      return known && { name: known.name, use: known.use };
    }, item: canon.item.bind(canon), species: canon.species.bind(canon), install: canon.install.bind(canon),
    seen: canon.seen.bind(canon), ability: canon.ability.bind(canon) };
    Vocabularies.use(legacy);
    try { ItemTraits.assert(module); } finally { Vocabularies.use(canon); }
    expect(module.initial.some(c => c.call.name === 'wearable' && c.call.args[0] === 'dagger')).toBe(true);
  });
  it('keeps declared values when a vocabulary parses another module', () => {
    const vocabulary: Vocabulary = {
      id: 'nested-context',
      kind: () => undefined,
      item: (_module, spec) => {
        ModuleParser.whole('Module nested "Nested" {}');
        return { name: spec.name };
      },
      species: () => { throw new Error('No species in this vocabulary'); },
      install: () => undefined,
      seen: () => '',
      fingerprint: () => '',
      ability: () => undefined,
    };
    const declared = [{ kyr: '', provenance: { generator: 'test', construct: 'observation' },
      observation: { id: 'outer', place: 'yard', when: { kind: 'boolean' as const, value: true }, text: 'Outer.' } }];
    const text = 'Module outer "Outer" { Kind made "made" is gear. }';
    expect(ModuleParser.whole(text, declared, vocabulary).observations?.map(o => o.id)).toEqual(['outer']);
    expect(ModuleParser.parse(text, declared, vocabulary).observations?.map(o => o.id)).toEqual(['outer']);
  });
  it('begins the second after the first, and the first plays on with its own', async () => {
    const a = await Tiny.start(first, { seed: 'kinds-two-a' });
    const b = await Tiny.start(second.replace('Module wages', 'Module b').replace('at 1, 0 outdoors.',
      'at 0, 0 outdoors. Company party "You" of 1 at mill.'), { seed: 'kinds-two-b' });
    expect(b.campaign.vocabulary?.itemDefinition('purse_kind')?.name).toBe('a purse of wages');
    await a.play('Wait a while');
    expect(a.campaign.vocabulary?.itemDefinition('purse_kind')?.name).toBe('a purse for the creditor');
  });
});
describe('parse and compilation cache isolation', () => {
  it('prepares against the initiating catalog without changing the catalog active after a pause', async () => {
    const make = (name: string, value: number) => LocalKinds.item(name,
      { id: 'ahead_parent', name, base: { category: 'gear' }, worth: value });
    const a = make('alpha', 1), b = make('beta', 9);
    const text = 'Module ahead "Ahead" { Kind ahead_heir "heir" like ahead_parent. }';
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/ahead-context.kyr': text,
      'kinds-two/ahead-context.json': JSON.stringify({ version: 1, source: 'ahead-context.kyr', rules: ['world'] }) });
    const paused = new PausedSource(source, source.resolve('kinds-two/ahead-context.kyr'));
    LocalKinds.activate({ items: { ahead_parent: a } });
    const preparing = ModuleBundle.prepare(source.resolve('kinds-two/ahead-context.json'), paused);
    await paused.waiting;
    LocalKinds.activate({ items: { ahead_parent: b } });
    paused.release(); await preparing;
    expect(Canon.items.ahead_parent?.value).toBe(9);
    const parse = spyOn(ModuleParser, 'parse');
    try {
      const draft = await ModuleBundle.load({ id: 'ahead', bundle: 'kinds-two/ahead-context.json' },
        { seed: 'ahead-context', vocabulary: CanonVocabulary.scoped({ items: { ahead_parent: a } }) }, source);
      expect(LocalKinds.merge(draft.instance.module.catalog).catalog?.items?.ahead_heir?.value).toBe(1);
      expect(parse.mock.calls.some(([sourceText]) => sourceText === text)).toBe(false);
    } finally { parse.mockRestore(); LocalKinds.reset(); }
  });
  it('reads the same module against each campaign\'s own definition, even when readings alternate', async () => {
    const a = await Tiny.start(first, { seed: 'kinds-cache-a' });
    const b = await Tiny.start(second.replace('Module wages', 'Module b').replace('at 1, 0 outdoors.',
      'at 0, 0 outdoors. Company party "You" of 1 at mill.'), { seed: 'kinds-cache-b' });
    const text = 'Module heir "Heir" { Kind inherited_purse "an inherited purse" like purse_kind. }';
    const read = (t: Tiny) => {
      LocalKinds.activate(t.campaign.module.catalog);
      ModuleParser.parse(text);
      return Canon.items.inherited_purse;
    };
    const firstA = read(a), firstB = read(b), againA = read(a), againB = read(b);
    expect([firstA?.value, firstB?.value, againA?.value, againB?.value]).toEqual([0, 30, 0, 30]);
    expect([firstA?.description, firstB?.description, againA?.description, againB?.description])
      .toEqual(['Heavy, and sewn shut.', 'Thirty coin, for the wages.',
        'Heavy, and sewn shut.', 'Thirty coin, for the wages.']);
  });
  it('keeps compiled modules apart when the same named kind has different definitions', async () => {
    const a = await Tiny.start(first, { seed: 'kinds-compiled-a' });
    const b = await Tiny.start(second.replace('Module wages', 'Module b').replace('at 1, 0 outdoors.',
      'at 0, 0 outdoors. Company party "You" of 1 at mill.'), { seed: 'kinds-compiled-b' });
    const heir = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/heir.kyr': 'Module heir "Heir" { Kind inherited_purse "an inherited purse" like purse_kind. }',
      'kinds-two/heir.json': JSON.stringify({ version: 1, source: 'heir.kyr', rules: ['world'] }) });
    const load = async (t: Tiny) => {
      LocalKinds.activate(t.campaign.module.catalog);
      const draft = await ModuleBundle.load({ id: 'heir', bundle: 'kinds-two/heir.json' },
        { seed: 'kinds-compiled', kinds: t.campaign.module.catalog }, heir);
      return LocalKinds.merge(draft.instance.module.catalog).catalog?.items?.inherited_purse;
    };
    const results = [await load(a), await load(b), await load(a), await load(b)];
    expect(results.map(x => x?.value)).toEqual([0, 30, 0, 30]);
    expect(results.map(x => x?.description)).toEqual(['Heavy, and sewn shut.', 'Thirty coin, for the wages.',
      'Heavy, and sewn shut.', 'Thirty coin, for the wages.']);
  });
  it('reads and caches interleaved bundles against their supplied vocabularies', async () => {
    const make = (name: string, value: number) => LocalKinds.item(name,
      { id: 'context_purse', name, base: { category: 'gear' }, worth: value });
    const bundle = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/context.kyr': 'Module context "Context" { Kind heir "heir" like context_purse. }',
      'kinds-two/context.json': JSON.stringify({ version: 1, source: 'context.kyr', rules: ['world'] }) });
    const request = { id: 'context', bundle: 'kinds-two/context.json' };
    const vocabulary = (name: string, value: number) =>
      CanonVocabulary.scoped({ items: { context_purse: make(name, value) } });
    const load = (v: Vocabulary, s: BundleSource) =>
      ModuleBundle.load(request, { seed: 'context-bundle', vocabulary: v }, s);
    const read = (draft: Awaited<ReturnType<typeof load>>) =>
      LocalKinds.merge(draft.instance.module.catalog).catalog?.items?.heir?.value;
    const paused = new PausedSource(bundle, bundle.resolve('kinds-two/context.kyr'));
    const a = load(vocabulary('alpha', 1), paused);
    await paused.waiting;
    const b = await load(vocabulary('beta', 9), bundle);
    paused.release();
    expect([read(await a), read(b)]).toEqual([1, 9]);
    expect([read(await load(vocabulary('alpha', 1), bundle)),
      read(await load(vocabulary('beta', 9), bundle))]).toEqual([1, 9]);
  });
  it('reads multi-file bundles with a vocabulary without a fingerprint', async () => {
    const scoped = CanonVocabulary.scoped();
    const vocabulary: Vocabulary = { id: scoped.id, kind: scoped.kind.bind(scoped), item: scoped.item.bind(scoped),
      species: scoped.species.bind(scoped), install: scoped.install.bind(scoped), seen: scoped.seen.bind(scoped),
      ability: scoped.ability.bind(scoped), itemTraits: scoped.itemTraits.bind(scoped),
      fork: scoped.fork.bind(scoped) };
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/earlier.kyr': 'Module context "Context" { Place yard "yard" is room at 0, 0 outdoors. '
        + 'Item token "token" is later_kind at yard. }',
      'kinds-two/later.kyr': 'Module later "Later" { Kind later_kind "later kind" is gear. }',
      'kinds-two/multi.json': JSON.stringify({ version: 1, source: ['earlier.kyr', 'later.kyr'], rules: ['world'] }) });
    const draft = await ModuleBundle.load({ id: 'context', bundle: 'kinds-two/multi.json' },
      { seed: 'no-fingerprint', vocabulary }, source);
    expect(draft.instance.module.entities.some(e => e.id === 'later_kind' && e.name === 'later kind')).toBe(true);
  });
});
describe('parse cache dependencies', () => {
  it('starts interleaved campaigns with each one\'s own local species', async () => {
    const text = (name: string) => `Module start "Start" { Species local_wolf "${name}" like wolf.
      Place yard "yard" is room. Company party "You" of 1 at yard.
      Person hound "Hound" at yard { Species local_wolf. } }`;
    const start = (name: string) => SingleModule.source(text(name), { own: true });
    const a = start('amber wolf'), b = start('silver wolf');
    const paused = new PausedSource(a.source, a.source.resolve('site.kyr', a.campaign));
    const first = CampaignAssembly.assemble(a.campaign, 'start-a', paused, {});
    await Promise.race([paused.waiting, first.then(() => { throw new Error('Campaign did not reach the paused source'); })]);
    const second = await CampaignAssembly.assemble(b.campaign, 'start-b', b.source, {});
    paused.release();
    const resumed = await first;
    expect(resumed.module.catalog?.species?.local_wolf?.name).toBe('amber wolf');
    expect(second.module.catalog?.species?.local_wolf?.name).toBe('silver wolf');
  });
  it('does not let an interleaved start borrow another campaign\'s kind', async () => {
    const body = 'Place yard "yard" is room. Company party "You" of 1 at yard.';
    const a = SingleModule.source(`${body} Kind heir "heir" like foreign_kind.`, { own: true });
    const b = SingleModule.source(`${body} Kind foreign_kind "foreign" is treasure.`, { own: true });
    const paused = new PausedSource(a.source, a.source.resolve('site.kyr', a.campaign));
    const first = CampaignAssembly.assemble(a.campaign, 'missing-a', paused, {});
    await Promise.race([paused.waiting, first.then(() => { throw new Error('Campaign did not reach the paused source'); })]);
    await CampaignAssembly.assemble(b.campaign, 'missing-b', b.source, {});
    paused.release();
    await expect(first).rejects.toThrow('foreign_kind');
  });
  it('does not replace another campaign catalog when an interleaved install fails', async () => {
    const bText = second.replace('Module wages', 'Module b').replace('at 1, 0 outdoors.',
      'at 0, 0 outdoors. Company party "You" of 1 at mill.');
    const a = await Tiny.start(first, { seed: 'failure-a', own: true });
    const b = await Tiny.start(bText, { seed: 'failure-b', own: true });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/broken.kyr': 'Module broken "Broken" { Kind bad "bad" like absent_kind. }',
      'kinds-two/broken.json': JSON.stringify({ version: 1, source: 'broken.kyr', rules: ['world'] }) });
    void a.campaign.world;
    const paused = new PausedSource(source, source.resolve('kinds-two/broken.kyr'));
    const installing = a.campaign.install({ id: 'broken', bundle: 'kinds-two/broken.json' }, paused);
    await paused.waiting;
    void b.campaign.world;
    paused.release();
    await expect(installing).rejects.toThrow('absent_kind');
    expect(b.campaign.vocabulary?.itemDefinition('purse_kind')?.name).toBe('a purse of wages');
    expect(a.campaign.vocabulary?.itemDefinition('purse_kind')?.name).toBe('a purse for the creditor');
  });
  it('does not reclaim kinds for an install rejected after the campaign advances', async () => {
    const bText = second.replace('Module wages', 'Module b').replace('at 1, 0 outdoors.',
      'at 0, 0 outdoors. Company party "You" of 1 at mill.');
    const a = await Tiny.start(first, { seed: 'advanced-a', own: true });
    const b = await Tiny.start(bText, { seed: 'advanced-b', own: true });
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/new.kyr': 'Module new "New" { Kind new_token "new token" is gear. }',
      'kinds-two/new.json': JSON.stringify({ version: 1, source: 'new.kyr', rules: ['world'] }) });
    const paused = new PausedSource(source, source.resolve('kinds-two/new.kyr'));
    const installing = a.campaign.install({ id: 'new', bundle: 'kinds-two/new.json' }, paused);
    await paused.waiting;
    a.campaign.advanceWatch([]);
    void b.campaign.world;
    paused.release();
    await expect(installing).rejects.toThrow('Campaign advanced while loading module');
    expect(b.campaign.vocabulary?.itemDefinition('purse_kind')?.name).toBe('a purse of wages');
    expect(a.campaign.vocabulary?.itemDefinition('new_token')).toBeUndefined();
  });
  it('distinguishes hyphenated kinds and an inherited kind with the same name', () => {
    for (const [base, derived] of [['shared-kind', 'derived'], ['shared_kind', 'shared_kind']]) {
      const make = (name: string, value: number) => LocalKinds.item(name,
        { id: base!, name, base: { category: 'gear' }, worth: value });
      const text = `Module heir "Heir" {\nKind ${derived} "Derived" like ${base}.\n}`;
      const read = (value: number) => {
        LocalKinds.activate({ items: { [base!]: make(`parent ${value}`, value) } });
        ModuleParser.parse(text);
        return Canon.items[derived!]?.value;
      };
      expect([read(1), read(9), read(1)]).toEqual([1, 9, 1]);
    }
  });
  it('distinguishes Unicode kinds and a species declared with the same name as an item', () => {
    for (const [id, declaration] of [['café', ''], ['token', 'Species token "a wolf" like wolf.']]) {
      const text = `Module heir "Heir" {\n${declaration}\nItem parcel is ${id} nowhere.\n}`;
      const read = (name: string) => {
        const item = LocalKinds.item(name, { id: id!, name, base: { category: 'gear' } });
        LocalKinds.activate({ items: { [id!]: item } });
        return ModuleParser.parse(text).entities.find(e => e.id === 'parcel')?.name;
      };
      expect([read('alpha'), read('beta'), read('alpha')]).toEqual(['an alpha', 'a beta', 'an alpha']);
    }
  });
  it('distinguishes a kind joined directly to a keyword', () => {
    const text = 'Module heir "Heir" { Item parcel istoken nowhere. }';
    const read = (name: string) => {
      const item = LocalKinds.item(name, { id: 'token', name, base: { category: 'gear' } });
      LocalKinds.activate({ items: { token: item } });
      return ModuleParser.parse(text).entities.find(e => e.id === 'parcel')?.name;
    };
    expect([read('alpha'), read('beta')]).toEqual(['an alpha', 'a beta']);
  });
  it('does not reuse a kind validated against a slot that has gone away', () => {
    const item = LocalKinds.item('provider', { id: 'provider', name: 'provider', base: { category: 'gear' } });
    const provider = { ...item, slot: 'unusual_slot' };
    const text = 'Module heir "Heir" { Kind made "made" is gear worn as unusual_slot. }';
    LocalKinds.activate({ items: { provider } });
    expect(ModuleParser.parse(text).catalog?.items?.made).toBeDefined();
    LocalKinds.reset();
    expect(() => ModuleParser.parse(text)).toThrow('where nothing of the catalog is worn');
  });
  it('keeps shared files apart when a later file declares an earlier file\'s kind', () => {
    const files = [
      { path: 'first.kyr', text: 'Module first "First" { Item parcel is token nowhere. }' },
      { path: 'second.kyr', text: 'Module second "Second" {\nKind token "the local token" is gear.\n}' },
    ];
    const read = (name: string) => {
      const item = LocalKinds.item(name, { id: 'token', name, base: { category: 'gear' } });
      LocalKinds.activate({ items: { token: item } });
      return ModuleBundle['shared'](files).entities.find(e => e.id === 'parcel')?.name;
    };
    expect([read('alpha'), read('beta')]).toEqual(['an alpha', 'a beta']);
  });
  it('installs interleaved campaigns as if each installation ran alone', async () => {
    const bText = second.replace('Module wages', 'Module b').replace('at 1, 0 outdoors.',
      'at 0, 0 outdoors. Company party "You" of 1 at mill.');
    const heir = new OverlayBundleSource(NodeBundleSource.shared, {
      'kinds-two/interleaved.kyr': 'Module heir "Heir" { Kind inherited_purse "an inherited purse" like purse_kind. }',
      'kinds-two/interleaved.json': JSON.stringify({ version: 1, source: 'interleaved.kyr', rules: ['world'] }) });
    const request = { id: 'heir', bundle: 'kinds-two/interleaved.json' };
    const start = async () => [
      await Tiny.start(first, { seed: 'interleave-a', own: true }),
      await Tiny.start(bText, { seed: 'interleave-b', own: true }),
    ] as const;
    const snapshot = (t: Tiny) => ({ module: t.campaign.module, world: t.campaign.world.view });
    const [sequentialA, sequentialB] = await start();
    void sequentialA.campaign.world; await sequentialA.campaign.install(request, heir);
    void sequentialB.campaign.world; await sequentialB.campaign.install(request, heir);
    const expected = [snapshot(sequentialA), snapshot(sequentialB)];
    const [a, b] = await start();
    void a.campaign.world;
    const paused = new PausedSource(heir, heir.resolve('kinds-two/interleaved.kyr'));
    const installing = a.campaign.install(request, paused);
    await paused.waiting;
    void b.campaign.world; await b.campaign.install(request, heir);
    paused.release(); await installing;
    expect([snapshot(a), snapshot(b)]).toEqual(expected);
  });
});
