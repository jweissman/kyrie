import { describe, expect, it } from 'bun:test';
import { QuestionTitle } from '../../src/presentation/question-title';
import { Tiny } from '../support/tiny';
import { Doable } from '../../src/presentation/doable';

// A question led with is a short title on its row, whole at a phone's width, its full words said when it is asked (the
// owner's playtest, 25 November: "important questions are long and so become elliptical with '...' at the end").
describe('a question led with', () => {
  it('is titled within the row\'s room, never cut', () => {
    const cases: [string, string, string, string][] = [
      ['Talk to Eogan — ask what is out in the country round', 'Talk to Eogan',
        'Ask Eogan what is out in the country round', 'Eogan: what is out in the country round'],
      ['Talk to Jeremiah — ask whether she would come along', 'Talk to Jeremiah',
        'Ask whether she would come along', 'Jeremiah: whether she would come along'],
      ['Talk to the castellan — ask about the king-barrow', 'Talk to the castellan',
        'Ask the castellan about the king-barrow', 'The castellan: the king-barrow'],
      ['Ask Hester Lyle whether she has had a letter', 'Talk to Hester Lyle',
        'Ask Hester Lyle whether she has had a letter', 'Talk to Hester Lyle'],
      ['Ask Hask to put his orders in writing before he carries them out', 'Talk to Hask',
        'Ask Hask to put his orders in writing before he carries them out', 'Talk to Hask'],
      // Asked for something: the matter without its "for" (Caw's bounty in the corn-store).
      ['Talk to Caw — ask for the ten coin for the corn-store', 'Talk to Caw',
        'Ask Caw for the ten coin for the corn-store', 'Caw: the ten coin for the corn-store'],
      // Asked by what they are, in the talk to whom it names (the castellan, the drover's lad).
      ['Talk to Ffion Wyn — ask the castellan about the king-barrow', 'Talk to Ffion Wyn',
        'Ask the castellan about the king-barrow', 'Ffion Wyn: the king-barrow'],
      ['Talk to Oswy Tolley — ask the drover\'s lad where his drove went', 'Talk to Oswy Tolley',
        'Ask the drover\'s lad where his drove went', 'Oswy Tolley: where his drove went'],
      // Short enough already, or no question: as it was.
      ['Ask Wat about Father', 'Talk to Wat', 'Ask Wat about Father', 'Ask Wat about Father'],
      ['Talk to the factor — sell the bronze crown', 'Talk to the factor', 'Sell the bronze crown',
        'Talk to the factor — sell the bronze crown']];
    for (const [full, talk, question, title] of cases) {
      const said = QuestionTitle.of(full, talk, question);
      expect(said).toBe(title);
      expect(said.length <= QuestionTitle.room || said === full).toBe(true);
    }
  });
  it('is the row\'s title for every client, and asking it is the question whole', async () => {
    const t = await Tiny.start(`
      Place vale "the vale" is settlement.
      Place verge "the verge" is room within vale at 0, 0 outdoors.
      Company party "You" of 1 at verge.
      Person carter "the wagoner" at verge { Role "a wagoner with a wheel in the ditch". Ancestry human. Peaceable. Pronouns he. }
      Entity mill_burned: fact "The mill at the ford burned in the spring, and nobody knows who lit it.".
      Topic ask_mill with carter "Ask the wagoner about the burned mill at the ford" when true once {
        Says "'Burned in the spring,' he says. 'Nobody knows who lit it.'".
        On discuss { Assert knows(actor, mill_burned). }
      }
      Goal false.`);
    const row = Doable.of(t.glance, t.screen).find(r => r.id === t.glance.acts
      .find(a => a.subject === 't__carter')?.choice)!;
    expect(row.for).toBe('t__ask_mill');
    // "Talk to the wagoner — ask about the burned mill at the ford" had been cut at a phone's width.
    expect(row.called).toBe('The wagoner: the burned mill at the ford');
    await t.perform(row.for!);
    expect(t.world.related('knows').some(r => r.args[1] === 't__mill_burned')).toBe(true);
  });
});
