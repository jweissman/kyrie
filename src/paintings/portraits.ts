import { Likeness, type Wanted } from './likeness';

// A country's people each have a painting of their own: a portrait is given to one person in a country, while
// there is another that fits as well.
export class Portraits {
  private readonly taken = new Set<string>();
  take(who: Wanted, key: string): string | undefined {
    const id = Likeness.choose(who, key, this.taken);
    if (id) { this.taken.add(id); }
    return id;
  }
}
