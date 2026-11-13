import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Tactics } from '../../src/tactics';
import { CombatTelling } from '../../src/ui/combat-telling';
import { Voice } from '../../src/narrative/voice';

// A fight's words say each outcome once, and fit what happened (the first blind playtest, 14 November: "lands a
// telling blow on the first rat with the dart, for 9", then "takes 1 piercing damage", and "looks away solemnly"
// after a rat; BP-02). A killing blow is told as the kill, its numbers left to the fight's detail; a compassionate
// fighter's solemn look is for a person killed, not a beast.
describe('a fight\'s words, said once', () => {
  it('tell a killing blow as the kill, with no number', () => {
    const content = new Content('fight-words');
    const store = new CreatureStore([content.createCreature('ama', { raceId: 'human', classId: 'warrior', level: 3 }),
      content.createCreature('rat', { raceId: 'rat' })]);
    const battle = Battle.encounter(store, [{ creatureId: 'ama', team: 'fighters' }, { creatureId: 'rat', team: 'goblins' }],
      { seed: 'fight-words' });
    for (let n = 0; n < 40 && !battle.state.outcome; n++) {
      battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands())));
    }
    // The story's line of the blow that ended it: no number; the numbers are its detail.
    const tellings = CombatTelling.exchanges(battle.events, battle.state);
    const last = tellings.findLast(t => /fells|falls/.test(t.text))!;
    expect(last.text).not.toMatch(/, for \d/);
    expect(last.detail).toMatch(/\d/);
  });
  it('keep a compassionate fighter\'s solemn look for a person killed', () => {
    const at = (slain: string) => Voice.fitting('kill', { side: 'company', kind: 'person', manner: 'compassionate', slain })
      .map(l => l.text);
    expect(at('beast')).not.toContain('{Actor} looks away solemnly.');
    expect(at('person')).toContain('{Actor} looks away solemnly.');
  });
});
