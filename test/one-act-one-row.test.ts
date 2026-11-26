import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerOffer } from '../src/cli/runner-offer';
import { Doable } from '../src/presentation/doable';
import { DoableJourneys } from '../src/presentation/doable-journeys';
import { ScreenModel } from '../src/ui/screen-model';
import { GoldenWalk } from './support/golden-walk';

// One act, one row (OR-462, OR-464; AGENTS.md: a row offered twice is an urgent defect), for every client: the
// engine's rows (Doable) offer no act twice, nor a journey to where a way already goes, and so neither does the runner.
// "Ask Dai Probert to stay here" had stood by itself and again as his talk's one act; "Out to the old drift's mouth"
// beside "Up to the old drift's mouth". Held at every turn of the warrior's golden walk through the adit and down to
// the green.
const where = (does: string) => DoableJourneys.reached(does)[0] ?? does;
describe('one act, one row', () => {
  it('holds at every turn of the opening', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), twice: string[] = [];
    for (const line of GoldenWalk.lines().slice(0, GoldenWalk.opened() + 1)) {
      const s = await r.ask(line);
      if ('error' in s) { throw new Error(`${line}: ${s.error}`); }
      if ((s as Said).moment === 'fight') { continue; }
      const rows = Doable.of(r.leaf!.glance!, ScreenModel.build(journey.session.campaign))
        .filter(x => x.does && !x.within);
      const seen = new Map<string, string>();
      for (const x of rows) {
        const k = where(x.does!);
        if (seen.has(k)) { twice.push(`${line}: ${seen.get(k)} / ${x.label}`); } else { seen.set(k, x.label); }
      }
      const said = s as Said;
      const done = RunnerOffer.flat([...said.offer.primary, ...said.offer.rest]).flatMap(o => o.does ?? []).map(where);
      twice.push(...done.filter((d, i) => done.indexOf(d) !== i).map(d => `${line}: runner ${d}`));
    }
    expect(twice).toEqual([]);
  }, 180000);
  // Nor one act's words twice (OR-466): on the green, "Ask Owain how many head came down" had been both the aim to
  // follow and the question in Owain's talk. The aim's step offered here is its one row, in its words, and taking it
  // asks him and takes up the aim, the next part followed on from it.
  it("draws the aim to follow and its step offered here as one row, which takes the aim up", async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--origin', 'drove', '--opening',
      'none']));
    const r = new Runner(journey.session), s = r.said();
    const rows = RunnerOffer.flat([...s.offer.primary, ...s.offer.rest]);
    const asked = rows.filter(o => o.label === 'Ask Owain how many head came down');
    expect(asked.map(o => [o.id, o.does])).toEqual([['drove__owain#talk', 'drove__owain_count_t']]);
    expect(rows.some(o => o.id.startsWith('follow:drove__held_aim'))).toBe(false);
    const drawn = Doable.of(r.leaf!.glance!, ScreenModel.build(journey.session.campaign));
    const labels = drawn.filter(x => !x.within).map(x => x.label), ids = drawn.map(x => x.id);
    expect(labels.filter((l, i) => labels.indexOf(l) !== i)).toEqual([]);
    expect(ids.filter((l, i) => ids.indexOf(l) !== i)).toEqual([]);
    const after = await r.ask('{"act":"drove__owain#talk"}') as Said;
    expect(after.aims?.find(a => a.followed)?.id).toBe('drove__held_rhyne');
  }, 120000);
});
