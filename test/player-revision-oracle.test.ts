import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { PlayerRevision } from '../src/presentation/player-revision';
import { PlayerFrame } from '../src/presentation/player-frame';
import { PlayerView } from '../src/presentation/player-view';
import { Knowing } from '../src/presentation/knowing';
import { SkillReading } from '../src/presentation/skill-reading';
import { CoinReading } from '../src/presentation/coin-reading';
import { RefusalReading } from '../src/presentation/refusal-reading';
import { ScreenModel } from '../src/ui/screen-model';
import { Narrator } from '../src/presentation/narrator';
import { Digest } from '../src/session/digest';
import { TravelCensus } from '../scripts/travel-census';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';
import type { Campaign } from '../src/campaign/campaign';

// What a player revision keeps is what would be worked out afresh (OR-740's first slice): with PlayerRevision.keeping
// off, every reading (the frame's rows, what is perceived and its chronicle, the knowledge door, what is withheld) is
// worked out again at every ask, as if no revision were kept. At every turn of the golden walk, and at every stop of a
// seeded journey on a1 (to the farthest places two hexes out, set out on again after each stop), the readings kept and
// the screen and the narrator's leaf built from them are those worked out afresh, on the same campaign; and the walk
// played whole with nothing kept answers every line as the walk kept, and leaves the same world.
const afresh = async <T>(f: () => T | Promise<T>): Promise<T> => {
  PlayerRevision.keeping = false;
  try { return await f(); } finally { PlayerRevision.keeping = true; }
};
const seen = (c: Campaign) => {
  const k = Knowing.of(c), skills = SkillReading.read(c), screen = ScreenModel.build(c);
  return { rows: PlayerFrame.of(c).rows, observed: PlayerView.observe(c), chronicle: PlayerView.chronicle(c),
    inView: [...k.inView], visited: [...k.visited], uses: [...skills.uses], wanting: skills.wanting,
    coin: CoinReading.read(c), refused: RefusalReading.read(c), screen, leaf: Narrator.leaf(c, screen) };
};
async function same(c: Campaign) {
  if (c.command && !c.fighting) { return; }
  const kept = seen(c);
  expect(await afresh(() => seen(c))).toEqual(kept);
}
async function golden(check: boolean): Promise<string[]> {
  const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
  const r = new Runner(journey.session), out: string[] = [];
  for (const line of GoldenWalk.lines()) {
    const s = await AsMeant.ask(r, line);
    out.push(`${line} → ${JSON.stringify(s)} | ${Digest.of(r.session.campaign)}`);
    if (check) { await same(r.session.campaign); }
  }
  return out;
}
describe('a player revision, kept or afresh', () => {
  it('keeps at every turn of the golden walk what would be worked out afresh', async () => {
    const kept = await golden(true);
    expect(await afresh(() => golden(false))).toEqual(kept);
  }, 400000);
  it('keeps at every stop of a seeded journey what would be worked out afresh', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1', '--as', 'human/warrior/Wat']));
    const s = journey.session;
    let stops = 0;
    for (const to of TravelCensus.far(s.campaign, 2).slice(0, 3)) {
      for (let tries = 0; tries < 4; tries++) {
        await s.leg(`travel:${to.id}`);
        await same(s.campaign); stops++;
        const done = s.journeyed!;
        if (done.arrived || !done.legs.length) { break; }
      }
    }
    expect(stops).toBeGreaterThan(1);
  }, 400000);
});
