// A fallen companion raised in a fight: what the store keeps afterwards. Uses Battle.encounter and the battle's own
// context/commit (private, reached through `any`) so the commit path is exactly Battle.commit (src/battle.ts:94-104).
import { Content } from '../../../../../src/content';
import { CreatureStore } from '../../../../../src/creature-store';
import { Battle } from '../../../../../src/battle';
import { AbilityUse } from '../../../../../src/ability-use';
import { Expressions } from '../../../../../src/expressions';
import { MechanicsText } from '../../../../../src/presentation/mechanics-text';
const content = new Content('revive');
const caster = content.createCreature('caster', { raceId: 'human', classId: 'warrior' });
const fallen = content.createCreature('fallen', { raceId: 'human', classId: 'warrior' });
fallen.state.hp = 0;
// As FieldUse.shock leaves one who failed system shock (src/campaign/field-use.ts:69).
fallen.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' });
const foe = content.createCreature('foe', { raceId: 'goblin', classId: 'commoner' });
const store = new CreatureStore([caster, fallen, foe]);
const battle: any = Battle.encounter(store, [{ creatureId: 'caster', team: 'fighters' }, { creatureId: 'fallen', team: 'fighters' },
  { creatureId: 'foe', team: 'goblins' }], { seed: 'revive' });
const actor = battle.fighters.find((f: any) => f.id === 'caster');
const animate = Content.abilities.find(a => a.id === 'animate_dead')!;
console.log('TEXT:', MechanicsText.full(animate));
AbilityUse.perform(animate, 'fallen', new Expressions('revive:x'), { ...battle.context(actor), free: true });
const inFight = battle.fighters.find((f: any) => f.id === 'fallen');
console.log('in the fight :', { hp: inFight.hp, traits: inFight.traits, statuses: inFight.statuses.map((s: any) => s.id) });
battle.commit();
const after = store.get('fallen');
console.log('store after  :', { hp: after.state.hp, traits: after.traits, conditions: after.state.conditions.map(c => c.id) });
console.log('legal commands when "fallen" is the actor, skips?', inFight.statuses.some((s: any) => Content.statuses[s.id]!.modifiers.noActions));
// The rest a company takes picks its first living member as the one who "casts" camp_recovery
// (src/campaign/field-resolver.ts:23-25); FieldUse.perform refuses a caster who cannot act (field-use.ts:169).
import { FieldUse } from '../../../../../src/campaign/field-use';
battle.close();
try {
  FieldUse.perform(store, ['fallen', 'caster'], { ability: 'camp_recovery', caster: 'fallen', target: 'fallen', seed: 'rest', service: 'recover' });
  console.log('rest: ok');
} catch (e) { console.log('rest with the raised companion listed first throws:', (e as Error).message); }
try { console.log('shrine raise of the raised companion:', JSON.stringify(FieldUse.raise(store, 'fallen'))); } catch (e) { console.log('raise throws', (e as Error).message); }
console.log('store after shrine:', store.get('fallen').state.conditions.map(c => c.id));
