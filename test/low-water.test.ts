import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { Bowl, L } from './support/low-water';
import { PlaySession } from '../src/session/play-session';

// Low Water, played by the labels a player sees (doc/adventures/low-water). Ammerlin's Mere is falling; the company is
// the Office's Independent Assessor. Each journey is one way the six days to the Hearing can go, from the Rim.
describe('Low Water', () => {
  it('opens on the Rim, with Isaura at the head of the Stair, and learns the Dyers\' Basin by the third bell', async () => {
    const j = await Bowl.start();
    await j.play(...Bowl.arrive);
    expect(j.holds('travelsWith', L('isaura'), 'party')).toBe(true);
    await j.play(...Bowl.toDyers);
    expect(j.measure(L('level'), L('dyers'))).toBe(3);
    await j.play(...Bowl.basin);
    expect(Bowl.knows(j, 'arch_mouths')).toBe(true);
    expect(j.holds(L('vatsDrowned'), L('vat_yard'))).toBe(false);
    expect(Bowl.said(j)).toContain('third bell');
  }, 120000);
  it('finds the forty ells, the Short Hymn and the keeper\'s book, and puts them together', async () => {
    const j = await Bowl.start();
    await j.play(...Bowl.act1);
    for (const f of ['discrepancy', 'channel_measured', 'engineers_report', 'fall_dated', 'feeder_known', 'short_hymn',
      'remainders_tones', 'letters_read', 'lockbook_read', 'deep_drinks']) { expect(Bowl.knows(j, f)).toBe(true); }
    expect(Bowl.knows(j, 'hymn_cause')).toBe(true);
    expect(Bowl.knows(j, 'missing_found')).toBe(true);
  }, 120000);
  it('has the Seventh sung once, and sees the Deep Gate lie down at it', async () => {
    const j = await Bowl.start();
    await j.play(...Bowl.act1, ...Bowl.trial);
    expect(Bowl.knows(j, 'gate_falls_seen')).toBe(true);
    expect(Bowl.state(j, 'deep_gate', 'lowered')).toBe(true);
    await j.play(...Bowl.descent);
    for (const f of ['engine_seen', 'question_heard', 'count_heard', 'governor_known', 'door_words', 'equals_rule']) { expect(Bowl.knows(j, f)).toBe(true); }
  }, 120000);
  it('comes to the Measured Accord: the machine entered in the ledger as a holder of a right', async () => {
    const j = await Bowl.start();
    await j.play(...Bowl.act1, ...Bowl.trial, ...Bowl.descent, ...Bowl.night, ...Bowl.morning);
    for (const f of ['grammar_known', 'census_read', 'keystone_read']) { expect(Bowl.knows(j, f)).toBe(true); }
    expect(j.holds(L('restoredForGood'), L('bowl'))).toBe(true);
    expect(j.holds(L('halmStopped'), L('halm'))).toBe(true);
    await j.play(...Bowl.office2, '=820', 'Ask Isaura if she will sign', ...Bowl.toMoot, '=889', ...Bowl.finding.slice(0, 3));
    await j.play(...Bowl.finding.slice(3));
    expect(j.holds(L('verdictAccord'), L('ammerlin'))).toBe(true);
  }, 240000);
  it('goes on without the Assessor: the Tench on the mud, the dig taken, the Registrar\'s finding, and the count closed alone', async () => {
    const j = await Bowl.start('alone');
    await j.play(...Bowl.arrive, '=300');
    expect(Bowl.state(j, 'tench', 'stranded')).toBe(true);
    expect(j.holds(L('digBought'), L('dig'))).toBe(true);
    await j.play('=340');
    // The bailiffs came to the dig at three, and Dov is in the Office cells.
    expect(j.holds(L('dovHeld'), L('dov'))).toBe(true);
    expect(j.at(L('dov'))).toBe(L('office_cells'));
    await j.play('=900');
    expect(j.holds(L('registrarsFinding'), L('ammerlin'))).toBe(true);
    expect(Bowl.state(j, 'channel_gate', 'to_mere')).toBe(true);
    expect(j.holds(L('wardLeaving'), L('ammerlin'))).toBe(true);
    const before = Bowl.mere(j);
    await j.play('=1110');
    expect(j.holds(L('complete'), L('reckoner'))).toBe(true);
    expect(Bowl.mere(j)).toBeLessThan(before - 5);
    expect(Bowl.said(j)).toContain('Every bell in Ammerlin rings at once');
    await j.play('?^To the head of the Stair', '^To the north road', 'Go up out of the Bowl');
    expect(j.holds('reached', L('low_whole'))).toBe(true);
  }, 300000);
  it('stops the Reckoner for good: the Deep jammed with stop-logs, the governor broken, and the Equals left holding nothing', async () => {
    const j = await Bowl.start('broken');
    await j.play(...Bowl.act1, 'Into the lock-house', 'Talk to Piet', 'help drop the stop-logs', 'Take your leave',
      '^Out to the Ninth Lock', '^Take', '=60', 'Drop the stop-logs into the Deep Gate.s mouth, with Piet');
    expect(Bowl.state(j, 'deep_gate', 'logged')).toBe(true);
    await j.play('Fill a lantern', '^To the intake culvert', '^To the dry vestibule', '^Take', '^Take', 'Hall of the Equals',
      'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone',
      '^To the counting gallery', '^To the governor', "Break the governor's spindle", '^To the counting gallery');
    expect(j.holds(L('broken'), L('reckoner'))).toBe(true);
    await j.play('=+3');
    expect(j.holds(L('stilled'), L('equals'))).toBe(true);
    const mere = Bowl.mere(j);
    await j.play('=+144');
    // Stopped, it drinks nothing: the Mere falls only by the Guild's Channel now.
    expect(Bowl.mere(j)).toBeGreaterThanOrEqual(mere - 1);
    expect(Bowl.said(j)).not.toContain('fountain in Ammerlin begins to hum');
  }, 300000);
  it('hears the census: Quill\'s Channel down the Grey Way, the count closed with the Mere spared, and the still water beyond', async () => {
    const j = await Bowl.start('fed');
    await j.play(...Bowl.act1, ...Bowl.trial, ...Bowl.descent, '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square',
      '^To the head of the Stair', '^To the Rim Gauge', '^To the fulling mills', 'Into the Guild counting', "Quill.s counting-room",
      'Talk to Harrow', 'working machine under the Mere', 'what the city would owe him', "Agree to Quill's terms", 'Take your leave',
      '^To the counting-house floor', '^Out to the fulling mills', '^To the Rim Gauge', 'Break out the old third mouth');
    expect(j.holds(L('fed'), L('reckoner'))).toBe(true);
    const mere = Bowl.mere(j);
    await j.play('=+300');
    expect(j.holds(L('complete'), L('reckoner'))).toBe(true);
    expect(j.holds(L('completedFed'), L('reckoner'))).toBe(true);
    expect(Bowl.mere(j)).toBeGreaterThanOrEqual(mere - 1);
    await j.play('^To the head of the Stair', '^To Measures Square', '^Into the Full Measure', 'Buy › A torch', 'Buy › A torch',
      '^Out to Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ninth Lock', 'a torch: Light',
      '^To the intake culvert', '^To the dry vestibule', 'Hall of the Equals', '^To the counting gallery',
      'Into the depths of the Undercroft', 'Through to the still water|the still water', 'Bowl in the water', '^Take');
    expect(Bowl.knows(j, 'water_kept')).toBe(true);
    await j.play('^To the still water', 'Through to the last door', 'counting gallery', 'Hall of the Equals', '^To the dry vestibule',
      '^To the intake culvert', '^To the Ninth Lock', '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square',
      '^Into the Sounding', "Cantor's room", 'Give a cup of the still water');
    expect(Bowl.said(j, j.taken.length - 1)).toContain("It's in tune");
    await j.play("^To the Sounding's nave", '^Out to Measures Square', '^To the head of the Stair', '^To the north road', 'Go up out of the Bowl');
    expect(j.holds('reached', L('census_fed'))).toBe(true);
  }, 300000);
  it('lets Halm end the song: the diggers drown at the breach, and the scholar sounds the high voice in the night', async () => {
    const j = await Bowl.start('halm');
    await j.play(...Bowl.arrive, '^To Measures Square', '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar',
      'what she wants from you', 'Take your leave', '^To the hall of the Office', '^Out to Measures Square', "^To the Dyers' Walk",
      '^To the lock stair', '^To the Ward landing', '^To the new mud', '^To the dig', 'Talk to Dov', 'Quill.s agent', 'Take your leave',
      '^To the new mud', '^To the Ward landing', '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square',
      '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar', "freeze the Ward's titles", 'Take your leave',
      '=430');
    expect(j.holds(L('drowned'), L('diggers'))).toBe(true);
    expect(j.holds(L('clashed'), L('dig'))).toBe(false);
    await j.play('=700');
    expect(j.holds(L('endedBy'), L('reckoner'), L('halm'))).toBe(true);
    expect(j.holds(L('complete'), L('reckoner'))).toBe(true);
    expect(Bowl.said(j)).toContain('laughing and weeping at once');
    await j.play('Ask Isaura what she makes of the Short Hymn now|Wait › A while', 'Say something to Isaura about the diggers');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('Three people. Against being shouted at.');
    await j.play('^To the hall of the Office', '^Out to Measures Square', '^To the head of the Stair', '^To the north road', 'Go up out of the Bowl');
    expect(j.holds('reached', L('census_ended'))).toBe(true);
  }, 300000);
  it('warns Dov off with his sister\'s figures, and the diggers dam the throat and come through alive', async () => {
    const j = await Bowl.start('dam');
    await j.play(...Bowl.arrive, '^To Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ward landing', '^To the new mud',
      '^To the dig', 'Talk to Dov', 'Quill.s agent', 'Take your leave', ...Bowl.freeze, '=242', '^Into the Listening Hall', 'throat of the Listening Hall',
      'Gauge the bottom of the throat', 'Listening Hall', '^Out to the dig', '?^To the new mud', '?^To the Ward landing', '?^To Tench Row',
      "?^To Dov Vant's yard", 'Talk to Dov',
      'bottom of the throat is under the Mere', 'Take your leave', 'Tell Isaura that Dov listened', '=440');
    expect(j.holds(L('cofferdam'), L('dig'))).toBe(true);
    expect(j.holds(L('breached'), L('dig'))).toBe(true);
    expect(j.holds(L('drowned'), L('diggers'))).toBe(false);
    expect(Bowl.said(j)).toContain('The dam held');
  }, 300000);
  it('stands the bailiffs off at the dig with the Office\'s warrant, and Dov is not taken', async () => {
    const j = await Bowl.start('warrant');
    await j.play(...Bowl.act1, 'Ask Isaura what she thinks of Piet', '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square',
      '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar', 'warrant over the Ninth Lock',
      'Take your leave', '^To the hall of the Office', '^Out to Measures Square', "^To the Dyers' Walk", '^To the lock stair',
      '^To the Ward landing', '^To the new mud', '^To the dig', '=331', "Show the bailiffs the Office's warrant");
    expect(j.holds(L('sentAway'), L('bailiffs'))).toBe(true);
    await j.play('=+6');
    expect(j.holds(L('dovHeld'), L('dov'))).toBe(false);
    expect(Bowl.said(j)).toContain('as if he had never seen her before');
  }, 300000);
  it('drains the Dyers\' Basin the quick way, by the Sump\'s overflow, and Mag Torrin loses her season', async () => {
    const j = await Bowl.start('vats');
    await j.play(...Bowl.arrive, ...Bowl.toDyers, "Unchain the Sump's overflow", '=+3', 'Wind the sump gate up', '=+3');
    expect(j.holds(L('vatsDrowned'), L('vat_yard'))).toBe(true);
    expect(j.measure(L('level'), L('dyers'))).toBeLessThanOrEqual(1);
    await j.play('vat-yard', 'Talk to Mag', 'Say something to Mag Torrin');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('in a good clear voice');
    expect(j.holds(L('grievance'), L('mag'), 'party')).toBe(true);
    await j.play('Ask Isaura about Mag Torrin');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('if you\'d asked her');
  }, 120000);
  it('withdraws from the Equals when they turn, and comes back with weight to answer them', async () => {
    const j = await Bowl.start('equals');
    await j.play(...Bowl.act1, ...Bowl.trial, 'Fill a lantern', '^To the intake culvert', '^To the dry vestibule', 'Hall of the Equals');
    expect(Bowl.said(j, j.taken.length - 1)).toContain('presses the air');
    await j.play('^To the dry vestibule', '=+3');
    expect(j.holds('tolerates', L('equals'), 'party')).toBe(true);
    await j.play('^Take', '^Take', 'Hall of the Equals', 'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone',
      'Put in › A weight-stone', '=+3', '^To the counting gallery');
    expect(j.at('party')).toBe(L('count_gallery'));
  }, 300000);
  it('is the same game saved and opened again, from the Seventh\'s first night into the Undercroft', async () => {
    const j = await Bowl.start('kept');
    await j.play(...Bowl.act1, ...Bowl.trial);
    const back = Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(j.session.checkpoint()))));
    await j.play(...Bowl.descent);
    await back.play(...Bowl.descent);
    expect(back.watch()).toBe(j.watch());
    for (const f of ['engine_seen', 'question_heard', 'count_heard']) { expect(Bowl.knows(back, f)).toBe(Bowl.knows(j, f)); }
    expect(back.taken.map(t => t.told)).toEqual(j.taken.slice(-back.taken.length).map(t => t.told));
    expect(Bowl.mere(back)).toBe(Bowl.mere(j));
  }, 300000);
  it('names the Guild at the Hearing, and the Council closes the Channel and the mills go dark', async () => {
    const j = await Bowl.start('guild');
    await j.play(...Bowl.act1, '=820', 'Ask Isaura if she will sign', ...Bowl.toMootFromLock, '=889', 'Rise and give your Finding',
      "the Channel's draw", "Isaura Vant's tally", "Name the cause: the Guild", 'close the Fulling Channel', 'Rest your Finding');
    expect(j.holds(L('dissented'), L('isaura'))).toBe(true);
    expect(j.holds(L('verdictGuild'), L('ammerlin'))).toBe(true);
    expect(j.holds(L('charterLost'), L('ammerlin'))).toBe(true);
    expect(Bowl.state(j, 'channel_gate', 'to_mere')).toBe(true);
    await j.play('^To the hall of the Office', '^Out to Measures Square', '^To the head of the Stair', '^To the north road', 'Go up out of the Bowl');
    expect(j.holds('reached', L('guild'))).toBe(true);
  }, 300000);
  it('keeps the count: the Fourth Remainder sung again, and the last door held shut when the census closes', async () => {
    const j = await Bowl.start('kept-count');
    await j.play(...Bowl.act1, ...Bowl.trial, ...Bowl.descent, ...Bowl.night, ...Bowl.morning, '^To the new mud', '^To the Ward landing',
      '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^Into the Sounding', "Cantor's room", 'Talk to Cantor',
      'the Fifth Remainder was', 'what the Fourth Remainder said', 'sing the Fourth every night', 'Take your leave', "^To the Sounding's nave",
      '^Out to Measures Square', '^To the head of the Stair', '^To the Rim Gauge', '^To the fulling mills', 'Into the Guild counting',
      "Quill.s counting-room", 'Talk to Harrow', 'working machine under the Mere', 'what the city would owe him', "Agree to Quill's terms",
      'Take your leave', '^To the counting-house floor', '^Out to the fulling mills', '^To the Rim Gauge', 'Break out the old third mouth',
      '=+300');
    expect(j.holds(L('complete'), L('reckoner'))).toBe(true);
    expect(j.holds(L('doorHeld'), L('reckoner'))).toBe(true);
    expect(Bowl.said(j)).toContain('The Fourth holds it.');
    expect(Bowl.said(j)).toContain('the fountains take it up and hum');
    await j.play('^To the head of the Stair', '^To the north road', 'Go up out of the Bowl');
    expect(j.holds('reached', L('census_kept'))).toBe(true);
  }, 300000);
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
});
