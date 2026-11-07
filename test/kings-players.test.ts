import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';
import { readFileSync } from 'node:fs';

// The King's Players (doc/adventures/anthology/the-kings-players.md): Gosse's Company in Dun Rierdan, played by the
// labels a page offers, on the Pentrice city campaign with the Trial's verdict staged as read. Each act is a spec of
// its own; Act III has both its tragic path and a path on which everyone is saved.
const city = 'test/fixtures/gosse/city.campaign.json';
const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
const nod = 'Give Hepzibah the nod for the next scene';
class KP {
  constructor(readonly j: Journey) {}
  static async start(seed = 'kp') { return new KP(await Journey.start(city, seed)); }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  assert(name: string, ...args: string[]) { this.j.assert(p(name), ...args.map(p)); return this; }
  set(name: string, ...rest: string[]) {
    const value = Number(rest.at(-1)), args = rest.slice(0, -1).map(p);
    const c = this.j as unknown as { campaign: { world: { apply(c: unknown[]): unknown }; commitWorld(w: unknown): void } };
    c.campaign.commitWorld(c.campaign.world.apply([{ kind: 'set', call: ModuleWriter.call(p(name), ...args), value: ModuleWriter.number(value) }]));
    return this;
  }
  retract(name: string, ...args: string[]) {
    const c = this.j as unknown as { campaign: { world: { apply(c: unknown[]): unknown }; commitWorld(w: unknown): void } };
    c.campaign.commitWorld(c.campaign.world.apply([{ kind: 'retract', call: ModuleWriter.call(p(name), ...args.map(p)) }]));
    return this;
  }
  get pages() { return this.j.taken.map(x => `[${x.label}] ${x.page} ${x.told}`).join('\n'); }
  put(who: string, place: string) { this.j.put(p(who), p(place)); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  knows(f: string) { return this.j.holds('knows', 'party', p(f)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  at(who: string) { return this.j.at(p(who)); }
  // The Trial over and the writ taken: the road to Dun Rierdan, and the city's gate.
  async toTheRoad() {
    this.assert('verdictRead', 'pentrice').set('tday', 'pentrice', '6').put('party', 'moon_yard');
    await this.play('Wait › An hour', 'Wait › An hour', "Take the King's writ");
    this.put('party', 'eastgate');
    await this.play('To the King\'s Road', 'To the River Gate');
    return this;
  }
}

// The natural route, played by labels with no teleport: the Trial's own fixture to the verdict, then the herald, the
// writ, the East Street, the Eastgate and the King's Road. `Trial` returns a KP standing in the Moon's loft with the
// verdict read; `toTheGate` walks it to Dun Rierdan.
const steps = (name: string): string[] => {
  const ph = JSON.parse(readFileSync(`test/fixtures/gosse/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return (Array.isArray(ph) ? ph : Object.values(ph).flat()).slice(0, -1);
};
const reached = (k: KP) => k.j.campaign.world.related('reached').map(r => r.args[0]);
async function fromTrial(fixture = 'bow', seed = 'g1') {
  const k = await KP.start(seed);
  await k.play(...steps(fixture));
  return k;
}
async function toTheGate(k: KP) {
  await k.play('Wait › An hour', 'Out to the yard of the Painted Moon', "Take the King's writ", 'Out to the Westgate', 'To the Chepe',
    'To Guildhall Square', 'To the Minster Close', 'To the Eastgate', "To the King's Road");
  return k;
}

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
    if (k.j.offers("To the Sparrow's long loft")) await k.play("To the Sparrow's long loft");
    await k.play('Ask Hepzibah what the company will give the King', "The Miser's Wedding, the old one",
      'Ask Gosse how he wants the King to see him', 'As what you were. The King wants a king');
    if (k.j.offers("To the Brazen Sparrow's taproom")) await k.play("To the Brazen Sparrow's taproom");
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
    k.j.put('party', k.at('hepzibah')); // wherever the company is lodged at this hour
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
    k.j.put('party', k.at('hepzibah'));
    await k.play('Ask Hepzibah what the company will give the King', "The Miser's Wedding, the old one");
    await k.play('Ask Gosse how he wants the King to see him', "As what you are. He's old too");
    expect(k.holds('gosseHonest2', 'party')).toBe(true);
    if (k.j.offers("To the Brazen Sparrow's taproom")) await k.play("To the Brazen Sparrow's taproom");
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

describe("The King's Players, Act III: the Unburied", () => {
  const staged = async () => {
    const k = await KP.start('kp3');
    k.assert('royalCall', 'pentrice').assert('auditioned', 'rierdan').assert('nightOver', 'rierdan').assert('tarnFallen', 'rierdan')
      .assert('bodyLies', 'pentrice').assert('clemInWick', 'rierdan').assert('saltGiven', 'party').set('favour', 'rierdan', '3')
      .assert('lothalTrust', 'party');
    k.put('clemency', 'lant_ward').put('party', 'concourse');
    await k.play('Wait › A while');
    expect(k.holds('edictOn', 'rierdan')).toBe(true);
    return k;
  };
  it('lets "Stop you" stop her: the girl is kept from the Field, the Edict runs out, and the river has him', async () => {
    const k = await staged();
    await k.play('To the steps of the Tower of Bells', 'Into the Tower of Bells', 'Speak to the acolyte of the Bells, who is on her knees', "Stop you. I don't think you've counted the cost");
    expect(k.holds('ysoltStopped', 'party')).toBe(false); // the answer alone stops nothing
    k.j.roll('pass');
    await k.play('Keep Ysolt from the Field, by whatever can be said to her face');
    expect(k.holds('ysoltStopped', 'party')).toBe(true);
    expect(k.holds('ysoltBroken', 'rierdan')).toBe(true);
    k.j.roll(undefined);
    await k.play('Out to the steps of the Tower of Bells', 'To the Concourse of the Seven');
    await k.play('=+144', '=+144', '=+144', '=+30');
    expect(k.holds('bodyRiver', 'rierdan')).toBe(true);
    expect(k.holds('ysoltSealed', 'rierdan')).toBe(false);
    expect(k.holds('actIIIDone', 'rierdan')).toBe(true);
  }, 280000);
  it('is a quiet grave by the natural route: walked to the Bells, to the Field, and the girl is helped; the Warden finds the pebble and says nothing', async () => {
    const k = await staged();
    await k.play('To the steps of the Tower of Bells', 'Into the Tower of Bells', 'Speak to the acolyte of the Bells, who is on her knees', 'Help you, if I can');
    expect(k.holds('ysoltBury', 'party')).toBe(true);
    // Out to the Gate of Dust and the Field, and wait through the first night and the second day to the second night.
    await k.play('Out to the steps of the Tower of Bells', 'To the Gate of Dust', 'To the Field of Exposure', '=+144');
    await k.play('=23:20');
    expect(k.at('party')).toBe(p('field'));
    k.j.roll('pass');
    await k.play('Take a spade and help Ysolt Marrick lift the turf');
    expect(k.holds('buriedUnseen', 'rierdan')).toBe(true);
    expect(k.holds('actIIIDone', 'rierdan')).toBe(true);
    expect(k.holds('ysoltSealed', 'rierdan')).toBe(false);
    expect(k.holds('lucanDead', 'rierdan')).toBe(false);
    // And the book goes on: a long wait does not leave Act III open.
    k.j.roll(undefined);
    await k.play('Wait › An hour');
    expect(k.holds('wickGranted', 'rierdan')).toBe(true);
  }, 280000);
  it('can be ended by staging the tragedy over the body: the sextons are given a verdict to hear, and nobody is sealed', async () => {
    const k = await staged();
    k.put('party', 'lant_ward').put('pudding', 'lant_ward');
    await k.play("Ask Jem why he's so quiet", 'Nothing. He stands there and is sad');
    expect(k.holds('puddingBrave', 'party')).toBe(true);
    await k.play('Ask Clemency Orde what she is writing', 'Whoever the city decides. You write what happens; don\'t make it happen');
    k.put('party', 'concourse');
    await k.play('=+110');
    await k.play('=19:30');
    k.put('party', 'field');
    k.j.roll('pass');
    await k.play('Play the Marshal\'s tragedy at the Field of Exposure, over the body, and name him');
    expect(k.holds('bodyStaged', 'rierdan')).toBe(true);
    await k.play('Wait › An hour');
    expect(k.pages).toMatch(/take their hats off first/);
    expect(k.holds('actIIIDone', 'rierdan')).toBe(true);
    expect(k.holds('ysoltFree', 'rierdan')).toBe(true);
  }, 280000);
});

describe("The King's Players, Act IV: the Note", () => {
  // Act III's end is the one staged thing; everything after is walked and played by label.
  const staged = async (seed = 'kp4') => {
    const k = await KP.start(seed);
    k.assert('royalCall', 'pentrice').assert('auditioned', 'rierdan').set('favour', 'rierdan', '3');
    k.put('party', 'concourse');
    await k.play('Wait › An hour'); // the company is lodged at the Sparrow, as the arrival leaves it
    expect(k.at('hepzibah')).toBe(p('sparrow_loft'));
    k.assert('actIIIDone', 'rierdan');
    await k.play('Wait › A while');
    expect(k.holds('wickGranted', 'rierdan')).toBe(true);
    await k.play('Wait › An hour'); // the company, lodged at the Sparrow, moves into the Wick it was given
    expect(k.at('hepzibah')).toBe(p('lant_ward'));
    k.set('openingDay', 'rierdan', '0'); // the same evening, rather than waiting out the three days the lease allows
    return k;
  };
  const plan = async (k: KP, label: string) => {
    await k.play('To Playhouse Row', 'Into the Wick', "To the Wick's wardrobe", 'Ask Hepzibah to gather the company about the note', label);
  };
  const draper = async (k: KP) => {
    await k.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Salt Quay', "To Mistress Pardew's draper's");
    await k.play('Ask Mistress Pardew whether she dressed a clerk', "The note's a forgery. We mean to take it back");
    expect(k.holds('disguiseHad', 'party')).toBe(true);
    expect(k.holds('keyCopied', 'party')).toBe(true);
  };
  const backToWick = (k: KP) => k.play('To the Salt Quay', 'To Playhouse Row', 'Into the Wick');
  const toExchange = (k: KP) => k.play('Out to Playhouse Row', 'To the Concourse of the Seven', 'To the Exchange under the Tower of Coin');
  const charm = "Take Lord Rask's box for the evening, and a bottle, and Master Mauger's whole attention";
  it('is a caper by the false clerk: a coat, a wax key, a burnt forgery, and nothing in the city changed', async () => {
    const k = await staged();
    await plan(k, "Jem's: a false clerk, a false summons, and a good coat");
    await draper(k);
    await backToWick(k);
    await k.play('=19:10');
    expect(k.holds('openingNight', 'rierdan')).toBe(true);
    k.j.roll('pass');
    await k.play("To Lord Rask's box", charm);
    expect(k.holds('pomfretLocked', 'rierdan')).toBe(true);
    await k.play("To the Wick's dark stage");
    await toExchange(k);
    await k.play("Walk in at the counting-room door in the clerk's coat, as if you worked there");
    expect(k.holds('inCounting', 'party')).toBe(true);
    await k.play("Open Master Mauger's strong-box, with a key or without");
    expect(k.holds('noteTaken', 'party')).toBe(true);
    await k.play('Go out by the way you came, with the paper, before the third act ends');
    await k.play('To the Concourse of the Seven', 'To Playhouse Row', 'Into the Wick', "Burn the note in the Wick's ghost-light");
    expect(k.holds('noteGone', 'rierdan')).toBe(true);
    await k.play('=22:10');
    expect(k.holds('heistOver', 'rierdan')).toBe(true);
    expect(k.holds('caughtInCounting', 'party')).toBe(false);
  }, 290000);
  it('is a caper by the sealed summons: Oriel sends the clerk away and the box is left on the latch', async () => {
    const k = await staged('kp4o');
    k.assert('orielSworn', 'party'); // Act I's oath, kept
    await plan(k, "Oriel's: a summons from the Chamberlain, sealed, to take the clerk away");
    await k.play("To the Wick's dark stage", '=19:10');
    expect(k.holds('openingNight', 'rierdan')).toBe(true);
    await k.play('Out to Playhouse Row', 'To the Concourse of the Seven', 'To the Exchange under the Tower of Coin');
    k.j.roll('pass');
    await k.play("Present the Chamberlain's sealed summons at the counting-room door, and send the chief clerk to the King's Court");
    expect(k.holds('clerkLured', 'rierdan')).toBe(true);
    await k.play("Open Master Mauger's strong-box, with a key or without");
    expect(k.holds('noteTaken', 'party')).toBe(true);
  }, 290000);
  it('is a caper by Dorcas: she keeps the man in the box and the company goes in at the door', async () => {
    const k = await staged('kp4d');
    await plan(k, "Dorcas's: she keeps Master Mauger in the box, and Lord Rask looks the other way");
    await draper(k);
    await backToWick(k);
    await k.play('=19:10');
    k.j.roll('pass');
    await k.play("To Lord Rask's box", charm);
    await k.play("To the Wick's dark stage");
    await toExchange(k);
    await k.play('Slip in at the counting-room door while Dorcas has Master Mauger in the box, as the gentleman who is expected');
    expect(k.holds('inCounting', 'party')).toBe(true);
    await k.play("Open Master Mauger's strong-box, with a key or without");
    expect(k.holds('noteTaken', 'party')).toBe(true);
  }, 290000);
  it('says why the box will not open when the lie to Pardew left no key, and the coat is noticed', async () => {
    const k = await staged('kp4b');
    await plan(k, "Jem's: a false clerk, a false summons, and a good coat");
    await k.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Salt Quay', "To Mistress Pardew's draper's",
      'Ask Mistress Pardew whether she dressed a clerk', 'Costumes for a play about a clerk');
    expect(k.holds('keyCopied', 'party')).toBe(false);
    await backToWick(k);
    await k.play('=19:10');
    await k.play("To Lord Rask's box");
    k.j.roll('pass');
    await k.play(charm, "To the Wick's dark stage");
    await toExchange(k);
    await k.play("Walk in at the counting-room door in the clerk's coat, as if you worked there");
    expect(k.holds('inCounting', 'party')).toBe(true);
    expect(k.holds('coatSeen', 'rierdan')).toBe(true);
    await k.play('Try the strong-box with what you have');
    expect(k.pages).toMatch(/It does not open/);
    expect(k.measure('alarm', 'rierdan')).toBeGreaterThanOrEqual(2);
  }, 290000);
  it('goes wrong when the charm fails: Mauger comes down early and the company is caught in his counting-room', async () => {
    const k = await staged('kp4f');
    await plan(k, "Jem's: a false clerk, a false summons, and a good coat");
    await draper(k);
    await backToWick(k);
    await k.play('=19:10');
    k.j.roll('fail');
    await k.play("To Lord Rask's box", charm);
    expect(k.holds('pomfretBack', 'rierdan')).toBe(true);
    expect(k.holds('pomfretLocked', 'rierdan')).toBe(false);
    k.j.roll('pass');
    await k.play("To the Wick's dark stage");
    await toExchange(k);
    await k.play("Walk in at the counting-room door in the clerk's coat, as if you worked there");
    expect(k.measure('alarm', 'rierdan')).toBeGreaterThanOrEqual(2);
    k.j.roll('fail');
    await k.play('Wait › An hour');
    expect(k.holds('caughtInCounting', 'party')).toBe(true);
    await k.play('=22:10');
    expect(k.holds('noteGone', 'rierdan')).toBe(false);
  }, 290000);
});

describe("The King's Players, Act V: the Command", () => {
  const staged = async (seed: string, ...flags: string[]) => {
    const k = await KP.start(seed);
    k.assert('royalCall', 'pentrice').assert('auditioned', 'rierdan').assert('actIIIDone', 'rierdan').assert('wickGranted', 'rierdan')
      .assert('heistOver', 'rierdan').assert('titleByAccident', 'rierdan').set('favour', 'rierdan', '4').set('openingDay', 'rierdan', '0');
    for (const f of flags) k.assert(f, 'rierdan');
    k.put('party', 'concourse');
    await k.play('Wait › A while');
    expect(k.holds('commandOn', 'rierdan')).toBe(true);
    k.set('commandDay', 'rierdan', '0');
    await k.play('=19:10');
    expect(k.holds('holdingCommand', 'rierdan')).toBe(true);
    return k;
  };
  it('is a glorious fiasco: every scene goes wrong, the bear bows, and the King applauds', async () => {
    const k = await staged('kp5');
    k.assert('posing', 'party');
    // Scene by scene, the company does what the page offers and the dice are against it.
    k.j.roll('fail');
    await k.play('Give Hepzibah the nod for the next scene', 'Take Corin Fallow by the arm and walk him to a seat in the second row');
    await k.play('Give Hepzibah the nod for the next scene', "Seat the Marchants' masquers in the pit, and promise them the afterpiece");
    await k.play('Give Hepzibah the nod for the next scene'); // the Duke takes the third chair, and nobody has his name
    await k.play('Give Hepzibah the nod for the next scene', 'Play the Alderman at the top of your voice until he sits');
    await k.play('Give Hepzibah the nod for the next scene');
    await k.play('Give Hepzibah the nod for the next scene', 'Cut the scene, and go on to the bear');
    await k.play('Give Hepzibah the nod for the next scene', 'Take the company down for the call, in front of the bear');
    expect(k.holds('commandDone', 'rierdan')).toBe(true);
    expect(k.measure('chaos', 'rierdan')).toBeGreaterThanOrEqual(4);
    expect(k.j.session.canonical()).toBe(PlaySession.resume(JSON.parse(JSON.stringify(k.j.session.checkpoint()))).canonical());
  }, 290000);
  it('is a clean night when the note is gone and the scenes are managed: the theft that could not be proved', async () => {
    const k = await staged('kp5b', 'noteGone', 'ghostSatisfied');
    k.j.roll('pass');
    await k.play('Give Hepzibah the nod for the next scene', 'Take Corin Fallow by the arm and walk him to a seat in the second row');
    await k.play('Give Hepzibah the nod for the next scene');
    await k.play('Give Hepzibah the nod for the next scene');
    await k.play('Give Hepzibah the nod for the next scene');
    await k.play('Give Hepzibah the nod for the next scene');
    await k.play('Give Hepzibah the nod for the next scene', 'Cut the scene, and go on to the bear'.replace('Cut the scene, and go on to the bear', 'Give Gosse the Chorus, and let him say it as it is written'));
    await k.play('Give Hepzibah the nod for the next scene', 'Take the company down for the call, in front of the bear');
    expect(k.holds('commandDone', 'rierdan')).toBe(true);
    expect(k.measure('chaos', 'rierdan')).toBeLessThan(4);
  }, 290000);
  for (const [choice, label] of [['correct', "Put it right. You'll sleep better"], ['keep', 'Leave it. A slip is a slip, and the King is happy']] as const) {
    it(`Mallam's book, ${choice}: ${choice === 'correct' ? 'the title is earned twice and forgiven more at the call' : 'Pyke finds the slip in scene 3'}`, async () => {
      const k = await staged(`kp5m-${choice}`, 'noteGone', 'ghostSatisfied', 'titleByAccident');
      // Before the call: the Chamberlain's closet, the clerk, the book.
      k.j.put('party', p('closet'));
      await k.play("Ask Osbert Mallam whether he means to correct the Chamberlain's book", label);
      expect(k.holds(choice === 'correct' ? 'bookCorrected' : 'mallamKept', 'party')).toBe(true);
      k.j.put('party', p('lant_stage'));
      k.j.roll('pass');
      for (let n = 0; n < 3; n++) await k.play('Give Hepzibah the nod for the next scene');
      if (choice === 'keep') { expect(k.holds('slipFound', 'rierdan')).toBe(true); expect(k.pages).toMatch(/entered as absent/); }
      else { expect(k.holds('mendPaid', 'rierdan')).toBe(true); expect(k.measure('standingR', 'rierdan')).toBeGreaterThanOrEqual(2); }
    }, 290000);
  }
  it('pays the Swale arc: the one who hid it blurts in scene 4, the one who owned it stands, and the stakes differ', async () => {
    const hid = await staged('kp5h');
    hid.assert('swaleHidden', 'party');
    hid.j.roll('pass');
    for (let n = 0; n < 4; n++) await hid.play('Give Hepzibah the nod for the next scene');
    expect(hid.pages).toMatch(/It is mine! I wrote it!/);
    expect(hid.holds('swaleBlurted', 'rierdan')).toBe(true);
    const owned = await staged('kp5o');
    owned.assert('swaleOwned', 'party').assert('gosseTold', 'party');
    for (let n = 0; n < 4; n++) await owned.play('Give Hepzibah the nod for the next scene');
    expect(owned.pages).toMatch(/Mr Gosse has forgiven it/);
    expect(owned.holds('swaleStood', 'rierdan')).toBe(true);
    expect(owned.measure('chaos', 'rierdan')).toBeLessThan(hid.measure('chaos', 'rierdan'));
  }, 290000);
  it('lets someone who left Pentrice be found in Dun Rierdan and asked home, and does not hard-code a roster', async () => {
    const k = await KP.start('kp-found');
    k.assert('dorcasGone', 'dorcas').retract('troupe', 'dorcas').assert('swaleGone', 'swale').retract('troupe', 'swale');
    k.assert('royalCall', 'pentrice');
    await k.play('Wait › An hour');
    expect(k.at('dorcas')).toBe(p('rot_front'));
    expect(k.at('swale')).toBe(p('sparrow_taproom'));
    expect(k.at('gosse')).toBe(p('sparrow_loft'));
    k.put('party', 'rot_front');
    await k.play('Ask Dorcas whether the Rotunda is all she thought it would be', 'There is a part, and a wardrobe, and a Gosse who has not got over you');
    await k.play('Wait › An hour');
    expect(k.holds('troupe', 'dorcas')).toBe(true);
    expect(k.holds('dorcasGone', 'dorcas')).toBe(false);
  }, 200000);
  it('lets the bear take the call alone: the company is not in it, and the coda says so', async () => {
    const k = await staged('kp5-bear', 'noteGone', 'ghostSatisfied', 'bodyRiver');
    k.j.roll('pass');
    for (let n = 0; n < 7; n++) await k.play('Give Hepzibah the nod for the next scene');
    await k.play('Send Patience out to the call alone, and keep the company in the wings');
    expect(k.holds('bowBear', 'rierdan')).toBe(true);
    expect(k.pages).toMatch(/did not take the call/);
  }, 290000);
  it('gathers the Repertory tour by who is in the troupe: Kit, sent to the Marchants, is not carried to the Wend', async () => {
    const k = await staged('kp5-tour', 'noteGone', 'ghostSatisfied');
    k.assert('commandOn', 'rierdan').assert('kitLeaves', 'party');
    await k.play('Wait › An hour');
    expect(k.holds('troupe', 'kit')).toBe(false);
    k.put('party', 'wend_cross');
    await k.play('Wait › An hour');
    expect(k.at('tam')).toBe(p('wend_taproom'));
    expect(k.at('kit')).not.toBe(p('wend_taproom'));
  }, 200000);
  it('pays the side quests in the acts: a smashed press is read in the house, a licence seats the masquers', async () => {
    const k = await staged('kp5sq', 'noteGone', 'ghostSatisfied', 'printerSmashed', 'mummersLicensed');
    k.assert('posing', 'party');
    k.j.roll('pass');
    await k.play(nod);
    expect(k.pages).toMatch(/THE PLAYERS AND THE PRESS/);
    await k.play(nod);
    expect(k.holds('mumPaid', 'rierdan')).toBe(true);
    expect(k.holds('s2Done', 'rierdan')).toBe(true);
  }, 290000);
  it('lets the player answer the company in the wings: Dorcas, Hepzibah and Kit each go one way or the other', async () => {
    const k = await KP.start('kp5c');
    k.assert('royalCall', 'pentrice').assert('raskCharmed', 'party').assert('twinsMet', 'party');
    for (const w of ['dorcas', 'hepzibah', 'kit']) k.assert('lodged', w);
    k.put('party', 'lant_ward').put('dorcas', 'lant_ward').put('hepzibah', 'lant_ward').put('kit', 'lant_ward');
    await k.play('Ask Dorcas what Lord Rask said in the box', 'Stay. You\'d never forgive the house for the loss of you');
    await k.play('Ask Hepzibah whether she has ever told Gosse', 'Tell him. A man ought to know');
    await k.play('Ask Kit about Oriel Marchant', 'Go with her. A trade is a trade, and love is rarer');
    expect(k.holds('dorcasStays', 'party')).toBe(true);
    expect(k.holds('hepzibahSpoke', 'party')).toBe(true);
    expect(k.holds('kitLeaves', 'party')).toBe(true);
  }, 200000);
});
