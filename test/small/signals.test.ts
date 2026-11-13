import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Signals } from '../support/signals';

// A likeness drawn blue has the question that teaches something inside it, drawn blue and in view; one drawn rose has
// the asking to come along (the owner, 12 November: blue pips with no blue question, a rose pip and the recruiting
// unmarked). One with only a word to be had is not drawn for either (the wagoner's "Offer him a hand" had drawn him
// blue). The rule on a green of three; test/signal-inside.test.ts walks a generated country's first town with it.
const green = `
  Place hythe "Hythe" is settlement.
  Place green "the green" is room within hythe at 0, 0 outdoors.
  Company party "You" of 1 at green.
  Entity ford_known: fact "where the old ford is".
  Person osric "Osric" at green { Role "an old eel-man". Ancestry human. Peaceable. Pronouns he. }
  Topic osric_ford with osric "Ask Osric about the ford" when true once {
    Says "'Below the alders,' says Osric. 'Where the water's brown. Mind the step.'".
    On discuss { Assert knows(actor, ford_known). }
  }
  Person wenna "Wenna" at green { Role "a girl with a bow". Ancestry human. Peaceable. Pronouns she. }
  Topic wenna_come with wenna "Ask Wenna whether she would come along" when true once {
    Says "'If you're going past the mill,' says Wenna, 'I'm coming.'".
    On discuss { Assert willing(wenna, actor). }
  }
  Person dunn "Dunn" at green { Role "a wagoner". Ancestry human. Peaceable. Pronouns he. }
  Topic dunn_hand with dunn "Offer Dunn a hand with the wheel" when true {
    Says "'I've got it,' says Dunn. He hasn't.".
  }
  Observe green_scene at green when true "A green, and a wagon with a wheel off.".
  Goal false.`;

describe('a signal and what it is for, on a green', () => {
  it('finds a blue question in the one drawn blue and the asking to come along in the one drawn rose', async () => {
    const t = await Tiny.start(green);
    const aspects = new Map(t.glance.acts.filter(a => a.subject).map(a => [a.subject!, a.aspects]));
    expect(aspects.get('t__osric')).toContain('knowledge');
    expect(aspects.get('t__wenna')).toContain('companionship');
    expect(aspects.get('t__dunn') ?? []).not.toContain('knowledge');
    const { checked, missed } = Signals.missed(t.campaign);
    expect(checked.length).toBeGreaterThanOrEqual(2);
    expect(missed).toEqual([]);
  });
  // Willing is not yet with the company: rose stays, and is found in the asking her to come; come along, it is gone.
  it('no longer draws blue for what has been learned, and rose leads on to the joining, then goes', async () => {
    const t = await Tiny.start(green);
    const aspects = () => new Map(t.glance.acts.filter(a => a.subject).map(a => [a.subject!, a.aspects]));
    await t.play('Talk to Osric', 'Ask Osric about the ford', '?Take your leave');
    expect(aspects().get('t__osric') ?? []).not.toContain('knowledge');
    await t.play('Talk to Wenna', 'Ask Wenna whether she would come along', '?Take your leave');
    expect(aspects().get('t__wenna')).toContain('companionship');
    expect(Signals.missed(t.campaign).missed).toEqual([]);
    await t.play('Ask Wenna to join the company');
    expect(t.world.test({ kind: 'call', name: 'travelsWith', args: ['t__wenna', t.campaign.playerActor!] })).toBe(true);
    expect(aspects().get('t__wenna') ?? []).not.toContain('companionship');
  });
});
