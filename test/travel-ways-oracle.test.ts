import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner } from '../src/cli/runner';
import { PlayerFrame } from '../src/presentation/player-frame';
import { PlayerView } from '../src/presentation/player-view';
import { Digest } from '../src/session/digest';
import { TravelCensus } from '../scripts/travel-census';
import { AsMeant } from './support/as-meant';
import { GoldenWalk } from './support/golden-walk';
import type { PlaySession } from '../src/session/play-session';

// A journey's leg grounds and words only the rows it asks for (PlayerView.only: its way, whether the company is held
// where it lies, who here would fight), not the whole frame. The oracle is the old path: the whole frame built on
// every leg and its rows of those schemas read (PlayerView.only answered from PlayerFrame.of). Over seeded journeys
// (the golden walk, every turn of it; and journeys of six to eight hexes from where a life begins on a1, b2 and s0,
// set out on again after each stop), both make the same legs, stop where and why the other does, and leave the same
// world, step by step.
const framed = (c: PlaySession['campaign'], schemas: ReadonlySet<string>) => PlayerFrame.of(c).rows
  .filter(r => schemas.has(r.action.schema ?? r.action.id));
async function played<T>(oracle: boolean, run: () => Promise<T>): Promise<T> {
  const only = PlayerView.only.bind(PlayerView);
  if (oracle) { PlayerView.only = framed as typeof PlayerView.only; }
  try { return await run(); } finally { PlayerView.only = only; }
}
async function golden(): Promise<string[]> {
  const { journey } = await PlayTool.start(PlayTool.parse(GoldenWalk.args()));
  const r = new Runner(journey.session), out: string[] = [];
  for (const line of GoldenWalk.lines()) {
    const s = await AsMeant.ask(r, line);
    out.push(`${line} → ${'error' in s ? s.error : `${s.at} ${s.scene.lines.join(' / ')}`} | ${Digest.of(r.session.campaign)}`);
  }
  return out;
}
async function journeys(world: string): Promise<string[]> {
  const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', world, '--as', 'human/warrior/Wat']));
  const s = journey.session, out: string[] = [];
  for (const to of TravelCensus.far(s.campaign, 2).slice(0, 3)) {
    for (let tries = 0; tries < 4; tries++) {
      await s.leg(`travel:${to.id}`);
      const done = s.journeyed!;
      out.push(JSON.stringify({ to: to.id, arrived: done.arrived, stopped: done.stopped,
        legs: done.legs.map(l => [l.command, l.said, l.passed ?? '']) }), Digest.of(s.campaign));
      if (done.arrived || !done.legs.length) { break; }
    }
  }
  return out;
}
describe('a journey\'s leg, asking only its own rows', () => {
  it('walks the golden walk as the whole frame did', async () => {
    const was = await played(true, golden), now = await played(false, golden);
    expect(now).toEqual(was);
  }, 400000);
  for (const world of ['a1', 'b2', 's0']) {
    it(`makes the same journeys on ${world}`, async () => {
      const was = await played(true, () => journeys(world)), now = await played(false, () => journeys(world));
      expect(now.length).toBeGreaterThan(1);
      expect(now).toEqual(was);
    }, 400000);
  }
});
