import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { ScreenModel } from '../../src/ui/screen-model';
import { SceneModel } from '../../src/ui/scene';
import { Attending } from '../../src/ui/attention';

// An act someone speaks (Speaker) that is not a Topic is done, not said: it stands beside talking to them, not inside
// the talk. Letting a boat through the sea-gate, as its boatman asks, had been had only by talking to him (cold play
// 6's sea-gate, CL-54); a question to him stays in the talk.
const verge = `
  Place vale "the vale" is settlement.
  Place verge "the verge" is room within vale at 0, 0 outdoors.
  Company party "You" of 1 at verge.
  Relation helped(group).
  Person carter "the wagoner" at verge { Role "a wagoner with a wheel in the ditch". Ancestry human. Peaceable. Pronouns he. }
  Entity mill_burned: fact "The mill at the ford burned in the spring.".
  Action lend_hand(actor: group, site: place) "Put your shoulder to the wagoner's wheel" {
    Speaker carter.
    Requires able(actor) and company(actor) and at(actor, site) and at(carter, site) and not helped(actor).
    Time 3.
    On success { Assert helped(actor). }
    Result "The cart comes up out of the ditch.".
  }
  Topic ask_mill with carter "Ask the wagoner about the mill" when true once {
    Says "'Burned in the spring,' he says.".
    On discuss { Assert knows(actor, mill_burned). }
  }
  Goal false.`;
describe('an act someone speaks', () => {
  it('stands beside talking to them, and a question to them is in the talk', async () => {
    const t = await Tiny.start(verge);
    const carter = Attending.place(SceneModel.build(ScreenModel.build(t.campaign))).subjects
      .find(s => s.id === 't__carter')!;
    const own = carter.choices.filter(c => !c.children).map(c => c.command);
    expect(own).toContain('t__lend_hand');
    const talk = carter.choices.find(c => c.id === 't__carter#talk')!;
    expect(Attending.all(talk.children ?? []).map(c => c.command)).toContain('t__ask_mill');
    expect(Attending.all(talk.children ?? []).map(c => c.command)).not.toContain('t__lend_hand');
  });
});
