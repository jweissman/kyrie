import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';

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
  static readonly toMoot = ['^Out to Measures Square', '^Into the Office of Measures', 'Moot Hall'];
  static readonly finding = ['Rise and give your Finding', 'Say first that the Guild', "the Channel's draw", 'Corran engineers',
    "Isaura Vant's tally", 'register of the Mere gauge', "keeper's book", 'what the Seventh Remainder did',
    'what lies under the Mere', 'how the Remainders speak', 'what the Reckoner counts|what the machine counts',
    'Name the cause: the machine|Name the cause: the Reckoner', 'enter the machine|enter the Reckoner', 'Rest your Finding'];
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
    console.log('watch', j.watch());
    for (const f of ['discrepancy', 'channel_measured', 'engineers_report', 'fall_dated', 'feeder_known', 'short_hymn', 'remainders_tones', 'letters_read', 'lockbook_read', 'hymn_cause', 'deep_drinks', 'missing_found']) {
      console.log(f, Bowl.knows(j, f));
    }
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
    console.log('copy', j.holds('carries', 'party', L('report_copy')), j.holds('at', L('report_copy'), L('fulling_mills')), j.holds('inside', L('report_copy'), L('strongbox')));
    await j.play(...Bowl.office2, '=820', 'Ask Isaura if she will sign', ...Bowl.toMoot, '=889', ...Bowl.finding.slice(0, 3));
    console.log('atHearing', j.holds('carries', 'party', L('report_copy')), j.holds(L('giving'), 'party'), j.choices().filter(c => /Lay|Say|Name/.test(c.label)).map(c => c.label).join(' | '));
    await j.play(...Bowl.finding.slice(3));
    console.log(j.watch(), Bowl.mere(j), j.measure(L('credence'), L('council')));
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
    console.log('alone', j.watch(), Bowl.mere(j), j.measure(L('count'), L('reckoner')), j.measure(L('completedAt'), L('bowl')));
    await j.play('?^To the head of the Stair', '^To the north road', 'Go up out of the Bowl');
    expect(j.holds('reached', L('low_whole'))).toBe(true);
  }, 300000);
});
