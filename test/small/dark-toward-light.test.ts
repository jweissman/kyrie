import { describe, expect, it } from 'bun:test';
import { Tiny } from '../support/tiny';

// In the dark with nothing to see by and nothing to light, the page leads up toward the nearest light (OR-590). On seed
// c3 of test/no-lead-round the candle burned out in the undercroft, and the walk went on from room to room under the
// town (the drain and the rat-runs to and fro, the nest, the charnel passage), never led up to the town. Affordances
// had led back toward the light only by a way that climbs, and the aim's gold had gone on into the dark. The same in
// miniature: a green above, an adit under it, and level workings beyond, all unlit, a company with no light at all.
const town = `
  Place vale "the vale" is region.
  Place mere "Mere" is settlement within vale at 0, 0.
  Place green "the green" is room within mere at 0, 0 outdoors.
  Place adit "the adit" is room within mere at 0, 1 underground 1 down.
  Place drain "the old drain" is room within mere at 1, 1 underground 1 down.
  Place runs "the rat-runs" is room within mere at 2, 1 underground 1 down.
  Place nest "the nest" is room within mere at 3, 1 underground 1 down.
  Passage mouth "the adit mouth" is stair between green and adit.
  Passage cut "the cut" is passage between adit and drain.
  Passage gap "the gap" is passage between drain and runs.
  Passage hole "the hole" is passage between runs and nest.
  Initially Assert unlit(adit). Initially Assert unlit(drain). Initially Assert unlit(runs). Initially Assert unlit(nest).
  Company party "You" of 1 at green.
  Relation cleared(group).
  Objective rats when not cleared(party) toward nest "Clear the rats out of the nest.".
  Goal false.`;
const party = [{ name: 'Thora', raceId: 'human' as const, classId: 'warrior' as const, outfit: 'own' as const }];
const under = async () => {
  const t = await Tiny.start(town, { party, horizon: ['belongings'] });
  for (const way of ['go(t__mouth,t__adit)', 'go(t__cut,t__drain)', 'go(t__gap,t__runs)']) { await t.perform(way); }
  return t;
};
// The page's lead followed until the company is on the green, or six steps.
const walk = async (t: Tiny) => {
  const walked: string[] = [];
  for (let step = 0; step < 6 && t.where() !== 't__green'; step++) {
    expect(t.screen.dark).toBeTruthy();
    const way = t.glance.acts[0];
    walked.push(way?.label ?? '(nothing)');
    if (!way?.command) { break; }
    await t.perform(way.command);
    t.look();
  }
  return { at: t.where(), walked };
};
describe('in the dark with nothing to light', () => {
  it('leads by the known way toward the nearest light, the way back to it marked', async () => {
    const t = await under();
    t.look();
    expect(t.glance.acts[0]).toMatchObject({ why: 'retreat', label: 'To the old drain' });
    expect(await walk(t)).toEqual({ at: 't__green', walked: ['To the old drain', 'To the adit', 'Up to the green'] });
  });
  it('is the aim\'s step, never a way on into the dark', async () => {
    const t = await under();
    t.follow('rats');
    expect(t.gold.map(a => a.label)).toEqual(['To the old drain']);
    expect(await walk(t)).toEqual({ at: 't__green', walked: ['To the old drain', 'To the adit', 'Up to the green'] });
  });
});
