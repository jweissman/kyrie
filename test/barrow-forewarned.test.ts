import { RunnerFind } from './support/runner-find';
import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { Campaign } from '../src/campaign/campaign';

// One preparation that changes the descent (Sprint 2, S2-4; mission-22/beat-map.md: the warrior's preparation changed
// nothing): asked in the taproom before setting out (what the matter is, and then the barrow: OR-423), the
// innkeeper's grandmother's saying names what the barrow's king cannot abide, which only the embalmers' words far down
// had said, so the company knows to look for the jar of day.
// Known, it is an aim toward the embalmers' room until the jar is carried; carried, the king goes back from it into the
// deep grave and the crown is had with no fight. Not asked, nothing leads to the jar, and the king rises to fight.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
const jar = 'Find the jar of day the embalmers kept, on the way down to the king.';
class Barrow {
  static async begin() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    return { r: new Runner(journey.session), c: journey.session.campaign };
  }
  // As a player finds it: offered, or under a talk, a lens or the pack (an equipping is the pack's: CL-67).
  static async take(r: Runner, label: RegExp): Promise<Said> {
    const { o } = await RunnerFind.find(r, r.said() as Said, label);
    if (!o) { throw new Error(`not offered: ${label} (${offered(r.said()).map(x => x.label).join(' | ')})`); }
    return said(await r.ask(JSON.stringify({ act: o.id })));
  }
  // Puts the company in a room of the barrow by light, with whoever keeps it gone but its keeper: a test of what the
  // forewarning changes there, not of the halls' fights on the way down.
  static enter(c: Campaign, room: string) {
    const here = c.world.related('at').filter(x => x.args[1] === room && x.args[0] !== 'party'
      && !/_keeper/.test(x.args[0]!) && c.module.entities.some(e => e.id === x.args[0] && e.type === 'group'));
    const w = c as unknown as { world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    w.commit(w.world.apply([...here.map(x => ({ kind: 'retract' as const, call: ModuleWriter.call('at', ...x.args) })),
      { kind: 'retract', call: ModuleWriter.call('unlit', room) },
      { kind: 'assert', call: ModuleWriter.call('at', 'party', room) }]));
  }
  static aims(r: Runner): string[] { return (r.said().aims ?? []).map(a => a.text); }
}
describe('the king-barrow, asked about before setting out', () => {
  it('is told what its king cannot abide, and the company knows it', async () => {
    const { r, c } = await Barrow.begin();
    await Barrow.take(r, /^Into the Stone Horn/);
    await Barrow.take(r, /what the matter is/);
    expect(Barrow.aims(r)).not.toContain(jar);
    // The saying asked after, by one the innkeeper has told of the barrow (OR-370: the bane's aim is uncovered by
    // asking further, not given with the first answer).
    said(await r.ask(JSON.stringify({ act: 'region__w8_rumour' })));
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__w8_bane'))).toBe(false);
    const told = said(await r.ask(JSON.stringify({ act: 'region__w8_saying' }))).scene.lines.join(' ');
    expect(told).toContain('cannot abide the light of day');
    expect(c.world.test(ModuleWriter.call('knows', 'party', 'region__w8_bane'))).toBe(true);
    expect(Barrow.aims(r)).toContain(jar);
  }, 240000);
  it('leads to the jar below, and with it carried the king gives the crown up without a fight', async () => {
    const { r, c } = await Barrow.begin();
    await Barrow.take(r, /^Into the Stone Horn/);
    await Barrow.take(r, /what the matter is/);
    said(await r.ask(JSON.stringify({ act: 'region__w8_rumour' })));
    said(await r.ask(JSON.stringify({ act: 'region__w8_saying' })));
    Barrow.enter(c, 'region__w8_halls_embalmers');
    said(await r.ask(JSON.stringify({ look: true })));
    await Barrow.take(r, /^Collect a jar of noonlight/);
    expect(Barrow.aims(r)).not.toContain(jar);
    await Barrow.take(r, /^Equip a jar of noonlight/);
    Barrow.enter(c, 'region__w8_grave_antechamber');
    said(await r.ask(JSON.stringify({ look: true })));
    const hall = await Barrow.take(r, /^To the king's hall$/);
    expect(hall.scene.lines.join(' ')).toContain('goes back from it, step by step, into the deep grave');
    expect(offered(r.said()).map(o => o.label)).toContain('Collect the crown of the first king for Wenna');
  }, 240000);
  it('not asked about, leads nowhere near the jar, and the king rises against the company', async () => {
    const { r, c } = await Barrow.begin();
    expect(Barrow.aims(r)).not.toContain(jar);
    Barrow.enter(c, 'region__w8_grave_antechamber');
    said(await r.ask(JSON.stringify({ look: true })));
    const hall = await Barrow.take(r, /^To the king's hall$/);
    expect(hall.scene.lines.join(' ')).not.toContain('goes back from it');
    expect(hall.scene.lines.join(' ')).toContain('The king sits up on his bier');
    expect(offered(r.said()).map(o => o.label)).not.toContain('Collect the crown of the first king for Wenna');
  }, 240000);
  // CB-15: the clue has its use before the blows. Carried and not readied, the jar is offered to ready in the hall
  // while the king sits up, and readied there, he goes back from it; it is not among a fight's acts once one is begun.
  it('readied in the king\'s hall as he sits up, sends him back before any blow', async () => {
    const { r, c } = await Barrow.begin();
    Barrow.enter(c, 'region__w8_halls_embalmers');
    said(await r.ask(JSON.stringify({ look: true })));
    await Barrow.take(r, /^Collect a jar of noonlight/);
    Barrow.enter(c, 'region__w8_grave_antechamber');
    said(await r.ask(JSON.stringify({ look: true })));
    expect((await Barrow.take(r, /^To the king's hall$/)).scene.lines.join(' ')).toContain('The king sits up on his bier');
    const readied = await Barrow.take(r, /^Equip a jar of noonlight/);
    expect(readied.scene.lines.join(' ')).toContain('goes back from it, step by step, into the deep grave');
    expect(offered(r.said()).map(o => o.label)).toContain('Collect the crown of the first king for Wenna');
  }, 240000);
});
