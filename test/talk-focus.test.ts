import { describe, expect, it } from 'bun:test';
import type { Choice } from '../src/ui/choice-list';
import { TalkFocus } from '../web/reader/talk-focus';
import { NewsFold } from '../src/ui/news-fold';

// A conversation as attention holds it (the owner, 5 November: an innkeeper had stood with twenty-five things to talk
// about at once, a herb-wife with nine): three salient things at most, the rest a touch away, what is had of them
// for coin set apart for trading, and the countries beyond one thing to ask about.
const said = (id: string, command?: string, more: Partial<Choice> = {}): Choice =>
  ({ id, label: id, tone: 'person', ...command ? { command, does: command.replace(/\(.*$/, '') } : {}, ...more });
describe('what is said, as attention holds it', () => {
  const replies = [said('well', 'ask(inn,word2)'), said('mound', 'ask(inn,word4)'),
    said('tower', 'w9_asked'), said('quarry', 'spiders_job_ask'), said('ford', 'ask(inn,word6)'),
    said('weir', 'ask(inn,word7)'), said('news', 'gate_crowns_beyond_told_s2', { label: NewsFold.beyond }),
    said('bed', 'take_lodging(lodging,inn)'),
    said('song', undefined, { disabled: 'Needs persuasion', does: 'sing_supper' })];
  // A short list is one flat list (the owner, 15 November: no cluster to open); only a long one keeps a fold.
  it('shows a short list whole, with nothing folded', () => {
    const f = TalkFocus.of([replies[0]!, replies[1]!, replies[5]!], { asked: [] });
    expect(f.salient.length + f.more.length).toBe(3);
    expect(f.more).toEqual([]);
  });
  it('shows three, folds the rest, and sets trading apart', () => {
    const f = TalkFocus.of(replies, { asked: [] });
    expect(f.salient.map(c => c.id)).toEqual(['well', 'mound', 'tower']);
    // The lands beyond are one question, "what news is there?", the next not yet heard; the rest are for it to bring.
    expect(f.more.map(c => c.id)).toEqual(['quarry', 'ford', 'weir', 'news']);
    expect(f.more.some(c => c.children?.length)).toBe(false);
    expect(f.services.map(c => c.id)).toEqual(['bed', 'song']);
  });
  // The lands beyond are one question, "what news is there?", the next not yet heard, made so by the engine for every
  // client (NewsFold, MT-18): each heard is known as a fact of the world and its ask no longer offered, so the next
  // offered is the next unheard; the page no longer keeps its own memory of what was asked for it.
  it('asks of the lands beyond as one question, the next not yet heard', () => {
    const act = (x: string) => ({ label: `Ask the keeper about ${x}`, command: `gate_${x}_beyond_told_s2`, key: x });
    const targets = new Map([['inn', [{ label: 'Ask about the well', command: 'ask(inn,word2)', does: 'ask' },
      ...['crowns', 'saltgrave', 'glass'].map(act)]]]);
    NewsFold.of(targets as never, new Map());
    const news = targets.get('inn')!.filter(a => /beyond_told/.test(a.command ?? ''));
    expect(news.map(a => [a.command, a.label])).toEqual([['gate_crowns_beyond_told_s2', NewsFold.beyond]]);
    // Heard (its ask taken off the offer), the next is the one asked.
    const after = new Map([['inn', ['saltgrave', 'glass'].map(act)]]);
    NewsFold.of(after as never, new Map());
    expect(after.get('inn')!.map(a => a.command)).toEqual(['gate_saltgrave_beyond_told_s2']);
  });
  // What the last answer opened is kept among the few, in its written place: put first, it had moved every other
  // topic after each question (round 6, the register's FH-16).
  it('puts first what the page leads them with, keeps what the last answer opened, and last what was asked', () => {
    const heard = replies.filter(c => c.id !== 'tower').map(c => c.id);
    const f = TalkFocus.of(replies, { led: 'spiders_job_ask', heard, asked: ['well'] });
    // Three at most, so that with its leave the talk is four (the owner, 15 November): what is led first, what the last
    // answer opened in its place; the rest a touch away.
    expect(f.salient.map(c => c.id)).toEqual(['quarry', 'mound', 'tower']);
    expect(f.opened.has('tower')).toBe(true);
    expect(f.more.at(-1)!.id).toBe('well');
  });
  // By what saying it does, never by its words (M21's playability list, PL-15): what bears on an aim the company holds,
  // a debt paid, asking someone along, being told where something is (the engine's TalkWeight, as weighty), and taking
  // on one looking for work (recruit). The fresh playtest of 7 November: the notice on the well-post sent the company
  // to Brom, and its question stood sixth, under Something else, behind three rumours; the rats' report came fifth at
  // Beak's, and Traubon's offer to come along seventh.
  it('puts first what the company has come to ask, say or settle, by what saying it does', () => {
    const brom = [said('Ask about the old toll-house', 'r1'), said('Ask about the factor who buys old bronze', 'r2'),
      said('Ask about the players stuck at Aldermead', 'r3'), said('Ask about the rats in the corn-store', 'rats')];
    expect(TalkFocus.of(brom, { asked: [], weighty: ['rats'] }).salient[0]!.command).toBe('rats');
    // Not led first by its words: it stands where the author put it, after the rumours (a short list is shown whole).
    expect(TalkFocus.of(brom, { asked: [] }).salient[0]!.command).not.toBe('rats');
    const beak = [said('Ask what is down in the cisterns', 'r1'), said('Ask about the factor', 'r2'),
      said('Ask about the silk from the sink', 'r3'), said('Ask about the old well', 'r4')];
    const told = said('Tell Beak the rats under the corn-store are dead, nest and all', 'u_rats_told');
    expect(TalkFocus.of([...beak, told], { asked: [], weighty: ['u_rats_told'] }).salient[0]).toBe(told);
    const traubon = [...beak, said('Would you come along?', 'recruit(traubon)')];
    expect(TalkFocus.of(traubon, { asked: [] }).salient[0]!.id).toBe('Would you come along?');
    // A label is not weight: "Pay Tuck what you owe", where it settles nothing the company holds, stays in its place.
    const pay = said('Pay Tuck what you owe', 'topic_x');
    expect(TalkFocus.of([...beak, pay], { asked: [] }).salient[0]).not.toBe(pay);
    expect(TalkFocus.of([...beak, pay], { asked: [], weighty: ['topic_x'] }).salient[0]).toBe(pay);
  });
  it('makes room for an answer owed', () => {
    const f = TalkFocus.of([said('yes', 'yes', { answer: true }), ...replies], { asked: [] });
    expect([f.answers.length, f.salient.length]).toEqual([1, 2]);
  });
  // An order to someone who has joined stands on their sheet, never among what is said to them.
  it('keeps the stay order out of what can be said', () => {
    const f = TalkFocus.of([said('ask'), { ...said('stay'), does: 'hold_here' }, said('home')], { asked: [] });
    expect([...f.salient, ...f.more].map(c => c.id)).toEqual(['ask', 'home']);
  });
  // What is refused stands after what can be taken.
  it('puts a refused reply after the replies that can be taken', () => {
    const f = TalkFocus.of([{ ...said('barred'), disabled: 'will not serve you' }, said('ask'), said('home')], { asked: [] });
    expect([...f.salient, ...f.more].map(c => c.id)).toEqual(['ask', 'home', 'barred']);
  });
});
