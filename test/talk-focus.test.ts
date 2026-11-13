import { describe, expect, it } from 'bun:test';
import type { Choice } from '../src/ui/choice-list';
import { TalkFocus } from '../web/reader/talk-focus';

// A conversation as attention holds it (the owner, 5 November: an innkeeper had stood with twenty-five things to talk
// about at once, a herb-wife with nine): three salient things at most, the rest a touch away, what is had of them
// for coin set apart for trading, and the countries beyond one thing to ask about.
const said = (id: string, command?: string, more: Partial<Choice> = {}): Choice =>
  ({ id, label: id, tone: 'person', ...command ? { command, does: command.replace(/\(.*$/, '') } : {}, ...more });
describe('what is said, as attention holds it', () => {
  const replies = [said('well', 'ask(inn,word2)'), said('mound', 'ask(inn,word4)'),
    ...['crowns', 'saltgrave', 'glass'].map(x => said(x, `gate_${x}_beyond_told_s2`)), said('tower', 'w9_asked'),
    said('quarry', 'spiders_job_ask'), said('bed', 'take_lodging(lodging,inn)'),
    said('song', undefined, { disabled: 'Needs persuasion', does: 'sing_supper' })];
  it('shows three, folds the rest, and sets trading apart', () => {
    const f = TalkFocus.of(replies, { asked: [] });
    expect(f.salient.map(c => c.id)).toEqual(['well', 'mound', 'tower']);
    expect(f.more.map(c => c.id)).toEqual(['quarry', 'crowns#beyond']);
    expect(f.more[1]!.children!.map(c => c.id)).toEqual(['crowns', 'saltgrave', 'glass']);
    expect(f.services.map(c => c.id)).toEqual(['bed', 'song']);
  });
  // What the last answer opened is kept among the few, in its written place: put first, it had moved every other
  // topic after each question (round 6, the register's FH-16).
  it('puts first what the page leads them with, keeps what the last answer opened in its place, and last what was asked', () => {
    const f = TalkFocus.of(replies, { led: 'spiders_job_ask', heard: replies.filter(c => c.id !== 'tower').map(c => c.id),
      asked: ['well'] });
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
    expect(TalkFocus.of(brom, { asked: [] }).salient.map(c => c.id)).not.toContain('Ask about the rats in the corn-store');
    const beak = [said('Ask what is down in the cisterns', 'r1'), said('Ask about the factor', 'r2'),
      said('Ask about the silk from the sink', 'r3'), said('Ask about the old well', 'r4')];
    const told = said('Tell Beak the rats under the corn-store are dead, nest and all', 'u_rats_told');
    expect(TalkFocus.of([...beak, told], { asked: [], weighty: ['u_rats_told'] }).salient[0]).toBe(told);
    const traubon = [...beak, said('Would you come along?', 'recruit(traubon)')];
    expect(TalkFocus.of(traubon, { asked: [] }).salient[0]!.id).toBe('Would you come along?');
    // A label is not weight: "Pay Tuck what you owe", where it settles nothing the company holds, stays in its place.
    const pay = said('Pay Tuck what you owe', 'topic_x');
    expect(TalkFocus.of([...beak, pay], { asked: [] }).salient).not.toContain(pay);
    expect(TalkFocus.of([...beak, pay], { asked: [], weighty: ['topic_x'] }).salient[0]).toBe(pay);
  });
  it('makes room for an answer owed', () => {
    const f = TalkFocus.of([said('yes', 'yes', { answer: true }), ...replies], { asked: [] });
    expect([f.answers.length, f.salient.length]).toEqual([1, 2]);
  });
});
