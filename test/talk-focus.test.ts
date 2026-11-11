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
  it('puts first what an aim of the company\'s asks of them', () => {
    // The fresh playtest of 7 November: the notice on the well-post sent the company to Brom, and its question stood
    // sixth, under Something else, behind three rumours.
    const brom = [said('Ask about the old toll-house', 'r1'), said('Ask about the factor who buys old bronze', 'r2'),
      said('Ask about the players stuck at Aldermead', 'r3'), said('Ask about the rats in the corn-store', 'rats')];
    const f = TalkFocus.of(brom, { asked: [],
      aims: ['Ask Brom about the rats in the corn-store at Elmford: the corn-store is locked.'] });
    expect(f.salient[0]!.id).toBe('Ask about the rats in the corn-store');
    expect(TalkFocus.of(brom, { asked: [] }).salient.map(c => c.id)).not.toContain('Ask about the rats in the corn-store');
  });
  it('puts first what the company has come to say or settle: news it brings, and taking on one looking for work', () => {
    // The second fresh playtest of 7 November: the rats' report came fifth at Beak's, under Something else, and
    // Traubon's offer to come along seventh, though the innkeeper had just pointed him out.
    const beak = [said('Ask what is down in the cisterns', 'r1'), said('Ask about the factor', 'r2'),
      said('Ask about the silk from the sink', 'r3'), said('Ask about the old well', 'r4'),
      said('Tell Beak the rats under the corn-store are dead, nest and all', 'u_rats_told')];
    expect(TalkFocus.of(beak, { asked: [] }).salient[0]!.id).toMatch(/^Tell Beak the rats/);
    const traubon = [...beak.slice(0, 4), said('Would you come along?', 'recruit(traubon)')];
    expect(TalkFocus.of(traubon, { asked: [] }).salient[0]!.id).toBe('Would you come along?');
    // Mission 20's first cold round: the debt paid, a sellsword hired and the players' reckoning paid were all under
    // Something else, each an authored topic with no kind of its own.
    for (const weighty of ['Pay Tuck what you owe', 'Ask whether he would come along', "Pay the players' reckoning"]) {
      expect(TalkFocus.of([...beak.slice(0, 4), said(weighty, 'topic_x')], { asked: [] }).salient[0]!.id).toBe(weighty);
    }
  });
  it('makes room for an answer owed', () => {
    const f = TalkFocus.of([said('yes', 'yes', { answer: true }), ...replies], { asked: [] });
    expect([f.answers.length, f.salient.length]).toEqual([1, 2]);
  });
});
