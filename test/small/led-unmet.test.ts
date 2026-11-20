import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Doable } from '../../src/presentation/doable';

// Someone not yet met, led with for the question inside their talk, is led as talking to them, the question after it
// (the lead's ruling on cold play 4's CL-45 and cold play 5's CL-36: "Ask the factor about the king-barrow", led on
// the landing before anyone had said who the factor was; Gek asked before she was met). The blue pip and the question
// inside the talk stay as they were (test/small/blue-teaches). A verge with a wagoner who knows of the mill.
const verge = `
  Place vale "the vale" is settlement.
  Place verge "the verge" is room within vale at 0, 0 outdoors.
  Company party "You" of 1 at verge.
  Person carter "the wagoner" at verge { Role "a wagoner with a wheel in the ditch". Ancestry human. Peaceable. Pronouns he. }
  Entity mill_burned: fact "The mill at the ford burned in the spring, and nobody knows who lit it.".
  Topic ask_mill with carter "Ask the wagoner about the mill" when true once {
    Says "'Burned in the spring,' he says. 'Nobody knows who lit it.'".
    On discuss { Assert knows(actor, mill_burned). }
  }
  Topic ask_road with carter "Ask the wagoner about the road" when true once { Says "'Mud,' he says.". }
  Goal false.`;
const talk = (t: Tiny) => Doable.of(t.glance, t.screen).find(r => r.id === t.glance.acts
  .find(a => a.subject === 't__carter')?.choice);
describe('a question led to someone not yet met', () => {
  it('is called talking to them, the question after it; blue still on him and on the question', async () => {
    const t = await Tiny.start(verge), row = talk(t)!;
    expect(row.led).toBe(true);
    expect(row.for).toBe('t__ask_mill');
    expect(row.called).toBe('Talk to the wagoner — ask about the mill');
    const act = t.glance.acts.find(a => a.subject === 't__carter')!;
    expect(act.aspects).toContain('knowledge');
    expect(act.inside!.filter(i => i.aspects.includes('knowledge')).map(i => i.command)).toEqual(['t__ask_mill']);
  });
  // Once met, called by the question (MT-18: the engine had said nothing of it, the runner the question).
  it('is the question itself once he has been met', async () => {
    const t = await Tiny.start(verge);
    await t.perform('t__ask_road');
    expect(talk(t)?.for).toBe('t__ask_mill');
    expect(talk(t)?.called).toMatch(/^Ask .+ about the mill$/);
  });
  it('drops whom the question names where the talk names them already, and keeps other words whole', () => {
    expect(Doable.called('Talk to Bran ap Ifor', 'Ask Bran what happened')).toBe('Talk to Bran ap Ifor — ask what happened');
    expect(Doable.called('Talk to Gesk', 'Whether he would come along')).toBe('Talk to Gesk — whether he would come along');
    // A stranger named by a longer name than the question says (a1's camp, foreground-browser): said once.
    expect(Doable.called('Talk to the sellsword on the green', 'Ask the sellsword what brings him here'))
      .toBe('Talk to the sellsword on the green — ask what brings him here');
  });
});
