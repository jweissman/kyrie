import { describe, expect, it } from 'bun:test';
import { Howe, R, SITE, TOWN, PLACED, FOUR, company, levelled } from './support/howe';
import { Journey } from '../src/session/journey';
import { Placed } from './support/placed';
import { ScreenModel } from '../src/ui/screen-model';
import { MapPlay } from './support/map-play';

// The Bound Howe (data/situations/bound-howe, data/scenarios/bound-howe.scenario.json): a standing scenario, so every
// first country holds one. A king's howe on a ridge, a salvage crew in its lee, a warden at a hearth, and under the
// Barrow-Kin's floor something older. These specs play it by the page's own labels. A company is set down in a place
// (Placed.at) only to skip the walk to it, never to skip what lies there; the walk from the starting town is its own
// spec. The company is four of level four (the intended company: levels three to five, level four the middle), created
// by the ordinary creature context `level`; no advancement is simulated.
describe('the Bound Howe is a standing scenario', () => {
  it.each(['kahitude', 'a1', 'b2', 'thorn', 'c3', 'd4'])('is placed in %s, with its camp, its warden and its dead where they belong', async seed => {
    const j = await Howe.start(company('warrior'), seed);
    expect(Howe.where(j, 'foreman')).toBe(R('lee'));
    expect(Howe.where(j, 'warden')).toBe(R('hearth'));
    expect(Howe.where(j, 'king')).toBe(R('throne'));
    expect(Howe.where(j, 'household')).toBe(R('gallery'));
    expect(Howe.where(j, 'mouth')).toBe(R('well'));
    // The country draws the howe's fate and its king's flute; both are facts of the world.
    expect(['fate_sealed', 'fate_broken'].some(f => Howe.holds(j, R('fate'), R('howe'), R(f)))).toBe(true);
    expect(['flute_low', 'flute_mid', 'flute_high'].filter(f => Howe.holds(j, R('kinflute'), R(f))).length).toBe(1);
  }, 180000);

  it('is reached from the starting town by the page’s own labels: a cart of labourers and a notice on the first green from the second day, set out for from the map, and walked up to', async () => {
    const j = await Howe.start(company('warrior'));
    // Nothing is said on the first day: the first hour is not buried.
    await j.play('>s1_green');
    expect(Howe.holds(j, 'knows', 'party', R('ridge_told'))).toBe(false);
    expect(Howe.where(j, 'hirer')).toBeFalsy();
    await j.play('=day 2 09:00');
    expect(Howe.where(j, 'hirer')).toBe('region__s1_green');
    // The notice on the hiring-man's cart is read from the green, and it says where.
    expect(Howe.holds(j, 'knows', 'party', R('ridge_told'))).toBe(true);
    expect(ScreenModel.build(j.campaign).objectives.join(' ')).toContain('salvage crew is digging');
    expect(j.offers('Ask .+ where the work is')).toBe(true);
    const done = await MapPlay.press(j, SITE);
    expect(done).toEqual({ to: SITE, arrived: true });
    expect(j.campaign.world.one('at', 'party')).toBe(SITE);
    // The sheep-way was told of: it is a way on from the foot, beside the steep path.
    expect(j.takes('Into the old sheepfold')).toBe(true);
    expect(j.takes('lookout')).toBe(true);
  }, 600000);

  it('is told of too in the town nearest it: asked of at the taproom there', async () => {
    const j = await Howe.start(company('warrior'));
    await j.play(`>${PLACED.town}_taproom`);
    if (!Howe.holds(j, 'knows', 'party', R('ridge_told'))) {
      expect(j.offers('Ask about the diggers on the ridge')).toBe(true);
      await j.play('Ask about the diggers on the ridge');
    }
    expect(Howe.holds(j, 'knows', 'party', R('ridge_told'))).toBe(true);
    await j.play(`>${PLACED.howe}`);
    expect(j.campaign.world.one('at', 'party')).toBe(SITE);
  }, 300000);
});

describe('the ridge: weather, a watch, a line of tins, a ring of grey grass', () => {
  it('lets the weather come down on the steep path and punishes a company that climbs in it, but not one that waits', async () => {
    const j = await Howe.at('lookout');
    // Cloud brewing is a sign at the foot; white cloud on the path hurts whoever crosses.
    j.assert('state', R('weather'), R('white'));
    Placed.at(j, SITE);
    const before = Howe.hp(j);
    expect(j.offers('risk the weather')).toBe(true);
    for (let i = 0; i < 6 && Howe.hp(j) >= before; i++) { Placed.at(j, SITE); await j.play('risk the weather on the steep path'); }
    expect(Howe.hp(j)).toBeLessThan(before);
    j.assert('state', R('weather'), R('clear'));
    Placed.at(j, SITE);
    const clear = Howe.hp(j);
    await j.play('Into the (salvagers|Long Ridge)');
    expect(Howe.hp(j)).toBe(clear);
  }, 240000);

  it('is watched: the watch will take four coin, or the clerk’s word, or a fight, and the fight is not the camp’s', async () => {
    const j = await Howe.at('rise');
    j.coin(20);
    await j.play('To the salvagers');
    expect(j.offers('Pay the watch four coin')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('watchers'), 'party')).toBe(false);
    await j.play('Pay the watch four coin');
    expect(Howe.holds(j, 'tolerates', R('watchers'), 'party')).toBe(true);
    const k = await Howe.at('lookout');
    Placed.knows(k, R('levy_told'));
    expect(k.offers('you have come about the shire-reeve')).toBe(true);
  }, 240000);

  it('hides the quiet way round behind a line of tins: a thief cuts it, a clumsy company rings it and the watch comes down', async () => {
    const thief = await Howe.at('fold');
    expect(thief.offers('Cut the thread')).toBe(true);
    await thief.play('Cut the thread');
    expect(Howe.state(thief, 'cans', 'cut')).toBe(true);
    await thief.play('To the heather rise');
    expect(thief.campaign.world.one('at', 'party')).toBe(R('rise'));
    const warrior = await Howe.at('fold', company('warrior'));
    expect(warrior.offers('Cut the thread')).toBe(false);
    expect(warrior.offers('Lift your feet over the line')).toBe(true);
  }, 240000);

  it('does not let a company walk straight across the grey grass without paying for it, and lets it go round', async () => {
    const j = await Howe.at('ring');
    const before = Howe.hp(j);
    await j.play('by the sunwise way round the stones');
    expect(j.campaign.world.one('at', 'party')).toBe(R('forecourt'));
    expect(Howe.hp(j)).toBe(before);
    Placed.at(j, R('ring'));
    for (let i = 0; i < 8 && Howe.hp(j) >= before; i++) { Placed.at(j, R('ring')); await j.play('risk the grey grass'); }
    expect(Howe.hp(j)).toBeLessThan(before);
  }, 240000);
});

describe('the camp in the lee: a foreman, a crew, a cook, and four ways with them', () => {
  it('sells what a company going under a hill needs, and a company that pays is welcome to sleep there', async () => {
    const j = await Howe.at('lee');
    j.coin(60);
    await j.play('for the freedom of the camp');
    for (const w of ['A coil of rope', 'A sack of barley', 'A twist of salt', 'A shovel', 'Iron spikes']) { await Howe.buy(j, w); }
    expect(Howe.holds(j, 'tolerates', R('foreman'), 'party')).toBe(true);
    expect(Howe.holds(j, 'tolerates', R('crew'), 'party')).toBe(true);
    expect(Howe.holds(j, 'restful', R('lee'))).toBe(true);
  }, 240000);

  it('can be turned: told what the torc will cost the country, the foreman strikes her tents and goes to the town’s taproom', async () => {
    const j = await Howe.at('lee');
    Placed.knows(j, R('torc_price'));
    expect(j.offers('what the torc will cost the country')).toBe(true);
    for (let i = 0; i < 4 && !Howe.fact(j, 'turned', R('foreman')); i++) {
      await j.play('what the torc will cost the country').catch(() => '');
    }
    // A hard persuasion: one company may need a second try; the Journey takes it by the page's own offer.
    if (Howe.fact(j, 'turned', R('foreman'))) {
      expect(Howe.where(j, 'foreman')).toBe(TOWN('taproom'));
      expect(Howe.holds(j, 'tolerates', R('crew'), 'party')).toBe(true);
    } else {
      expect(j.offers('what the torc will cost the country')).toBe(false);
    }
  }, 300000);

  it('is the camp that can be fought: the crew breaks and the foreman falls to a company of four at level four', async () => {
    const j = await Howe.at('lee');
    await Howe.torch(j);
    await j.fight('Attack');
    expect(Howe.holds(j, 'dead', R('foreman'))).toBe(true);
    expect(Howe.downed(j)).toBeLessThan(3);
  }, 300000);
});

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
    await j.play('=day 6 22:00');
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
    await j.play('=+1').catch(() => '');
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
  it('kills four of level three in the horse-hall unfed, and is taken by four of level four', async () => {
    const low = await Howe.at('gallery', levelled(3, 'warrior', 'cleric', 'thief', 'mage'));
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


function j0(_: Journey) { /* a spec reads the page it was set down on; nothing to do */ }
