import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';

// The held drove's collision (Sprint 2, S2-5; ST-02, the owner's structural critique of 18 November): what was found
// against Mardle said before the reeve on the green, with Mardle and the customs-man there, rather than delivered to
// Mardle alone at his counter; and the ruling costs someone something. Cold play 4's first seven lines find the
// drowned four.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-4-lines.txt', 'utf8').split('\n').filter(Boolean);
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
const take = async (r: Runner, label: RegExp) => {
  const o = offered(r.said()).find(x => label.test(x.label));
  if (!o) { throw new Error(`not offered: ${label} (${offered(r.said()).map(x => x.label).join(' | ')})`); }
  return said(await r.ask(JSON.stringify({ act: o.id })));
};
// By his office where he has not been met (GR-20), by his name once his ink has been read at his counter.
const before = /^Call (Mardle|the customs clerk) out to the reeve, and say what you found before her/;
describe('what was found against Mardle, said before the reeve', () => {
  it('has each of the three answer the drowned four, Bran let out by her ruling and Mardle kept', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const holds = (f: string, ...a: string[]) => c.world.test(ModuleWriter.call(f, ...a));
    for (const line of lines.slice(0, 7)) { said(await r.ask(line)); }
    // The aim says both ways the proof can be said, and names the clerk by his office (CL-45).
    expect((r.said().aims ?? []).map(a => a.text)).toContain('Tell the customs clerk what you found, at his counter or '
      + 'before the reeve on the green, and have Bran let out.');
    await take(r, /^To the drove pens/);
    await take(r, /^To the landing at Porthalen/);
    // Mardle not met nor heard of: the act calls out the customs clerk, not a name the company has never heard.
    expect(offered(r.said()).map(o => o.label).filter(l => before.test(l)))
      .toEqual(['Call the customs clerk out to the reeve, and say what you found before her']);
    const told = (await take(r, before)).scene.lines.join(' ');
    expect(told).toContain('no drover is held here for beasts the sea took');
    expect(told).toContain('will not look at you');
    expect([holds('drove__freed', 'party'), holds('knows', 'party', 'drove__reeve_ruled'),
      holds('drove__turned', 'drove__clerk')]).toEqual([true, true, false]);
    // She heard it herself: she is not told it again as news, and the landing says what the ruling changed.
    await take(r, /^Talk to Reeve Annis Talfryn/);
    expect(offered(r.said()).map(o => o.label)).not.toContain('Tell the reeve how Mardle counts the droves');
    // Her leave taken, the landing's ways are offered (the talk's question offers what is said to her: OR-1451).
    await take(r, /^Take your leave/);
    await take(r, /^Into the Stone Horn/);
    expect((await take(r, /what the waterfront is saying/)).scene.lines.join(' ')).toContain('count the next drove');
  }, 240000);
  it('with the ink, has the customs-man take a side and Mardle turned out', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    // The ink read at the counter (a check of insight), set as read: what is asked here is what follows.
    const w = c as unknown as { world: { apply(c: unknown[]): unknown }; commit(w: unknown): void };
    w.commit(w.world.apply([{ kind: 'assert', call: ModuleWriter.call('knows', 'party', 'drove__altered') }]));
    const told = (await take(r, before)).scene.lines.join(' ');
    expect(told).toContain('Thirty-six. He told me I had it wrong.');
    expect(told).toContain('I have three children.');
    expect([c.world.test(ModuleWriter.call('drove__turned', 'drove__clerk')),
      c.world.test(ModuleWriter.call('knows', 'party', 'drove__mardle_shown'))]).toEqual([true, true]);
  }, 240000);
});
