import { Likeness, type Wanted } from './likeness';

// A country's people each have a painting of their own: a portrait is given to one person in a country, never to a
// second; where none is left of their sex, none, and they are met in words. One the world's people hold already (a
// country away: `held`) is given only where nothing else fits as well.
export class Portraits {
  private readonly taken = new Set<string>();
  private readonly held: ReadonlySet<string>;
  constructor(held: Iterable<string> = []) { this.held = new Set(held); }
  take(who: Wanted, key: string): string | undefined {
    const id = Likeness.choose(who, key, this.taken, this.held);
    if (id) { this.taken.add(id); }
    return id;
  }
}
