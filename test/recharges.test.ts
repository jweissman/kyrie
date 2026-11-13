import { afterAll, describe, expect, it } from 'bun:test';
import { Canon } from '../src/canon/canon';
import { CanonValidation } from '../src/canon/canon-validation';
import { DailyUses, type Daily } from '../src/rules/daily-uses';
import { FieldResolver } from '../src/campaign/field-resolver';
import { FieldUse } from '../src/campaign/field-use';
import { CreatureStore } from '../src/creature-store';
import { Content } from '../src/content';
import type { Ability } from '../src/canon/schema';

// Recharge declared on abilities (engine-pressure.md, section 5; recovery.md's rule 2 as data): an ability says what
// gives its uses a day back, any rest (as saying nothing does), only a night (an inn's bed, a camp: not six hours'
// rest or a healer's hour), or only the first night of a new day; the recovery path reads it. Abilities written for
// this spec alone; none of the catalog's declares it yet.
const abilities = Canon.abilities as Record<string, Ability>;
const fixture = (recharges?: Ability['recharges']): Ability => ({ name: 't', kind: 'technique', effect: 'Heal (1) health to self.',
  uses: 1, ...recharges ? { recharges } : {}, source: { kyr: true } });
Object.assign(abilities, { t_plain: fixture(), t_rest: fixture('rest'), t_night: fixture('night'), t_day: fixture('day') });
afterAll(() => { for (const id of ['t_plain', 't_rest', 't_night', 't_day']) { delete abilities[id]; } });
const spent = (daily: Daily = {}) => ({ daily: { ...daily, used: { t_plain: 1, t_rest: 1, t_night: 1, t_day: 1 } } });
const left = (user: { daily?: Daily }) => Object.keys(user.daily?.used ?? {}).sort();

describe('what gives an ability\'s uses back', () => {
  it('is any rest for one that says rest or nothing; a night for one that says night; a new day\'s first night for one that says day', () => {
    const rested = spent();
    DailyUses.restore(rested, 9999, { kind: 'rest', day: 1 });
    expect(left(rested)).toEqual(['t_day', 't_night']);
    const night = spent();
    DailyUses.restore(night, 9999, { kind: 'night', day: 1 });
    expect([left(night), night.daily.restoredOn]).toEqual([[], 1]);
    // Spent again the same day, a second night gives back the night's, not the day's.
    const again = spent({ restoredOn: 1 });
    DailyUses.restore(again, 9999, { kind: 'night', day: 1 });
    expect(left(again)).toEqual(['t_day']);
    DailyUses.restore(again, 9999, { kind: 'night', day: 2 });
    expect(left(again)).toEqual([]);
  });
  it('is any recovery at all where nothing is said of it, as every recovery was', () => {
    const user = { daily: { used: { t_plain: 1, t_rest: 1 } } };
    DailyUses.restore(user, 9999);
    expect(left(user)).toEqual([]);
  });
  it('tells a night from a rest by the act: an inn\'s bed and a camp are nights; six hours\' rest and a healer are not', () => {
    const host = { world: { number: () => 150 } } as never;
    const kind = (id: string) => FieldResolver.recovery({ id } as never, host);
    expect(['take_lodging', 'region__camp', 'rest', 'take_healing'].map(id => kind(id).kind))
      .toEqual(['night', 'night', 'rest', 'rest']);
    expect(kind('camp').day).toBe(2);
  });
  it('refuses a recharge that is none of the three', () => {
    abilities.t_rest = { ...fixture(), recharges: 'week' as never };
    try {
      expect(CanonValidation.problems().filter(p => p.startsWith('ability t_rest'))).toEqual(['ability t_rest: recharges by week']);
    } finally { abilities.t_rest = fixture('rest'); }
  });
  it('is read by the recovery itself: a rest leaves a night\'s use spent, a camp gives it back', () => {
    const content = new Content('recharges'), { shelteredRest, roughRest } = Canon.rules.combat.ids;
    for (const [ability, kind, back] of [[shelteredRest, 'rest', false], [roughRest, 'night', true]] as const) {
      const c = content.createCreature('h', { raceId: 'human', classId: 'warrior' });
      c.state.daily = { used: { t_night: 1 } };
      const store = new CreatureStore([c]);
      FieldUse.perform(store, ['h'], { ability, caster: 'h', target: 'h', seed: 's', service: 'recover',
        recovery: { kind, day: 1 } });
      expect([kind, store.get('h').state.daily?.used?.t_night === undefined]).toEqual([kind, back]);
    }
  });
});
