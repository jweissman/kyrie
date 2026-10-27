import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Bowl, L } from './support/low-water';
import { PlaySession } from '../src/session/play-session';

// Low Water beyond the first pass: the Ear's Library, the Reflected, the wheel-rooms, Ammerlin in the water, the Glass
// Citadel and its heart, the doubles and the Assayers, the echoes in Act I, and the Hearing as a council of war.
describe('Low Water, the Auditor', () => {
  it('finds the Ear\'s Library, floats its door, and hears the Lector tell the Long Silence', async () => {
    const j = await Bowl.start('library');
    await j.play(...Bowl.arrive, '^To Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ward landing',
      '^To the new mud', '^To the dig', '^Into the Listening Hall', 'Search here', "^To the Lector's room|Lector's room", 'Fill a lantern',
      'speaking-stones: Examine › Push', '^To the gallery of jars|gallery of jars', 'Turn the archive valve open', '=+3',
      'Turn the archive valve shut', "^To the Lector's room|Lector's room", 'Turn the cistern valve open', '=+2', 'gallery of jars',
      'low archive', 'black speaking-stone: Examine › Push', '^Take');
    expect(Bowl.knows(j, 'lector_heard')).toBe(true);
    expect(Bowl.knows(j, 'silence_heard')).toBe(true);
    expect(j.holds('carries', 'party', L('ear_bell'))).toBe(true);
    await j.play('gallery of jars', "Lector's room", 'Listening Hall', '^Out to the dig', 'Talk to Teodor', 'what the Lector.s stones sing');
    expect(Bowl.knows(j, 'long_silence')).toBe(true);
  }, 300000);
  it('meets the Reflected on the Ward landing at night, and rings them apart with the Lector\'s bell', async () => {
    const j = await Bowl.start('reflected');
    await j.play(...Bowl.arrive, '^To Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ward landing',
      '^To the new mud', '^To the dig', '^Into the Listening Hall', 'Search here', "Lector's room", 'Fill a lantern',
      'gallery of jars', 'Turn the archive valve open', '=+3', 'Turn the archive valve shut', "Lector's room", 'Turn the cistern valve open',
      '=+2', 'gallery of jars', 'low archive', '^Take', 'gallery of jars', "Lector's room", 'Listening Hall', '^Out to the dig',
      '^To the new mud', '^To the Ward landing', '=375');
    expect(Bowl.knows(j, 'reflected_known')).toBe(true);
    const before = j.measure(L('approach'), L('bowl'));
    await j.play('Ring the Ear.s bell at the Reflected');
    expect(j.measure(L('approach'), L('bowl'))).toBe(before - 1);
    expect(Bowl.said(j, j.taken.length - 1)).toContain('each figure goes to rings');
  }, 300000);
  it('reads the cuts in the Cantor\'s hymnal back to the Second Reader, and Isaura breaks his footnotes', async () => {
    const j = await Bowl.start('pell');
    await j.play(...Bowl.arrive, '^To Measures Square', '^Into the Sounding', "Cantor's room", "working hymnal: Examine",
      'Talk to Cantor', 'who marked the cuts', 'Take your leave', "^To the Sounding's nave", '^Out to Measures Square', "^To the Dyers' Walk",
      '^To the lock stair', '^To the Ward landing', '^To the new mud', '^To the dig', 'Talk to Teodor', 'who sent him to Ammerlin',
      'Take your leave', 'footnotes in Pell', 'Talk to Teodor', 'what the footnotes');
    expect(Bowl.knows(j, 'pell_cipher')).toBe(true);
    expect(j.holds(L('halmTurned'), L('halm'))).toBe(true);
    expect(Bowl.said(j, j.taken.length - 1)).toContain('Merrow');
  }, 300000);
  it('walks the nine wheel-rooms, times the seventh wheel\'s tide to read its dial, and finds what is set in the ninth', async () => {
    const j = await Bowl.start('wheels');
    await j.play(...Bowl.act1, ...Bowl.trial, 'Fill a lantern', '^To the intake culvert', '^To the dry vestibule', '^Take', '^Take',
      'Hall of the Equals', 'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone',
      '^To the counting gallery', 'room of the first wheel', 'counting gallery', 'room of the fourth wheel', 'counting gallery',
      'room of the seventh wheel', '~face of the seventh wheel', "seventh wheel's dial: Examine");
    expect(Bowl.knows(j, 'wheels_counted')).toBe(true);
    expect(Bowl.knows(j, 'unborn_read')).toBe(true);
    await j.play('=+3');
    expect(j.at('party')).toBe(L('w_unborn'));
    await j.play('counting gallery', 'room of the ninth wheel');
    expect(Bowl.knows(j, 'remainder_seen')).toBe(true);
  }, 300000);
  it('follows the Reflected down the Mere with the Lector\'s bell, through Ammerlin in the water, to the Auditor at the top of the stair', async () => {
    const j = await Bowl.start('interval');
    await j.play(...Bowl.arrive, ...Bowl.bell, '^To the new mud');
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), ...Bowl.ledger, ...Bowl.upStair, 'seat of the Auditor', 'Talk to the Auditor',
      'what it is', 'what it is owed', 'what becomes of Ammerlin', 'why the account is addressed upward');
    expect(Bowl.knows(j, 'water_kept')).toBe(true);
    expect(Bowl.knows(j, 'ledger_of_water')).toBe(true);
    expect(j.holds(L('doubled'), 'party')).toBe(true);
    expect(Bowl.knows(j, 'receipts_read')).toBe(true);
    expect(Bowl.knows(j, 'circles_read')).toBe(true);
    expect(Bowl.knows(j, 'auditor_heard')).toBe(true);
    expect(Bowl.said(j, j.taken.length - 1)).toContain('I am tired');
  }, 300000);
  for (const [seed, choice, ending] of [
    ['given', ['seat of the Auditor', 'Give the Auditor its heart'], 'heart_given'],
    ['sent', ['Let the heart go up through the opening'], 'audit_sent'],
    ['kept', null, 'ninth_jewel'],
  ] as const) {
    it(`takes the heart back from the Reflected with the Lector's bell, the night the count closes, and ends ${ending}`, async () => {
      const j = await Bowl.start(seed);
      await j.play(...Bowl.arrive, ...Bowl.bell, '^To the new mud', '^To the Ward landing');
      await Bowl.untilComplete(j);
      expect(j.holds('keeps', L('reflected'), L('ninth_heart'))).toBe(true);
      await Bowl.untilReflected(j);
      await j.play('Ring the Ear.s bell at the Reflected who carry', '^Take');
      expect(j.holds('carries', 'party', L('ninth_heart'))).toBe(true);
      if (choice) {
        await j.play(...Bowl.underMere, ...Bowl.upStair, ...choice);
      } else {
        await j.play('^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^To the head of the Stair', '^To the north road',
          'Go up out of the Bowl');
      }
      expect(j.holds('reached', L(ending))).toBe(true);
    }, 300000);
  }
  it('has Isaura write the false figure in front of the Auditor, before the count is whole, and comes home to the False Measure', async () => {
    const j = await Bowl.start('false');
    await j.play(...Bowl.act1, ...Bowl.trial, 'Fill a lantern', '^To the intake culvert', '^To the dry vestibule', '^Take', '^Take',
      'Hall of the Equals', 'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone',
      '^To the counting gallery', 'room of the ninth wheel', 'counting gallery', 'Hall of the Equals', '^To the dry vestibule',
      '^To the intake culvert', '^To the Ninth Lock', '^To the lock stair', '^To the Ward landing', '^To the new mud', '^To the dig',
      ...Bowl.bell.slice(6), '=150', 'Talk to Teodor', 'what is set in the ninth wheel', 'Take your leave', '^To the new mud');
    expect(Bowl.knows(j, 'auditor_known')).toBe(true);
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), ...Bowl.ledger, 'what she sees in the ledger of water', 'write the false figure',
      ...Bowl.upStair, 'seat of the Auditor', 'Ask Isaura to write the false figure');
    expect(j.holds(L('countFalsified'), L('reckoner'))).toBe(true);
    expect(j.measure(L('approach'), L('bowl'))).toBe(0);
    expect(j.holds(L('complete'), L('reckoner'))).toBe(false);
    await j.play('hall of the nine circles', 'hall of receipts', 'glass gate', 'top of the stair', 'foot of the stair',
      'Ward in the water', 'square in the water', 'Rim in the water', 'Bowl in the water', 'still water', 'Ward landing',
      '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^To the head of the Stair', '^To the north road',
      'Go up out of the Bowl');
    expect(j.holds('reached', L('false_measure'))).toBe(true);
  }, 300000);
});

describe('Low Water, the Auditor: the watch, the doubles and the jar', () => {
  it('learns the Lector\'s words from Halm, climbs to the Auditor, and stays at the door to sing the Fourth: the Long Watch', async () => {
    const j = await Bowl.start('watch');
    await j.play(...Bowl.arrive, ...Bowl.bell, '=150', 'Talk to Teodor', 'what the Lector.s stones sing', 'Take your leave', '^To the new mud');
    expect(Bowl.knows(j, 'lector_words')).toBe(true);
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), ...Bowl.upStair, 'seat of the Auditor', 'Talk to the Auditor', 'what it is', 'about Aun');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('She was not afraid of me');
    await j.play('Stay at the door of the seat');
    expect(j.holds('reached', L('long_watch'))).toBe(true);
  }, 300000);
  it('lingers in the Ward in the water until the doubles walk, and has Isaura measure them back into the Mere', async () => {
    const j = await Bowl.start('doubles');
    await j.play(...Bowl.arrive, ...Bowl.bell, '^To the new mud');
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), 'Ward in the water', '=+12');
    expect(j.holds(L('doublesLoose'), 'party')).toBe(true);
    await j.play('square in the water', 'Rim in the water', 'Bowl in the water', 'still water', 'Ward landing');
    expect(j.at(L('doubles'))).toBe(L('ward_landing'));
    expect(Bowl.page(j)).toContain('coming slowly up the steps');
    // Wait on the landing and they come; every way past them is still open in the fight.
    await j.play('Wait › A while');
    expect(j.holds('tolerates', L('doubles'), 'party')).toBe(false);
    expect(j.choices().some(c => c.label === 'Attack')).toBe(true);
    await j.play('Ask Isaura to measure your doubles');
    expect(j.holds(L('doublesLaid'), 'party')).toBe(true);
    expect(Bowl.page(j)).toContain('They can’t check it');
  }, 300000);
  it('breaks Annet Kettle\'s jar in the hall of receipts, and Isaura enters the debit before the Assayers level it', async () => {
    const j = await Bowl.start('halm');
    await j.play(...Bowl.arrive, '^To Measures Square', '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar',
      'what she wants from you', 'Take your leave', '^To the hall of the Office', '^Out to Measures Square', "^To the Dyers' Walk",
      '^To the lock stair', '^To the Ward landing', '^To the new mud', '^To the dig', 'Talk to Dov', 'Quill.s agent', 'Take your leave',
      ...Bowl.freeze, '=430');
    expect(j.holds(L('drowned'), L('diggers'))).toBe(true);
    await j.play(...Bowl.bell.slice(6), '^To the new mud');
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), 'Ward in the water', 'foot of the stair', 'top of the stair', 'glass gate',
      'hall of receipts', 'jars of counted water: Examine');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('Annet Kettle. She is still calling');
    await j.play("Take down Annet Kettle's jar");
    expect(j.holds(L('annetFreed'), 'party')).toBe(true);
    expect(j.at(L('assayers'))).toBe(L('hall_receipts'));
    await j.play('Ask Isaura to enter the broken jar');
    expect(j.at(L('assayers'))).toBe(L('glass_gate'));
    expect(j.holds('tolerates', L('assayers'), 'party')).toBe(true);
  }, 300000);
  it('shows the account before anyone can read it: the Check in the Office, double entry, and the Lector\'s bench', async () => {
    const j = await Bowl.start('echoes');
    await j.play(...Bowl.arrive, '^To Measures Square', '^Into the Office of Measures');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('The clerks call it the Check');
    await j.play('Ask Isaura about the black glass', 'ledger room', 'why every figure in the Office ledgers is written twice');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('A book that checks itself');
    await j.play('^To the hall of the Office', '^Out to Measures Square', '^Into the Sounding');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('a woman.s face carved over it'.replace('.', "'"));
  }, 300000);
  for (const [seed, remedy, verdict, ending] of [
    ['council-fourth', 'order the Fourth Remainder sung', 'verdictFourth', 'held_door'],
    ['council-settle', 'offer the creditor the Ward', 'verdictSettle', 'ward_settled'],
  ] as const) {
    it(`lays the account before the Council, names the creditor, and the Council answers: ${verdict}`, async () => {
      const j = await Bowl.start(seed);
      await j.play(...Bowl.act1, ...Bowl.trial, ...Bowl.descentNinth, ...Bowl.night, ...Bowl.morningNinth);
      expect(Bowl.knows(j, 'auditor_known')).toBe(true);
      await j.play(...Bowl.office2, '=820', 'Ask Isaura if she will sign', ...Bowl.toMoot, '=889', ...Bowl.councilFinding(remedy));
      expect(Bowl.pages(j)).toContain('The good of the many is a sum. I didn’t say it was a kind one');
      expect(Bowl.pages(j)).not.toContain('a laugh, which he has earned');
      expect(j.holds(L(verdict), L('ammerlin'))).toBe(true);
      if (verdict === 'verdictSettle') {
        expect(j.holds(L('dissented'), L('isaura'))).toBe(true);
        await j.play('=962');
        expect(j.holds(L('wardGiven'), L('ammerlin'))).toBe(true);
        expect(Bowl.mere(j)).toBe(64);
        expect(j.measure(L('approach'), L('bowl'))).toBe(0);
      }
      await j.play(...Bowl.leave);
      expect(j.holds('reached', L(ending))).toBe(true);
    }, 300000);
  }
});

describe('Low Water, the Auditor: the Hearing, the heart and the stair', () => {
  it('carries the Auditor\'s question down to the Hearing, and the Council enters the Ward as inestimable', async () => {
    const j = await Bowl.start('council-inestimable');
    await j.play(...Bowl.act1, ...Bowl.trial, ...Bowl.descentNinth, ...Bowl.night, ...Bowl.morningNinth,
      ...Bowl.bell.slice(6),
      '^To the new mud');
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), ...Bowl.upStair, 'seat of the Auditor', 'Talk to the Auditor', 'what it is',
      'what it wants of you', ...Bowl.fromSeat, ...Bowl.office2.slice(2), '=820', 'Ask Isaura if she will sign', ...Bowl.toMoot, '=889',
      ...Bowl.councilFinding('enter the Ward in the Office.s ledger as inestimable', 'creditor.s own question'));
    expect(j.holds(L('verdictInestimable'), L('ammerlin'))).toBe(true);
    expect(j.holds(L('wardValued'), L('bowl'))).toBe(true);
    // Back up the stair afterward: the creditor heard it read.
    await j.play('^To the hall of the Office', '^Out to Measures Square', "^To the Dyers' Walk", '^To the lock stair',
      '^To the Ward landing', '^To the new mud');
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), 'Ward in the water', 'foot of the stair', 'top of the stair', 'glass gate',
      'hall of receipts', 'nine circles', 'seat of the Auditor', 'Tell the Auditor what the Council entered');
    expect(Bowl.page(j)).toContain('It is the second time');
    await j.play(...Bowl.fromSeat, '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^To the head of the Stair',
      '^To the north road', 'Go up out of the Bowl');
    expect(j.holds('reached', L('inestimable'))).toBe(true);
  }, 300000);
  it('holds the door when the count closes, opens the grille of the ninth arch, and carries the heart out of the Bowl', async () => {
    const j = await Bowl.start('kept-count');
    await j.play(...Bowl.keptCount);
    await Bowl.untilComplete(j);
    expect(j.holds(L('doorHeld'), L('reckoner'))).toBe(true);
    // Held, the heart stays in its socket: the Reflected never take it.
    expect(j.at(L('ninth_heart'))).toBe(L('ninth_socket'));
    await j.play(...Bowl.backDown, 'room of the ninth wheel', 'ninth socket');
    expect(Bowl.page(j)).toContain('In the ninth socket of its rim, the stone breathes');
    await j.play('^Take');
    expect(j.holds('carries', 'party', L('ninth_heart'))).toBe(true);
    await j.play('room of the ninth wheel', 'counting gallery', 'Hall of the Equals', '^To the dry vestibule', '^To the intake culvert',
      '^To the Ninth Lock',
      '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^To the head of the Stair', '^To the north road',
      'Go up out of the Bowl');
    expect(j.holds('reached', L('ninth_jewel'))).toBe(true);
  }, 300000);
  it('follows the light up the stair in the water, ringing the bell, and is the same game saved and opened on the stair', async () => {
    const j = await Bowl.start('climb');
    await j.play(...Bowl.arrive, ...Bowl.bell, '^To the new mud', '^To the Ward landing');
    await Bowl.untilComplete(j);
    await Bowl.untilNight(j);
    await j.play('^To the new mud', ...Bowl.underMere.slice(1), 'Ward in the water', 'foot of the stair');
    expect(Bowl.page(j)).toContain('a light is climbing');
    const back = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint()))));
    for (const k of [j, back]) { await k.play('Climb the stair after the light', '^Take'); }
    for (const k of [j, back]) { expect(k.holds('carries', 'party', L('ninth_heart'))).toBe(true); }
    expect(back.watch()).toBe(j.watch());
    expect(back.taken.map(t => t.page)).toEqual(j.taken.slice(-back.taken.length).map(t => t.page));
    expect(back.measure(L('approach'), L('bowl'))).toBe(j.measure(L('approach'), L('bowl')));
  }, 300000);
  it('sings the Seventh at the one with cupped hands until it lets the heart go', async () => {
    const j = await Bowl.start('sing');
    await j.play(...Bowl.arrive, '^To Measures Square', ...Bowl.sounding, ...Bowl.bell.slice(1), '^To the new mud', '^To the Ward landing');
    await Bowl.untilComplete(j);
    await Bowl.untilReflected(j);
    await Bowl.tryUntil(j, 'Sing the Seventh at the one with cupped hands', () => j.holds(L('heartRecovered'), 'party'));
    expect(j.holds(L('heartRecovered'), 'party')).toBe(true);
    expect(Bowl.pages(j)).toContain('listens to you attentively');
    expect(Bowl.page(j)).toContain('the stone slips through them');
  }, 300000);
  it('meets its doubles on the landing: sings them apart, or fights them as the company fights', async () => {
    const sung = await Bowl.start('d2');
    await sung.play(...Bowl.arrive, '^To Measures Square', ...Bowl.sounding, ...Bowl.bell.slice(1), '^To the new mud');
    await Bowl.untilNight(sung);
    await sung.play(...Bowl.underMere.slice(1), 'Ward in the water', '=+12', ...Bowl.fromSeat.slice(6));
    await Bowl.tryUntil(sung, 'Sing the Seventh at your doubles', () => sung.holds(L('doublesLaid'), 'party'));
    expect(sung.holds(L('doublesLaid'), 'party')).toBe(true);
    // d4: a company that wins it (in d3 it was won by a warrior in plate, which no warrior now starts in).
    const fought = await Bowl.start('d4');
    await fought.play(...Bowl.arrive, ...Bowl.bell, '^To the new mud');
    await Bowl.untilNight(fought);
    await fought.play(...Bowl.underMere.slice(1), 'Ward in the water', '=+12', ...Bowl.fromSeat.slice(6), 'Wait › A while');
    for (let i = 0; i < 12 && fought.find('^Attack'); i++) { await fought.play('^Attack'); }
    expect(Bowl.pages(fought)).toContain('The double that is late');
    expect(fought.holds('dead', L('doubles'))).toBe(true);
  }, 300000);
  it('pays the Assayers for Annet Kettle\'s jar with a weight-stone from the dig', async () => {
    const j = await Bowl.start('halm');
    await j.play(...Bowl.arrive, '^To Measures Square', '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar',
      'what she wants from you', 'Take your leave', '^To the hall of the Office', '^Out to Measures Square', "^To the Dyers' Walk",
      '^To the lock stair', '^To the Ward landing', '^To the new mud', '^To the dig', 'Talk to Dov', 'Quill.s agent', 'Take your leave',
      ...Bowl.freeze, '=430', '^Take', ...Bowl.bell.slice(6), '^To the new mud');
    await Bowl.untilNight(j);
    await j.play(...Bowl.underMere.slice(1), 'Ward in the water', 'foot of the stair', 'top of the stair', 'glass gate',
      'hall of receipts', 'jars of counted water: Examine', "Take down Annet Kettle's jar", 'Put in › A weight-stone');
    expect(Bowl.pages(j, j.taken.length - 1)).toContain('the way clerks go back to their desks');
    expect(j.at(L('assayers'))).toBe(L('glass_gate'));
    expect(j.holds('tolerates', L('assayers'), 'party')).toBe(true);
  }, 300000);
});
