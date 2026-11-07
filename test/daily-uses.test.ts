import { describe, expect, it } from 'bun:test';
import { Battle } from '../src/battle';
import { Content } from '../src/content';
import { CreatureStore } from '../src/creature-store';
import { FieldUse } from '../src/campaign/field-use';
import { DailyUses } from '../src/rules/daily-uses';
import { MechanicsText } from '../src/presentation/mechanics-text';
import type { Creature } from '../src/creature';

// Uses a day (the owner, 7 November): a dragon breathes three times a day, and a monster's own spells (a ghoul's
// paralysing touch) are drawn from Orsino's spells a day for a creature with no calling (2 + its level); spent in one
// fight they are still spent in the next, kept on the creature, and a night's rest gives them back.
const c = new Content('daily');
const tough = (x: Creature): Creature => ({ ...x, base: { ...x.base, maxHp: 900 }, state: { ...x.state, hp: 900 } });
const store = (kind: string, level: number) => new CreatureStore([
  tough(c.createCreature('foe', { raceId: kind, level }, 'foe')),
  tough(c.createCreature('hero', { raceId: 'human', classId: 'warrior', level: 5 }, 'hero'))]);
// A fight of a few rounds, the hero only waiting; whether the foe could use the ability on its turns, and what it did.
const fight = (s: CreatureStore, ability: string, seed: string, turns = 12) => {
  const b = Battle.encounter(s, [{ creatureId: 'foe', team: 'goblins' }, { creatureId: 'hero', team: 'fighters' }],
    { seed, maxTurns: 200 });
  let offered = false;
  for (let i = 0; i < turns && !b.state.outcome; i++) {
    const legal = b.legalCommands();
    if (b.state.actor === 'foe' && legal.some(x => x.ability === ability)) { offered = true; }
    b.step(b.state.actor === 'hero' ? legal.find(x => x.ability === 'wait')! : b.chosen());
  }
  // Its spells draw on one store a day: what it cast of any of them counts against it (see DailyUses).
  const spells = Content.abilities.filter(a => a.spell).map(a => a.id);
  const counted = spells.includes(ability) ? spells : [ability];
  const used = b.events.filter(e => e.type === 'action' && e.command.actor === 'foe' && counted.includes(e.command.ability));
  b.close();
  return { offered, used: used.length };
};
const rest = (s: CreatureStore) => FieldUse.perform(s, ['foe'], { ability: 'camp_recovery', caster: 'foe',
  target: 'foe', seed: 'night', service: 'recover' });

describe('uses a day', () => {
  it('a dragon breathes three times a day: spent over fights, kept between them, and back after a night\'s rest', () => {
    const s = store('dragon/red_lineage', 5);
    let breaths = 0;
    for (let n = 0; n < 4 && breaths < 3; n++) { breaths += fight(s, 'breathe_fire', `day1-${n}`, 30).used; }
    expect(breaths).toBe(3);
    expect(s.get('foe').state.daily).toEqual({ used: { breathe_fire: 3 } });
    // Spent for the day: the next fight offers it no breath at all.
    expect(fight(s, 'breathe_fire', 'day1-spent', 30)).toEqual({ offered: false, used: 0 });
    // The day's uses go into a saved game with the creature, and come out of it.
    expect(new CreatureStore([structuredClone(s.get('foe'))]).get('foe').state.daily).toEqual({ used: { breathe_fire: 3 } });
    const rested = rest(s);
    expect(rested.some(e => e.type === 'gain' && e.detail === 'uses' && e.amount === 3)).toBe(true);
    expect(s.get('foe').state.daily).toBeUndefined();
    expect(fight(s, 'breathe_fire', 'day2', 30).used).toBeGreaterThan(0);
  });
  it('a ghoul casts its powers (touch, curse, drain) from its spells a day (2 + its level), then claws, until it rests', () => {
    const s = store('ghoul', 3);
    expect(DailyUses.castings(3)).toBe(5);
    let touches = 0;
    for (let n = 0; n < 8 && touches < 5; n++) { touches += fight(s, 'paralyzing_touch', `ghoul-${n}`, 40).used; }
    expect(touches).toBe(5);
    expect(s.get('foe').state.daily).toEqual({ cast: 5 });
    expect(fight(s, 'paralyzing_touch', 'ghoul-spent', 40)).toEqual({ offered: false, used: 0 });
    rest(s);
    expect(fight(s, 'paralyzing_touch', 'ghoul-rested', 40).offered).toBe(true);
  });
  it('a night in the open gives back one, as it gives back one slot', () => {
    const user = { daily: { cast: 2, used: { breathe_fire: 1 } } };
    expect(DailyUses.restore(user, 1)).toBe(1);
    expect(user.daily).toEqual({ cast: 1, used: { breathe_fire: 1 } });
  });
  it('is said where the power is described', () => {
    const breath = Content.abilities.find(a => a.id === 'breathe_fire')!;
    expect(MechanicsText.full(breath)).toContain('3 times a day, until a night\'s rest.');
  });
});
