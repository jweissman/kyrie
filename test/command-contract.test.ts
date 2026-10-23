import { PlayerView } from '../src/presentation/player-view';
import { Items } from '../src/campaign/items';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { World } from '../src/lang/world';
import { expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { AbilityUse } from '../src/ability-use';
import { Content } from '../src/content';
import { Effects, type EffectContext } from '../src/effects';
import { Expressions } from '../src/expressions';
import { parseAbility, type ArenaAbility } from '../src/lang/parse';
import { CombatProjection } from '../src/combat-projection';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';

class ContractProbe {
  static context(): EffectContext {
    const content = new Content('contract');
    const actor = content.character('warrior', 'hero', 'fighters', 'human');
    const enemy = content.character('warrior', 'enemy', 'goblins', 'human');
    enemy.hp = enemy.maxHp = 100; actor.strength = 10; actor.mana = actor.maxMana = 20;
    actor.traits = []; enemy.traits = [];
    return { actor, fighters: [actor, enemy], content, events: [], turn: 1,
      abilities: Content.abilities.map(a => a.id), retreat: false, location: null };
  }
  // An Orsino weapon attack followed by a rider: the rider happens only if the attack hits (perform stops at a miss).
  static readonly weapon: ArenaAbility = { ...parseAbility('probe', 'Probe', 'Deal 3 fire damage to enemy.'),
    cost: 1 };
  static { ContractProbe.weapon.effects.unshift({ kind: 'attack', target: 'enemy' }); }
  static async start() {
    return PlaySession.start('test/fixtures/march/serewater-march.campaign.json', 'contract', NodeBundleSource.shared);
  }
}

it('makes misses and criticals explicit, pays costs on misses, and applies both components only on hit', () => {
  const seen = new Set<string>();
  for (let i = 0; i < 200 && seen.size < 3; i++) {
    const ctx = ContractProbe.context(), mana = ctx.actor!.mana;
    AbilityUse.perform(ContractProbe.weapon, 'enemy', new Expressions(`attack:${i}`), ctx);
    const attack = ctx.events.find(e => e.type === 'attack')!;
    if (attack.type !== 'attack') { throw new Error('No attack event'); }
    expect(ctx.actor!.mana).toBe(mana - 1);
    const damage = ctx.events.filter(e => e.type === 'damage');
    if (!attack.success) { expect(damage).toEqual([]); seen.add('miss'); }
    else {
      expect(damage.map(e => e.type === 'damage' ? e.damageType : '')).toEqual([ctx.actor!.equipment.weapon.type, 'fire']);
      expect(damage[1]).toMatchObject({ rolled: 3, amount: 3 });
      const weapon = damage[0]!;
      expect(weapon.type === 'damage' && (weapon.modifiers?.critical ?? 0) > 0).toBe(attack.critical);
      expect(attack.need).toBe(20 - Math.floor(ctx.actor!.level / 2) - attack.armorClass - attack.toHit);
      seen.add(attack.critical ? 'critical' : 'hit');
    }
  }
  expect([...seen].sort()).toEqual(['critical', 'hit', 'miss']);
});

it('applies Orsino hit arithmetic to every hit: bonus damage, then resistance, then damage reduction; true damage skips both', () => {
  const ctx = ContractProbe.context(), target = ctx.fighters[1]!;
  target.equipment = { ...target.equipment, modifiers: { damageReduction: 2, resistances: { fire: 0.5 } } };
  ctx.actor!.equipment = { ...ctx.actor!.equipment, modifiers: { bonusDamage: 2 } };
  const ability = { ...parseAbility('packets', 'Packets',
    'Deal 4 physical damage to enemy. Deal 4 fire damage to enemy. Deal 4 true damage to enemy.'), cost: 1 };
  AbilityUse.perform(ability, 'enemy', new Expressions('packet'), ctx);
  expect(ctx.events.filter(e => e.type === 'damage').map(e => 'amount' in e ? e.amount : 0)).toEqual([4, 1, 6]);
  expect(ctx.events.find(e => e.type === 'damage')).toMatchObject({ modifiers: { bonus: 2, reduction: 2 } });
});

it('rejects invalid definitions and unbound areas before spending mana or emitting events', () => {
  const ctx = ContractProbe.context(), before = structuredClone(ctx.actor);
  expect(() => AbilityUse.perform({ ...ContractProbe.weapon, cost: -1 }, 'enemy', new Expressions('invalid'), ctx))
    .toThrow('Invalid ability cost');
  ctx.recipients = [ctx.actor!];
  expect(() => AbilityUse.perform(ContractProbe.weapon, 'enemy', new Expressions('area'), ctx)).toThrow('No eligible');
  expect(ctx.actor).toEqual(before); expect(ctx.events).toEqual([]);
});

it('uses typed source-only damage for world-time conditions and expires them exactly once', () => {
  const ctx = ContractProbe.context(), target = ctx.fighters[1]!;
  target.statuses = [{ id: 'poisoned', remaining: 2, clock: 'world-time', source: 'poison-needle' }];
  ctx.actor = undefined;
  Effects.advance(target, 'world-time', ctx); Effects.advance(target, 'world-time', ctx);
  Effects.advance(target, 'world-time', ctx);
  expect(target.hp).toBe(96); expect(target.statuses).toEqual([]);
  expect(ctx.events.filter(e => e.type === 'damage').map(e => 'actor' in e ? e.actor : '')).toEqual(['poison-needle', 'poison-needle']);
  expect(ctx.events.filter(e => e.type === 'expire')).toHaveLength(1);
  target.statuses = [{ id: 'fireproof', remaining: 1, clock: 'until-removed', source: 'ring' }];
  Effects.advance(target, 'world-time', ctx); expect(target.statuses).toHaveLength(1);
});

it('advances world-time wards during ordinary campaign actions, saves their clocks and records canonical changes', async () => {
  const s = await ContractProbe.start();
  const checkpoint = s.checkpoint(), id = checkpoint.save.state.partyIds[0]!;
  checkpoint.save.creatures.find(c => c.id === id)!.state.conditions.push({
    id: 'fireproof', remaining: 2, clock: 'world-time', source: 'ward' });
  checkpoint.save.state.world = CreatureFacts.project(new World(checkpoint.save.module, checkpoint.save.state.world),
    checkpoint.save.definition!.actors, new CreatureStore(checkpoint.save.creatures)).snapshot;
  const restored = PlaySession.resume(checkpoint);
  const event = await restored.perform('go(march__causeway_path,march__causeway)');
  expect(event.resolution?.outcome).toBe('success');
  expect(event.resolution?.bodies.some(c => c.id === id)).toBe(true);
  expect(event.resolution?.world.some(c => c.call.name === 'at')).toBe(true);
  expect(PlaySession.resume(restored.checkpoint()).canonical()).toBe(restored.canonical());
  const remaining = restored.campaign.state.creatures.find(c => c.id === id)!.state.conditions;
  expect(remaining.length === 0 || remaining[0]!.remaining < 2).toBe(true);
}, 30000);

it('commits a fatal hazard as failure without crossing, and rejects later invalid commands atomically', async () => {
  const s = await ContractProbe.start();
  for (const command of ['go(march__causeway_path,march__causeway)', 'change_thing(hill__boar_pass)', 'go(hill__low_path,hill__drain_mouth)',
    'go(hill__culvert,hill__workshop)']) { await s.perform(command); }
  const checkpoint = s.checkpoint();
  checkpoint.save.creatures.find(c => c.id === checkpoint.save.state.partyIds[1])!.state.hp = 1;
  checkpoint.save.state.world = CreatureFacts.project(new World(checkpoint.save.module, checkpoint.save.state.world),
    checkpoint.save.definition!.actors, new CreatureStore(checkpoint.save.creatures)).snapshot;
  const resumed = PlaySession.resume(checkpoint);
  const event = await resumed.perform('risk(hill__steam_pipe,march__member_party_2)');
  expect(event.result).toBe('failure'); expect(event.resolution?.outcome).toBe('failure');
  expect(event.combat.some(e => e.type === 'death')).toBe(true);
  const save = event.combat.find(e => e.type === 'save');
  expect(save).toMatchObject({ actor: 'hill__steam_pipe', stat: 'dexterity', difficulty: 11, success: false });
  expect(save?.type === 'save' && save.rolled).toBe(save?.type === 'save' && save.die! + save.modifier!);
  expect(resumed.campaign.world.test(ModuleWriter.call('at', 'party', 'hill__workshop'))).toBe(true);
  expect(resumed.campaign.world.test(ModuleWriter.call('state', 'hill__steam_pipe', 'hill__vented'))).toBe(true);
  const before = resumed.canonical();
  await expect(resumed.perform('not-a-command')).rejects.toThrow();
  expect(resumed.canonical()).toBe(before);
}, 30000);

it('validates field wards using the shared typed definitions and keeps generated base data unchanged', () => {
  const c = new Content('clock').createCreature('mage', { raceId: 'human', classId: 'cleric', traits: ['vitalist'] });
  c.state.learnedAbilities.push('fire_ward');
  const store = new CreatureStore([c]);
  FieldUse.perform(store, ['mage'], { ability: 'fire_ward', caster: 'mage', target: 'mage', seed: 'clock' });
  expect(store.get('mage').state.conditions[0]).toMatchObject({ remaining: 12, clock: 'world-time' });
  expect(store.get('mage').base).toEqual(c.base);
  expect(CombatProjection.fighter(store.get('mage'), 'fighters').statuses[0]!.clock).toBe('world-time');
});

it('resolves an explicitly bound area through the same pipeline without affecting absent creatures', () => {
  const content = new Content('area'), ids = ['one', 'two', 'elsewhere'];
  const store = new CreatureStore(ids.map(id => content.createCreature(id, { raceId: 'human', classId: 'warrior',
    traits: ['brave'] })));
  const entities = [{ id: 'hot_air', type: 'hazard', name: 'Hot air', effect: 'Deal 1 fire damage to all.' }];
  {
    const before = store.snapshot;
    const events = Items.exposeArea(store, { targets: ['one', 'two'], ability: 'hot_air', source: 'hot-room', seed: 'area',
      entities });
    expect(events.filter(e => e.type === 'damage').map(e => 'target' in e ? e.target : '')).toEqual(['one', 'two']);
    expect(store.get('elsewhere')).toEqual(before[2]!);
    expect(store.get('one').state.hp).toBe(before[0]!.state.hp - 1);
    expect(store.snapshot).toHaveLength(3);
  }
});

it('keeps offscreen ongoing effects in the canonical receipt without leaking them into player feedback', async () => {
  const session = await ContractProbe.start(), cp = session.checkpoint();
  const npc = cp.save.creatures.find(c => c.id === 'hill__hound_person')!;
  npc.state.conditions.push({ id: 'poisoned', remaining: 1, clock: 'world-time', source: 'private-needle' });
  const initialHp = npc.state.hp;
  cp.save.state.world = CreatureFacts.project(new World(cp.save.module, cp.save.state.world),
    cp.save.definition!.actors, new CreatureStore(cp.save.creatures)).snapshot;
  const s = PlaySession.resume(cp), event = await s.perform('wait');
  expect(s.campaign.state.creatures.find(c => c.id === npc.id)!.state.hp).toBe(initialHp - 2);
  expect(event.combat.some(e => 'actor' in e && e.actor === 'private-needle')).toBe(false);
  expect(event.resolution?.events.some(e => 'actor' in e && e.actor === 'private-needle'
    && e.visibility === 'private')).toBe(true);
  expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
}, 30000);

it('applies typed ongoing damage without treating armour class as poison protection', () => {
  const ctx = ContractProbe.context(), target = ctx.fighters[1]!;
  target.equipment = { ...target.equipment, armorAc: 7 };
  target.statuses = [{ id: 'poisoned', remaining: 1, clock: 'world-time', source: 'needle' }];
  ctx.expressions = new Expressions('needle');
  Effects.advance(target, 'world-time', ctx);
  expect(target.hp).toBe(98);
  expect(ctx.events.find(e => e.type === 'damage')).toMatchObject({ damageType: 'poison', modifiers: { reduction: 0 } });
});

it('removes an equipment-granted field ability when its item leaves, retaining the independently cast ward', () => {
  const c = new Content('focus').createCreature('mage', { raceId: 'human', classId: 'cleric', traits: ['vitalist'] });
  const store = new CreatureStore([c]);
  Items.take(store, 'mage', { id: 'focus', definition: 'warding_focus' }); Items.equip(store, 'mage', 'focus');
  FieldUse.perform(store, ['mage'], { ability: 'fire_ward', caster: 'mage', target: 'mage', seed: 'focus' });
  Items.drop(store, 'mage', 'focus');
  const mana = store.get('mage').state.mana;
  expect(() => FieldUse.perform(store, ['mage'], {
    ability: 'fire_ward', caster: 'mage', target: 'mage', seed: 'again' })).toThrow('Caster cannot');
  expect(store.get('mage').state.mana).toBe(mana);
  expect(store.get('mage').state.conditions[0]).toMatchObject({ clock: 'world-time', source: 'focus' });
  expect(store.get('mage').state.learnedAbilities).not.toContain('fire_ward');
});

it('makes half saves an explicit partial resolution with committed cost', () => {
  const ctx = ContractProbe.context(), mana = ctx.actor!.mana;
  const ability: ArenaAbility = { ...parseAbility('half', 'Half', 'Deal 7 fire damage to enemy.'), cost: 1 };
  ability.effects[0]!.save = { stat: 'dexterity', difficulty: { kind: 'literal', value: 0 }, success: 'half' };
  const result = AbilityUse.perform(ability, 'enemy', new Expressions('half'), ctx);
  expect(result.outcome).toBe('partial'); expect(ctx.actor!.mana).toBe(mana - 1);
  expect(ctx.fighters[1]!.hp).toBe(97);
  expect(ctx.events.find(e => e.type === 'damage')).toMatchObject({ amount: 3, rolled: 7, modifiers: { halfSave: true } });
});

it('keeps world clocks separate from owner-turn clocks across encounter projection and commit', () => {
  const content = new Content('independent-clocks');
  const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior' });
  const enemy = content.createCreature('enemy', { classId: 'thief', raceId: 'goblin' });
  hero.state.conditions.push({ id: 'fireproof', remaining: 12, clock: 'world-time', source: 'focus' });
  const store = new CreatureStore([hero, enemy]);
  const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
    { creatureId: 'enemy', team: 'goblins' }], { seed: 'independent-clocks' });
  while (!battle.state.outcome && battle.state.actor !== 'hero') {
    battle.step(battle.legalCommands().find(c => c.ability === 'defend') ?? battle.legalCommands()[0]!);
  }
  expect(battle.state.actor).toBe('hero');
  battle.close();
  expect(store.get('hero').state.conditions[0]).toMatchObject({ remaining: 12, clock: 'world-time' });
});

it('commits deaths during delayed recovery instead of throwing and rolling back the fatal clock', async () => {
  const initial = await ContractProbe.start(); await initial.perform('go(march__oar_door,march__taproom)');
  const cp = initial.checkpoint();
  for (const c of cp.save.creatures.filter(c => cp.save.state.partyIds.includes(c.id))) {
    c.state.hp = 1;
    c.state.conditions.push({ id: 'poisoned', remaining: 1, clock: 'world-time', source: 'bad-provisions' });
  }
  cp.save.state.world = CreatureFacts.project(new World(cp.save.module, cp.save.state.world),
    cp.save.definition!.actors, new CreatureStore(cp.save.creatures)).snapshot;
  const s = PlaySession.resume(cp), command = PlayerView.observe(s.campaign).choices
    .find(c => c.id.startsWith('take_lodging'))!.id;
  const before = s.campaign.state.elapsed, event = await s.perform(command);
  expect(event.result).toBe('failure'); expect(event.resolution?.outcome).toBe('failure');
  expect(s.campaign.state.elapsed).toBeGreaterThan(before);
  expect(s.campaign.state.creatures.filter(c => s.campaign.state.partyIds.includes(c.id)).every(c => c.state.hp === 0))
    .toBe(true);
  expect(event.combat.filter(e => e.type === 'death')).toHaveLength(3);
  expect(event.combat.some(e => e.type === 'heal')).toBe(false);
  expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
}, 60000);
