import { describe, expect, it } from 'bun:test';
import { Journey } from '../src/session/journey';
import { PlaySession } from '../src/session/play-session';
import { p, R } from './support/repertory';

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
