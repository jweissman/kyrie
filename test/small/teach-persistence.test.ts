import { expect, it } from 'bun:test';
import { AbilityUse } from '../../src/ability-use';
import { CreatureFacts } from '../../src/campaign/creature-facts';
import { CombatProjection } from '../../src/combat-projection';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Expressions } from '../../src/expressions';
import { ItemCatalog } from '../../src/item-catalog';
import { ModuleParser, ModuleWriter, parseAbility, World } from '../../src/lang';
import type { CombatEvent } from '../../src/model';

it('keeps a lesson even when equipment also grants the ability', () => {
  const content = new Content('lesson');
  const original = content.createCreature(ItemCatalog.canon, 'pupil', { raceId: 'human', classId: 'warrior' });
  original.state.inventory = [{ id: 'focus', definition: 'warding_focus', equipped: true }];
  const pupil = CombatProjection.fighter(ItemCatalog.canon, original, 'fighters');
  const teacher = CombatProjection.fighter(ItemCatalog.canon,
    content.createCreature(ItemCatalog.canon, 'teacher', { raceId: 'human', classId: 'warrior' }), 'fighters');
  const context = { actor: teacher, fighters: [teacher, pupil], turn: 1, events: [] as CombatEvent[], content,
    abilities: ['fire_ward'], retreat: false, location: null };
  const lesson = parseAbility('lesson', 'Lesson', 'Teach fire_ward to ally.');

  AbilityUse.perform(lesson, pupil.id, new Expressions('lesson'), context);
  AbilityUse.perform(lesson, pupil.id, new Expressions('lesson-again'), context);
  expect(context.events.filter(e => e.type === 'learn')).toEqual([
    { type: 'learn', detail: 'fire_ward', turn: 1, actor: teacher.id, target: pupil.id },
    { type: 'learn', detail: 'fire_ward', turn: 1, actor: teacher.id, target: pupil.id },
  ]);
  expect(teacher.abilities).not.toContain('fire_ward');
  const saved = CombatProjection.creature(pupil, original);
  expect(saved.state.learnedAbilities).toEqual(['fire_ward']);
  saved.state.inventory = [];
  const restored = new CreatureStore(ItemCatalog.canon, [saved]).get(saved.id);
  const module = ModuleParser.parse(`Module lesson "Lesson" {
    Kind group. Kind member. Kind ability. Kind good. Kind place.
    Entity company: group "Company". Entity pupil_ref: member "Pupil" bound to pupil.
    Entity fire_ward: ability "Fire ward". Entity gold: good "Gold".
    Relation at(group, place). Relation able(group). Relation dead(group). Relation awake(member).
    Relation memberOf(member, group). Relation learned(member, ability). Measure quantity(group, good).
  }`);
  const world = CreatureFacts.project(new World(module), [{ id: 'company', members: ['pupil'],
    actions: [], horizon: 1, goals: [] }], new CreatureStore(ItemCatalog.canon, [restored]));
  expect(world.test(ModuleWriter.call('learned', 'pupil_ref', 'fire_ward'))).toBe(true);
  const caster = CombatProjection.fighter(ItemCatalog.canon, restored, 'fighters');
  expect(caster.abilities).toContain('fire_ward');
  const cast = { actor: caster, fighters: [caster], turn: 1, events: [] as CombatEvent[], content,
    abilities: Content.abilities.map(a => a.id), retreat: false, location: null };
  AbilityUse.perform(Content.abilities.find(a => a.id === 'fire_ward')!, caster.id, new Expressions('cast'), cast);
  expect(caster.statuses.map(s => s.id)).toContain('fireproof');
});
