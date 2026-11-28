import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { PlayTranscript } from '../../web/engine/transcript';
import { PlayerView } from '../../src/presentation/player-view';
import { ActionFeedbackView } from '../../src/presentation/action-feedback';

// One act that is both a deed and a note (NP-03: Notes and Story as two projections over different records), asserted
// alike in both: the Story tells the company's act and puts what it knows by it in the margin; the Notes keep the
// same thing at the same time, and as the company's own doing. A deed done for the wagoner had been filed in the Notes
// as his telling ("the wagoner told you" that you got him out of the ditch), the act's Speaker taken for its teller;
// a question asked of him is his telling still.
const verge = `
  Place vale "the vale" is settlement.
  Place verge "the verge" is room within vale at 0, 0 outdoors.
  Company party "You" of 1 at verge.
  Relation wayIn(entity).
  Person carter "the wagoner" at verge { Role "a wagoner with a wheel in the ditch". Ancestry human. Peaceable. Pronouns he. }
  Entity hand_given: fact "On the road you got a wagoner out of the ditch for a coin.".
  Entity mill_burned: fact "The mill at the ford burned in the spring, and nobody knows who lit it.".
  Action lend_hand(actor: group, site: place) "Offer the wagoner a hand, for a coin" {
    Speaker carter.
    Requires able(actor) and company(actor) and at(actor, site) and at(carter, site) and not wayIn(hand_given).
    Time 3.
    On success { Assert wayIn(hand_given). Assert knows(actor, hand_given). Increase quantity(actor, gold) by 1. }
    Result "'A coin, then,' says the wagoner, and the cart comes up out of the ditch.".
  }
  Topic ask_mill with carter "Ask the wagoner about the mill" when true once {
    Says "'Burned in the spring,' he says. 'Nobody knows who lit it.'".
    On discuss { Assert knows(actor, mill_burned). }
  }
  Goal false.`;
// The act done as the page does it, and the Story's entry for it (see EngineHost.perform).
const act = async (t: Tiny, command: string) => {
  const c = t.campaign, before = PlayerView.observe(c), event = await t.session.leg(command);
  const entry = PlayTranscript.entry(event, ActionFeedbackView.read(c, event, before), { id: c.history.length,
    said: '', move: false, moved: false, place: 'verge', placeName: 'the verge', elapsed: event.elapsed, named: true });
  t.look();
  return entry;
};
const note = (t: Tiny, re: RegExp) => t.screen.knowledge.find(k => re.test(k.text));
describe('one act that is a deed and a note', () => {
  it('is the same act, at the same time, and the company\'s own, in the Story and the Notes', async () => {
    const t = await Tiny.start(verge, { seed: 'deed', horizon: [] });
    await t.play('An hour');
    const entry = await act(t, 't__lend_hand'), kept = note(t, /out of the ditch/)!;
    expect(entry.said).toBe('Offer the wagoner a hand, for a coin');
    expect(entry.notes).toContain('◆ In the journal: On the road you got a wagoner out of the ditch for a coin');
    expect(kept.how).toBe(`you did it, ${entry.at}`);
    expect(kept.kind).toBe('seen');
  });
  it('keeps a question\'s answer as its speaker\'s telling, at the time the Story asks it', async () => {
    const t = await Tiny.start(verge, { seed: 'deed', horizon: [] });
    const entry = await act(t, 't__ask_mill'), kept = note(t, /mill at the ford/)!;
    expect(entry.notes.some(n => n.includes('The mill at the ford burned'))
      || entry.lines.some(l => l.includes('Burned in the spring'))).toBe(true);
    expect(kept.how).toBe(`the wagoner, a wagoner with a wheel in the ditch, told you, ${entry.at}`);
    expect(kept.kind).toBe('reported');
  });
});
