import { describe, expect, it } from 'bun:test';
import { Laboratory } from '../../scripts/laboratory';
import { PlayTool } from '../../src/cli/play-tool';
import { Runner, type Offered, type Said } from '../../src/cli/runner';
import { RunnerWalk } from '../../src/cli/runner-walk';
import { ScreenModel } from '../../src/ui/screen-model';
import { Narrator } from '../../src/presentation/narrator';

// Continuity of intention (the experience pins' family 3), and the retreat told from the frontier (EX-02): another
// aim heard of marks no way back. In the laboratory the way back up to the corn-store cellar, a retreat, had been drawn
// worth a look for an aim not followed, and from the yard and the pit the way out of the undertown to the landing
// (PF-03, the lead's promise-fidelity walk; so the manors' forecourts on b2 and c3).
describe('the laboratory walked curious', () => {
  it('never draws a way back as worth a look for another aim', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse([Laboratory.file, '--as', 'human/thief/Haze']));
    const r = new Runner(journey.session), c = journey.session.campaign, chosen: Offered[] = [], broken: string[] = [];
    let said: Said = r.said();
    for (let n = 0; n < 30 && !said.end; n++) {
      const screen = ScreenModel.build(c), acts = Narrator.leaf(c, screen).glance?.acts ?? [];
      for (const a of acts.filter(x => x.exit)) {
        const visited = screen.exits.find(e => e.id === a.exit)?.visited;
        if ((a.why === 'held' && visited) || (a.why === 'retreat' && a.aspects.includes('exploration'))) {
          broken.push(`${screen.place.id}: ${a.label} (${a.why})`);
        }
      }
      const pick = RunnerWalk.choose('curious', said, chosen, n + 1);
      if (!pick) { break; }
      const out = await r.ask(JSON.stringify({ act: pick.id }));
      if ('error' in out) { break; }
      chosen.push(pick); said = out;
    }
    expect(broken).toEqual([]);
  });
});
