import { describe, expect, it } from 'bun:test';
import { CanonVocabulary } from '../../src/canon/canon-vocabulary';
import { LocalKinds } from '../../src/canon/local-catalog';
import { CombatProjection } from '../../src/combat-projection';
import { Content } from '../../src/content';
import { ItemUses } from '../../src/ui/item-uses';
import { ItemStow } from '../../src/ui/item-stow';
import { CombatTelling } from '../../src/ui/combat-telling';
import { ItemPlates } from '../../src/paintings/item-plates';
import { Seats } from '../../src/world/seats';
import { World } from '../../src/lang/world';
import { ModuleParser } from '../../src/lang/module-parser';
import { CombatModel } from '../../src/ui/combat-model';
import { CombatPresenter } from '../../src/ui/combat-presenter';
import { PurchaseCompare } from '../../src/ui/purchase-compare';
import { ModuleWriter } from '../../src/lang/module-writer';
import { ChoiceGrouping } from '../../src/ui/choice-grouping';
import { Canon } from '../../src/canon/canon';
import { Tiny } from '../support/tiny';
import { Carriers } from '../../src/ui/carriers';

describe('scoped items', () => {
  it('chooses a carrier using the owning catalog for inherited item weight', () => {
    const vocabulary = CanonVocabulary.scoped();
    const plate = vocabulary.item('context', { id: 'local_plate', name: 'plate', base: { like: 'chainmail' } }, new Set());
    vocabulary.install({ items: { local_plate: plate, wages__local_plate: plate } });
    const module = ModuleParser.parse('Module carried "Carried" { Relation memberOf(identity, identity). '
      + 'Relation awake(identity). Relation ownedItem(identity, identity). Relation itemKind(identity, identity). '
      + 'Measure capacity(identity). Measure carried(identity). Measure mass(identity). }', [], vocabulary);
    const call = ModuleWriter.call;
    LocalKinds.reset();
    for (const kind of ['local_plate', 'wages__local_plate']) {
      const world = new World(module, { relations: [call('memberOf', 'a', 'party'), call('memberOf', 'b', 'party'),
        call('awake', 'a'), call('awake', 'b'), call('itemKind', 'plate', kind)],
      measures: [{ call: call('capacity', 'a'), value: 45 }, { call: call('capacity', 'b'), value: 45 },
        { call: call('carried', 'a'), value: 40 }, { call: call('carried', 'b'), value: 30 }] });
      expect(Carriers.carrier(world, 'party', 'plate', vocabulary)).toBe('b');
    }
  });
  it('does not switch ambient catalogs when a campaign reads or plays its world', async () => {
    const sentinel = LocalKinds.item('other', { id: 'foreign_marker', name: 'foreign marker',
      base: { category: 'gear' } });
    LocalKinds.activate({ items: { foreign_marker: sentinel } });
    try {
      const t = await Tiny.start('Place yard "yard" is room. Company party "You" of 1 at yard. '
        + 'Kind own_marker "own marker" is gear.', { own: true });
      expect(t.campaign.vocabulary?.itemDefinition('own_marker')?.name).toBe('own marker');
      expect(Canon.items.foreign_marker?.name).toBe('foreign marker');
      expect(Canon.items.own_marker).toBeUndefined();
      await t.play('Wait a while');
      expect(Canon.items.foreign_marker?.name).toBe('foreign marker');
      expect(Canon.items.own_marker).toBeUndefined();
    } finally { LocalKinds.reset(); }
  });
  it('compares a purchase with the wearer using the campaign catalog', () => {
    const make = (like: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ items: { local_weapon: vocabulary.item('context',
        { id: 'local_weapon', name: 'weapon', base: { like } }, new Set()) } });
      return vocabulary;
    };
    const a = make('longsword'), b = make('dagger');
    const module = ModuleParser.parse('Module shop "Shop" { Relation wearing(identity, identity). '
      + 'Relation itemKind(identity, identity). }', [], CanonVocabulary.scoped());
    const world = new World(module, { relations: [ModuleWriter.call('wearing', 'held', 'hero'),
      ModuleWriter.call('itemKind', 'held', 'dagger')], measures: [] });
    const names = { get() { return 'dagger'; } };
    LocalKinds.activate({ items: { local_weapon: b.itemDefinition('local_weapon')! } });
    try {
      expect(PurchaseCompare.versus(world, 'local_weapon', 'hero',
        { names, item: a.runtimeItem.bind(a) })).toBe(' · better than your dagger');
      expect(PurchaseCompare.versus(world, 'local_weapon', 'hero',
        { names, item: b.runtimeItem.bind(b) })).toBe(' · as good as your dagger');
      const action = { id: 'buy_item', name: 'Buy', description: '', requires: { kind: 'boolean' as const, value: true },
        success: [], failure: [], cost: 0, time: 1,
        bindings: { merchant: 'merchant', find: 'offer', form: 'local_weapon', recipient: 'hero' } };
      const rows = [{ action, choice: { id: 'buy', name: 'Buy', time: 1, encounter: false } }];
      const grouped = ChoiceGrouping.group(rows, { names, world, item: a.runtimeItem.bind(a), present: new Set(['merchant']),
        prices: new Map(), passageOf: new Map() });
      expect(JSON.stringify(grouped.targets.get('merchant'))).toContain('better than your dagger');
    } finally { LocalKinds.reset(); }
  });
  it('uses the campaign item to decide where it points', () => {
    const make = (like: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ items: { local_relic: vocabulary.item('context',
        { id: 'local_relic', name: 'relic', base: { like } }, new Set()) } });
      return vocabulary;
    };
    const a = make('dun_rierdan_waystone'), b = make('torch');
    const world = new World(ModuleParser.parse('Module seats "Seats" { Relation seatOf(identity, place). '
      + 'Relation seatedIn(identity, identity). Relation partOf(identity, identity). }', [], CanonVocabulary.scoped()));
    LocalKinds.activate({ items: { local_relic: b.itemDefinition('local_relic')! } });
    try {
      expect(Seats.pointed(world, 'local_relic', a)?.identity).toBe('dun_ri');
      expect(Seats.pointed(world, 'local_relic', b)).toBeUndefined();
    } finally { LocalKinds.reset(); }
  });
  it('chooses a local item plate from its own campaign, not the active catalog', () => {
    const make = (like: string) => {
      const vocabulary = CanonVocabulary.scoped();
      vocabulary.install({ items: { local_relic: vocabulary.item('context',
        { id: 'local_relic', name: 'relic', base: { like } }, new Set()) } });
      return vocabulary;
    };
    const a = make('dagger'), b = make('battleaxe');
    LocalKinds.activate({ items: { local_relic: b.itemDefinition('local_relic')! } });
    try {
      expect(ItemPlates.kind('local_relic', a)).toEqual(ItemPlates.kind('dagger'));
      expect(ItemPlates.kind('local_relic', b)).toEqual(ItemPlates.kind('battleaxe'));
      expect(ItemPlates.kind('local_relic', a)).not.toEqual(ItemPlates.kind('local_relic', b));
    } finally { LocalKinds.reset(); }
  });
  it('describes, stows and tells campaign-local supplies without the ambient catalog', () => {
    const vocabulary = CanonVocabulary.scoped();
    vocabulary.install({ items: {
      local_lamp: vocabulary.item('context', { id: 'local_lamp', name: 'lamp', base: { like: 'lantern' } }, new Set()),
      local_tonic: vocabulary.item('context',
        { id: 'local_tonic', name: 'tonic', base: { like: 'healing_potion' } }, new Set()) } });
    const creature = new Content('stow-context', undefined, vocabulary).createCreature('holder',
      { raceId: 'human', classId: 'warrior', outfit: 'own', gear: ['local_lamp', 'local_tonic'] });
    LocalKinds.reset();
    expect(ItemUses.dry(['local_lamp'], vocabulary)).toBe(true);
    expect(ItemUses.kept('local_lamp', [], new Set(), vocabulary)).toContain('oil');
    const tonic = creature.state.inventory!.find(i => i.definition === 'local_tonic')!;
    expect(ItemStow.of(creature, tonic, false, vocabulary).stow).toBe('supplies');
    const state = CombatProjection.told([creature], [creature.id], undefined, vocabulary);
    const event = { type: 'action' as const, turn: 1,
      command: { actor: creature.id, ability: 'item-local_tonic', target: creature.id },
      source: { id: tonic.id, kind: 'item' as const, name: 'tonic' } };
    const telling = CombatTelling.exchanges([event], state);
    expect(telling[0]?.text).toContain('uses a tonic');
    expect(CombatModel.line(event, state)).toContain('uses a tonic');
    expect(CombatModel.line({ ...event, source: undefined }, state, vocabulary)).toContain('uses a tonic');
    expect(CombatPresenter.format(event, state)).toContain('uses a tonic');
    expect(CombatTelling.exchanges([{ ...event, source: undefined }], state, undefined, vocabulary)[0]?.text)
      .toContain('uses a tonic');
    const fighter = state.combatants[0]!;
    fighter.equipment.routine = [{ ...fighter.equipment.weapon, id: 'local_tooth', name: 'silver tooth', natural: true }];
    const blows = CombatTelling.exchanges([{ type: 'action', turn: 1,
      command: { actor: fighter.id, ability: 'melee', target: fighter.id } },
    { type: 'attack', turn: 1, actor: fighter.id, target: fighter.id, die: 10, need: 10, toHit: 0,
      armorClass: 10, weapon: 'local_tooth', success: true, critical: false }], state);
    expect(blows[0]?.text).toContain('silver tooth');
  });
});
