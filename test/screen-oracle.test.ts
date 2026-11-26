import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { PlayerRevision } from '../src/presentation/player-revision';
import { KeptParts } from '../src/ui/kept-parts';
import { Outcome } from '../src/presentation/outcome';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { TravelCensus } from '../scripts/travel-census';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';
import type { Campaign } from '../src/campaign/campaign';

// The screen as the game builds it, with every part it keeps and carries from one revision to the next and every part
// it leaves unasked, is the screen built afresh (OR-860 to OR-864): with the player's revision, the page's kept parts
// and what an act would teach carried off (PlayerRevision.keeping, KeptParts.keeping, Outcome.carrying), every reading
// is worked out whole at every ask. At every
// turn of the golden walk, and at every stop of a seeded journey on a1, the screen and the narrator's leaf are the same
// either way, on the same campaign.
const afresh = <T>(f: () => T): T => {
  PlayerRevision.keeping = false; KeptParts.keeping = false; Outcome.carrying = false;
  try { return f(); } finally { PlayerRevision.keeping = true; KeptParts.keeping = true; Outcome.carrying = true; }
};
const seen = (c: Campaign) => {
  const screen = ScreenModel.build(c);
  return { screen, leaf: Narrator.leaf(c, screen) };
};
function same(c: Campaign) {
  if (c.command && !c.fighting) { return; }
  const kept = seen(c);
  expect(afresh(() => seen(c))).toEqual(kept);
}
describe('the screen, as kept or afresh', () => {
  it('is the same at every turn of the golden walk', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
    const r = new Runner(journey.session);
    let turns = 0;
    for (const line of GoldenWalk.lines()) {
      await AsMeant.ask(r, line);
      same(r.session.campaign); turns++;
    }
    expect(turns).toBeGreaterThan(40);
  }, 400000);
  it('is the same at every stop of a seeded journey', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1', '--as', 'human/warrior/Wat']));
    const s = journey.session;
    let stops = 0;
    for (const to of TravelCensus.far(s.campaign, 2).slice(0, 3)) {
      for (let tries = 0; tries < 4; tries++) {
        await s.leg(`travel:${to.id}`);
        same(s.campaign); stops++;
        const done = s.journeyed!;
        if (done.arrived || !done.legs.length) { break; }
      }
    }
    expect(stops).toBeGreaterThan(1);
  }, 400000);
});
