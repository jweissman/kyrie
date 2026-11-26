import { describe, expect, it } from 'bun:test';
import { Arrivals } from '../support/arrivals';
import { PlayerFrame } from '../../src/presentation/player-frame';
import { PlayerView } from '../../src/presentation/player-view';
import { ChoiceIds } from '../../src/ui/choice-ids';
import type { Campaign } from '../../src/campaign/campaign';

// The rows of a few schemas alone (PlayerView.only), as a journey's leg asks for them: its way, whether the company is
// held where it lies, and who here would fight. Each is the frame's own rows of those schemas, in the frame's order and
// words (the oracle: the whole frame built, and filtered), at every place along a small track; and a command is
// resolved by its schema's rows to the action the whole rows resolve it to.
const schemas = [['go', 'lie_still'], ['attack'], ['take_item', 'look_closely'], ['wait']];
const of = (c: Campaign, s: readonly string[]) => PlayerFrame.of(c).rows
  .filter(r => s.includes(r.action.schema ?? r.action.id));
const shown = (rows: readonly { choice: { id: string; name: string }; action: { id: string } }[]) =>
  rows.map(r => [r.choice.id, r.choice.name, r.action.id]);
// The old resolution: every row asked, its id found among them all (ChoiceIds), else an action on offer by its id.
const resolved = (c: Campaign, command: string) => {
  const rows = PlayerFrame.of(c).rows, id = ChoiceIds.resolve(command, rows.map(r => r.choice.id));
  return rows.find(r => r.choice.id === id)?.action.id ?? command;
};
describe('the rows of a few schemas alone', () => {
  it('are the frame\'s rows of them, and resolve a command as all the rows do, all along a track', async () => {
    const s = await Arrivals.start(), c = s.campaign, seen: unknown[] = [], expected: unknown[] = [];
    for (const passage of ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8', 'p9', 'p10', 'p11', 'p12']) {
      for (const some of schemas) {
        seen.push([passage, some, shown(PlayerView.only(c, new Set(some)))]);
        expected.push([passage, some, shown(of(c, some))]);
      }
      for (const row of PlayerFrame.of(c).rows) {
        seen.push([passage, row.choice.id, PlayerView.resolve(c, row.choice.id)]);
        expected.push([passage, row.choice.id, resolved(c, row.choice.id)]);
      }
      await s.leg(Arrivals.way(s, passage));
    }
    expect(seen).toEqual(expected);
    // Something was there to compare: the ways at every place, and the rats and the footpads to fight.
    const listed = (expected as unknown[][]).filter(e => Array.isArray(e[2]) && (e[2] as unknown[]).length);
    expect(listed.length).toBeGreaterThan(24);
  });
  it('are not asked of an ask, which is worded by all that is on offer', async () => {
    const c = (await Arrivals.start()).campaign;
    expect(() => PlayerView.only(c, new Set(['ask']))).toThrow();
  });
});
