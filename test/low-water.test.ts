import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

// Low Water, played by the labels a player sees (doc/adventures/low-water). Ammerlin's Mere is falling; the company is
// the Office's Independent Assessor. Each journey is one way the six days to the Hearing can go, from the Rim.
const campaign = 'data/campaigns/low-water.campaign.json';
const L = (id: string) => `lowwater__${id}`;
class Bowl {
  static start(seed = 'ammerlin') { return Journey.start(campaign, seed); }
  static knows(j: Journey, fact: string) { return j.holds('knows', 'party', L(fact)); }
  static state(j: Journey, thing: string, state: string) { return j.holds('state', L(thing), L(state)); }
  static mere(j: Journey) { return j.measure(L('mere'), L('bowl')); }
  static said(j: Journey, from = 0) { return j.taken.slice(from).map(t => t.told).join(' '); }
  // The first hour: Isaura at the head of the Stair, and the company down to the Dyers' Terrace before the third bell.
  static readonly arrive = ['^To the head of the Stair', 'Talk to Isaura', 'waiting for you', 'Ask Isaura Vant to join'];
  static readonly toDyers = ['^To Measures Square', "^To the Dyers' Walk", "^To the edge of the Dyers' Basin"];
  // The Dyers' Basin by the third bell: open the sump before nine, and Mag Torrin's draw takes the last mark.
  static readonly basin = ['Wind the sump gate up', '=5', 'Wind the sump gate down', '=7', "floor of the Dyers' Basin",
    'Examine — Look closely', 'Take a rubbing', '^Take', '^Take', '^Take', '^Take', "edge of the Dyers' Basin"];
  static readonly rim = ["^To the Dyers' Walk", '^To Measures Square', '^To the head of the Stair', '^To the Rim Gauge',
    'Gauge the Fulling', 'Ask Isaura what is troubling', '^To the fulling mills', 'Talk to Sella', 'about the mills',
    'when the hands were last paid', 'whether the Channel is draining', 'if she could get', 'Promise Sella',
    'Take your leave', 'Into the Guild counting', "Quill.s counting-room", 'Talk to Harrow', 'his side',
    'why the Mere is falling', 'red ink', 'what he thinks water is for', 'whether the most good', 'know what his engineers',
    'Take your leave', '^To the counting-house floor', '^Out to the fulling mills'];
  static readonly office = ['^To the Rim Gauge', '^To the head of the Stair', '^To Measures Square',
    '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar', 'what she wants from you', 'Take your leave',
    '^To the hall of the Office', 'ledger room', '^Read', 'Examine — Look closely', '^To the hall of the Office',
    '^Out to Measures Square'];
  static readonly sounding = ['^Into the Sounding', "Cantor's room", 'Talk to Cantor', 'Short Hymn',
    'what the Remainders were', 'how the hymn is written', '^Read', 'Take your leave', "^To the Sounding's nave",
    '^Out to Measures Square'];
  static readonly lock = ["^To the Dyers' Walk", '^To the lock stair', '^To the Ninth Lock', 'Into the lock-house',
    'Talk to Piet', 'whether the Deep Gate comes down', 'what the Sounding said', '^Read', 'Examine — Look closely',
    'Take your leave', '^Out to the Ninth Lock'];
  static get act1() {
    return [...this.arrive, ...this.toDyers, ...this.basin, ...this.rim, '=+6', '^Take', ...this.office, ...this.sounding,
      ...this.lock];
  }
  // The Cantor told, the Seventh sung once as a trial, and the Deep Gate watched from the Ninth Lock at eight.
  // Into the Undercroft by the culvert while the Deep Gate lies down, the Equals answered with weight-stones, and the
  // engine asked its question and its count in its own voice.
  static readonly descent = ['Fill a lantern', '^To the intake culvert', '^To the dry vestibule', '^Take', '^Take',
    'Hall of the Equals', 'Put in › A weight-stone', 'Put in › A weight-stone', 'Put in › A weight-stone',
    'Put in › A weight-stone', '^To the counting gallery', '^To the listening column', 'Strike the shortest',
    'Strike the longest', 'Strike the second bar', 'Strike the second bar', '^To the counting gallery',
    '^To the governor', '^To the counting gallery', 'Into the depths of the Undercroft', '^Wait › A while',
    'counting gallery', 'Hall of the Equals', '^To the dry vestibule', '^To the intake culvert', '^To the Ninth Lock'];
  // A bed at the Full Measure; in the morning the Cantor told what was seen, Halm at the dig, and the keystone read.
  static readonly night = ['^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^Into the Full Measure',
    'Take a bed and supper', 'Ask Halm to read the letters', 'Ask Halm to read the words', 'Out to Measures Square'];
  static readonly morning = ['^Into the Sounding', "Cantor's room", 'Talk to Cantor', 'Deep Gate came down',
    'what is under the Mere', 'still a building', 'speak at the Hearing', 'Take your leave', "^To the Sounding's nave",
    '^Out to Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ward landing', '^To the new mud',
    '^To the dig', 'Talk to Dov', 'Quill.s agent', 'Take your leave', '^Into the Listening Hall', '^Out to the dig',
    'Talk to Teodor', 'read the letters under the keystone', 'what he means to do', 'city has a right', 'Take your leave'];
  // The Registrar asked to freeze the Ward's titles; the keeper asked to speak.
  static readonly office2 = ['^To the new mud', '^To the Ward landing', '^To the lock stair', '^To the Ninth Lock',
    'Into the lock-house', 'Talk to Piet', 'speak at the Hearing', 'Take your leave', '^Out to the Ninth Lock',
    '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^Into the Office of Measures', "Registrar's room",
    'Talk to Registrar', "freeze the Ward's titles", 'Take your leave', '^To the hall of the Office', '^Out to Measures Square',
    '^Into the Full Measure', 'Take a bed and supper', 'Buy › A ration', 'Buy › A ration', 'Buy › A ration'];
  static readonly toMootFromLock = ['^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^Into the Office of Measures',
    'Moot Hall'];
  static readonly toMoot = ['^Out to Measures Square', '^Into the Office of Measures', 'Moot Hall'];
  static readonly finding = ['Rise and give your Finding', 'Say first that the Guild', "the Channel's draw", 'Corran engineers',
    "Isaura Vant's tally", 'register of the Mere gauge', "keeper's book", 'what the Seventh Remainder did',
    'what lies under the Mere', 'how the Remainders speak', 'what the Reckoner counts|what the machine counts',
    'Name the cause: the machine|Name the cause: the Reckoner', 'enter the machine|enter the Reckoner', 'Rest your Finding'];
  // From the dig to the Registrar and back, to have the Ward's titles frozen before Basset can buy the dig's ground.
  static readonly freeze = ['^To the new mud', '^To the Ward landing', '^To the lock stair', "^To the Dyers' Walk", '^To Measures Square',
    '^Into the Office of Measures', "Registrar's room", 'Talk to Registrar', "freeze the Ward's titles", 'Take your leave',
    '^To the hall of the Office', '^Out to Measures Square', "^To the Dyers' Walk", '^To the lock stair', '^To the Ward landing',
    '^To the new mud', '^To the dig'];
  static readonly trial = ['^To the lock stair', "^To the Dyers' Walk", '^To Measures Square', '^Into the Sounding',
    "Cantor's room", 'Talk to Cantor', 'what the Seventh Remainder did', 'sing the Seventh Remainder tonight',
    'Take your leave', "^To the Sounding's nave", '^Out to Measures Square', "^To the Dyers' Walk", '^To the lock stair',
    '^To the Ninth Lock', '=73'];
}

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
    await j.play(...Bowl.act1, '=820', ...Bowl.toMootFromLock, '=889', 'Rise and give your Finding', "the Channel's draw",
      "Name the cause: the Guild", 'close the Fulling Channel', 'Rest your Finding');
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
});
