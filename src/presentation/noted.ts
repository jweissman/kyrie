// A note of what came of an act, by what it is (AR-05): a tally of what was spent or got, something learned, an aim
// taken up, one as it stands now, or something heard borne out by coming to it. The terminal prints each in the
// narration's words ("Noted: …", "Aim: …"); the page reads its kind, where it had read those words back.
export type NoteKind = 'tally' | 'learned' | 'aim' | 'amended' | 'borne';
export interface Note { kind: NoteKind; text: string }
export class Noted {
  // Each kind's word in the narration, and the label the page sets it under.
  static readonly words: Record<NoteKind, string | undefined> = { tally: undefined, learned: 'Noted', aim: 'Aim',
    amended: 'Aim now', borne: 'Borne out' };
  static readonly labels: Record<NoteKind, string | undefined> = { tally: undefined, learned: 'You know now',
    aim: 'A new aim', amended: 'The aim now', borne: 'As you were told' };
  // An act's notes: what was spent or got, learned (and the leads it gave), the aims taken up and amended, and what
  // was borne out, in that order.
  static of(f: { resources: string[]; learned: string[]; leads?: string[]; aims?: string[]; amended?: string[];
    borne: string[] }): Note[] {
    return [...this.as('tally', f.resources), ...this.as('learned', [...f.learned, ...f.leads ?? []]),
      ...this.as('aim', f.aims), ...this.as('amended', f.amended), ...this.as('borne', f.borne)];
  }
  private static as(kind: NoteKind, xs: string[] = []): Note[] { return xs.map(text => ({ kind, text })); }
  static said(n: Note): string { return Noted.words[n.kind] ? `${Noted.words[n.kind]}: ${n.text}` : n.text; }
  static aim(n: Note): boolean { return n.kind === 'aim' || n.kind === 'amended'; }
  // Learned, or borne out: what the company knows now.
  static known(n: Note): boolean { return n.kind === 'learned' || n.kind === 'borne'; }
}
