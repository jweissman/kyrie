import { describe, expect, it } from 'bun:test';
import { Prologue, type Meeting } from '../../src/presentation/prologue';

// What a page is, said by the engine (CN-09, the owner, 14 November: "Go on" after the road meeting, one choice and no
// stakes, had been drawn as a webapp button): the opening's beats and the first aim after it are no act (the page
// moves on by itself after a reading time, the terminal continues); the meeting on the road is one act, or several.
const meeting = (n: number): Meeting => ({ who: 'w', name: 'the wagoner', text: 'A cart in the ditch.',
  choices: Array.from({ length: n }, (_, i) => ({ label: `act ${i}`, command: `act${i}` })) });

describe('the opening\'s pages', () => {
  it('are no act, but for the meeting, one act or several', () => {
    expect(Prologue.pages()).toEqual({ beats: 'none', after: 'none' });
    expect(Prologue.pages(meeting(1))).toEqual({ beats: 'none', meeting: 'one', after: 'none' });
    expect(Prologue.pages(meeting(3)).meeting).toBe('several');
    expect([Prologue.page(0), Prologue.page(1), Prologue.page(2)]).toEqual(['none', 'one', 'several']);
  });
});
