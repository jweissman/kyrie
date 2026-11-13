import { describe, expect, it } from 'bun:test';
import { Likenesses } from '../../src/presentation/likenesses';
import type { Promoted } from '../../src/presentation/glance-types';
import { Tiny } from '../support/tiny';

// What each likeness is drawn with, said by the engine (M21's PL-32): at Merscstede the glance had Lindal's talk as
// the sealed letter's next step, gold and teaching, and the page aggregated both into a ring that read blue. The aim's
// next step is the undertaking alone; anyone else, the aspects of what is led with about them together.
const act = (subject: string, aspects: Promoted['aspects'], continues = false): Promoted => ({ choice: `${subject}#talk`,
  subject, label: subject, why: 'named', facets: ['here'], tier: 1, aspects, marks: [],
  ...continues ? { continues: true as const } : {} });

describe('the likenesses', () => {
  it('are the undertaking alone for the aim\'s next step, else what is led with about them', () => {
    expect(Likenesses.of([act('lindal', ['undertaking', 'knowledge'], true), act('eldon', ['payoff']),
      act('eldon', ['knowledge']), act('cora', [])])).toEqual({ lindal: { aspects: ['undertaking'], continues: true },
      eldon: { aspects: ['payoff', 'knowledge'] }, cora: { aspects: [] } });
  });
  it('are on the glance the page is given', async () => {
    const t = await Tiny.start(`
      Place yard "the yard" is room at 0, 0 outdoors.
      Company party "You" of 1 at yard.
      Person mother "your mother" at yard { Role "your mother". Peaceable. Pronouns she. }
      Initially Assert expects(mother, party).
      Topic letter with mother "Give your mother the letter" when expects(mother, party) { Says "'At last,' she says.".
        On discuss { Retract expects(mother, party). } }
      Objective letter when expects(mother, party) toward mother "Give your mother the letter.".
      Goal false.`);
    t.follow('letter');
    expect(t.glance.likenesses?.t__mother).toEqual({ aspects: ['undertaking'], continues: true });
  });
});
