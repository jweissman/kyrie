import { describe, expect, it } from 'bun:test';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';
import { ModuleCompiler } from '../src/lang/module-compiler';
import { ActionSchemas } from '../src/campaign/action-schemas';
import { World } from '../src/lang/world';
import { Spatial } from '../src/spatial';
import spatialRules from '../data/rulesets/spatial.kyr' with { type: 'text' };

class SpatialFixture {
  static source = `Module small "A physical site" {
    Kind group. Kind place. Kind item. Kind member. Kind capability. Kind fact.
    Relation at(entity, place) exclusive. Relation able(group). Relation closed(place).
    Relation denied(group, place, place). Relation knows(group, fact). Relation capable(group, capability).
    Relation memberOf(member, group). Relation awake(member). Relation ownedItem(item, member).
    Place earth "Earth" is plane.
    Place fen "Fen" is region within earth.
    Place town "Town" is settlement within fen.
    Place street "High street" is room within town.
    Place guild "Guild house" is building within town.
    Place hall "Hall" is room within guild.
    Place lower "Cellar level" is level within guild.
    Place cellar "Vault cellar" is room within lower.
    Entity party: group "Company". Entity hero: member "Hero" bound to canonical_hero.
    Entity brass_key: item "Brass key". Entity hatch: door "Cellar hatch".
    Entity delving: capability "Delving". Entity shortcut: fact "The hidden drain leads to the street".
    Exit entrance "Guild entrance" from street to hall by enter.
    Exit exit_hall "Street" from hall to street by leave.
    Exit stairs "Cellar" from hall to cellar by descend through hatch.
    Exit upstairs "Hall" from cellar to hall by ascend through hatch.
    Exit drain "Secret drain" from cellar to street by leave known by shortcut.
    Initially Assert able(party). Initially Assert at(party, street).
    Initially Assert memberOf(hero, party). Initially Assert awake(hero).
    Initially Assert lockedDoor(hatch). Initially Assert keyFor(brass_key, hatch).
    Initially Assert ownedItem(brass_key, hero). Initially Assert discoverable(cellar, shortcut).
    Goal false.
  }`;
  static module(source = this.source) {
    const m = ModuleParser.parse(source), rules = ModuleParser.parse(spatialRules);
    const module = { ...m, kinds: [...m.kinds, ...rules.kinds], relations: [...m.relations, ...rules.relations],
      actions: [...m.actions, ...rules.actions] };
    Spatial.addEscorts(module); Spatial.addSearches(module);
    return module;
  }
  static setup() {
    const m = this.module(); new ModuleCompiler().validate(m);
    return { world: new World(m).apply(m.initial), actions: ActionSchemas.ground(m) };
  }
  static perform(f: ReturnType<typeof SpatialFixture.setup>, schema: string) {
    const action = f.actions.find(a => a.schema === schema && f.world.test(a.requires));
    if (!action) { throw new Error(`Unavailable ${schema}`); }
    f.world = f.world.apply(action.success);
    return action;
  }
}

describe('physical hierarchy and typed traversal', () => {
  it('preserves authored hierarchy, movement, barriers and knowledge through inspectable Kyr roundtrip', () => {
    const module = SpatialFixture.module();
    expect(ModuleParser.parse(ModuleWriter.write(module))).toEqual(module);
    expect(module.entities.find(e => e.id === 'cellar')!.space).toEqual({ kind: 'room', parent: 'lower' });
    expect(module.actions.find(a => a.id === 'move_stairs')!.movement!.mode).toBe('descend');
    const entities = new Map(module.entities.map(e => [e.id, e]));
    expect(Spatial.ancestry(entities, 'cellar').map(e => e.id)).toEqual(['cellar', 'lower', 'guild', 'town', 'fen', 'earth']);
  });
  it('uses one shared lock and one canonical carried key from both sides without consuming it', () => {
    const f = SpatialFixture.setup(); SpatialFixture.perform(f, 'move_entrance');
    expect(() => SpatialFixture.perform(f, 'move_stairs')).toThrow('Unavailable');
    expect(() => SpatialFixture.perform(f, 'open_door')).toThrow('Unavailable');
    SpatialFixture.perform(f, 'unlock_door'); SpatialFixture.perform(f, 'open_door'); SpatialFixture.perform(f, 'move_stairs');
    expect(f.world.test(ModuleWriter.call('at', 'party', 'cellar'))).toBe(true);
    expect(f.world.test(ModuleWriter.call('ownedItem', 'brass_key', 'hero'))).toBe(true);
    SpatialFixture.perform(f, 'close_door');
    expect(() => SpatialFixture.perform(f, 'move_upstairs')).toThrow('Unavailable');
    SpatialFixture.perform(f, 'open_door'); SpatialFixture.perform(f, 'move_upstairs');
    expect(f.world.test(ModuleWriter.call('at', 'party', 'hall'))).toBe(true);
  });
  it('does not expose a secret connection until an actor actually searches and learns it', () => {
    const f = SpatialFixture.setup(), drain = f.world.module.entities.find(e => e.id === 'drain')!;
    expect(Spatial.visible(f.world, 'party', drain)).toBe(false);
    f.world = f.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'cellar') }]);
    expect(() => SpatialFixture.perform(f, 'move_drain')).toThrow('Unavailable');
    SpatialFixture.perform(f, 'search_place_cellar');
    expect(Spatial.visible(f.world, 'party', drain)).toBe(true);
    SpatialFixture.perform(f, 'move_drain');
    expect(f.world.test(ModuleWriter.call('at', 'party', 'street'))).toBe(true);
  });
  it('searches several concealed findings in one room without leaking their names or ambiguous commands', () => {
    const module = SpatialFixture.module(SpatialFixture.source.replace('Goal false.',
      'Entity ledger: fact "The lost ledger is behind a panel". Initially Assert discoverable(cellar, ledger). Goal false.'));
    const searches = module.actions.filter(a => a.searchPlace === 'cellar');
    expect(searches).toHaveLength(1);
    expect(searches[0]!.name).toBe('Search Vault cellar');
    expect(searches[0]!.success.filter(c => c.call.name === 'knows')).toHaveLength(2);
    expect(ModuleParser.parse(ModuleWriter.write(module))).toEqual(module);
  });
  it('escorts a freed canonical actor through the same threshold while applying its barriers', () => {
    const module = SpatialFixture.module(SpatialFixture.source.replace('Goal false.',
      'Relation rescued(group). Relation trapped(group). Relation distinct(group, group). '
      + 'Entity freed_miner: group "Freed miner". Initially Assert rescued(freed_miner). Initially Assert able(freed_miner). '
      + 'Initially Assert distinct(party, freed_miner). Initially Assert at(freed_miner, street). Goal false.'));
    const f = { world: new World(module).apply(module.initial), actions: ActionSchemas.ground(module) };
    SpatialFixture.perform(f, 'escort_entrance');
    expect(f.world.test(ModuleWriter.call('at', 'party', 'hall'))).toBe(true);
    expect(f.world.test(ModuleWriter.call('at', 'freed_miner', 'hall'))).toBe(true);
    expect(() => SpatialFixture.perform(f, 'escort_stairs')).toThrow('Unavailable');
    expect(ModuleParser.parse(ModuleWriter.write(module))).toEqual(module);
  });
  it('keeps institutional destination closure authoritative even when the physical doorway is open', () => {
    const f = SpatialFixture.setup();
    f.world = f.world.apply([{ kind: 'assert', call: ModuleWriter.call('closed', 'hall') }]);
    expect(() => SpatialFixture.perform(f, 'move_entrance')).toThrow('Unavailable');
    f.world = f.world.apply([{ kind: 'retract', call: ModuleWriter.call('closed', 'hall') }]);
    SpatialFixture.perform(f, 'move_entrance');
  });
  it('rejects cycles, untyped endpoints and misleading movement scales', () => {
    expect(() => new ModuleCompiler().validate(SpatialFixture.module(SpatialFixture.source.replace(
      'is room within guild', 'is room within hall')))).toThrow('cycle');
    expect(() => new ModuleCompiler().validate(SpatialFixture.module(SpatialFixture.source.replace(
      'Place hall "Hall" is room within guild.', 'Entity hall: place "Hall".')))).toThrow('declared places');
    expect(() => new ModuleCompiler().validate(SpatialFixture.module(SpatialFixture.source.replace(
      'by enter.', 'by walk.')))).toThrow('explicit building');
    expect(() => new ModuleCompiler().validate(SpatialFixture.module(SpatialFixture.source.replace(
      'by descend through', 'by walk through')))).toThrow('explicit building');
    expect(() => new ModuleCompiler().validate(SpatialFixture.module(SpatialFixture.source.replace(
      'by enter.', 'by cross_plane.')))).toThrow('does not cross planes');
  });
});

it('requires regional travel when walking would change settlement or habitat area', () => {
  const source = SpatialFixture.source.replace('Exit entrance',
    'Place other_town "Other town" is settlement within fen. '
    + 'Place other_street "Other street" is room within other_town. '
    + 'Exit regional_walk "Other town" from street to other_street by walk. Exit entrance');
  expect(() => new ModuleCompiler().validate(SpatialFixture.module(source)))
    .toThrow('needs an explicit building, level or regional transition');
});
