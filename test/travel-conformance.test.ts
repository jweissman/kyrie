import { describe, expect, it } from 'bun:test';
import { EngineHost } from '../web/engine/engine-host';
import { Creation } from '../web/engine/creation';
import type { Frame } from '../src/creation/protocol';
import { PlaySession, type SessionCheckpoint } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { ScreenModel } from '../src/ui/screen-model';
import { Itineraries } from '../src/ui/itinerary';
import { TravelQuestion } from '../src/presentation/travel-question';
import { Narrator, type Told } from '../src/presentation/narrator';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Terminal } from '../src/cli/terminal';
import { TerminalPlay } from '../src/cli/terminal-play';
import { Digest } from '../src/session/digest';

// TB-09's first activity: travel as an engine question. The browser's engine host and the terminal's session, from
// one world and checkpoint, are asked the same travel question (Leaf.travel: its words, a row a place, each with its
// command), the terminal's journeys are only the engine's rows, and one journey set out on by each client's own
// command (the page's travel request, the terminal's travel: act) comes to the same semantic frame: the world, the
// place, whether it arrived and why it stopped, and the question asked there.
const start = async () => {
  const host = new EngineHost(() => undefined);
  await host.handle({ kind: 'begin', campaign: Creation.generated, seed: 'wren', origin: 'wanderer',
    party: [{ name: 'Wenna', raceId: 'human', classId: 'warrior' }] });
  // On the earned stage (OR-1245): the map and the lenses are hidden until earned, and this walks with them.
  await host.handle({ kind: 'earn' });
  const kept = JSON.parse(await host.handle({ kind: 'checkpoint' }) as string) as { checkpoint: SessionCheckpoint };
  // Taken up as the terminal takes up a kept game: its drawn country widening as it goes (TerminalPlay.opened).
  return { host, terminal: TerminalPlay.opened(kept.checkpoint) };
};
const session = (host: EngineHost) => (host as unknown as { session: PlaySession }).session;
// The terminal's leaf, as it tells a command done (see Terminal.play).
const leafAfter = async (s: PlaySession, command: string) => {
  const name = PlayerView.choices(s.campaign).find(r => r.choice.id === command)?.choice.name ?? command;
  const before = PlayerView.observe(s.campaign), event = await s.leg(command);
  const told: Told = { event, feedback: ActionFeedbackView.read(s.campaign, event, before), said: name,
    moved: before.location?.id !== PlayerView.observe(s.campaign).location?.id };
  // Charted and asked the map's question, as Terminal.scene asks it.
  const screen = ScreenModel.build(s.campaign), charted = Itineraries.charted(s.campaign, screen);
  return { screen, leaf: TravelQuestion.on(Narrator.leaf(s.campaign, screen, told), charted, s.campaign) };
};
const asked = (travel?: Frame['leaf']['travel']) => travel && { question: travel.question,
  rows: travel.rows.map(r => [r.command, r.place, r.kind]) };
const offered = (s: PlaySession, at: Awaited<ReturnType<typeof leafAfter>>) =>
  (Terminal as unknown as { foreground: (...a: unknown[]) => { all: { id: string; journey?: string }[] } })
    .foreground(s, at.leaf.glance, at.screen, { travel: at.leaf.travel }).all.filter(c => c.journey).map(c => c.id);

describe('travel as an engine question', () => {
  it('asks page and terminal the same, sets out by the same command, and comes to the same frame', async () => {
    const { host, terminal } = await start();
    // Come down into the town first, by the same command: on the road down into it, the wanderer's map holds the town
    // alone, and no journey past it, since the map draws what the company knows (OR-810).
    const down = PlayerView.choices(terminal.campaign).find(r => /,region__s1_green\)$/.test(r.choice.id))!.choice.id;
    const frame = await host.handle({ kind: 'perform', command: down }) as Frame;
    const here = await leafAfter(terminal, down);
    expect(frame.leaf.travel?.rows.length).toBeGreaterThan(0);
    expect(asked(here.leaf.travel)).toEqual(asked(frame.leaf.travel));
    // The terminal's journeys are the engine's rows and nothing of its own.
    const commands = new Set(here.leaf.travel!.rows.map(r => r.command));
    expect(offered(terminal, here).filter(id => !commands.has(id))).toEqual([]);
    // One journey, by each client's own command.
    const row = frame.leaf.travel!.rows.find(r => r.command.startsWith('travel:'))!;
    const there = await host.handle({ kind: 'travel', destination: row.place }) as Frame;
    const after = await leafAfter(terminal, row.command);
    const semantic = (s: PlaySession, f: { screen: { place: { id: string } }; leaf: Frame['leaf'] }, went: {
      arrived?: boolean; stopped?: string } | undefined) => ({ digest: Digest.of(s.campaign), at: f.screen.place.id,
      arrived: !!went?.arrived || !went?.stopped, stopped: went?.stopped, asked: asked(f.leaf.travel) });
    expect(semantic(terminal, after, terminal.journeyed)).toEqual(semantic(session(host), there, there.travel));
  }, 300000);
});
