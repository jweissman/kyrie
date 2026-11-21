import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { KyrLint } from '../src/cli/kyr-lint';
import s from './fixtures/hexworth/journey.json';

// A Voice for Hexworth, played by the labels a player sees. Marlin's tray is true tin on some seeds and pewter on
// others (a Deem roll when the module is installed): 'd' draws true tin, 'hexworth' draws pewter.
const campaign = 'data/campaigns/hexworth.campaign.json';
const start = async (seed = 'd') => Journey.start(campaign, seed);
const reached = (j: Journey, ending: string) => j.holds('reached', 'hexworth__' + ending);
// Everything good, in the pot, poured by Piers: a great bell.
const goodSet = [...s.arrive, ...s.yard, ...s.learn, ...s.key, ...s.whistle, ...s.soldier, ...s.doors, ...s.ebba,
  ...s.culver, ...s.hasket, ...s.tray, ...s.charcoal, ...s.fire, ...s.testTin, ...s.potAll, ...s.trayIn, ...s.practise,
  ...s.bellows];
const ending = ['=day 4 04:00', 'Break out the mould', ...s.hang, '=until fogged()', ...s.ringFog, ...s.rest];

describe("A Voice for Hexworth's Kyr", () => {
  it('lints clean', async () => {
    expect((await KyrLint.campaign(campaign)).filter(f => f.level === 'error')).toEqual([]);
  }, 60000);
});

describe("A Voice for Hexworth", () => {
  it('is played from the road into the square, where a child sits on a heap of iron', async () => {
    const j = await start();
    await j.play(...s.arrive);
    expect(j.at('party')).toBe('hexworth__square');
    expect(j.page).toContain('Dilly Drave');
  }, 60000);

  it('finds a key of iron inside Margery, and Gundred tells whose it was', async () => {
    const j = await start();
    await j.play(...s.arrive, ...s.yard, ...s.learn);
    expect(j.holds('knows', 'party', 'hexworth__iron_known')).toBe(true);
    await j.play('Show Gundred the iron in Margery');
    expect(j.holds('keyTold', 'party')).toBe(true);
    expect(j.holds('trusted', 'party')).toBe(true);
    expect(j.latest).toContain('his byre key');
    await j.play('To the foundry yard', 'Chip the key out of Margery\'s pieces');
    expect(j.holds('state', 'hexworth__margery', 'hexworth__cleaned')).toBe(true);
  }, 120000);

  it('will not let Margery be put in the pot cleaned unless the key has been told, and cracks the bell if she is put in dirty', async () => {
    const j = await start();
    await j.play(...s.arrive, ...s.yard, ...s.learn);
    expect(j.offers('Put Margery\'s cleaned pieces in the pot')).toBe(false);
    expect(j.offers('Put Margery\'s pieces in the pot')).toBe(true);
    await j.play('Put Margery\'s pieces in the pot');
    expect(j.measure('ironIn')).toBe(1);
  }, 120000);

  it('makes a great bell of the town\'s gifts, poured by Piers with Gundred saying when, and brings the cutters home', async () => {
    const j = await start();
    await j.play(...goodSet);
    expect(j.measure('copperIn')).toBe(17);
    expect(j.measure('tinIn')).toBe(5);
    expect(j.offers('Stand back and let Gundred pour')).toBe(false);
    await j.play(...s.lettersEdric, ...s.pourPiers);
    expect(j.holds('lettersEdric', 'party')).toBe(true);
    expect(j.holds('pouredPiers', 'party')).toBe(true);
    expect(j.measure('voice')).toBe(7);
    await j.play(...s.coolOut);
    expect(j.latest).toContain('Oh, you beauty');
    await j.play(...s.hang, '=until fogged()');
    expect(j.holds('fogged')).toBe(true);
    await j.play(...s.ringFog);
    expect(j.latest).toContain('a kettle on a hearth');
    expect(j.latest).toContain('like a pin');
    await j.play(...s.rest);
    expect(j.measure('tier')).toBe(4);
    expect(reached(j, 'home')).toBe(true);
    expect(j.page).toContain('Kit Hasket is the fourth');
    expect(j.page).toContain('You have the E backwards');
    expect(j.page).toContain('THERE IS A BELL');
    expect(j.page).toContain('neither has had her');
    expect(j.page).toContain('hangs Edric');
  }, 300000);

  it('says what each promise came to when the letters give the name to one of two who were promised it', async () => {
    const j = await start();
    await j.play(...goodSet, ...s.lettersEbba, ...s.pourShared, ...ending);
    expect(j.holds('lettersEbba', 'party')).toBe(true);
    expect(reached(j, 'home')).toBe(true);
    expect(j.page).toContain('BIG EBBA');
    expect(j.page).toContain('only one has it');
    expect(j.page).toContain('by arrangement');
  }, 300000);

  it('lets only one set of letters be cut, and offers Edric\'s words only to a company that has heard Gundred out', async () => {
    const j = await start();
    await j.play(...s.arrive, ...s.yard, ...s.learn);
    expect(j.offers('THERE IS A BELL')).toBe(false);
    expect(j.offers('COME HOME')).toBe(true);
    await j.play(...s.lettersHome);
    expect(j.offers('BIG EBBA')).toBe(false);
  }, 120000);

  it('lets Gundred pour alone if she has not been trusted, and she spills a little', async () => {
    const j = await start();
    await j.play(...s.arrive, ...s.yard, ...s.learn, ...s.whistle, ...s.soldier, ...s.doors, ...s.ebba, ...s.culver,
      ...s.hasket, ...s.charcoal, ...s.fire);
    await j.play('Put Ebba Orlop\'s kettle in the pot', 'Put Ebba Orlop\'s mash-copper in the pot', 'Put the chapel\'s censer in the pot',
      'Put Hasket\'s wife\'s bedwarmer in the pot', 'Put the door-knockers in the pot', 'Put Dilly\'s tin soldier in the pot',
      'Put Piers\'s tin whistle in the pot', ...s.bellows);
    expect(j.holds('trusted', 'party')).toBe(false);
    expect(j.offers('Ask Piers to take the ladle')).toBe(false);
    expect(j.offers('Take the far end of the ladle')).toBe(false);
    await j.play(...s.pourAlone);
    expect(j.measure('spill')).toBe(1);
    expect(j.page).toContain('Clay was damp');
    expect(j.measure('voice')).toBe(6);
  }, 300000);

  it('cracks a bell that has had the town\'s iron put in it, and the founder knows before anyone rings it', async () => {
    const j = await start();
    await j.play(...s.arrive, 'Take', ...s.charcoal, 'Into Ludlam\'s foundry', 'Take', 'To the casting shed', ...s.hasket.slice(0, 0),
      'Feed the furnace a sack of charcoal', 'Feed the furnace a sack of charcoal', 'Put the town\'s iron in the pot');
    expect(j.measure('ironIn')).toBe(3);
    await j.play(...s.bellows, ...s.pourAlone);
    expect(j.measure('voice')).toBe(1);
    await j.play('=day 4 04:00', 'Break out the mould');
    expect(j.latest).toContain('Iron,');
  }, 300000);

  it('leaves the cutters to the lamps and a handbell if there is no bell, and one comes in late, and hurt', async () => {
    const j = await start();
    await j.play(...s.arrive, ...s.culver, ...s.hasket, '=until fogged()', ...s.lamps, ...s.rest);
    expect(j.holds('lampsSet', 'party')).toBe(true);
    expect(j.measure('tier')).toBe(3);
    expect(reached(j, 'lamps')).toBe(true);
    expect(j.page).toContain('rope of braces');
  }, 300000);

  it('loses Kit Hasket on the Edge if nothing is rung and no lamp is lit', async () => {
    const j = await start();
    await j.play(...s.arrive, '=day 4 20:00', '=day 5 08:00');
    expect(j.measure('tier')).toBe(1);
    expect(reached(j, 'nothing_called')).toBe(true);
    expect(j.page).toContain('a sound that never came');
  }, 300000);

  it('sours the bell if the chapel\'s pewter goes in, and the founder hears it dull', async () => {
    const j = await start();
    await j.play(...s.arrive, ...s.yard, ...s.learn, ...s.key, ...s.whistle, ...s.soldier, ...s.doors, ...s.ebba,
      ...s.pewter, ...s.hasket, ...s.charcoal, ...s.fire);
    await j.play('Put Margery\'s cleaned pieces in the pot', 'Put Ebba Orlop\'s kettle in the pot', 'Put Ebba Orlop\'s mash-copper in the pot',
      'Put the door-knockers in the pot', 'Put Dilly\'s tin soldier in the pot', 'Put Piers\'s tin whistle in the pot',
      'Put the chapel\'s pewter dishes in the pot', ...s.practise, ...s.bellows, ...s.pourPiers);
    expect(j.measure('leadIn')).toBe(3);
    expect(j.measure('voice')).toBe(2);
    await j.play(...s.coolOut);
    expect(j.latest).toContain('Lead');
    await j.play(...s.hang, '=until fogged()', ...s.ringFog, ...s.rest);
    expect(j.measure('tier')).toBe(2);
    expect(reached(j, 'kit_alive')).toBe(true);
    expect(j.page).toContain('three toes');
  }, 300000);

  it('sells pewter for tin on some seeds, and Gundred knows it from the way it bends', async () => {
    const j = await start('hexworth');
    expect(j.measure('marlinLeaded')).toBe(1);
    await j.play(...s.arrive, ...s.tray, ...s.yard, ...s.learn, ...s.testTin);
    expect(j.latest).toContain('sold you pewter at the price of tin');
    await j.play(...s.trayIn);
    expect(j.measure('leadIn')).toBe(2);
    expect(j.measure('tinIn')).toBe(0);
  }, 120000);

  it('makes a bell too hard if there is too much tin, and she goes on the third stroke', async () => {
    const j = await start();
    await j.play(...s.arrive, ...s.whistle.slice(0, 0), ...s.yard, ...s.learn, ...s.whistle, ...s.soldier, ...s.ebba.slice(0, 3), 'Out to the square',
      ...s.hasket, ...s.tray, ...s.charcoal, ...s.fire, 'Put Ebba Orlop\'s kettle in the pot', 'Put Dilly\'s tin soldier in the pot',
      'Put Piers\'s tin whistle in the pot', ...s.trayIn, ...s.bellows, ...s.pourAlone);
    expect(j.measure('copperIn')).toBe(3);
    expect(j.measure('tinIn')).toBe(4);
    expect(j.measure('voice')).toBe(4);
    await j.play(...s.coolOut, ...s.hang, 'Ring the bell', 'Ring the bell');
    expect(j.measure('voice')).toBe(4);
    await j.play('Ring the bell');
    expect(j.measure('voice')).toBe(1);
    expect(j.latest).toContain('tray of cutlery');
  }, 300000);

  it('breaks a good bell if the mould is broken before she has cooled', async () => {
    const j = await start();
    await j.play(...goodSet, ...s.pourPiers);
    expect(j.measure('voice')).toBe(7);
    await j.play('=day 3 22:00');
    expect(j.offers('Break out the mould before she has cooled')).toBe(true);
    await j.play('Break out the mould before she has cooled');
    expect(j.measure('voice')).toBe(1);
  }, 300000);
});
