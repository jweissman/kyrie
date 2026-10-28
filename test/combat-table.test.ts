import { describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { Summoning } from '../src/summoning';
import type { CombatEvent, Fighter } from '../src/model';

// The architecture review's A23 (ARV-A23): the death save, the save against what a kind of damage brings, the summon
// cap, the chance to get away, system shock, a bare hand and the conditions the rules name were numbers and ids in the
// engine's code; and field time had no dice and nothing for what lapses, so a death save there was skipped. They are a
// table in the catalog (data/catalog/vocabulary.json's combat), and field time throws a fight's dice.
describe('the rules of a fight', () => {
  it('take their numbers from the catalog', () => {
    const owner = { level: 6 } as Fighter, summons = Canon.rules.combat.summons, kept = { ...summons };
    expect(Summoning.limit(owner)).toBe(5);
    summons.base = 1;
    try { expect(Summoning.limit(owner)).toBe(3); } finally { Object.assign(summons, kept); }
    expect(Canon.rules.combat).toMatchObject({ deathSave: 25, triggerSave: 15, systemShock: 10,
      flee: [{ die: '1d2', atMost: 1 }, { die: '1d4', atMost: 3 }] });
  });
  it('throw a fight\'s dice in field time: one poisoned to nothing in the night saves against death', () => {
    const c = new Content('table').createCreature('hero', { raceId: 'human', classId: 'warrior' });
    c.state.hp = 1;
    c.state.conditions = [{ id: 'poisoned', remaining: 6, clock: 'world-time' }];
    const store = new CreatureStore([c]), events: CombatEvent[] = [];
    FieldUse.advance(store, 1, events, undefined);
    expect(store.get(c.id).state.hp === 0 || store.get(c.id).state.hp === 1).toBe(true);
    expect(events.some(e => e.type === 'save' && e.kind === 'death')).toBe(true);
  });
});
