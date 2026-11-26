import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// An aim's successor may be a new verb within reach (BX-01's progression gap; OR-60): an aim seen through, with a
// lesson earned and its fee in the purse, what pulls next is the mentor who would teach it now, and the way to them.
// In a1, the boundary stones followed and seen through (300 experience), the purse holding a lesson's fee: Ebba at
// the drill-yard.
class Stones {
  static async walk(purse: number): Promise<Said> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1', '--origin', 'wanderer',
      '--as', 'human/warrior/Wenna']));
    journey.coin(purse);
    const r = new Runner(journey.session);
    let s = await r.ask(JSON.stringify({ follow: 'quarrel__stones' })) as Said;
    // The drill-yard looked into first, and Ebba seen there: the gold leads only to someone the company knows where to
    // find (OR-881), and a mentor never met is not one.
    for (const label of [/^To the landing at/, /^To the drill-yard/, /^To the taproom of the Lucky Phoenix/,
      /^Out to the inn's back garden/, /^Search here/, /^To Mik's salt-house/, /^Tell Mik about the old holes/]) {
      const o = [...s.offer.primary, ...s.offer.rest].find(x => label.test(x.label));
      if (!o) { throw new Error(`not offered: ${label} (${[...s.offer.primary, ...s.offer.rest].map(x => x.label).join(' | ')})`); }
      s = await r.ask(JSON.stringify({ act: o.id })) as Said;
    }
    return s;
  }
}
describe('an aim seen through, a lesson earned', () => {
  it('leads to the mentor who would teach it now, where the fee can be paid', async () => {
    const s = await Stones.walk(30);
    expect(s.scene.lines.join(' ')).toMatch(/the boundary stones, seen through/);
    expect(s.next).toMatchObject({ text: 'Ebba would teach you now, at the drill-yard behind the Lucky Phoenix.',
      act: 'travel:region__s1_drill' });
    // Without the fee, the next is the town's own business, as before.
    expect((await Stones.walk(5)).next?.text).not.toMatch(/would teach you/);
  }, 240000);
});
