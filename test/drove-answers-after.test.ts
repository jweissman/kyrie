import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { RunnerFind } from './support/runner-find';
import { ModuleWriter } from '../src/lang/module-writer';

// The held drove's still-open answers (doc/design/drove-response-audit.md; CL-32), test/drove-answers' sibling: the
// reeve, after a quiet settlement at the counter, says what she has heard to the one who did it, until told how; the
// customs-man who looked in the Rhyne is at the pens, getting the four out, once; Bran says what Mardle's family's
// handcart was to him, once; and Owain goes on with his day on the landing, something else at each return by the
// clock.
class After {
  static async start() {
    const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    return { journey, r: new Runner(journey.session) };
  }
  static async act(r: Runner, act: string): Promise<string> {
    const s = await r.ask(JSON.stringify({ act })) as Said | { error: string };
    if ('error' in s) { throw new Error(`${act}: ${s.error}`); }
    return After.text(s);
  }
  static text(s: Said): string { return s.scene.lines.join(' ').replace(/[‘’]/g, "'"); }
  static async take(r: Runner, label: RegExp): Promise<string> {
    return After.text(await RunnerFind.act(r, r.said(), label));
  }
  // The four found and shown to Mardle at his counter: Bran out, the quiet way.
  static async quiet(r: Runner) {
    for (const act of ['drove__owain_count_t', 'go(drove__pens_gate,drove__pens)', 'go(drove__rhyne_bank,drove__rhyne)',
      'search(drove__rhyne)', 'travel:drove__customs', 'drove__show_drowned(party,drove__customs)']) { await After.act(r, act); }
  }
}
describe('the held drove, answering after', () => {
  it('has the customs-man at the pens once, the reeve say what she heard until told, and Owain go on by the clock',
    async () => {
      const { r, journey } = await After.start();
      await After.quiet(r);
      await After.act(r, 'go(drove__customs_door,region__s1_green)');
      const pens = await After.act(r, 'go(drove__pens_gate,drove__pens)');
      expect(pens).toContain('The customs-man who went out to the Rhyne is at the pens with a rope and a horse.');
      // Back on the landing in the morning: Owain at his halter, the second return.
      const second = await After.act(r, 'go(drove__pens_gate,region__s1_green)');
      expect(second).toContain('Owain sits on the edge of the trough, mending a halter');
      const reeve = await After.act(r, 'gate__reeve#talk');
      expect(reeve).toContain("'Mardle says his count was wrong. He did not say how you knew.'");
      expect(await After.take(r, /Tell the reeve how Mardle counts the droves/)).toContain('Third drove this year');
      await After.take(r, /^Take your leave/);
      expect(await After.act(r, 'gate__reeve#talk')).not.toContain('He did not say how you knew');
      await After.take(r, /^Take your leave/);
      // Away at the pens until after noon, and until dusk, and back: something else each time.
      const hour = () => journey.session.campaign.world.number(ModuleWriter.call('hour', 'clock'));
      const back = async (until: number) => {
        await After.act(r, 'go(drove__pens_gate,drove__pens)');
        while (hour() < until) { await After.take(r, /^Wait an hour/); }
        return After.act(r, 'go(drove__pens_gate,region__s1_green)');
      };
      expect(await back(12)).toContain('Owain is asleep against the pens\' gate, his cloak');
      expect(await back(18)).toContain('Owain stands at the inn door');
      // And the customs-man not again at the pens.
      expect(await After.act(r, 'go(drove__pens_gate,drove__pens)')).not.toContain('with a rope and a horse');
    }, 240000);
  it('has Bran say what Mardle\'s family\'s handcart was to him, once, when the ink turned Mardle out', async () => {
    const { r, journey } = await After.start();
    const c = journey.session.campaign as unknown as
      { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    await After.take(r, /^To the customs-house/);
    await After.take(r, /^Ask Mardle how many head crossed/);
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drove__altered') }]));
    await After.take(r, /^Tell Mardle you saw what is under the forty/);
    expect(await After.act(r, 'go(drove__customs_door,region__s1_green)')).toContain('loading a handcart');
    await After.act(r, 'go(drove__pens_gate,drove__pens)');
    const cart = await After.take(r, /Ask Bran about the handcart on the quay/);
    expect(cart).toContain("'I wanted him gone. Not like that.'");
    const offered = [...r.said().offer.primary, ...r.said().offer.rest];
    expect(offered.some(o => /handcart/.test(o.label))).toBe(false);
  }, 240000);
});
