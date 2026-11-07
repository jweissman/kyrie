import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import { PlaySession } from '../src/session/play-session';
import { ProvincePlay } from './support/province-play';
import steps from './fixtures/muster/journey.json';

// The Long Muster's Road, played by the labels a player sees. One continuous session:
//   a second, by the goatherds' track and the Ledge with Marra Tellis, the Viaduct's parapet, the Eagle, the giant
//   (paid in iron) and the gate (opened by a courier's pouch); a choice at the Prefect's tribunal that is kept;
//   and the way home by the Cohort's rope-way, the Gallery and the Old Causeway.
describe("The Long Muster's Road", () => {
  const campaign = 'data/campaigns/muster.campaign.json';

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is crossed by one set of ways, a choice kept, and come home by another', async () => {
    const j = await Journey.start(campaign, 'muster');
    await j.play(...steps.prepare_light);
    // Hire the goatherd, stock up, and go by her track and the Ledge.
    await j.play(...steps.hire, ...steps.stock);
    expect(j.holds('travelsWith', 'marra', 'party')).toBe(true);
    await j.play(...steps.first_days);
    expect(j.at('party')).toBe('muster__octavius_hall');
    // Marra asks, at Octavius, whether the company would want to know; the answer is kept.
    await j.play('Ask Marra what she is looking for on the far side', 'Say that you would want to know, whatever it was');
    expect(j.measure('marraTrust', 'marra')).toBe(1);
    // The viaduct by its parapet (pitons and a rope), and on to the Eagle's undelivered pouches.
    await j.play(...steps.viaduct);
    expect(j.at('party')).toBe('muster__eagle');
    expect(j.holds('lineFixed', 'party')).toBe(true);
    await j.play('Ask Marra about the letters on the arch', 'Tell her to come on: it is her brother\'s road too');
    // At the Pass the goatherd stays where the giant cannot see her; the toll is iron.
    await j.play(...steps.to_pass);
    // Her trust is high enough now: she does not hide from the giant.
    expect(j.holds('travelsWith', 'marra', 'party')).toBe(true);
    await j.play(...steps.giant);
    expect(j.holds('tolerates', 'giant', 'party')).toBe(true);
    // The gate: the pouch, not a word.
    await j.play('To the head of the descent');
    await j.play(...steps.deserters);
    expect(j.holds('marcusMet', 'party')).toBe(true);
    await j.play(...steps.gate.slice(1));
    expect(j.holds('foundPouch', 'party')).toBe(true);
    expect(j.holds('knows', 'party', 'ropeway_known')).toBe(false);
    // The Prefect is told; the standard is struck; a scout and a rope-way are offered; the dispatch taken.
    await j.play(...steps.valley);
    expect(j.holds('received', 'party')).toBe(true);
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
