import { describe, expect, it } from 'bun:test';
import animals from '../data/catalog/animals.json';
import monsters from '../data/catalog/monsters.json';
import variations from '../data/catalog/variations.json';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { Cast } from '../src/campaign/cast';
import { CreaturePortraits } from '../src/paintings/creature-portraits';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { OverlayBundleSource } from '../src/campaign/overlay-bundle-source';
import { PlaySession } from '../src/session/play-session';
import { ModuleParser } from '../src/lang/module-parser';
import { LocalKinds } from '../src/canon/local-catalog';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';
import { CreatureSchema } from '../src/creature';
import { CombatProjection } from '../src/combat-projection';
import { ItemCatalog } from '../src/item-catalog';
import { CreatureStore } from '../src/creature-store';
import { CampaignAssembly } from '../src/campaign/campaign-assembly';
import { Campaign } from '../src/campaign/campaign';
import { SingleModule } from '../src/campaign/single-module';
import type { BundleSource } from '../src/campaign/bundle-source';
import { PartyCapabilities } from '../src/campaign/party-capabilities';
import { Burden } from '../src/rules/burden';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { Projection } from '../src/campaign/projection';
import { Items } from '../src/campaign/items';
import { Battle } from '../src/battle';
import { Tactics } from '../src/tactics';
import { DangerSense } from '../src/presentation/danger-sense';
import { RunnerFight } from '../src/cli/runner-fight';
import { Expressions } from '../src/expressions';
import { ModuleWriter } from '../src/lang/module-writer';
import { Checks } from '../src/rules/checks';
import { SkillSources } from '../src/presentation/skill-sources';
import { Unread } from '../src/presentation/unread';
import { Shut } from '../src/presentation/shut';
import { CharacterSheets } from '../src/presentation/character-sheet';
import { BandNames } from '../src/narrative/band-names';
import { PlayerView } from '../src/presentation/player-view';
import { Owed } from '../src/ui/owed';
import { Services } from '../src/ui/services';
import { EncyclopediaEntry } from '../src/ui/encyclopedia-entry';
import { CombatPresenter } from '../src/ui/combat-presenter';
import { CombatModel } from '../src/ui/combat-model';
import { ScreenModel } from '../src/ui/screen-model';

// One creature pipeline (the owner, 5 November; doc/history/missions/19/creatures.md): every creature is made from
// its kind's one record (data/catalog/animals.json, monsters.json, Orsino's generated kinds), a kind named for what
// varies it is its base with those variations, a kind added by its record alone is made in play by an author's
// Person and by what a country generates alike, and is shown, fights and is kept by that record.
const make = (raceId: string, more: Record<string, unknown> = {}) =>
  new Content('pipeline').createCreature('c', { raceId, ...more } as never, 'c');
describe('scoped creature presentation', () => {
  it('finds a local creature portrait and encyclopedia entry in its campaign', () => {
    const make = (like: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ species: { context_beast: vocabulary.species('context',
        { id: 'context_beast', name: `${like} beast`, like }) } });
      return vocabulary;
    };
    const a = make('wolf'), b = make('bear');
    LocalKinds.activate({ species: { context_beast: b.speciesDefinition('context_beast')! } });
    try {
      expect(CreaturePortraits.painting('context_beast', a)).toBe(CreaturePortraits.painting('wolf'));
      expect(CreaturePortraits.painting('context_beast', b)).toBe(CreaturePortraits.painting('bear'));
      expect(EncyclopediaEntry.creature('context_beast', a)).toMatchObject({ id: 'species-wolf', name: 'wolf beast' });
      expect(EncyclopediaEntry.creature('context_beast', b)).toMatchObject({ id: 'species-bear', name: 'bear beast' });
      const kind = { ...a.speciesDefinition('context_beast')!, kind: 'monster' as const };
      a.install({ species: { context_beast: kind } });
      expect(Canon.soul('context_beast', 'pron_she', a)).toBe(true);
      expect(Canon.soul('context_beast', 'pron_she', b)).toBe(false);
    } finally { LocalKinds.reset(); }
  });
});
describe('scoped creature catalogs', () => {
  it('starts interleaved campaigns with the same worlds and creatures as sequential starts', async () => {
    const text = (kind: string, value: number, like: string) => `Module start "Start" {
      Species local_beast "${kind}" like ${like}.
      Kind local_treasure "${kind} treasure" is treasure worth ${value}.
      Place yard "yard" is room. Company party "You" of 1 at yard.
      Item prize "prize" is local_treasure at yard.
      Person beast "Beast" at yard { Species local_beast. } }`;
    const a = SingleModule.source(text('amber wolf', 3, 'wolf'), { own: true });
    const b = SingleModule.source(text('silver bear', 9, 'bear'), { own: true });
    const shape = (campaign: Awaited<ReturnType<typeof CampaignAssembly.assemble>>) => structuredClone({
      module: campaign.module, world: campaign.world.describe(), creatures: campaign.readout.creatures });
    const sequentialA = shape(await CampaignAssembly.assemble(a.campaign, 'interleave-a', a.source, {}));
    const sequentialB = shape(await CampaignAssembly.assemble(b.campaign, 'interleave-b', b.source, {}));
    let reached!: () => void, resume!: () => void;
    const waiting = new Promise<void>(resolve => { reached = resolve; });
    const continued = new Promise<void>(resolve => { resume = resolve; });
    const paused: BundleSource = { resolve: (relative, from) => a.source.resolve(relative, from),
      async read(path) {
        if (path === a.source.resolve('site.kyr', a.campaign)) { reached(); await continued; }
        return a.source.read(path);
      } };
    const first = CampaignAssembly.assemble(a.campaign, 'interleave-a', paused, {});
    await Promise.race([waiting, first.then(() => { throw new Error('Start did not reach its paused source'); })]);
    try {
      const second = await CampaignAssembly.assemble(b.campaign, 'interleave-b', b.source, {});
      expect(shape(second)).toEqual(sequentialB);
    } finally { resume(); }
    expect(shape(await first)).toEqual(sequentialA);
  });
  it('installs a new local species into a campaign whose creature store is scoped', async () => {
    const start = SingleModule.source('Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true });
    const campaign = await CampaignAssembly.assemble(start.campaign, 'install-beast', start.source, {});
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'creature-context/site.kyr': 'Module den "Den" { Species den_beast "den beast" like wolf. '
        + 'Place cave "cave" is room. Person beast "beast" at cave { Species den_beast. } }',
      'creature-context/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'] }) });
    await campaign.install({ id: 'den', bundle: 'creature-context/module.json' }, source);
    expect(campaign.readout.creatures.some(c => c.raceId === 'den_beast')).toBe(true);
  });
  it('keeps local species scoped in loaded and restored creature stores', async () => {
    const start = SingleModule.source('Species local_beast "beast" like wolf. '
      + 'Place yard "yard" is room. Company party "You" of 1 at yard. '
      + 'Person beast "Beast" at yard { Species local_beast. }', { own: true });
    const loaded = await Campaign.load(start.campaign, 'scoped-store', start.source);
    const restored = Campaign.restore(loaded.save());
    for (const campaign of [loaded, restored]) {
      const store = campaign['creatures'];
      const creature = store.live.find(c => c.raceId === 'local_beast')!;
      const lease = store.acquire([creature.id]);
      try {
        LocalKinds.reset();
        lease.creatures[0]!.state.hp--;
        expect(() => lease.commit(lease.creatures)).not.toThrow();
      } finally { lease.release(); }
    }
  });
  it('accepts a starting companion carrying a kind from its own module', async () => {
    const start = SingleModule.source('Kind special_token "token" is gear. '
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true,
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior', outfit: 'own', gear: ['special_token'] }] });
    const campaign = await CampaignAssembly.assemble(start.campaign, 'starting-gear', start.source, {});
    expect(campaign.readout.creatures.some(c => c.state.inventory?.some(i => i.definition === 'special_token')))
      .toBe(true);
  });
  it('projects the party with its own item catalog after another campaign becomes active', async () => {
    const start = SingleModule.source('Kind special_blade "blade" like dagger. '
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true,
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior', outfit: 'own', gear: ['special_blade'] }] });
    const campaign = await CampaignAssembly.assemble(start.campaign, 'party-context', start.source, {});
    LocalKinds.reset();
    expect(campaign.fighters[0]!.equipment.weapon.id).toBe('special_blade');
  });
  it('keeps the right gear in a cached fork and restored campaign after another campaign starts', async () => {
    const make = (name: string) => SingleModule.source(`Kind special_blade "${name}" like dagger. `
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true,
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior', outfit: 'own', gear: ['special_blade'] }] });
    const a = make('first blade'), b = make('second blade');
    const first = await Campaign.load(a.campaign, 'fork-gear', a.source);
    const fork = await Campaign.load(a.campaign, 'fork-gear', a.source);
    const restored = Campaign.restore(first.save());
    await Campaign.load(b.campaign, 'other-gear', b.source);
    for (const campaign of [first, fork, restored]) {
      expect(campaign.fighters[0]!.equipment.weapon.name).toBe('first blade');
    }
  });
  it('does not replace another campaign catalog when a save is invalid', async () => {
    const make = (name: string) => SingleModule.source(`Kind special_token "${name}" is gear. `
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true });
    const a = make('first token'), b = make('second token');
    const first = await CampaignAssembly.assemble(a.campaign, 'invalid-save-a', a.source, {});
    const save = first.save();
    save.module.entities.push(structuredClone(save.module.entities[0]!));
    const second = await CampaignAssembly.assemble(b.campaign, 'invalid-save-b', b.source, {});
    expect(second.world).toBeDefined();
    expect(second.vocabulary?.itemDefinition('special_token')?.name).toBe('second token');
    expect(() => Campaign.restore(save)).toThrow();
    expect(second.vocabulary?.itemDefinition('special_token')?.name).toBe('second token');
  });
  it('creates local species and carries local gear from the supplied catalog', () => {
    const make = (like: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ species: { context_beast: vocabulary.species('context',
        { id: 'context_beast', name: 'beast', like }) },
      items: { context_gear: vocabulary.item('context',
        { id: 'context_gear', name: 'gear', base: { like: 'dagger' } }, new Set()) } });
      return vocabulary;
    };
    const a = make('frost_wolf'), b = make('bear');
    LocalKinds.activate({ species: { context_beast: b.species('other',
      { id: 'other', name: 'other', like: 'bear' }) } });
    try {
      const create = (vocabulary: CanonVocabulary) => new Content('context-creature', undefined, vocabulary)
        .createCreature('beast', { raceId: 'context_beast', gear: ['context_gear'] });
      const wolf = create(a), bear = create(b);
      expect(wolf.variations).toContain('frost');
      expect(bear.variations ?? []).not.toContain('frost');
      expect(wolf.base.maxHp).not.toBe(bear.base.maxHp);
      expect(wolf.state.inventory).toEqual([{ id: 'beast__context_gear', definition: 'context_gear', equipped: true }]);
      expect(create(a)).toEqual(wolf);
      a.creature('context_beast').statistics!.level = 100;
      expect(create(a)).toEqual(wolf);
      const base = Canon.creature('wolf').statistics!.level;
      a.creature('wolf').statistics!.level = 100;
      expect(Canon.creature('wolf').statistics!.level).toBe(base);
      const hero = new Content('context-hero', undefined, a).createCreature('hero', { raceId: 'human', classId: 'warrior' });
      hero.state.companion = { raceId: 'context_beast', name: 'Beast' };
      expect(() => CreatureSchema.validate(hero, a)).not.toThrow();
      expect(() => CreatureSchema.validate(hero, CanonVocabulary.scoped())).toThrow('Invalid companion');
      const fighter = new Content('context-creature', undefined, a).creature('context_beast', 'beast', 'goblins');
      expect(fighter.raceId).toBe('context_beast');
      expect(fighter.innate).toEqual(fighter.abilities);
      expect(CombatProjection.fighter(wolf, 'fighters', a).equipment.weapon.id).toBe('context_gear');
      const store = new CreatureStore([wolf], a).with([hero]);
      const lease = store.acquire(['beast']), updated = store.get('beast');
      updated.state.hp--;
      store.commit(lease, [updated]);
      expect(store.get('beast').state.hp).toBe(wolf.state.hp - 1);
      store.release(lease);
      expect(() => new Content('context', undefined, CanonVocabulary.scoped())
        .creature('context_beast', 'beast', 'goblins')).toThrow('Unknown species');
    } finally { LocalKinds.reset(); }
  });
});
describe('scoped skill checks and sources', () => {
  it('describes visible local things and creatures with their own campaign catalog', async () => {
    const make = (description: string, beast: string) => SingleModule.source(
      `Kind special_token "token" is gear described "${description}". Species local_beast "${beast}" like wolf. `
      + 'Place yard "yard" is room. Company party "You" of 1 at yard. '
      + 'Item token "token" is special_token at yard. Person beast "the beasts" at yard '
      + '{ Species local_beast. Numbers 2. }', { own: true });
    const a = make('First description.', 'amber wolf'), b = make('Other description.', 'silver wolf');
    const first = await CampaignAssembly.assemble(a.campaign, 'description-a', a.source, {});
    const second = await CampaignAssembly.assemble(b.campaign, 'description-b', b.source, {});
    expect(first.world).toBeDefined();
    LocalKinds.read(second.module.catalog);
    try {
      expect(ScreenModel.build(first).things.find(thing => thing.name === 'token')?.look).toBe('First description.');
      expect(ScreenModel.build(first).people.find(person => person.name === 'the beasts')?.look).toContain('amber wolf');
      expect([...BandNames.of(first).values()]).toContain('the first amber wolf');
      const group = first.module.entities.find(e => e.name === 'the beasts')!.id;
      expect(CharacterSheets.recruit(first, group, [{ command: 'recruit(beast)' }]).recruit?.line).toBe('amber wolf');
    } finally { LocalKinds.reset(); }
  });
  it('classifies services and rewards using the campaign item, not the active catalog', async () => {
    const make = (kind: string) => SingleModule.source(`${kind} `
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true });
    const a = make('Kind special_token "token" is gear worth 5.');
    const b = make('Kind special_token "token" is treasure worth 0.');
    const first = await CampaignAssembly.assemble(a.campaign, 'service-a', a.source, {});
    const second = await CampaignAssembly.assemble(b.campaign, 'service-b', b.source, {});
    const world = first.world;
    LocalKinds.read(second.module.catalog);
    try {
      expect(Services.need(world, { kind: 'special_token', name: 'token', price: 5, stock: 1 }, first.vocabulary))
        .toBe('Gear');
      expect(Owed.pays({ id: 'offer', name: 'offer', description: '', requires: { kind: 'boolean', value: true },
        success: [{ kind: 'assert', call: ModuleWriter.call('handed', 'special_token', 'party') }],
        failure: [], cost: 0, time: 0 }, 'party', world, first.vocabulary)).toBe(true);
    } finally { LocalKinds.reset(); }
  });
  it('projects inventory from the campaign vocabulary and refreshes it when that vocabulary changes', async () => {
    const make = (name: string) => SingleModule.source(`Kind special_token "${name}" is gear. `
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true,
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior', outfit: 'own', gear: ['special_token'] }] });
    const a = make('first token'), b = make('other token');
    const first = await CampaignAssembly.assemble(a.campaign, 'inventory-a', a.source, {});
    const second = await CampaignAssembly.assemble(b.campaign, 'inventory-b', b.source, {});
    expect(first.world).toBeDefined();
    LocalKinds.read(second.module.catalog);
    try {
      expect(PlayerView.observe(first).items?.find(i => i.id.endsWith('special_token'))?.name).toBe('first token');
      expect(ScreenModel.build(first).items.find(i => i.kind === 'special_token')?.name).toBe('a first token');
      const item = first.vocabulary!.itemDefinition('special_token')!;
      first.vocabulary!.install({ items: { special_token: { ...item, name: 'changed token' } } });
      expect(PlayerView.observe(first).items?.find(i => i.id.endsWith('special_token'))?.name).toBe('changed token');
    } finally { LocalKinds.reset(); }
  });
  it('names a needed item from its campaign even when another catalog is active', async () => {
    const make = (name: string) => SingleModule.source(`Kind special_token "${name}" is gear. `
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true });
    const a = make('first token'), b = make('other token');
    const first = await CampaignAssembly.assemble(a.campaign, 'need-a', a.source, {});
    const second = await CampaignAssembly.assemble(b.campaign, 'need-b', b.source, {});
    expect(second.world).toBeDefined();
    expect(Unread.said(first, { thing: 'seal', name: 'the seal', needs: ['special_token'] })).toContain('first token');
    expect(Shut.said(first, { bar: 'door', name: 'door', needs: ['special_token'], from: [] })).toContain('first token');
  });
  it('finds a skill source from its campaign even when another catalog is active', async () => {
    const make = (kind: string) => SingleModule.source(`${kind}
      Place yard "yard" is room. Company party "You" of 1 at yard.
      Person mabel "Mabel" at yard { Role "a seller". Peaceable. Pronouns she.
        Sells local_book for 1 coin from 2. }`, { own: true });
    const a = make('Kind local_book "first book" like old_glossary.');
    const b = make('Kind local_book "other book" is gear.');
    const first = await CampaignAssembly.assemble(a.campaign, 'source-a', a.source, {});
    const second = await CampaignAssembly.assemble(b.campaign, 'source-b', b.source, {});
    expect(second.world).toBeDefined();
    expect(SkillSources.where(first, 'lore')).toContain('first book');
  });
  it('uses the campaign catalog to choose a check maker and calculate the roll and odds', () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ items: {
      local_amulet: vocabulary.item('context', { id: 'local_amulet', name: 'amulet',
        base: { like: 'amulet_of_focus' } }, new Set()),
      local_book: vocabulary.item('context', { id: 'local_book', name: 'book',
        base: { like: 'old_glossary' } }, new Set()) } });
    const content = new Content('check-context', undefined, vocabulary);
    const equipped = content.createCreature('equipped', { raceId: 'human', classId: 'warrior', outfit: 'own',
      intelligence: 10, gear: ['local_amulet', 'local_book'] });
    const other = content.createCreature('other', { raceId: 'human', classId: 'warrior', outfit: 'own',
      intelligence: 12 });
    LocalKinds.reset();
    const company = [other, equipped];
    expect(Checks.maker(company, 'lore', undefined, vocabulary)?.id).toBe('equipped');
    expect(Checks.bonus(equipped, 'lore', undefined, vocabulary)).toMatchObject({
      modifier: 1, tool: 2, using: 'local_book' });
    expect(Checks.odds(company, 'lore', 20, { vocabulary })).toBe('unlikely');
    const event = Checks.make(company, { skill: 'lore', difficulty: 20, seed: 'check', forced: 'pass', vocabulary })[0]!;
    expect(event).toMatchObject({ actor: 'equipped', modifier: 1, tool: 2, using: 'local_book', rolled: 23 });
    const sheet = CharacterSheets.sheet(equipped, vocabulary);
    expect(sheet.qualities.find(q => q.id === 'intelligence')?.score).toBe(13);
    expect(sheet.skills.find(s => s.id === 'lore')?.check).toBe(3);
    expect(CombatProjection.told([equipped], [equipped.id], undefined, vocabulary).combatants[0]!.id)
      .toBe(equipped.id);
    expect(CombatPresenter.format(event, CombatProjection.told([equipped], [equipped.id], undefined, vocabulary)))
      .toContain('book 2');
  });
});
describe('scoped item catalogs', () => {
  it('finds consumables from its store rather than the active campaign', () => {
    const make = (id: string, name: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ items: { [id]: vocabulary.item('context',
        { id, name, base: { like: 'healing_potion' } }, new Set()) } });
      return vocabulary;
    };
    const own = make('zz_own_tonic', 'own tonic'), other = make('zz_other_tonic', 'other tonic');
    const hero = new Content('searcher', undefined, own).createCreature('hero',
      { raceId: 'human', classId: 'warrior', outfit: 'own', wisdom: 20 });
    hero.traits = [...hero.traits ?? [], 'star_full_hand'];
    const store = new CreatureStore([hero], own);
    const pool = Object.entries(own.itemDefinitions()).filter(([, item]) => item.category === 'consumable')
      .map(([id]) => id).sort();
    const index = pool.indexOf('zz_own_tonic') + 1;
    const seed = Array.from({ length: 1000 }, (_, i) => `search-${i}`)
      .find(s => new Expressions(s).number(`1d${pool.length}`) === index);
    expect(seed).toBeDefined();
    LocalKinds.activate({ items: { zz_other_tonic: other.itemDefinition('zz_other_tonic')! } });
    try {
      expect(Items.rummage(store, ['hero'], { seed: seed! })[0]).toMatchObject({ type: 'gain', detail: 'own tonic' });
    } finally { LocalKinds.reset(); }
  });
  it('validates, chooses and performs a scoped summons when the ambient catalog has changed', async () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ species: { local_beast: vocabulary.species('context',
      { id: 'local_beast', name: 'beast', like: 'wolf' }) },
    items: { local_call: vocabulary.item('context', { id: 'local_call', name: 'call',
      base: { category: 'consumable' }, use: 'Summon local_beast for self.' }, new Set()) } });
    const content = new Content('scoped-summon', undefined, vocabulary);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior', outfit: 'own' });
    const foe = content.createCreature('foe', { raceId: 'wolf' });
    const store = new CreatureStore([hero, foe], vocabulary);
    Items.take(store, 'hero', { id: 'call', definition: 'local_call' });
    LocalKinds.reset();
    const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed: 'scoped-summon', moment: 'seen' });
    try {
      const runner = new RunnerFight(), chosen = runner.controller(battle);
      expect(runner.choices().some(c => c.label.includes('call'))).toBe(true);
      expect(runner.choose(RunnerFight.auto)).toBe(true);
      await chosen;
      const summon = battle.legalCommands().find(c => c.ability === 'item-local_call');
      expect(summon).toBeDefined();
      battle.step(summon!);
      expect(battle.state.combatants.some(c => c.raceId === 'local_beast')).toBe(true);
      expect(CombatModel.build(battle).exchanges.some(e => e.text.includes('uses a call'))).toBe(true);
    } finally { battle.close(); }
  });
  it('uses the store catalog for item actions and combat after another catalog becomes active', () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ items: {
      local_blade: vocabulary.item('context', { id: 'local_blade', name: 'blade', base: { like: 'dagger' } }, new Set()),
      local_tonic: vocabulary.item('context', { id: 'local_tonic', name: 'tonic',
        base: { like: 'healing_potion' } }, new Set()) } });
    const content = new Content('scoped-fight', undefined, vocabulary);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior', outfit: 'own' });
    hero.state.hp = Math.max(1, hero.state.hp - 3);
    const foe = content.createCreature('foe', { raceId: 'wolf' });
    const store = new CreatureStore([hero, foe], vocabulary);
    LocalKinds.reset();
    expect(Items.take(store, 'hero', { id: 'blade', definition: 'local_blade' })[0])
      .toMatchObject({ type: 'gain', detail: 'blade' });
    Items.equip(store, 'hero', 'blade');
    Items.take(store, 'hero', { id: 'tonic', definition: 'local_tonic' });
    const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'foe', team: 'goblins' }], { seed: 'scoped-fight' });
    try {
      const fighter = battle.state.combatants.find(c => c.id === 'hero')!;
      expect(fighter.equipment.weapon.id).toBe('local_blade');
      expect(fighter.abilitySources?.['item-local_tonic']?.name).toBe('tonic');
      expect(() => battle.chosen()).not.toThrow();
      expect(Tactics.score(battle.state, { actor: 'hero', target: 'hero', ability: 'item-local_tonic' }, battle.vocabulary))
        .toBeGreaterThanOrEqual(0);
      expect(DangerSense.of(battle).text).not.toBe('');
    } finally { battle.close(); }
    Items.consume(store, { owner: 'hero', target: 'hero', id: 'tonic', seed: 'scoped-tonic' });
    expect(store.get('hero').state.inventory?.some(i => i.id === 'tonic')).toBe(false);
  });
  it('keeps item-use names distinct between scoped catalogs', () => {
    const make = (name: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ items: { contextual_potion: vocabulary.item('context',
        { id: 'contextual_potion', name, base: { like: 'healing_potion' } }, new Set()) } });
      return vocabulary;
    };
    expect([ItemCatalog.use('contextual_potion', make('first'))?.name,
      ItemCatalog.use('contextual_potion', make('second'))?.name]).toEqual(['first', 'second']);
  });
  it('reads carried capability grants from the supplied catalog', () => {
    const make = (grants?: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ items: { context_token: vocabulary.item('context',
        { id: 'context_token', name: 'token', base: { category: 'gear' }, grants, mass: grants ? 1 : 9 },
        new Set()) } });
      return vocabulary;
    };
    const a = make('oath'), b = make();
    const hero = new Content('context-grant', undefined, a).createCreature('hero',
      { raceId: 'human', classId: 'warrior', outfit: 'own', gear: ['context_token'] });
    expect(PartyCapabilities.brings('oath', hero, {}, a)).toBe(true);
    expect(PartyCapabilities.brings('oath', hero, {}, b)).toBe(false);
    expect(PartyCapabilities.has('oath', [hero], {}, a)).toBe(true);
    expect(PartyCapabilities.has('oath', [hero], {}, b)).toBe(false);
    expect([Burden.load(hero, a), Burden.load(hero, b)]).toEqual([1, 9]);
  });
  it('projects carried mass using the supplied catalog, not the active campaign', async () => {
    const start = SingleModule.source('Kind context_pack "pack" is gear weighing 1. '
      + 'Place yard "yard" is room. Company party "You" of 1 at yard.', { own: true,
      party: [{ name: 'Ama', raceId: 'human', classId: 'warrior', outfit: 'own', gear: ['context_pack'] }] });
    const campaign = await CampaignAssembly.assemble(start.campaign, 'projection-context', start.source, {});
    const catalog = campaign.module.catalog!, item = catalog.items!.context_pack!;
    const a = CanonVocabulary.scoped(catalog);
    const b = CanonVocabulary.scoped({ ...catalog, items: { ...catalog.items,
      context_pack: { ...item, mass: 9 } } });
    const world = campaign.world, store = campaign['creatures'], actor = campaign.actors[0]!;
    const hero = store.peek(actor.members[0]!);
    const reference = campaign.module.entities.find(e => e.creatureId === hero.id)!.id;
    LocalKinds.reset();
    const measure = ModuleWriter.call('carried', reference);
    expect([CreatureFacts.project(world, [actor], store, a).number(measure),
      CreatureFacts.project(world, [actor], store, b).number(measure)]).toEqual([1, 9]);
    const projection = new Projection(), first = projection.refresh(world, [actor], store.with([], a));
    expect(first.number(measure)).toBe(1);
    const other = store.with([], b), second = projection.refresh(first, [actor], other);
    expect(second.number(measure)).toBe(9);
    b.install({ items: { context_pack: { ...item, mass: 5 } } });
    expect(projection.refresh(second, [actor], other).number(measure)).toBe(5);
  });
});
describe('one creature pipeline', () => {
  it('makes every base creature from its own record, and only what it is asked to be', () => {
    // Not the fighting objects (a ward, a turret: monsters.json's combatEntity kinds), whose powers are their own.
    const creatures = Object.entries(monsters.species as Record<string, { source: { orsino?: string } }>)
      .filter(([, m]) => !m.source.orsino?.startsWith('combatEntity:')).map(([id]) => id);
    for (const id of [...Object.keys(animals.species), ...creatures, 'ooze', 'goat']) {
      const c = make(id), record = Canon.creature(id);
      expect([id, c.raceId]).toEqual([id, id]);
      for (const a of record.abilities ?? []) { expect([id, c.base.abilities.includes(a)]).toEqual([id, true]); }
    }
    // Wolves had come out of a list of five bodies with frost or marsh laid on them at random.
    for (const seed of ['a', 'b', 'c', 'd']) {
      const wolf = new Content(seed).createCreature('w', { raceId: 'wolf' }, 'w');
      expect(wolf.traits ?? []).not.toContain('frost_adapted');
    }
  });
  it('grows a rat with its level, and makes a great rat and a cave spider of their bases and variations', () => {
    expect(make('rat', { level: 4 }).base.maxHp).toBeGreaterThan(make('rat', { level: 1 }).base.maxHp);
    const great = variations.variations.great.attributes;
    expect(make('great_rat').base.strength).toBe(make('rat').base.strength + great.strength);
    const cave = make('cave_spider');
    // Its web and its venom are the spider's; the cave and its size are what vary it.
    expect(cave.base.abilities).toEqual(expect.arrayContaining(['venomous_bite', 'ensnare']));
    expect([cave.raceId, cave.variations]).toEqual(['spider/great/cave', ['great', 'cave']]);
  });
  it('makes a kind added by its record alone in an author’s Person and from what generation casts, alike', async () => {
    const [cast] = Cast.group(ModuleParser.parse(`Module e "E" { Place pool "the pool" is room.
      Person eels "the eels" at pool { Role "an eel". } }`).people![0]!, { raceId: 'eel', count: 1 });
    expect(cast!.context.raceId).toBe('eel');
    const source = new OverlayBundleSource(NodeBundleSource.shared, {
      'ee/site.kyr': `Module ee "Eels" { Place mere "the Mere" is settlement.
        Place pool "the eel-pool" is room within mere at 0, 0 outdoors. Company party "You" of 1 at pool.
        Person eels "the eels" at pool { Role "an eel". Species eel. Variant elder. Numbers 2. Level 2. } }`,
      'ee/module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'],
        exports: { party: 'party' } }),
      'ee.campaign.json': JSON.stringify({ version: 1, name: 'ee', modules: [{ id: 'p', bundle: 'ee/module.json' }],
        party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }] }) });
    const s = await PlaySession.start(source.resolve('ee.campaign.json'), 'ee', source);
    const shape = (c: { base: { maxHp: number; abilities: string[] }; traits?: string[] }) =>
      ({ hp: c.base.maxHp, traits: [...c.traits ?? []].sort(), abilities: c.base.abilities });
    const eels = () => s.campaign.readout.creatures.filter(c => c.raceId === 'eel').map(shape);
    expect(eels()).toHaveLength(2);
    for (const e of eels()) { expect(e.abilities).toEqual(expect.arrayContaining(Canon.creature('eel').abilities!)); }
    // Kept across a save and its reading again: the same creatures, as they were made.
    const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
    expect(again.campaign.readout.creatures.filter(c => c.raceId === 'eel').map(shape)).toEqual(eels());
  }, 60000);
  it('shows a creature by its kind’s painting, a named variant by its base’s', () => {
    // Every animal by its painting from the menagerie (data/paintings/animals.json); a kind composed of one by its
    // base's (a frost wolf, a wolf); a monster by its own from the bestiary (data/paintings/monsters.json).
    expect(['wolf', 'frost_wolf', 'dog', 'vampire', 'bear', 'rat'].map(id => CreaturePortraits.painting(id)))
      .toEqual(['animals/wolf', 'animals/wolf', 'animals/dog', 'monsters/vampire', 'animals/bear', 'animals/rat']);
  });
});
