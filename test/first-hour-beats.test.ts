import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { Narrator } from '../src/presentation/narrator';
import { ScreenModel } from '../src/ui/screen-model';

// The first hour's first beats on the drove road (doc/design/first-hour-beats.md), through the runner as a player
// plays it. 0–30 s, the image and the wrong: the first turn tells only the incident (Bran taken, the stick at your
// feet, Owain) and leads only with what answers it; the town's notices, salter, boat-builder, tinker and pump are the
// second turn's (cold play 9's first turn had 27 lines and led with the tinker's daughter). 2–5 min, something not
// right in this town: the dogs turning to the hill and four notes from the stones, seen happen once on the green in
// the company's first minutes, with one row toward it and nothing explained.
class Road {
  static async start() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    return { r: new Runner(journey.session), c: journey.session.campaign };
  }
  static said(x: Said | { error: string }): Said { if ('error' in x) { throw new Error(x.error); } return x; }
  static async act(r: Runner, act: string): Promise<Said> { return Road.said(await r.ask(JSON.stringify({ act }))); }
  static text(s: Said): string { return s.scene.lines.join(' ').replace(/[‘’]/g, "'"); }
  static labels(s: Said): string[] { return [...s.offer.primary, ...s.offer.rest].map(o => o.label); }
  static readonly town = /salter|notice is nailed|caulking|tinker has set|Hesper Lowe|every dog/i;
}
describe('the drove road\'s first turn', () => {
  it('tells only the incident, in six lines at most, and leads with the stick, Owain and the customs-house', async () => {
    const { r, c } = await Road.start();
    const first = r.said();
    expect(first.scene.lines.length).toBeLessThanOrEqual(6);
    expect(Road.text(first)).toContain('They counted, and they took Bran.');
    expect(Road.text(first)).toContain('tally-stick');
    expect(Road.text(first)).not.toMatch(Road.town);
    expect(first.offer.primary.map(o => o.id).toSorted()).toEqual(['drove__owain#talk', 'exit:drove__customs',
      'follow:drove__held_aim', 'origin__stick#look']);
    // The page's own telling of the place (its setting) is the charge's too; the rest of the green is held for a look.
    const glanced = Narrator.leaf(c, ScreenModel.build(c)).glanced!;
    expect([...glanced.situation, ...glanced.presence].join(' ')).not.toMatch(Road.town);
    expect(glanced.situation.length + glanced.presence.length).toBeLessThanOrEqual(6);
    expect(glanced.held.join(' ')).toMatch(/salter/);
    // And the second turn is the place's again.
    expect(Road.text(await Road.act(r, 'drove__owain#talk'))).toMatch(/salter/);
  }, 120000);
});
describe('something not right in Porthalen', () => {
  it('is seen once in the first minutes on the green, with one row toward it, unexplained', async () => {
    const { r } = await Road.start();
    await Road.act(r, 'drove__owain#talk');
    await Road.act(r, 'exit:drove__pens');
    const back = await Road.act(r, 'exit:region__s1_green');
    expect(Road.text(back)).toContain('Every dog on the green lifts its head at once. They all look toward the hill');
    expect(Road.text(back)).toContain('four notes, three down and one up');
    expect(Road.labels(back)).toContain('Look up at the hill');
    const looked = await Road.act(r, 'company/0:Look up at the hill');
    expect(Road.text(looked)).toContain('a ring of old stones. Nothing moves there.');
    expect(Road.text(looked)).not.toMatch(/wind|draught|passage|Every dog/);
    expect(Road.labels(looked)).not.toContain('Look up at the hill');
    // Once: gone from the green when the company has left it, and not seen again on coming back.
    await Road.act(r, 'exit:drove__pens');
    expect(Road.text(await Road.act(r, 'exit:region__s1_green'))).not.toContain('Every dog on the green');
  }, 120000);
});
