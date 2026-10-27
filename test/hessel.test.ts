import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { PlayerView } from '../src/presentation/player-view';
import { WorldAssembler } from '../src/world/world-assembler';
import { Frontier } from '../src/world/frontier';
import { GeneratedWorld } from './support/generated';
import { Hessel, alone, build, h, steps } from './support/hessel';

// The Banns at Hessel's journeys and what each must leave behind; the helper and the calendar are in test/support/hessel.ts.
describe('The Banns at Hessel', () => {
  it('lints clean as a recommended campaign', async () => {
    const findings = await KyrLint.campaign(alone, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 60000);

  it('left alone: the banns stand, the bridegroom walks past his bride to his wife on the church steps, and Mrs Cherrett does not wake', async () => {
    const g = await Hessel.start();
    await g.fixture('alone');
    await g.until();
    expect(g.holds('bannsDone', 'ebbas')).toBe(true);
    expect(g.holds('weddingBroken', 'ebbas')).toBe(true);
    expect(g.holds('gone', 'cherrett')).toBe(true);
    expect(g.ending()).toEqual(['seasons_end']);
    // Nobody spoke at the third reading, and nobody moved Carth House, the chairmen or the drops.
    expect(g.holds('strike', 'chairmen')).toBe(false);
    expect(g.page).toMatch(/Ismay Cherrett goes home unmarried, jilted at the altar/);
    expect(g.page).toMatch(/tonight at two someone will come up the Parade/);
    expect(g.page).toMatch(/WHO COOKED FOR THE DELVE CUT/);
  }, 120000);

  it('the Rooms, for a bard: the apology in form, the grandson in Lady Wenlock\'s arms, the drops stopped by Ismay, the blessing, and the last minuet', async () => {
    const g = await Hessel.start();
    await g.fixture('rooms');
    await g.until();
    // The banns withdrawn in a drawing room, not stopped in church.
    expect(g.holds('grandmother', 'lady_wenlock')).toBe(true);
    expect(g.holds('bannsStopped', 'ebbas')).toBe(false);
    expect(g.holds('bannsWithdrawn', 'ebbas')).toBe(true);
    // Mr Twiss won by form, and by the chairmen's warning; the household admitted.
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(true);
    expect(g.measure('twissFavour', 'twiss')).toBeGreaterThanOrEqual(3);
    expect(g.holds('faresRestored', 'chairmen')).toBe(true);
    // The drops stopped by someone she loves asking; Ismay and Kit blessed; Mopsa's yes.
    expect(g.holds('stoppedBy', 'cherrett', 'ismay')).toBe(true);
    expect(g.holds('cherrettBlessesKit', 'cherrett')).toBe(true);
    expect(g.holds('mopsaYes', 'party')).toBe(true);
    expect(g.holds('cherrettDanced', 'cherrett')).toBe(true);
    expect(g.ending()).toEqual(['last_dance']);
    expect(g.page).toMatch(/I believe I have the honour of the last minuet/);
    expect(g.page).toMatch(/Lady Wenlock has taken the lease of a house in Quay Lane/);
  }, 180000);

  it('Mrs Scrope, asked on the first morning, says where Dr Ottery is going, and when', async () => {
    const g = await Hessel.start();
    await g.play('Lim Bridge', 'Quay Lane', 'Stall Street', 'To the Abbey Yard', 'Seize the side of the chair', 'Into the Pump Room',
      'Ask Mrs Scrope about the Hospital');
    expect(g.page).toMatch(/he has to walk it, over the down, at first light/);
  }, 60000);

  it('a mage, with no gift but lore, hears the Season\'s round from Mopsa and reckons the drops on the first day', async () => {
    const g = await Hessel.start(build('mage'), 'g1');
    await g.play('Lim Bridge', 'Quay Lane', 'Stall Street', 'To the Abbey Yard', 'Seize the side of the chair',
      'Ask the old woman if she is hurt', 'To the top of the Parade', 'To the Circus', '=13', "Into Mrs Cherrett's lodgings",
      'Tell Mrs Cherrett you will be her legs', 'Ask Mopsa how a day of the Season goes', "To Mrs Cherrett's bedroom",
      'Look closely', 'Reckon the drops');
    // The Season's round, from Mopsa, once the company is her legs.
    expect(g.page).toMatch(/Ismay walks out to the Sham Castle by herself/);
    expect(g.knows('drops_doubled')).toBe(true);
    expect(g.page).toMatch(/there are not eighty left in it/);
  }, 60000);

  it('the Old Town, for a thief: with the chairmen, water for the drops, Hetty up the aisle, Celia out by the window to her mother, and Hartopp in his boots', async () => {
    const g = await Hessel.start(build('thief'), 'o1');
    await g.fixture('oldtown');
    await g.until();
    expect(g.holds('stoodWith', 'party')).toBe(true);
    expect(g.holds('strike', 'chairmen')).toBe(false);
    expect(g.holds('swapped', 'cherrett')).toBe(true);
    expect(g.holds('stoppedByHetty', 'ebbas')).toBe(true);
    expect(g.holds('celiaMetMother', 'celia')).toBe(true);
    expect(g.holds('hartoppBarred', 'hartopp')).toBe(true);
    // Nothing of the Rooms' way: Mr Twiss never moved, no grandson shown, the household still barred.
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(false);
    expect(g.holds('grandmother', 'lady_wenlock')).toBe(false);
    expect(g.ending()).toEqual(['morning_after']);
    expect(g.page).toMatch(/He’s mine. We were married in Bristol/);
    // Not in the Rooms to see the boots, so the chairmen tell it at the Two Poles.
    expect(g.page).toMatch(/In his boots,’ says Big Lanyon/);
  }, 180000);

  it('a warrior on the Orm road: told the child costs the College, walks past, fights the footpads, and is in time', async () => {
    const road = JSON.parse(readFileSync('test/fixtures/hessel/orm.json', 'utf8')) as Record<string, string[]>;
    const g = await Hessel.start(build('warrior'), 'p1');
    await g.play(...road.arrive!, ...road.night!, ...road.road!.slice(0, road.road!.indexOf('Into the shepherd') + 1));
    expect(g.page).toMatch(/That’s the College, by the drove road/);
    // No sheep-path for a warrior; walked past the child, Ottery comes, and has something to say at the crossways.
    expect(g.j.find('the sheep-path')).toBeUndefined();
    await g.play('Out to the fold', 'To the crossways', '^Attack');
    expect(g.page).toMatch(/It’s the ones you sit with that you remember/);
    // The fallen footpads ask no price, and the physician kneels to them.
    expect(g.j.find('what it asks')).toBeUndefined();
    expect(g.page).toMatch(/You’ll live,’ he tells them/);
    await g.play('Tell him: never', 'To the south gate of Orm', 'Go in with Dr Ottery');
    expect(g.holds('otteryLicensed', 'ottery')).toBe(true);
  }, 120000);

  it('the Road to Orm, for a ranger: the stile, the shepherd\'s child, the sheep-path, the College, and the door of Carth House opened by the hand that shut it', async () => {
    const g = await Hessel.start(build('ranger'), 'r1');
    await g.fixture('orm');
    await g.until();
    expect(g.holds('saidTruth', 'party')).toBe(true);
    expect(g.holds('childTreated', 'party')).toBe(true);
    expect(g.holds('otteryLicensed', 'ottery')).toBe(true);
    expect(g.holds('stoppedBy', 'cherrett', 'ottery')).toBe(true);
    expect(g.holds('celiaWell', 'celia')).toBe(true);
    expect(g.holds('carthReunited', 'carth')).toBe(true);
    expect(g.j.holds('travelsWith', h('ottery'), 'party')).toBe(true);
    expect(g.ending()).toEqual(['morning_after']);
    expect(g.page).toMatch(/opens the door of Carth House with his own hand/);
    expect(g.page).toMatch(/Dr Ottery is on the road with you/);
  }, 180000);

  it('gossip as a weapon: a lie about the canals at the Pump Room breaks the match by dinner, and Mrs Cherrett learns who told it', async () => {
    const g = await Hessel.start();
    await g.fixture('gossip');
    expect(g.holds('public', 'rumour_ruin')).toBe(true);
    expect(g.holds('bannsWithdrawn', 'ebbas')).toBe(true);
    expect(g.holds('legs', 'party')).toBe(false);
    expect(g.page).toMatch(/You told the town I was ruined/);
    await g.until();
    expect(g.ending()).toEqual(['turned_away']);
  }, 180000);

  it('the Ball, unchecked: Rupert\'s secret told to Mrs Scrope, and Hartopp stands up with Ismay twice running, which in Hessel is a promise', async () => {
    const g = await Hessel.start();
    await g.fixture('claims');
    expect(g.holds('scandal', 'wenlock')).toBe(true);
    expect(g.holds('hartoppClaims', 'ismay')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/Ismay Cherrett goes home engaged to Dr Hartopp/);
  }, 180000);

  it('the Ball, warned: Mr Twiss told she is not betrothed stops the band and sends Hartopp out', async () => {
    const g = await Hessel.start();
    await g.fixture('warned');
    expect(g.holds('hartoppClaims', 'ismay')).toBe(false);
    expect(g.holds('hartoppBarred', 'hartopp')).toBe(true);
    expect(g.page).toMatch(/The Rule is the Rule/);
  }, 180000);

  it('for a warrior, Signor Brocca carried up the Parade puts Mr Twiss in debt, and the debt lifts the bar', async () => {
    const g = await Hessel.start(build('warrior'), 'w1');
    await g.fixture('brocca');
    expect(g.holds('broccaDone', 'brocca')).toBe(true);
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(true);
  }, 180000);

  it('the footman bribed: Mr Twiss finds the household at the side door, and turns it away for good', async () => {
    const g = await Hessel.start(build('warrior'), 'w1');
    await g.fixture('fitch');
    expect(g.holds('twissOffended', 'party')).toBe(true);
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(false);
    expect(g.page).toMatch(/is not admitted to these Rooms/);
  }, 180000);

  it('the door opened to the knock by a stranger: she turns round on the step, and does not come again', async () => {
    const g = await Hessel.start(build('thief'), 'd3');
    await g.fixture('doorway');
    expect(g.holds('received', 'party')).toBe(true);
    expect(g.holds('nanFled', 'nan')).toBe(true);
    expect(g.holds('carthReunited', 'carth')).toBe(false);
    await g.until();
    expect(g.page).toMatch(/Nobody knocks at Carth House at two in the morning any more/);
  }, 180000);

  it('a licence bought blank at Orm, filled in by Mr Pyne for a chairman and an heiress, and a wedding at nine', async () => {
    const g = await Hessel.start();
    await g.fixture('licence');
    expect(g.holds('cherrettBlessesKit', 'cherrett')).toBe(true);
    expect(g.holds('kitEngaged', 'kit')).toBe(true);
    expect(g.holds('married', 'couple_kit')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/Ismay Cherrett was married to Christopher Danby, chairman/);
  }, 240000);

  it('on the road, comfort said at the stile and Ottery let go north at the gate of Orm: he does not come back', async () => {
    const g = await Hessel.start(build('ranger'), 'r1');
    await g.fixture('orm-north');
    expect(g.holds('saidComfort', 'party')).toBe(true);
    expect(g.holds('otteryGone', 'ottery')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/Dr Ottery went north from the gate of Orm/);
  }, 240000);

  it('brought back unlicensed, Ottery remembers that hope is a physic, and halves the dose instead of stopping it', async () => {
    const g = await Hessel.start(build('ranger'), 'r1');
    await g.fixture('orm-back');
    expect(g.holds('otteryFugitive', 'ottery')).toBe(true);
    expect(g.holds('halved', 'cherrett')).toBe(true);
    expect(g.holds('dosed', 'cherrett')).toBe(true);
    await g.until();
    expect(g.holds('gone', 'cherrett')).toBe(false);
    expect(g.page).toMatch(/physicks the Old Town without a licence/);
  }, 240000);

  it('Mopsa\'s house: Mrs Cherrett\'s forty and Mr Twiss\'s character, and a card in the window', async () => {
    const g = await Hessel.start();
    await g.fixture('lease');
    expect(g.holds('mopsaFunded', 'mopsa')).toBe(true);
    expect(g.holds('mopsaHouse', 'mopsa')).toBe(true);
    expect(g.page).toMatch(/NO PHYSICIANS/);
  }, 240000);

  it('a soldier with no charisma, lore or persuasion plays the Rooms\' way whole: what moves people here is knowing the form and standing beside them', async () => {
    const g = await Hessel.start(build('soldier'), 'h1');
    await g.fixture('rooms');
    await g.until();
    expect(g.holds('householdAdmitted', 'cherrett')).toBe(true);
    expect(g.holds('grandmother', 'lady_wenlock')).toBe(true);
    expect(g.holds('cherrettBlessesKit', 'cherrett')).toBe(true);
    expect(g.ending()).toEqual(['last_dance']);
  }, 180000);

  it('for a cleric: the ankle strapped, Ismay\'s face read, and the drops reckoned from the bottle without asking anyone', async () => {
    const g = await Hessel.start(build('cleric'), 'c1');
    await g.fixture('cleric');
    expect(g.holds('chairThrown', 'cherrett')).toBe(true);
    expect(g.holds('ankleBound', 'cherrett')).toBe(true);
    expect(g.holds('bedbound', 'cherrett')).toBe(false);
    expect(g.holds('kitDismissed', 'kit')).toBe(false);
    expect(g.knows('ismay_loves_kit')).toBe(true);
    expect(g.knows('drops_doubled')).toBe(true);
  }, 120000);

  it('for a warrior who breaks into Carth House at night: Sir Gervase warns, and beaten, throws the housebreaker into the Crescent and nails the shutters', async () => {
    const g = await Hessel.start(build('warrior'), 'w1');
    await g.fixture('intruder');
    expect(g.holds('chairCaught', 'cherrett')).toBe(true);
    expect(g.page).toMatch(/Get out of my house/);
    await g.play('Sir Gervase Carth.*: Attack', '=94');
    expect(g.holds('thrownOut', 'party')).toBe(true);
    expect(g.state('drawing_window', 'nailed')).toBe(true);
    expect(g.j.holds('able', 'party')).toBe(true);
    expect(g.page).toMatch(/threw a housebreaker into the street/);
  }, 120000);

  it('for a monk: a poem made of what was seen, through Mrs Brannagh when the climb fails, and Celia brought down from the window to dance with Rob', async () => {
    const g = await Hessel.start(build('monk'), 'm1');
    await g.fixture('window');
    expect(g.holds('triedWindow', 'party')).toBe(true);
    expect(g.holds('poemGood', 'rob')).toBe(true);
    expect(g.holds('celiaHasPoem', 'celia')).toBe(true);
    expect(g.holds('robCeliaSpoke', 'rob')).toBe(true);
    expect(g.holds('celiaOut', 'celia')).toBe(true);
    await g.until(512);
    expect(g.holds('dancedWith', 'rob', 'celia')).toBe(true);
    await g.until();
    expect(g.page).toMatch(/where a girl reads Ovid in the window/);
  }, 240000);

  it('the third reading, with the curate warned: Mr Pyne holds the pause and looks at Rupert until he stands up himself', async () => {
    const g = await Hessel.start();
    await g.fixture('pyne');
    expect(g.holds('stoppedByRupert', 'ebbas')).toBe(true);
    expect(g.holds('scandal', 'wenlock')).toBe(false);
    expect(g.page).toMatch(/Well done, sir/);
  }, 180000);

  it('the third reading, with Ismay stood beside: her opinion is not an impediment, but it shames Rupert into giving one', async () => {
    const g = await Hessel.start();
    await g.fixture('objection');
    expect(g.holds('ismayObjected', 'ebbas')).toBe(true);
    expect(g.holds('stoppedByRupert', 'ebbas')).toBe(true);
    expect(g.page).toMatch(/That is an opinion/);
  }, 180000);

  // An ordinary player's way in: a first country whose folk have only heard of Hessel; the country beyond, whose
  // innkeepers tell it in full; the road over its north march; and the Season, a chapter of the world, closing at noon
  // on the fifth day while the world goes on.
  it('heard of from a first country, told in full in the next, and walked into over the north march as a chapter of the world', async () => {
    const seed = 'h14';
    const w = await WorldAssembler.assemble(seed, NodeBundleSource.shared,
      { origin: 'wanderer', party: [{ name: 'Wenna', raceId: 'human', classId: 'bard' }] });
    expect(w.report.region.further!.map(f => [f.id, f.side, f.then])).toContainEqual(['hessel', 'east', 'north']);
    const s = await PlaySession.start(w.path, seed, w.source), c = s.campaign, frontier = new Frontier(seed, NodeBundleSource.shared);
    const ask = async (pattern: RegExp) => {
      const topic = c.module.actions.find(a => pattern.test(a.id))!;
      await GeneratedWorld.travel(s, c.world.one('at', topic.speaker!)!);
      const choice = PlayerView.choices(c).find(x => x.choice.id.includes(topic.id))!;
      return (await s.perform(choice.choice.id)).response ?? '';
    };
    expect(await ask(/^region__edge_east_further_told_/)).toContain('the old go there to be mended and the young to be married');
    await GeneratedWorld.travel(s, 'edge_east');
    const east = await frontier.expand(c);
    await s.perform(PlayerView.choices(c).find(x => new RegExp(`^go\\(link.*${east!.rid}__edge_west\\)$`).test(x.choice.id))!.choice.id);
    expect(await ask(new RegExp(`^${east!.rid}__edge_north_beyond_told_`))).toContain('kept its shutters closed nine years');
    await GeneratedWorld.travel(s, `${east!.rid}__edge_north`);
    const drawn = await frontier.expand(c);
    expect(c.installations.find(m => m.id === drawn!.rid)?.chapter).toBe(true);
    const j = Journey.of(s);
    await j.play('Lim Bridge');
    expect(c.world.one('at', 'party')).toBe(`${drawn!.rid}__south_road`);
    // In by the bridge and up through the town, as a stranger: the chair comes down the Parade at whoever is there.
    const yard = await j.play('foot of Lim Bridge', 'Quay Lane', 'Stall Street', 'Abbey Yard');
    expect(j.page).toMatch(/comes a bath-chair/);
    expect(yard).toBeDefined();
    await j.play('Seize the side', 'Ask the old woman');
    expect(j.page).toMatch(/I am Abigail Cherrett/);
    // Left to itself, the Season ends at noon on the fifth day; the chapter closes and the company can go on.
    for (let i = 0; i < 200 && !c.world.related('reached').length; i++) { await j.play('^Wait › An hour'); }
    expect(c.world.related('reached').map(r => r.args[0])).toEqual([`${drawn!.rid}__seasons_end`]);
    expect(c.running).toBe(true);
    await j.play('To Stall Street', 'To Quay Lane', 'foot of Lim Bridge', 'south road');
    expect(c.world.one('at', 'party')).toBe(`${drawn!.rid}__south_road`);
  }, 400000);

  it('kept on the second morning and opened again, the Season goes on to the same end', async () => {
    const all = steps('rooms'), at = all.indexOf('Take a bed and supper');
    const whole = await Hessel.start(); await whole.play(...all); await whole.until();
    const split = await Hessel.start(); await split.play(...all.slice(0, at));
    const back = new Hessel(Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(split.j.session.checkpoint())))));
    await back.play(...all.slice(at)); await back.until();
    expect(back.ending()).toEqual(whole.ending());
    expect(back.j.campaign.state.elapsed).toBe(whole.j.campaign.state.elapsed);
    expect(back.holds('cherrettDanced', 'cherrett')).toBe(whole.holds('cherrettDanced', 'cherrett'));
  }, 300000);

  it('played twice from the same seed, the same steps make the same history', async () => {
    const a = await Hessel.start(build('thief'), 'twice'), b = await Hessel.start(build('thief'), 'twice');
    const some = steps('oldtown').slice(0, 40);
    await a.play(...some); await b.play(...some);
    expect(a.j.campaign.state.elapsed).toBe(b.j.campaign.state.elapsed);
    expect(a.j.taken.map(x => x.told)).toEqual(b.j.taken.map(x => x.told));
  }, 240000);
});
