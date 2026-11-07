import { describe, expect, it } from 'bun:test';
import { readFileSync } from 'node:fs';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';

// The Repertory (doc/adventures/anthology/the-repertory.md): four engagements on the Fourways Circuit, played by the
// labels a page offers. Every spec begins where the King's Players' unbroken play ends Act IV: the Trial's own fixture to
// the verdict, the King's Road, Acts I-III and the Wick's opening night, all by labels and with natural dice
// (test/kings-players.test.ts plays the same road). That play is made once per file and saved as a checkpoint; each spec
// resumes it, so it begins with a real state and WALKS to the Fourways (the Concourse, the River Gate, the road, the inn,
// Hepzibah's letters). Nothing is asserted or placed. A spec's dice are re-keyed by its own tag (`rep2a-3`: the seed the
// spec names, suffixed by the sweep that found a luck the journey could use), because a "fair" check can miss; a spec
// forces a result only where it is showing that failure (`roll('fail')`, then reset). The Command cannot follow an Act V
// Ending, so the tour opens before it and holds it; one spec plays the Command itself and reads the road in it.
const city = 'test/fixtures/gosse/city.campaign.json';
const p = (x: string) => ['party', 'hour', 'day', 'watch', 'clock', 'quantity'].includes(x) ? x : `pentrice__${x}`;
const steps = (name: string): string[] => {
  const ph = JSON.parse(readFileSync(`test/fixtures/gosse/${name}.json`, 'utf8')) as Record<string, string[]> | string[];
  return (Array.isArray(ph) ? ph : Object.values(ph).flat()).slice(0, -1);
};
// Pentrice to the Wick's opening night, as the unbroken play of the King's Players plays it. Variant A robs the strong-box
// (the heist), variant B has Swale hide his forgery and leaves the box alone.
const bowCache = new Map<string, Promise<string>>();
const bow = (variant: 'A' | 'B') => {
  if (!bowCache.has(variant)) {
    bowCache.set(variant, (async () => {
      const j = await Journey.start(city, 'g1');
      await j.play(...steps('bow'));
      await j.play('Wait › An hour', 'Out to the yard of the Painted Moon', "Take the King's writ", 'Out to the Westgate', 'To the Chepe', 'To Guildhall Square', 'To the Minster Close', 'To the Eastgate', "To the King's Road");
      await j.play('To the River Gate', 'Say who you are, since the sergeant has not asked', "We are. The Marchants' masquers, and we are late");
      await j.play('To the Concourse of the Seven', 'To Playhouse Row', 'Into the Brazen Sparrow');
      if (j.offers("To the Sparrow's long loft")) { await j.play("To the Sparrow's long loft"); }
      await j.play('Ask Hepzibah what the company will give the King', "The Miser's Wedding, the old one", 'Ask Gosse how he wants the King to see him', 'As what you were. The King wants a king');
      if (j.offers("To the Brazen Sparrow's taproom")) { await j.play("To the Brazen Sparrow's taproom"); }
      await j.play('Out to Playhouse Row', 'To the Concourse of the Seven', 'To the steps of the Tower of Law', "To the King's Court", "Into the King's Tower");
      await j.play("Play the King The Miser's Wedding, as his grandfather had it");
      await j.play('To the long terrace', 'Go out on the terrace and stand where the Prince can say it', "Yes. I've met two");
      await j.play('To the Audience Chamber', "Out to the King's Court", 'To the steps of the Tower of Law', 'To the Concourse of the Seven', 'To Playhouse Row', 'To the Salt Quay');
      await j.play('Into the Tower of Salt', 'Ask the Salt-Wives what keeps a dead thing out of a house', 'Silence. When they stop listening');
      await j.play('Out to the Salt Quay', 'To Playhouse Row', '=06:00', '=17:50', 'Into the Rotunda');
      await j.play('=18:10', 'Lay a line of grey salt across the threshold', "To the Rotunda's stage");
      await j.play("To the Rotunda's wings", 'Ask Hepzibah to prompt the Mousetrap', 'No name. Cancel the trap. Play something else', '=06:30');
      await j.play('Wait › An hour', 'Wait › An hour');
      await j.play("To the Rotunda's stage", "To the Rotunda's front of house", 'Out to Playhouse Row', 'Into the Wick', "To the Wick's wardrobe", 'Ask Hepzibah to gather the company about the note', "Jem's: a false clerk, a false summons, and a good coat");
      if (variant === 'B') { await j.play('Ask Swale why he cannot meet your eye', "Say nothing. We'll get the paper back"); }
      await j.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Salt Quay', "To Mistress Pardew's draper's", 'Ask Mistress Pardew whether she dressed a clerk', "The note's a forgery. We mean to take it back");
      await j.play('?To the Salt Quay', 'To Playhouse Row', 'Into the Wick');
      await j.play('=+144', '=+144', '=+144', '=19:10');
      await j.play("To Lord Rask's box", "Take Lord Rask's box for the evening, and a bottle, and Master Mauger's whole attention");
      if (variant === 'A') {
        await j.play("To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the Exchange under the Tower of Coin',
          "?Walk in at the counting-room door in the clerk's coat, as if you worked there", "?Open Master Mauger's strong-box, with a key or without");
      }
      await j.play('=22:10');
      expect(j.holds(p('heistOver'), p('rierdan'))).toBe(true);
      return JSON.stringify(j.session.checkpoint());
    })());
  }
  return bowCache.get(variant)!;
};
class R {
  base = 0;
  constructor(public j: Journey) { this.base = this.measure('repertoire', 'rierdan'); }
  static async start(tag: string, variant: 'A' | 'B' = 'A') {
    const cp = JSON.parse(await bow(variant));
    cp.save.state.seed = `g1:${tag}`;
    return new R(Journey.of(PlaySession.resume(cp)));
  }
  async play(...labels: string[]) { await this.j.play(...labels); return this; }
  holds(name: string, ...args: string[]) { return this.j.holds(p(name), ...args.map(p)); }
  knows(f: string) { return this.j.holds('knows', 'party', p(f)); }
  measure(name: string, ...args: string[]) { return this.j.measure(p(name), ...args.map(p)); }
  at(who: string) { return this.j.at(p(who)); }
  offers(label: string) { return this.j.offers(label); }
  told() { return ((this.j as unknown as { taken: { told: string }[] }).taken.at(-1)?.told ?? ''); }
  // From wherever the opening night left the party: out of the Wick, the Concourse, the River Gate, the Fourways road, the
  // inn for Hepzibah's letters, and back out to the Fourways.
  async tour() {
    for (const step of ["To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the River Gate']) { if (this.j.offers(step)) { await this.play(step); } }
    await this.play('To the Fourways', 'Into the Drum and Whistle', 'Ask Hepzibah what is in the heap of letters', 'Out to the Fourways');
    return this;
  }
  // Wait an hour at a time until a condition holds (a night is a clock hour, not a count of waits).
  async until(done: () => boolean, max = 48) { for (let i = 0; i < max && !done(); i++) { await this.play('Wait › An hour'); } expect(done()).toBe(true); return this; }
  // Wait a watch (ten minutes) at a time, for a beat whose deadline is an hour.
  async untilFine(done: () => boolean, max = 240) { for (let i = 0; i < max && !done(); i++) { await this.play('Wait › A while'); } expect(done()).toBe(true); return this; }
  hour() { return this.measure('hour', 'clock'); }
  async waits(n: number) { for (let i = 0; i < n; i++) { await this.play('Wait › An hour'); } return this; }
}

describe('The Repertory: the Fourways Circuit', () => {
  it('opens only when the Wick is theirs, takes the lodged troupe (not a fixed roster) to the inn, holds the Command, and sends them home', async () => {
    const r = await R.start('rep0');
    expect(r.holds('heistOver', 'rierdan')).toBe(true);
    for (const step of ["To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the River Gate']) { if (r.offers(step)) { await r.play(step); } }
    expect(r.holds('commandOn', 'rierdan')).toBe(true);
    expect(r.offers('To the Fourways')).toBe(true);
    const day = r.measure('commandDay', 'rierdan');
    await r.play('To the Fourways', 'Into the Drum and Whistle');
    for (const who of ['gosse', 'kit', 'swale', 'dorcas']) { expect(r.at(who)).toBe(p('wend_taproom')); }
    expect(r.at('clemency')).not.toBe(p('wend_taproom'));
    await r.play('Ask Hepzibah what is in the heap of letters', 'Out to the Fourways');
    for (const way of ['To Marlcross market square', 'To the Three Cairns', 'To the gate of Harrowmere', 'To the wedding lawn']) { expect(r.offers(way)).toBe(true); }
    await r.waits(60);
    expect(r.holds('holdingCommand', 'rierdan')).toBe(false);
    expect(r.measure('commandDay', 'rierdan')).toBeGreaterThan(day);
    await r.play('To the River Gate');
    await r.waits(1);
    expect(r.at('gosse')).not.toBe(p('wend_taproom'));
    expect(r.holds('tourAway', 'rierdan')).toBe(false);
    expect(r.measure('commandDay', 'rierdan')).toBeGreaterThan(r.measure('day', 'clock'));
  }, 290000);
  it('does not walk the company out of the city on the day of its Command', async () => {
    const r = await R.start('rep0c');
    for (const step of ["To the Wick's dark stage", 'Out to Playhouse Row', 'To the Concourse of the Seven', 'To the River Gate']) { if (r.offers(step)) { await r.play(step); } }
    await r.until(() => r.measure('commandDay', 'rierdan') <= r.measure('day', 'clock'), 120);
    expect(r.offers('To the Fourways')).toBe(false);
  }, 290000);
});

describe('The Repertory, 1: The Two Pairs', () => {
  const scout = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To Marlcross market square', "To Gleed's goldsmithy", 'To Marlcross market square', 'To the Ashlar house');
    await r.waits(1);
    await r.play('To Marlcross market square');
    await r.waits(2);
    return r;
  };
  it('is ended early only by a company that has reconstructed the day: both pairs chalked, then both Corbets put at one table; Mother Everard speaks the reversal', async () => {
    const r = await scout('rep1a-1');
    expect(r.holds('chainTaken', 'rierdan')).toBe(true);
    await r.play('Lay out the day on the nearest wall in chalk: the two Corbets', 'Chalk up the Jibbs');
    expect(r.knows('two_masters_known')).toBe(true);
    expect(r.knows('two_servants_known')).toBe(true);
    await r.play('Ask the Evesholm Corbet to wait', "To Madam Cinnabar's parlour", 'Ask the Marlcross Corbet to wait');
    expect(r.holds('e1Early', 'rierdan')).toBe(true);
    expect(r.at('everard')).toBe(p('m_inn'));
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
    await r.play('To Marlcross market square', 'To the Ashlar house', 'Ask Kit what he made of Marlcross', 'Say nothing; put a hand on his shoulder');
    expect(r.holds('kitLeaned', 'party')).toBe(true);
    await r.play('To Marlcross market square', 'To the Fourways', 'Into the Drum and Whistle');
    expect(r.at('kit')).toBe(p('wend_taproom'));
  }, 290000);
  it('does not end at the three-move line: two Corbets put in the Mermaid only silence the town, and the day runs on to the Prioress', async () => {
    const r = await R.start('rep1d');
    await r.tour();
    await r.play('To Marlcross market square', 'To the Mermaid', 'Ask the Evesholm Corbet to wait', 'To Marlcross market square', "To Gleed's goldsmithy", 'Ask the Marlcross Corbet to wait');
    expect(r.holds('e1Met', 'rierdan')).toBe(true);
    expect(r.holds('e1Early', 'rierdan')).toBe(false);
    expect(r.holds('e1Done', 'rierdan')).toBe(false);
    await r.play('To Marlcross market square', 'To the Priory gate');
    await r.until(() => r.holds('e1Done', 'rierdan'));
    expect(r.holds('e1Early', 'rierdan')).toBe(false);
    expect(r.holds('e1Chaos', 'rierdan') || r.holds('e1Priory', 'rierdan')).toBe(true);
  }, 290000);
  it('does not let a failed argument be asked again: the exorcist is one try', async () => {
    const r = await R.start('rep1e');
    await r.tour();
    await r.play('To Marlcross market square');
    r.j.roll('fail');
    await r.play('Tell Dr Tuckett that a man locked out');
    r.j.roll(undefined);
    expect(r.holds('f_tuckett', 'rierdan')).toBe(true);
    expect(r.offers('Tell Dr Tuckett that a man locked out')).toBe(false);
  }, 290000);
  it('ends at the Priory gate when the day is left to run, with Dr Tuckett held; and survives a save and reload on the way', async () => {
    const r = await R.start('rep1b');
    await r.tour();
    await r.play('To Marlcross market square', 'Tell Dr Tuckett that a man locked out', 'To the Priory gate');
    await r.waits(5);
    const back = new R(Journey.of(PlaySession.resume(JSON.parse(JSON.stringify(r.j.session.checkpoint())))));
    expect(back.holds('e1On', 'rierdan')).toBe(true);
    expect(back.holds('e1Done', 'rierdan')).toBe(false);
    await back.waits(4);
    expect(back.holds('e1Priory', 'rierdan')).toBe(true);
    expect(back.holds('e1Done', 'rierdan')).toBe(true);
  }, 290000);
  it('ends in the chaos of the Priory gate when nobody stops the exorcist; chaos is not credited to the repertoire', async () => {
    const r = await R.start('rep1c');
    await r.tour();
    await r.play('To Marlcross market square', 'To the Priory gate');
    await r.waits(10);
    expect(r.holds('e1Chaos', 'rierdan')).toBe(true);
    expect(r.holds('e1Priory', 'rierdan')).toBe(false);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
});

describe('The Repertory, 2: The Three', () => {
  const toKeep = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the Three Cairns', "To Cairnholt's yard", 'Ask the steward what the Lord wants', 'To the Three Cairns');
    await r.play("Watch the three women's hands", 'Ask them something the steward', 'Look for how they came to the cairns', "To Cairnholt's yard", "To Cairnholt's hall");
    return r;
  };
  const done = (r: R) => () => r.holds('e2Done', 'rierdan');
  const arrives = (r: R) => () => r.holds('e2StroudComes', 'rierdan');
  it('is ended by the purse on the table, and the Lady is played as the answer given; afterwards nothing of the loop is offered', async () => {
    const r = await toKeep('rep2a-2');
    expect(r.knows('three_paid_known')).toBe(true);
    await r.play('Report to Lord Valtry', 'They are frauds, my lord', "Put the Lady's purse on the table");
    expect(r.holds('e2Revealed', 'rierdan')).toBe(true);
    expect(r.offers("Put the Lady's purse on the table")).toBe(false);
    await r.play("To Cairnholt's yard", 'To the Three Cairns');
    expect(r.offers('Look for how they came to the cairns')).toBe(false);
    await r.play('To the Fourways', 'Into the Drum and Whistle', 'Ask Dorcas how she would play the Lady', 'She is afraid of what he will be without it');
    expect(r.holds('dorcasAfraid', 'party')).toBe(true);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
  }, 290000);
  it('closes the Lord to a company that failed its argument: no second try at the purse or the turn', async () => {
    const r = await toKeep('rep2d-1');
    await r.play('Report to Lord Valtry', 'They are frauds, my lord');
    r.j.roll('fail');
    await r.play("Put the Lady's purse on the table");
    r.j.roll(undefined);
    expect(r.holds('e2Rebuffed', 'rierdan')).toBe(true);
    expect(r.offers("Put the Lady's purse on the table")).toBe(false);
  }, 290000);
  it('murders on the stair after a telegraphed night; once it is done, no argument, test or Warden is offered, and Stroud is gone', async () => {
    const r = await toKeep('rep2b');
    await r.play('Report to Lord Valtry', 'They are genuine, my lord', "To Cairnholt's yard");
    await r.until(arrives(r));
    expect(r.told()).toContain('Warden');
    const at = r.measure('watch', 'clock');
    await r.until(() => r.holds('e2Night', 'rierdan'));
    expect(r.measure('watch', 'clock')).toBeGreaterThanOrEqual(at + 12);
    await r.until(() => r.holds('e2Stair', 'rierdan'));
    expect(r.holds('e2Done', 'rierdan')).toBe(false);
    await r.until(done(r));
    expect(r.holds('e2Murder', 'rierdan')).toBe(true);
    await r.play("To Cairnholt's hall");
    expect(r.offers("Put the Lady's purse on the table")).toBe(false);
    expect(r.offers('Talk to Warden Ancel Stroud')).toBe(false);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('treats "I cannot tell" as silence: Valtry decides at +40 watches, and a company that then does nothing has a murder on its hands', async () => {
    const r = await toKeep('rep2g');
    await r.play('Report to Lord Valtry', 'I cannot tell, my lord');
    expect(r.holds('e2Reported', 'rierdan')).toBe(false);
    await r.until(done(r));
    expect(r.holds('e2Unreported', 'rierdan')).toBe(true);
    expect(r.holds('e2Murder', 'rierdan')).toBe(true);
  }, 290000);
  it('sends a rider after a company that takes the job and sits at the Fourways: it is told before it is complicit', async () => {
    const r = await toKeep('rep2l');
    await r.play("To Cairnholt's yard", 'To the Three Cairns', 'To the Fourways');
    await r.until(() => r.measure('watch', 'clock') >= r.measure('e2Start', 'rierdan') + 30);
    expect(r.told()).toContain('Cairnholt');
  }, 290000);
  it('is survived when the Warden\'s door is watched; the guards cannot be posted after the book is closed', async () => {
    const r = await toKeep('rep2c');
    await r.play('Report to Lord Valtry', 'They are genuine, my lord', "To Cairnholt's yard");
    await r.until(arrives(r));
    await r.play("Post two soldiers at the Warden's door");
    expect(r.holds('e2GuardDoor', 'rierdan')).toBe(true);
    await r.until(done(r));
    expect(r.holds('e2Left', 'rierdan')).toBe(true);
    expect(r.offers("Post two soldiers at the Warden's door")).toBe(false);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
  }, 290000);
  it('closes the door-watch to a company that fails it once', async () => {
    const r = await toKeep('rep2i');
    await r.play('Report to Lord Valtry', 'They are genuine, my lord', "To Cairnholt's yard");
    await r.until(arrives(r));
    r.j.roll('fail');
    await r.play("Post two soldiers at the Warden's door");
    r.j.roll(undefined);
    expect(r.offers("Post two soldiers at the Warden's door")).toBe(false);
  }, 290000);
  it('lets the company carry Lady Marit\'s cup up the stair itself, and murders for it unless the door is watched', async () => {
    const r = await toKeep('rep2j');
    await r.until(arrives(r));
    await r.play("Take Lady Marit's covered cup up to the Warden's room");
    expect(r.holds('e2Carried', 'rierdan')).toBe(true);
    await r.until(done(r));
    expect(r.holds('e2Murder', 'rierdan')).toBe(true);
  }, 290000);
  it('is survived when the Lady\'s cup is refused and the refusal holds; a refusal that fails sends the cup up on the company\'s name', async () => {
    const a = await toKeep('rep2e');
    await a.until(arrives(a));
    await a.play('Tell Lady Marit that the company does not carry cups');
    expect(a.holds('e2CupRefused', 'rierdan')).toBe(true);
    await a.until(done(a));
    expect(a.holds('e2Left', 'rierdan')).toBe(true);
    const b = await toKeep('rep2h');
    await b.until(arrives(b));
    b.j.roll('fail');
    await b.play('Tell Lady Marit that the company does not carry cups');
    b.j.roll(undefined);
    expect(b.holds('e2Carried', 'rierdan')).toBe(true);
    await b.until(done(b));
    expect(b.holds('e2Murder', 'rierdan')).toBe(true);
  }, 290000);
  it('ends quietly when the company never joins the loop: the women called frauds, nothing done', async () => {
    const r = await toKeep('rep2f-1');
    await r.play('Report to Lord Valtry', 'They are frauds, my lord');
    await r.until(done(r));
    expect(r.holds('e2Quiet', 'rierdan')).toBe(true);
  }, 290000);
  it('turns the Lord only for a company that has seen the loop it was in: genuine report, the guards at the gate, the women\'s page, then the argument; and not before', async () => {
    const r = await toKeep('rep2k');
    await r.play('Report to Lord Valtry', 'They are genuine, my lord');
    expect(r.offers('Say to the Lord, alone, that a man told he will be a king')).toBe(false);
    await r.play("To Cairnholt's yard");
    await r.until(arrives(r));
    await r.play('Post the guards at the gate', 'To the Three Cairns');
    expect(r.knows('e2_loop_known')).toBe(true);
    await r.play("To Cairnholt's yard", "To Cairnholt's hall", 'Say to the Lord, alone, that a man told he will be a king');
    expect(r.holds('e2Turned', 'rierdan')).toBe(true);
    expect(r.holds('e2Done', 'rierdan')).toBe(true);
  }, 290000);
});

describe('The Repertory, 3: The Prince and the Letter', () => {
  // The three exploits are keyed to the clock: the rampart at night, the tiltyard by day, the chapel at dusk.
  const toLetter = async (seed: string, trap = true) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    await r.play("To the Prince's study", 'Ask the Prince why he talks to the rampart', 'Make him show it', 'To the great hall of Harrowmere', 'To the south rampart');
    await r.untilFine(() => r.holds('x1', 'rierdan'));
    await r.play('Stand beside the Prince');
    expect(r.holds('e3Ghost', 'party')).toBe(true);
    if (trap) {
      await r.play('Ask the Prince what the cold place said to him', 'To the great hall of Harrowmere');
      await r.play('Have Swale work a speech about a king killed in an orchard');
      expect(r.holds('e3Trap', 'rierdan')).toBe(true);
    } else { await r.play('To the great hall of Harrowmere'); }
    await r.play('To the gate of Harrowmere', 'To the tiltyard');
    await r.untilFine(() => r.holds('x2', 'rierdan'));
    await r.play('Step between the Prince and the captain', 'To the gate of Harrowmere', 'To the great hall of Harrowmere');
    if (trap) { await r.until(() => r.holds('x3c', 'rierdan')); }
    else { await r.play('To the chapel'); await r.untilFine(() => r.holds('x3', 'rierdan')); await r.play('Take the Prince by the sleeve'); }
    expect(r.holds(trap ? 'e3Confessed' : 'e3Spared', 'rierdan')).toBe(true);
    if (r.offers('To the great hall of Harrowmere')) { await r.play('To the great hall of Harrowmere'); }
    await r.until(() => r.holds('e3Letter', 'rierdan'));
    return r;
  };
  const toOrlayHall = async (r: R) => {
    await r.play('To the gate of Harrowmere', 'To the Orlay road');
    await r.until(() => r.hour() >= 6 && r.hour() < 19);
    await r.play('To the gate of Orlay', 'To the hall of Orlay');
  };
  it('escapes through Orlay on a letter Swale has rewritten on the Prince\'s one sheet, with his consent, if the forgery is not blown at the table; and the two friends are killed for it', async () => {
    const r = await toLetter('rep3a');
    await r.play('Warm the seal over a candle');
    expect(r.holds('e3Read', 'rierdan')).toBe(true);
    await r.play('Tell the Prince what his uncle');
    expect(r.offers('Ask Swale to write a new letter')).toBe(false);
    await r.play("To the Prince's study", 'Take a clean sheet of the Prince', 'To the great hall of Harrowmere', 'Ask Swale to write a new letter');
    expect(r.holds('e3Forged', 'rierdan')).toBe(true);
    await toOrlayHall(r);
    expect(r.offers('Hand the Margravine of Orlay the letter you were given')).toBe(false);
    await r.play('Hand the Margravine of Orlay the letter that Swale wrote');
    expect(r.holds('e3Escape', 'rierdan')).toBe(true);
    expect(r.holds('e3Killed', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
    expect(r.offers('Warm the seal over a candle')).toBe(false);
    expect(r.offers('Wrap the letter in oilskin')).toBe(false);
  }, 290000);
  it('allows only one sheet: a forgery that fails leaves no second try', async () => {
    const r = await toLetter('rep3i-5');
    await r.play('Warm the seal over a candle', 'Tell the Prince what his uncle', "To the Prince's study", 'Take a clean sheet of the Prince', 'To the great hall of Harrowmere');
    r.j.roll('fail');
    await r.play('Ask Swale to write a new letter');
    r.j.roll(undefined);
    expect(r.holds('e3Forged', 'rierdan')).toBe(false);
    await r.play("To the Prince's study");
    expect(r.offers('Take a clean sheet of the Prince')).toBe(false);
  }, 290000);
  it('shuts the company in the Orlay larder, Bellerophon-wise, when the genuine letter is handed over; the door is really barred, and opens on a night, a trust, or a spoon; the larder is not credited; nothing of the letter is offered after', async () => {
    const r = await toLetter('rep3e', false);
    await toOrlayHall(r);
    await r.play('Hand the Margravine of Orlay the letter you were given');
    await r.waits(1);
    expect(r.holds('e3Bellerophon', 'rierdan')).toBe(true);
    expect(r.at('party')).toBe(p('or_larder'));
    expect(r.offers('To the hall of Orlay')).toBe(false);
    expect(r.offers('Warm the seal over a candle')).toBe(false);
    await r.until(() => r.holds('e3Unlocked', 'rierdan'), 200);
    expect(r.offers('To the hall of Orlay')).toBe(true);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it.skip('leaves the larder early for a company that picks the bar loose, once', async () => {
    const r = await toLetter('rep3k', false);
    await toOrlayHall(r);
    await r.play('Hand the Margravine of Orlay the letter you were given');
    await r.waits(1);
    await r.play('Work the bar loose from inside');
    expect(r.holds('e3Unlocked', 'rierdan')).toBe(true);
  }, 290000);
  it('makes a failed read the worst outcome of the read: three crowns, the Prince kept, the company turned out, and the play not credited', async () => {
    const r = await toLetter('rep3f-2');
    const gold = r.j.measure('quantity', 'party', 'gold');
    r.j.roll('fail');
    await r.play('Warm the seal over a candle');
    r.j.roll(undefined);
    expect(r.holds('e3Cracked', 'rierdan')).toBe(true);
    expect(r.j.measure('quantity', 'party', 'gold')).toBeLessThan(gold);
    expect(r.offers('Warm the seal over a candle')).toBe(false);
    await toOrlayHall(r);
    await r.play('Hand the Margravine of Orlay the letter you were given');
    expect(r.holds('e3Held', 'rierdan')).toBe(true);
    expect(r.holds('e3Killed', 'rierdan')).toBe(false);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('burns the letter only after reading it or being warned, and is turned away at Orlay when the explanation fails (not credited)', async () => {
    const r = await toLetter('rep3g-3');
    expect(r.offers("Burn the Margrave's letter")).toBe(false);
    await r.play('Warm the seal over a candle', "Burn the Margrave's letter");
    await toOrlayHall(r);
    r.j.roll('fail');
    await r.play('Tell the Margravine you come without');
    r.j.roll(undefined);
    expect(r.holds('e3TurnedAway', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('lets Ysenne Fosbury\'s warning stand for a read, so that the letter may be burned unread', async () => {
    const r = await toLetter('rep3n');
    expect(r.offers("Burn the Margrave's letter")).toBe(false);
    await r.play('To the chapel', 'Ask Ysenne Fosbury what her father has been copying', 'To the great hall of Harrowmere');
    expect(r.offers("Burn the Margrave's letter")).toBe(true);
  }, 290000);
  it('lays the sealed letter before the Margrave, if the oilskin kept it: he burns it himself', async () => {
    const r = await toLetter('rep3l-5');
    await r.play('Warm the seal over a candle', 'Wrap the letter in oilskin', 'Lay the Margrave\'s own letter');
    expect(r.holds('e3Exposed', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
  }, 290000);
  const inn = async (seed: string) => {
    const r = await toLetter(seed);
    await r.play('To the gate of Harrowmere', 'To the Orlay road', 'To the Fox and Feather');
    await r.until(() => r.holds('e3MixRolled', 'rierdan'));
    await r.until(() => r.hour() >= 6 && r.hour() < 19);
    return r;
  };
  it.skip('ends in a farce of laundry lists when the morning\'s dice send the letter to Orlay in the wrong basket; the farce is not credited', async () => {
    const r = await inn('rep3m');
    expect(r.holds('e3Mixed', 'rierdan')).toBe(true);
    expect(r.offers('Hand the Margravine of Orlay the letter you were given')).toBe(false);
    await r.play('To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay');
    expect(r.offers('Hand the Margravine of Orlay the letter you were given')).toBe(false);
    await r.play('Present what the carrier brings');
    expect(r.holds('e3Misdelivered', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('keeps the letter, and its danger, when the morning\'s dice leave the basket alone', async () => {
    const r = await inn('rep3j');
    expect(r.holds('e3Mixed', 'rierdan')).toBe(false);
    await r.play('To the Orlay road', 'To the gate of Orlay', 'To the hall of Orlay', 'Hand the Margravine of Orlay the letter you were given');
    expect(r.holds('e3Bellerophon', 'rierdan')).toBe(true);
  }, 290000);
  it('ends in a grave when the Prince is left alone three times; the grave is not credited to the repertoire', async () => {
    const r = await R.start('rep3c');
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    await r.until(() => r.holds('e3Grave', 'rierdan'), 120);
    expect(r.holds('e3Letter', 'rierdan')).toBe(false);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(0);
  }, 290000);
  it('brings Swale to the hall every time the party returns to it: a trip home to the city does not strand him', async () => {
    const r = await R.start('rep3h');
    await r.tour();
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants');
    expect(r.at('swale')).toBe(p('hm_hall'));
    await r.play('To the gate of Harrowmere', 'To the Fourways', 'To the River Gate');
    await r.waits(1);
    expect(r.at('swale')).not.toBe(p('hm_hall'));
    await r.play('To the Fourways', 'To the gate of Harrowmere', 'To the great hall of Harrowmere');
    expect(r.at('swale')).toBe(p('hm_hall'));
  }, 290000);
});

describe('The Repertory, 4: The Wood near Athens-under-Hollin', () => {
  const toNight = async (seed: string) => {
    const r = await R.start(seed);
    await r.tour();
    await r.play('To the wedding lawn', 'Ask Gosse how the rehearsal is going', 'Run the rehearsal yourself');
    await r.until(() => r.holds('e4Hunt', 'rierdan'));
    return r;
  };
  it('puts the lovers right with ofbit (a sprig is lost to a failed hand) and brings the wedding to the lawn by dawn; the weaver is paid', async () => {
    const r = await toNight('rep4a');
    await r.play('Ask Tam to play the hautboy');
    expect(r.holds('e4LordTolerates', 'rierdan')).toBe(true);
    await r.play('To the edge of the wood', 'To the lantern bog', "To the pixie's hollow", 'Gather a sprig of ofbit', 'Gather a second sprig of ofbit', 'To the lantern bog', 'To the edge of the wood');
    r.j.roll('fail');
    await r.play("Touch Rafe's eyes and Idony's with ofbit");
    r.j.roll(undefined);
    expect(r.holds('loves', 'rafe', 'idony')).toBe(false);
    await r.play("Touch Rafe's eyes and Idony's with ofbit");
    expect(r.holds('loves', 'rafe', 'idony')).toBe(true);
    await r.play('To the wedding lawn');
    await r.until(() => r.holds('e4Done', 'rierdan'));
    expect(r.hour()).toBeGreaterThanOrEqual(5);
    expect(r.holds('e4Restored', 'rierdan')).toBe(true);
    await r.waits(1);
    expect(r.measure('repertoire', 'rierdan') - r.base).toBe(1);
  }, 290000);
  it('ends in a wedding between two who cannot say why when the poppy is used instead', async () => {
    const r = await toNight('rep4d');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the lantern bog', "To the pixie's hollow", 'Gather a handful of poppy heads', 'To the lantern bog', 'To the edge of the wood', 'Touch the lovers\' eyes with poppy');
    expect(r.holds('e4Slept', 'rierdan')).toBe(true);
    await r.play('To the wedding lawn');
    await r.until(() => r.holds('e4Done', 'rierdan'));
    expect(r.holds('e4Blank', 'rierdan')).toBe(true);
  }, 290000);
  it('lets the weaver go for the Lord\'s true name only after the cheap bargain has failed', async () => {
    const r = await toNight('rep4e');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the oak ring', "To the Lord's glade");
    expect(r.offers('Give the Lord of the Green your true name')).toBe(false);
    r.j.roll('fail');
    await r.play('Offer the Lord of the Green the thing he is quarrelling about');
    r.j.roll(undefined);
    expect(r.holds('e4BargainFailed', 'rierdan')).toBe(true);
    await r.play('Give the Lord of the Green your true name');
    expect(r.holds('e4Price', 'rierdan')).toBe(true);
    expect(r.holds('e4LoomFree', 'rierdan')).toBe(true);
  }, 290000);
  it('lets the Ash\'s memory free the weaver at the cost of an hour of the night, and humbles the Lord', async () => {
    const r = await toNight('rep4f');
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the oak ring', "To the Lord's glade", 'To the ash that is a woman');
    const before = r.measure('watch', 'clock');
    await r.play('Ask the Ash whether she remembers');
    expect(r.measure('watch', 'clock')).toBeGreaterThanOrEqual(before + 6);
    await r.play("To the Lord's glade", 'Call the Lord of the Green by the name');
    expect(r.holds('e4LoomFree', 'rierdan')).toBe(true);
    expect(r.holds('e4Humbled', 'rierdan')).toBe(true);
  }, 290000);
  it('does not allow the hautboy to be played again after a poor tune: a failure is a failure', async () => {
    const r = await toNight('rep4g');
    r.j.roll('fail');
    await r.play('Ask Tam to play the hautboy');
    r.j.roll(undefined);
    expect(r.offers('Ask Tam to play the hautboy')).toBe(false);
    expect(r.holds('e4LordTolerates', 'rierdan')).toBe(false);
  }, 290000);
  it('puts iron and a torch in the company\'s hands on the lawn: the wood\'s protections are things the company can pick up', async () => {
    const r = await toNight('rep4j');
    expect(r.offers('iron nails: Take')).toBe(true);
    await r.play('iron nails: Take');
    await r.play('To the edge of the wood');
    for (let i = 0; i < 6; i++) { await r.play('Wait › A while'); }
    expect(r.told()).not.toContain('goat');
  }, 290000);
  it('telegraphs the Hunt: the horn at the edge of the wood, then the hooves; an unprotected company is struck, and the edge is not fatal on arrival', async () => {
    const r = await toNight('rep4h');
    await r.play('To the edge of the wood');
    expect(r.told()).toContain('The horn is in the beech-wood');
    expect(r.holds('e4EdgeSeen', 'rierdan')).toBe(true);
    const seen: string[] = [];
    for (let i = 0; i < 10; i++) { await r.play('Wait › A while'); seen.push(r.told()); }
    expect(seen.join(' ')).toContain('goat');
  }, 290000);
  it('ends in the glorious fiasco when the lovers are left as the wood made them; a fiasco no one chose is not credited, a fiasco the company stood at the edge to choose is', async () => {
    const a = await toNight('rep4b');
    await a.until(() => a.holds('e4Done', 'rierdan'));
    expect(a.holds('e4Fiasco', 'rierdan')).toBe(true);
    await a.waits(1);
    expect(a.measure('repertoire', 'rierdan') - a.base).toBe(0);
    const b = await toNight('rep4i');
    expect(b.offers('Stand at the edge and let the lovers be')).toBe(false);
    await b.play('To the edge of the wood', 'Stand at the edge and let the lovers be', 'To the wedding lawn');
    await b.until(() => b.holds('e4Done', 'rierdan'));
    expect(b.holds('e4Fiasco', 'rierdan')).toBe(true);
    await b.waits(1);
    expect(b.measure('repertoire', 'rierdan') - b.base).toBe(1);
  }, 290000);
  it('carries what was said on the road into the wood: Kit\'s answer from Marlcross is read among the lovers', async () => {
    const r = await R.start('rep4c');
    await r.tour();
    await r.play('To Marlcross market square', 'Tell Dr Tuckett that a man locked out', 'To the Priory gate');
    await r.until(() => r.holds('e1Done', 'rierdan'));
    await r.play('To Marlcross market square', 'To the Ashlar house', 'Ask Kit what he made of Marlcross', 'Tell him to say so, in his own voice');
    expect(r.holds('kitSaysSo', 'party')).toBe(true);
    await r.play('To Marlcross market square', 'To the Fourways', 'To the wedding lawn');
    await r.play('Ask Kit how he is, here, among the lovers');
    expect(r.offers('Ask Kit how he is, here, among the lovers')).toBe(false);
  }, 290000);
});

describe('The Repertory in Act V: the road is read on the night of the Command', () => {
  it('reads a freed weaver (standing), a paid name (the roll) and a kind word to the Prince (Swale\'s blurt), in the played Command', async () => {
    const r = await R.start('repV', 'B');
    expect(r.holds('swaleHidden', 'party')).toBe(true);
    expect(r.holds('noteGone', 'rierdan')).toBe(false);
    await r.tour();
    // Ep 3, in part: Swale and the Prince's speech.
    await r.play('To the gate of Harrowmere', 'To the great hall of Harrowmere', 'Ask the Chancellor what he wants', 'Ask Swale to speak the Prince\'s lines', 'Tell him it wants no cutting');
    expect(r.holds('swaleHand', 'party')).toBe(true);
    await r.play('To the gate of Harrowmere', 'To the Fourways');
    // Ep 4: the weaver for a name, and Pudding to play Pyramus if the weaver does not come.
    await r.play('To the wedding lawn', 'Ask Gosse how the rehearsal is going', 'Run the rehearsal yourself');
    await r.until(() => r.holds('e4LoomAss', 'rierdan'));
    await r.until(() => r.holds('e4Hunt', 'rierdan'));
    await r.play('Ask Tam to play the hautboy', 'To the edge of the wood', 'To the oak ring', "To the Lord's glade");
    r.j.roll('fail');
    await r.play('Offer the Lord of the Green the thing he is quarrelling about');
    r.j.roll(undefined);
    await r.play('Give the Lord of the Green your true name');
    expect(r.holds('e4Price', 'rierdan')).toBe(true);
    expect(r.holds('e4LoomFree', 'rierdan')).toBe(true);
    // Home, and the Command.
    await r.play('To the oak ring', 'To the edge of the wood', 'To the wedding lawn', 'To the Fourways', 'To the River Gate');
    const standing = r.measure('standingR', 'rierdan');
    await r.until(() => r.holds('holdingCommand', 'rierdan'), 120);
    const nod = 'Give Hepzibah the nod for the next scene';
    await r.play(nod, '?Take Corin Fallow by the arm and walk him to a seat in the second row');
    await r.play(nod, "?Seat the Marchants' masquers in the pit, and promise them the afterpiece");
    await r.play(nod, "?Ring the Duke's bell, say his name, and give him a better seat");
    await r.play(nod);
    expect(r.holds('nameRoll', 'rierdan')).toBe(true);
    expect(r.holds('loomFan', 'rierdan')).toBe(true);
    expect(r.measure('standingR', 'rierdan')).toBeGreaterThan(standing);
    expect(r.holds('swaleBlurted', 'rierdan')).toBe(true);
    expect(r.holds('swaleSoftened', 'rierdan')).toBe(true);
  }, 290000);
});
