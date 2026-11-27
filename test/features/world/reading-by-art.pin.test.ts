import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { Placed } from '../../support/placed';
import { TalkWay } from '../../support/talk-way';

// Feature pins: see test/features/choice/consequence.pin.test.ts. World › Reading by art (OR-1099; the research of 26
// November, doc/design/research-abilities-and-the-world-2026-11-26.md, slice 1): an ability reaches the world by what
// it lets the company do, never by its name. Comprehend Languages lays `lettered`, which grants lore, and the old
// letters under the woods ask for lore (`Change read … needing lore`). A warrior's company in the reference game, with
// no one who reads them, buys the scroll from Trader 1 and reads it over its own at the way down: the makers' marks on
// the kerb-stones are then to be read, their row blue for what it teaches by inference (Outcome), and read, the
// company knows the makers' fact.
type Row = { id: string; label: string; aspects: string[]; opens?: Row[] };
const flat = (rs: Row[]): Row[] => rs.flatMap(r => [r, ...flat(r.opens ?? [])]);
const rows = (s: Said): Row[] => flat([...s.offer?.primary ?? [], ...s.offer?.rest ?? [],
  ...Object.values(s.offer?.lenses ?? {}).flat()] as Row[]);
describe('World › Reading by art', () => {
  it('reads the makers\' marks under the woods by a scroll bought in the town, where the company has no lore', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 's0', '--as', 'human/warrior/Wenna',
      '--opening', 'none']));
    const r = new Runner(journey.session), c = journey.session.campaign, P = (x: string) => `region__s1_${x}`;
    let s = r.said('look');
    const say = async (id: string) => {
      const said = await r.ask(JSON.stringify({ act: id }));
      expect([id, 'error' in said ? said.error : '']).toEqual([id, '']);
      s = said as Said;
    };
    const act = async (words: string) => {
      // Found as the page's player finds it, a talk open (TalkWay, OR-1451).
      const way = await TalkWay.find(r, s, x => new RegExp(words, 'i').test(x.label)), found = way.o;
      s = way.said;
      if (!found) { throw new Error(`${words} not among ${rows(s).map(x => x.label).join(' | ')}`); }
      await say(found.id);
    };
    const keeper = c.module.entities.find(e => e.id === P('merchant'))!.name.split(', ')[0]!;
    await say(`exit:${P('green')}`); await say(`exit:${P('shop')}`); await act(`^(Talk to|Ask) ${keeper}`);
    await act('^Buy a scroll of comprehend languages');
    // The way to the stones and down is the reference loop's (test/features/world/the-reference-loop.pin.test.ts).
    Placed.at(journey, P('ud'));
    s = r.said('look');
    const marks = /^Read the marks on the kerb-stones/;
    expect(rows(s).some(x => marks.test(x.label))).toBe(false);
    await act('^Use .*comprehend languages on Wenna');
    const read = rows(s).find(x => marks.test(x.label));
    expect(read?.aspects).toContain('knowledge');
    const fact = c.module.observations!.find(o => o.id === P('ud_makers_learned'))!.teaches!;
    expect(c.world.test({ kind: 'call', name: 'knows', args: ['party', fact] })).toBe(false);
    await say(read!.id);
    expect(c.world.test({ kind: 'call', name: 'knows', args: ['party', fact] })).toBe(true);
  }, 60000);
});
