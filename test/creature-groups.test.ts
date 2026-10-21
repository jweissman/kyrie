import { expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { MemoryBundleSource } from '../src/campaign/memory-bundle-source';
import { ModuleBundle } from '../src/campaign/module-bundle';
import { ModuleParser } from '../src/lang/module-parser';
import { ModuleWriter } from '../src/lang/module-writer';

const site = `Module brood_site "A webbed cave" {
  Place nest "The nest" is room.
  Company party "Party" of 3 at nest.
  Person brood "the spider brood" at nest { Role "a cave spider". Creature body cave_spider. Numbers 3. }
  Person mother "the brood-mother" at nest { Role "the brood-mother". Creature body cave_spider. Level 3. }
  Person drake "a drake" at nest { Creature lineage green, maturity wyrmling. }
  Person bears "the bears" at nest { Role "a sow bear and her cub". Species bear. Numbers 2. Called "the sow", "the cub". }
  Person wolves "the wolves" at nest { Role "a grey wolf and her mate". Species wolf. Numbers 2. }
  Goal false.
}`;
class Brood {
  static async load() {
    const rules = await Promise.all(ModuleBundle.world.map(async name => [
      `data/rules/${name}.kyr`, await Bun.file(`data/rules/${name}.kyr`).text()]));
    return Campaign.load('campaign.json', 'brood', new MemoryBundleSource({ ...Object.fromEntries(rules),
      'campaign.json': JSON.stringify({ version: 1, name: 'Brood', modules: [{ id: 'cave', bundle: 'module.json' }] }),
      'module.json': JSON.stringify({ version: 1, source: 'site.kyr', rules: ['world'], globals: ['party'] }),
      'site.kyr': site }));
  }
}

it('a person may be a numbered group of creatures composed by the Deem generator', async () => {
  const c = await Brood.load();
  const npcs = c.state.creatures.filter(x => !x.id.includes('party'));
  expect(npcs.map(x => [x.name, x.raceId, x.base.level])).toEqual([
    ['Cave spider 1', 'cave_spider', 1], ['Cave spider 2', 'cave_spider', 1], ['Cave spider 3', 'cave_spider', 1],
    ['the brood-mother', 'cave_spider', 3], ['a drake', 'dragon', 1], ['the sow', 'bear', 1], ['the cub', 'bear', 1],
    // A role that describes the whole group does not name each member; their kind does.
    ['Wolf 1', 'wolf', 1], ['Wolf 2', 'wolf', 1]]);
  expect(npcs.find(x => x.raceId === 'dragon')!.traits).toContain('poison_lineage');
  const attack = c.available().find(a => a.resolve?.name === 'combat' && a.resolve.args[0] === 'cave__brood')!;
  const battle = c.encounterBattle(attack.id);
  expect(battle.state.combatants.filter(f => f.team === 'goblins').map(f => f.name))
    .toEqual(['Cave spider 1', 'Cave spider 2', 'Cave spider 3']);
}, 60000);

it('writes Creature, Numbers and Called back as authored', () => {
  const again = ModuleParser.parse(ModuleWriter.write(ModuleParser.parse(site)));
  expect(again.people!.map(p => [p.id, p.creature, p.count, p.names])).toEqual([
    ['brood', { body: 'cave_spider' }, 3, undefined], ['mother', { body: 'cave_spider' }, undefined, undefined],
    ['drake', { lineage: 'green', maturity: 'wyrmling' }, undefined, undefined],
    ['bears', undefined, 2, ['the sow', 'the cub']], ['wolves', undefined, 2, undefined]]);
});
