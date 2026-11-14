import { describe, expect, it } from 'bun:test';
import { Howe, R, FOUR, company, levelled } from './support/howe';
import { Placed } from './support/placed';

// The Bound Howe (data/situations/bound-howe, data/scenarios/bound-howe.scenario.json): a standing scenario, so every
// first country holds one. A king's howe on a ridge, a salvage crew in its lee, a warden at a hearth, and under the
// Barrow-Kin's floor something older. These specs play it by the page's own labels. A company is set down in a place
// (Placed.at) only to skip the walk to it, never to skip what lies there; the walk from the starting town is its own
// spec. The company is four of level four (the intended company: levels three to five, level four the middle), created
// by the ordinary creature context `level`; no advancement is simulated.
// Part of bound-howe.test.ts, split so that its sections run in parallel on CI: one file's tests run in
// one worker, and the whole had taken 53 minutes there (Mission 20's landing).
describe('the howe sealed from within (a1) and left broken (d4): the laws hold either way', () => {
  it('opens to rites quietly: the household stays seated, and the stone heaved home again marks the howe kept', async () => {
    const j = await Howe.at('forecourt', FOUR, 'a1');
    expect(Howe.state(j, 'seal', 'set')).toBe(true);
    await j.play('Speak the rites of the dead at the seal-stone');
    expect(Howe.state(j, 'seal', 'rolled')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('household'), 'party')).toBe(true);
    await Howe.torch(j);
    await j.play('To the gallery of kings');
    expect(Howe.holds(j, 'dead', R('household'))).toBe(false);
    await j.play('To the forecourt of the howe');
    await j.play('Heave the seal-stone back into its groove');
    expect(Howe.state(j, 'seal', 'set')).toBe(true);
    await j.play('==+1').catch(() => '');
    expect(Howe.fact(j, 'howe_kept', 'party')).toBe(true);
  }, 300000);

  it('opens to a shoulder loudly: the household rises, and four of level four put it down', async () => {
    const j = await Howe.at('forecourt', FOUR, 'a1');
    await j.play('Put your shoulders to the seal-stone');
    expect(Howe.state(j, 'seal', 'forced')).toBe(true);
    await Howe.torch(j);
    await j.play('To the gallery of kings');
    await j.fight('Attack');
    expect(Howe.holds(j, 'dead', R('household'))).toBe(true);
    expect(Howe.downed(j)).toBeLessThan(2);
  }, 300000);

  it('opens to a greeting a warrior was taught, and to the roll called into a door that is already open', async () => {
    const warrior = await Howe.at('forecourt', company('warrior'), 'a1');
    expect(warrior.offers('Speak the rites of the dead')).toBe(false);
    Placed.knows(warrior, R('kin_greeting'));
    Placed.knows(warrior, R('king_named'));
    expect(warrior.offers('Give the king')).toBe(true);
    await warrior.play('Give the king');
    expect(Howe.state(warrior, 'seal', 'rolled')).toBe(true);
    const forced = await Howe.at('forecourt', company('warrior'), 'd4');
    await forced.play('Wait › A while');
    expect(Howe.state(forced, 'seal', 'forced')).toBe(true);
    expect(forced.offers('Call the roll of kings')).toBe(true);
    await forced.play('Call the roll of kings');
    expect(Howe.holds(forced, 'tolerates', R('household'), 'party')).toBe(true);
  }, 300000);

  it('keeps the household in by a line of salt across the sill, though the door stands open at night', async () => {
    const j = await Howe.at('forecourt');
    await Howe.torch(j);
    await j.fight('Attack');
    j.give(R('salt_lick'));
    expect(j.offers('Lay a line of salt across the howe')).toBe(true);
    await j.play('Lay a line of salt across the howe');
    await j.play('Wait › Until dark');
    expect(Howe.holds(j, 'dark')).toBe(true);
    expect(Howe.where(j, 'household')).toBe(R('gallery'));
  }, 300000);

  it('lets the first folk’s stair bring a company up into the room behind the seat, where the last of the Kin lie, and the stone is drawn aside from within', async () => {
    const j = await Howe.at('ancient', FOUR, 'a1');
    await Howe.torch(j);
    Placed.knows(j, R('plan_whole'));
    await j.play('Up to the room behind the seat');
    expect(Howe.holds(j, 'dead', R('last'))).toBe(false);
    expect(Howe.where(j, 'last')).toBe(R('behind'));
    expect(j.offers('Draw the stone aside')).toBe(true);
    await j.play('Draw the stone aside');
    expect(Howe.state(j, 'lastseal', 'open')).toBe(true);
    expect(Howe.fact(j, 'bound_broken', 'party')).toBe(false);
  }, 300000);

  it('costs the bound to break the stone from the throne side', async () => {
    const j = await Howe.at('throne', FOUR, 'a1');
    await Howe.torch(j);
    j.assert('tolerates', R('king'), 'party');
    j.assert('tolerates', R('sworn'), 'party');
    await j.play('Break through the stone behind the seat');
    expect(Howe.fact(j, 'bound_broken', 'party')).toBe(true);
  }, 300000);
});

describe('what the howe asks of a company, by level', () => {
  // The curve moved when a mage could cast what she knows (OP-05, 15 November): four of the third level had been killed
  // here, and now come through (at the second, one falls); four of the first still die. The howe's asking level is a
  // balance question for the rules line (register §45).
  it('kills four of level one in the horse-hall unfed, and is taken by four of level four', async () => {
    const low = await Howe.at('gallery', levelled(1, 'warrior', 'cleric', 'thief', 'mage'));
    await Howe.torch(low);
    low.assert('tolerates', R('household'), 'party');
    await low.play('To the horse-hall');
    await low.fight('Attack').catch(() => '');
    expect(Howe.downed(low)).toBeGreaterThan(1);
    const four = await Howe.at('gallery');
    await Howe.torch(four);
    four.assert('tolerates', R('household'), 'party');
    await four.play('To the horse-hall');
    await four.fight('Attack');
    expect(Howe.holds(four, 'dead', R('mounts'))).toBe(true);
    expect(Howe.downed(four)).toBeLessThan(2);
  }, 300000);
});


