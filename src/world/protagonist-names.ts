import { Draw } from './land/draw';
import { Outfitters } from './outfitters';
import { Content } from '../content';
import type { Region } from './region-writer';
import folk from '../../data/generation/scenes/folk.json';
import naming from '../../data/generation/scenes/naming.json';

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
    const more = naming.more as Record<string, Partial<Record<Pronouns, string[]>>>;
    return Object.fromEntries((Content.playableRaces as string[]).map(people => {
      const own = given[people] ?? given.human!, key = `${seed}:protagonist:name:${people}`;
      const deeper = more[given[people] ? people : 'human'] ?? {};
      const [she, he, anyone] = this.said.map(as => this.draw(`${key}:${as}`, [own[as] ?? [], deeper[as] ?? []],
        taken));
      const rest = this.draw(`${key}:rest`, [this.both(own), this.both(deeper)], taken);
      return [people, { she: she!, he: he!, they: [...new Set([...anyone!, ...rest])] }];
    }));
  }
  private static both(of: Partial<Record<Pronouns, string[]>>): string[] { return [...of.she ?? [], ...of.he ?? []]; }
  // How a protagonist presents until the player says otherwise: a woman or a man, drawn for the country.
  static presenting(seed: string): Pronouns {
    return new Draw(`${seed}:protagonist:presents`).pick(['she', 'he']);
  }
  // Names in an order of their own, none someone of the country has unless all of them are: the names its folk are
  // drawn from first, in an order of their own, then the people's other names (naming.json), in theirs; a dwarf in a
  // dwarf country had been offered one name, Morgran, the only one of ten nobody there had (the owner, 17 November).
  private static draw(key: string, [names, more]: string[][], taken: Set<string>): string[] {
    const free = names!.filter(n => !taken.has(n)), deeper = more!.filter(n => !taken.has(n) && !names!.includes(n));
    if (!free.length && !deeper.length) { return new Draw(key).shuffle(names!); }
    return [...new Draw(key).shuffle(free), ...new Draw(`${key}:more`).shuffle(deeper)];
  }
}
