import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner, type Said } from '../../src/cli/runner';
import { RunnerFind } from '../support/runner-find';

// A fight asked for every choice is the fight (OR-690, cold plays 3 and 4: {"more":true} had answered the place out of
// the fight, with no rows), and its four are the blow, the way out, this turn and pressing on, never a draught for
// whoever stands last in the hand (OR-693, cold play 3: "Use a minor potion of healing on Hugh Lamb", Hugh unhurt).
const cellar = `
  Place cellar "the cellar" is room at 0, 0.
  Person priest "the priest" at cellar { Role "a priest". Ancestry human. Peaceable. Pronouns she. }
  Topic gift with priest "Ask the priest for the bottles" when true once {
    Says "'For after,' she says.". On discuss { Give 2 minor_healing_potion to actor. } }
  Person foe "an owlbear" at cellar { Role "what is in the cellar". Species owlbear. }
  Company party "You" of 1 at cellar.`;
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('a fight', () => {
  it('asked for every choice, a look or a lens, is the fight; its four lead with no draught', async () => {
    const t = await Tiny.start(cellar, { horizon: ['belongings', 'inhabitants'],
      party: [{ name: 'Wat', raceId: 'human', classId: 'warrior', level: 2 }] });
    const r = new Runner(t.session);
    let s = await RunnerFind.act(r, r.said(), /^(Ask the priest|Talk to the priest — ask) for the bottles/);
    s = await RunnerFind.act(r, s, /^Attack/);
    expect(s.moment).toBe('fight');
    expect(s.offer.primary.map(o => o.label).some(l => /^Use /.test(l))).toBe(false);
    expect(s.offer.rest.map(o => o.label)).toContain('Use a minor potion of healing on Wat');
    for (const ask of [{ more: true }, { look: true }, { lens: 'things' }]) {
      const again = said(await r.ask(JSON.stringify(ask)));
      expect([again.moment, again.offer.primary.length > 0]).toEqual(['fight', true]);
      expect([...again.offer.primary, ...again.offer.rest].map(o => o.id))
        .toEqual([...s.offer.primary, ...s.offer.rest].map(o => o.id));
    }
  }, 60000);
});
