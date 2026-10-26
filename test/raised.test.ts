import { describe, expect, it } from 'bun:test';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { Battle } from '../src/battle';
import { AbilityUse } from '../src/ability-use';
import { Expressions } from '../src/expressions';
import { FieldUse } from '../src/campaign/field-use';
import type { Fighter } from '../src/model';

// Raised is raised, in a fight as at a shrine (the architecture review's A4, from its probe combat-revive-commit): a
// companion who had died, raised in a fight, kept "slain" in the store, lost every turn after, and made a rest throw
// with them first in the company; and the undead a raising had made them was gone once the fight was over.
describe('a companion raised in a fight', () => {
  it('comes out of it alive and as the raising made them, and rests and fights again', () => {
    const content = new Content('revive');
    const caster = content.createCreature('caster', { raceId: 'human', classId: 'warrior' });
    const fallen = content.createCreature('fallen', { raceId: 'human', classId: 'warrior' });
    fallen.state.hp = 0;
    // As a rest's system shock leaves one who failed it.
    fallen.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' });
    const foe = content.createCreature('foe', { raceId: 'goblin', classId: 'commoner' });
    const store = new CreatureStore([caster, fallen, foe]);
    const battle = Battle.encounter(store, [{ creatureId: 'caster', team: 'fighters' },
      { creatureId: 'fallen', team: 'fighters' }, { creatureId: 'foe', team: 'goblins' }], { seed: 'revive' }) as unknown as
      { fighters: Fighter[]; context(f: Fighter): object; commit(): void; close(): void };
    const animate = Content.abilities.find(a => a.id === 'animate_dead')!;
    AbilityUse.perform(animate, 'fallen', new Expressions('revive:x'),
      { ...battle.context(battle.fighters.find(f => f.id === 'caster')!), free: true } as never);
    const raised = battle.fighters.find(f => f.id === 'fallen')!;
    expect(raised.hp).toBeGreaterThan(0);
    expect(raised.statuses.map(s => s.id)).not.toContain('slain');
    battle.commit(); battle.close();
    const after = store.get('fallen');
    expect(after.state.conditions.map(c => c.id)).not.toContain('slain');
    expect(after.traits ?? []).toEqual(expect.arrayContaining(raised.traits ?? []));
    // A rest with them first in the company: they tend, and nothing throws.
    expect(() => FieldUse.perform(store, ['fallen', 'caster'], { ability: 'camp_recovery', caster: 'fallen',
      target: 'fallen', seed: 'rest', service: 'recover' })).not.toThrow();
    // Up already, they need no raising at a shrine.
    expect(FieldUse.raise(store, 'fallen')).toEqual([]);
  });
  it('left "slain" with breath in them by an older game, is raised whole at a shrine', () => {
    const content = new Content('kept');
    const kept = content.createCreature('kept', { raceId: 'human', classId: 'warrior' });
    kept.state.hp = 5; kept.state.conditions.push({ id: 'slain', remaining: 1, clock: 'until-removed' });
    const store = new CreatureStore([kept]);
    expect(FieldUse.raise(store, 'kept').map(e => e.type)).toEqual(['revive']);
    expect(store.get('kept').state.conditions).toEqual([]);
  });
});
