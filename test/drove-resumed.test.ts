import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';
import { Digest } from '../src/session/digest';
import { PlaySession } from '../src/session/play-session';

// The drove life's consequence kept through a save (Sprint 2, S2-5: "pinned through save and resume"; planning-report
// §7's acceptance, "a replay and resumed checkpoint preserve the consequence"). Cold play 4's first twelve lines let
// Bran out by the drowned four; the drove is sold with him; then the game is kept and taken up again in a fresh
// session, as a page reloaded would, and what was done is still what the world answers: the coin, the drove gone,
// Bran's road west and the landing's word of it.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-4-lines.txt', 'utf8').split('\n').filter(Boolean);
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
const take = async (r: Runner, label: RegExp) => {
  const o = offered(r.said()).find(x => label.test(x.label));
  if (!o) { throw new Error(`not offered: ${label} (${offered(r.said()).map(x => x.label).join(' | ')})`); }
  return said(await r.ask(JSON.stringify({ act: o.id })));
};
describe('the drove life, kept and taken up again', () => {
  it('keeps Bran out, the drove sold and his share paid, and the world still answers it', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session);
    for (const line of lines.slice(0, 12)) { said(await r.ask(line)); }
    await take(r, /^To the drove pens/);
    await take(r, /^Help Bran take the drove to the sales/);
    const kept = JSON.parse(JSON.stringify(journey.session.checkpoint())), was = journey.session.campaign;
    const again = PlaySession.resume(kept), c = again.campaign;
    const holds = (f: string) => c.world.test(ModuleWriter.call(f, 'party'));
    expect(Digest.of(c)).toBe(Digest.of(was));
    expect(['drove__freed', 'drove__sold', 'drove__paid'].map(holds)).toEqual([true, true, true]);
    const coin = (x: typeof c) => x.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    expect(coin(c)).toBe(coin(was));
    // Taken up again, what follows from it is still offered and still said: Bran's talk, open on the sale before the
    // save, is a view's and not the world's, so it is opened again.
    const on = new Runner(again);
    await take(on, /^Talk to Bran ap Ifor/);
    expect(said(await take(on, /^Ask Bran about the work in Brynach/)).scene.lines.join(' ')).toContain('The old road west');
    await take(on, /^To the landing at Porthalen/);
    await take(on, /^Into the Stone Horn/);
    const heard = said(await take(on, /what the waterfront is saying/)).scene.lines.join(' ');
    expect(heard).toContain('got the Brynach drover out');
    // Bran was let out by the drowned four, not the ink: Mardle kept his counter, and the landing says so.
    expect(heard).toContain('Nobody here would cross him');
  }, 240000);
});
