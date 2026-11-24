import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { CompanyKnowledge } from '../../../src/presentation/company-knowledge';
import { Doable } from '../../../src/presentation/doable';
import { PlayerView } from '../../../src/presentation/player-view';
import { ScreenModel } from '../../../src/ui/screen-model';
import { NewsFold } from '../../../src/ui/news-fold';
import { GoldenWalk } from '../../support/golden-walk';

// Feature pins: see test/features/choice/consequence.pin.test.ts. Interface › The first day's load (FH-25): the
// warrior's golden walk through its first day (the adit, the drove, the Stone Horn, the cold pans and the fuel boat,
// the reeve's sea-gate), measured at every turn. The Notes carry nothing that is over (Bran held once he is out, the
// pans going cold once they burn, the boat at the staithe once it has gone down the cut, Carlin looking for work once
// she has joined); the aims held stay few; and what anyone has heard of far places is one question to them, or the one
// or two they have heard each by name (NewsFold.most), never a list of rumours (the cold rounds had met 27 of them, and
// 13 under the Stone Horn's keeper: CL-67). A ratchet: each bound is the walk as it plays now, to be lowered when it
// falls, never raised.
const most = { aims: 2, notes: 14, far: NewsFold.most - 1 };
const far = /^ask\(|_beyond_told_/;
describe('Interface › The first day\'s load', () => {
  it('holds the Notes to what still holds, the aims few, and far news to one question a person', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const day = () => c.world.number(ModuleWriter.call('day', 'clock'));
    let aims = 0, turns = 0, notes = 0;
    for (const line of GoldenWalk.lines()) {
      const s = await r.ask(line);
      if ('error' in s) { throw new Error(`${line}: ${s.error}`); }
      if (day() > 1) { break; }
      turns++;
      aims = Math.max(aims, (s.aims ?? []).length);
      const over = CompanyKnowledge.over(c.world);
      expect(PlayerView.observe(c).knowledge.filter(k => over.has(k.id)).map(k => k.id)).toEqual([]);
      const screen = ScreenModel.build(c), rows = Doable.flat(Doable.of(r.leaf!.glance!, screen));
      notes = screen.knowledge.length;
      const asked = new Map<string, number>();
      for (const x of rows.filter(x => far.test(x.does ?? '') && x.within)) {
        asked.set(x.within!, (asked.get(x.within!) ?? 0) + 1);
      }
      expect(Math.max(0, ...asked.values())).toBeLessThanOrEqual(most.far);
    }
    expect(turns).toBeGreaterThan(40);
    expect(aims).toBeLessThanOrEqual(most.aims);
    expect(notes).toBeLessThanOrEqual(most.notes);
  }, 180000);
});
