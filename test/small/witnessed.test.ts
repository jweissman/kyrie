import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';
import { Attest } from '../../src/presentation/attest';
import { PlayerView } from '../../src/presentation/player-view';
import { Fold } from '../../src/presentation/fold';
import { SceneModel } from '../../src/ui/scene';

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
// What the place leads with, as the page folds it (Fold.led): each act by its leaves, an opener by the rows it opens.
const local = (t: Tiny) => {
  const drawn = SceneModel.order(SceneModel.build(t.screen), new Set());
  return Fold.mark(Fold.led(t.glance, id => drawn.find(c => c.id === id), true), true);
};
describe('an indicator, of its witnesses', () => {
  it('is blue only by an act that teaches, one the company can do now', async () => {
    const t = await Tiny.start(green);
    const blue = local(t);
    expect(blue?.tone).toBe('blue');
    // Its witness is not the talk the place leads with but the question inside it, an act the company can do now:
    // what the mark promised is there to be done (Fold: a container is the fold of its rows).
    const opener = t.glance.acts.find(a => a.inside?.some(x => x.command === blue!.witnesses[0]!.id))!;
    expect(offered(t).has(opener.command!)).toBe(true);
    const question = opener.inside!.find(x => x.aspects.includes('knowledge'))!.command;
    expect(blue!.witnesses.map(w => w.id)).toEqual([question]);
  });
  it('is carried back from a view as the place leads with it, not composed apart', async () => {
    const t = await Tiny.start(green);
    const led = t.glance.acts.filter(a => !a.choice.startsWith('travel:'))
      .flatMap(a => [a.choice, ...(a.inside ?? []).map(x => x.command)]);
    expect(local(t)?.witnesses.every(w => led.includes(w.id))).toBe(true);
  });
  it('goes the moment its opportunity does', async () => {
    const t = await Tiny.start(green);
    const question = t.glance.acts.flatMap(a => a.inside ?? []).find(x => x.aspects.includes('knowledge'))!.command;
    await t.perform(question);
    expect(Attest.witness(t.glance, question)).toBeUndefined();
    expect(local(t)?.tone).not.toBe('blue');
  });
  it('is none where nothing witnesses it, and says why', async () => {
    const t = await Tiny.start(green);
    expect(Fold.mark([Fold.leaf({ id: 'no such act' }, [Attest.witness(t.glance, 'no such act')])], true)).toBeUndefined();
    expect(Attest.why(t.glance, 'no such act')).toBe('no such act: the glance attests nothing by this id');
  });
});
