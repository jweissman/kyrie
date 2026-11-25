import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import steps from './fixtures/goingbank/journey.json';

// The Going Bank, played by the labels a player sees: the Plait, the east bank that is going, and the three days
// before the Plait parts. Each test is one way the three days can go.
describe("The Going Bank", () => {
  const campaign = 'data/campaigns/goingbank.campaign.json';
  const start = async () => Journey.start(campaign, "goingbank");
  const reached = (j: Journey, ending: string) => j.holds('reached', 'goingbank__' + ending);
  const known = (j: Journey, fact: string) => j.holds('knows', 'party', 'goingbank__' + fact);

  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);

  it('is played from the road to the windlass, where a girl sits with her feet on the Plait', async () => {
    const j = await start();
    await j.play(...steps.arrive);
    expect(j.at('party')).toBe("goingbank__lip_end");
    expect(j.page).toContain('Pipit');
  }, 60000);

  it('gets the cord out of Sabra by what the boards show, and by nothing else', async () => {
    const j = await start();
    await j.play(...steps.arrive);
    j.roll('fail');
    await j.play('^Into the plaiters', 'Talk to Sabra', 'Ask Sabra about the knot', 'Tell Sabra that the boards');
    expect(known(j, 'cord_known')).toBe(false);
    j.roll('pass');
    await j.play('Tell Sabra that the boards');
    expect(known(j, 'cord_known')).toBe(true);
    expect(j.page).toContain('Forty-one springs');
  }, 120000);

  it('sees the east wall breathe from the ledge', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.breath);
    expect(known(j, 'walker_known')).toBe(true);
  }, 120000);

  it('reads the cairns on the green as a ranger', async () => {
    const j = await start();
    await j.play(...steps.arrive, ...steps.cross);
    expect(j.latest).toContain('They are not on it');
    expect(known(j, 'cairns_known')).toBe(true);
  }, 120000);

  it('takes Varnish down to the wall, and he does not drive the pins', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.cord, ...steps.varnish);
    expect(j.holds('pinsDown', 'party')).toBe(true);
    await j.play('=day 3 19:00');
    expect(j.holds('state', 'goingbank__pin_iron', 'goingbank__staked')).toBe(false);
  }, 180000);

  it('goes by the honest road to the harbour: the wall, the drum, the reeve, the vows', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.cord, ...steps.breath, ...steps.varnish, ...steps.cross, ...steps.meggan, '=day 1 17:30', ...steps.strike);
    expect(j.holds('answered', 'party')).toBe(true);
    await j.play('Take your leave', '^To Ketter green', ...steps.reeve, ...steps.ride);
    expect(j.holds('ketterRides', 'party')).toBe(true);
    await j.play('=day 3 18:00', ...steps.toJoin, 'Stand witness for Tamsy and Fell');
    expect(j.holds('wed', 'party')).toBe(true);
    expect(j.latest).toContain('wherever the span goes');
    await j.play('=day 4 06:00');
    expect(reached(j, 'harbour')).toBe(true);
    expect(j.page).toContain('Wend Strand');
    expect(j.page).toContain('Concerning a Hill');
    expect(j.page).toContain('last knot of the green cord');
  }, 300000);

  it('lets the pins be driven if Varnish is left alone, and the bank tears', async () => {
    const j = await start();
    await j.play(...steps.arrive, '=day 4 06:00');
    expect(reached(j, 'iron_in_shoulder')).toBe(true);
  }, 120000);

  it('ends in neither bank when nobody is told and the pins are kept out', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.cord, ...steps.varnish, '=day 4 06:00');
    expect(reached(j, 'neither_bank')).toBe(true);
  }, 240000);

  it('flies the Gape in the kite at dusk, once weighed', async () => {
    const j = await start();
    await j.play(...steps.arrive, '^To Halloway', 'Talk to Bettony');
    await j.play('Take your leave', 'Be weighed');
    j.roll('pass');
    await j.play('=day 1 17:30', 'Fly the Gape');
    expect(j.at('party')).toBe('goingbank__landing');
  }, 180000);

  it('rides without having answered the hill, and it is a hard going', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.cord, ...steps.breath, ...steps.varnish, ...steps.cross, ...steps.meggan, 'Take your leave', '^To Ketter green', ...steps.reeve, ...steps.ride, '=day 4 06:00');
    expect(reached(j, 'hard_ride')).toBe(true);
  }, 300000);

  it('lays a hand-line on the second day, and Ketter crosses by it', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.cord, ...steps.breath, ...steps.varnish, '=day 2 07:00', '^To the west stub', '^To the Join', 'Rig a hand-line');
    expect(j.holds('state', 'goingbank__walkway', 'goingbank__roped')).toBe(true);
    await j.play('^To the east stub', '^To Ketter landing', '^To Ketter green', ...steps.reeve, ...steps.crossing, '=day 4 06:00');
    expect(reached(j, 'across_gap')).toBe(true);
    expect(j.page).toContain('cuts the Plait, clean');
  }, 300000);

  it('sends Ketter across a bare guide-rope, and the old are left on the bank', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.cord, ...steps.breath, ...steps.varnish, '=day 2 07:00', '^To the west stub', '^To the Join', '^To the east stub', '^To Ketter landing', '^To Ketter green', ...steps.reeve, ...steps.crossing, '=day 4 06:00');
    expect(reached(j, 'half_bank')).toBe(true);
  }, 300000);

  it('tells both banks at the Knotting, with the wall in hand', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.breath, ...steps.varnish, '=day 3 18:00', '^To the west stub', '^To the Join', 'Say to both banks what you know');
    expect(j.holds('truthPublic', 'party')).toBe(true);
    expect(j.holds('reeveTold', 'party')).toBe(true);
    expect(j.latest).toContain('We will count');
  }, 240000);

  it('is not believed at the Knotting when the word will not come off', async () => {
    const j = await start();
    j.roll('fail');
    await j.play(...steps.arrive, ...steps.breath, ...steps.varnish, '=day 3 18:00', '^To the west stub', '^To the Join', 'Say to both banks what you know');
    expect(j.holds('truthPublic', 'party')).toBe(false);
    expect(j.latest).toContain('The wet');
  }, 240000);

  it('can drag the pins out of the shelf before dawn, and the bank only lurches', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, '^To Halloway', 'Buy a crowbar', '^To the windlass', ...steps.cross, '=day 3 18:30', '^To Ketter landing');
    expect(j.holds('state', 'goingbank__pin_iron', 'goingbank__staked')).toBe(true);
    await j.play('Wrench the pins out of the shelf');
    expect(j.latest).toContain('lurches');
    await j.play('=day 4 06:00');
    expect(reached(j, 'iron_in_shoulder')).toBe(false);
    expect(reached(j, 'neither_bank')).toBe(true);
  }, 300000);

  it('talks Varnish out of it on the east shelf, with what the wall showed', async () => {
    const j = await start();
    j.roll('pass');
    await j.play(...steps.arrive, ...steps.breath, '=day 2 13:00', ...steps.cross.slice(0, 4), 'Talk to Magne', 'Tell Varnish what you saw');
    expect(j.holds('pinsDown', 'party')).toBe(true);
    await j.play('=day 4 06:00');
    expect(reached(j, 'iron_in_shoulder')).toBe(false);
  }, 240000);
});
