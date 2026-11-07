import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

// The Repertory (doc/adventures/anthology/the-repertory.md): four engagements on the Wend Circuit, each played by the
// labels a page offers, on the real campaign. The only staged premise is that the Wick's note is paid (Act IV is over),
// which opens the King's command; everything after is walked: the River Gate, the Wend Cross, the inn, Hepzibah's
// letters, the road, the episode. (The Command itself cannot follow an Act V Ending: an Ending closes the book, so the
// tour opens before the Command and holds it while the company is away; see friction-repertory.md.)
// Checks are forced only where a spec says so; each dominant line a reviewer found (the three-move early meeting, the
// letter handed over unread, doing nothing at Cairnholt, paying a name for nothing) has a spec saying where it now ends.
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
  offers(label: string) { return this.j.offers(label); }
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
    expect(r.offers('To the Wend Cross')).toBe(false);
    await r.play('Wait › An hour');
    expect(r.holds('commandOn', 'rierdan')).toBe(true);
    expect(r.offers('To the Wend Cross')).toBe(true);
    const day = r.measure('commandDay', 'rierdan');
    await r.play('To the Wend Cross', 'Into the Drum and Whistle');
    expect(r.at('gosse')).toBe(p('wend_taproom'));
    expect(r.at('kit')).toBe(p('wend_taproom'));
    await r.play('Ask Hepzibah what is in the heap of letters', 'Out to the Wend Cross');
    for (const way of ['To Marlcross market square', 'To the Three Cairns', 'To the gate of Harrowmere', 'To the wedding lawn']) { expect(r.offers(way)).toBe(true); }
    // The Command is held while they are away, however long: two days on, it has still not begun.
    await r.waits(60);
    expect(r.holds('holdingCommand', 'rierdan')).toBe(false);
    expect(r.measure('commandDay', 'rierdan')).toBeGreaterThan(day);
    // Home: the troupe goes back to where it was, and the Command comes round again.
    await r.play('To the River Gate');
    await r.waits(1);
    expect(r.at('gosse')).not.toBe(p('wend_taproom'));
    expect(r.holds('tourAway', 'rierdan')).toBe(false);
    expect(r.measure('commandDay', 'rierdan')).toBeGreaterThan(r.measure('day', 'clock'));
  }, 280000);
});

describe('The Repertory, 1: The Two Pairs', () => {
  // Scout the four (Corbet in the goldsmithy, Jibb and Corbet in the house, Jibb in the square), wait for the chain, chalk both pairs.
  const scout = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To Marlcross market square', "To Gleed's goldsmithy", 'To Marlcross market square', 'To the Ashlar house');
    await r.waits(1);
    await r.play('To Marlcross market square');
    await r.waits(2);
    return r;
  };
  it('is ended early only by a company that has reconstructed the day: both pairs chalked, then both Corbets put at one table', async () => {
    const r = await scout('rep1a');
    expect(r.holds('chainTaken', 'rierdan')).toBe(true);
    r.j.roll('pass');
    await r.play('Lay out the day on the nearest wall in chalk: the two Corbets', 'Chalk up the Jibbs');
    expect(r.knows('two_masters_known')).toBe(true);
    expect(r.knows('two_servants_known')).toBe(true);
    await r.play('Ask the Evesholm Corbet to wait', "To Madam Cinnabar's parlour", 'Ask the Marlcross Corbet to wait');
    expect(r.holds('e1Early', 'rierdan')).toBe(true);
    expect(r.holds('e1Done', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan')).toBe(1);
    // Kit was at the Ashlar house all day: his question has an answer, and the answer is read.
    r.j.roll(undefined);
    await r.play('To Marlcross market square', 'To the Ashlar house', 'Ask Kit what he made of Marlcross', 'Say nothing; put a hand on his shoulder');
    expect(r.holds('kitLeaned', 'party')).toBe(true);
  }, 280000);

  it('does not end at the three-move line: two Corbets put in the Mermaid only silence the town, and the day runs on to the Prioress', async () => {
    const r = await R.start('rep1d');
    await r.tour();
    await r.play('To Marlcross market square', 'To the Mermaid');
    r.j.roll('pass');
    await r.play('Ask the Evesholm Corbet to wait', 'To Marlcross market square', "To Gleed's goldsmithy", 'Ask the Marlcross Corbet to wait');
    expect(r.holds('e1Met', 'rierdan')).toBe(true);
    expect(r.holds('e1Early', 'rierdan')).toBe(false);
    expect(r.holds('e1Done', 'rierdan')).toBe(false);
    r.j.roll(undefined);
    await r.play('To Marlcross market square', 'To the Priory gate');
    await r.waits(10);
    expect(r.holds('e1Done', 'rierdan')).toBe(true);
    expect(r.holds('e1Early', 'rierdan')).toBe(false);
    expect(r.holds('e1Chaos', 'rierdan') || r.holds('e1Priory', 'rierdan')).toBe(true);
  }, 280000);

  it('ends at the Priory gate when the day is left to run, with Dr Tuckett held; and survives a save and reload on the way', async () => {
    const r = await R.start('rep1b');
    await r.tour();
    await r.play('To Marlcross market square');
    r.j.roll('pass');
    await r.play('Tell Dr Tuckett that a man locked out', 'To the Priory gate');
    r.j.roll(undefined);
    await r.waits(5);
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
  it('closes the Lord to a company that failed its argument: no second try at the purse or the turn', async () => {
    const r = await toKeep('rep2d');
    await r.play('Report to Lord Valtry', 'They are frauds, my lord');
    r.j.roll('fail');
    await r.play("Put the Lady's purse on the table");
    expect(r.holds('e2Rebuffed', 'rierdan')).toBe(true);
    expect(r.holds('e2Done', 'rierdan')).toBe(false);
    expect(r.offers("Put the Lady's purse on the table")).toBe(false);
    expect(r.offers('Say to the Lord, alone, that a man told he will be a king')).toBe(false);
  }, 280000);
  it('ends in a murder when the company reports the women true and then does nothing at all', async () => {
    const r = await toKeep('rep2b');
    await r.play('Report to Lord Valtry', 'They are genuine, my lord', "To Cairnholt's yard");
    await r.waits(17);
    expect(r.holds('e2Murder', 'rierdan')).toBe(true);
    expect(r.holds('e2Done', 'rierdan')).toBe(true);
  }, 280000);
  it('is survived when the Warden\'s door is watched, or the Lady\'s cup is refused; and leaving the report unmade does not leave it open', async () => {
    const a = await toKeep('rep2c');
    await a.play('Report to Lord Valtry', 'They are genuine, my lord', "To Cairnholt's yard");
    await a.waits(11);
    a.j.roll('pass');
    await a.play("Post two soldiers at the Warden's door");
    await a.waits(6);
    expect(a.holds('e2Left', 'rierdan')).toBe(true);
    expect(a.holds('e2Murder', 'rierdan')).toBe(false);
    const b = await toKeep('rep2e');
    await b.waits(10);
    expect(b.holds('e2Unreported', 'rierdan')).toBe(true);
    await b.play('Tell Lady Marit that the company does not carry cups');
    await b.waits(6);
    expect(b.holds('e2CupRefused', 'rierdan')).toBe(true);
    expect(b.holds('e2Left', 'rierdan')).toBe(true);
    expect(b.holds('e2Murder', 'rierdan')).toBe(false);
  }, 280000);
  it('ends quietly when the company never joins the loop: the women called frauds, nothing done', async () => {
    const r = await toKeep('rep2f');
    await r.play('Report to Lord Valtry', 'They are frauds, my lord');
    await r.waits(17);
    expect(r.holds('e2Quiet', 'rierdan')).toBe(true);
  }, 280000);
});

describe('The Repertory, 3: The Prince and the Letter', () => {
  const toLetter = async (seed: string, trap = true) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    await r.play("To the Prince's study", 'Ask the Prince why he talks to the rampart', 'Make him show it', 'To the great hall of Harrowmere', 'To the south rampart');
    await r.waits(2);
    await r.play('Stand beside the Prince');
    expect(r.holds('e3Ghost', 'party')).toBe(true);
    if (trap) {
      await r.play('Ask the Prince what the cold place said to him', 'To the great hall of Harrowmere');
      r.j.roll('pass');
      await r.play('Have Swale work a speech about a king killed in an orchard');
      expect(r.holds('e3Trap', 'rierdan')).toBe(true);
    } else { await r.play('To the great hall of Harrowmere'); }
    await r.play('To the gate of Harrowmere', 'To the tiltyard');
    await r.waits(trap ? 2 : 3);
    r.j.roll('pass');
    await r.play('Step between the Prince and the captain', 'To the gate of Harrowmere', 'To the great hall of Harrowmere');
    await r.waits(2);
    await r.play('To the chapel');
    if (trap) { await r.waits(2); } else { await r.play('Take the Prince by the sleeve'); }
    expect(r.holds(trap ? 'e3Confessed' : 'e3Spared', 'rierdan')).toBe(true);
    await r.play('To the great hall of Harrowmere');
    await r.waits(3);
    expect(r.holds('e3Letter', 'rierdan')).toBe(true);
    r.j.roll(undefined);
    return r;
  };
  it('escapes through Orlay on a letter Swale has rewritten on the Prince\'s paper, with his consent, and the two friends are killed for it', async () => {
    const r = await toLetter('rep3a');
    r.j.roll('pass');
    await r.play('Warm the seal over a candle', 'Tell the Prince what his uncle');
    expect(r.holds('e3Read', 'rierdan')).toBe(true);
    expect(r.offers('Ask Swale to write a new letter')).toBe(false);
    await r.play("To the Prince's study", 'Take a clean sheet of the Prince', 'To the great hall of Harrowmere', 'Ask Swale to write a new letter');
    expect(r.holds('e3Forged', 'rierdan')).toBe(true);
    await r.play('To the gate of Harrowmere', 'To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay', 'Hand the Margravine of Orlay the letter');
    expect(r.holds('e3Escape', 'rierdan')).toBe(true);
    expect(r.holds('e3Killed', 'rierdan')).toBe(true);
    expect(r.holds('e3Done', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan')).toBe(1);
  }, 280000);
  it('ends in the larder, Bellerophon-wise, when the genuine letter is handed over: read or not', async () => {
    const r = await toLetter('rep3e', false);
    await r.play('To the gate of Harrowmere', 'To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay', 'Hand the Margravine of Orlay the letter');
    expect(r.holds('e3Bellerophon', 'rierdan')).toBe(true);
    expect(r.holds('e3Escape', 'rierdan')).toBe(false);
    expect(r.holds('e3Done', 'rierdan')).toBe(true);
  }, 280000);
  it('lets a seal that was cracked and clumsily re-sealed save the company: the Margravine will not act on a letter she cannot swear to', async () => {
    const r = await toLetter('rep3f');
    r.j.roll('fail');
    await r.play('Warm the seal over a candle');
    expect(r.holds('e3Cracked', 'rierdan')).toBe(true);
    expect(r.offers('Warm the seal over a candle')).toBe(false);
    r.j.roll(undefined);
    await r.play('To the gate of Harrowmere', 'To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay', 'Hand the Margravine of Orlay the letter');
    expect(r.holds('e3Escape', 'rierdan')).toBe(true);
    expect(r.holds('e3Killed', 'rierdan')).toBe(false);
  }, 280000);
  it('goes to Orlay with no letter and no cover story, and is turned away at the gate when the explanation fails', async () => {
    const r = await toLetter('rep3g');
    await r.play("Burn the Margrave's letter", 'To the gate of Harrowmere', 'To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay');
    r.j.roll('fail');
    await r.play('Tell the Margravine you come without');
    expect(r.holds('e3TurnedAway', 'rierdan')).toBe(true);
    expect(r.holds('e3Escape', 'rierdan')).toBe(false);
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
  it('puts the lovers right with ofbit (a sprig is lost to a failed hand) and brings the wedding to the lawn by dawn', async () => {
    const r = await toNight('rep4a');
    r.j.roll('pass');
    await r.play('Ask Tam to play the hautboy');
    expect(r.holds('e4LordTolerates', 'rierdan')).toBe(true);
    await r.play('To the edge of the wood', 'To the lantern bog', "To the pixie's hollow", 'Gather a sprig of ofbit', 'Gather a second sprig of ofbit', 'To the lantern bog', 'To the edge of the wood');
    r.j.roll('fail');
    await r.play("Touch Rafe's eyes and Idony's with ofbit");
    expect(r.holds('loves', 'rafe', 'idony')).toBe(false);
    r.j.roll('pass');
    await r.play("Touch Rafe's eyes and Idony's with ofbit");
    expect(r.holds('loves', 'rafe', 'idony')).toBe(true);
    expect(r.holds('loves', 'jack', 'maud')).toBe(true);
    await r.play('To the wedding lawn');
    await r.waits(8);
    expect(r.holds('e4Restored', 'rierdan')).toBe(true);
    expect(r.holds('e4Done', 'rierdan')).toBe(true);
    expect(r.holds('e4Fiasco', 'rierdan')).toBe(false);
  }, 280000);
  it('ends in a wedding between two who cannot say why when the poppy is used instead', async () => {
    const r = await toNight('rep4d');
    r.j.roll('pass');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the lantern bog', "To the pixie's hollow", 'Gather a handful of poppy heads', 'To the lantern bog', 'To the edge of the wood', 'Touch the lovers\' eyes with poppy');
    expect(r.holds('e4Slept', 'rierdan')).toBe(true);
    await r.play('To the wedding lawn');
    await r.waits(8);
    expect(r.holds('e4Blank', 'rierdan')).toBe(true);
    expect(r.holds('e4Fiasco', 'rierdan')).toBe(false);
  }, 280000);
  it('lets the weaver go for the Lord\'s true name only after the cheap bargain has failed, and the missing name costs the Command', async () => {
    const r = await toNight('rep4e');
    r.j.roll('pass');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the oak ring', "To the Lord's glade");
    expect(r.offers('Give the Lord of the Green your true name')).toBe(false);
    r.j.roll('fail');
    await r.play('Offer the Lord of the Green the thing he is quarrelling about');
    expect(r.holds('e4BargainFailed', 'rierdan')).toBe(true);
    r.j.roll(undefined);
    await r.play('Give the Lord of the Green your true name');
    expect(r.holds('e4Price', 'rierdan')).toBe(true);
    expect(r.holds('e4LoomFree', 'rierdan')).toBe(true);
  }, 280000);
  it('ends in the glorious fiasco when the lovers are left as the wood made them', async () => {
    const r = await toNight('rep4b');
    await r.waits(8);
    expect(r.holds('e4Dawn', 'rierdan')).toBe(true);
    expect(r.holds('e4Fiasco', 'rierdan')).toBe(true);
    expect(r.holds('e4Done', 'rierdan')).toBe(true);
    expect(r.holds('e4Restored', 'rierdan')).toBe(false);
  }, 280000);
  it('carries what was said on the road into the wood: Kit\'s answer from Marlcross is read among the lovers', async () => {
    const r = await R.start('rep4c');
    await r.tour();
    await r.play('To Marlcross market square');
    r.j.roll('pass');
    await r.play('Tell Dr Tuckett that a man locked out', 'To the Priory gate');
    r.j.roll(undefined);
    await r.waits(9);
    expect(r.holds('e1Done', 'rierdan')).toBe(true);
    await r.play('To Marlcross market square', 'To the Ashlar house', 'Ask Kit what he made of Marlcross', 'Tell him to say so, in his own voice');
    expect(r.holds('kitSaysSo', 'party')).toBe(true);
    await r.play('To Marlcross market square', 'To the Wend Cross', 'To the wedding lawn');
    expect(r.offers('Ask Kit how he is, here, among the lovers')).toBe(true);
    await r.play('Ask Kit how he is, here, among the lovers');
    expect(r.offers('Ask Kit how he is, here, among the lovers')).toBe(false);
  }, 280000);
});
