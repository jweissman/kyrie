import { Draw } from './land/draw';
import { Outfitters } from './outfitters';
import { Content } from '../content';
import type { Region } from './region-writer';
import folk from '../../data/generation/scenes/folk.json';

// The words a protagonist may be spoken of in, as creation offers them: a woman, a man, neither.
export type Pronouns = 'she' | 'he' | 'they';

// A protagonist's given name until the player says otherwise (OWN-16: everyone had been "Wenna"): one of their own
// people's names, as the country's settled folk are named, and none that someone of the country already has. Each
// people's names for each way of presenting, in the order they are offered, the same for the same country: the first
// is the default, and the names are offered six at a time, in turn (see CreationDefaults.table). A woman's are the
// names her people give women and a man's those they give men; one who is neither is offered first the names given
// to anyone (Wren, Flint), then all the rest.
export class ProtagonistNames {
  static readonly said: Pronouns[] = ['she', 'he', 'they'];
  static drawn(region: Region, seed: string): Record<string, Record<Pronouns, string[]>> {
    const taken = Outfitters.everyone(region);
    const given = folk.given as Record<string, Partial<Record<Pronouns, string[]>>>;
    return Object.fromEntries((Content.playableRaces as string[]).map(people => {
      const own = given[people] ?? given.human!, key = `${seed}:protagonist:name:${people}`;
      const [she, he, anyone] = this.said.map(as => this.draw(`${key}:${as}`, own[as] ?? [], taken));
      const rest = this.draw(`${key}:rest`, [...own.she ?? [], ...own.he ?? []], taken);
      return [people, { she: she!, he: he!, they: [...new Set([...anyone!, ...rest])] }];
    }));
  }
  // How a protagonist presents until the player says otherwise: a woman or a man, drawn for the country.
  static presenting(seed: string): Pronouns {
    return new Draw(`${seed}:protagonist:presents`).pick(['she', 'he']);
  }
  // Names in an order of their own, none someone of the country has unless all of them are.
  private static draw(key: string, names: string[], taken: Set<string>): string[] {
    const free = names.filter(n => !taken.has(n));
    return new Draw(key).shuffle(free.length ? free : names);
  }
}
