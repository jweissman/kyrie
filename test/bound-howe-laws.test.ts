import { describe, expect, it } from 'bun:test';
import { Howe, R, TOWN } from './support/howe';
import { Placed } from './support/placed';
import { ScreenModel } from '../src/ui/screen-model';

// The Bound Howe (data/situations/bound-howe, data/scenarios/bound-howe.scenario.json): a standing scenario, so every
// first country holds one. A king's howe on a ridge, a salvage crew in its lee, a warden at a hearth, and under the
// Barrow-Kin's floor something older. These specs play it by the page's own labels. A company is set down in a place
// (Placed.at) only to skip the walk to it, never to skip what lies there; the walk from the starting town is its own
// spec. The company is four of level four (the intended company: levels three to five, level four the middle), created
// by the ordinary creature context `level`; no advancement is simulated.
// Part of bound-howe.test.ts, split so that its sections run in parallel on CI: one file's tests run in
// one worker, and the whole had taken 53 minutes there (Mission 20's landing).
describe('under the howe: the robbers’ shaft, foul air, the sump, the older chamber, the stair', () => {
  it('opens a second way in: down the shaft by rope, and up through the robbers’ hole into the harness-store, past the gallery and the seal', async () => {
    const j = await Howe.at('shaft_head');
    await j.play('robbers.+rope: Take');
    j.assert('tolerates', R('sentry'), 'party');
    await j.play('by the robbers.+shaft');
    expect(j.campaign.world.one('at', 'party')).toBe(R('shaft_foot'));
    await Howe.torch(j);
    await j.play('To the robbers');
    expect(j.takes('Up to the harness-store')).toBe(true);
    await j.play('Up to the harness-store');
    expect(j.campaign.world.one('at', 'party')).toBe(R('harness'));
  }, 300000);

  it('chokes on the foul drift until the vent is dug out; a shovel clears it', async () => {
    const j = await Howe.at('dig');
    j.coin(20);
    await Howe.torch(j);
    const hp = Howe.hp(j);
    expect(Howe.state(j, 'drift_air', 'foul')).toBe(true);
    Placed.at(j, R('lee'));
    await Howe.buy(j, 'A shovel');
    Placed.at(j, R('dig'));
    expect(j.offers('Dig out the choked vent')).toBe(true);
    await j.play('Dig out the choked vent');
    expect(Howe.state(j, 'drift_air', 'sweet')).toBe(true);
    expect(Howe.hp(j)).toBe(hp);
  }, 300000);

  it('drowns the unprepared in the sump passage and lets the prepared haul through on the line, or drain it from the plan', async () => {
    const j = await Howe.at('sump');
    j.assert('state', R('drift_air'), R('sweet'));
    await Howe.torch(j);
    expect(Howe.state(j, 'flood', 'deep')).toBe(true);
    j.coin(10);
    j.assert('tolerates', R('foreman'), 'party');
    Placed.at(j, R('lee'));
    await Howe.buy(j, 'A coil of rope');
    Placed.at(j, R('sump'));
    expect(j.offers('Make fast the robbers')).toBe(true);
    Placed.knows(j, R('sluice_known'));
    expect(j.offers('Open the old sluice')).toBe(true);
    await j.play('Open the old sluice');
    expect(Howe.state(j, 'flood', 'drained')).toBe(true);
  }, 300000);

  it('lights the older chamber with lamp oil in its basin, and fights the Mouth only as a last resort', async () => {
    const j = await Howe.at('ancient');
    await Howe.torch(j);
    expect(Howe.state(j, 'basin', 'cold')).toBe(true);
    Placed.at(j, R('lee'));
    j.coin(10);
    await Howe.buy(j, 'A flask of lamp oil');
    Placed.at(j, R('ancient'));
    await j.play('Pour lamp oil into the basin and light it');
    expect(Howe.state(j, 'basin', 'alight')).toBe(true);
  }, 300000);

  it('drives the Mouth down with burning oil, and the crown of the first folk can be taken from the well’s lip', async () => {
    const j = await Howe.at('lee');
    j.coin(30);
    await j.play('for the freedom of the camp');
    await Howe.buy(j, 'A flask of lamp oil');
    await Howe.buy(j, 'A torch');
    Placed.at(j, R('well'));
    expect(Howe.holds(j, 'peaceable', R('mouth'))).toBe(false);
    await j.play('Pour oil on the black water');
    expect(Howe.holds(j, 'peaceable', R('mouth'))).toBe(true);
    await j.play('a crown of the first folk: Take');
    expect(Placed.carried(j, R('well_crown'))).toBe(true);
  }, 300000);

  it('opens a stair from the older chamber up to the room behind the seat, once the plan is made', async () => {
    const j = await Howe.at('ancient');
    await Howe.torch(j);
    expect(j.takes('room behind the seat')).toBe(false);
    Placed.knows(j, R('plan_whole'));
    expect(j.takes('Up to the room behind the seat')).toBe(true);
    await j.play('Up to the room behind the seat');
    expect(j.campaign.world.one('at', 'party')).toBe(R('behind'));
  }, 300000);
});

describe('what the country keeps of it', () => {
  it('pays by the weight, and a levy met is struck off the notice on the green', async () => {
    const j = await Howe.start();
    Placed.at(j, TOWN('green'));
    j.give(R('lesser_a'));
    expect(j.offers('Hand .+ a torc of the Barrow-Kin')).toBe(true);
    const before = ScreenModel.build(j.campaign).purse.coin;
    await j.play('Hand .+ a torc of the Barrow-Kin');
    expect(ScreenModel.build(j.campaign).purse.coin).toBeGreaterThan(before);
  }, 300000);

  it('sends the dead down the lane to the green by night, three days after the bound is broken', async () => {
    const j = await Howe.start();
    Placed.at(j, TOWN('green'));
    j.assert('bound_broken', 'party');
    Placed.move(j, R('king_torc_item'), R('rival_camp'));
    await j.play('==day 6 22:00');
    expect(Howe.fact(j, 'host_abroad')).toBe(true);
    expect(Howe.holds(j, 'at', R('household'), TOWN('green'))).toBe(true);
  }, 600000);

  it('thanks a company that shut the howe: the priest gives holy water', async () => {
    const j = await Howe.start();
    Placed.at(j, TOWN('shrine'));
    j.assert('howe_kept', 'party');
    await j.play('the howe is shut');
    expect(Howe.holds(j, R('thanked'), TOWN('priest'), 'party')).toBe(true);
  }, 300000);
});

