import { expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { CombatProjection } from '../src/combat-projection';
import { Items } from '../src/campaign/items';
import { Effects, type EffectContext } from '../src/effects';
import { AbilityUse } from '../src/ability-use';
import { Expressions } from '../src/expressions';
import type { CombatEvent } from '../src/model';
import { FieldUse } from '../src/campaign/field-use';
import { Battle } from '../src/battle';
import { PlaySession } from '../src/session/play-session';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { PlayerView } from '../src/presentation/player-view';
import { ModuleWriter } from '../src/lang/module-writer';
import { Witnesses } from '../src/campaign/witnesses';
import { parseAbility, type Effect } from '../src/lang/parse';

class Causal {
  static async start() {
    return PlaySession.start('data/caught-below/river.campaign.json', 'causal', NodeBundleSource.shared);
  }
  static async act(s: PlaySession, prefix: string) {
    const c = PlayerView.observe(s.campaign).choices.find(c => c.id.startsWith(prefix));
    if (!c) { throw new Error(`No available ${prefix}`); }
    return s.perform(c.id);
  }
  static has(s: PlaySession, name: string, ...args: string[]) {
    return s.campaign.world.test(ModuleWriter.call(name, ...args));
  }
  static readonly workshop = ['go(world__causeway_path,world__causeway)',
    'go(world__low_path,world__drain_mouth)', 'go(world__culvert,world__workshop)'];
}

it('resolves an equipped weapon as two typed components, with item provenance and independent defenses', () => {
  const content = new Content('components');
  const hero = content.createCreature('hero', { raceId: 'human', classId: 'fighter', professionId: 'herbalist' });
  const store = new CreatureStore([hero]);
  Items.take(store, 'hero', { id: 'sword', definition: 'longsword_of_flames_autohit' }); Items.equip(store, 'hero', 'sword');
  const actor = CombatProjection.fighter(store.get('hero'), 'fighters');
  const target = content.character('barrow_warden', 'warden', 'goblins', 'revenant');
  target.hp = target.maxHp = 100; target.statuses = [{ id: 'orsino_fireproof', remaining: 10, source: 'ward' }];
  const context: EffectContext = { actor, fighters: [actor, target], turn: 1, events: [], content,
    source: actor.abilitySources!.orsino_flame_blade, abilities: [], retreat: false, location: null };
  AbilityUse.perform(Content.abilities.find(a => a.id === 'orsino_flame_blade')!, target.id,
    new Expressions('components'), context);
  const components = context.events.filter((e): e is Extract<CombatEvent, { type: 'damage' | 'heal' }> => e.type === 'damage');
  expect(components.map(e => e.damageType)).toEqual(['piercing', 'fire']);
  for (const e of components) {
    expect(e.modifiers!.resistance).toBe(0.5);
    expect(e.amount).toBe(Math.floor(e.rolled * 0.5));
  }
  expect(context.events[0]).toMatchObject({ type: 'action', source: { id: 'sword', kind: 'item' } });
  const committed = CombatProjection.creature(actor, store.get('hero'));
  expect(committed.base).toEqual(hero.base);
  expect(committed.professionId).toBe('herbalist');
  expect(committed.state.learnedAbilities).not.toContain('orsino_flame_blade');
  committed.state.inventory = [];
  expect(CombatProjection.fighter(committed, 'fighters').abilities).not.toContain('orsino_flame_blade');
});

it('keeps an independently learned technique when the same technique is also granted by equipment', () => {
  const c = new Content('known').createCreature('hero', { classId: 'fighter' });
  c.state.learnedAbilities.push('orsino_flame_blade');
  c.state.inventory = [{ id: 'blade', definition: 'longsword_of_flames_autohit', equipped: true }];
  const next = CombatProjection.creature(CombatProjection.fighter(c, 'fighters'), c);
  expect(next.state.learnedAbilities).toContain('orsino_flame_blade');
});

it('honors immunity and vulnerability, and rejects malformed typed mechanics', () => {
  const content = new Content('defense'), target = content.character('mortuary_custodian', 'bronze', 'fighters', 'bronze_construct');
  const context: EffectContext = { fighters: [target], recipients: [target], source: { id: 'vent', kind: 'trap' },
    content, events: [], abilities: [], turn: 0, retreat: false, location: null };
  const hp = target.hp;
  AbilityUse.perform(parseAbility('venom', 'Venom', 'Deal 10 poison damage to ally.'), target.id,
    new Expressions('immune'), context);
  expect(target.hp).toBe(hp);
  expect(context.events.find(e => e.type === 'damage')).toMatchObject({ amount: 0, modifiers: { resistance: 1 } });
  expect(context.actor).toBeUndefined(); expect(context.fighters).toHaveLength(1);
  AbilityUse.perform(parseAbility('sun', 'Sun', 'Deal 4 radiant damage to ally.'), target.id,
    new Expressions('vulnerable'), context);
  expect(context.events.filter(e => e.type === 'damage').at(-1)).toMatchObject({ amount: 5 });
  expect(() => Effects.validate({ kind: 'undefined_magic', target: 'ally' } as unknown as Effect, []))
    .toThrow('Unknown typed effect');
});

it('resolves source-only hazards without synthetic creatures and rejects creature-only effects before mutation', () => {
  const c = new Content('steam').createCreature('hero', { classId: 'fighter' });
  const store = new CreatureStore([c]);
  const steam = [{ id: 'foundry_steam', type: 'hazard', name: 'Scalding foundry steam',
    effect: 'Deal (1d6) fire damage to ally unless dexterity save against (11).' }];
  const events = Items.expose(store, { target: c.id, ability: 'foundry_steam', source: 'actual-pipe', seed: 'steam',
    entities: steam });
  expect(store.snapshot).toHaveLength(1);
  expect(events[0]).toMatchObject({ type: 'action', command: { actor: 'actual-pipe' }, source: { id: 'actual-pipe' } });
  const target = CombatProjection.fighter(c, 'fighters'), context: EffectContext = { recipients: [target], fighters: [target],
    source: { id: 'vent', kind: 'trap' }, turn: 0, events: [], content: new Content('invalid'), abilities: [],
    retreat: false, location: null };
  const before = JSON.stringify(target);
  expect(() => AbilityUse.perform(parseAbility('invalid', 'Invalid', 'Deal 3 fire damage to ally. Defend.'), c.id,
    new Expressions('invalid'), context)).toThrow('requires a creature actor');
  expect(JSON.stringify(target)).toBe(before); expect(context.events).toEqual([]);
});

it('preserves a timed spell through field use and consumes its duration only at owner combat-turn boundaries', () => {
  const content = new Content('ward');
  const hero = content.createCreature('hero', { raceId: 'dwarf', classId: 'cleric', traits: ['vitalist'], level: 3 });
  const enemy = content.createCreature('enemy', { raceId: 'goblin', classId: 'fighter' });
  const store = new CreatureStore([hero, enemy]);
  FieldUse.perform(store, ['hero'], { ability: 'resist_fire', caster: 'hero', target: 'hero', seed: 'cast' });
  expect(store.get('hero').state.conditions[0]).toMatchObject({ id: 'fireproof', remaining: 10 });
  expect(store.get('hero').state.mana).toBe(hero.state.mana - 2);
  const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' }, { creatureId: 'enemy', team: 'goblins' }],
    { seed: 'turns' });
  while (!battle.state.outcome && battle.state.actor !== 'hero') {
    battle.step(battle.legalCommands().find(c => c.ability === 'defend')!);
  }
  expect(store.get('hero').state.conditions[0]!.remaining).toBe(9);
  battle.close();
  expect(store.get('hero').state.conditions[0]!.remaining).toBe(9);
});

it('connects an ordinary object transition, equipment, a witnessed attack and a lasting service consequence', async () => {
  const s = await Causal.start();
  for (const c of Causal.workshop) { await s.perform(c); }
  await s.perform('change_thing(world__padlock_pick)'); await s.perform('go(world__stores_door,world__stores)');
  await Causal.act(s, 'take_item(rescue__bar'); await s.perform('go(world__stores_door,world__workshop)');
  const valve = await s.perform('change_thing(world__steam_pipe_close)');
  expect(Causal.has(s, 'state', 'world__steam_pipe', 'world__shut')).toBe(true);
  expect(valve.changes.some(c => c.includes('state(world__steam_pipe, world__shut)'))).toBe(true);
  await s.perform('go(world__boiler_arch,world__boiler)');
  await Causal.act(s, 'take_item(world__ward_sword'); await Causal.act(s, 'equip_item(world__ward_sword');
  await s.perform('go(world__pipe_walk,world__gallery)');
  expect(PlayerView.observe(s.campaign).choices.some(c => c.id.startsWith('take_healing(world__hesta'))).toBe(true);
  const fight = await s.perform('attack(world__hound)');
  expect(Causal.has(s, 'witnessedAttack', 'world__hesta', 'party', 'world__hound')).toBe(true);
  expect(Causal.has(s, 'witnessedAttack', 'world__nera', 'party', 'world__hound')).toBe(false);
  expect(Causal.has(s, 'refusesService', 'world__hesta', 'party')).toBe(true);
  expect(PlayerView.observe(s.campaign).choices.some(c => c.id.startsWith('take_healing(world__hesta'))).toBe(false);
  expect(fight.perceptions?.some(p => p.kind === 'event' && p.text.includes('Find your salve elsewhere'))).toBe(true);
  expect(s.campaign.state.creatures.find(c => c.id === 'world__hesta_person')!.professionId).toBe('herbalist');
  const hound = s.campaign.state.creatures.find(c => c.id === 'world__hound_person')!;
  expect(PlayerView.observe(s.campaign).observations.some(o => o.text.includes('hound stands across')))
    .toBe(hound.state.hp > 0);
  expect(PlaySession.resume(s.checkpoint()).canonical()).toBe(s.canonical());
  const replay = await Causal.start(); await replay.replay(s.transcript.steps);
  expect(replay.canonical()).toBe(s.canonical());
}, 60000);

it('offers the risky hazard approach, records its actual physical source, and keeps nearby witnesses private', async () => {
  const s = await Causal.start(); for (const c of Causal.workshop) { await s.perform(c); }
  const event = await Causal.act(s, 'risk(world__steam_pipe');
  expect(event.combat[0]).toMatchObject({ type: 'action', source: { id: 'world__steam_pipe', kind: 'trap' } });
  expect(Causal.has(s, 'state', 'world__steam_pipe', 'world__vented')).toBe(true);
  const before = s.campaign.world;
  const action = { ...s.campaign.schemas.find(a => a.id === 'attack')!, actor: 'party',
    resolve: ModuleWriter.call('combat', 'world__hound') };
  const after = Witnesses.record(before, before, action, [{ type: 'damage', turn: 1, actor: 'hero',
    target: 'hound', rolled: 1, amount: 1, hp: 1 }]);
  expect(after.test(ModuleWriter.call('witnessedAttack', 'world__hesta', 'party', 'world__hound'))).toBe(false);
  const together = before.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', 'world__gallery') }]);
  const dot = Witnesses.record(together, together, action, [{ type: 'damage', turn: 1,
    actor: 'world__hound_person', target: 'world__hound_person', rolled: 2, amount: 2, hp: 1 }]);
  expect(dot.test(ModuleWriter.call('witnessedAttack', 'world__hesta', 'party', 'world__hound'))).toBe(false);
  const strike = Witnesses.record(together, together, action, [{ type: 'damage', turn: 1,
    actor: 'world__party_2', target: 'world__hound_person', rolled: 2, amount: 2, hp: 1 }]);
  expect(strike.test(ModuleWriter.call('witnessedAttack', 'world__hesta', 'party', 'world__hound'))).toBe(true);
}, 30000);
