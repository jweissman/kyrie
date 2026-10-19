import { expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { RoleRequirements } from '../src/campaign/role-requirements';
import { Content } from '../src/content';
import { Canon } from '../src/canon/canon';

class Greenhollow {
  static start(context = 'campaign.json', seed = 'greenhollow') {
    return PlaySession.start(`data/greenhollow/${context}`, seed, NodeBundleSource.shared);
  }
  static async act(s: PlaySession, prefix: string) {
    const command = PlayerView.observe(s.campaign).choices.find(c => c.id.startsWith(prefix));
    if (!command) { throw new Error(`No ${prefix} at ${PlayerView.observe(s.campaign).location?.id}`); }
    return s.perform(command.id);
  }
  static has(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static async cellar(s: PlaySession) {
    for (const id of ['world__move_into_shop', 'take_item(world__cabinet_key', 'unlock_door',
      'open_door', 'world__move_cellar_stair']) { await this.act(s, id); }
  }
}

it('installs two extracted situations with inspectable roles in two independently generated contexts', async () => {
  const a = await Greenhollow.start(), b = await Greenhollow.start('woodland.campaign.json', 'saltpine');
  for (const s of [a, b]) {
    expect(s.campaign.installations.map(m => m.id)).toEqual(['world', 'rescue', 'charter']);
    expect(s.campaign.installations[1]!.roles).toHaveLength(5);
    expect(s.campaign.installations[1]!.roles!.find(r => r.role === 'guest')!.entity).toBe('world__guest');
    expect(s.campaign.module.entities.filter(e => e.id === 'party')).toHaveLength(1);
    expect(PlayerView.observe(s.campaign).spatial!.ancestry.map(a => a.kind)).toEqual(['plane', 'region', 'settlement', 'room']);
    const fact = s.campaign.world.snapshot.relations.filter(r => r.name === 'habitatSpecies' && r.args[0] === 'world__wood');
    expect(fact.length).toBeGreaterThanOrEqual(2);
    for (const r of fact) {
      const biome = s === a ? 'riverbank' : 'woodland';
      expect(Canon.organisms[Canon.resolve('organisms', r.args[1]!)]!.habitats).toContain(biome);
    }
    expect(s.campaign.state.creatures.find(c => c.id === 'world__apothecary_person')!.name).not.toBe('A house over older halls');
    expect(s.campaign.state.creatures.filter(c => c.id.startsWith('rescue__') || c.id.startsWith('charter__'))).toHaveLength(0);
  }
  expect(a.campaign.module.entities.find(e => e.id === 'world__town')!.name)
    .not.toBe(b.campaign.module.entities.find(e => e.id === 'world__town')!.name);
  expect(a.campaign.state.creatures.map(c => [c.name, c.raceId]))
    .not.toEqual(b.campaign.state.creatures.map(c => [c.name, c.raceId]));
});

it('requires typed, satisfied role bindings and leaves the campaign unchanged on failed installation', async () => {
  const s = await Greenhollow.start(), before = s.canonical();
  const imports = { party: 'world.party', guest: 'world.host', captive_room: 'world.cellar',
    safe_home: 'world.street', restraint: 'world.rack' };
  await expect(s.campaign.install({ id: 'bad', bundle: 'data/situations/trapped-traveler/module.json', imports },
    NodeBundleSource.shared)).rejects.toThrow('Unsatisfied requirement for role guest');
  expect(s.canonical()).toBe(before);
  expect(() => RoleRequirements.bind({ absent: { type: 'group' } }, {})).toThrow('Unbound required role');
});

it('uses one owned key, explicit door state, typed stairs and escort without regenerating the guest', async () => {
  const s = await Greenhollow.start();
  const before = s.campaign.state.creatures.find(c => c.id === 'world__guest_person')!;
  await Greenhollow.act(s, 'world__move_into_shop');
  expect(PlayerView.observe(s.campaign).spatial!.exits.find(e => e.mode === 'descend')!.available).toBe(false);
  await Greenhollow.act(s, 'take_item(world__cabinet_key');
  await Greenhollow.act(s, 'unlock_door');
  expect(PlayerView.observe(s.campaign).spatial!.exits.find(e => e.mode === 'descend')!.available).toBe(false);
  await Greenhollow.act(s, 'open_door'); await Greenhollow.act(s, 'world__move_cellar_stair');
  expect(PlayerView.observe(s.campaign).spatial!.enteredFrom!.mode).toBe('descend');
  expect(PlayerView.observe(s.campaign).spatial!.ancestry.map(p => p.kind)).toEqual(['plane', 'region', 'settlement', 'building', 'level', 'room']);
  await Greenhollow.act(s, 'free_obstruction');
  await Greenhollow.act(s, 'world__escort_cellar_return'); await Greenhollow.act(s, 'world__escort_out_shop');
  expect(s.campaign.state.outcomes!['rescue.returned']).toBe(true);
  expect(s.campaign.state.creatures.find(c => c.id === before.id)).toEqual(before);
  expect(s.campaign.state.creatures.flatMap(c => c.state.inventory ?? []).filter(i => i.id === 'world__cabinet_key')).toHaveLength(1);
  expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
  const replay = await Greenhollow.start(); await replay.replay(s.transcript.steps);
  expect(replay.canonical()).toBe(s.canonical());
}, 30000);

it('keeps discoveries private until communication and uses the shared shrine, wildlife and herbal mechanics', async () => {
  const s = await Greenhollow.start();
  await Greenhollow.act(s, 'world__move_to_refuge'); await Greenhollow.act(s, 'examine');
  expect(Greenhollow.has(s, 'closed', 'world__hall')).toBe(true);
  expect(Greenhollow.has(s, 'knows', 'party', 'charter__localfounding_oath')).toBe(true);
  expect(Greenhollow.has(s, 'knows', 'world__host', 'charter__localfounding_oath')).toBe(false);
  await Greenhollow.act(s, 'tell');
  expect(s.campaign.state.outcomes!['charter.shelter_open']).toBe(true);
  const ration = s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'));
  await Greenhollow.act(s, 'seek_blessing');
  expect(s.campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBe(ration - 1);
  const blessed = s.campaign.state.creatures.find(c => c.state.conditions.some(c => c.id === 'wayfarer_guard'));
  expect(blessed).toBeDefined();
  await Greenhollow.act(s, 'world__move_from_refuge'); await Greenhollow.act(s, 'world__move_to_towpath');
  while (!Greenhollow.has(s, 'recognized', 'party', 'yarrow')) { await Greenhollow.act(s, 'identify_species'); }
  await Greenhollow.act(s, 'gather_herb');
  expect(s.campaign.state.creatures.flatMap(c => c.state.inventory ?? []).some(i => i.definition === 'yarrowbundle')).toBe(true);
  await Greenhollow.act(s, 'world__move_to_clearing'); await Greenhollow.act(s, 'approach_wildlife');
  expect(s.campaign.state.outcomes!['world.wildlife_spared']).toBe(true);
  const remaining = s.campaign.state.creatures.find(c => c.id === blessed!.id)!.state.conditions;
  expect(remaining).toEqual(blessed!.state.conditions);
  expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
}, 30000);

it('retains shared traps, secret loops, combat and equipment on return', async () => {
  const s = await Greenhollow.start(); await Greenhollow.cellar(s);
  expect(PlayerView.observe(s.campaign).choices.some(c => c.id === 'world__move_stores_out')).toBe(false);
  await Greenhollow.act(s, 'world__search_place_cellar'); await Greenhollow.act(s, 'disarm');
  await Greenhollow.act(s, 'world__move_stores_out'); await Greenhollow.act(s, 'world__move_archive_stair');
  expect(PlayerView.observe(s.campaign).spatial!.exits.some(e => e.id === 'world__drain_in')).toBe(false);
  await Greenhollow.act(s, 'world__search_place_vault');
  await Greenhollow.act(s, 'take_item(world__relic'); await Greenhollow.act(s, 'equip_item(world__relic');
  await Greenhollow.act(s, 'attack(world__sentinel');
  expect(s.campaign.state.outcomes!['world.guardian_dead']).toBe(true);
  await Greenhollow.act(s, 'world__move_drain_in'); await Greenhollow.act(s, 'world__move_drain_home');
  await Greenhollow.act(s, 'world__move_from_towpath');
  const injured = s.campaign.state.creatures.map(c => [c.id, c.state.hp]);
  await Greenhollow.act(s, 'world__move_into_shop'); await Greenhollow.act(s, 'world__move_cellar_stair');
  expect(Greenhollow.has(s, 'armed', 'world__dust_trap')).toBe(false);
  expect(s.campaign.state.creatures.map(c => [c.id, c.state.hp])).toEqual(injured);
  const replay = await Greenhollow.start(); await replay.replay(s.transcript.steps);
  expect(replay.canonical()).toBe(s.canonical());
  const risk = await Greenhollow.start(); await Greenhollow.cellar(risk);
  const exposure = await Greenhollow.act(risk, 'risk_passage');
  expect(Greenhollow.has(risk, 'triggered', 'world__dust_trap')).toBe(true);
  expect(exposure.combat.filter(e => e.type === 'save')).toHaveLength(2);
  expect(JSON.stringify(Content.abilities.find(a => a.id === 'censer_miasma')!.effects)).toContain('poisoned');
}, 30000);
