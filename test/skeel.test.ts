import { describe, expect, it } from 'bun:test';
import { KyrLint } from '../src/cli/kyr-lint';
import { NodeBundleSource } from '../src/campaign/node-bundle-source';
import { Reach, home, k } from './support/skeel';

// Fair Weather (doc/adventures/fair-weather), played by the labels a player sees from the steps in
// test/fixtures/skeel. Each test is one way the three days can go. The company comes down the coast road at eight on
// the first morning (watch 0); the Wreck Court sits at four on the third (watch 336); the third ebb gives back the
// drowned before dawn on the fourth; and the ending is told when Ferrar's packet sails, at six on the fourth evening
// (watch 492).
describe('Fair Weather', () => {
  it('lints clean', async () => {
    const findings = await KyrLint.campaign(home, new NodeBundleSource());
    expect(findings.filter(f => f.level === 'error' || f.level === 'warning')).toEqual([]);
  }, 120000);

  it('keeps its tide: the Strand dry four hours, the harbour dry with it, an hour later each day', async () => {
    const g = await Reach.start();
    // Eight in the morning of the first day: the sea is in, boats sail, the withy way is shut.
    await g.play('^To Fore Street', '^To the quay', '^To the Slip');
    expect(g.j.matches('^To the open Strand').length).toBe(0);
    await g.play('=until lowWater()');
    expect(g.j.campaign.state.elapsed).toBe(6);
    expect(g.j.matches('^To the open Strand').length).toBe(1);
    // A company out on the sand when the sea comes is struck by it, and a crossing begun is a crossing finished.
    await g.play('^To the open Strand', '=until not lowWater()', '=+1');
    expect(g.holds('caughtByFlood', 'party')).toBe(true);
    await g.play('^To the Slip');
    expect(g.at('party')).toBe(k('slip'));
    // On the second day low water comes an hour later.
    await g.play('=day 2 09:30');
    expect(g.measure('lag', 'reach')).toBe(1);
    expect(g.j.matches('^To the open Strand').length).toBe(0);
    await g.play('=until lowWater()');
    expect(g.j.campaign.state.elapsed).toBe(144 + 12);
  }, 240000);

  it('the Pilots: dog, rutter, Loveday asks him, Nye and Ewan at the Court, and Kerensa says what it is for', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('pilots');
    expect(g.holds('henderConfessed', 'hender')).toBe(true);
    expect(g.holds('confessedAlone', 'hender')).toBe(false);
    expect(g.holds('rutterWritten', 'reach')).toBe(true);
    expect(g.holds('crewNamed', 'reach')).toBe(true);
    expect(g.holds('letterTruth', 'ewan')).toBe(true);
    expect(g.holds('notWreck', 'reach')).toBe(true);
    expect(g.holds('lovedayKept', 'reach')).toBe(true);
    expect(g.ending()).toEqual([k('pilots')]);
    expect(g.page).toMatch(/Did you put the sea in my oil/);
    expect(g.page).toMatch(/PILOTS OF THE REACH|Twelve Gigs/);
    // The third ebb: Matthew Ferrar found among the drowned, and his sister comes down the Slip.
    expect(g.holds('matthewHome', 'constance')).toBe(true);
    expect(g.page).toMatch(/Well, Mattie/);
  }, 600000);

  it('The Godson, sent: the Reeve told to row out and tell Loveday himself, and refusing to say wreck', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('godson');
    expect(g.knows('hender_did')).toBe(true);
    expect(g.holds('confessedAlone', 'hender')).toBe(true);
    expect(g.holds('notWreck', 'reach')).toBe(true);
    expect(g.ending()).toEqual([k('godson')]);
    expect(g.page).toMatch(/I will not say it/);
  }, 600000);

  it('Kerensa, asked in the loft though she said not to: she stands, and the false light makes the ship no wreck', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('kerensa');
    expect(g.knows('kerensa_saw')).toBe(true);
    expect(g.holds('kerensaSpoke', 'party')).toBe(true);
    expect(g.holds('notWreck', 'reach')).toBe(true);
    expect(g.ending()).toEqual([k('exposed')]);
  }, 600000);

  it('Loveday\'s eyes: the crate bought at the sale, a pair of spectacles, and the first thing she sees is the sea in her oil', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('eyes');
    expect(g.holds('crateBought', 'party')).toBe(true);
    expect(g.holds('lovedaySees', 'loveday')).toBe(true);
    expect(g.knows('oil_watered')).toBe(true);
    expect(g.holds('henderConfessed', 'hender')).toBe(true);
    expect(g.page).toMatch(/takes off the spectacles/);
  }, 600000);

  it('A Living Thing: the dog brought up the loft, and the Court laughs, and stops', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('living');
    expect(g.holds('dogFriend', 'party')).toBe(true);
    expect(g.holds('livingShown', 'reach')).toBe(true);
    expect(g.holds('lovedayOff', 'reach')).toBe(true);
    expect(g.ending()).toEqual([k('living')]);
    expect(g.page).toMatch(/His name.s Admiral/);
  }, 600000);

  it('The Light in the Pulpit: the boy brought from the Skerry points at the Reeve', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('exposed');
    expect(g.holds('henderExposed', 'hender')).toBe(true);
    expect(g.ending()).toEqual([k('exposed')]);
    expect(g.page).toMatch(/He held his lamp up and he saw me/);
  }, 600000);

  it('A Stranger\'s Share: the Reeve\'s offer taken, the dog drowned, the ship called wreck', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('share');
    expect(g.holds('dogDrowned', 'admiral')).toBe(true);
    expect(g.holds('wreckDeclared', 'reach')).toBe(true);
    expect(g.holds('portioned', 'party')).toBe(true);
    expect(g.ending()).toEqual([k('share')]);
  }, 600000);

  it('Wreck, While You Were Away: a company that never comes to Skeel hears of it on the road', async () => {
    const g = await Reach.start();
    await g.fixture('away');
    expect(g.holds('wreckDeclared', 'reach')).toBe(true);
    expect(g.holds('lovedayOff', 'reach')).toBe(true);
    expect(g.ending()).toEqual([k('away')]);
  }, 600000);

  it('the Craigs: round by the cliff road, Piran taken up the edge to the Pulpit, and the Gannet Supper', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('craigs');
    expect(g.holds('piranUp', 'piran')).toBe(true);
    expect(g.knows('hook_found')).toBe(true);
    expect(g.holds('piranFell', 'piran')).toBe(false);
    expect(g.holds('sang', 'party')).toBe(true);
  }, 600000);

  it('left alone, Piran climbs on the second night and falls; the Cawse lads net the dog and the Reeve pens it', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.play('^To the cliff road', '^To the climbers\' camp', 'Talk to Piran', 'what he saw', 'what he means to do', '=day 2 21:30');
    expect(g.holds('piranFell', 'piran')).toBe(true);
    expect(g.at('piran')).toBe(k('ledges'));
    expect(g.holds('dogPenned', 'admiral')).toBe(true);
    expect(g.at('admiral')).toBe(k('wreck_house'));
  }, 600000);

  it('the Cawse lads on the Strand: warned, and paid off', async () => {
    const g = await Reach.start('data/campaigns/skeel.campaign.json', 's1');
    await g.fixture('lads');
    expect(g.page).toMatch(/Stand off, stranger/);
    await g.play('Pay the Cawse lads');
    expect(g.holds('huntOver', 'reach')).toBe(true);
    expect(g.holds('dogPenned', 'admiral')).toBe(false);
  }, 600000);
});
