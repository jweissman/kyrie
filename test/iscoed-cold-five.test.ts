import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { PlayTool } from '../src/cli/play-tool';
import { Runner, type Said } from '../src/cli/runner';
import { ScreenModel } from '../src/ui/screen-model';
import { ModuleWriter } from '../src/lang/module-writer';
import type { World } from '../src/lang/world';
import { BeforeRooms } from './support/before-rooms';
import { AsMeant } from './support/as-meant';

// The fifth cold play of the golden route (mission-22/cold/cold-5-report.md, the elf mage from Gatesend) and the
// fourth's threads (cold-4-report.md), replayed by their own lines: the world answers what the company found and did
// (CL-32, CL-46), and what is told is so (CL-35). Each line as it was meant (AsMeant: the culvert's foul air risked
// where the play went up it).
const said = (x: Said | { error: string }): Said => { if ('error' in x) { throw new Error(x.error); } return x; };
const sent = { 4: 'doc/architecture/mission-22/cold/cold-4-lines.txt', 5: 'doc/architecture/mission-22/cold/cold-5-lines.txt' };
const lines = (play: 4 | 5, n: number) => readFileSync(sent[play], 'utf8').split('\n').filter(Boolean).slice(0, n);
const text = (s: Said) => s.scene.lines.join('\n');
const labels = (s: Said) => [...s.offer.primary, ...s.offer.rest].map(o => o.label);
async function play(as: string, acts: string[]) {
  const { journey } = await PlayTool.start(PlayTool.parse(['--earned', '--world', 'iscoed', '--as', as]));
  const r = new Runner(BeforeRooms.set(journey.session));
  // The plays' own lines, with the few it sent that were not offered then (an act refused is kept in the log).
  let s = r.said();
  for (const line of acts) { const x = await AsMeant.ask(r, line); if (!('error' in x)) { s = x; } }
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
    for (const line of lines(5, 88).slice(77)) { const x = await AsMeant.ask(run.r, line); if (!('error' in x)) { s = x; } }
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
  // CL-33: at the gate-well 27 journeys had been the rest's (14 "Set out for …", 12 "To the …"); the rest keeps the
  // roads leaving, where an aim names, where gone before and the nearest three, the others behind the journeys lens.
  it('folds the journeys at the gate-well behind their lens, never one an aim names', async () => {
    const { r } = await play('elf/mage/Ilse/scholar', lines(5, 7));
    // A job of the town taken on, whose aim names the churchyard: the notice's jobs are leads until asked (HP-01).
    const c = r.session.campaign;
    c.commitWorld(c.world.apply([{ kind: 'assert', call: ModuleWriter.call('region__s4_u_given', 'region__s4_u_dead_job') }]));
    const s = r.said() as Said;
    const kept = (s.offer.lenses?.journeys ?? []).map(o => o.id), lensed = said(await r.ask('{"lens":"journeys"}'));
    const all = [...lensed.offer.primary, ...lensed.offer.rest].map(o => o.id);
    // 27 when the ruling was made (11 kept, 16 folded); the counts move as the country does, the fold holds. The map's
    // journeys are uncounted on the scene (its row says no number: the owner, 25 November), laid as its lens opens.
    // Since the map draws what the company knows (OR-810), only the places it has heard of are journeys: 17 on 26
    // November (6 kept, 11 folded), where the 27 had counted places nobody had told it of.
    expect(kept.length).toBeLessThanOrEqual(12);
    expect(s.offer.more?.journeys).toBeUndefined();
    expect(all.length - kept.length).toBeGreaterThanOrEqual(8);
    const aimed = (ScreenModel.build(r.session.campaign).aims ?? []).flatMap(a => a.places ?? [])
      .map(p => `travel:${p}`).filter(id => all.includes(id));
    expect(aimed.length).toBeGreaterThan(0);
    expect(aimed.filter(id => !kept.includes(id))).toEqual([]);
    // A journey folded is no less legal (it had been the one to region__s5, a town the company has not heard of since
    // OR-810: one it has heard of, folded, now).
    const folded = all.find(id => id.startsWith('travel:') && !kept.includes(id) && !aimed.includes(id))!;
    expect(s.offer.rest.map(o => o.id)).not.toContain(folded);
    expect('error' in await r.ask(JSON.stringify({ act: folded }))).toBe(false);
  }, 180000);
  // CL-47's 30 (cold play 4's T115): once wound, the gatehouse has the pawl in its socket, not "an empty socket".
  it('sets the pawl in its socket once the gate is wound', async () => {
    const { s } = await play('elf/mage/Ilse/scholar', lines(5, 24));
    expect(text(s)).toContain('the pawl stands in its socket');
    expect(text(s)).not.toContain('empty socket');
  }, 180000);
  // CL-35's 4: three notices at one well (the town's, the clerk's tally, the Rì's proclamation under them); the clerk's
  // is on his own trestle, and the four never hold two notices.
  it('has one notice by the well, and never two notice rows in the four', async () => {
    const run = await play('elf/mage/Ilse/scholar', []);
    const notices = (s: Said) => s.offer.primary.filter(o => /notice|proclamation/i.test(o.label));
    const look = said(await run.r.ask('{"look":true}'));
    expect(look.scene.lines.filter(l => /notice.*by the well/.test(l))).toHaveLength(1);
    expect(text(look)).toContain('nailed to the clerk’s own trestle, under the shire-reeve’s mark');
    // The first turn leads with the company's own errand, the weir, to take up (OR-247), and the way to it; and with
    // the sea-gate that will drown it, which Nest has just said (OR-261: the charge is the origin's and the gate's,
    // attention to her words repaid); the well's notice is the next turn's.
    const four = run.s.offer.primary.map(o => o.label);
    expect(four[0]).toBe('Lift the trap at Tegwen\'s eel-weir');
    expect(four).toEqual(expect.arrayContaining(['To Tegwen\'s eel-weir', 'Ask Nest what is wrong with the sea-gate']));
    expect(notices(run.s)).toHaveLength(0);
    let s = run.s;
    for (const line of lines(5, 12)) { const x = await AsMeant.ask(run.r, line); if (!('error' in x)) { s = x; } }
    expect(notices(s).map(o => o.label)).toEqual(['Read the royal proclamation under the notices']);
  }, 180000);
  // CL-39's 33, 39, 40: the Hall's music box says whose it is before it is taken, and taking it is no find; the cup
  // in the undercroft is not drawn as a payoff nor found for experience, and its ring is bare only once it is lifted.
  it('says the music box is the steward\'s, and lifts the cup from its ring only when it is taken', async () => {
    const run = await play('elf/mage/Ilse/scholar', lines(5, 84));
    // By what it does: the engine offers it for the one it is had by (Doable.another), its row the thing's look.
    const box = [...run.s.offer.primary, ...run.s.offer.rest]
      .find(o => (o.does ?? o.id).startsWith('take_item(region__s4_manor_box'));
    expect(box?.label).toContain('the steward of the Hall\'s, not yours');
    expect(text(await run.ask(box!.id))).not.toMatch(/experience/);
    let s = run.s;
    for (const line of lines(5, 94).slice(85)) { const x = await AsMeant.ask(run.r, line); if (!('error' in x)) { s = x; } }
    const look = text(said(await run.r.ask('{"look":true}')));
    expect(look).toContain('a small bronze cup stands in a ring of dust');
    expect(look).not.toContain('was lifted');
    const cup = [...s.offer.primary, ...s.offer.rest].find(o => (o.does ?? o.id).startsWith('take_item(region__s4_stones_cup'));
    expect(cup?.aspects ?? ['none']).not.toContain('payoff');
    const taken = text(await run.ask(cup!.id));
    expect(taken).toContain('was lifted');
    expect(taken).not.toMatch(/experience/);
  }, 240000);
  // CL-38: a spell prepared in place of one already cast waits for a rest, and its row says so before it is chosen.
  it('says on the row that a spell prepared in place of one cast waits for the next rest', async () => {
    const { s } = await play('elf/mage/Ilse/scholar', lines(5, 8));
    const prepare = labels(s).filter(l => /^Have Ilse prepare/.test(l));
    expect(prepare.filter(l => / in place of Light,/.test(l)).every(l => l.endsWith(' · ready after the next rest')))
      .toBe(true);
    expect(prepare.filter(l => / in place of Second Sight,/.test(l)).some(l => l.includes('next rest'))).toBe(false);
    expect(prepare.length).toBe(6);
  }, 180000);
});
// The fourth cold play's threads (CL-46): Bran says what he will do himself, the boy has his answer once Bran is out,
// and the reeve says why nobody in Gatesend will go into the gatehouse.
describe('the drove road, after the fourth cold play', () => {
  it('lets Bran and Owain say what comes next, and the reeve why the gatehouse is shunned', async () => {
    const { s: freed, ask, r } = await play('human/warrior/Wenna', lines(4, 12));
    expect(text(freed)).toContain('Now I sell them, and drink, and go home');
    said(await ask('go(drove__customs_door,region__s1_green)'));
    // Owain's question is led on the green as itself where no other story's aim is held (HP-01: the green's signs are
    // leads), and under his talk where it is not: talked to first where that is offered.
    await r.ask(JSON.stringify({ act: 'talk_to(drove__owain)' }));
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
    // Turned to as the page turns to her (talk:): the opening leads with her first question in its gold now, so the
    // bare talk_to is the lead's opener, not an act of its own (OR-201: her likeness gold, her drawer with it).
    const nest = await ask('talk:origin__nest');
    const asks = labels(nest);
    // Her first question led as the opening's (gold): said with the turning to her ("Talk to Nest — ask what is
    // wrong with the sea-gate"), as the page says an unmet person's led question.
    expect(asks.some(l => /^(Ask Nest|Talk to Nest — ask) what is wrong with the sea-gate$/.test(l))).toBe(true);
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
