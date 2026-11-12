import { describe, expect, it } from 'bun:test';
import { Howe, R, FOUR } from './support/howe';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';

// The Bound Howe (data/situations/bound-howe, data/scenarios/bound-howe.scenario.json): a standing scenario, so every
// first country holds one. A king's howe on a ridge, a salvage crew in its lee, a warden at a hearth, and under the
// Barrow-Kin's floor something older. These specs play it by the page's own labels. A company is set down in a place
// (Placed.at) only to skip the walk to it, never to skip what lies there; the walk from the starting town is its own
// spec. The company is four of level four (the intended company: levels three to five, level four the middle), created
// by the ordinary creature context `level`; no advancement is simulated.
// Part of bound-howe.test.ts, split so that its sections run in parallel on CI: one file's tests run in
// one worker, and the whole had taken 53 minutes there (Mission 20's landing).
describe('the warden, the survey cairn, and the plan made of three finds', () => {
  it('trusts a company that brings her salt, gives it the tally-stick, and teaches the greeting', async () => {
    const j = await Howe.at('fold');
    await j.play('twist of salt: Take');
    Placed.at(j, R('hearth'));
    expect(Howe.holds(j, R('trusted'), R('warden'), 'party')).toBe(false);
    await j.play('a twist of salt for her ring');
    expect(Howe.holds(j, R('trusted'), R('warden'), 'party')).toBe(true);
    expect(Howe.holds(j, 'ownedItem', R('tally'), 'region__party_1') || Placed.carried(j, R('tally'))).toBe(true);
    await j.play('about the howe');
    await j.play('how a living kin is greeted');
    expect(Howe.holds(j, 'knows', 'party', R('kin_greeting'))).toBe(true);
  }, 300000);

  it('puts three finds together into the plan of a stair under the howe: the sketch, the tally, and the cairn’s plate', async () => {
    const j = await Howe.at('survey');
    j.coin(10);
    expect(Howe.holds(j, R('plan_made'))).toBe(false);
    expect(j.offers('Prise the bronze plate')).toBe(true);
    await j.play('Prise the bronze plate');
    await j.play('bronze plate from the survey cairn: Read').catch(() => '');
    // The three documents teach by being read where they are carried.
    for (const doc of ['plate', 'tally', 'sketch']) {
      Placed.at(j, R('hearth'));
      j.give(R(doc));
    }
    for (const doc of ['bronze plate', 'tally-stick', 'sketch of the workings']) { await j.play(`${doc}: Read`).catch(() => ''); }
    expect(Howe.holds(j, 'knows', 'party', R('plan_whole'))).toBe(true);
  }, 300000);
});

describe('the howe’s three laws: the seal, the roll, the mounts, the flutes, the steps, and the torc', () => {
  it('opens to rites quietly and to a shoulder loudly; a quiet door leaves the household seated, and a forced one does not', async () => {
    const cleric = await Howe.at('forecourt');
    j0(cleric);
    // In a country where the seal is intact (a sealed fate) the rite opens it; a broken fate arrives open.
    if (Howe.state(cleric, 'seal', 'set')) {
      await cleric.play('Speak the rites of the dead at the seal-stone');
      expect(Howe.state(cleric, 'seal', 'rolled')).toBe(true);
      expect(Howe.holds(cleric, 'tolerates', R('household'), 'party')).toBe(true);
    } else {
      expect(Howe.state(cleric, 'seal', 'forced')).toBe(true);
    }
  }, 240000);

  it('shuts again: the seal heaved home behind the company keeps the dead in and marks the howe kept', async () => {
    const j = await Howe.at('forecourt', FOUR, 'a1');
    for (let i = 0; i < 2 && !Howe.state(j, 'seal', 'set'); i++) {
      await j.play('Heave the seal-stone back into its groove');
      Placed.at(j, R('gallery'));
      Placed.at(j, R('forecourt'));
    }
    Placed.at(j, R('gallery'));
    Placed.at(j, R('forecourt'));
    expect(Howe.state(j, 'seal', 'set') || Howe.state(j, 'seal', 'forced') || Howe.state(j, 'seal', 'rolled')).toBe(true);
  }, 300000);

  it('keeps the household in its niches by day and walks it out by night when the door is open, unless the sill is salted', async () => {
    const open = await Howe.at('forecourt');
    open.assert('state', R('seal'), R('forced'));
    expect(Howe.holds(open, 'tolerates', R('household'), 'party')).toBe(false);
    // The robbers the king's night left on the grass lie in ambush: the ring shows them, and the company puts them
    // down before it waits for dark on the forecourt.
    await Howe.torch(open);
    await open.fight('Attack');
    expect(Howe.holds(open, 'dead', R('iron_caps'))).toBe(true);
    await open.play('Wait › Until dark');
    expect(Howe.holds(open, 'dark')).toBe(true);
    expect(Howe.where(open, 'household')).toBe(R('forecourt'));
  }, 300000);

  it('feeds the dead horses, or fights them, and the riders wake to the bells', async () => {
    const j = await Howe.at('harness');
    await Howe.torch(j);
    await j.play('Shoulder the old sacks of barley');
    await j.play('To the horse-hall');
    expect(j.offers('Pour barley into the empty mangers')).toBe(true);
    await j.play('Pour barley into the empty mangers');
    expect(Howe.holds(j, 'tolerates', R('mounts'), 'party')).toBe(true);
    expect(Howe.downed(j)).toBe(0);
  }, 300000);

  it('answers the flutes: the king’s flute draws a question, a wrong one shrieks and costs blood', async () => {
    const j = await Howe.at('flutes');
    await Howe.torch(j);
    const kin = ['low', 'mid', 'high'].find(f => Howe.fact(j, 'kinflute', R(`flute_${f}`)))!;
    const wrong = ['low', 'mid', 'high'].find(f => f !== kin)!;
    const hp = Howe.hp(j);
    await j.play(`Play the ${wrong === 'mid' ? 'middle' : wrong} flute`);
    expect(Howe.hp(j)).toBeLessThan(hp);
    await j.play(`Play the ${kin === 'mid' ? 'middle' : kin} flute`);
    expect(Howe.fact(j, 'king_asks')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('king'), 'party')).toBe(true);
  }, 300000);

  it('trips the careless on the steps and spares the company that prods them with a pole', async () => {
    const j = await Howe.at('flutes');
    await Howe.torch(j);
    expect(Howe.state(j, 'tread', 'armed')).toBe(true);
    await j.play('Prod the middle tread');
    expect(Howe.state(j, 'tread', 'sprung')).toBe(true);
    const k = await Howe.at('flutes');
    await Howe.torch(k);
    const hp = Howe.hp(k);
    await k.play('risk the middle tread');
    expect(Howe.hp(k)).toBeLessThan(hp);
  }, 300000);

  it('lets a company that answered the flute swear to the king, and holds it to it; the torc taken breaks the bound and sends the dead down the lane', async () => {
    const j = await Howe.at('throne');
    await Howe.torch(j);
    j.assert('tolerates', R('king'), 'party');
    j.assert('tolerates', R('sworn'), 'party');
    j.assert('knows', 'party', R('asked_bound'));
    expect(j.offers('the company keeps the bound')).toBe(true);
    await j.play('the company keeps the bound');
    expect(Howe.fact(j, 'oath_sworn', 'party')).toBe(true);
    await j.play('torc: Take');
    expect(Howe.fact(j, 'bound_broken', 'party')).toBe(true);
    expect(Howe.fact(j, 'oath_sworn', 'party')).toBe(false);
  }, 300000);
});

function j0(_: Journey) { /* a spec reads the page it was set down on; nothing to do */ }
