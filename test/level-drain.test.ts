import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { CombatProjection } from '../src/combat-projection';
import { FieldUse } from '../src/campaign/field-use';
import { CharacterSheets } from '../src/presentation/character-sheet';
import { Fighting } from '../src/rules/fighting';
import { LevelDrain } from '../src/rules/level-drain';
import { CheckpointStore } from '../src/session/checkpoint-store';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { CreatureFacts } from '../src/campaign/creature-facts';
import { World } from '../src/lang/world';
import type { Creature } from '../src/creature';
import type { Change } from '../src/lang/module';
import type { SessionCheckpoint } from '../src/session/play-session';

// Level drain (the owner, 7 November): the touch of a wraith takes a level, as the old games' does, and it matters:
// the one drained fights, saves and casts as the level they now stand at, with the hit points of it, beyond the fight
// and in a saved game, until a restoration (a temple's, or a cleric's prayer) gives it back.
const c = new Content('drain');
const hero = () => c.createCreature('hero', { raceId: 'human', classId: 'warrior', level: 5 }, 'hero');
// A wraith at the hero, the hero only waiting, until its touch has taken a level.
const touched = (s: CreatureStore, seed: string) => {
  const b = Battle.encounter(s, [{ creatureId: 'wraith', team: 'goblins' }, { creatureId: 'hero', team: 'fighters' }],
    { seed, maxTurns: 400 });
  for (let i = 0; i < 200 && !b.state.outcome && !b.state.combatants.find(f => f.id === 'hero')!.statuses
    .some(x => x.id === 'drained'); i++) {
    b.step(b.state.actor === 'hero' ? b.legalCommands().find(x => x.ability === 'wait')! : b.chosen());
  }
  const events = b.events;
  b.close();
  return events;
};
const tough = (x: Creature): Creature => ({ ...x, base: { ...x.base, maxHp: 300 }, state: { ...x.state, hp: 300 } });

describe('level drain', () => {
  it('a wraith\'s touch takes a level that lasts beyond the fight: lower level, hit points, attacks and saves', () => {
    const s = new CreatureStore([tough(hero()), c.createCreature('wraith', { raceId: 'wraith', level: 3 }, 'wraith')]);
    const before = CombatProjection.fighter(s.get('hero'), 'fighters'), saves = CharacterSheets.saves(s.get('hero'));
    const events = touched(s, 'wraith');
    expect(events.some(e => e.type === 'action' && e.command.ability === 'energy_drain')).toBe(true);
    expect(events.some(e => e.type === 'status' && e.target === 'hero' && e.detail === 'drained' && e.amount === 1)).toBe(true);
    const drained = s.get('hero'), after = CombatProjection.fighter(drained, 'fighters');
    expect(drained.state.conditions.find(x => x.id === 'drained')).toMatchObject({ remaining: 1, clock: 'until-removed' });
    // Its level and what it knows are its own, held down: the level it stands at is one lower.
    expect([drained.base.level, LevelDrain.level(drained), after.level]).toEqual([5, 4, 4]);
    expect(after.maxHp).toBe(before.maxHp - LevelDrain.perLevel(before));
    expect(Fighting.thac0(after.level)).toBeGreaterThanOrEqual(Fighting.thac0(before.level));
    expect(CharacterSheets.saves(drained).map(b => Number(b.value)))
      .toEqual(saves.map(b => Number(b.value) - 1));
    expect(CharacterSheets.fighting(drained).find(b => b.label === 'Drained')?.value)
      .toBe('a level taken: fighting as level 4 of 5, with the hit points and spells of it, until a restoration at a temple or by a cleric');
  });
  it('lowers a caster\'s slots to the level it stands at, and takes from one at the first level its hit points', () => {
    const cleric = c.createCreature('dori', { raceId: 'human', classId: 'cleric', level: 7 }, 'dori');
    const f = CombatProjection.fighter({ ...cleric, state: { ...cleric.state,
      conditions: [{ id: 'drained', remaining: 3, clock: 'until-removed' }] } }, 'fighters');
    expect([f.level, f.slots!.length > 0 && f.slots![3] === 0]).toEqual([4, true]);
    const low = CombatProjection.fighter(c.createCreature('low', { raceId: 'human', classId: 'warrior', level: 1 }), 'fighters');
    // A warrior's level is worth six hit points (half a d10 and one, at an ordinary Constitution) or so: taken from
    // its life, it falls only when that leaves none (the owner's ruling: consequential, and to be recovered from).
    const hp = low.hp, worth = LevelDrain.perLevel(low);
    expect(LevelDrain.take(low, 1, { turn: 1 }).map(e => e.type)).toEqual(hp > worth ? ['damage'] : ['damage', 'death']);
    expect([low.level, low.hp]).toEqual([1, Math.max(0, hp - worth)]);
    low.hp = 1;
    expect(LevelDrain.take(low, 1, { turn: 2 }).map(e => e.type)).toEqual(['damage', 'death']);
  });
  it('is lifted by a cleric\'s restoration, and the level comes back', () => {
    // A seventh-level cleric who has learned it, and prayed it into her fourth-level slot.
    const cleric = c.createCreature('dori', { raceId: 'human', classId: 'cleric', level: 7 }, 'dori');
    cleric.state.learnedAbilities.push('restoration');
    cleric.state.prepared![3] = ['restoration']; cleric.state.ready![3] = ['restoration']; cleric.state.slots![3] = 1;
    const drained = hero();
    drained.state.conditions.push({ id: 'drained', remaining: 2, clock: 'until-removed' });
    const s = new CreatureStore([cleric, drained]);
    expect(LevelDrain.level(s.get('hero'))).toBe(3);
    const events = FieldUse.perform(s, ['dori', 'hero'], { ability: 'restoration', caster: 'dori', target: 'hero', seed: 'r' });
    expect(events.some(e => e.type === 'remove' && e.target === 'hero' && e.detail === 'drained')).toBe(true);
    expect([LevelDrain.level(s.get('hero')), CombatProjection.fighter(s.get('hero'), 'fighters').maxHp])
      .toEqual([5, hero().base.maxHp]);
  });
  it('is kept in a saved game, said on the sheet, and lifted at a town\'s shrine for its price', async () => {
    const w = await WorldAssembler.assemble('a1', NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
    const s = await PlaySession.start(w.path, 'a1', w.source);
    const service = s.campaign.module.entities.find(e => e.id.endsWith('_priest_restoring'))!;
    const priest = service.id.replace(/_restoring$/, ''), shrine = s.campaign.world.one('at', priest)!;
    const member = s.campaign.readout.inhabitants.party![0]!;
    const checkpoint = s.checkpoint(), saved = checkpoint.save.creatures.find(x => x.id === member)!;
    saved.state.conditions.push({ id: 'drained', remaining: 1, clock: 'until-removed' });
    saved.state.gold = 500;
    checkpoint.save.state.world = CreatureFacts.project(new World(checkpoint.save.module, checkpoint.save.state.world),
      checkpoint.save.definition!.actors, new CreatureStore(checkpoint.save.creatures)).snapshot;
    // Through the save's own words and back.
    const resumed = PlaySession.resume(CheckpointStore.parse(JSON.stringify(checkpoint)) as SessionCheckpoint);
    const kept = resumed.campaign.readout.creatures.find(x => x.id === member)!;
    expect(kept.state.conditions.find(x => x.id === 'drained')).toMatchObject({ remaining: 1, clock: 'until-removed' });
    const camp = resumed.campaign as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    camp.commit(camp.world.apply([{ kind: 'assert', call: ModuleWriter.call('at', 'party', shrine) }]));
    await resumed.perform('wait');
    const ask = PlayerView.choices(resumed.campaign).find(x => x.choice.id.startsWith('take_restoration('));
    expect(ask?.choice.id).toBeDefined();
    await resumed.perform(ask!.choice.id);
    const after = resumed.campaign.readout.creatures.find(x => x.id === member)!;
    expect(after.state.conditions.some(x => x.id === 'drained')).toBe(false);
  }, 120000);
});
