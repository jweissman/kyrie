import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';

// The last sea-gate's claim made by someone with a stake in it (ST-03; mission-22/story-sheets.md): cold play 5 wound
// the gate shut at its 24th line, and the sawn pin's question had nobody to answer it. Played on from there: Ifan's
// boat comes up the cut against the shut gate, and the company decides what the gate is for.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean);
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
describe('the last sea-gate, shut', () => {
  it('brings Ifan\'s boat up the cut, and lets the company choose what the gate is for', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    let s: Said | undefined;
    for (const line of lines.slice(0, 24)) { s = said(await r.ask(line)); }
    expect(s!.scene.lines.join(' ')).toContain('Ifan Rhys at the pole');
    // Its two choices are in the four, about the boat under the gate (ST-03: they had been Ifan's, beside his talk,
    // reached only by talking to him).
    const four = s!.offer.primary.flatMap(o => [o, ...o.opens ?? []]), labels = four.map(o => o.label);
    expect(labels).toContain("Wind the gate up a tide's height and let Ifan's boat through");
    const back = four.find(o => /^Keep the gate shut, and tell Ifan/.test(o.label))!;
    const turned = said(await r.ask(JSON.stringify({ act: back.id })));
    expect(turned.scene.lines.join(' ')).toContain('the reeve');
    expect(c.world.test(ModuleWriter.call('gate__turnedBack', 'party'))).toBe(true);
    expect(c.world.test(ModuleWriter.call('gate__mended', 'party'))).toBe(true);
  }, 240000);
  // The collision (ST-03): shown the sawn pin, the reeve rides out to the gate herself, and the boat is let through in
  // front of her; she knows who, then, and goes back to the landing to say so.
  it('has the reeve at the gate when the boat comes, if she was shown the pin', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    for (const line of lines.slice(0, 23)) { said(await r.ask(line)); }
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('gate__reeveWarned', 'party') }]));
    const s = said(await r.ask(lines[23]!));
    expect(s.scene.lines.join(' ')).toContain('the reeve has ridden out to see the gate for herself');
    const four = s.offer.primary.flatMap(o => [o, ...o.opens ?? []]);
    const through = four.find(o => /^Wind the gate up a tide.s height/.test(o.label))!;
    expect(said(await r.ask(JSON.stringify({ act: through.id }))).scene.lines.join(' ')).toContain('So that is who');
    expect(c.world.test(ModuleWriter.call('gate__reeveSaw', 'party'))).toBe(true);
    expect(c.world.test(ModuleWriter.call('at', 'gate__reeve', 'region__s1_green'))).toBe(true);
  }, 240000);
  // ST-04: how Bran was got out reaches the gate. With Mardle shown up the smugglers have lost the man they paid, and
  // are at the gatehouse a day sooner (the second morning, not the third).
  it('hears of the gatehouse prowled a day sooner once Mardle is shown up', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drove__mardle_shown') }]));
    const told: string[] = [];
    for (let i = 0; i < 30 && !c.world.test(ModuleWriter.call('gate__prowled', 'party')); i++) {
      const wait = offered(r.said()).find(o => /^Wait an hour/.test(o.label))!;
      told.push(...said(await r.ask(JSON.stringify({ act: wait.id }))).scene.lines);
    }
    expect(told.join(' ')).toContain('a pry-bar has been left by the windlass');
  }, 240000);
});
