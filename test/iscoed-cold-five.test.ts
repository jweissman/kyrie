import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { World } from '../src/lang/world';

// The fifth cold play of the golden route (mission-22/cold/cold-5-report.md, the elf mage from Gatesend) and the
// fourth's threads (cold-4-report.md), replayed by their own lines: the world answers what the company found and did
// (CL-32, CL-46), and what is told is so (CL-35).
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const sent = { 4: 'doc/architecture/mission-22/cold/cold-4-lines.txt', 5: 'doc/architecture/mission-22/cold/cold-5-lines.txt' };
const lines = (play: 4 | 5, n: number) => readFileSync(sent[play], 'utf8').split('\n').filter(Boolean).slice(0, n);
const text = (s: Said) => s.scene.lines.join('\n');
const labels = (s: Said) => [...s.offer.primary, ...s.offer.rest].map(o => o.label);
async function play(as: string, acts: string[]) {
  const { journey } = await PlayTool.start(PlayTool.parse(['--world', 'iscoed', '--as', as]));
  const r = new Runner(journey.session);
  // The plays' own lines, with the few it sent that were not offered then (an act refused is kept in the log).
  let s = r.said();
  for (const line of acts) { const x = await r.ask(line); if (!('error' in x)) { s = x; } }
  return { r, s, journey, ask: async (act: string) => said(await r.ask(JSON.stringify({ act }))) };
}
describe('Gatesend, after the fifth cold play', () => {
  // CL-35: the lease is the heir's from the start, not taken on reading a notice ("You take Tegwen's lease.").
  it('gives Tegwen\'s lease before anything is done, and reading the notice says only the notice', async () => {
    const { s } = await play('elf/mage/Ilse/scholar', lines(5, 1));
    expect(text(s)).not.toContain('Tegwen');
    expect(labels(s)).toContain('Read Tegwen\'s lease');
  }, 180000);
  // CL-32: the sawn pin is something to tell and a question to follow; the gate shut, Gatesend and Nest answer it.
  it('answers the sawn pin and the shut gate', async () => {
    const { s, ask } = await play('elf/mage/Ilse/scholar', lines(5, 25));
    expect(text(s)).toContain('chalked a wave inside a ring');
    expect(s.aims?.map(a => a.text)).toContain('Find out who sawed through the pawl\'s pin, and why they want the sea-gate open.');
    expect(labels(await ask('talk_to(origin__nest)'))).toContain('Tell Nest the sea-gate shuts');
    expect(text(await ask('origin__nest_shut'))).toContain('I heard it stop');
    expect(text(await ask('origin__nest_pin'))).toContain('Eel-men don’t saw iron');
  }, 180000);
  // CL-32: the cook's eight coin and her pie are paid, and said in the purse's own word (CL-40: "eight silver" had
  // been paid into a purse that counts coin, unsaid whether one is the other); put out for the music box, the kitchen
  // says why, and the box given back opens the Hall again; the chime is the boy's tune only to one who heard him hum
  // it.
  it('pays the cook\'s eight coin and pie, and undoes the theft by giving the box back', async () => {
    const run = await play('elf/mage/Ilse/scholar', lines(5, 76));
    const before = run.s.purse!;
    const paid = await run.ask('region__s4_manor_cook_ratsdone');
    expect(paid.purse).toEqual({ coin: before.coin + 8, rations: before.rations + 1 });
    expect(text(paid)).toContain('counts out eight coin');
    let s = paid;
    for (const line of lines(5, 88).slice(77)) { const x = await run.r.ask(line); if (!('error' in x)) { s = x; } }
    expect(text(s)).toContain('The steward says you are put out of the house');
    // Its 35: a second word with the cook had printed nothing at all.
    expect(text(await run.ask('talk_to(region__s4_manor_cook)'))).toContain('Well?');
    expect(text(await run.ask('region__s4_manor_cook_amends'))).toContain('The front door is open');
    const front = await run.ask('go(region__s4_manor_kdoor,region__s4_manor_front)');
    expect(labels(front)).toContain('To the great hall');
  }, 240000);
  // Its 37, 38, 41: the chime is the boy's tune to one who has heard him hum it in the Hall kitchen, the house's
  // history is not told again, and nothing is said to answer that does not.
  it('rings the chime as the tune the kitchen boy hums, and says nothing twice', async () => {
    const { s } = await play('elf/mage/Ilse/scholar', lines(5, 95));
    expect(text(s)).toContain('it is the tune the kitchen boy hums at the Hall');
    expect(text(s)).not.toMatch(/Wimble's four notes|answered question|dressed limestone/);
  }, 240000);
});
// The fourth cold play's threads (CL-46): Bran says what he will do himself, the boy has his answer once Bran is out,
// and the reeve says why nobody in Gatesend will go into the gatehouse.
describe('the drove road, after the fourth cold play', () => {
  it('lets Bran and Owain say what comes next, and the reeve why the gatehouse is shunned', async () => {
    const { s: freed, ask } = await play('human/warrior/Wenna', lines(4, 12));
    expect(text(freed)).toContain('Now I sell them, and drink, and go home');
    said(await ask('go(drove__customs_door,region__s1_green)'));
    await ask('talk_to(drove__owain)');
    expect(text(await ask('drove__owain_after'))).toContain('Go home with Bran');
    await ask('talk_to(gate__reeve)');
    expect(text(await ask('gate__reeve_gate'))).toContain('with the sea running under it like a mill-race');
  }, 180000);
  // CL-35's 16: the cellar's rats dead and how they came up not found, "and find where they get in" had dropped out of
  // the aim unsaid; it is asked still, as an aim of its own.
  it('asks still where the rats got in, once those in the cellar are dead', async () => {
    const { journey } = await play('elf/mage/Ilse/scholar', lines(5, 31));
    const c = journey.session.campaign as unknown as { world: World; commit(w: World): void };
    c.commit(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('region__s4_u_done', 'region__s4_u_rats_job') }]));
    const aims = ScreenModel.build(journey.session.campaign).aims?.map(a => a.text) ?? [];
    expect(aims).toContain('The rats in the corn-store cellar are dead. Find where they got in: there will be more '
      + 'where they came from.');
    expect(aims.join(' ')).not.toContain('Clear the rats out of');
  }, 180000);
  // CL-36's 7: Nest, who had told of the gate, had nothing to say before anything was done; and its 29, the cook had
  // no word of the press key the steward sent the company to her for, before her cellar was seen to.
  it('has Nest say what she spoke of, and the cook what the press key waits on', async () => {
    const { s, ask, journey } = await play('elf/mage/Ilse/scholar', []);
    expect(s.at).toBe('region__s4_green');
    const nest = await ask('talk_to(origin__nest)');
    const asks = labels(nest);
    expect(asks).toContain('Ask Nest what is wrong with the sea-gate');
    expect(asks).toContain('Ask Nest about Tegwen\'s weir');
    expect(text(await ask('origin__nest_gate'))).toContain('like a door with no latch on it');
    const cook = journey.session.campaign.module.actions.find(a => a.id === 'region__s4_manor_cook_key_first');
    expect(cook?.speaker).toBe('region__s4_manor_cook');
  }, 180000);
  // CL-38 (its 26 and 42): the lantern lit in the Hall kitchen while the candle of the rat-runs burned, both burning;
  // and Siphon Life prepared in Light's place "ready after the next rest", where at the 33rd line it had been at once.
  it('puts the candle out for the lantern, and says why a spell prepared waits for a rest', async () => {
    const { r, journey } = await play('elf/mage/Ilse/scholar', lines(5, 68));
    const ilse = journey.session.campaign.readout.creatures.find(c => c.name === 'Ilse')!;
    expect(ilse.state.conditions.map(c => c.id).filter(id => /lit$/.test(id))).toEqual(['lamplit']);
    const prepared = text(said(await r.ask(lines(5, 69).at(-1)!)));
    expect(prepared).toContain('Siphon Life will be ready after the next rest: Light had been cast from that slot.');
  }, 180000);
});
