import { Journey } from '../../src/session/journey';

// The steps of Low Water's journeys, as a player takes them, by the labels the page offers (test/low-water.test.ts;
// scripts/low-water-transcripts.ts writes the long ones out as the page told them, for doc/playtests).
export const campaign = 'data/campaigns/low-water.campaign.json';
export const L = (id: string) => `lowwater__${id}`;
export class Bowl {
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
