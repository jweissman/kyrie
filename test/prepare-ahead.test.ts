import { describe, expect, it, spyOn } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { Canon } from '../src/canon/canon';
import { LocalKinds } from '../src/canon/local-catalog';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';
import { Vocabularies, type Vocabulary } from '../src/lang/vocabulary';
import { Overlays } from '../src/overlays';

// A module read ahead of its being drawn into the game in play (the country beyond a march, while the player reads)
// is parsed then, and found parsed when it is loaded; but the kinds of its own it declares are not left in the
// catalogs meanwhile, for a country never gone to has none in this world. (The probe declares a little ox of dreg,
// and a jar of the day like the old glossary.)
describe('a module prepared ahead', () => {
  it('declares canonical gear even with a legacy provider that does not expose it', async () => {
    const bundle = new OverlayBundleSource(NodeBundleSource.shared, {
      'ahead/gear.kyr': 'Module gear "Gear" { Place room "Room" is room. Company party "You" of 1 at room. }',
      'ahead/gear.json': JSON.stringify({ version: 1, source: 'gear.kyr', rules: ['world'] }) });
    const draft = await ModuleBundle.load({ id: 'gear', bundle: 'ahead/gear.json' }, { seed: 'gear' }, bundle);
    draft.instance.campaign!.creatures[0]!.context = { raceId: 'human', classId: 'warrior' };
    const canon = new CanonVocabulary();
    const legacy: Vocabulary = { id: 'legacy-no-gear', kind: () => undefined, item: canon.item.bind(canon),
      species: canon.species.bind(canon), install: canon.install.bind(canon), seen: canon.seen.bind(canon),
      ability: canon.ability.bind(canon) };
    Vocabularies.use(legacy);
    try { Overlays.declareGear(draft.instance); } finally { Vocabularies.use(canon); }
    expect(draft.instance.module.entities.some(e => e.id.endsWith('__longsword'))).toBe(true);
  });
  it('leaves its own kinds out of the catalogs until it is loaded, and is loaded as it would have been', async () => {
    LocalKinds.reset();
    // A copy of the probe under a path no other spec reads, so that this one is the first to parse it.
    const base = NodeBundleSource.shared, text = await base.read(base.resolve('test/fixtures/probes/local-kind/site.kyr'));
    const files = { 'ahead/module.json': await base.read(base.resolve('test/fixtures/probes/local-kind/module.json')),
      'ahead/site.kyr': `${text}\n// read ahead` };
    const source = new OverlayBundleSource(base, files), path = source.resolve('ahead/module.json');
    await ModuleBundle.prepare(path, source);
    expect(Canon.items.dreg_ox).toBeUndefined();
    expect(Canon.items.day_jar).toBeUndefined();
    // Loaded, it is not parsed again: it was parsed ahead.
    const parse = spyOn(ModuleParser, 'parse');
    const draft = await ModuleBundle.load({ id: 'p', bundle: path }, { seed: 'ahead' }, source).finally(() => {
      expect(parse.mock.calls.some(([t]) => t === files['ahead/site.kyr'])).toBe(false);
      parse.mockRestore();
    });
    expect(Canon.items.dreg_ox?.name).toBe('a little ox of dreg, on a cord');
    expect(draft.instance.module.entities.some(e => e.id === 'p__dreg_ox' || e.id === 'dreg_ox')).toBe(true);
    LocalKinds.reset();
  });
  it('takes out only what was joined while it was read', () => {
    LocalKinds.reset();
    const kind = LocalKinds.item('kept', { id: 'kept_cup', name: 'a kept cup', base: { category: 'treasure' } });
    LocalKinds.install({ items: { kept_cup: kind } });
    LocalKinds.aside(() => {
      LocalKinds.install({ items: { read_cup: LocalKinds.item('read', { id: 'read_cup', name: 'a cup read ahead',
        base: { category: 'treasure' } }) } });
      expect(Canon.items.read_cup?.name).toBe('a cup read ahead');
    });
    expect(Canon.items.read_cup).toBeUndefined();
    expect(Canon.items.kept_cup?.name).toBe('a kept cup');
    LocalKinds.reset();
  });
  it('reuses a prepared parse when loading with an equivalent scoped vocabulary', async () => {
    LocalKinds.reset();
    const text = 'Module ahead "Ahead" { Kind ahead_token "token" is gear. }';
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ahead/scoped.kyr': text,
      'ahead/scoped.json': JSON.stringify({ version: 1, source: 'scoped.kyr', rules: ['world'] }) });
    await ModuleBundle.prepare(source.resolve('ahead/scoped.json'), source);
    const parse = spyOn(ModuleParser, 'parse');
    try {
      await ModuleBundle.load({ id: 'ahead', bundle: 'ahead/scoped.json' },
        { seed: 'ahead-scoped', vocabulary: CanonVocabulary.scoped() }, source);
      expect(parse.mock.calls.some(([sourceText]) => sourceText === text)).toBe(false);
    } finally { parse.mockRestore(); LocalKinds.reset(); }
  });
  it('prepares inherited kinds against the requesting campaign catalog', async () => {
    const parent = LocalKinds.item('parent', { id: 'ahead_parent', name: 'parent',
      base: { category: 'treasure' }, worth: 7 });
    const vocabulary = CanonVocabulary.scoped({ items: { ahead_parent: parent } });
    const text = 'Module scoped "Scoped" { Kind ahead_child "child" like ahead_parent. }';
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ahead/scoped-parent.kyr': text,
      'ahead/scoped-parent.json': JSON.stringify({ version: 1, source: 'scoped-parent.kyr', rules: ['world'] }) });
    LocalKinds.reset();
    await ModuleBundle.prepare(source.resolve('ahead/scoped-parent.json'), source, vocabulary);
    const parse = spyOn(ModuleParser, 'parse');
    try {
      const draft = await ModuleBundle.load({ id: 'scoped', bundle: 'ahead/scoped-parent.json' },
        { seed: 'scoped-parent', vocabulary: vocabulary.fork() }, source);
      expect(LocalKinds.merge(draft.instance.module.catalog).catalog?.items?.ahead_child?.value).toBe(7);
      expect(parse.mock.calls.some(([sourceText]) => sourceText === text)).toBe(false);
    } finally { parse.mockRestore(); LocalKinds.reset(); }
  });
  it('warms a module without leaving its local kinds in the active catalog', async () => {
    LocalKinds.reset();
    const text = 'Module warm "Warm" { Kind warm_token "token" is gear. }';
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ahead/warm.kyr': text,
      'ahead/warm.json': JSON.stringify({ version: 1, source: 'warm.kyr', rules: ['world'] }) });
    await ModuleBundle.warm(source.resolve('ahead/warm.json'), source);
    expect(Canon.items.warm_token).toBeUndefined();
    const parse = spyOn(ModuleParser, 'parse');
    try {
      await ModuleBundle.load({ id: 'warm', bundle: 'ahead/warm.json' },
        { seed: 'warm', vocabulary: CanonVocabulary.scoped() }, source);
      expect(parse.mock.calls.some(([sourceText]) => sourceText === text)).toBe(false);
    } finally { parse.mockRestore(); LocalKinds.reset(); }
  });
  it('does not prepare or warm into an unforkable custom vocabulary', async () => {
    LocalKinds.reset();
    const canon = new CanonVocabulary();
    const isolated = CanonVocabulary.scoped();
    const custom: Vocabulary = { id: 'legacy-ahead', kind: isolated.kind.bind(isolated),
      item: isolated.item.bind(isolated),
      species: isolated.species.bind(isolated), install: isolated.install.bind(isolated),
      seen: isolated.seen.bind(isolated),
      ability: isolated.ability.bind(isolated) };
    const text = 'Module custom "Custom" { Kind custom_token "token" is gear. }';
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ahead/custom.kyr': text,
      'ahead/custom.json': JSON.stringify({ version: 1, source: 'custom.kyr', rules: ['world'] }) });
    Vocabularies.use(custom);
    try {
      await ModuleBundle.prepare(source.resolve('ahead/custom.json'), source);
      await ModuleBundle.warm(source.resolve('ahead/custom.json'), source);
      await ModuleBundle.warmRules(source);
      expect(custom.kind('custom_token')).toBeUndefined();
      await expect(ModuleBundle.load({ id: 'custom', bundle: 'ahead/custom.json' }, { seed: 'custom' }, source))
        .rejects.toThrow('Reading canon requires a forkable vocabulary');
    } finally { Vocabularies.use(canon); LocalKinds.reset(); }
  });
});
