import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';
import { ProvincePlay } from './support/province-play';
import steps from './fixtures/muster/journey.json';

// The Long Muster's Road, played by the labels a player sees. One continuous session:
//   a first start by the Low Road, turned back by a thaw;
//   a second, by the goatherds' track and the Ledge with Marra Ashgrove, the Viaduct's parapet, the Eagle, the giant
//   (paid in iron) and the gate (opened by a courier's pouch); a choice at the Prefect's tribunal that is kept;
//   and the way home by the Cohort's rope-way, the Gallery and the Old Causeway.
describe("The Long Muster's Road", () => {
  const campaign = 'data/campaigns/muster.campaign.json';

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is turned back by a thaw, crossed by one set of ways, a choice kept, and come home by another', async () => {
    const j = await Journey.start(campaign, 'muster');
    // A first start: the gorge is shut by a thaw at its bend, and the company goes back.
    await j.play(...steps.prepare_light);
    j.assert('state', 'sky', 'thaw_sky');
    await j.play(...steps.gorge);
    expect(j.find('To the flooded bend')).toBeUndefined();
    await j.play(...steps.back);
    expect(j.at('party')).toBe('muster__green');
    j.assert('state', 'sky', 'clear_sky');
    // Hire the goatherd, stock up, and go by her track and the Ledge.
    await j.play(...steps.hire, ...steps.stock);
    expect(j.holds('travelsWith', 'marra', 'party')).toBe(true);
    await j.play(...steps.first_days);
    expect(j.at('party')).toBe('muster__octavius_hall');
    // The viaduct by its parapet (pitons and a rope), and on to the Eagle's undelivered pouches.
    await j.play(...steps.viaduct);
    expect(j.at('party')).toBe('muster__eagle');
    // At the Pass the goatherd stays where the giant cannot see her; the toll is iron.
    await j.play(...steps.to_pass);
    expect(j.holds('travelsWith', 'marra', 'party')).toBe(false);
    expect(j.at('muster__marra')).toBe('muster__pass_n');
    await j.play(...steps.giant);
    expect(j.holds('tolerates', 'giant', 'party')).toBe(true);
    // The gate: the pouch, not a word.
    await j.play(...steps.gate);
    expect(j.holds('received', 'party')).toBe(true);
    // The Prefect is told; the standard is struck; a scout and a rope-way are offered; the dispatch taken.
    await j.play(...steps.valley);
    expect(j.holds('state', 'standard', 'struck')).toBe(true);
    expect(j.holds('knows', 'party', 'ropeway_known')).toBe(true);
    expect(j.holds('dispatchTaken', 'party')).toBe(true);
    // Saved and taken up again: what was told is kept.
    const again = PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint())), { trusted: true });
    expect(Journey.of(again).holds('state', 'standard', 'struck')).toBe(true);
    // Home: the rope-way over the fifth arch, the Gallery with its rotten arch tried first, the Old Causeway.
    await j.play(...steps.home);
    expect(j.at('party')).toBe('muster__green');
    expect(j.holds('state', 'third_arch', 'found')).toBe(true);
    await j.play(...steps.reeve);
    expect(j.holds('dispatchSent', 'party')).toBe(true);
  }, 290000);

  it('stoops on the open road at noon, and is kept down by a high wind', async () => {
    const j = await Journey.start(campaign, 'muster');
    j.put('party', 'high2');
    j.assert('state', 'sky', 'wind_sky');
    await j.play('=11:30');
    expect(j.holds('stooped', 'party')).toBe(false);
    const k = await Journey.start(campaign, 'muster');
    k.put('party', 'high2');
    await k.play('=11:30');
    expect(k.holds('stooped', 'party')).toBe(true);
  }, 120000);

  it('offers a rope-way over the fifth arch only to those the Cohort counts friends, and takes the goatherd back at the Pass', async () => {
    const j = await Journey.start(campaign, 'muster');
    j.put('party', 'via_s');
    await j.play('Wait › A while');
    expect(j.matches('To the north head of the Viaduct')).toHaveLength(0);
    j.assert('knows', 'party', 'ropeway_known');
    await j.play('Wait › A while');
    expect(j.matches('To the north head of the Viaduct')).toHaveLength(1);
    j.put('party', 'pass_n');
    j.put('marra', 'pass_n');
    j.assert('willing', 'marra', 'party');
    await j.play('Wait › A while');
    expect(j.find('Ask Marra Ashgrove to join the company')).toBeDefined();
  }, 120000);

  it('closes the Ledge under snow', async () => {
    const j = await Journey.start(campaign, 'muster');
    j.assert('state', 'sky', 'snow_sky');
    j.put('party', 'ledge1');
    await j.play('Wait › A while');
    expect(j.find('To the end of the Ledge')).toBeUndefined();
  }, 120000);

  it('is heard of, walked into with the world\'s own company, and kept', async () => {
    const { s, c, told, k } = await ProvincePlay.enter('b2', 'muster',
      { origin: 'wanderer', party: [{ name: 'Morwen', raceId: 'human', classId: 'warrior' }] });
    expect(told).toContain('Hesper');
    expect(c.installed).toContain('pmuster');
    const j = Journey.of(s);
    await j.play('To Kell green');
    expect(c.world.one('at', 'party')).toBe(k('green'));
    const again = PlaySession.resume(JSON.parse(JSON.stringify(s.checkpoint())), { trusted: true });
    expect(again.campaign.world.one('at', 'party')).toBe(k('green'));
  }, 600000);
});
