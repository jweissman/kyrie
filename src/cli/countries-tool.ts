import { Countries } from '../world/countries';
import { WorldGrid } from '../world/world-grid';
import { Borders } from '../world/land/borders';

// Where every authored country lies in the worlds of some seeds: its cell, the side of the country it is entered
// from, and that country's terrain, which its `beside` must allow (A Winter in Carth's 16: offering Gaunt beside
// mountain countries moved other countries' places and broke a test, found only by running it). Run it before and
// after changing a country's `beside`, and compare. A province (Mission 18) lies within the first country.
//   bin/kyrie countries [seed ...]
export class CountriesTool {
  // The seeds the tests place countries in.
  static readonly seeds = ['wren', 'thorn', 'a1', 'b2', 'g7', 'kin', 'mere', 'cov13', 'kite'];
  static main(args: string[], print: (line: string) => void = console.log): number {
    for (const seed of args.length ? args : this.seeds) { this.seed(seed).forEach(l => print(l)); }
    return 0;
  }
  static seed(seed: string): string[] {
    const first = WorldGrid.drawn(seed, 0, 0).terrain, plan = Countries.plan(seed, first);
    const lines = [...plan].map(([cell, c]) => {
      const way = WorldGrid.id(...WorldGrid.next(WorldGrid.at(cell)!, Borders.opposite[c.side]));
      const terrain = way === 'region' ? first : WorldGrid.drawn(seed, ...WorldGrid.at(way)!).terrain;
      return `  ${cell.padEnd(8)} ${c.name.padEnd(28)} ${c.side} of ${way === 'region' ? 'the first country' : way}`
        + ` (${terrain})`;
    });
    // A province is part of the first country, entered from inside it (see Provinces), in every world.
    const provinces = Countries.provinces.map(c => `  ${'province'.padEnd(8)} ${c.name.padEnd(28)} ${c.side} within the`
      + ` first country (${first})`);
    return [`${seed}: the first country is ${first}`, ...lines.sort(), ...provinces];
  }
}
