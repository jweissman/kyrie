#!/usr/bin/env bun
// What distinguishes neighbouring countries (mission-22/world/orientation.md §5): each country's profile from its own
// drawing (its settlements' livelihoods, its peoples and faith, its makers and their works, the creatures its module
// holds, its merchants), and how much of each two neighbours share (Jaccard: 1 the same, 0 nothing in common). The
// atlas's neighbours (a reference world's first country, its north and its west) against the same three cells of worlds
// drawn without the atlas. `--dump dir` also writes each country's profile and what its module says of its settlements
// and people, every country's and settlement's name masked to a letter, for the blind editorial comparison
// (review-kit/), and the key to the letters to `--key file`, which is kept out of the kit.
//   bun scripts/world-compare.ts [--atlas iscoed,iscoed3,iscoed4] [--controls a1,kite,b2] [--dump dir --key file]
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { WorldAssembler } from '../src/world/world-assembler';
import { RegionWriter, type Region } from '../src/world/region-writer';
import { CanonVocabulary } from '../src/canon/canon-vocabulary';

interface Profile { seed: string; cell: string; name: string; sets: Record<string, string[]>; region: Region }
export class WorldCompare {
  static readonly cells: [number, number][] = [[0, 0], [0, -1], [-1, 0]];
  static profile(seed: string, at: [number, number]): Profile {
    const r = WorldAssembler.region(seed, at), source = RegionWriter.source(r, null, {}, CanonVocabulary.context());
    const species = [...new Set([...source.matchAll(/Species ([a-z_]+)/g)].map(m => m[1]!))];
    const works = [...new Set(r.sites.flatMap(s => s.work ? [s.work.plan] : []))];
    return { seed, cell: at.join(','), name: r.name, region: r, sets: {
      terrain: [r.terrain], livelihoods: [...new Set(r.settlements.map(s => s.trade))],
      merchants: [...new Set(r.settlements.map(s => s.merchantType ?? ''))],
      peoples: [...new Set([r.ancestry, ...r.peoples ?? []])], faith: [r.domain],
      makers: (r.history?.makers ?? []).map(m => m.art), works, creatures: species } };
  }
  static jaccard(a: string[], b: string[]): number {
    const A = new Set(a), B = new Set(b), both = [...A].filter(x => B.has(x)).length;
    return A.size + B.size - both ? both / (A.size + B.size - both) : 1;
  }
  // Each aspect's mean likeness over the pairs of neighbours (first and north, first and west, north and west).
  static likeness(worlds: Profile[][]): Record<string, number> {
    const pairs = worlds.flatMap(w => [[w[0]!, w[1]!], [w[0]!, w[2]!], [w[1]!, w[2]!]] as [Profile, Profile][]);
    return Object.fromEntries(Object.keys(worlds[0]![0]!.sets).map(k => [k,
      pairs.reduce((n, [a, b]) => n + this.jaccard(a.sets[k]!, b.sets[k]!), 0) / pairs.length]));
  }
  static table(atlas: Profile[][], control: Profile[][]): string {
    const a = this.likeness(atlas), c = this.likeness(control);
    return ['| aspect | atlas neighbours | control neighbours |', '|---|---:|---:|',
      ...Object.keys(a).map(k => `| ${k} | ${a[k]!.toFixed(2)} | ${c[k]!.toFixed(2)} |`)].join('\n');
  }
  // A country as a reader is given it: its profile and what its module says of itself, its settlements' hearts and
  // the people standing in them, every country's and settlement's name a letter or a letter and number.
  static dump(p: Profile, mask: Map<string, string>): string {
    const told = /^\s+(Description|Observe [a-z0-9_]+ at s\d_green|Person [a-z0-9_]+ "[^"]+" at s\d_)/;
    const said = RegionWriter.source(p.region, null, {}, CanonVocabulary.context()).split('\n')
      .filter(l => told.test(l)).map(l => l.trim())
      .slice(0, 80);
    const text = [`# Country ${mask.get(p.name)}`, '', ...Object.entries(p.sets).map(([k, v]) => `- ${k}: ${v.join(', ')}`),
      `- settlements: ${p.region.settlements.map(s => `${s.size} living by ${s.trade}`).join('; ')}`, '', '```', ...said,
      '```', ''].join('\n');
    return [...mask].sort((x, y) => y[0].length - x[0].length).reduce((t, [name, letter]) => t.split(name).join(letter),
      text);
  }
  static option(argv: string[], flag: string, fallback: string): string {
    return argv.includes(flag) ? argv[argv.indexOf(flag) + 1] ?? fallback : fallback;
  }
  static draw(seeds: string[]): Profile[][] { return seeds.map(s => this.cells.map(at => this.profile(s, at))); }
  // The first world of each kind, six countries, lettered in an order that mixes them.
  static write(dir: string, key: string, shown: Profile[]) {
    mkdirSync(dir, { recursive: true });
    const letters = 'ABCDEF', mask = new Map<string, string>();
    const order = [4, 0, 2, 5, 1, 3].flatMap(i => shown[i] ? [shown[i]] : []);
    order.forEach((p, i) => mask.set(p.name, letters[i]!));
    // Each country's settlements are lettered in its own telling (the canon's city is the chief town of two of them).
    for (const p of order) {
      const own = new Map([...mask, ...p.region.settlements.map((s, j) => [s.name, `${mask.get(p.name)}${j + 1}`] as const)]);
      writeFileSync(join(dir, `country-${mask.get(p.name)}.md`), this.dump(p, own));
    }
    writeFileSync(key, `${JSON.stringify(Object.fromEntries(order.map(p => [mask.get(p.name),
      `${p.seed} ${p.cell} ${p.name}`])), null, 1)}\n`);
  }
  static main(argv: string[]): number {
    const atlas = this.draw(this.option(argv, '--atlas', 'iscoed,iscoed3,iscoed4').split(','));
    const control = this.draw(this.option(argv, '--controls', 'a1,kite,b2').split(','));
    console.log(this.table(atlas, control));
    const dir = this.option(argv, '--dump', '');
    if (dir) { this.write(dir, this.option(argv, '--key', join(dir, 'review-key.json')), [...atlas[0]!, ...control[0]!]); }
    return 0;
  }
}
if (import.meta.main) { process.exit(WorldCompare.main(process.argv.slice(2))); }
