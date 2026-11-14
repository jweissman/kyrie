import { Sentences } from './sentences';

// How much a sentence makes the reader carry: its words, and its joints (the commas, semicolons, colons and dashes
// that join one clause or aside to the next, and the conjunctions that chain them). A count of sentences cannot see
// one sentence carrying four clauses, the engine's commonest tic (the owner, 14 November: empty words are an
// obstacle; long, detailed, compound clauses drag a game out, and a three-sentence budget does not catch them).
// A heavy sentence is one past either bound. What a player chose to read (a look, a named question, a book) may
// carry more; what the game says unasked is held to it.
export interface Load { sentences: number; words: number; heavy: string[] }
export class ClauseLoad {
  static readonly words = 22;
  static readonly joints = 3;
  private static readonly joint = /[,;:—–]|\s-\s|\b(?:and|but|while|whereas|which|though|until|before|after)\b/g;
  static of(sentence: string): { words: number; joints: number } {
    const plain = sentence.replace(/[‘’“”"]/g, '');
    return { words: plain.split(/\s+/).filter(Boolean).length, joints: plain.match(this.joint)?.length ?? 0 };
  }
  static heavy(sentence: string): boolean {
    const { words, joints } = this.of(sentence);
    return words > this.words || joints > this.joints;
  }
  static said(lines: readonly string[]): Load {
    const sentences = lines.flatMap(l => Sentences.split(l));
    return { sentences: sentences.length, words: sentences.reduce((n, s) => n + this.of(s).words, 0),
      heavy: sentences.filter(s => this.heavy(s)) };
  }
}
