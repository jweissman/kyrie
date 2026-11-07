import { describe, expect, it } from 'bun:test';
import { p, R } from './support/repertory';

// The three exploits are keyed to the clock: the rampart at night, the tiltyard by day, the chapel at dusk.
const toLetter = async (seed: string, trap = true) => {
  const r = await R.start(seed);
  await r.tour();
  await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
  await r.play("To the Prince's study", 'Ask the Prince why he talks to the rampart', 'Make him show it', 'To the great hall of Harrowmere', 'To the south rampart');
  await r.untilFine(() => r.holds('x1', 'rierdan'));
  await r.play('Stand beside the Prince');
  expect(r.holds('e3Ghost', 'party')).toBe(true);
  if (trap) {
    await r.play('Ask the Prince what the cold place said to him', 'To the great hall of Harrowmere');
    await r.play('Have Swale work a speech about a king killed in an orchard');
    expect(r.holds('e3Trap', 'rierdan')).toBe(true);
  } else { await r.play('To the great hall of Harrowmere'); }
  await r.play('To the gate of Harrowmere', 'To the tiltyard');
  await r.untilFine(() => r.holds('x2', 'rierdan'));
  await r.play('Step between the Prince and the captain', 'To the gate of Harrowmere', 'To the great hall of Harrowmere');
  if (trap) { await r.until(() => r.holds('x3c', 'rierdan')); }
  else { await r.play('To the chapel'); await r.untilFine(() => r.holds('x3', 'rierdan')); await r.play('Take the Prince by the sleeve'); }
  expect(r.holds(trap ? 'e3Confessed' : 'e3Spared', 'rierdan')).toBe(true);
  if (r.offers('To the great hall of Harrowmere')) { await r.play('To the great hall of Harrowmere'); }
  await r.until(() => r.holds('e3Letter', 'rierdan'));
  return r;
};
const toOrlayHall = async (r: R) => {
  await r.play('To the gate of Harrowmere', 'To the Orlay road');
  await r.until(() => r.hour() >= 6 && r.hour() < 19);
  await r.play('To the gate of Orlay', 'To the hall of Orlay');
};
const inn = async (seed: string) => {
  const r = await toLetter(seed);
  await r.play('To the gate of Harrowmere', 'To the Orlay road', 'To the Fox and Feather');
  await r.until(() => r.holds('e3MixRolled', 'rierdan'));
  await r.until(() => r.hour() >= 6 && r.hour() < 19);
  return r;
};


describe('The Repertory, 3: The Prince and the Letter', () => {
  it('escapes through Orlay on a letter Swale has rewritten on the Prince\'s one sheet, with his consent, if the forgery is not blown at the table; and the two friends are killed for it', async () => {
    const r = await toLetter('rep3a');
    await r.play('Warm the seal over a candle');
    expect(r.holds('e3Read', 'rierdan')).toBe(true);
    await r.play('Tell the Prince what his uncle');
    expect(r.offers('Ask Swale to write a new letter')).toBe(false);
    await r.play("To the Prince's study", 'Take a clean sheet of the Prince', 'To the great hall of Harrowmere', 'Ask Swale to write a new letter');
    expect(r.holds('e3Forged', 'rierdan')).toBe(true);
    await toOrlayHall(r);
    expect(r.offers('Hand the Margravine of Orlay the letter you were given')).toBe(false);
    await r.play('Hand the Margravine of Orlay the letter that Swale wrote');
    expect(r.holds('e3Escape', 'rierdan')).toBe(true);
    expect(r.holds('e3Killed', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
    expect(r.offers('Warm the seal over a candle')).toBe(false);
    expect(r.offers('Wrap the letter in oilskin')).toBe(false);
  }, 290000);
  it('allows only one sheet: a forgery that fails leaves no second try', async () => {
    const r = await toLetter('rep3i-5');
    await r.play('Warm the seal over a candle', 'Tell the Prince what his uncle', "To the Prince's study", 'Take a clean sheet of the Prince', 'To the great hall of Harrowmere');
    r.j.roll('fail');
    await r.play('Ask Swale to write a new letter');
    r.j.roll(undefined);
    expect(r.holds('e3Forged', 'rierdan')).toBe(false);
    await r.play("To the Prince's study");
    expect(r.offers('Take a clean sheet of the Prince')).toBe(false);
  }, 290000);
  it('shuts the company in the Orlay larder, Bellerophon-wise, when the genuine letter is handed over; the door is really barred, and opens on a night, a trust, or a spoon; the larder is not credited; nothing of the letter is offered after', async () => {
    const r = await toLetter('rep3e', false);
    await toOrlayHall(r);
    await r.play('Hand the Margravine of Orlay the letter you were given');
    await r.waits(1);
    expect(r.holds('e3Bellerophon', 'rierdan')).toBe(true);
    expect(r.at('party')).toBe(p('or_larder'));
    expect(r.offers('To the hall of Orlay')).toBe(false);
    expect(r.offers('Warm the seal over a candle')).toBe(false);
    await r.until(() => r.holds('e3Unlocked', 'rierdan'), 200);
    expect(r.offers('To the hall of Orlay')).toBe(true);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it.skip('leaves the larder early for a company that picks the bar loose, once', async () => {
    const r = await toLetter('rep3k', false);
    await toOrlayHall(r);
    await r.play('Hand the Margravine of Orlay the letter you were given');
    await r.waits(1);
    await r.play('Work the bar loose from inside');
    expect(r.holds('e3Unlocked', 'rierdan')).toBe(true);
  }, 290000);
  it('makes a failed read the worst outcome of the read: three crowns, the Prince kept, the company turned out, and the play not credited', async () => {
    const r = await toLetter('rep3f-2');
    const gold = r.j.measure('quantity', 'party', 'gold');
    r.j.roll('fail');
    await r.play('Warm the seal over a candle');
    r.j.roll(undefined);
    expect(r.holds('e3Cracked', 'rierdan')).toBe(true);
    expect(r.j.measure('quantity', 'party', 'gold')).toBeLessThan(gold);
    expect(r.offers('Warm the seal over a candle')).toBe(false);
    await toOrlayHall(r);
    await r.play('Hand the Margravine of Orlay the letter you were given');
    expect(r.holds('e3Held', 'rierdan')).toBe(true);
    expect(r.holds('e3Killed', 'rierdan')).toBe(false);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('burns the letter only after reading it or being warned, and is turned away at Orlay when the explanation fails (not credited)', async () => {
    const r = await toLetter('rep3g-3');
    expect(r.offers("Burn the Margrave's letter")).toBe(false);
    await r.play('Warm the seal over a candle', "Burn the Margrave's letter");
    await toOrlayHall(r);
    r.j.roll('fail');
    await r.play('Tell the Margravine you come without');
    r.j.roll(undefined);
    expect(r.holds('e3TurnedAway', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('lets Ysenne Fosbury\'s warning stand for a read, so that the letter may be burned unread', async () => {
    const r = await toLetter('rep3n');
    expect(r.offers("Burn the Margrave's letter")).toBe(false);
    await r.play('To the chapel', 'Ask Ysenne Fosbury what her father has been copying', 'To the great hall of Harrowmere');
    expect(r.offers("Burn the Margrave's letter")).toBe(true);
  }, 290000);
  it('lays the sealed letter before the Margrave, if the oilskin kept it: he burns it himself', async () => {
    const r = await toLetter('rep3l-5');
    await r.play('Warm the seal over a candle', 'Wrap the letter in oilskin', 'Lay the Margrave\'s own letter');
    expect(r.holds('e3Exposed', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
  }, 290000);
  it.skip('ends in a farce of laundry lists when the morning\'s dice send the letter to Orlay in the wrong basket; the farce is not credited', async () => {
    const r = await inn('rep3m');
    expect(r.holds('e3Mixed', 'rierdan')).toBe(true);
    expect(r.offers('Hand the Margravine of Orlay the letter you were given')).toBe(false);
    await r.play('To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay');
    expect(r.offers('Hand the Margravine of Orlay the letter you were given')).toBe(false);
    await r.play('Present what the carrier brings');
    expect(r.holds('e3Misdelivered', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('keeps the letter, and its danger, when the morning\'s dice leave the basket alone', async () => {
    const r = await inn('rep3j');
    expect(r.holds('e3Mixed', 'rierdan')).toBe(false);
    await r.play('To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay', 'Hand the Margravine of Orlay the letter you were given');
    expect(r.holds('e3Bellerophon', 'rierdan')).toBe(true);
  }, 290000);
  it('ends in a grave when the Prince is left alone three times; the grave is not credited to the repertoire', async () => {
    const r = await R.start('rep3c');
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    await r.until(() => r.holds('e3Grave', 'rierdan'), 120);
    expect(r.holds('e3Letter', 'rierdan')).toBe(false);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('brings Swale to the hall every time the party returns to it: a trip home to the city does not strand him', async () => {
    const r = await R.start('rep3h');
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    expect(r.at('swale')).toBe(p('hm_hall'));
    await r.play('To the gate of Harrowmere', 'To the Fourways', 'To the River Gate');
    await r.waits(1);
    expect(r.at('swale')).not.toBe(p('hm_hall'));
    await r.play('To the Fourways', 'To the gate of Harrowmere', 'To the great hall of Harrowmere');
    expect(r.at('swale')).toBe(p('hm_hall'));
  }, 290000);
});

describe('The Repertory, 4: The Wood near Athens-under-Hollin', () => {
  const toNight = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the wedding lawn', 'Ask Gosse how the rehearsal is going', 'Run the rehearsal yourself');
    await r.until(() => r.holds('e4Hunt', 'rierdan'));
    return r;
  };
  it('puts the lovers right with ofbit (a sprig is lost to a failed hand) and brings the wedding to the lawn by dawn; the weaver is paid', async () => {
    const r = await toNight('rep4a');
    await r.play('Ask Tam to play the hautboy');
    expect(r.holds('e4LordTolerates', 'rierdan')).toBe(true);
    await r.play('To the edge of the wood', 'To the lantern bog', "To the pixie's hollow", 'Gather a sprig of ofbit', 'Gather a second sprig of ofbit', 'To the lantern bog', 'To the edge of the wood');
    r.j.roll('fail');
    await r.play("Touch Rafe's eyes and Idony's with ofbit");
    r.j.roll(undefined);
    expect(r.holds('loves', 'rafe', 'idony')).toBe(false);
    await r.play("Touch Rafe's eyes and Idony's with ofbit");
    expect(r.holds('loves', 'rafe', 'idony')).toBe(true);
    await r.play('To the wedding lawn');
    await r.until(() => r.holds('e4Done', 'rierdan'));
    expect(r.hour()).toBeGreaterThanOrEqual(5);
    expect(r.holds('e4Restored', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
  }, 290000);
  it('ends in a wedding between two who cannot say why when the poppy is used instead', async () => {
    const r = await toNight('rep4d');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the lantern bog', "To the pixie's hollow", 'Gather a handful of poppy heads', 'To the lantern bog', 'To the edge of the wood', 'Touch the lovers\' eyes with poppy');
    expect(r.holds('e4Slept', 'rierdan')).toBe(true);
    await r.play('To the wedding lawn');
    await r.until(() => r.holds('e4Done', 'rierdan'));
    expect(r.holds('e4Blank', 'rierdan')).toBe(true);
  }, 290000);
  it('lets the weaver go for the Lord\'s true name only after the cheap bargain has failed', async () => {
    const r = await toNight('rep4e');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the oak ring', "To the Lord's glade");
    expect(r.offers('Give the Lord of the Green your true name')).toBe(false);
    r.j.roll('fail');
    await r.play('Offer the Lord of the Green the thing he is quarrelling about');
    r.j.roll(undefined);
    expect(r.holds('e4BargainFailed', 'rierdan')).toBe(true);
    await r.play('Give the Lord of the Green your true name');
    expect(r.holds('e4Price', 'rierdan')).toBe(true);
    expect(r.holds('e4LoomFree', 'rierdan')).toBe(true);
  }, 290000);
  it('lets the Ash\'s memory free the weaver at the cost of an hour of the night, and humbles the Lord', async () => {
    const r = await toNight('rep4f');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the oak ring', "To the Lord's glade", 'To the ash that is a woman');
    const before = r.measure('watch', 'clock');
    await r.play('Ask the Ash whether she remembers');
    expect(r.measure('watch', 'clock')).toBeGreaterThanOrEqual(before + 6);
    await r.play("To the Lord's glade", 'Call the Lord of the Green by the name');
    expect(r.holds('e4LoomFree', 'rierdan')).toBe(true);
    expect(r.holds('e4Humbled', 'rierdan')).toBe(true);
  }, 290000);
  it('does not allow the hautboy to be played again after a poor tune: a failure is a failure', async () => {
    const r = await toNight('rep4g');
    r.j.roll('fail');
    await r.play('Ask Tam to play the hautboy');
    r.j.roll(undefined);
    expect(r.offers('Ask Tam to play the hautboy')).toBe(false);
    expect(r.holds('e4LordTolerates', 'rierdan')).toBe(false);
  }, 290000);
  it('puts iron and a torch in the company\'s hands on the lawn: the wood\'s protections are things the company can pick up', async () => {
    const r = await toNight('rep4j');
    expect(r.offers('iron nails: Take')).toBe(true);
    await r.play('iron nails: Take');
    await r.play('To the edge of the wood');
    for (let i = 0; i < 6; i++) { await r.play('Wait › A while'); }
    expect(r.told()).not.toContain('goat');
  }, 290000);
  it('telegraphs the Hunt: the horn at the edge of the wood, then the hooves; an unprotected company is struck, and the edge is not fatal on arrival', async () => {
    const r = await toNight('rep4h');
    await r.play('To the edge of the wood');
    expect(r.told()).toContain('The horn is in the beech-wood');
    expect(r.holds('e4EdgeSeen', 'rierdan')).toBe(true);
    const seen: string[] = [];
    for (let i = 0; i < 10; i++) { await r.play('Wait › A while'); seen.push(r.told()); }
    expect(seen.join(' ')).toContain('goat');
  }, 290000);
  it('ends in the glorious fiasco when the lovers are left as the wood made them; a fiasco no one chose is not credited, a fiasco the company stood at the edge to choose is', async () => {
    const a = await toNight('rep4b');
    await a.until(() => a.holds('e4Done', 'rierdan'));
    expect(a.holds('e4Fiasco', 'rierdan')).toBe(true);
    await a.waits(1);
    expect(a.measure('repertoire', 'rierdan') - a.base).toBe(0);
    const b = await toNight('rep4i');
    expect(b.offers('Stand at the edge and let the lovers be')).toBe(false);
    await b.play('To the edge of the wood', 'Stand at the edge and let the lovers be', 'To the wedding lawn');
    await b.until(() => b.holds('e4Done', 'rierdan'));
    expect(b.holds('e4Fiasco', 'rierdan')).toBe(true);
    await b.waits(1);
    expect(b.measure('repertoire', 'rierdan') - b.base).toBe(1);
  }, 290000);
  it('carries what was said on the road into the wood: Kit\'s answer from Marlcross is read among the lovers', async () => {
    const r = await R.start('rep4c');
    await r.tour();
    await r.play('To Marlcross market square', 'Tell Dr Tuckett that a man locked out', 'To the Priory gate');
    await r.until(() => r.holds('e1Done', 'rierdan'));
    await r.play('To Marlcross market square', 'To the Ashlar house', 'Ask Kit what he made of Marlcross', 'Tell him to say so, in his own voice');
    expect(r.holds('kitSaysSo', 'party')).toBe(true);
    await r.play('To Marlcross market square', 'To the Fourways', 'To the wedding lawn');
    await r.play('Ask Kit how he is, here, among the lovers');
    expect(r.offers('Ask Kit how he is, here, among the lovers')).toBe(false);
  }, 290000);
});

describe('The Repertory in Act V: the road is read on the night of the Command', () => {
  it('reads a freed weaver (standing), a paid name (the roll) and a kind word to the Prince (Swale\'s blurt), in the played Command', async () => {
    const r = await R.start('repV', 'B');
    expect(r.holds('swaleHidden', 'party')).toBe(true);
    expect(r.holds('noteGone', 'rierdan')).toBe(false);
    await r.tour();
    // Ep 3, in part: Swale and the Prince's speech.
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants', 'Ask Swale to speak the Prince\'s lines', 'Tell him it wants no cutting');
    expect(r.holds('swaleHand', 'party')).toBe(true);
    await r.play('To the gate of Harrowmere', 'To the Fourways');
    // Ep 4: the weaver for a name, and Pudding to play Pyramus if the weaver does not come.
    await r.play('To the wedding lawn', 'Ask Gosse how the rehearsal is going', 'Run the rehearsal yourself');
    await r.until(() => r.holds('e4LoomAss', 'rierdan'));
    await r.until(() => r.holds('e4Hunt', 'rierdan'));
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the oak ring', "To the Lord's glade");
    r.j.roll('fail');
    await r.play('Offer the Lord of the Green the thing he is quarrelling about');
    r.j.roll(undefined);
    await r.play('Give the Lord of the Green your true name');
    expect(r.holds('e4Price', 'rierdan')).toBe(true);
    expect(r.holds('e4LoomFree', 'rierdan')).toBe(true);
    // Home, and the Command.
    await r.play('To the oak ring', 'To the edge of the wood', 'To the wedding lawn', 'To the Fourways', 'To the River Gate');
    const standing = r.measure('standingR', 'rierdan');
    await r.until(() => r.holds('holdingCommand', 'rierdan'), 120);
    const nod = 'Give Hepzibah the nod for the next scene';
    await r.play(nod, '?Take Corin Fallow by the arm and walk him to a seat in the second row');
    await r.play(nod, "?Seat the Marchants' masquers in the pit, and promise them the afterpiece");
    await r.play(nod, "?Ring the Duke's bell, say his name, and give him a better seat");
    await r.play(nod);
    expect(r.holds('nameRoll', 'rierdan')).toBe(true);
    expect(r.holds('loomFan', 'rierdan')).toBe(true);
    expect(r.measure('standingR', 'rierdan')).toBeGreaterThan(standing);
    expect(r.holds('swaleBlurted', 'rierdan')).toBe(true);
    expect(r.holds('swaleSoftened', 'rierdan')).toBe(true);
  }, 290000);
});
