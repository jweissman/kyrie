import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureSchema } from '../src/creature';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';
import { CombatProjection } from '../src/combat-projection';
import { parseAbility } from '../src/lang/parse';
import { Campaign } from '../src/campaign/campaign';
import { Modules } from '../src/campaign/modules';

class Lifecycle {
  static setup(seed = 'lifecycle') {
    const content = new Content(seed);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'fighter' });
    const goblin = content.createCreature('goblin', { raceId: 'goblin', classId: 'commoner' });
    const store = new CreatureStore([hero, goblin]);
    return { hero, goblin, store };
  }
  static enter(store: CreatureStore, seed = 'encounter', abilities = Content.abilities) {
    return Battle.encounter(store, [
      { creatureId: 'hero', team: 'fighters' }, { creatureId: 'goblin', team: 'goblins' },
    ], { seed, abilities });
  }
  static until(battle: Battle, id: string) {
    while (!battle.state.outcome && battle.state.actor !== id) {
      const command = battle.legalCommands().find(c => c.ability === 'defend')!;
      battle.step(command);
    }
    expect(battle.state.actor).toBe(id);
  }
  static woundAndLeave(seed: string) {
    const { hero, goblin, store } = this.setup(seed);
    const battle = this.enter(store);
    this.until(battle, hero.id);
    battle.step({ actor: hero.id, ability: 'wounding_blow', target: goblin.id });
    const injured = store.get(goblin.id);
    expect(injured.state.hp).toBeGreaterThan(0);
    expect(injured.state.hp).toBeLessThan(goblin.state.hp);
    expect(injured.state.conditions).toEqual([{ id: 'weakened', remaining: 2 }]);
    battle.close();
    return { hero, goblin, store, injured, events: battle.events };
  }
}

describe('canonical creature lifecycle', () => {
  it('generates PCs and goblins from one creature template reproducibly and validates their complete instances', () => {
    const a = Lifecycle.setup();
    const b = Lifecycle.setup();
    expect(a.store.snapshot).toEqual(b.store.snapshot);
    expect(Lifecycle.setup('different').store.snapshot).not.toEqual(a.store.snapshot);
    expect(a.hero.base.abilities).toContain('wounding_blow');
    expect(a.goblin.raceId).toBe('goblin');
    for (const creature of a.store.snapshot) {
      CreatureSchema.validate(creature);
      expect(creature).not.toHaveProperty('team');
      expect(creature).not.toHaveProperty('cooldowns');
      expect(creature).not.toHaveProperty('guarding');
    }
    const invalid = structuredClone(a.hero);
    invalid.state.hp = invalid.base.maxHp + 1;
    expect(() => new CreatureStore([invalid])).toThrow();
    invalid.state.hp = 1;
    invalid.state.conditions = [{ id: 'weakened', remaining: 0 }];
    expect(() => CreatureSchema.validate(invalid)).toThrow();
    expect(() => a.store.insert(a.hero)).toThrow();
    const detached = a.store.get('hero');
    detached.state.hp = 0;
    expect(a.store.get('hero')).toEqual(a.hero);
  });
  it('runs two generated fighters versus two generated goblins through the shared engine deterministically', () => {
    const run = () => {
      const content = new Content('persistent-arena');
      const creatures = [content.createCreature('hero-1', { raceId: 'human', classId: 'fighter' }),
        content.createCreature('hero-2', { raceId: 'human', classId: 'fighter' }), content.createCreature('goblin-1', { raceId: 'goblin', classId: 'commoner' }),
        content.createCreature('goblin-2', { raceId: 'goblin', classId: 'commoner' })];
      const store = new CreatureStore(creatures);
      const battle = Battle.encounter(store, creatures.map(c => ({ creatureId: c.id,
        team: c.raceId === 'goblin' ? 'goblins' as const : 'fighters' as const })), { seed: 'persistent-battle' });
      while (!battle.state.outcome) {
        battle.step(battle.legalCommands().find(c => c.ability === 'attack')!);
      }
      expect(store.snapshot.some(c => c.state.hp === 0)).toBe(true);
      for (const fighter of battle.state.combatants) {
        expect(store.get(fighter.id).state.hp).toBe(fighter.hp);
      }
      return { creatures: store.snapshot, events: battle.events };
    };
    expect(run()).toEqual(run());
  });
  it('retains the same injured goblin and persistent language-applied condition across encounters and reload', () => {
    const { hero, goblin, store, injured, events } = Lifecycle.woundAndLeave('lifecycle');
    expect(store.get(goblin.id)).toEqual(injured);
    expect(injured.base).toEqual(goblin.base);
    const reloaded = new CreatureStore(store.snapshot);
    const again = Lifecycle.enter(reloaded, 'second');
    const current = reloaded.get(goblin.id);
    expect(current.state.hp).toBe(injured.state.hp);
    expect(current.base).toEqual(goblin.base);
    expect(current.state.conditions[0]!.remaining).toBeGreaterThan(0);
    expect(again.participants.map(p => p.creatureId)).toEqual(expect.arrayContaining([hero.id, goblin.id]));
    expect(again.participants.every(p => !('hp' in p) && !('base' in p))).toBe(true);
    Lifecycle.until(again, goblin.id);
    const hit = again.step({ actor: goblin.id, ability: 'attack', target: hero.id })
      .find(e => e.type === 'damage');
    expect(hit?.type).toBe('damage');
    if (hit?.type === 'damage') {
      expect(hit.amount).toBe(Math.min(reloaded.get(hero.id).base.maxHp, Math.max(0, hit.rolled - 1)));
    }
    again.close();
    expect(Lifecycle.woundAndLeave('lifecycle').events).toEqual(events);
    expect(Lifecycle.woundAndLeave('lifecycle').store.snapshot).toEqual(store.snapshot);
  });
  it('keeps encounter conditions, guarding and cooldowns local, with no blanket clearing of persistent conditions', () => {
    const { store } = Lifecycle.setup();
    const ability = { ...parseAbility('local_ward', 'Ward',
      'Apply warded to self for 5 turns. Apply weakened to enemy for 5 turns.'), cooldown: 3 };
    const lease = store.acquire(['hero']);
    lease.creatures[0]!.state.learnedAbilities.push('local_ward');
    lease.commit(lease.creatures); lease.release();
    const battle = Battle.encounter(store, [
      { creatureId: 'hero', team: 'fighters' }, { creatureId: 'goblin', team: 'goblins' },
    ], { seed: 'local', abilities: [...Content.abilities, ability] });
    Lifecycle.until(battle, 'hero');
    battle.step({ actor: 'hero', ability: 'local_ward', target: 'goblin' });
    expect(battle.participants.find(p => p.creatureId === 'hero')!.conditions).toContainEqual({
      id: 'warded', remaining: 5,
    });
    expect(battle.participants.find(p => p.creatureId === 'hero')!.cooldowns.local_ward).toBeGreaterThan(0);
    expect(store.get('hero').state.conditions).toEqual([]);
    expect(store.get('goblin').state.conditions[0]!.id).toBe('weakened');
    battle.close();
    const next = Lifecycle.enter(store, 'next', [...Content.abilities, ability]);
    expect(next.participants.every(p => !p.guarding && !Object.keys(p.cooldowns).length
      && !p.conditions.length)).toBe(true);
    expect(store.get('goblin').state.conditions[0]!.id).toBe('weakened');
    next.close();
  });
  it('commits healing, mana, learned abilities and death to the right persistent IDs', () => {
    const { store } = Lifecycle.setup();
    const ability = { ...parseAbility('test', 'Test',
      'Deal 3 physical damage to self. Heal 1 health to self. Teach bolt to self. Kill enemy.'), cost: 2 };
    const lease = store.acquire(['hero']);
    lease.creatures[0]!.base.maxMana = 4;
    expect(() => lease.commit(lease.creatures)).toThrow('characteristics');
    lease.release();
    const creatures = store.snapshot;
    creatures.find(c => c.id === 'hero')!.base.maxMana = 4;
    creatures.find(c => c.id === 'hero')!.state.mana = 4;
    creatures.find(c => c.id === 'hero')!.state.learnedAbilities.push('test');
    const owner = new CreatureStore(creatures);
    const battle = Battle.encounter(owner, [
      { creatureId: 'hero', team: 'fighters' }, { creatureId: 'goblin', team: 'goblins' },
    ], { seed: 'effects', abilities: [...Content.abilities, ability] });
    Lifecycle.until(battle, 'hero');
    const before = owner.get('hero');
    battle.step({ actor: 'hero', ability: 'test', target: 'goblin' });
    expect(owner.get('hero').state.hp).toBe(before.state.hp - 2);
    expect(owner.get('hero').state.mana).toBe(2);
    expect(owner.get('hero').state.learnedAbilities).toContain('bolt');
    expect(owner.get('goblin').state.hp).toBe(0);
    const next = Lifecycle.enter(owner, 'next', [...Content.abilities, ability]);
    expect(next.state.outcome).toBe('fighters');
    expect(owner.get('goblin').state.hp).toBe(0);
  });
  it('prevents concurrent owners and atomically rejects invalid commits without changing the store', () => {
    const { store } = Lifecycle.setup();
    const battle = Lifecycle.enter(store);
    expect(() => Lifecycle.enter(store)).toThrow('already participates');
    const before = store.snapshot;
    expect(() => battle.step({ actor: 'hero', ability: 'attack', target: 'hero' })).toThrow();
    expect(store.snapshot).toEqual(before);
    battle.close();
    const lease = store.acquire(['hero', 'goblin']);
    lease.creatures[0]!.state.gold = 100;
    lease.creatures[1]!.state.hp = -1;
    expect(() => lease.commit(lease.creatures)).toThrow();
    expect(store.get('hero').state.gold).toBe(0);
    lease.release();
    expect(() => lease.commit(lease.creatures)).toThrow('closed');
    const reopened = Lifecycle.enter(store); reopened.close();
  });
  it('commits injured inhabitants through the campaign adapter and reuses them after retreat', () => {
    const campaign = new Campaign('campaign-injury', undefined, Modules.authored());
    const id = campaign.state.inhabitants.raiders![0]!;
    const original = campaign.state.creatures.find(c => c.id === id)!;
    campaign.execute('assault', battle => {
      Lifecycle.until(battle, 'hero-1');
      battle.step({ actor: 'hero-1', ability: 'wounding_blow', target: id });
      battle.close();
    });
    const injured = campaign.state.creatures.find(c => c.id === id)!;
    expect(injured.state.hp).toBeGreaterThan(0);
    expect(injured.state.hp).toBeLessThan(original.state.hp);
    expect(injured.state.conditions[0]!.id).toBe('weakened');
    const next = campaign.encounterBattle('assault');
    expect(next.state.combatants.find(f => f.id === id)!.hp).toBe(injured.state.hp);
    expect(next.state.combatants.find(f => f.id === id)!.statuses[0]!.id).toBe('weakened');
    next.close();
  });
  it('lets interactive controllers resolve the live encounter once without replaying its commands', async () => {
    const campaign = new Campaign('interactive-lifecycle', undefined, Modules.authored());
    const id = campaign.state.inhabitants.raiders![0]!;
    let hp = 0;
    const event = await campaign.executeAsync('assault', async battle => {
      Lifecycle.until(battle, 'hero-1');
      battle.step({ actor: 'hero-1', ability: 'wounding_blow', target: id });
      hp = campaign.state.creatures.find(c => c.id === id)!.state.hp;
      battle.close();
    });
    expect(campaign.state.creatures.find(c => c.id === id)!.state.hp).toBe(hp);
    expect(event.combat.filter(e => e.type === 'action' && e.command.ability === 'wounding_blow')).toHaveLength(1);
    expect(event.result).toBe('failure');
  });
  it('uses one campaign registry for party and generated-once inhabitants', () => {
    const campaign = new Campaign('campaign-lifecycle', undefined, Modules.authored());
    const original = campaign.state.creatures.filter(c => campaign.state.inhabitants.raiders!.includes(c.id));
    const first = campaign.encounterBattle('assault');
    first.close();
    const second = campaign.encounterBattle('assault');
    expect(second.state.combatants.filter(f => f.team === 'goblins')
      .map(f => CombatProjection.creature(f)).sort((a, b) => a.id.localeCompare(b.id)))
      .toEqual(original.sort((a, b) => a.id.localeCompare(b.id)));
    second.close();
    expect(campaign.state.party.map(f => f.id)).toEqual(campaign.state.partyIds);
  });
});
