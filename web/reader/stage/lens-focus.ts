import type { Aspect, LensAct } from '../../../src/presentation/glance-types';

// A thing in a lens, or a run of alike acts on it, gathered as one row that is focused (the owner, 17 November: a
// riddle's words spread over pages; "focus on the riddle as an act, and then the four actions can just be the four
// possible answers"). key: what focusing it is called by; name: what the row says; acts: what focusing it shows.
export interface Unit { key: string; name: string; acts: LensAct[]; aspects: Aspect[] }
export type Row = LensAct | Unit;

// A lens's rows, focused so far: where its acts fit the four, each is a row; where they do not, each thing with more
// than one act is one row that focuses it, its acts then the rows; and on that thing, a run of acts alike (the words
// pressed on a speaking door, "Press the word …") that does not fit is one row in turn, its acts then the four. A
// focus that names nothing here any longer (the door opened) is gone. leave: whether "Leave it for now" has room.
// A part a lens's act is gathered under where they do not fit (a quarter of the town another way lies in): its key and
// what its row says.
export type Part = (a: LensAct) => { key: string; name: string } | undefined;
export class LensFocus {
  static readonly room = 4;
  // part: where the acts do not fit, the part of the town each goes to, gathered as one row (AT-04's stopgap: the
  // places lens at Porthalen's landing ten pages long, every way in the town one row).
  static of(acts: LensAct[], focus: readonly string[], name: (subject: string) => string, part?: Part):
    { rows: Row[]; focused: string[]; leave: boolean } {
    let rows: Row[] = LensFocus.things(acts, name, part);
    const focused: string[] = [];
    for (const key of focus) {
      const unit = rows.find((r): r is Unit => LensFocus.unit(r) && r.key === key);
      if (!unit) { break; }
      focused.push(key);
      rows = LensFocus.alike(unit.acts, key);
    }
    return { rows, focused, leave: focused.length > 0 && rows.length < LensFocus.room };
  }
  static unit(r: Row): r is Unit { return 'key' in r; }
  // Each thing with more than one act as one row, where the acts do not fit the four as they are.
  private static things(acts: LensAct[], name: (subject: string) => string, part?: Part): Row[] {
    if (acts.length <= LensFocus.room) { return acts; }
    const by = new Map<string, LensAct[]>(), called = new Map<string, string>();
    for (const a of acts) {
      const q = part?.(a), k = q ? q.key : `thing:${a.subject ?? a.choice}`;
      if (q) { called.set(k, q.name); }
      by.set(k, [...by.get(k) ?? [], a]);
    }
    return [...by].map(([key, of]) => of.length === 1 ? of[0]!
      : LensFocus.made(key, `${called.get(key) ?? (name(key.slice('thing:'.length)) || of[0]!.label)}…`, of));
  }
  // A run of acts alike (one stem, a word apart) as one row, where the thing's acts do not fit the four.
  private static alike(acts: LensAct[], key: string): Row[] {
    if (acts.length <= LensFocus.room) { return acts; }
    const by = new Map<string, LensAct[]>();
    for (const a of acts) { const k = LensFocus.stem(a.label); by.set(k, [...by.get(k) ?? [], a]); }
    return [...by].flatMap(([stem, of]): Row[] => of.length > 1 && stem
      ? [LensFocus.made(`${key}|${stem}`, `${stem}…`, of)] : of);
  }
  // What alike acts share: all but the last word, or the quoted word, of what they say.
  static stem(label: string): string {
    return label.replace(/\s+(?:[“"‘'][^”"’']*[”"’']|\S+)\s*$/, '');
  }
  private static made(key: string, name: string, acts: LensAct[]): Unit {
    return { key, name: name.charAt(0).toUpperCase() + name.slice(1), acts,
      aspects: [...new Set(acts.flatMap(LensFocus.aspects))] };
  }
  // What a promoted act is (Promoted.aspects); a lens's rest is nothing in particular.
  private static aspects(this: void, a: LensAct): Aspect[] { return 'aspects' in a ? a.aspects as Aspect[] : []; }
}
