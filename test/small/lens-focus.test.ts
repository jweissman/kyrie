import { describe, expect, it } from 'bun:test';
import { LensFocus, type Row } from '../../web/reader/stage/lens-focus';
import type { LensAct } from '../../src/presentation/glance-types';

// A riddle is focused as an act, and then the four rows are its answers (the owner, 17 November): the speaking door's
// seven acts (its look, push, listen and four words) do not fit the four, so the door is one row; focused, its words
// are one row beside its other acts; focused, the four words are the four rows, never paged. A focus on what is gone
// is gone; "Leave it for now" only where there is room.
const door = (label: string, i: number): LensAct => ({ choice: `door/${i}`, label, subject: 'stone' });
const acts = ['Look at the speaking door', 'Push and pull at the speaking door', 'Listen at the hall',
  'Press the word “Lute”', 'Press the word “Piano”', 'Press the word “Trumpet”', 'Press the word “Cello”'].map(door);
const named = (s: string) => (s === 'stone' ? 'the speaking door' : s);
const said = (rows: Row[]) => rows.map(r => (LensFocus.unit(r) ? r.name : r.label));

describe('a lens focused', () => {
  it('gathers a thing that does not fit, then its alike acts, then shows the four answers', () => {
    const top = LensFocus.of([...acts, { choice: 'well', label: 'Draw water', subject: 'well' }], [], named);
    expect(said(top.rows)).toEqual(['The speaking door…', 'Draw water']);
    expect(top.leave).toBe(false);
    const on = LensFocus.of(acts, ['thing:stone'], named);
    expect(said(on.rows)).toEqual(['Look at the speaking door', 'Push and pull at the speaking door',
      'Listen at the hall', 'Press the word…']);
    expect(on.leave).toBe(false);
    const words = LensFocus.of(acts, ['thing:stone', 'thing:stone|Press the word'], named);
    expect(said(words.rows)).toEqual(['Press the word “Lute”', 'Press the word “Piano”', 'Press the word “Trumpet”',
      'Press the word “Cello”']);
    expect(words.focused).toHaveLength(2);
  });
  it('leaves acts that fit as they are, drops a focus on what is gone, and has room to leave three', () => {
    expect(said(LensFocus.of(acts.slice(0, 4), [], named).rows)).toHaveLength(4);
    expect(LensFocus.of(acts.slice(0, 4), ['thing:stone'], named).focused).toEqual([]);
    const three = LensFocus.of([...acts.slice(0, 3), ...acts.slice(3, 6)], ['thing:stone', 'thing:stone|Press the word'], named);
    expect(three.rows).toHaveLength(3);
    expect(three.leave).toBe(true);
  });
});
