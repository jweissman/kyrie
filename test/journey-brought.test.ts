import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { PlayerView } from '../src/presentation/player-view';
import { ActionFeedbackView } from '../src/presentation/action-feedback';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';

// A journey's telling carries what each leg brought (TR-01, CL-38): the runner, the terminal and the page tell a
// journey by its last leg's telling, and what came on the legs before it had been told nowhere: cold play 5's mage's
// Light ran out on the second leg of three to the guest-hall with no word, and a pedlar seen far off on the way to
// Cloudreach was kept on its leg (Journeyed.passed) and read by nothing the player is shown.
const text = (s: Said | { error: string }) => { if ('error' in s) { throw new Error(s.error); } return s.scene.lines.join('\n'); };

describe('a journey told', () => {
  it('says the Light ran out on a leg before the last (cold play 5, its 19)', async () => {
    const lines = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean);
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(journey.session);
    for (const line of lines.slice(0, 18)) { await r.ask(line); }
    expect(lines[18]).toBe('{"act":"travel:region__s4_taproom"}');
    const told = text(await r.ask(lines[18]!));
    expect(told).toMatch(/The light over (Ilse’s|your) shoulder fades\./);
    expect(told.match(/shoulder fades/g)).toHaveLength(1);
  }, 180000);
  // Its counterexample is the same journey told by its last leg alone, the event in the campaign's record.
  it('tells the pedlar seen on the way, where the journey goes on past them', async () => {
    const s = (await PlayTool.start(PlayTool.parse(['--earned', '--world', 'a1', '--as', 'human/warrior/Wenna']))).journey.session;
    // Cloudreach's march-stone by its name: ten hexes off since AR-21's one way-finder, past the census's six to eight.
    // Since OR-810 the stone is on no fresh life's map (nobody in a1 tells of it: OR-811), so it is set out for by its
    // id, as a journey told it would be (test/travel-continuity likewise).
    const c = s.campaign, stone = c.module.entities.find(e => e.space && /Cloudreach/.test(e.name))!;
    const before = PlayerView.observe(c), event = await s.leg(`travel:${stone.id}`);
    const passed = s.journeyed!.legs.find(l => /pedlar/.test(l.passed ?? ''))!;
    expect(passed).toBeDefined();
    const tell = (e: typeof event) => (Narrator.leaf(c, ScreenModel.build(c), { event: e,
      feedback: ActionFeedbackView.read(c, e, before), said: 'Set out', moved: true }).exchange?.lines ?? [])
      .map(l => l.text).join('\n');
    expect(tell(event)).toMatch(/pedlar/i);
    expect(tell(c.history.at(-1)!)).not.toMatch(/pedlar/i);
  }, 120000);
});
