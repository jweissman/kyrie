import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { AsMeant } from './support/as-meant';
import { BeforeRooms } from './support/before-rooms';
import { GeneratedWorld } from './support/generated';
import { RunnerFind } from './support/runner-find';
import type { PlaySession } from '../src/session/play-session';

// The sea-gate answers what was done there (CL-32's own clauses; doc/design/sea-gate-response-audit.md): cold play
// 5's elf mage on the weir route, by her own lines to the gate shut and Ifan Rhys's boat come up under it. Nest greets
// the one who shut it; what is done about the boat is answered three ways, by the reeve, by Ifan and by Nest; and back
// at Porthalen, what the reeve did not see is the company's to tell her, or keep.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean);
const cutter = 'Find out who sawed through the pawl\'s pin, and why they want the sea-gate open.';
const text = (s: Said) => s.scene.lines.join(' ').replace(/[‘’]/g, "'");
class Gate {
  // The play's own lines to the gate shut, the boat under it and the company back on the gate-yard.
  static async shut() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(BeforeRooms.set(journey.session));
    await AsMeant.play(r, lines.slice(0, 25));
    return { r, session: journey.session, c: journey.session.campaign };
  }
  static async act(r: Runner, label: RegExp): Promise<string> { return text(await RunnerFind.act(r, r.said(), label)); }
  // Walked to a place as GeneratedWorld walks, and what was told on the way.
  static async walk(session: PlaySession, place: string): Promise<string> {
    const c = session.campaign, from = c.history.length;
    await GeneratedWorld.travel(session, place);
    return c.history.slice(from).flatMap(h => [...(h.perceptions ?? []).map(p => p.text), h.response ?? ''])
      .join(' ').replace(/[‘’]/g, "'");
  }
}
describe('the sea-gate answers what was done there', () => {
  it('turned back, the boat is answered by Ifan and Nest, and named to the reeve it is answered again', async () => {
    const { r, session, c } = await Gate.shut();
    // Nest, turned to after the gate is shut, is not "Still here" (cold play 5's 7).
    expect(await Gate.act(r, /^Talk to Nest$/)).toContain("'Well,' she says, and waits for you to say it");
    expect(await Gate.act(r, /^Tell Nest the sea-gate shuts/)).toContain('I heard it stop');
    await GeneratedWorld.travel(session, 'gate__gatehouse');
    expect(await Gate.act(r, /^Keep the gate shut, and tell Ifan/)).toContain('my children don\'t');
    // The cutter met and answered, the question of who sawed the pin is not left standing as an aim.
    expect(r.said().aims?.map(a => a.text)).not.toContain(cutter);
    expect(await Gate.walk(session, 's4_green')).toContain('Ifan Rhys\'s door is shut');
    expect(await Gate.act(r, /^Tell Nest about Ifan Rhys's boat/)).toContain('It will be a long winter on this lane');
    // The new choice after the return: the reeve did not see it, and is told who it is.
    await GeneratedWorld.travel(session, 's1_green');
    expect(await Gate.act(r, /^Tell the reeve it is Ifan Rhys's boat/)).toContain('You will not be thanked for this on the lane');
    expect(c.world.test({ kind: 'call', name: 'gate__named', args: ['party'] } as never)).toBe(true);
    const lane = await Gate.walk(session, 's4_green');
    expect(lane).toContain('with the reeve\'s chalk on its bow');
    expect(lane).not.toContain('Ifan Rhys\'s door is shut');
    expect(await Gate.act(r, /^Tell Nest about Ifan Rhys's boat/)).toContain('I\'d not have done it from outside');
  }, 300000);
  it('let through, Ifan nods, Nest has her flour, and the reeve told after hears half of it', async () => {
    const { r, session } = await Gate.shut();
    await GeneratedWorld.travel(session, 'gate__gatehouse');
    expect(await Gate.act(r, /^Wind the gate up a tide's height/)).toContain('Nobody else sees it');
    expect(await Gate.walk(session, 's4_green')).toContain('as one eel-man to another');
    expect(await Gate.act(r, /^Tell Nest about Ifan Rhys's boat/)).toContain('a sack of flour');
    await GeneratedWorld.travel(session, 's1_green');
    expect(await Gate.act(r, /^Tell the reeve it is Ifan Rhys's boat/)).toContain('Do not bring me half of a thing again');
  }, 300000);
});
