import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

// The Kestrel's night call (the-dorothea/crew.kyr): Jago Pendry's coin, the casks put back or not, the three hands on the
// deck and the four things a company can do about them (pay them, have Rune speak, fight them, or lose the casks).
const campaign = 'data/campaigns/the-dorothea.campaign.json';
const k = (id: string) => `dorothea__${id}`;
const gold = (j: Journey) => j.measure('quantity', 'party', 'gold');
const cargo = (j: Journey) => j.measure(k('cargo'), k('hull'));
const aboardAtHail = async () => {
  const j = await Journey.start(campaign, 's1');
  j.assert(k('seaQuiet'), k('hull'));
  await j.play('^To Tolleth quay', 'Ask Captain Bascom for passage', 'Pay Captain Bascom six', "^To the Dorothea's waist", '=until at(dorothea__jago, dorothea__deck)');
  expect(j.holds(k('hailed'), k('hull'))).toBe(true);
  return j;
};
const looked = async (j: Journey) => {
  j.roll('pass');
  await j.play('Watch what passes at the after hatch');
  j.roll();
  expect(j.holds(k('looked'), 'party')).toBe(true);
};
// Shamed Rune, then failed to make Pendry put the casks back: his hands are on the deck.
const handsOnDeck = async () => {
  const j = await aboardAtHail();
  await looked(j);
  await j.play('Take Rune aside and say what you saw');
  j.roll('fail');
  await j.play('Make Rune and Jago Pendry put the casks back');
  j.roll();
  expect(j.holds('at', k('kestrel_hands'), k('deck'))).toBe(true);
  return j;
};

describe('The Kestrel, Jago Pendry and the casks', () => {
  it('lets the company take Jago\'s eight coin: the casks go, the company is bribed, nobody is told', async () => {
    const j = await aboardAtHail();
    const before = gold(j), hold = cargo(j);
    await looked(j);
    await j.play('Ask Jago Pendry what he buys');
    expect(j.holds(k('offered'), k('jago'))).toBe(true);
    await j.play('Take Jago Pendry.s eight coin');
    expect(gold(j)).toBe(before + 8);
    expect(j.holds(k('bribed'), 'party')).toBe(true);
    expect(j.holds('at', k('jago'), k('deck'))).toBe(false);
    expect(cargo(j)).toBe(hold - 4);
    // Taken, it cannot also be refused, reported or shamed.
    expect(j.matches('Tell Captain Bascom what you saw').length).toBe(0);
    expect(j.matches('Take Rune aside').length).toBe(0);
  }, 400000);

  it('has Pendry leave with his two casks when nobody does anything, and the hold is lighter by four', async () => {
    const j = await aboardAtHail();
    const hold = cargo(j);
    await j.play('=+30');
    expect(j.holds(k('sold'), k('hull'))).toBe(true);
    expect(cargo(j)).toBe(hold - 4);
    expect(j.holds('at', k('jago'), k('deck'))).toBe(false);
  }, 400000);

  it('makes Pendry put the casks back when Rune has been shamed into it and the company is hard enough', async () => {
    const j = await aboardAtHail();
    const hold = cargo(j);
    await looked(j);
    await j.play('Take Rune aside and say what you saw');
    expect(j.holds(k('indebted'), k('rune'), 'party')).toBe(true);
    j.roll('pass');
    await j.play('Make Rune and Jago Pendry put the casks back');
    j.roll();
    expect(j.holds(k('sold'), k('hull'))).toBe(true);
    expect(j.holds('at', k('jago'), k('deck'))).toBe(false);
    expect(j.holds('at', k('kestrel_hands'), k('deck'))).toBe(false);
    expect(cargo(j)).toBe(hold);
  }, 400000);

  it('brings the hands over the rail on a failed push, and eight coin sends them back', async () => {
    const j = await handsOnDeck();
    const before = gold(j), hold = cargo(j);
    expect(j.matches('Pay the Kestrel.s hands eight coin').length).toBe(1);
    await j.play('Pay the Kestrel.s hands eight coin');
    expect(gold(j)).toBe(before - 8);
    expect(j.holds(k('handsPaid'), 'party')).toBe(true);
    expect(j.holds('at', k('kestrel_hands'), k('deck'))).toBe(false);
    expect(j.holds('at', k('jago'), k('deck'))).toBe(false);
    expect(cargo(j)).toBe(hold - 4);
  }, 400000);

  it('offers no purse to a company that has not eight coin, and still has the other ways', async () => {
    const j = await handsOnDeck();
    j.coin(3);
    expect(j.matches('Pay the Kestrel.s hands eight coin').length).toBe(0);
    expect(j.matches('Have Rune speak to the Kestrel.s hands').length).toBe(1);
    expect(j.matches('Attack').length).toBeGreaterThanOrEqual(1);
  }, 400000);

  it('lets Rune, shamed and indebted, speak to the men he drank with, and they go without a blow', async () => {
    const j = await handsOnDeck();
    const before = gold(j), hold = cargo(j);
    await j.play('Have Rune speak to the Kestrel.s hands');
    expect(j.holds(k('handsSent'), 'party')).toBe(true);
    expect(j.holds('at', k('kestrel_hands'), k('deck'))).toBe(false);
    expect(j.holds('at', k('jago'), k('deck'))).toBe(false);
    expect(gold(j)).toBe(before);
    // The casks he had already sold are gone, the rest are not touched by this answer.
    expect(cargo(j)).toBe(hold);
  }, 400000);

  it('lets a company that is armed and has Tam at the front beat the three, and keeps the casks', async () => {
    const j = await handsOnDeck();
    const hold = cargo(j);
    await j.play('Attack');
    expect(j.holds(k('handsBeaten'), 'party')).toBe(true);
    expect(j.holds('at', k('jago'), k('deck'))).toBe(false);
    expect(j.holds(k('sold'), k('hull'))).toBe(true);
    expect(cargo(j)).toBe(hold);
    // Hale, Mirel and Tam, the preset company with its own kit: at least two still stand (a seed in six loses the fight).
    expect(j.campaign.readout.creatures.filter(c => ['Hale', 'Mirel', 'Tam'].includes(c.name) && c.state.hp > 0).length).toBeGreaterThanOrEqual(2);
  }, 400000);
});
