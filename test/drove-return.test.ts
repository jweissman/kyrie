import { describe, expect, it } from 'bun:test';
import { RunnerFind } from './support/runner-find';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ModuleWriter } from '../src/lang/module-writer';

// The golden route's return beat for the drove life (Sprint 2, S2-5; mission-22/beat-map.md): cold play 4 freed Bran
// at its twelfth line, and then the drove dropped out of the story, the landing knew nothing of it, and the road west
// was a line said once. Played on from there by the labels the runner offers, as a player would.
const lines = readFileSync('doc/architecture/mission-22/cold/cold-4-lines.txt', 'utf8').split('\n').filter(Boolean);
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const offered = (s: Said) => [...s.offer.primary, ...s.offer.rest].flatMap(o => [o, ...o.opens ?? []]);
describe('the drove life, after Bran is let out', () => {
  it('takes the drove to the sales, is answered at the landing, and is given the road west', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    for (const line of lines.slice(0, 12)) { said(await r.ask(line)); }
    // Found as a player finds it, under someone's talk too (MT-18: what is said to Bran is held within his).
    const take = (label: RegExp) => RunnerFind.act(r, r.said(), label);
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await take(/^To the drove pens/);
    const before = coin(), sold = await take(/^Help Bran take the drove to the sales/);
    expect(sold.scene.lines.join(' ')).toContain('For the four you found');
    expect(coin()).toBe(before + 4);
    expect(said(await take(/^Ask Bran about the work in Brynach/)).scene.lines.join(' ')).toContain('The old road west');
    await take(/^To the landing at Porthalen/);
    await take(/^Into the Stone Horn/);
    const food = c.world.number(ModuleWriter.call('quantity', 'party', 'rations'));
    const heard = await take(/what the waterfront is saying/);
    expect(heard.scene.lines.join(' ')).toContain('got the Brynach drover out');
    expect(c.world.number(ModuleWriter.call('quantity', 'party', 'rations'))).toBe(food + 1);
  }, 240000);
  // ST-02: Mardle sells the drove himself if nobody stops him: the sale cried, a buyer at the pens, half the drove
  // under the hammer, and Bran's share halved when he is let out after it.
  it('is sold by Mardle on a clock of his own, and Bran gets out to half a drove', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const told: string[] = [];
    for (let i = 0; i < 60 && !c.world.test(ModuleWriter.call('drove__halved', 'party')); i++) {
      const wait = offered(r.said()).find(o => /^Wait an hour/.test(o.label))!;
      told.push(...said(await r.ask(JSON.stringify({ act: wait.id }))).scene.lines);
    }
    const all = told.join(' ');
    expect(all).toContain('drove to be sold at the pens on the third day');
    expect(all).toContain('A buyer from Wrackham');
    expect(all).toContain('Eighteen of Bran');
  }, 240000);
});
