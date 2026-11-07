import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

// The Repertory (doc/adventures/anthology/the-repertory.md): four engagements on the Wend Circuit, each played by the
// labels a page offers, on the real campaign. The only staged premise is that the Wick's note is paid (Act IV is over),
// which opens the King's command; everything after is walked: the River Gate, the Wend Cross, the inn, Hepzibah's
// letters, the road, the episode. (The Command itself cannot follow an Act V Ending: an Ending closes the book, so the
// tour opens before the Command and holds it while the company is away; see friction-repertory.md.)
const campaign = 'data/campaigns/gosses-company.campaign.json';
const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
class R {
  constructor(public j: Journey) {}
  static async start(seed: string) { return new R(await Journey.start(campaign, seed)); }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  assert(name: string, ...args: string[]) { this.j.assert(p(name), ...args.map(p)); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  knows(f: string) { return this.j.holds('knows', 'party', p(f)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  at(who: string) { return this.j.at(p(who)); }
  // Act IV over; the party at the River Gate; the road, the inn, Hepzibah's letters, and back out to the Cross.
  async tour() {
    this.assert('heistOver', 'rierdan').j.put('party', p('river_gate'));
    await this.play('Wait › An hour', 'To the Wend Cross', 'Into the Drum and Whistle', 'Ask Hepzibah what is in the heap of letters', 'Out to the Wend Cross');
    return this;
  }
  async waits(n: number) { for (let i = 0; i < n; i++) { await this.play('Wait › An hour'); } return this; }
}

describe('The Repertory: the Wend Circuit', () => {
  it('opens only when the Wick is theirs, takes the troupe to the Drum and Whistle, holds the Command, and sends them home', async () => {
    const r = await R.start('rep0');
    r.assert('heistOver', 'rierdan').j.put('party', p('river_gate'));
    expect(r.j.offers('To the Wend Cross')).toBe(false);
    await r.play('Wait › An hour');
    expect(r.holds('commandOn', 'rierdan')).toBe(true);
    expect(r.j.offers('To the Wend Cross')).toBe(true);
    const day = r.measure('commandDay', 'rierdan');
    await r.play('To the Wend Cross', 'Into the Drum and Whistle');
    expect(r.at('gosse')).toBe(p('wend_taproom'));
    expect(r.at('kit')).toBe(p('wend_taproom'));
    expect(r.j.offers('Ask Hepzibah what is in the heap of letters')).toBe(true);
    // The letters open four roads from the Cross, and nothing else does.
    await r.play('Ask Hepzibah what is in the heap of letters', 'Out to the Wend Cross');
    for (const way of ['To Marlcross market square', 'To the Three Cairns', 'To the gate of Harrowmere', 'To the wedding lawn']) { expect(r.j.offers(way)).toBe(true); }
    // The Command is held while they are away, however long: two days on, it has still not begun.
    await r.waits(60);
    expect(r.holds('holdingCommand', 'rierdan')).toBe(false);
    expect(r.measure('commandDay', 'rierdan')).toBeGreaterThan(day);
    // Home: the troupe goes back to where it was, and the Command comes round again, a day off.
    await r.play('To the River Gate');
    await r.waits(1);
    expect(r.at('gosse')).not.toBe(p('wend_taproom'));
    expect(r.holds('tourAway', 'rierdan')).toBe(false);
  }, 280000);
});

describe('The Repertory, 1: The Two Pairs', () => {
  it('can be ended early by one meeting, and the sides taken are remembered in Kit', async () => {
    const r = await R.start('rep1a');
    await r.tour();
    await r.play('To Marlcross market square', 'To the Mermaid');
    r.j.roll('pass');
    await r.play('Ask the Evesholm Corbet to wait', 'To Marlcross market square', "To Gleed's goldsmithy", 'Ask the Marlcross Corbet to wait');
    expect(r.holds('e1Early', 'rierdan')).toBe(true);
    expect(r.holds('e1Done', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan')).toBe(1);
    expect(r.measure('renown', 'rierdan')).toBe(1);
    // Back to the Drum and Whistle: Kit's question has an answer, and the answer is read.
    r.j.roll(undefined);
    await r.play('To Marlcross market square', 'To the Wend Cross', 'Into the Drum and Whistle', 'Ask Kit what he made of Marlcross', 'Say nothing; put a hand on his shoulder');
    expect(r.holds('kitLeaned', 'party')).toBe(true);
  }, 280000);

  it('ends at the Priory gate when the day is left to run, with Dr Tuckett held; and survives a save and reload on the way', async () => {
    const r = await R.start('rep1b');
    await r.tour();
    await r.play('To Marlcross market square');
    r.j.roll('pass');
    await r.play('Tell Dr Tuckett that a man locked out', 'To the Priory gate');
    r.j.roll(undefined);
    await r.waits(5);
    // Save and reload in the middle of the day.
    const back = new R(Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(r.j.session.checkpoint())))));
    expect(back.holds('e1On', 'rierdan')).toBe(true);
    expect(back.holds('e1Done', 'rierdan')).toBe(false);
    await back.waits(4);
    expect(back.holds('e1Priory', 'rierdan')).toBe(true);
    expect(back.holds('e1Done', 'rierdan')).toBe(true);
  }, 280000);

  it('ends in the chaos of the Priory gate when nobody stops the exorcist', async () => {
    const r = await R.start('rep1c');
    await r.tour();
    await r.play('To Marlcross market square', 'To the Priory gate');
    await r.waits(10);
    expect(r.holds('e1Chaos', 'rierdan')).toBe(true);
    expect(r.holds('e1Priory', 'rierdan')).toBe(false);
  }, 280000);
});

describe('The Repertory, 2: The Three', () => {
  const toKeep = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the Three Cairns', "To Cairnholt's yard", 'Ask the steward what the Lord wants', 'To the Three Cairns');
    r.j.roll('pass');
    await r.play("Watch the three women's hands", 'Ask them something the steward', 'Look for how they came to the cairns', "To Cairnholt's yard", "To Cairnholt's hall");
    return r;
  };
  it('is ended by the purse on the table, and the Lady is played as the answer given', async () => {
    const r = await toKeep('rep2a');
    expect(r.knows('three_paid_known')).toBe(true);
    await r.play('Report to Lord Valtry', 'They are frauds, my lord', "Put the Lady's purse on the table");
    expect(r.holds('e2Revealed', 'rierdan')).toBe(true);
    expect(r.holds('e2Done', 'rierdan')).toBe(true);
    r.j.roll(undefined);
    await r.play("To Cairnholt's yard", 'To the Three Cairns', 'To the Wend Cross', 'Into the Drum and Whistle', 'Ask Dorcas how she would play the Lady', 'She is afraid of what he will be without it');
    expect(r.holds('dorcasAfraid', 'party')).toBe(true);
    expect(r.measure('repertoire', 'rierdan')).toBe(1);
  }, 280000);
  it('ends in a murder done by the company\'s own help, when the guards are posted where the Lady suggests', async () => {
    const r = await toKeep('rep2b');
    await r.play('Report to Lord Valtry', 'They are genuine, my lord', "To Cairnholt's yard");
    await r.waits(11);
    expect(r.holds('e2StroudComes', 'rierdan')).toBe(true);
    await r.play('Post the guards at the gate');
    expect(r.measure('c2', 'rierdan')).toBeGreaterThanOrEqual(2);
    await r.waits(6);
    expect(r.holds('e2Murder', 'rierdan')).toBe(true);
    expect(r.holds('e2Done', 'rierdan')).toBe(true);
  }, 280000);
  it('is survived when the Warden\'s door is watched, and the Lord is read about on a broadside', async () => {
    const r = await toKeep('rep2c');
    await r.play('Report to Lord Valtry', 'They are genuine, my lord', "To Cairnholt's yard");
    await r.waits(11);
    r.j.roll('pass');
    await r.play("Post two soldiers at the Warden's door");
    await r.waits(6);
    expect(r.holds('e2Left', 'rierdan')).toBe(true);
    expect(r.holds('e2Murder', 'rierdan')).toBe(false);
  }, 280000);
});

describe('The Repertory, 3: The Prince and the Letter', () => {
  const toLetter = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    await r.play("To the Prince's study", 'Ask the Prince why he talks to the rampart', 'Make him show it', 'To the great hall of Harrowmere', 'To the south rampart');
    await r.waits(2);
    await r.play('Stand beside the Prince', 'To the great hall of Harrowmere', 'To the gate of Harrowmere', 'To the tiltyard');
    await r.waits(3);
    r.j.roll('pass');
    await r.play('Step between the Prince and the captain', 'To the gate of Harrowmere', 'To the great hall of Harrowmere');
    await r.waits(2);
    await r.play('To the chapel', 'Take the Prince by the sleeve', 'To the great hall of Harrowmere');
    await r.waits(3);
    expect(r.holds('e3Letter', 'rierdan')).toBe(true);
    return r;
  };
  it('escapes through Orlay on a letter Swale has rewritten, and leaves the two courtiers to their fate', async () => {
    const r = await toLetter('rep3a');
    expect(r.holds('e3Ghost', 'party')).toBe(true);
    await r.play('Warm the seal over a candle', 'Ask Swale to write a new letter');
    expect(r.holds('e3Forged', 'rierdan')).toBe(true);
    await r.play('To the gate of Harrowmere', 'To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay', 'Hand the Margravine of Orlay the letter');
    expect(r.holds('e3Escape', 'rierdan')).toBe(true);
    expect(r.holds('e3Seized', 'rierdan')).toBe(true);
    expect(r.holds('e3Done', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan')).toBe(1);
  }, 280000);
  it('ends in a farce of laundry lists when the carrier packs the letter into the wrong basket', async () => {
    const r = await toLetter('rep3b');
    await r.play('To the gate of Harrowmere', 'To the Orlay road', 'To the Fox and Feather');
    await r.waits(1);
    expect(r.holds('e3Mixed', 'rierdan')).toBe(true);
    await r.play('To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay', 'Present what the carrier brings');
    expect(r.holds('e3Misdelivered', 'rierdan')).toBe(true);
    expect(r.holds('e3Done', 'rierdan')).toBe(true);
  }, 280000);
  it('ends in a grave when the Prince is left alone three times', async () => {
    const r = await R.start('rep3c');
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    await r.waits(11);
    expect(r.holds('e3Grave', 'rierdan')).toBe(true);
    expect(r.holds('e3Letter', 'rierdan')).toBe(false);
    expect(r.holds('e3Done', 'rierdan')).toBe(true);
  }, 280000);
});

describe('The Repertory, 4: The Wood near Athens-on-Wend', () => {
  const toNight = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the wedding lawn', 'Ask Gosse how the rehearsal is going', 'Run the rehearsal yourself');
    await r.waits(6);
    expect(r.holds('e4Hunt', 'rierdan')).toBe(true);
    return r;
  };
  it('puts the lovers right with the wood\'s own flowers and brings the wedding to the lawn by dawn', async () => {
    const r = await toNight('rep4a');
    r.j.roll('pass');
    await r.play('Ask Tam to play the hautboy');
    expect(r.holds('e4LordTolerates', 'rierdan')).toBe(true);
    await r.play('To the edge of the wood', 'To the lantern bog', "To the pixie's hollow", 'Gather a sprig of ofbit', 'To the lantern bog', 'To the edge of the wood', "Touch the Squire's eyes with ofbit");
    expect(r.holds('loves', 'rafe', 'idony')).toBe(true);
    expect(r.holds('loves', 'jack', 'maud')).toBe(true);
    await r.play('To the wedding lawn');
    await r.waits(8);
    expect(r.holds('e4Restored', 'rierdan')).toBe(true);
    expect(r.holds('e4Done', 'rierdan')).toBe(true);
    expect(r.holds('e4Fiasco', 'rierdan')).toBe(false);
    expect(r.measure('repertoire', 'rierdan')).toBe(1);
  }, 280000);
  it('ends in the glorious fiasco when the lovers are left as the wood made them', async () => {
    const r = await toNight('rep4b');
    await r.waits(8);
    expect(r.holds('e4Dawn', 'rierdan')).toBe(true);
    expect(r.holds('e4Fiasco', 'rierdan')).toBe(true);
    expect(r.holds('e4Done', 'rierdan')).toBe(true);
    expect(r.holds('e4Restored', 'rierdan')).toBe(false);
  }, 280000);
  it('carries what was said on the road into the wood: Kit, Swale and the whole circuit steady the Command', async () => {
    const r = await R.start('rep4c');
    await r.tour();
    // Marlcross first: Kit's heart is asked after.
    await r.play('To Marlcross market square', 'To the Mermaid');
    r.j.roll('pass');
    await r.play('Ask the Evesholm Corbet to wait', 'To Marlcross market square', "To Gleed's goldsmithy", 'Ask the Marlcross Corbet to wait');
    r.j.roll(undefined);
    await r.play('To Marlcross market square', 'To the Wend Cross', 'Into the Drum and Whistle', 'Ask Kit what he made of Marlcross', 'Tell him to say so, in his own voice', 'Out to the Wend Cross');
    expect(r.holds('kitSaysSo', 'party')).toBe(true);
    await r.play('To the wedding lawn', 'Ask Kit how he is, here, among the lovers');
    expect(r.j.offers('Ask Kit how he is, here, among the lovers')).toBe(false);
  }, 280000);
});
