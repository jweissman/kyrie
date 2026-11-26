import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import type { Change } from '../src/lang/module';
import type { CreatureStore } from '../src/creature-store';
import { RunnerFind } from './support/runner-find';

// The held drove answers what was done (the defect-centres review's Centre 2; doc/design/drove-response-audit.md),
// through the runner as a player plays it: the four found, Owain told, the count settled with Mardle, Bran out and
// saying how, the landing remembering on the way back. Each answer once, where it belongs; and who knew what the
// company did is answerable from the transcript alone.
class Drove {
  static async start() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    return new Runner(journey.session);
  }
  // As a player meets it: the started game, its runner, and its roll forced where a check decides the path.
  static async begin() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    return { journey, r: new Runner(journey.session) };
  }
  static text(s: Said): string { return s.scene.lines.join(' ').replace(/[‘’]/g, "'"); }
  static async take(r: Runner, label: RegExp): Promise<string> {
    return Drove.text(await RunnerFind.act(r, r.said(), label));
  }
  // Twelve crowns in the purse, as a company that had earned them would have.
  // The coin a company carries is its members' (the world's quantity is read from them), so the purse is theirs.
  static purse(r: Runner) {
    const c = r.session.campaign as unknown as { creatures: CreatureStore; state: { partyIds: string[] };
      world: { apply(c: Change[]): unknown }; commit(w: unknown): void };
    const lease = c.creatures.acquire(c.state.partyIds);
    try { lease.creatures[0]!.state.gold += 14; lease.commit(lease.creatures); } finally { lease.release(); }
    c.commit(c.world.apply([{ kind: 'set', call: ModuleWriter.call('quantity', 'party', 'gold'),
      value: ModuleWriter.number(20) }]));
  }
  // Out of the customs-house and back onto the landing, where Owain tells it.
  static async back(r: Runner): Promise<string> { return Drove.take(r, /^To the landing at Porthalen/); }
  static once(all: string, line: string) { expect(all.split(line).length - 1).toBe(1); }
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
    expect(back).toContain('Owain is telling two drovers off the Wrackham boat about the Rhyne, and stops when he sees you: '
      + "'That's who.'");
    told.push(back);
    // Once each: not again on going out and coming back.
    await Drove.act(r, 'go(drove__pens_gate,drove__pens)');
    told.push(await Drove.act(r, 'go(drove__pens_gate,region__s1_green)'));
    const all = told.join(' ');
    for (const line of ["I couldn't go in there", 'Nobody else looked', "'That's who.'"]) {
      expect(all.split(line).length - 1).toBe(1);
    }
    // Who knew: Owain (told), Bran (said it), the drovers on the landing (Owain told them), from the words alone.
    expect([/Owain.s face goes still/, /You found them in the Rhyne/, /telling two drovers/].every(re => re.test(all)))
      .toBe(true);
  }, 180000);
  it('has Bran say the ink was read, and the landing tell it, when Mardle is shown up at his counter', async () => {
    const { journey, r } = await Drove.begin(), told: string[] = [];
    told.push(await Drove.take(r, /^To the customs-house/));
    told.push(await Drove.take(r, /^Ask Mardle how many head crossed/));
    journey.roll('pass');
    told.push(await Drove.take(r, /^Look closely at the ink on Bran's line/));
    journey.roll();
    const out = await Drove.take(r, /^Tell Mardle you saw what is under the forty/);
    expect(out).toContain("'You read his ink,' says Bran, and looks back at the counter. 'Good.'");
    expect(out).not.toMatch(/Nobody else looked|Twelve crowns of yours|paid him all the same/);
    told.push(out, await Drove.back(r));
    const all = told.join(' ');
    expect(all).toContain("Owain is telling two drovers off the Wrackham boat how you read Mardle's ink: 'In front of him, too.'");
    for (const line of ["'You read his ink,'", "how you read Mardle's ink"]) { Drove.once(all, line); }
  }, 180000);
  it('has Bran remember the crowns paid, and the landing tell it', async () => {
    const { r } = await Drove.begin(), told: string[] = [];
    told.push(await Drove.take(r, /^To the customs-house/));
    Drove.purse(r);
    const out = await Drove.take(r, /pay Mardle the twelve crowns/i);
    expect(out).toContain("'Twelve crowns of yours,' says Bran. 'I won't forget it.'");
    expect(out).not.toMatch(/Nobody else looked|read his ink|paid him all the same/);
    told.push(out, await Drove.back(r));
    const all = told.join(' ');
    expect(all).toContain("Owain is telling two drovers off the Wrackham boat that you paid Mardle's twelve crowns: "
      + "'Out of your own purse.'");
    for (const line of ["'Twelve crowns of yours,'", "that you paid Mardle's twelve crowns"]) { Drove.once(all, line); }
  }, 180000);
  it('has Bran say, not kindly, that the crowns were paid by one who knew where the four lay', async () => {
    const r = await Drove.start(), told: string[] = [];
    for (const act of ['drove__owain_count_t', 'go(drove__pens_gate,drove__pens)', 'go(drove__rhyne_bank,drove__rhyne)',
      'search(drove__rhyne)']) { told.push(await Drove.act(r, act)); }
    told.push(await Drove.act(r, 'travel:drove__customs'));
    Drove.purse(r);
    const out = await Drove.take(r, /pay Mardle the twelve crowns/i);
    expect(out).toContain("'You knew where they lay,' says Bran, 'and you paid him all the same.' He does not say it kindly.");
    expect(out).not.toMatch(/Nobody else looked|Twelve crowns of yours|read his ink/);
    told.push(out, await Drove.back(r));
    const all = told.join(' ');
    expect(all).toContain("that you paid Mardle's twelve crowns");
    for (const line of ['paid him all the same', "that you paid Mardle's twelve crowns"]) { Drove.once(all, line); }
  }, 180000);
});
