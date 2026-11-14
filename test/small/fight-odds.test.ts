import { describe, expect, it } from 'bun:test';
import { Battle } from '../../src/battle';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { DangerSense } from '../../src/presentation/danger-sense';
import { FightOdds } from '../../src/presentation/fight-odds';

// "No match for you", the reckoning a fight is pressed through on as one act (Foregone, BP-01), is said only of a fight
// won so often its lower confidence bound on winning is nine in ten (FightOdds): six of six, which had been taken for
// it, is no proof (a fight won three times in four shows six of six one time in six), so an easy-looking fight is
// played on, to at most 24, until it is sure either way; each is let run to play's own limit of turns.
const fight = (seed: string, foe: string, count: number, level = 1) => {
  const content = new Content(seed);
  const hero = content.createCreature('hero', { raceId: 'human', classId: 'warrior', level });
  const foes = Array.from({ length: count }, (_, i) => content.createCreature(`f${i}`, { raceId: foe }));
  return Battle.encounter(new CreatureStore([hero, ...foes]), [{ creatureId: 'hero', team: 'fighters' },
    ...foes.map(f => ({ creatureId: f.id, team: 'goblins' as const }))], { seed, moment: 'seen' });
};
describe('an easy win, as the company reckons it', () => {
  it('is fifteen won of fifteen, not six of six; one lost in twenty-four is not it', () => {
    expect([FightOdds.easy(6, 6), FightOdds.easy(14, 14), FightOdds.easy(15, 15), FightOdds.easy(23, 24)])
      .toEqual([false, false, true, false]);
    expect(FightOdds.open(6, 6)).toBe(true);
    expect(FightOdds.open(15, 15)).toBe(false);
    expect(FightOdds.open(20, 24)).toBe(false);
    expect([FightOdds.turns, FightOdds.most]).toEqual([500, 24]);
  });
  it('is said of a fight of known odds that is one: a warrior of the tenth level against one rat', () => {
    expect(DangerSense.of(fight('known', 'rat', 1, 10)).danger).toBe('slight');
  });
  it('is not said of a fight a lone warrior wins only most of the time: three wolves', () => {
    expect(['w1', 'w2', 'w3'].map(seed => DangerSense.of(fight(seed, 'wolf', 3)).danger)).not.toContain('slight');
  });
});
