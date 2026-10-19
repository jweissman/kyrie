import { describe, expect, it } from 'bun:test';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { Campaign } from '../src/campaign/campaign';
import type { BundleRequest } from '../src/campaign/module-bundle';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';

class Sites {
  static manifest = resolve(import.meta.dir, '../data/bundles/two-sites.campaign.json');
  static pantry(id = 'pantry'): BundleRequest {
    return { id, bundle: resolve(import.meta.dir, '../data/bundles/pantry.module.json'), imports: {
      party: 'crossing.party', gold: 'crossing.gold', rations: 'crossing.rations', clock: 'crossing.clock',
      road: 'crossing.exit', watcher: 'crossing.guard',
    } };
  }
  static status(c: Campaign, id: string) { return c.state.modules!.find(m => m.id === id)!; }
  static at(c: Campaign, group: string, place: string) {
    return c.world.test(ModuleWriter.call('at', group, place));
  }
  static async single() {
    const dir = await mkdtemp(join(tmpdir(), 'kyr-campaign-'));
    try {
      const path = join(dir, 'campaign.json');
      await writeFile(path, JSON.stringify({ version: 1, name: 'Single site', modules: [
        { id: 'crossing', bundle: resolve(import.meta.dir, '../data/bundles/crossing.module.json') },
      ] }));
      return await Campaign.load(path, 'sites', NodeBundleSource.shared);
    } finally { await rm(dir, { recursive: true, force: true }); }
  }
  static tick(c: Campaign, until: number) {
    while (c.state.elapsed < until) { c.execute('wait(party)'); }
  }
  static conserved(c: Campaign) {
    expect(c.state.creatures).toHaveLength(4);
    expect(c.state.creatures.reduce((sum, creature) => sum + creature.state.gold, 0)
      + c.world.number(ModuleWriter.call('quantity', 'crossing__market', 'gold'))).toBe(4);
    expect(c.state.partyIds).toEqual(['crossing__hero-1']);
    expect(c.state.world.relations.filter(r => r.name === 'at' && r.args[0] === 'party')).toHaveLength(1);
    const food = ['party', 'crossing__guard', 'pantry__cache', 'pantry__granary'].reduce((sum, id) =>
      sum + c.world.number(ModuleWriter.call('quantity', id, 'rations')), 0);
    expect(food).toBe(2);
  }
}

describe('first-class installed modules', () => {
  it('loads author bundles without catalog registration, scopes local names and shares typed imports', async () => {
    const c = await Campaign.load(Sites.manifest, 'sites', NodeBundleSource.shared);
    expect(c.installations.map(m => m.id)).toEqual(['crossing', 'pantry']);
    expect(c.module.entities.filter(e => e.id === 'party')).toHaveLength(1);
    expect(c.module.entities.some(e => e.id === 'pantry__party')).toBe(false);
    expect(c.module.entities.some(e => e.id === 'pantry__watcher')).toBe(false);
    expect(c.module.entities.filter(e => e.id.endsWith('__carrier'))).toHaveLength(2);
    expect(c.module.entities.filter(e => e.id.endsWith('__winter'))).toHaveLength(2);
    expect(c.module.queries.filter(q => q.name.endsWith('__supplied'))).toHaveLength(2);
    expect(c.module.actions.filter(a => a.id === 'wait(party)')).toHaveLength(1);
    expect(c.save().definition!.schemas!.filter(a => a.id === 'travel')).toHaveLength(1);
    expect(c.installations[0]!.exports.exit).toBe('crossing__refuge');
    expect(c.installations[1]!.exports.site).toBe('pantry__shelter');
    Sites.conserved(c);
  });
  it('travels between sites while both NPCs and deadlines advance, and persists independent late outcomes', async () => {
    const c = await Campaign.load(Sites.manifest, 'sites', NodeBundleSource.shared);
    const initial = c.state.creatures;
    c.execute('walk(party,crossing__village,crossing__refuge)');
    expect(c.events[0]!.npc!.map(n => n.actor)).toEqual(['crossing__carrier', 'pantry__carrier']);
    c.execute('travel(party,crossing__refuge,pantry__shelter)');
    expect(Sites.at(c, 'party', 'pantry__shelter')).toBe(true);
    expect(Sites.status(c, 'crossing').outcomes.away).toBe(true);
    expect(Sites.status(c, 'pantry').outcome).toBe('success');
    expect(Sites.status(c, 'crossing').outcome).toBe('active');
    Sites.tick(c, 8);
    expect(Sites.status(c, 'crossing').outcomes).toMatchObject({ deadline_missed: true, supplied: false });
    expect(Sites.status(c, 'pantry').outcomes).toMatchObject({ deadline_missed: false, supplied: true });
    Sites.tick(c, 11);
    expect(Sites.status(c, 'crossing').outcomes).toMatchObject({ deadline_missed: true, supplied: true });
    expect(c.state.outcome).toBe('active');
    expect(c.running).toBe(true);
    c.execute('travel(party,pantry__shelter,crossing__refuge)');
    c.execute('walk(party,crossing__refuge,crossing__village)');
    expect(Sites.at(c, 'party', 'crossing__village')).toBe(true);
    expect(c.state.creatures.map(creature => creature.id)).toEqual(initial.map(creature => creature.id));
    expect(c.state.creatures.map(creature => creature.base)).toEqual(initial.map(creature => creature.base));
    expect(Sites.status(c, 'pantry').developments).toContainEqual({ id: 'supplied', elapsed: 2 });
    expect(Sites.status(c, 'crossing').developments).toContainEqual({ id: 'deadline_missed', elapsed: 8 });
    Sites.conserved(c);
  }, 20000);
  it('saves both modules and replays the same travel, NPC and deadline history without bundle files on restore', async () => {
    const run = async () => {
      const c = await Campaign.load(Sites.manifest, 'sites', NodeBundleSource.shared);
      c.execute('walk(party,crossing__village,crossing__refuge)');
      c.execute('travel(party,crossing__refuge,pantry__shelter)');
      return c;
    };
    const uninterrupted = await run();
    const resumed = Campaign.restore(JSON.parse(JSON.stringify(uninterrupted.save())));
    Sites.tick(uninterrupted, 11); Sites.tick(resumed, 11);
    expect(resumed.save()).toEqual(uninterrupted.save());
    const replayed = await run(); Sites.tick(replayed, 11);
    expect(replayed.save()).toEqual(uninterrupted.save());
    const detached = resumed.state;
    detached.modules![0]!.outcomes.supplied = false;
    expect(Sites.status(resumed, 'crossing').outcomes.supplied).toBe(true);
  }, 30000);
  it('installs at a later watch without resetting existing creatures, inventory, time or location', async () => {
    let c = await Sites.single();
    c.execute('walk(party,crossing__village,crossing__refuge)');
    Sites.tick(c, 5);
    const before = c.state, log = c.events;
    c = Campaign.restore(JSON.parse(JSON.stringify(c.save())));
    await c.install(Sites.pantry(), NodeBundleSource.shared);
    expect(c.state.elapsed).toBe(5);
    expect(c.events).toEqual(log);
    expect(c.state.creatures.slice(0, 3)).toEqual(before.creatures);
    expect(c.state.party).toEqual(before.party);
    expect(Sites.at(c, 'party', 'crossing__refuge')).toBe(true);
    expect(Sites.status(c, 'pantry')).toMatchObject({ installedAt: 5, deadline: 8, outcome: 'active' });
    expect(c.world.number(ModuleWriter.call('quantity', 'pantry__cache', 'rations'))).toBe(1);
    c.execute('travel(party,crossing__refuge,pantry__shelter)');
    Sites.tick(c, 8);
    expect(Sites.status(c, 'pantry').outcome).toBe('success');
    expect(Sites.status(c, 'crossing').outcome).toBe('failure');
    const snapshot = c.save();
    await expect(c.install(Sites.pantry(), NodeBundleSource.shared)).rejects.toThrow('already installed');
    expect(c.save()).toEqual(snapshot);
    Sites.conserved(c);
  }, 20000);
  it('instantiates the same bundle twice with distinct local IDs and independently relative deadlines', async () => {
    const c = await Sites.single();
    await c.install({ ...Sites.pantry('early'), context: { deadline: 1 } }, NodeBundleSource.shared);
    Sites.tick(c, 2);
    expect(Sites.status(c, 'early')).toMatchObject({ outcome: 'failure', deadline: 1 });
    expect(Sites.status(c, 'early').outcomes.supplied).toBe(true);
    await c.install(Sites.pantry('later'), NodeBundleSource.shared);
    expect(Sites.status(c, 'later')).toMatchObject({ outcome: 'active', installedAt: 2, deadline: 5 });
    expect(c.state.creatures.map(creature => creature.id)).toContain('early__caretaker');
    expect(c.state.creatures.map(creature => creature.id)).toContain('later__caretaker');
    expect(c.world.number(ModuleWriter.call('deficit', 'early__winter'))).toBe(1);
    expect(c.world.number(ModuleWriter.call('deficit', 'later__winter'))).toBe(0);
    Sites.tick(c, 5);
    expect(Sites.status(c, 'later').outcome).toBe('success');
    expect(Sites.status(c, 'early').outcome).toBe('failure');
  }, 20000);
  it('observes the same canonical guard through an explicit cross-module reference after combat and reload', async () => {
    let c = await Campaign.load(Sites.manifest, 'sites', NodeBundleSource.shared);
    c.execute('travel(party,crossing__village,crossing__bank)');
    c.execute('attack(party,crossing__guard,crossing__bank)', battle => {
      while (!battle.state.outcome) {
        battle.step(battle.legalCommands().find(command => command.ability === 'attack')!);
      }
    });
    const guard = c.state.creatures.find(creature => creature.id === 'crossing__guard')!;
    expect(guard.state.hp).toBe(0);
    expect(Sites.status(c, 'crossing').outcomes.guard_dead).toBe(true);
    expect(Sites.status(c, 'pantry').outcomes.guard_dead).toBe(true);
    c = Campaign.restore(JSON.parse(JSON.stringify(c.save())));
    expect(c.state.creatures.filter(creature => creature.id.includes('guard'))).toEqual([guard]);
    expect(Sites.status(c, 'pantry').outcomes.guard_dead).toBe(true);
  });
  it('rejects unresolved/wrongly typed imports and initialization of imported state atomically', async () => {
    const c = await Sites.single(), snapshot = c.save();
    await expect(c.install({ ...Sites.pantry(), imports: {} }, NodeBundleSource.shared)).rejects.toThrow('Unresolved module import');
    await expect(c.install({ ...Sites.pantry(), imports: { ...Sites.pantry().imports!, road: 'crossing.guard' } }, NodeBundleSource.shared))
      .rejects.toThrow('typed import');
    const dir = await mkdtemp(join(tmpdir(), 'kyr-module-'));
    try {
      const original = JSON.parse(await readFile(Sites.pantry().bundle, 'utf8'));
      const source = await readFile(resolve(import.meta.dir, '../data/modules/pantry.kyr'), 'utf8');
      await writeFile(join(dir, 'bad.kyr'), source.replace('  Goal supplied().',
        '  Initially Assert at(party, shelter). Goal supplied().'));
      await writeFile(join(dir, 'bad.module.json'), JSON.stringify({ ...original, situation: 'bad.kyr',
        rules: resolve(import.meta.dir, '../data/rulesets/adventure.kyr'), generation: { ...original.generation,
          templates: resolve(import.meta.dir, '../data/bundles/pantry.templates.json') } }));
      await expect(c.install({ ...Sites.pantry(), bundle: join(dir, 'bad.module.json') }, NodeBundleSource.shared))
        .rejects.toThrow('cannot reset');
    } finally { await rm(dir, { recursive: true, force: true }); }
    expect(c.save()).toEqual(snapshot);
  });
});
