// Something at a place of a generated world to look at closely, as a generation table gives it (a founding's own
// place, a landmark of wild country): seen there; looked at closely, what it shows; to one with the knowledge for it
// (the lore of old scripts, woodcraft, the rites of a stone), what it means, known from then on; sometimes something
// found there by looking, to take; sometimes a custom of the place to keep (a stone added to the cairn).
export interface Feature {
  id: string; name: string; seen: string; closer: string;
  // What one with the knowledge for it makes of it: by lore, unless it says what knowledge.
  known?: string; by?: string;
  // Something seen there only by looking closely, of a kind of item the catalog holds, and where it lies (told while
  // it is there to take).
  find?: { kind: string; name: string; seen: string };
  // A custom of the place, kept once: what doing it is called, and how the thing is after.
  do?: { name: string; done: string };
  // Of a founding's place: down its stair, not at its top.
  below?: boolean;
}

export class Features {
  // The thing at a place, in Kyr.
  static lines(id: string, at: string, f: Feature): string[] {
    const q = JSON.stringify, looked = `${id}_looked`;
    return [`  Thing ${id} ${q(f.name)} at ${at} {`, '    Tries looking.', `    State still ${q(f.seen)}.`,
      ...f.do ? [`    State marked ${q(f.do.done)}.`, `    Change mark ${q(f.do.name)} from still to marked.`] : [], '  }',
      // What was found is a mark the company keeps, not something it learned to be told of in the journal.
      ...f.find ? [`  Entity ${looked}: fact "".`] : [],
      `  Observe ${id}_closer near ${id} when tried(${id}, looking) ${q(f.closer)}${f.find ? ` teaches ${looked}` : ''}.`,
      ...f.find ? [`  Item ${id}_find ${q(f.find.name)} is ${f.find.kind} at ${at} hidden until ${looked}.`,
        `  Observe ${id}_lying near ${id} when knows(party, ${looked}) and at(${id}_find, ${at}) ${q(f.find.seen)}.`] : [],
      ...f.known ? [`  Discovery ${id}_read ${q(f.known)}.`, `  Observe ${id}_reading near ${id} when tried(${id}, looking)`
        + ` and capable(party, ${f.by ?? 'lore'}) and not knows(party, ${id}_read) ${q(f.known)} teaches ${id}_read.`] : []];
  }
  // A feature in the words of where it is ({zone}, {river}, {name}).
  static filled(f: Feature, fill: (text: string) => string): Feature {
    return { ...f, name: fill(f.name), seen: fill(f.seen), closer: fill(f.closer),
      ...f.known ? { known: fill(f.known) } : {},
      ...f.find ? { find: { ...f.find, name: fill(f.find.name), seen: fill(f.find.seen) } } : {},
      ...f.do ? { do: { name: fill(f.do.name), done: fill(f.do.done) } } : {} };
  }
}
