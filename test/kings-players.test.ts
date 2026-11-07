import { describe, expect, it } from 'bun:test';
import { p, KP, reached, fromTrial, toTheGate } from './support/kings-players';

describe("The King's Players: from Pentrice by the natural route", () => {
  it('holds the Pentrice epilogue open for the herald, then goes by the King\'s Road to the River Gate', async () => {
    const k = await fromTrial();
    expect(k.holds('verdictRead', 'pentrice')).toBe(true);
    // A watch and a wait later, in the old code the book had closed. It must not.
    await k.play('Wait › An hour');
    expect(reached(k)).toEqual([]);
    expect(k.j.choices().length).toBeGreaterThan(0);
    await toTheGate(k);
    expect(k.holds('summoned', 'pentrice')).toBe(true);
    expect(k.holds('royalCall', 'pentrice')).toBe(true);
    expect(k.at('party')).toBe(p('road_head'));
    await k.play('To the River Gate');
    expect(k.at('party')).toBe(p('river_gate'));
    // Many hours in, in Acts II and III the Pentrice endings do not fire.
    await k.play('Wait › An hour', 'Wait › An hour');
    expect(reached(k)).toEqual([]);
  }, 280000);
  it('holds the hinge open for a day and a half, warns before it closes, and then closes it', async () => {
    const k = await fromTrial('bow', 'g1');
    await k.play('=+120');
    expect(reached(k)).toEqual([]);
    await k.play('=+40');
    expect(k.pages).toMatch(/looking at the sun/);
    expect(reached(k)).toEqual([]);
    await k.play('=+40');
    expect(reached(k).length).toBeGreaterThan(0);
  }, 280000);
  it('refuses the herald and the Pentrice ending closes the book as it always did', async () => {
    const k = await fromTrial('bow', 'g1');
    await k.play('Wait › An hour', 'Out to the yard of the Painted Moon', 'Tell Aubrey Lintel the company has had enough of masters, and will stay');
    expect(reached(k).length).toBeGreaterThan(0);
  }, 280000);
});

describe("The King's Players: one unbroken play, Pentrice to the last bow, on natural dice", () => {
  it('goes from the verdict through all five acts by labels alone (the quiet night), and ends', async () => {
    const k = await fromTrial('bow', 'g1');
    await toTheGate(k);
    await k.play('To the River Gate', 'Say who you are, since the sergeant has not asked', "We are. The Marchants' masquers, and we are late");
    // Act I: the Sparrow, the bill, Gosse, and the rug.
    await k.play('To the Concourse of the Seven', 'To Playhouse Row', 'Into the Brazen Sparrow');
    if (k.j.offers("To the Sparrow's long loft")) {await k.play("To the Sparrow's long loft");}
    await k.play('Ask Hepzibah what the company will give the King', "The Miser's Wedding, the old one",
      'Ask Gosse how he wants the King to see him', 'As what you were. The King wants a king');
    if (k.j.offers("To the Brazen Sparrow's taproom")) {await k.play("To the Brazen Sparrow's taproom");}
    await k.play('Out to Playhouse Row', 'To the Concourse of the Seven', 'To the steps of the Tower of Law', "To the King's Court", "Into the King's Tower");
    await k.play("Play the King The Miser's Wedding, as his grandfather had it");
    expect(k.holds('auditioned', 'rierdan')).toBe(true);
    // Act II: the Prince on the terrace, the Salt-Wives, then the night; the trap is cancelled.
    await k.play('To the long terrace', 'Go out on the terrace and stand where the Prince can say it', "Yes. I've met two");
    expect(k.holds('mousetrapAsked', 'rierdan')).toBe(true);
    await k.play('To the Audience Chamber', "Out to the King's Court", 'To the steps of the Tower of Law', 'To the Concourse of the Seven', 'To Playhouse Row', 'To the Salt Quay');
    await k.play('Into the Tower of Salt', 'Ask the Salt-Wives what keeps a dead thing out of a house', 'Silence. When they stop listening');
    expect(k.holds('saltGiven', 'party')).toBe(true);
    await k.play('Out to the Salt Quay', 'To Playhouse Row', '=06:00', '=17:50', 'Into the Rotunda');
    await k.play('=18:10', 'Lay a line of grey salt across the threshold', "To the Rotunda's stage");
    expect(k.holds('salted', 'rot_front')).toBe(true);
    await k.play("To the Rotunda's wings", 'Ask Hepzibah to prompt the Mousetrap', 'No name. Cancel the trap. Play something else', '=06:30');
    expect(k.holds('nightOver', 'rierdan')).toBe(true);
    expect(k.holds('marshalLives', 'rierdan')).toBe(true);
    await k.play('Wait › An hour', 'Wait › An hour');
    expect(k.holds('wickGranted', 'rierdan')).toBe(true);
    // Act IV: the Wick, the plan, the draper, the opening night. Natural dice: the heist may go well or ill.
    await k.play("To the Rotunda's stage", "To the Rotunda's front of house", 'Out to Playhouse Row', 'Into the Wick', "To the Wick's wardrobe",
      'Ask Hepzibah to gather the company about the note', "Jem's: a false clerk, a false summons, and a good coat");
    await k.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Salt Quay', "To Mistress Pardew's draper's",
      'Ask Mistress Pardew whether she dressed a clerk', "The note's a forgery. We mean to take it back");
    expect(k.holds('keyCopied', 'party')).toBe(true);
    await k.play('?To the Salt Quay', 'To Playhouse Row', 'Into the Wick');
    await k.play('=+144', '=+144', '=+144', '=19:10');
    expect(k.holds('openingNight', 'rierdan')).toBe(true);
    await k.play("To Lord Rask's box", "Take Lord Rask's box for the evening, and a bottle, and Master Mauger's whole attention");
    await k.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the Exchange under the Tower of Coin',
      "?Walk in at the counting-room door in the clerk's coat, as if you worked there",
      "?Open Master Mauger's strong-box, with a key or without");
    await k.play('=22:10');
    expect(k.holds('heistOver', 'rierdan')).toBe(true);
    // Act V: three days on, the Command.
    await k.play('=+144', '=+144', '=+144', '=19:10');
    expect(k.holds('holdingCommand', 'rierdan')).toBe(true);
    const nod = 'Give Hepzibah the nod for the next scene';
    await k.play(nod, '?Take Corin Fallow by the arm and walk him to a seat in the second row');
    await k.play(nod, "?Seat the Marchants' masquers in the pit, and promise them the afterpiece");
    await k.play(nod, "?Ring the Duke's bell, say his name, and give him a better seat");
    await k.play(nod, '?Play the Alderman at the top of your voice until he sits');
    await k.play(nod, '?Send the twins on from opposite wings, in the right order, in front of the Chancellor');
    await k.play(nod, '?Give Gosse the Chorus, and let him say it as it is written');
    await k.play(nod, 'Take the company down for the call, in front of the bear');
    expect(k.holds('commandDone', 'rierdan')).toBe(true);
    expect(reached(k)).toEqual([p('quiet')]);
  }, 290000);
});

describe("The King's Players, Act I: the Marchants' Men", () => {
  it('goes in under a false name, takes Kit to the Chancellor, unmasks a page, and ends in a fiasco on the rug', async () => {
    const k = await KP.start();
    await k.toTheRoad();
    expect(k.holds('summoned', 'pentrice')).toBe(true);
    await k.play('Say who you are, since the sergeant has not asked', "We are. The Marchants' masquers, and we are late");
    expect(k.holds('posing', 'party')).toBe(true);
    await k.play('To the Concourse of the Seven', 'To Playhouse Row', 'Into the Brazen Sparrow', "To the Sparrow's long loft",
      "Take Kit Arden along to the Marchants' house", "To the Brazen Sparrow's taproom", 'Out to Playhouse Row');
    expect(k.j.holds('following', p('kit'), 'party')).toBe(true);
    // The Chancellor takes Kit for his daughter; the company says so, or does not.
    await k.play('To the Concourse of the Seven', 'To Lamp Hill', "Into the Marchants' house on Lamp Hill");
    expect(k.holds('kitTaken', 'party')).toBe(true);
    await k.play('Answer the Chancellor, who has put a hand on Kit\'s shoulder', 'No, my lord. He is a boy called Kit Arden, and he plays the girls');
    k.j.roll('pass');
    await k.play('Prove Kit is a boy, with Kit\'s help and some dignity');
    expect(k.holds('kitProved', 'party')).toBe(true);
    // Orrin in the Rotunda's wings: the page is the Chancellor's daughter, and asks whether she will be told on.
    k.j.roll(undefined);
    await k.play('Out to Lamp Hill', 'To the Concourse of the Seven', 'To Playhouse Row', 'Into the Rotunda');
    k.put('party', 'rot_wings');
    await k.play('Ask the page Orrin why a Rotunda boy has such a look', 'No. Not a word, on my word');
    expect(k.knows('oriel_unmasked')).toBe(true);
    expect(k.holds('orielSworn', 'party')).toBe(true);
    await k.play('Ask Oriel to come with the company, as herself', 'Ask Oriel Marchant to join the company');
    expect(k.j.holds('travelsWith', p('oriel'), 'party')).toBe(true);
    // Hepzibah asks which play, and Gosse how he wants the King to see him: the answers decide what can be played.
    k.j.put('party', k.at('hepzibah')!); // wherever the company is lodged at this hour
    await k.play('Ask Hepzibah what the company will give the King', 'A farce, tonight, made of the mistakes of this week',
      'Ask Gosse how he wants the King to see him', 'As what you were. The King wants a king');
    expect(k.holds('masqueFarce', 'party')).toBe(true);
    expect(k.holds('gosseHam', 'party')).toBe(true);
    // The audition: the real masquers have come; the King, the Chancellor, a bear and the wrong column.
    k.assert('realMasquers', 'rierdan');
    k.put('party', 'audience');
    k.j.roll('pass');
    await k.play('Play the King The Marchants\' Men, with the two companies and the two Oriels');
    expect(k.holds('auditioned', 'rierdan')).toBe(true);
    await k.play('Wait › A while');
    expect(k.holds('titleByAccident', 'rierdan')).toBe(true);
    expect(k.measure('favour', 'rierdan')).toBeGreaterThanOrEqual(4);
  }, 280000);
});

describe("The King's Players, Act I (the honest road): the Miser", () => {
  it('plays the Miser with an honest Gosse, is auditioned, and reaches Act II without a farce', async () => {
    const k = await KP.start('kp1m');
    k.assert('royalCall', 'pentrice');
    k.put('party', 'sparrow_loft');
    await k.play('Wait › An hour');
    k.j.put('party', k.at('hepzibah')!);
    await k.play('Ask Hepzibah what the company will give the King', "The Miser's Wedding, the old one");
    await k.play('Ask Gosse how he wants the King to see him', "As what you are. He's old too");
    expect(k.holds('gosseHonest2', 'party')).toBe(true);
    if (k.j.offers("To the Brazen Sparrow's taproom")) {await k.play("To the Brazen Sparrow's taproom");}
    await k.play('Out to Playhouse Row', 'To the Concourse of the Seven');
    await k.play('To the steps of the Tower of Law', "To the King's Court", "Into the King's Tower");
    k.j.roll('pass');
    await k.play("Play the King The Miser's Wedding, with Gosse as he is");
    expect(k.holds('auditioned', 'rierdan')).toBe(true);
    expect(k.measure('favour', 'rierdan')).toBeGreaterThanOrEqual(3);
    // Nothing of the farce is claimed in the verdict.
    expect(k.pages).not.toMatch(/two companies, the Marchants/);
  }, 280000);
});

describe("The King's Players, Act I: the bill, and Act IV: the draper", () => {
  it('hints that a farce wants its cast, and lets the company change the bill', async () => {
    const k = await KP.start('kp1f');
    k.assert('royalCall', 'pentrice').assert('masqueFarce', 'party');
    k.put('party', 'audience');
    await k.play('Wait › An hour');
    expect(k.pages).toMatch(/a farce wants its Kit and its Oriel/);
    await k.play('Tell Hepzibah to change the bill, since the farce has no cast');
    expect(k.holds('masqueMiser', 'party')).toBe(true);
    expect(k.holds('masqueFarce', 'party')).toBe(false);
  }, 200000);
  it('makes the lie to Pardew a trade: the coat, but no key, until twelve crowns or the truth', async () => {
    const k = await KP.start('kp4l');
    k.assert('royalCall', 'pentrice').assert('wickGranted', 'rierdan');
    k.put('party', 'draper').put('pardew', 'draper');
    await k.play('Ask Mistress Pardew whether she dressed a clerk', 'Costumes for a play about a clerk');
    expect(k.holds('disguiseHad', 'party')).toBe(true);
    expect(k.holds('keyCopied', 'party')).toBe(false);
    await k.play('Ask Mistress Pardew whether the key-mould is still for sale', "The note's a forgery, and we mean to take it back");
    expect(k.holds('keyCopied', 'party')).toBe(true);
    expect(k.holds('pardewOwed', 'party')).toBe(true);
  }, 200000);
});

describe("The King's Players, Act I: the Name-Day", () => {
  it('is a clock: four days without an audition and the favour earned so far is forgotten, with a warning two days before', async () => {
    const k = await KP.start('kp1n');
    k.assert('royalCall', 'pentrice').set('favour', 'rierdan', '3');
    k.put('party', 'sparrow_loft');
    await k.play('=+144', '=+144');
    expect(k.pages).toMatch(/THE NAME-DAY IS THE FOURTH DAY/);
    expect(k.measure('favour', 'rierdan')).toBe(3);
    await k.play('=+144', '=+144', '=+144');
    expect(k.holds('nameDayPassed', 'rierdan')).toBe(true);
    expect(k.measure('favour', 'rierdan')).toBe(0);
    expect(k.pages).toMatch(/has gone with the Name-Day/);
  }, 200000);
});

describe("The King's Players, Act I: Kit's proof", () => {
  it('is a single try: a failure leaves Kit with the Chancellor until the audition, and he is released after', async () => {
    const k = await KP.start('kp1k');
    k.assert('royalCall', 'pentrice').assert('posing', 'party').assert('kitTaken', 'party');
    k.assert('lodged', 'kit');
    k.put('party', 'marchant_hall').put('kit', 'marchant_hall');
    k.j.roll('fail');
    await k.play('Prove Kit is a boy, with Kit\'s help and some dignity');
    expect(k.holds('kitDoubted', 'party')).toBe(true);
    expect(k.j.offers("Prove Kit is a boy")).toBe(false);
    expect(k.at('kit')).toBe(p('marchant_hall'));
    k.assert('auditioned', 'rierdan');
    await k.play('Wait › An hour');
    expect(k.at('kit')).toBe(p('sparrow_loft'));
  }, 200000);
  it('greets the company differently while it is posing', async () => {
    const k = await KP.start('kp1c');
    k.assert('royalCall', 'pentrice').assert('posing', 'party');
    k.put('party', 'marchant_hall');
    await k.play('Wait › An hour');
    expect(k.pages).toMatch(/masquers' letter of engagement/);
  }, 200000);
});

describe("The King's Players, Act II: the Mousetrap", () => {
  const staged = async () => {
    const k = await KP.start('kp2');
    k.assert('royalCall', 'pentrice').assert('auditioned', 'rierdan').assert('provisional', 'rierdan').set('favour', 'rierdan', '3');
    return k;
  };
  it('keeps the guard only while the party is in the flies: stay, signal from the loft, and no bolt; come down, and it comes', async () => {
    const k = await staged();
    k.assert('mousetrapAsked', 'rierdan').set('nightDay', 'rierdan', '0').assert('modeVague', 'rierdan');
    k.put('party', 'playhouse_row');
    await k.play('=18:10');
    k.put('party', 'rot_flies'); // the ladder
    await k.play("Take up Pudding's place in the fly-loft with a sandbag and a cold stare");
    expect(k.holds('flyGuard', 'rierdan')).toBe(true);
    k.j.roll('pass');
    await k.play('=21:05', 'Give the signal for the curtain, and the play with the villain who is not anyone');
    expect(k.holds('playDone', 'rierdan')).toBe(true);
    await k.play('=+10');
    expect(k.holds('lotharWounded', 'rierdan')).toBe(false);
    expect(k.holds('flyGuard', 'rierdan')).toBe(true);
    k.put('party', 'rot_wings');
    await k.play('Wait › An hour');
    expect(k.holds('flyGuard', 'rierdan')).toBe(false);
    expect(k.holds('lotharWounded', 'rierdan')).toBe(true);
  }, 290000);
  it('is a horror when nothing is done: the Duke walks the whole way, and the party is struck', async () => {
    const k = await staged();
    k.assert('mousetrapAsked', 'rierdan').set('nightDay', 'rierdan', '0').put('party', 'playhouse_row');
    await k.play('=18:10', '=+6', '=+6', '=+12');
    expect(k.measure('ghostScore', 'rierdan')).toBeGreaterThanOrEqual(3);
    expect(k.holds('hurtOnce', 'party')).toBe(true);
  }, 200000);
});

describe("The King's Players: from Act II's quiet night into Act IV", () => {
  it('cancels the trap, wakes to a living Marshal and no Edict, is given the Wick, and chooses a plan, all by label', async () => {
    const k = await KP.start('kp24');
    k.assert('royalCall', 'pentrice').assert('auditioned', 'rierdan').assert('provisional', 'rierdan').set('favour', 'rierdan', '3');
    k.assert('mousetrapAsked', 'rierdan').set('nightDay', 'rierdan', '0');
    k.put('party', 'playhouse_row');
    await k.play('=18:10');
    k.put('party', 'rot_wings');
    await k.play('Ask Hepzibah to prompt the Mousetrap', 'No name. Cancel the trap. Play something else');
    expect(k.holds('modeCancel', 'rierdan')).toBe(true);
    await k.play('=+60');
    await k.play('=06:30');
    expect(k.holds('nightOver', 'rierdan')).toBe(true);
    expect(k.holds('marshalLives', 'rierdan')).toBe(true);
    expect(k.holds('bodyLies', 'pentrice')).toBe(false);
    expect(k.holds('edictOn', 'rierdan')).toBe(false);
    k.put('party', 'concourse');
    await k.play('Wait › An hour', 'Wait › An hour');
    expect(k.holds('wickGranted', 'rierdan')).toBe(true);
    expect(k.at('hepzibah')).toBe(p('lant_ward'));
    await k.play('To Playhouse Row', 'Into the Wick', "To the Wick's wardrobe", 'Ask Hepzibah to gather the company about the note', "Jem's: a false clerk, a false summons, and a good coat");
    expect(k.holds('planPudding', 'party')).toBe(true);
  }, 290000);
});
