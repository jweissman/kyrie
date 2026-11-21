import { describe, expect, it } from 'bun:test';
import { PlayTool } from '../../../src/cli/play-tool';
import { Runner, type Said } from '../../../src/cli/runner';
import { ModuleWriter } from '../../../src/lang/module-writer';
import { RunnerFind } from '../../support/runner-find';
import { GeneratedWorld } from '../../support/generated';

// Fun Friday (20 November; doc/design/fun-fridays.md): writing letters (#223). In a market town's scrivener's, the
// scrivener writes a letter home for a penny; a day later the answer waits under the stone on the counter, in a hand
// the company knows, and is read to it for nothing. Its news is from the character's own people, by where their life
// began (data/generation/town/letters.json): the drover's mother in the fells above Brynach, the weir's heir's
// mother, Tegwen's sister; every company had heard of the same goat, sister and top field.
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
class Letter {
  // The country's scrivener's (in whichever market town it keeps one), a letter written there, a day waited, and its
  // answer read.
  static async home(as: string): Promise<string> {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', as]));
    const scriv = journey.session.campaign.module.entities.find(e => /^region__s\d+_scriv$/.test(e.id))!;
    GeneratedWorld.put(journey.session, scriv.id.replace(/^region__/, ''));
    const r = new Runner(journey.session);
    let s = await RunnerFind.act(r, r.said(), /^Have the scrivener write a letter home/);
    for (let hour = 0; hour < 25; hour++) { s = said(await r.ask(JSON.stringify({ act: 'company/0:Wait an hour' }))); }
    s = await RunnerFind.act(r, said(await r.ask('{"look":true}')), /^Have the scrivener read you the letter from home/);
    return s.scene.lines.join(' ').replace(/[‘’]/g, "'");
  }
}
describe('a letter home', () => {
  it('is answered by the character\'s own people: the drover\'s and the weir\'s heir\'s differ', async () => {
    const drove = await Letter.home('human/warrior/Wenna'), weir = await Letter.home('elf/mage/Ilse/scholar');
    expect(drove).toContain('The letter is from your mother, up in the fells above Brynach');
    expect(drove).toContain("Bran's wife came down to the farm");
    expect(weir).toContain("The letter is from your mother, Tegwen's sister");
    expect(weir).toContain('do not let that Nest cheat you on the eels');
    for (const told of [drove, weir]) { expect(told).not.toContain('The goat has kidded'); }
  }, 300000);
  it('is written for a penny, and its answer is under the stone a day later, read for nothing', async () => {
    const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', 'human/warrior/Wenna']));
    const r = new Runner(journey.session), c = journey.session.campaign;
    const coin = () => c.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    let s = said(await r.ask(JSON.stringify({ act: 'go(region__s1_scriv_door,region__s1_scriv)' })));
    const before = coin();
    s = await RunnerFind.act(r, s, /^Have the scrivener write a letter home/);
    expect(s.scene.lines.join(' ')).toContain('Answers come here, under the stone');
    expect(coin()).toBe(before - 1);
    // Not the same day: the answer is not there yet.
    const rows = (x: Said) => [...x.offer.primary, ...x.offer.rest, ...Object.values(x.offer.lenses ?? {}).flat()];
    expect(rows(s).some(o => /letter from home/.test(o.label))).toBe(false);
    for (let hour = 0; hour < 25; hour++) { s = said(await r.ask(JSON.stringify({ act: 'company/0:Wait an hour' }))); }
    s = said(await r.ask('{"look":true}'));
    expect(s.scene.lines.join(' ')).toContain('You know the hand');
    s = await RunnerFind.act(r, s, /^Have the scrivener read you the letter from home/);
    expect(s.scene.lines.join(' ')).toContain('The lambing went well');
    expect(coin()).toBe(before - 1);
  }, 240000);
});
