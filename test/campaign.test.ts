import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { Modules } from '../src/campaign/modules';
import { Planner } from '../src/campaign/planner';
import { World } from '../src/lang/world';
import { ModuleWriter } from '../src/lang/module-writer';
import { Content } from '../src/content';
import { Arena } from '../src/arena';

describe('symbolic campaign planning', () => {
  it('finds causal plans using queries, quantities, and deadlines', () => {
    const instance = Modules.authored();
    const world = new World(instance.module, instance.world);
    const options = { maxNodes: 2000, timeRemaining: 10 };
    const supplied = Planner.search(world, instance.module.goal, instance.module.actions, options)!;
    expect(supplied.actions).toEqual(['parley', 'recover', 'deliver']);
    const poor = world.apply(['rations', 'gold'].map(item => ({ kind: 'set',
      call: ModuleWriter.call('quantity', 'party', item), value: ModuleWriter.number(0) })));
    expect(poor.test(ModuleWriter.call('has', 'party', 'rations'))).toBe(false);
    expect(Planner.search(poor, instance.module.goal, instance.module.actions, options)!.actions)
      .toEqual(['scout', 'ford', 'deliver']);
    const urgent = Planner.search(poor, instance.module.goal, instance.module.actions,
      { ...options, timeRemaining: 4 })!;
    expect(urgent.actions)
      .toEqual(['assault', 'recover', 'deliver']);
    expect(Planner.search(poor, instance.module.goal, instance.module.actions,
      { ...options, timeRemaining: 1 })).toBeNull();
  });
  it('uses the same action rules for execution and planning without duplicate possession flags', () => {
    const campaign = new Campaign('consequences', undefined, Modules.authored());
    expect(() => campaign.execute('deliver')).toThrow();
    const first = campaign.plan()!.actions[0]!;
    const event = campaign.execute(first);
    expect(event.result).toBe('success');
    expect(campaign.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBe(0);
    expect(campaign.world.test(ModuleWriter.call('has', 'party', 'rations'))).toBe(false);
    expect(campaign.world.test(ModuleWriter.call('allied', 'party', 'raiders'))).toBe(true);
    expect(campaign.plan()?.actions[0]).toBe('recover');
    const detached = campaign.state;
    detached.party[0]!.hp = 0;
    expect(campaign.state.party[0]!.hp).toBeGreaterThan(0);
  });
  it('commits wounds, mana, and the actual combat outcome', () => {
    const campaign = new Campaign('combat', undefined, Modules.authored());
    const before = campaign.state;
    const event = campaign.execute('assault');
    expect(event.combat.some(e => e.type === 'action')).toBe(true);
    expect(campaign.state.party.some(f => f.hp < f.maxHp || f.mana < f.maxMana)).toBe(true);
    expect(campaign.state.elapsed).toBe(2);
    expect(campaign.world.test(ModuleWriter.call('defeated', 'raiders'))).toBe(event.result === 'success');
    expect(campaign.state.party.map(f => f.id)).toEqual(before.party.map(f => f.id));
  });
  it('replans after retreat without awarding victory consequences', () => {
    const campaign = new Campaign('retreat', undefined, Modules.authored());
    const event = campaign.execute('assault', battle => {
      while (!battle.state.outcome) {
        const legal = battle.legalCommands();
        battle.step(legal.find(c => c.ability === 'flee') ?? legal.find(c => c.ability === 'attack')!);
      }
    });
    expect(event.result).toBe('failure');
    expect(campaign.world.test(ModuleWriter.call('blocked', 'bridge'))).toBe(true);
    expect(campaign.world.test(ModuleWriter.call('hostile', 'raiders'))).toBe(true);
    expect(campaign.world.test(ModuleWriter.call('defeated', 'raiders'))).toBe(false);
    expect(campaign.available().some(a => a.id === 'parley' || a.id === 'assault')).toBe(false);
  });
  it('replays generated modules and campaigns deterministically across distinct action sets', () => {
    const topologies = new Set<string>();
    for (let i = 0; i < 12; i++) {
      const seed = `campaign-${i}`;
      const generated = Modules.generate(seed);
      topologies.add(generated.instance.module.actions.map(a => a.id).sort().join(','));
      expect(generated).toEqual(Modules.generate(seed));
      const campaign = new Campaign(seed, undefined, generated.instance);
      expect(campaign.plan()).not.toBeNull();
      const result = Campaign.run(seed);
      expect(result).toEqual(Campaign.run(seed));
      if (result.state.outcome === 'success') {
        expect(new World(campaign.module, result.state.world).test(campaign.module.goal)).toBe(true);
        expect(result.state.elapsed).toBeLessThanOrEqual(result.state.deadline);
      }
    }
    expect(topologies.size).toBeGreaterThan(1);
  }, 20000);
});

describe('universal character classes', () => {
  it('separates ancestry from class and allegiance for enemies and player characters', () => {
    const content = new Content('classes');
    const cleric = content.character('cleric', 'hero', 'fighters', 'goblin');
    const enemy = content.character('cleric', 'enemy', 'goblins', 'human');
    const commoner = content.character('commoner', 'villager', 'fighters');
    expect(cleric.abilities).toEqual(enemy.abilities);
    expect(cleric.raceId).toBe('goblin');
    expect(enemy.raceId).toBe('human');
    expect(commoner.classId).toBe('commoner');
    expect(cleric.abilities).toContain('heal');
    expect(cleric.mana).toBeGreaterThan(0);
    Content.validate();
    expect(Arena.create('same')).toEqual(Arena.create('same'));
  });
});
