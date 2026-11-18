// A reviewer's notes on a recorded journey (the journey reader's annotations), kept beside the run in notes.json, not
// in the code: each on a step and the words in it that it is about, by what is wrong (bad diction, the same told
// twice, a cause that does not follow, more told than is needed, the weight in the wrong place), with what was meant
// and, if it is offered, the words that would do instead. A note is held to the words it quotes: it reads against the
// capture, and against a replay it says whether those words are still shown.
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type { AccountStep } from './journey-account';
import { ProseProvenance } from './prose-provenance';

export type Kind = 'diction' | 'duplication' | 'causality' | 'excess' | 'emphasis' | 'other';
export interface Note { step: number; quote: string; kind: Kind; note: string; suggest?: string; by?: string }
export interface Notes { about: string; notes: Note[] }

export class JourneyNotes {
  static readonly kinds: readonly Kind[] = ['diction', 'duplication', 'causality', 'excess', 'emphasis', 'other'];
  static readonly file = 'notes.json';
  static readonly about = 'Editorial notes on captured.json, by step and the exact words quoted from what that step'
    + ' showed. Added by `kyrie read note`, or written by hand; read by `kyrie read render` and `kyrie read replay`.';
  static read(dir: string): Notes {
    const path = join(dir, this.file);
    return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) as Notes : { about: this.about, notes: [] };
  }
  // A note added, if its kind is one of the kinds and its words are shown at its step.
  static add(dir: string, note: Note, steps: AccountStep[]): Note {
    if (!this.kinds.includes(note.kind)) { throw new Error(`a note's kind is one of ${this.kinds.join(', ')}`); }
    const step = steps.find(s => s.n === note.step);
    if (!step) { throw new Error(`no step ${note.step}`); }
    if (!this.shown(note, step)) { throw new Error(`step ${note.step} does not show "${note.quote}"`); }
    const notes = this.read(dir);
    notes.notes.push(note);
    writeFileSync(join(dir, this.file), `${JSON.stringify(notes, null, 1)}\n`);
    return note;
  }
  // Whether a step shows the words a note quotes (quotes and spacing aside).
  static shown(note: Pick<Note, 'quote'>, step: AccountStep): boolean {
    return ProseProvenance.key(step.lines.join(' ')).includes(ProseProvenance.key(note.quote));
  }
  static at(notes: Notes, n: number): Note[] { return notes.notes.filter(x => x.step === n); }
}
