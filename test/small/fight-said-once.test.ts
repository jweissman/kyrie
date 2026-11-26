import { ItemCatalog } from '../../src/item-catalog';
import { describe, expect, it } from 'bun:test';
import { Content } from '../../src/content';
import { CreatureStore } from '../../src/creature-store';
import { Battle } from '../../src/battle';
import { Tactics } from '../../src/tactics';
import { CombatTelling } from '../../src/ui/combat-telling';
import { Voice } from '../../src/narrative/voice';

// A fight's words say each outcome once, and fit what happened (the first blind playtest, 14 November: "lands a
// telling blow on the first rat with the dart, for 9", then "takes 1 piercing damage", and "looks away solemnly"
// after a rat; BP-02). A killing blow is told with what it dealt, once, and then the fall (the owner, 18 November:
// "Killing blows should show their damage"), never a second number for the little that was left; a compassionate
// fighter's solemn look is for a person killed, not a beast.
describe('a fight\'s words, said once', () => {
  it('tell a killing blow by what it dealt, and the fall once', () => {
    const content = new Content('fight-words');
    const store = new CreatureStore(ItemCatalog.canon, [content.createCreature(ItemCatalog.canon, 'ama', { raceId: 'human', classId: 'warrior', level: 3 }),
      content.createCreature(ItemCatalog.canon, 'rat', { raceId: 'rat' })]);
    const battle = Battle.encounter(store, [{ creatureId: 'ama', team: 'fighters' }, { creatureId: 'rat', team: 'goblins' }],
      { seed: 'fight-words' });
    for (let n = 0; n < 40 && !battle.state.outcome; n++) {
      battle.step(Tactics.choose(battle.state, battle.plain(battle.legalCommands())));
    }
    // The story's line of the blow that ended it: one number, the fall once; the dice are its detail.
    const tellings = CombatTelling.exchanges(battle.events, battle.state);
    const last = tellings.findLast(t => /falls/.test(t.text))!;
    expect(last.text.match(/falls/g)).toHaveLength(1);
    expect(last.text.match(/, for \d+/g)).toHaveLength(1);
    expect(last.text).not.toMatch(/takes \d/);
    expect(last.detail).toMatch(/\d/);
  });
  it('keep a compassionate fighter\'s solemn look for a person killed', () => {
    const at = (slain: string) => Voice.fitting('kill', { side: 'company', kind: 'person', manner: 'compassionate', slain })
      .map(l => l.text);
    expect(at('beast')).not.toContain('{Actor} looks away solemnly.');
    expect(at('person')).toContain('{Actor} looks away solemnly.');
  });
});
