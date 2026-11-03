import { readFileSync } from 'node:fs';
import { Countries, type Country } from '../world/countries';
import { WorldGrid } from '../world/world-grid';
import { Borders } from '../world/land/borders';
import { Provinces } from '../world/provinces';
import { WorldAssembler } from '../world/world-assembler';
import { NodeBundleSource } from '../campaign/node-bundle-source';

// Where every authored country lies in the worlds of some seeds: its cell, the side of the country it is entered
// from, and that country's terrain, which its `beside` must allow (A Winter in Carth's 16: offering Gaunt beside
// mountain countries moved other countries' places and broke a test, found only by running it). Run it before and
// after changing a country's `beside`, and compare; or say --diff, and it compares countries.json as it is with as it
// was committed (or with a file named), and names each country the change moves, in which seeds (Fair Weather's
// friction 1, FWR-01: adding a country moved the others in every seed, silently). A province (Mission 18) lies
// within the first country.
//   bin/kyrie countries [seed ...]
//   bin/kyrie countries --diff [before.json] [seed ...]
export class CountriesTool {
  // The seeds the tests place countries in.
  static readonly seeds = ['wren', 'thorn', 'a1', 'b2', 'g7', 'kin', 'mere', 'cov13', 'kite'];
  static readonly file = 'data/adventures/countries.json';
  static main(args: string[], print: (line: string) => void = console.log): number | Promise<number> {
    if (args[0] === '--diff') { return this.diff(args.slice(1), print); }
    for (const seed of args.length ? args : this.seeds) { this.seed(seed).forEach(l => print(l)); }
    return 0;
  }
  static seed(seed: string, countries: typeof Countries = Countries): string[] {
    const first = WorldGrid.drawn(seed, 0, 0).terrain, plan = countries.plan(seed, first);
    const lines = [...plan].map(([cell, c]) => {
      const way = WorldGrid.id(...WorldGrid.next(WorldGrid.at(cell)!, Borders.opposite[c.side]));
      const terrain = way === 'region' ? first : WorldGrid.drawn(seed, ...WorldGrid.at(way)!).terrain;
      return `  ${cell.padEnd(8)} ${c.name.padEnd(28)} ${c.side} of ${way === 'region' ? 'the first country' : way}`
        + ` (${terrain})`;
    });
    // A province is part of the first country, entered from inside it (see Provinces), in every world.
    const provinces = countries.provinces.map(c => `  ${'province'.padEnd(8)} ${c.name.padEnd(28)} ${c.side} within the`
      + ` first country (${first})`);
    return [`${seed}: the first country is ${first}`, ...lines.sort(), ...provinces];
  }
  private static async diff(args: string[], print: (line: string) => void): Promise<number> {
    const file = args[0]?.endsWith('.json') ? args.shift()! : undefined;
    const text = file ? readFileSync(file, 'utf8')
      : Bun.spawnSync(['git', 'show', `HEAD:${this.file}`], { stdout: 'pipe' }).stdout.toString();
    const before = (JSON.parse(text) as { countries: Country[] }).countries;
    const moved = await this.moved(before, Countries.list, args.length ? args : this.seeds);
    for (const line of moved) { print(line); }
    print(moved.length ? `${moved.length} placings change` : 'no country moves in these seeds');
    return 0;
  }
  // Each country placed elsewhere, or newly, or no longer, in each seed, by one list of countries and another: a
  // country beyond a march by the cell it fills, a province by the cell of its way in (each placed in the order the
  // list has them, clear of those before it). The world is drawn only where the provinces differ.
  static async moved(before: Country[], after: Country[], seeds = this.seeds): Promise<string[]> {
    const was = Countries.of(before), is = Countries.of(after), out: string[] = [];
    const same = JSON.stringify(was.provinces) === JSON.stringify(is.provinces);
    for (const seed of seeds) {
      const first = WorldGrid.drawn(seed, 0, 0).terrain;
      const then = this.placed(was.plan(seed, first)), now = this.placed(is.plan(seed, first));
      if (!same) {
        const region = (await WorldAssembler.assemble(seed, NodeBundleSource.shared)).report.region;
        for (const [list, into] of [[was.provinces, then], [is.provinces, now]] as const) {
          for (const p of Provinces.situate(region, list)) { into.set(p.country, [`way in ${p.gate.cell}`, p.name]); }
        }
      }
      for (const id of new Set([...then.keys(), ...now.keys()])) {
        const [a, name] = then.get(id) ?? [], [b, named] = now.get(id) ?? [];
        if (a === b) { continue; }
        out.push(`${seed}: ${name ?? named} ${!a ? `is placed at ${b}` : !b ? `is no longer placed (was ${a})`
          : `moves from ${a} to ${b}`}`);
      }
    }
    return out;
  }
  private static placed(plan: Map<string, Country>): Map<string, readonly [string, string]> {
    return new Map([...plan].map(([cell, c]) => [c.id, [cell, c.name] as const]));
  }
}
