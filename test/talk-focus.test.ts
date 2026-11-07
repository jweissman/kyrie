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
  it('puts first what the page leads them with, then what the last answer opened, and last what was asked', () => {
    const f = TalkFocus.of(replies, { led: 'spiders_job_ask', heard: replies.filter(c => c.id !== 'tower').map(c => c.id),
      asked: ['well'] });
    expect(f.salient.map(c => c.id)).toEqual(['quarry', 'tower', 'mound']);
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
  it('makes room for an answer owed', () => {
    const f = TalkFocus.of([said('yes', 'yes', { answer: true }), ...replies], { asked: [] });
    expect([f.answers.length, f.salient.length]).toEqual([1, 2]);
  });
});
