import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { ModuleWriter } from '../src/lang/module-writer';

// The King's Players (doc/adventures/anthology/the-kings-players.md): Gosse's Company in Dun Rierdan, played by the
// labels a page offers, on the Pentrice city campaign with the Trial's verdict staged as read. Each act is a spec of
// its own; Act III has both its tragic path and a path on which everyone is saved.
const city = 'test/fixtures/gosse/city.campaign.json';
const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
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
    k.put('party', 'sparrow_loft');
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

describe("The King's Players, Act II: the Mousetrap", () => {
  const staged = async () => {
    const k = await KP.start('kp2');
    k.assert('royalCall', 'pentrice').assert('auditioned', 'rierdan').assert('provisional', 'rierdan').set('favour', 'rierdan', '3');
    return k;
  };
  it('is prepared for in the afternoon, survived by salt and a play, and ends with the Marshal fallen', async () => {
    const k = await staged();
    k.put('party', 'terrace');
    await k.play('Go out on the terrace and stand where the Prince can say it', "Yes. I've met two");
    expect(k.holds('mousetrapAsked', 'rierdan')).toBe(true);
    k.put('party', 'salt_hall');
    await k.play('Ask the Salt-Wives what keeps a dead thing out of a house', 'Silence. When they stop listening');
    expect(k.holds('saltGiven', 'party')).toBe(true);
    k.put('party', 'ringers_loft');
    await k.play('Ask Brother Ambros how to stop a walking dead man', 'To be remembered. His name, said aloud');
    expect(k.holds('bellRemember', 'party')).toBe(true);
    k.put('party', 'lamp_roof');
    k.j.roll('pass');
    await k.play('Look at the new rail, the old wall and the place the Duke stood');
    expect(k.holds('gloveFound', 'party')).toBe(true);
    // The night: the Duke leaves the roof at six, an hour a step. Salt on the Rotunda's door keeps him in the Row.
    k.j.roll(undefined);
    k.set('nightDay', 'rierdan', '0');
    k.put('party', 'playhouse_row');
    await k.play('=18:10');
    k.put('party', 'rot_front');
    expect(k.holds('nightOn', 'rierdan')).toBe(true);
    await k.play('Lay a line of grey salt across the threshold');
    expect(k.holds('salted', 'rot_front')).toBe(true);
    k.put('party', 'rot_wings');
    await k.play('=20:55');
    expect(k.at('duke_ghost')).not.toBe(p('rot_stage'));
    await k.play('Ask Hepzibah to prompt the Mousetrap', "The Marshal's. Plainly");
    expect(k.holds('modePoint', 'rierdan')).toBe(true);
    k.put('party', 'rot_flies');
    await k.play("Take up Pudding's place in the fly-loft with a sandbag and a cold stare");
    k.put('party', 'rot_wings');
    k.j.roll('pass');
    await k.play('=21:05', 'Give the signal for the curtain, and the play');
    expect(k.holds('tarnExposed', 'rierdan')).toBe(true);
    k.j.roll(undefined);
    await k.play('=06:30');
    expect(k.holds('nightOver', 'rierdan')).toBe(true);
    expect(k.holds('lotharWounded', 'rierdan')).toBe(false);
    expect(k.holds('tarnFallen', 'rierdan')).toBe(true);
    expect(k.holds('bodyLies', 'pentrice')).toBe(true);
  }, 290000);
  it('is a horror when nothing is done: the Duke walks the whole way, and the party is struck', async () => {
    const k = await staged();
    k.assert('mousetrapAsked', 'rierdan').set('nightDay', 'rierdan', '0').put('party', 'playhouse_row');
    await k.play('=18:10', '=+6', '=+6', '=+12');
    expect(k.measure('ghostScore', 'rierdan')).toBeGreaterThanOrEqual(3);
    expect(k.holds('hurtOnce', 'party')).toBe(true);
  }, 200000);
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
  it('is a tragedy when no one acts: the girl buries him, is caught, is sealed, and the Warden\'s son follows', async () => {
    const k = await staged();
    k.put('party', 'ringers_loft');
    await k.play('Ask Brother Ambros what the bells say of the Edict', 'The city. They were fed by it, and they owe it a clean death');
    k.put('party', 'bell_nave');
    await k.play('Speak to the acolyte of the Bells, who is on her knees', 'Watch. It is yours to do');
    k.put('party', 'wick_nowhere_placeholder'.replace('wick_nowhere_placeholder', 'concourse'));
    await k.play('=+144', '=+144', '=+60');
    expect(k.holds('ysoltSealed', 'rierdan')).toBe(true);
    expect(k.holds('lucanDead', 'rierdan')).toBe(true);
    expect(k.holds('actIIIDone', 'rierdan')).toBe(true);
    expect(k.holds('clemSatisfied', 'rierdan')).toBe(true);
    expect(k.holds('ysoltFree', 'rierdan')).toBe(false);
  }, 280000);
  it('can be ended on the second night by a Warden who has heard the blind man and his own son: nobody dies, and the playwright is furious', async () => {
    const k = await staged();
    k.put('party', 'dust_gate');
    await k.play('Ask the Warden whether it must be the whole three days'.replace('Ask the Warden whether it must be the whole three days', 'Speak to Lucan Verrall at the Dust Gate'),
      'Go to your father yourself. Tell him what he\'s done');
    expect(k.holds('lucanPleaded', 'party')).toBe(true);
    k.put('party', 'ringers_loft');
    await k.play('Ask Brother Ambros what the bells say of the Edict', 'The ones who weep. They are the only ones the dead have');
    expect(k.holds('prophecyHeard', 'party')).toBe(true);
    k.put('party', 'king_court');
    await k.play('Ask the Warden whether it must be the whole three days', "Yes. I'd live in it");
    expect(k.holds('verrallSoftened', 'party')).toBe(true);
    k.put('party', 'wick_nowhere'.replace('wick_nowhere', 'concourse'));
    await k.play('=+225');
    k.put('party', 'dust_gate');
    k.j.roll('pass');
    await k.play('Remind the Warden what he heard you say, and tell him what the blind man said, at the Dust Gate');
    expect(k.holds('pardoned', 'rierdan')).toBe(true);
    expect(k.holds('ysoltFree', 'rierdan')).toBe(true);
    expect(k.holds('lucanLives', 'rierdan')).toBe(true);
    k.j.roll(undefined);
    await k.play('Wait › An hour');
    expect(k.holds('clemFurious', 'rierdan')).toBe(true);
    expect(k.holds('ysoltSealed', 'rierdan')).toBe(false);
  }, 280000);
  it('can be ended by staging the tragedy over the body: the sextons are given a verdict to hear, and nobody is sealed', async () => {
    const k = await staged();
    k.put('party', 'lant_ward');
    await k.play('Ask Clemency Orde what she is writing', 'Whoever the city decides. You write what happens; don\'t make it happen');
    k.put('party', 'concourse');
    await k.play('=+110');
    await k.play('=19:30');
    k.put('party', 'field');
    k.j.roll('pass');
    await k.play('Play the Marshal\'s tragedy at the Field of Exposure, over the body, and name him');
    expect(k.holds('bodyStaged', 'rierdan')).toBe(true);
    expect(k.holds('actIIIDone', 'rierdan')).toBe(true);
    expect(k.holds('ysoltFree', 'rierdan')).toBe(true);
  }, 280000);
});

describe("The King's Players, Act IV: the Note", () => {
  const staged = async () => {
    const k = await KP.start('kp4');
    k.assert('royalCall', 'pentrice').assert('auditioned', 'rierdan').assert('actIIIDone', 'rierdan').set('favour', 'rierdan', '3');
    k.put('party', 'concourse');
    await k.play('Wait › A while');
    expect(k.holds('wickGranted', 'rierdan')).toBe(true);
    k.set('openingDay', 'rierdan', '0'); // the same evening, rather than waiting out the three days the lease allows
    return k;
  };
  const prepare = async (k: KP) => {
    k.put('party', 'lant_ward').put('hepzibah', 'lant_ward');
    await k.play('Ask Hepzibah to gather the company about the note', "Jem's: a false clerk, a false summons, and a very good coat");
    k.put('party', 'draper');
    await k.play('Ask Mistress Pardew whether she dressed a clerk', "The note's a forgery. We mean to take it back");
    expect(k.holds('disguiseHad', 'party')).toBe(true);
    expect(k.holds('keyCopied', 'party')).toBe(true);
  };
  it('is a caper: a false clerk, a wax key and a burnt forgery, with nothing in the city changed', async () => {
    const k = await staged();
    await prepare(k);
    k.put('party', 'concourse');
    await k.play('=19:10');
    expect(k.holds('openingNight', 'rierdan')).toBe(true);
    k.put('party', 'wick_box');
    k.j.roll('pass');
    await k.play("Take Lord Rask's box for the evening, and a bottle, and Master Pomfret's whole attention");
    expect(k.holds('pomfretLocked', 'rierdan')).toBe(true);
    k.put('party', 'exchange');
    await k.play("Walk in at the counting-room door in the clerk's coat, as if you worked there");
    expect(k.holds('inCounting', 'party')).toBe(true);
    await k.play("Open Master Pomfret's strong-box, with a key or without");
    expect(k.holds('noteTaken', 'party')).toBe(true);
    await k.play('Go out by the way you came, with the paper, before the third act ends');
    k.put('party', 'lant_stage');
    await k.play("Burn the note in the Wick's ghost-light");
    expect(k.holds('noteGone', 'rierdan')).toBe(true);
    await k.play('=22:10');
    expect(k.holds('heistOver', 'rierdan')).toBe(true);
    expect(k.holds('caughtInCounting', 'party')).toBe(false);
  }, 280000);
  it('goes wrong: the company is caught in the counting-room, and the note stays with Pomfret', async () => {
    const k = await staged();
    await prepare(k);
    k.put('party', 'concourse');
    await k.play('=19:10');
    k.put('party', 'exchange');
    k.j.roll('pass');
    await k.play("Walk in at the counting-room door in the clerk's coat, as if you worked there");
    k.set('alarm', 'rierdan', '3');
    await k.play('Wait › An hour');
    expect(k.holds('caughtInCounting', 'party')).toBe(true);
    k.j.roll(undefined);
    await k.play('=22:10');
    expect(k.holds('heistOver', 'rierdan')).toBe(true);
    expect(k.holds('noteGone', 'rierdan')).toBe(false);
  }, 280000);
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
  it('lets the player answer the company in the wings: Dorcas, Hepzibah and Kit each go one way or the other', async () => {
    const k = await KP.start('kp5c');
    k.assert('royalCall', 'pentrice').assert('raskCharmed', 'party').assert('twinsMet', 'party');
    k.put('party', 'lant_ward').put('dorcas', 'lant_ward').put('hepzibah', 'lant_ward').put('kit', 'lant_ward');
    await k.play('Ask Dorcas what Lord Rask said in the box', 'Stay. You\'d never forgive the house for the loss of you');
    await k.play('Ask Hepzibah whether she has ever told Gosse', 'Tell him. A man ought to know');
    await k.play('Ask Kit about Oriel Marchant', 'Go with her. A trade is a trade, and love is rarer');
    expect(k.holds('dorcasStays', 'party')).toBe(true);
    expect(k.holds('hepzibahSpoke', 'party')).toBe(true);
    expect(k.holds('kitLeaves', 'party')).toBe(true);
  }, 200000);
});
