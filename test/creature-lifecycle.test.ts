import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureSchema } from '../src/creature';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';
import { CombatProjection } from '../src/combat-projection';
import { parseAbility } from '../src/lang/parse';
import { Campaign } from '../src/campaign/campaign';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';

class Lifecycle {
  // A blow that always lands and leaves a wound that lasts beyond the fight: Kyr's persistent bleeding.
  static readonly wound = parseAbility('wound', 'Wound', 'Deal 2 physical damage to enemy. Apply bleeding to enemy for 2 turns.');
  static setup(seed = 'lifecycle') {
    const content = new Content(seed);
    const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior', traits: ['brave'],
      abilities: ['wait'] });
    const goblin = content.createCreature('goblin', { raceId: 'goblin', classId: 'commoner', abilities: ['wait'] });
    hero.state.learnedAbilities.push('wound');
    const store = new CreatureStore([hero, goblin]);
    return { hero, goblin, store };
  }
  static enter(store: CreatureStore, seed = 'encounter', abilities = [...Content.abilities, Lifecycle.wound]) {
    return Battle.encounter(store, [
      { creatureId: 'hero', team: 'fighters' }, { creatureId: 'goblin', team: 'goblins' },
    ], { seed, abilities });
  }
  static until(battle: Battle, id: string) {
    while (!battle.state.outcome && battle.state.actor !== id) {
      const legal = battle.legalCommands();
      const command = legal.find(c => c.ability === 'wait') ?? legal.find(c => c.ability === 'defend')
        ?? legal.find(c => c.ability !== 'flee')!;
      battle.step(command);
    }
    expect(battle.state.actor).toBe(id);
  }
  // Swing at a target until a blow lands (Orsino attacks can miss); the seeds decide how many swings that takes.
  static strike(battle: Battle, actor: string, target: string) {
    const start = battle.state.combatants.find(f => f.id === target)!.hp;
    for (let i = 0; i < 20 && battle.state.combatants.find(f => f.id === target)!.hp === start; i++) {
      Lifecycle.until(battle, actor);
      battle.step({ actor, ability: 'melee', target });
    }
  }
  static woundAndLeave(seed: string) {
    const { hero, goblin, store } = this.setup(seed);
    const battle = this.enter(store);
    this.until(battle, hero.id);
    battle.step({ actor: hero.id, ability: 'wound', target: goblin.id });
    const injured = store.get(goblin.id);
    expect(injured.state.hp).toBe(goblin.state.hp - 2);
    expect(injured.state.conditions).toEqual([{ id: 'bleeding', remaining: 2, by: hero.id }]);
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
    expect(a.hero.base.abilities).toContain('cleave');
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
      const creatures = [content.createCreature('hero-1', { raceId: 'human', classId: 'warrior' }),
        content.createCreature('hero-2', { raceId: 'human', classId: 'warrior' }), content.createCreature('goblin-1', { raceId: 'goblin', classId: 'commoner' }),
        content.createCreature('goblin-2', { raceId: 'goblin', classId: 'commoner' })];
      const store = new CreatureStore(creatures);
      const battle = Battle.encounter(store, creatures.map(c => ({ creatureId: c.id,
        team: c.raceId === 'goblin' ? 'goblins' as const : 'fighters' as const })), { seed: 'persistent-battle' });
      while (!battle.state.outcome) {
        battle.step(battle.legalCommands().find(c => c.ability === 'melee' || c.ability === 'ranged')!);
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
    // The wound bleeds at the end of the goblin's turn (Orsino's onTurnEnd), whatever it does.
    const turn = again.step({ actor: goblin.id, ability: 'wait', target: goblin.id });
    expect(turn.find(e => e.type === 'damage')).toMatchObject({ target: goblin.id, damageType: 'bleed', amount: 1 });
    again.close();
    expect(Lifecycle.woundAndLeave('lifecycle').events).toEqual(events);
    expect(Lifecycle.woundAndLeave('lifecycle').store.snapshot).toEqual(store.snapshot);
  });
  it('keeps encounter conditions, guarding and cooldowns local, with no blanket clearing of persistent conditions', () => {
    const { store } = Lifecycle.setup();
    const ability = { ...parseAbility('local_ward', 'Ward',
      'Apply blessed to self for 5 turns. Apply bleeding to enemy for 5 turns.'), cooldown: 3 };
    const lease = store.acquire(['hero']);
    lease.creatures[0]!.state.learnedAbilities.push('local_ward');
    lease.commit(lease.creatures); lease.release();
    const battle = Battle.encounter(store, [
      { creatureId: 'hero', team: 'fighters' }, { creatureId: 'goblin', team: 'goblins' },
    ], { seed: 'local', abilities: [...Content.abilities, ability, Lifecycle.wound] });
    Lifecycle.until(battle, 'hero');
    battle.step({ actor: 'hero', ability: 'local_ward', target: 'goblin' });
    expect(battle.participants.find(p => p.creatureId === 'hero')!.conditions).toContainEqual({
      id: 'blessed', remaining: 5, by: 'hero',
    });
    expect(battle.participants.find(p => p.creatureId === 'hero')!.cooldowns.local_ward).toBeGreaterThan(0);
    expect(store.get('hero').state.conditions).toEqual([]);
    expect(store.get('goblin').state.conditions[0]!.id).toBe('bleeding');
    battle.close();
    const next = Lifecycle.enter(store, 'next', [...Content.abilities, ability, Lifecycle.wound]);
    expect(next.participants.every(p => !Object.keys(p.cooldowns).length && !p.conditions.length)).toBe(true);
    expect(store.get('goblin').state.conditions[0]!.id).toBe('bleeding');
    next.close();
  });
  it('commits healing, mana, learned abilities and death to the right persistent IDs', () => {
    const { store } = Lifecycle.setup();
    const ability = { ...parseAbility('test', 'Test',
      'Deal 3 physical damage to self. Heal 1 health to self. Teach firebolt to self. Kill enemy.'), cost: 2 };
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
    ], { seed: 'effects', abilities: [...Content.abilities, ability, Lifecycle.wound] });
    Lifecycle.until(battle, 'hero');
    const before = owner.get('hero');
    battle.step({ actor: 'hero', ability: 'test', target: 'goblin' });
    expect(owner.get('hero').state.hp).toBe(before.state.hp - 2);
    expect(owner.get('hero').state.mana).toBe(2);
    expect(owner.get('hero').state.learnedAbilities).toContain('firebolt');
    expect(owner.get('goblin').state.hp).toBe(0);
    const next = Lifecycle.enter(owner, 'next', [...Content.abilities, ability, Lifecycle.wound]);
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
});

describe('canonical creature lifecycle in a campaign', () => {
  // A canonical fixture campaign: a company of two and two wolves in a yard.
  const yard = (seed: string) => Campaign.load('test/fixtures/wolf-yard/campaign.json', seed, NodeBundleSource.shared);
  const assault = 'attack(party,world__grey,world__yard)', hero = 'world__party_1';
  it('commits injured inhabitants through the campaign adapter and reuses them after retreat', async () => {
    const campaign = await yard('campaign-injury:2');
    const id = campaign.state.inhabitants.world__grey![0]!;
    const original = campaign.state.creatures.find(c => c.id === id)!;
    campaign.execute(assault, battle => {
      Lifecycle.strike(battle, hero, id);
      battle.close();
    });
    const injured = campaign.state.creatures.find(c => c.id === id)!;
    expect(injured.state.hp).toBeGreaterThan(0);
    expect(injured.state.hp).toBeLessThan(original.state.hp);
    const next = campaign.encounterBattle(assault);
    expect(next.state.combatants.find(f => f.id === id)!.hp).toBe(injured.state.hp);
    next.close();
  });
  it('lets interactive controllers resolve the live encounter once without replaying its commands', async () => {
    const campaign = await yard('interactive-lifecycle');
    const id = campaign.state.inhabitants.world__grey![0]!;
    let hp = 0;
    const event = await campaign.executeAsync(assault, async battle => {
      Lifecycle.until(battle, hero);
      battle.step({ actor: hero, ability: 'melee', target: id });
      hp = campaign.state.creatures.find(c => c.id === id)!.state.hp;
      battle.close();
    });
    expect(campaign.state.creatures.find(c => c.id === id)!.state.hp).toBe(hp);
    expect(event.combat.filter(e => e.type === 'action' && e.command.actor === hero && e.command.ability === 'melee'))
      .toHaveLength(1);
    expect(event.result).toBe('failure');
  });
  it('uses one campaign registry for party and generated-once inhabitants', async () => {
    const campaign = await yard('campaign-lifecycle');
    const original = campaign.state.creatures.filter(c => campaign.state.inhabitants.world__grey!.includes(c.id));
    const first = campaign.encounterBattle(assault);
    first.close();
    const second = campaign.encounterBattle(assault);
    expect(second.state.combatants.filter(f => f.team === 'goblins')
      .map(f => CombatProjection.creature(f, original[0])).sort((a, b) => a.id.localeCompare(b.id)))
      .toEqual(original.sort((a, b) => a.id.localeCompare(b.id)));
    second.close();
    expect(campaign.state.party.map(f => f.id)).toEqual(campaign.state.partyIds);
  });
});
