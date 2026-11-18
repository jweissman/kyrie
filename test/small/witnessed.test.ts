import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Attest } from '../../src/presentation/attest';
import { PlayerView } from '../../src/presentation/player-view';

// The trust contracts' first proof (the owner, 18 November): an indicator is its witnesses (Attest), and a witness is
// an act the company can do now through the control that shows it. A reeve on a green who can tell who owes what.
const green = `
  Place green "the green" is room at 0, 0 outdoors.
  Place lane "the lane" is room at 1, 0 outdoors.
  Passage lane_way "the way to the lane" is path between green and lane.
  Company party "You" of 1 at green.
  Entity owed: fact "The miller owes the reeve ten coin.".
  Person reeve "Annis the reeve" at green { Role "reeve". Ancestry human. Peaceable. Pronouns she. }
  Topic owing with reeve "Ask Annis who owes what" when true once {
    Says "'The miller,' says Annis. 'Ten coin, since the harvest.'".
    On discuss { Assert knows(actor, owed). }
  }
  Goal false.`;
const offered = (t: Tiny) => new Set(PlayerView.choices(t.campaign).map(c => c.choice.id));
describe('an indicator, of its witnesses', () => {
  it('is blue only by an act that teaches, one the company can do now', async () => {
    const t = await Tiny.start(green);
    const blue = Attest.local(t.glance, true);
    expect(blue?.tone).toBe('blue');
    // Each witness is a choice the glance leads with that opens to an offered act.
    // Its witness is the talk the place leads with, an act the company can do now; and opened, the question inside it
    // is witnessed blue in its turn: what the mark promised is there to be done.
    const opener = t.glance.acts.find(a => a.choice === blue!.witnesses[0]!.id)!;
    expect(offered(t).has(opener.command!)).toBe(true);
    const question = opener.inside!.find(x => x.aspects.includes('knowledge'))!.command;
    expect(Attest.of([Attest.witness(t.glance, question)], true)?.tone).toBe('blue');
  });
  it('is carried back from a view as the place leads with it, not composed apart', async () => {
    const t = await Tiny.start(green);
    const local = Attest.local(t.glance, true);
    expect(local?.witnesses.map(w => w.id)).toEqual(t.glance.acts.filter(a => !a.choice.startsWith('travel:'))
      .filter(a => a.aspects.length).map(a => a.choice));
  });
  it('goes the moment its opportunity does', async () => {
    const t = await Tiny.start(green);
    const question = t.glance.acts.flatMap(a => a.inside ?? []).find(x => x.aspects.includes('knowledge'))!.command;
    await t.perform(question);
    expect(Attest.witness(t.glance, question)).toBeUndefined();
    expect(Attest.local(t.glance, true)?.tone).not.toBe('blue');
  });
  it('is none where nothing witnesses it, and says why', async () => {
    const t = await Tiny.start(green);
    expect(Attest.of([Attest.witness(t.glance, 'no such act')], true)).toBeUndefined();
    expect(Attest.why(t.glance, 'no such act')).toBe('no such act: the glance attests nothing by this id');
  });
});
