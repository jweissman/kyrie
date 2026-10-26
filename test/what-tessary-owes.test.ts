import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { ModuleWriter } from '../src/lang/module-writer';
import { KyrLint } from '../src/cli/kyr-lint';
import { Journey } from '../src/session/journey';
import type { CreatureStore } from '../src/creature-store';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';

// What Tessary Owes (doc/adventures/what-tessary-owes): each journey plays by the labels a player sees, from the
// steps in test/fixtures/tessary, and checks what the world did. The standalone campaign starts at eight in the
// morning on watch 0; the first night's spring ebb is watch 108, the eighth's 1116, the Board sits 1884 to 1908, the
// note falls due at 2124 and the morning after is 2154.
const campaign = 'data/campaigns/what-tessary-owes.campaign.json';
const steps = (name: string): string[] => {
  const phases = JSON.parse(readFileSync(`test/fixtures/tessary/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return Array.isArray(phases) ? phases : Object.values(phases).flat();
};
const phase = (name: string, key: string): string[] =>
  (JSON.parse(readFileSync(`test/fixtures/tessary/${name}.json`, 'utf8')) as Record<string, string[]>)[key]!;
const t = (id: string) => `tessary__${id}`;
class Tessary {
  static async start(seed = 'tessary') { return new Tessary(await Journey.start(campaign, seed)); }
  private constructor(readonly j: Journey) {}
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  async fixture(name: string) { return this.play(...steps(name)); }
  holds(name: string, ...args: string[]) { return this.j.holds(t(name), ...args.map(a => a === 'party' ? a : t(a))); }
  knows(fact: string) { return this.j.holds('knows', 'party', t(fact)); }
  measure(name: string, ...args: string[]) { return this.j.measure(t(name), ...args.map(t)); }
  ending() { return this.j.campaign.world.related('reached').map(r => r.args[0]); }
  at(who: string) { return this.j.campaign.world.one('at', t(who)); }
  get page() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  get running() { return this.j.campaign.running; }
  experience() { return this.j.campaign.fighters.map(m => m.experience).reduce((a, b) => a + b, 0); }
}

describe('What Tessary Owes', () => {
  it('lints clean as a recommended campaign', async () => {
    const findings = await KyrLint.campaign(campaign, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('left alone: Durrance answers the drum, the Treasurer drowns, the vote is lost and the Factor takes the Muster', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', '=1120');
    expect(g.holds('heldNow', 'durrance')).toBe(true);
    expect(g.at('durrance')).toBe(t('ranks'));
    expect(g.measure('held', 'ossel')).toBe(162);
    await g.play('=1910');
    expect(g.holds('quireDrowned', 'ossel')).toBe(true);
    expect(g.holds('riotHappened', 'ossel')).toBe(true);
    expect(g.holds('voted', 'ossel')).toBe(true);
    expect(g.holds('votePassed', 'ossel')).toBe(false);
    // The Factor lodged her bid with the broker nobody suspended, and at the Settlement it is hers.
    await g.play('=2154');
    expect(g.holds('saultHoldsNote', 'ossel')).toBe(true);
    expect(g.ending()).toEqual([t('factor')]);
    expect(g.running).toBe(false);
    // The news reached the company in the city, and no calling was made at the Settlement itself.
    expect(g.page).toMatch(/Durrance’s boots on the bar|Durrance's boots on the bar/);
    expect(g.page).toMatch(/You’re paid from today|You're paid from today/);
  }, 120000);

  it('the Kept Promise: proof before the Board, the Seal guarded, the deeds carried into the Holding', async () => {
    const g = await Tessary.start();
    await g.fixture('kept-promise');
    expect(g.holds('quireConfessed', 'ossel')).toBe(true);
    expect(g.holds('amauryTestified', 'ossel')).toBe(true);
    expect(g.holds('plumHome', 'ossel')).toBe(true);
    expect(g.measure('support', 'ossel')).toBeGreaterThanOrEqual(5);
    expect(g.holds('sealStolen', 'ossel')).toBe(false);
    expect(g.holds('deedsDelivered', 'ossel')).toBe(true);
    expect(g.ending()).toEqual([t('kept')]);
    // Every held soldier woke, Davy among them, and Durrance, who was taken at the eighth ebb.
    expect(g.holds('heldNow', 'davy')).toBe(false);
    expect(g.holds('heldNow', 'durrance')).toBe(false);
    expect(g.measure('held', 'ossel')).toBe(0);
    // A thorough fortnight grows the one who played it.
    expect(g.experience()).toBeGreaterThanOrEqual(3000);
    expect(g.page).toMatch(/gains 800 experience: put the deeds/);
  }, 240000);

  it('the Release: Durrance kept from the sea by the drum, and the Muster holding the city quit at the Oath Stone', async () => {
    const g = await Tessary.start();
    await g.fixture('release');
    expect(g.holds('heldBack', 'durrance')).toBe(true);
    expect(g.holds('drumBeaten', 'ossel')).toBe(true);
    // Whoever is passed over, the weight is the weight.
    expect(g.holds('elcockTaken', 'ossel')).toBe(true);
    expect(g.holds('fiskTurned', 'fisk')).toBe(true);
    expect(g.holds('votePassed', 'ossel')).toBe(false);
    expect(g.holds('released', 'ossel')).toBe(true);
    expect(g.ending()).toEqual([t('release')]);
    expect(g.page).toMatch(/I hold it quit/);
  }, 240000);

  it('the Void Note: the Valuer reads the Room of Defaults, indicts the Comptroller, and mercy is asked', async () => {
    const g = await Tessary.start();
    await g.fixture('void');
    expect(g.holds('tallySawDefaults', 'ossel')).toBe(true);
    expect(g.holds('indictmentFiled', 'ossel')).toBe(true);
    expect(g.holds('assemblyHeard', 'ossel')).toBe(true);
    expect(g.holds('comptrollerDeposed', 'ossel')).toBe(true);
    expect(g.holds('comptrollerUnravelled', 'ossel')).toBe(false);
    expect(g.ending()).toEqual([t('void')]);
    expect(g.page).toMatch(/four hundred years/);
  }, 240000);

  it('the Broken Note: with nothing else left, the Valuer breaks the note and unravels', async () => {
    const g = await Tessary.start();
    await g.fixture('torn');
    expect(g.holds('noteTorn', 'ossel')).toBe(true);
    expect(g.holds('tallyUnravelled', 'ossel')).toBe(true);
    expect(g.j.holds('travelsWith', t('tally'), 'party')).toBe(false);
    expect(g.ending()).toEqual([t('torn')]);
  }, 240000);

  it('the Warden: the Factor exposed before the Board, and put to terms that send the Muster home', async () => {
    const g = await Tessary.start();
    await g.fixture('warden');
    expect(g.knows('salt_springs')).toBe(true);
    expect(g.holds('saultExposed', 'ossel')).toBe(true);
    expect(g.holds('saultWarden', 'ossel')).toBe(true);
    expect(g.holds('saultHoldsNote', 'ossel')).toBe(true);
    expect(g.holds('heldNow', 'davy')).toBe(false);
    expect(g.ending()).toEqual([t('warden')]);
  }, 240000);

  it('Foreclosure: the Valuer objects to a bid for dominion, and nobody pays', async () => {
    const g = await Tessary.start();
    await g.fixture('foreclosure');
    expect(g.holds('objectionFiled', 'ossel')).toBe(true);
    expect(g.holds('saultInChamber', 'ossel')).toBe(true);
    expect(g.holds('foreclosed', 'ossel')).toBe(true);
    expect(g.holds('heldNow', 'davy')).toBe(true);
    expect(g.ending()).toEqual([t('foreclosure')]);
  }, 240000);
});

describe('What Tessary Owes: failure and its costs', () => {
  it('caught by the flood in Lowtide: rolled out through the Swatch to the Pans, hurt and lighter', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'To the Withies', 'To the Watersteps', 'To the head of the Swatch', '=156',
      'To the foot of the Swatch', 'To the Weed', 'To the Drowned Forum');
    const purse = g.j.measure('quantity', 'party', 'gold');
    await g.play('=182');
    expect(g.page).toMatch(/The water in the gutters has stopped running out/);
    await g.play('=188');
    expect(g.j.campaign.world.one('at', 'party')).toBe(t('pans'));
    expect(g.holds('sweptOnce', 'party')).toBe(true);
    expect(g.j.measure('quantity', 'party', 'gold')).toBe(purse - 3);
    expect(g.running).toBe(true);
  }, 120000);

  it('a roof is a refuge: out on the aqueduct when the flood comes, the company waits for the ebb', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'Into Pitch', 'Buy › A coil of rope', 'Out to the Landgate', 'To the Withies', 'To the Watersteps',
      'To the head of the Swatch', '=156', 'To the foot of the Swatch', 'To the Weed', 'To the Drowned Forum', 'To the foot of the Aqueduct',
      'To the top of the Aqueduct', '=200');
    expect(g.j.campaign.world.one('at', 'party')).toBe(t('aqueduct_top'));
    expect(g.page).toMatch(/You are above it, and will be until the ebb/);
    expect(g.j.offers('foot of the Aqueduct')).toBe(false);
    await g.play('=232');
    expect(g.j.offers('foot of the Aqueduct')).toBe(true);
  }, 120000);

  it('beaten by the ebb-runners: they take prisoners, and dump them on the Pans', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'To the Withies', 'To the Watersteps', 'To the head of the Swatch', '=156',
      'To the foot of the Swatch', 'To the Weed', 'To the Drowned Forum', 'To the Street of Scales', 'To the ebb-runners');
    // Come to them already badly hurt (a bleed now runs its whole course on its holder, and a whole company once won
    // here only because the ebb-runners' wounds ran out between their turns).
    const store = (g.j.campaign as unknown as { creatures: CreatureStore }).creatures;
    const lease = store.acquire(g.j.campaign.state.partyIds);
    try {
      lease.creatures.forEach(c => { c.state.hp = 1; }); lease.commit(lease.creatures);
    } finally { lease.release(); }
    await g.play('Bettany Slake.*Attack');
    expect(g.j.campaign.world.one('at', 'party')).toBe(t('pans'));
    expect(g.page).toMatch(/Someone has also been through your purse/);
    expect(g.running).toBe(true);
  }, 120000);

  it('a lie on the weighing floor: the Valuer writes it down, and the Weights turn', async () => {
    const g = await Tessary.start();
    await g.play(...phase('void', 'day1'), 'To the Withies', 'To the Landgate', 'To Panhythe', 'Into Factor Sault', 'Ask the Factor about the veterans',
      'Out to Panhythe', 'To the Landgate', 'To the Withies', 'To the Watersteps', '=110', 'Ask the Valuer where the soldiers',
      'Ask the Valuer to come with you', 'Ask the Ninth Valuer to join', 'To the head of the Swatch', '=156', 'To the foot of the Swatch',
      'To the Weed', 'To the Drowned Forum', 'Into the Hall of Oaths', 'torch.*Light', 'Into the Strongrooms', 'To the Antechamber');
    expect(g.j.offers('Tell the Valuer that Factor Sault hired you')).toBe(true);
    await g.play('Tell the Valuer that you are in no one');
    expect(g.holds('brokeFaith', 'party')).toBe(true);
    expect(g.holds('forswornParty', 'party')).toBe(true);
    // The Valuer will not now open the Room of Defaults, and the Weights in the gallery come for the forsworn.
    await g.play('To the Hall of Clerks', 'To the Archive');
    expect(g.j.offers('Ask the Valuer to open the Room')).toBe(false);
    await g.play('To the Hall of Clerks', 'To the Gallery of Pans');
    // The Weights seize the forsworn and put them out: the black wall does not open to them again.
    expect(g.holds('barredBelow', 'party')).toBe(true);
    expect(g.j.campaign.world.one('at', 'party')).toBe(t('oath_court'));
    await g.play('Wait › A while');
    expect(g.j.offers('Into the Strongrooms')).toBe(false);
    expect(g.j.offers('Put your hand on the black wall')).toBe(false);
  }, 240000);

  it("the Comptroller's bargain: Durrance passed over for a promise, Elcock taken, and the promise unkept", async () => {
    const g = await Tessary.start();
    await g.play(...phase('void', 'day1'), 'To the Withies', 'Into the Muffled Drum', 'Ask Durrance about the soldiers', 'Out to the Withies', 'To the Watersteps',
      '=110', 'Ask the Valuer where the soldiers', 'Ask the Valuer to come with you', 'Ask the Ninth Valuer to join',
      'To the head of the Swatch', '=156', 'To the foot of the Swatch', 'To the Weed', 'To the Drowned Forum', 'Into the Hall of Oaths',
      'torch.*Light', 'Into the Strongrooms', 'To the Antechamber', 'To the Hall of Clerks', "To the Comptroller's office",
      'Ask the Comptroller to strike', 'Promise the Comptroller');
    expect(g.holds('durranceSpared', 'ossel')).toBe(true);
    await g.play('=1130');
    expect(g.holds('heldNow', 'durrance')).toBe(false);
    expect(g.holds('elcockTaken', 'ossel')).toBe(true);
    await g.play('=2090');
    expect(g.holds('forswornParty', 'party')).toBe(true);
    expect(g.page).toMatch(/The Comptroller's letter was not brought|The Comptroller’s letter was not brought/);
  }, 240000);

  it('a name laid on the Notary\'s desk redeems one soldier, and costs everything carried of worth', async () => {
    const g = await Tessary.start();
    // The Valuer takes the company down and through the Door before the Settlement.
    await g.play(...phase('void', 'day1'), '=110', 'Ask the Valuer where the soldiers', 'Ask the Valuer to come with you',
      'Ask the Ninth Valuer to join', 'To the head of the Swatch', '=156', 'To the foot of the Swatch', 'To the Weed', 'To the Drowned Forum',
      'Into the Hall of Oaths', 'torch.*Light', 'Into the Strongrooms', 'To the Antechamber', 'To the Hall of Clerks', 'To the Gallery of Pans',
      'four lines: Take', 'five lines: Take', 'Put in › A brass weight of four', 'Put in › A brass weight of five', 'To the Weighing Chamber',
      'Through to the threshold', "To the Notary's desk", 'Ask the Notary how the called', 'Lay your name.*Davy');
    expect(g.holds('pledgedSelf', 'party')).toBe(true);
    expect(g.j.measure('quantity', 'party', 'gold')).toBe(0);
    expect(g.holds('heldNow', 'davy')).toBe(false);
    expect(g.at('davy')).toBe(t('teazle_room'));
  }, 240000);
});

describe('What Tessary Owes: more than one key', () => {
  const lowtide = ['To the Watersteps', 'To the head of the Swatch', '=156', 'To the foot of the Swatch', 'To the Weed',
    'To the Drowned Forum'];
  it("past the Forsworn with the weight of a kept promise, and down the drowned city's own drain into the Strongrooms", async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'Into Pitch', 'Buy › A torch', 'Buy › A torch', 'Out to the Landgate', 'Into Saint Evenhand',
      'Ask Brother Ancel who Saint', 'Ask Brother Ancel what the saint said', 'Ask Brother Ancel what the hollow',
      'Ask Brother Ancel for the weight', 'Out to the Landgate', 'To the Withies', ...lowtide, 'To the Street of Scales',
      'Into the bath-house', 'torch.*Light', 'To the plunge-room');
    expect(g.knows('evenhand_saying')).toBe(true);
    expect(g.page).toMatch(/hold out their hands, palm up/);
    await g.play('Hold out the weight');
    expect(g.holds('forswornAppeased', 'ossel')).toBe(true);
    await g.play('Into the Strongrooms', 'To the standing dormitory', 'To the Hall of Clerks');
    expect(g.j.campaign.world.one('at', 'party')).toBe(t('clerks_hall'));
    // Nobody fought; the black wall was never opened.
    expect(g.holds('registered', 'party')).toBe(false);
  }, 240000);

  it('the eel-mother warns at the foot of the Swatch Stair at the night ebb, and a company that listens can go back up', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'To the Withies', 'Ask Wick about going down at the night ebb', 'To the Watersteps',
      'To the head of the Swatch', '=230', 'To the foot of the Swatch');
    expect(g.knows('eelmother_known')).toBe(true);
    expect(g.page).toMatch(/She does not want you on her stair/);
    await g.play('To the head of the Swatch');
    expect(g.j.campaign.world.one('at', 'party')).toBe(t('throat_head'));
    expect(g.running).toBe(true);
  }, 240000);

  it('Bettany Slake hands over the letter to someone who tells her what her letters are for', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'To Scriveners', 'Into the Exchequer', 'Read a list', 'Out to Scriveners', 'To the Landgate',
      'To the Withies', 'Ask the Valuer whether the city pledged', ...lowtide, 'To the Street of Scales', 'To the ebb-runners',
      'Pay Bettany', 'Ask Bettany Slake what she carried', 'Tell Bettany Slake what the Factor', 'Take from the ebb-runners');
    expect(g.j.holds('carries', 'party', t('sault_letter'))).toBe(true);
    expect(g.j.holds('hostile', t('slake'), 'party')).toBe(false);
  }, 240000);

  it('the Valuer balances the weighing pans as a child of seven does', async () => {
    const g = await Tessary.start();
    await g.play(...phase('void', 'day1'), ...phase('void', 'night1'), ...phase('void', 'below').slice(0, 9),
      'To the Hall of Clerks', 'To the Gallery of Pans', 'Ask the Valuer to balance');
    expect(g.page).toMatch(/A pen is about the weight of an untold lie/);
    expect(g.j.offers('To the Weighing Chamber')).toBe(true);
  }, 240000);

  it('the Factor seeks out the one she hired on the Tidewall at dusk, and speaks of her father', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'To Panhythe', 'Into Factor Sault', 'Ask the Factor about the veterans', 'Out to Panhythe',
      'To the Landgate', 'Into Saint Evenhand', 'Ask Brother Ancel about the old rakers', 'Out to the Landgate', 'To Scriveners',
      'To the Tidewall', '=350');
    expect(g.page).toMatch(/You look like someone who.s been under the sea/);
    await g.play('Ask the Factor about the First Muster');
    expect(g.page).toMatch(/at knee height/);
  }, 240000);

  it('the Factor pays her twenty coin for what is taking her lads, and hears out her own letter', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'To Panhythe', 'Into Factor Sault', 'Ask the Factor about the veterans', 'Out to Panhythe',
      'To the Landgate', 'To Scriveners', 'Into the Exchequer', 'Read a list', 'Ask the Treasurer about his list', 'Out to Scriveners',
      'To the Landgate', 'To Panhythe', 'Into Factor Sault');
    const purse = g.j.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'));
    await g.play('Tell the Factor what is taking her lads');
    expect(g.j.campaign.world.number(ModuleWriter.call('quantity', 'party', 'gold'))).toBe(purse + 20);
    expect(g.holds('saultInformed', 'sault')).toBe(true);
    expect(g.j.offers('read her letter')).toBe(false);
  }, 240000);

  it('the Drum hears of each night before it comes, and the Treasurer can be met at the head of the Swatch Stair', async () => {
    const g = await Tessary.start();
    await g.play('To the Landgate', 'To the Withies', 'Into the Muffled Drum', '=300', 'Ask Hannelore what they are saying');
    expect(g.page).toMatch(/off the Factor.s press/);
    await g.play('=1300', 'Ask Hannelore what they are saying');
    expect(g.page).toMatch(/head of the Swatch Stair before dawn/);
    await g.play('Out to the Withies', 'To the Watersteps', 'To the head of the Swatch', '=1410');
    expect(g.at('quire')).toBe(t('throat_head'));
    expect(g.page).toMatch(/He has taken his spectacles off/);
    await g.play('Ask the Treasurer who will send the money');
    const stayed = g.holds('quireHope', 'quire');
    await g.play('=1440');
    expect(g.holds('quireDrowned', 'ossel')).toBe(!stayed);
    expect(g.at('quire')).toBe(stayed ? t('exchequer_room') : undefined);
  }, 360000);

  it('someone the Board cannot call a liar: the Valuer states the city\'s affairs to it, and is counted', async () => {
    const g = await Tessary.start();
    await g.play(...phase('void', 'day1'), ...phase('void', 'night1'), 'To the Withies', 'To the Landgate', 'To Scriveners',
      'To the Terraces', 'Into the Council House', '=1890');
    expect(g.at('board')).toBe(t('council_chamber'));
    await g.play('Tell the Board what is on', 'Read the Board the terms', 'Ask the Valuer to tell the Board');
    expect(g.page).toMatch(/You are the debtor/);
    await g.play('=1910');
    expect(g.holds('counted_tally', 'ossel')).toBe(true);
    expect(g.holds('counted_list', 'ossel')).toBe(true);
    expect(g.knows('board_sits')).toBe(true);
  }, 360000);
});

describe('What Tessary Owes: saving, replaying, and the world it lies in', () => {
  it('kept mid-fortnight and opened again, the world goes on to the same end as one never kept', async () => {
    const whole = await Tessary.start('kept');
    const all = steps('release');
    await whole.play(...all);
    const split = await Tessary.start('kept'), at = all.indexOf('=1104');
    await split.play(...all.slice(0, at));
    const back = PlaySession.resume(JSON.parse(JSON.stringify(split.j.session.checkpoint())));
    const resumed = Journey.of(back);
    await resumed.play(...all.slice(at));
    expect(resumed.campaign.world.related('reached').map(r => r.args[0])).toEqual(whole.ending());
    expect(resumed.campaign.state.elapsed).toBe(whole.j.campaign.state.elapsed);
    expect(JSON.stringify(resumed.campaign.world.related('heldNow'))).toBe(JSON.stringify(whole.j.campaign.world.related('heldNow')));
  }, 300000);

  it('as a chapter of a world that goes on, the city is still there after the Settlement, and shows what became of it', async () => {
    const j = await Journey.start('test/fixtures/tessary/continuing.campaign.json', 'after');
    await j.play('To the Landgate', '=2160');
    expect(j.campaign.world.related('reached').map(r => r.args[0])).toEqual([t('factor')]);
    expect(j.campaign.running).toBe(true);
    const scene = async (step: string) => { await j.play(step); return PlayerView.observe(j.campaign).observations.map(o => o.text).join(' '); };
    expect(await scene('To the Withies')).toMatch(/in the Factor.s coats/);
    expect(await scene('To the Landgate')).toMatch(/THE WARDEN OF THE CITY GIVES NOTICE/);
  }, 240000);

  it('played twice from the same seed, the same steps make the same history', async () => {
    const a = await Tessary.start('twice'), b = await Tessary.start('twice');
    const some = steps('kept-promise').slice(0, 60);
    await a.play(...some); await b.play(...some);
    expect(a.j.campaign.state.elapsed).toBe(b.j.campaign.state.elapsed);
    expect(a.j.taken.map(x => x.told)).toEqual(b.j.taken.map(x => x.told));
  }, 240000);

  it('a generated marsh country holds Tessary beyond its east march, its innkeeper tells of it, and the road leads in', async () => {
    const w = await WorldAssembler.assemble('ossel', NodeBundleSource.shared, { region: { terrain: 'marsh' } });
    expect(w.report.region.beyond!.east!.name).toBe('the Ossel delta');
    const s = await PlaySession.start(w.path, 'ossel', w.source);
    const told = s.campaign.module.actions.find(a => a.id.startsWith('region__edge_east_beyond_told_'))!;
    GeneratedWorld.put(s, s.campaign.world.one('at', told.speaker!)!.replace(/^region__/, ''));
    expect(await Journey.of(s).play('about the road east')).toContain('walking into the sea');
    expect(PlayerView.observe(s.campaign).knowledge.some(k => k.id === 'region__edge_east_beyond')).toBe(true);
    await GeneratedWorld.travel(s, 'edge_east');
    const drawn = await new Frontier('ossel', NodeBundleSource.shared).expand(s.campaign);
    expect(s.campaign.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    await j.play("Causeway, at the marsh's edge");
    expect(s.campaign.world.one('at', 'party')).toBe(`${drawn!.rid}__causeway_end`);
    expect(await j.play('To the Landgate', 'notice')).toContain('Nan Teazle');
  }, 240000);
});
