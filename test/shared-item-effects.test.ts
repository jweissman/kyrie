import { describe, expect, it } from 'bun:test';
import { Campaign } from '../src/campaign/campaign';
import { Modules } from '../src/campaign/modules';
import { Battle } from '../src/battle';
import { Tactics } from '../src/tactics';
import { PartyCapabilities } from '../src/campaign/party-capabilities';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Items } from '../src/campaign/items';
import { CombatProjection } from '../src/combat-projection';
import { AbilityUse } from '../src/ability-use';
import { parseAbility } from '../src/lang/parse';
import { Expressions } from '../src/expressions';
import type { EffectContext } from '../src/effects';

class ItemFixture {
  static setup() {
    const c = new Content('shared-item-fixture').createCreature('hero',
      { raceId: 'human', classId: 'fighter', constitution: 10, level: 4 });
    c.state.hp = c.base.maxHp - 6;
    return new CreatureStore([c]);
  }
}
describe('shared item and environmental effects', () => {
  it('resolves a poison trap with the ability save pipeline, preserves its source, and consumes an antidote', () => {
    const store = ItemFixture.setup(), before = store.get('hero');
    const events = Items.expose(store, { target: 'hero', ability: 'censer_miasma', source: 'room-17:vent', seed: 'poison-0' });
    const action = events.find(e => e.type === 'action');
    expect(action?.type === 'action' && action.source).toEqual({ id: 'room-17:vent', kind: 'trap', name: Content.abilities.find(a => a.id === 'censer_miasma')!.name });
    expect(events.some(e => e.type === 'save')).toBe(true);
    const poisoned = events.some(e => e.type === 'status');
    expect(poisoned).toBe(true);
    expect(store.get('hero').state.conditions.some(s => s.id === 'poisoned')).toBe(poisoned);
    if (poisoned) { expect(store.get('hero').state.conditions[0]?.source).toBe('room-17:vent'); }
    Items.take(store, 'hero', { id: 'antidote-1', definition: 'antidote' });
    const cured = Items.consume(store, { owner: 'hero', target: 'hero', id: 'antidote-1', seed: 'cure' });
    expect(cured.some(e => e.type === 'remove' && e.detail === 'poisoned')).toBe(true);
    expect(store.get('hero').state.conditions).toEqual([]);
    expect(store.get('hero').state.inventory).toEqual([]);
    expect(store.get('hero').base).toEqual(before.base);
  });
  it('equipment modifies effective saves and mitigation without changing base data and survives a projection commit', () => {
    const store = ItemFixture.setup(), base = store.get('hero').base;
    Items.take(store, 'hero', { id: 'charm-1', definition: 'protectivecharm' }); Items.equip(store, 'hero', 'charm-1');
    const equipped = CombatProjection.fighter(store.get('hero'), 'fighters');
    expect(equipped.attachmentModifiers).toEqual({ armor: 1, power: 0, save: 3 });
    const context: EffectContext = { actor: { ...equipped, id: 'attacker', team: 'goblins' },
      fighters: [equipped], turn: 1, events: [], content: new Content('hit'), abilities: [], retreat: false, location: null };
    context.fighters.push(context.actor!);
    AbilityUse.perform(parseAbility('test-hit', 'Hit', 'Deal 4 physical damage to enemy.'), 'hero',
      new Expressions('hit'), context);
    const damage = context.events.find(e => e.type === 'damage');
    expect(damage?.type === 'damage' && damage.amount).toBe(3);
    expect(CombatProjection.creature(equipped, store.get('hero')).base).toEqual(base);
    expect(CombatProjection.creature(equipped, store.get('hero')).state.inventory?.[0]?.equipped).toBe(true);
    expect(new CreatureStore(store.snapshot).get('hero')).toEqual(store.get('hero'));
    const bare = ItemFixture.setup();
    const args = { target: 'hero', ability: 'censer_miasma', source: 'vent', seed: 'same-save' };
    const protectedSave = Items.expose(store, args).find(e => e.type === 'save');
    const bareSave = Items.expose(bare, args).find(e => e.type === 'save');
    expect(protectedSave?.type === 'save' && protectedSave.modifier).toBe(3);
    expect(bareSave?.type === 'save' && bareSave.modifier).toBe(0);
    expect(protectedSave?.type === 'save' && protectedSave.die).toBe(bareSave?.type === 'save' && bareSave.die);
  });
  it('rejects invalid targets without spending an owned dose, and repeats seeded trap saves exactly', () => {
    const store = ItemFixture.setup(); Items.take(store, 'hero', { id: 'dose-1', definition: 'healingdraught' });
    const before = store.snapshot;
    expect(() => Items.consume(store, { owner: 'hero', target: 'missing', id: 'dose-1', seed: 'invalid' })).toThrow();
    expect(store.snapshot).toEqual(before);
    const a = ItemFixture.setup(), b = ItemFixture.setup();
    const args = { target: 'hero', ability: 'censer_miasma', source: 'vent', seed: 'repeat' };
    expect(Items.expose(a, args)).toEqual(Items.expose(b, args));
    expect(a.snapshot).toEqual(b.snapshot);
  });
  it('keeps canonical equipment and attack consequences through a real encounter', () => {
    const store = ItemFixture.setup();
    const enemy = new Content('battle-enemy').createCreature('enemy', { raceId: 'goblin', classId: 'commoner' });
    store.insert(enemy); Items.take(store, 'hero', { id: 'blade-1', definition: 'wardblade' }); Items.equip(store, 'hero', 'blade-1');
    const base = store.get('hero').base;
    const battle = Battle.encounter(store, [{ creatureId: 'hero', team: 'fighters' },
      { creatureId: 'enemy', team: 'goblins' }], { seed: 'equipment-attack' });
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.legalCommands())); }
    const hit = battle.events.find(e => e.type === 'damage' && e.actor === 'hero');
    expect(hit?.type === 'damage' && hit.modifiers?.power).toBe(2);
    expect(store.get('hero').base).toEqual(base);
    expect(store.get('hero').state.inventory?.[0]?.equipped).toBe(true);
  });
  it('rolls back acquired ownership when a later world change rejects the whole command', () => {
    const instance = Modules.adventure('atomic-item-command');
    const campaign = new Campaign('atomic-item-command', undefined, instance);
    const player = instance.campaign!.actors.find(a => a.player)!;
    const owner = campaign.state.partyIds[0]!;
    campaign.module.actions.push({ id: 'injected-invalid-command', name: 'Atomic command probe', description: '',
      actor: player.id, schema: player.actions[0], requires: { kind: 'boolean', value: true }, cost: 1, time: 1,
      resolve: { kind: 'call', name: 'acquire', args: ['probe-dose', 'antidote', owner] },
      success: [{ kind: 'decrease', call: { kind: 'call', name: 'quantity', args: [player.id, 'gold'] },
        value: { kind: 'number', value: 999999 } }], failure: [] });
    const before = campaign.save();
    expect(() => campaign.execute('injected-invalid-command')).toThrow();
    expect(campaign.save()).toEqual(before);
    expect(campaign.state.creatures.flatMap(c => c.state.inventory ?? [])).toEqual([]);
  });
  it('recovers equipped treasure from a fallen companion without duplicating ownership', () => {
    const store = ItemFixture.setup();
    const recipient = new Content('recipient').createCreature('recipient', { raceId: 'human', classId: 'cleric' });
    store.insert(recipient); Items.take(store, 'hero', { id: 'charm-1', definition: 'protectivecharm' }); Items.equip(store, 'hero', 'charm-1');
    const lease = store.acquire(['hero']); lease.creatures[0]!.state.hp = 0;
    lease.commit(lease.creatures); lease.release();
    Items.transfer(store, { id: 'charm-1' }, 'hero', 'recipient');
    expect(store.get('hero').state.inventory).toEqual([]);
    expect(store.get('recipient').state.inventory).toEqual([{ id: 'charm-1', definition: 'protectivecharm', equipped: false }]);
    expect(store.get('hero').state.hp).toBe(0);
    const mutation = store.acquire(['recipient']);
    mutation.creatures[0]!.state.inventory![0]!.definition = 'wardblade';
    expect(() => mutation.commit(mutation.creatures)).toThrow('Cannot replace instantiated item identity');
    mutation.release();
    expect(new CreatureStore(store.snapshot).snapshot).toEqual(store.snapshot);
  });
  it('makes ancestry and background creation choices mechanically distinct and preserves them through combat', () => {
    const human = new Content('creation-context').createCreature('scout',
      { name: 'Scout', raceId: 'human', classId: 'fighter', backgroundId: 'forager', level: 3 });
    const dwarf = new Content('creation-context').createCreature('keeper',
      { name: 'Keeper', raceId: 'dwarf', classId: 'fighter', backgroundId: 'pilgrim', level: 3 });
    expect(human.base.abilities).toContain('human_resolve');
    expect(human.base.abilities).not.toContain('dwarf_guard');
    expect(dwarf.base.abilities).toContain('dwarf_guard');
    expect(PartyCapabilities.has('woodcraft', [human])).toBe(true);
    expect(PartyCapabilities.has('burial_lore', [human])).toBe(false);
    expect(PartyCapabilities.has('burial_lore', [dwarf])).toBe(true);
    expect(PartyCapabilities.has('woodcraft', [dwarf])).toBe(false);
    const store = new CreatureStore([human, dwarf]);
    const enemy = new Content('creation-target').createCreature('enemy', { raceId: 'goblin', classId: 'commoner' });
    store.insert(enemy);
    const battle = Battle.encounter(store, [{ creatureId: human.id, team: 'fighters' },
      { creatureId: dwarf.id, team: 'fighters' }, { creatureId: enemy.id, team: 'goblins' }], { seed: 'creation-battle' });
    while (!battle.state.outcome) { battle.step(Tactics.choose(battle.state, battle.legalCommands())); }
    expect(store.get(human.id).base).toEqual(human.base);
    expect(store.get(dwarf.id).base).toEqual(dwarf.base);
    expect(store.get(human.id).backgroundId).toBe('forager');
    expect(store.get(dwarf.id).backgroundId).toBe('pilgrim');
    expect(new CreatureStore(store.snapshot).get(dwarf.id)).toEqual(store.get(dwarf.id));
  });
  it('spends experience on a persistent new capability without changing generated characteristics', () => {
    const store = ItemFixture.setup(), lease = store.acquire(['hero']);
    lease.creatures[0]!.state.experience = 20; lease.commit(lease.creatures); lease.release();
    const base = store.get('hero').base;
    Items.train(store, 'hero', 'serewater_training');
    expect(store.get('hero').state.experience).toBe(0);
    expect(store.get('hero').state.learnedAbilities).toContain('serewater_training');
    expect(store.get('hero').base).toEqual(base);
    expect(() => Items.train(store, 'hero', 'serewater_training')).toThrow();
  });
});
