import { describe, expect, it } from 'bun:test';
import { TalkStage } from '../web/reader/stage/talk-stage';
import type { ReaderApp } from '../web/reader/reader-app';

// A reply keeps the number it was first shown with for the whole conversation: a number pressed from what was read is
// the reply it was beside, however the list has changed since (round 11, U: "2" pressed after an answer had
// renumbered the list informed on Heian).
describe('a conversation\'s numbers', () => {
  it('keep each reply\'s number, and give a new one the next', () => {
    const app = { numbered: new Map<string, number>() } as unknown as ReaderApp;
    expect(['ask', 'tell', 'leave'].map(id => TalkStage.n(app, id))).toEqual([1, 2, 3]);
    // After an answer: "ask" moved under Ask again, a new topic opened before "tell".
    expect(['new', 'tell', 'leave', 'ask'].map(id => TalkStage.n(app, id))).toEqual([4, 2, 3, 1]);
  });
});
