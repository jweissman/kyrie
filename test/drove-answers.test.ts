import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';

// The held drove answers what was done (the defect-centres review's Centre 2; doc/design/drove-response-audit.md),
// through the runner as a player plays it: the four found, Owain told, the count settled with Mardle, Bran out and
// saying how, the landing remembering on the way back. Each answer once, where it belongs; and who knew what the
// company did is answerable from the transcript alone.
class Drove {
  static async start() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    return new Runner(journey.session);
  }
  static async act(r: Runner, act: string): Promise<string> {
    const s = await r.ask(JSON.stringify({ act })) as Said | { error: string };
    if ('error' in s) { throw new Error(`${act}: ${s.error}`); }
    return s.scene.lines.join(' ').replace(/[‘’]/g, "'");
  }
}
describe('the held drove, answering', () => {
  it('has Owain told, Bran say how he came out, and the landing remember, each once', async () => {
    const r = await Drove.start(), told: string[] = [];
    for (const act of ['drove__owain_count_t', 'go(drove__pens_gate,drove__pens)', 'go(drove__rhyne_bank,drove__rhyne)',
      'search(drove__rhyne)', 'go(drove__rhyne_bank,drove__pens)']) { told.push(await Drove.act(r, act)); }
    // Owain, told where he minds the drove: his face, and the first thanks.
    const owain = await Drove.act(r, 'drove__owain_found');
    expect(owain).toContain("'All four,' he says. Then, not looking at you: 'Thanks. I couldn't go in there.'");
    told.push(owain);
    told.push(await Drove.act(r, 'travel:drove__customs'));
    // Bran out by the four found: he says so, before his thanks and the pass.
    const out = await Drove.act(r, 'drove__show_drowned(party,drove__customs)');
    expect(out).toContain("'You found them in the Rhyne,' says Bran. 'Nobody else looked.'");
    expect(out.indexOf('Nobody else looked')).toBeLessThan(out.indexOf('Say Bran ap Ifor sent you'));
    expect(out).not.toMatch(/Twelve crowns of yours|read his ink/);
    told.push(out);
    // The landing, coming back: Owain telling it to drovers off a boat.
    const back = await Drove.act(r, 'go(drove__customs_door,region__s1_green)');
    expect(back).toContain("Owain is telling two drovers off the Wrackham boat about the Rhyne. He sees you and stops. 'That's who,'");
    told.push(back);
    // Once each: not again on going out and coming back.
    await Drove.act(r, 'go(drove__pens_gate,drove__pens)');
    told.push(await Drove.act(r, 'go(drove__pens_gate,region__s1_green)'));
    const all = told.join(' ');
    for (const line of ["I couldn't go in there", 'Nobody else looked', "'That's who,'"]) {
      expect(all.split(line).length - 1).toBe(1);
    }
    // Who knew: Owain (told), Bran (said it), the drovers on the landing (Owain told them), from the words alone.
    expect([/Owain.s face goes still/, /You found them in the Rhyne/, /telling two drovers/].every(re => re.test(all)))
      .toBe(true);
  }, 180000);
});
