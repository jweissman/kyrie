import { describe, expect, it } from 'bun:test';
import { PlaySession } from '../src/session/play-session';
import { p, nod, KP } from './support/kings-players';

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
    for (const f of flags) {k.assert(f, 'rierdan');}
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
    const saved = JSON.parse(JSON.stringify(k.j.session.checkpoint()));
    expect(k.j.session.canonical()).toBe(PlaySession.resume(saved).canonical());
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
      for (let n = 0; n < 3; n++) {await k.play('Give Hepzibah the nod for the next scene');}
      if (choice === 'keep') { expect(k.holds('slipFound', 'rierdan')).toBe(true); expect(k.pages).toMatch(/entered as absent/); }
      else { expect(k.holds('mendPaid', 'rierdan')).toBe(true); expect(k.measure('standingR', 'rierdan')).toBeGreaterThanOrEqual(2); }
    }, 290000);
  }
  it('pays the Swale arc: the one who hid it blurts in scene 4, the one who owned it stands, and the stakes differ', async () => {
    const hid = await staged('kp5h');
    hid.assert('swaleHidden', 'party');
    hid.j.roll('pass');
    for (let n = 0; n < 4; n++) {await hid.play('Give Hepzibah the nod for the next scene');}
    expect(hid.pages).toMatch(/It is mine! I wrote it!/);
    expect(hid.holds('swaleBlurted', 'rierdan')).toBe(true);
    const owned = await staged('kp5o');
    owned.assert('swaleOwned', 'party').assert('gosseTold', 'party');
    for (let n = 0; n < 4; n++) {await owned.play('Give Hepzibah the nod for the next scene');}
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
    for (let n = 0; n < 7; n++) {await k.play('Give Hepzibah the nod for the next scene');}
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
    for (const w of ['dorcas', 'hepzibah', 'kit']) {k.assert('lodged', w);}
    k.put('party', 'lant_ward').put('dorcas', 'lant_ward').put('hepzibah', 'lant_ward').put('kit', 'lant_ward');
    await k.play('Ask Dorcas what Lord Rask said in the box', 'Stay. You\'d never forgive the house for the loss of you');
    await k.play('Ask Hepzibah whether she has ever told Gosse', 'Tell him. A man ought to know');
    await k.play('Ask Kit about Oriel Marchant', 'Go with her. A trade is a trade, and love is rarer');
    expect(k.holds('dorcasStays', 'party')).toBe(true);
    expect(k.holds('hepzibahSpoke', 'party')).toBe(true);
    expect(k.holds('kitLeaves', 'party')).toBe(true);
  }, 200000);
});
