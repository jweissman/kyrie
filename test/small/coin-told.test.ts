import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Runner } from '../../src/cli/runner';

// Coin that comes is said as it comes (OR-696, cold play 3, T92: the purse 6 → 12 in the charnel passage, where the
// restocked rats warned the company off, and no line said why). The world's words that came with the purse changing
// are a change, never held back for the arrival's room as its other tellings are (RuleWords.paying, SceneBudget).
const charnel = `
  Place ossuary "the ossuary" is room at 0, 0 underground.
  Place charnel "the charnel passage" is room at 1, 0 underground.
  Passage arch "the low arch" is passage between ossuary and charnel.
  Company party "You" of 1 at ossuary.
  Person rats "the rats in the charnel passage" at charnel { Role "lean rats". Species rat. Numbers 3. Level 1. Temperament territorial. Lair charnel. }
  Relation paid().
  Rule coins when at(party, charnel) and not paid() says "Grave-coins the rats had dragged off the shelf lie in the dust. You pick up six." { Assert paid(). Increase quantity(party, gold) by 6. }
  Goal false.`;
describe('coin come to the company', () => {
  it('is said as it comes, where a danger fills the arrival', async () => {
    const t = await Tiny.start(charnel, { party: [{ name: 'Ama', raceId: 'human', classId: 'warrior' }],
      horizon: ['inhabitants', 'belongings'] });
    const r = new Runner(t.session); r.said();
    const lit = await r.ask(JSON.stringify({ act: 'light_item(t__party_1__torch)' }));
    if ('error' in lit) { throw new Error(lit.error); }
    const came = await r.ask(JSON.stringify({ act: 'go(t__arch,t__charnel)' }));
    if ('error' in came) { throw new Error(came.error); }
    expect(came.purse?.coin).toBe(6);
    expect(came.scene.lines.join(' ')).toMatch(/You pick up six/);
    expect(came.scene.lines.join(' ')).toMatch(/stand their ground/);
  });
});
