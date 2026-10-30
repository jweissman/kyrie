import { Draw } from './land/draw';
import { Outfitters } from './outfitters';
import { Content } from '../content';
import type { Region } from './region-writer';
import folk from '../../data/generation/scenes/folk.json';

// A protagonist's given name until the player says otherwise (OWN-16: everyone had been "Wenna"): one of their own
// people's names, as the country's settled folk are named, and none that someone of the country already has. Each
// people's names in the order they are offered, the same for the same country: the first is the default, and
// "Another name" goes on to the next.
export class ProtagonistNames {
  static drawn(region: Region, seed: string): Record<string, string[]> {
    const taken = Outfitters.everyone(region), given = folk.given as Record<string, Record<string, string[]>>;
    return Object.fromEntries((Content.playableRaces as string[]).map(people => {
      const own = [...new Set(Object.values(given[people] ?? given.human!).flat())];
      const free = own.filter(n => !taken.has(n));
      return [people, new Draw(`${seed}:protagonist:name:${people}`).shuffle(free.length ? free : own)];
    }));
  }
}
