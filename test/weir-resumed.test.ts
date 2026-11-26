import { describe, expect, it } from 'bun:test';
import { RunnerFind } from './support/runner-find';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import { Digest } from '../src/session/digest';
import { PlaySession } from '../src/session/play-session';

// The weir life's return, kept and taken up again (Sprint 3, S3-5; test/drove-resumed's twin for the mage): cold play
// 5's first lines find the sawn pin and hire Gesk at Gatesend. The company rides to Porthalen and shows the reeve the
// pin; the game is kept and taken up in a fresh session, as a page reloaded would; the gate is wound shut with the
// reeve come out to see it, Ifan's boat let through in front of her, and she knows who. Kept and taken up once more,
// the landing still holds it against the company.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean);
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
const take = async (r: Runner, label: RegExp) => {
  const o = offered(r.said()).find(x => label.test(x.label));
  if (!o) { throw new Error(`not offered: ${label} (${offered(r.said()).map(x => x.label).join(' | ')})`); }
  return said(await r.ask(JSON.stringify({ act: o.id })));
};
// A journey's legs, each an act of its own, until the company stands where it set out for.
const reach = async (r: Runner, town: string, at: string) => {
  for (let leg = 0; leg < 4 && r.session.campaign.world.one('at', 'party') !== at; leg++) {
    said(await r.ask(JSON.stringify({ act: `travel:${town}` })));
  }
  expect(r.session.campaign.world.one('at', 'party')).toBe(at);
};
const kept = (s: PlaySession) => {
  const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())));
  expect(Digest.of(again.campaign)).toBe(Digest.of(s.campaign));
  return again;
};
describe('the weir life, kept and taken up again', () => {
  it('keeps the reeve warned, the gate shut and the boat she saw, and the landing still answers it', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(journey.session);
    for (const line of lines.slice(0, 21)) { said(await r.ask(line)); }
    await take(r, /^Out to the gate-yard/);
    await reach(r, 'region__s1', 'region__s1_green');
    await take(r, /^Talk to Reeve Annis Talfryn/);
    expect(said(await take(r, /^Show the reeve the pawl's sawn pin/)).scene.lines.join(' ')).toContain('Sawn');
    // Kept with the reeve warned, before the gate is wound.
    const on = new Runner(kept(journey.session)), c = () => on.session.campaign;
    const holds = (f: string) => c().world.test(ModuleWriter.call(f, 'party'));
    expect(holds('gate__reeveWarned')).toBe(true);
    await reach(on, 'region__s4', 'region__s4_green');
    await take(on, /^To the Wardens' gatehouse/);
    let told = '';
    for (let tries = 0; tries < 5 && !holds('gate__mended'); tries++) {
      told = (await take(on, /wind the sea-gate shut/)).scene.lines.join(' ');
    }
    expect(told).toContain('the reeve has ridden out to see the gate for herself');
    expect(said(await take(on, /^Wind the gate up a tide.s height/)).scene.lines.join(' ')).toContain('So that is who');
    // Kept once more: what she saw is the world's, and Porthalen's reeve says so to the company.
    const last = new Runner(kept(on.session)), w = last.session.campaign.world;
    expect(['gate__mended', 'gate__letThrough', 'gate__reeveSaw'].map(f => w.test(ModuleWriter.call(f, 'party'))))
      .toEqual([true, true, true]);
    expect(w.one('at', 'gate__reeve')).toBe('region__s1_green');
    said(await last.ask(JSON.stringify({ act: 'travel:region__s4_green' })));
    await reach(last, 'region__s1', 'region__s1_green');
    // Her question found under her talk, as a player turns to her (MT-18: her talk is led for the sea-gate's news).
    expect((await RunnerFind.act(last, last.said(), /^Ask the reeve about Ifan Rhys's boat/)).scene.lines.join(' '))
      .toContain('for a smuggler');
  }, 240000);
});
