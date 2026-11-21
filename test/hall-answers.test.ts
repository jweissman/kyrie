import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { AsMeant } from './support/as-meant';
import { BeforeRooms } from './support/before-rooms';

// Cold play 5's 30, 34, 36, 37 and 41 at the Hall (CL-32; doc/design/hall-response-audit.md), on the weir's mage's
// own lines: the cook pays the eight coin and the pie (test/iscoed-cold-five); put out for the music box, the cook
// takes it back to its shelf; and the steward it was taken from, the next time the company is in his hall, has
// counted it back, once.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-5-lines.txt', 'utf8').split('\n').filter(Boolean);
const text = (s: Said) => s.scene.lines.join(' ').replace(/[‘’]/g, "'");
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
describe('the Hall, after the music box', () => {
  it('has the steward count it back once it is returned, and say it once', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(BeforeRooms.set(journey.session));
    await AsMeant.play(r, lines.slice(0, 76));
    said(await r.ask(JSON.stringify({ act: 'region__s4_manor_cook_ratsdone' })));
    await AsMeant.play(r, lines.slice(77, 88));
    said(await r.ask(JSON.stringify({ act: 'talk_to(region__s4_manor_cook)' })));
    expect(text(said(await r.ask(JSON.stringify({ act: 'region__s4_manor_cook_amends' }))))).toContain('The front door is open');
    said(await r.ask(JSON.stringify({ act: 'go(region__s4_manor_kdoor,region__s4_manor_front)' })));
    const hall = said(await r.ask(JSON.stringify({ act: 'go(region__s4_manor_door,region__s4_manor_hall)' })));
    expect(text(hall)).toContain("'Fourteen spoons,' he says, 'and the box. We will say no more about it.'");
    expect(text(said(await r.ask('{"look":true}')))).not.toContain('Fourteen spoons');
  }, 240000);
  // Its 34: put out of the house, the kitchen is still open, and the cook says so, unsmiling, and why; its 37 and 41:
  // Wimble says only that there was a bell, and nothing is noted of his tune until the chime is struck by one who heard
  // him hum it in the kitchen; and the chime, so struck, is his tune.
  it('is put out, and the cook says so; and Wimble\'s tune is the chime only once it is struck', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'elf/mage/Ilse/scholar']));
    const r = new Runner(BeforeRooms.set(journey.session)), c = journey.session.campaign;
    const tune = () => c.world.test({ kind: 'call', name: 'knows', args: ['party', 'region__s4_boy_tune'] } as never);
    const heard = await AsMeant.play(r, lines.slice(0, 67));
    expect(text(heard.at(-1) as Said)).toContain("'There was a bell,' he says.");
    expect(tune()).toBe(false);
    const put = await AsMeant.play(r, lines.slice(67, 88));
    expect(text(put.at(-1) as Said)).toContain("'The steward says you are put out of the house. The steward does not come in my kitchen.'");
    const struck = await AsMeant.play(r, lines.slice(88, 95));
    expect(text(struck.at(-1) as Said)).toContain('it is the tune the kitchen boy hums at the Hall');
    expect(tune()).toBe(true);
  }, 300000);
});
